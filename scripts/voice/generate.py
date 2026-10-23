#!/usr/bin/env python3
"""
產生台語球評台詞音檔（public/game/voice/<key>-<n>.mp3）。

語音模型：KaedeTai/gpt-sovits-tw（MIT 授權），在本機跑一次即可，遊戲執行時不需要模型。
用法（在 GPT-SoVITS 的 venv 裡、該 repo 根目錄執行）：

    python /path/to/picklemaster-tw/scripts/voice/generate.py candidates --out /tmp/voice-cand --seeds 3
    #  → 每句產生幾個不同 seed 的候選（<key>-<n>.s<seed>.wav），挑好後寫進 picks.json：{"nice-1": 2, ...}（值是 seed 編號）
    python /path/to/picklemaster-tw/scripts/voice/generate.py export --out /tmp/voice-cand --picks picks.json

參考音（決定聲音）用該 repo 附的 demo 音檔 tw_samples/demo_02_kin_a_jit_thinn_khi.mp3（MIT）。
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LINES = Path(__file__).with_name("lines.json")
VOICE_DIR = ROOT / "public" / "game" / "voice"
REF_MP3 = Path("tw_samples/demo_02_kin_a_jit_thinn_khi.mp3")
# demo_02 播出來的實際讀音（變調後），參考音的文字要跟音檔一致
REF_TEXT = "{tw:Kīn-à-ji̍t thīnn-khì tsiok hó.}"


def lines():
    data = json.loads(LINES.read_text(encoding="utf-8"))
    for key, variants in data.items():
        if key.startswith("_"):
            continue
        for i, (_han, poj) in enumerate(variants, 1):
            yield f"{key}-{i}", poj


def repack(repo: Path) -> Path:
    """HF 上的 s2_r4_e15.pth 是訓練中途的完整存檔（model＋optimizer），推論載入要的是 {weight, config}。"""
    dst = repo / "models" / "s2_tw_infer.pth"
    if dst.exists():
        return dst
    import torch

    cfg = json.loads((repo / "GPT_SoVITS" / "configs" / "s2v2Pro.json").read_text())
    d = torch.load(repo / "models" / "s2_r4_e15.pth", map_location="cpu", weights_only=False)
    w = {k: v.half() if v.is_floating_point() else v for k, v in d["model"].items() if not k.startswith("enc_q")}
    torch.save({"weight": w, "config": cfg, "info": "gpt-sovits-tw r4 e15 (repacked for inference)"}, dst)
    return dst


def candidates(out: Path, seeds: int, only: str | None = None):
    """
    直接呼叫 fork 的 inference_webui（它的 tw_inference 依賴一個沒有公開的 tts_long.py）。
    語言用 "tw"：跳過語種切分，整句交給 text/taiwanese.py 的白話字 g2p。
    """
    import os

    out.mkdir(parents=True, exist_ok=True)
    ref_wav = out / "_ref.wav"
    if not ref_wav.exists():
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(REF_MP3), "-ac", "1", "-ar", "32000", str(ref_wav)], check=True)
    repo = Path(os.getcwd())
    s2 = repack(repo)
    os.environ.setdefault("gpt_path", str(repo / "models" / "s1_trilingual.ckpt"))
    os.environ.setdefault("sovits_path", str(s2))
    os.environ.setdefault("version", "v2")
    sys.path[:0] = [str(repo / "GPT_SoVITS"), str(repo)]
    import numpy as np
    import soundfile as sf
    from tw_inference.tw_synth import _apply_sandhi_v1  # 只是文字處理，不會載入模型
    import process_ckpt

    # 版本原本靠檔案大小猜，重新打包的檔會被當成 v2；它其實是 v2Pro（載入後再依 1033 列詞表升成 v2ProTw）
    detect = process_ckpt.get_sovits_version_from_path_fast
    process_ckpt.get_sovits_version_from_path_fast = lambda p: ("v2", "v2Pro", False) if p == str(s2) else detect(p)
    import torch
    import torchaudio

    def load_wav(path, *_a, **_k):
        # 新版 torchaudio.load 需要另外裝 torchcodec；參考音只是一個 wav，用 soundfile 讀就好
        data, sr = sf.read(str(path), dtype="float32", always_2d=True)
        return torch.from_numpy(data.T.copy()), sr

    torchaudio.load = load_wav
    import inference_webui as W  # 載入時就依 gpt_path / sovits_path 讀權重

    W.dict_language["tw"] = "tw"
    orig = W.get_phones_and_bert

    def phones_and_bert(text, language, version, final=False):
        if language != "tw":
            return orig(text, language, version, final)
        phones, word2ph, norm = W.clean_text_inf(text, "tw", version)
        bert = W.get_bert_inf(phones, word2ph, norm, "tw")
        return phones, bert.to(W.dtype), norm

    W.get_phones_and_bert = phones_and_bert
    ref_text = REF_TEXT[4:-1]

    for name, poj in lines():
        if only and not name.startswith(only):
            continue
        text = _apply_sandhi_v1(poj)
        for s in range(1, seeds + 1):
            dst = out / f"{name}.s{s}.wav"
            if dst.exists():
                continue
            W.set_seed(40 + s)
            sr, audio = None, None
            for sr, audio in W.get_tts_wav(str(ref_wav), ref_text, "tw", text, "tw", how_to_cut=W.i18n("不切"), top_k=15, top_p=1, temperature=1):
                pass
            sf.write(dst, np.asarray(audio), sr)
            print(f"[ok] {dst.name}  {text}", flush=True)


def export(out: Path, picks_path: Path):
    picks = json.loads(picks_path.read_text(encoding="utf-8"))
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    for name, _poj in lines():
        src = out / f"{name}.s{picks.get(name, 1)}.wav"
        dst = VOICE_DIR / f"{name}.mp3"
        # 去頭尾靜音、響度標準化、單聲道 64 kbps（每句十幾 KB）
        af = (
            "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,"
            "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,"
            "loudnorm=I=-14:TP=-1.5:LRA=7"
        )
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-i", str(src), "-af", af, "-ac", "1", "-ar", "32000", "-b:a", "64k", str(dst)],
            check=True,
        )
        print(f"[export] {dst.relative_to(ROOT)}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("cmd", choices=["candidates", "export"])
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--seeds", type=int, default=3)
    p.add_argument("--picks", type=Path)
    p.add_argument("--only", help="只產生名稱以此開頭的台詞（試聽用）")
    a = p.parse_args()
    if a.cmd == "candidates":
        candidates(a.out, a.seeds, a.only)
    else:
        export(a.out, a.picks or Path("/dev/null"))


if __name__ == "__main__":
    main()
