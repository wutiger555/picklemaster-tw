import { track } from '../../utils/analytics';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AI_PROFILES } from './engine/ai';
import { paddleById } from './engine/paddles';
import { characterById } from './characters';
import {
  canvasToFile,
  type Challenge,
  challengeHeadline,
  challengeUrl,
  compareToChallenge,
  drawShareCard,
  type MatchResult,
  shareText,
  tourUrl,
} from './share';

/** 複製文字：先用 Clipboard API，不行（舊版 in-app 瀏覽器）再退回 execCommand */
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
};

const download = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pickle-master-result.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/* ───────────────────────── 朋友點挑戰連結進來看到的卡片 ───────────────────────── */

export const ChallengeIntro = ({ challenge, onAccept, onSkip }: { challenge: Challenge; onAccept: () => void; onSkip: () => void }) => {
  const c = characterById(challenge.character);
  const paddle = paddleById(challenge.paddle);
  const ai = AI_PROFILES[challenge.difficulty];
  const won = challenge.score[0] > challenge.score[1];
  const [line1, line2] = challengeHeadline(challenge, c.name);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex justify-center overflow-y-auto bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-emerald-950/85 p-3 backdrop-blur-[2px] md:p-4"
    >
      <motion.div
        initial={{ scale: 0.94, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 shadow-2xl shadow-emerald-900/40"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex items-end gap-3 px-5 pt-4 md:pt-5">
          <div className="min-w-0 flex-1 pb-3 md:pb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/15 px-2.5 py-1 text-[11px] font-black tracking-[0.2em] text-amber-200">
              ⚔️ 挑戰書
            </span>
            <h2 className="mt-2.5 text-xl font-black leading-tight text-white md:text-3xl">
              <span className="block">{line1}</span>
              <span className="block">{line2}</span>
            </h2>
            <p className="mt-1.5 font-bold text-amber-300 md:text-lg">你敢挑戰嗎？</p>
          </div>
          <div className="relative h-28 w-24 shrink-0 md:h-44 md:w-32">
            {c.portrait ? (
              <img
                src={c.portrait}
                alt={c.name}
                draggable={false}
                className="h-full w-full object-contain object-bottom"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse 72% 78% at 50% 38%, #000 58%, transparent 100%)',
                  maskImage: 'radial-gradient(ellipse 72% 78% at 50% 38%, #000 58%, transparent 100%)',
                }}
              />
            ) : (
              <div className="flex h-full items-end justify-center">
                <div className="flex h-[70%] w-[70%] items-center justify-center rounded-t-[45%] text-4xl font-black text-white/90" style={{ background: c.shirt }}>
                  {c.number}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative mx-5 flex items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-3">
          <div className="text-center">
            <div className="text-[11px] font-semibold text-white/50">{c.name}</div>
            <div className={`text-4xl font-black tabular-nums ${won ? 'text-emerald-300' : 'text-white'}`}>{challenge.score[0]}</div>
          </div>
          <div className="text-2xl font-black text-white/25">:</div>
          <div className="text-center">
            <div className="text-[11px] font-semibold text-white/50">{ai.label} AI</div>
            <div className={`text-4xl font-black tabular-nums ${won ? 'text-white/60' : 'text-orange-300'}`}>{challenge.score[1]}</div>
          </div>
        </div>

        <div className="relative mx-5 mt-3 hidden grid-cols-3 gap-2 text-center sm:grid">
          {[
            ['對手', `${ai.label} AI`],
            ['選手', c.name],
            ['球拍', paddle.name],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/5 px-2 py-2">
              <div className="text-[10px] font-semibold tracking-wider text-white/45">{k}</div>
              <div className="mt-0.5 truncate text-xs font-bold text-white">{v}</div>
            </div>
          ))}
        </div>

        <div className="relative p-4 md:p-5">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAccept}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 py-3.5 text-lg font-black text-slate-950 shadow-xl shadow-orange-500/25"
          >
            接受挑戰，同樣設定開打
          </motion.button>
          <p className="mt-2 text-center text-xs text-white/50">
            {won ? `淨勝超過 ${challenge.score[0] - challenge.score[1]} 分就算勝過 ${c.name}` : `只要打得比 ${c.name} 好就算贏`}・免下載、手機可玩
          </p>
          <button type="button" onClick={onSkip} className="mt-2 w-full py-1.5 text-sm font-semibold text-white/55 hover:text-white">
            先自己選設定 →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ───────────────────────── 比賽結束畫面：挑戰結果＋分享 ───────────────────────── */

/** 打完挑戰後的比較：「你贏過 ○○ 了」或「還差 x 分」 */
export const ChallengeVerdict = ({ challenge, score }: { challenge: Challenge; score: [number, number] }) => {
  const name = characterById(challenge.character).name;
  const d = compareToChallenge(challenge, score);
  const beat = d > 0;
  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-3 text-left ${
        beat ? 'border-amber-300/50 bg-gradient-to-r from-amber-400/20 to-orange-400/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="text-[11px] font-black tracking-[0.2em] text-amber-300">挑戰結果</div>
      <div className="mt-0.5 text-lg font-black text-white">
        {beat ? `🏆 你贏過 ${name} 了！` : d === 0 ? `🤝 跟 ${name} 打成平手` : `還差 ${-d} 分追平 ${name}`}
      </div>
      <div className="text-xs text-white/55">
        {name} {challenge.score[0]}:{challenge.score[1]}，你 {score[0]}:{score[1]}（比淨勝分）
      </div>
    </div>
  );
};

export const ShareActions = ({ result }: { result: MatchResult }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<'text' | 'link' | null>(null);
  const url = result.tour ? tourUrl() : challengeUrl({ difficulty: result.difficulty, score: result.score, character: result.character.id, paddle: result.paddle });
  const text = shareText(result, url);

  // 結束畫面一出現就先畫好圖：Safari 的 navigator.share 必須在點擊當下呼叫，不能等畫圖
  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    void drawShareCard(result)
      .then(canvasToFile)
      .then((f) => {
        if (!alive || !f) return;
        objectUrl = URL.createObjectURL(f);
        setFile(f);
        setPreview(objectUrl);
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // 同一場比賽只畫一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (k: 'text' | 'link') => {
    setCopied(k);
    window.setTimeout(() => setCopied((x) => (x === k ? null : x)), 1800);
  };

  const share = () => {
    track('share', { content: 'result_card', method: file && navigator.canShare?.({ files: [file] }) ? 'share_sheet' : 'download' });
    if (file && navigator.canShare?.({ files: [file] })) {
      // 有些 app 收到圖片會丟掉文字，先複製一份讓使用者可以直接貼上
      void copyText(text);
      navigator.share({ files: [file], text }).catch((e: unknown) => {
        if ((e as DOMException)?.name !== 'AbortError') setOpen(true);
      });
      return;
    }
    // 不支援分享圖片（桌機、部分 in-app 瀏覽器）：下載圖片＋複製文字，並打開預覽讓手機可以長按存圖
    if (preview) download(preview);
    void copyText(text).then((ok) => ok && flash('text'));
    setOpen(true);
  };

  const shareLink = () => {
    track('share', { content: 'challenge_link', method: 'share' in navigator ? 'share_sheet' : 'copy' });
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
      return;
    }
    void copyText(text).then((ok) => ok && flash('link'));
  };

  return (
    <>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={share}
          disabled={!file}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 py-3 font-black text-slate-950 shadow-lg shadow-orange-500/20 transition-opacity disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
          </svg>
          {file ? '分享戰績' : '產生戰績卡…'}
        </motion.button>
        <button
          type="button"
          onClick={shareLink}
          className="rounded-xl border border-white/15 bg-white/5 px-3.5 text-sm font-bold text-white hover:bg-white/10"
        >
          {copied === 'link' ? '已複製 ✓' : result.tour ? '揪朋友踢館' : '傳挑戰連結'}
        </button>
      </div>

      {/* 掛到 body（全螢幕時掛到全螢幕元素）：結束畫面有 transform，fixed 會被困在裡面 */}
      {createPortal(
        <AnimatePresence>
          {open && preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="flex max-h-full w-full max-w-sm flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={preview} alt="戰績分享卡" className="max-h-[62svh] w-auto rounded-2xl shadow-2xl shadow-black/60" />
                <p className="mt-3 text-center text-xs text-white/60">在 Threads／IG 的內建瀏覽器裡，長按圖片即可儲存</p>
                <div className="mt-3 grid w-full grid-cols-2 gap-2">
                  <button type="button" onClick={() => download(preview)} className="rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white hover:bg-white/15">
                    下載圖片
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyText(text).then((ok) => ok && flash('text'))}
                    className="rounded-xl bg-emerald-400 py-2.5 text-sm font-bold text-emerald-950"
                  >
                    {copied === 'text' ? '已複製 ✓' : '複製分享文字'}
                  </button>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="mt-2 py-1.5 text-sm font-semibold text-white/55 hover:text-white">
                  關閉
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.fullscreenElement ?? document.body,
      )}
    </>
  );
};
