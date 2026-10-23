/**
 * 遊戲音效：Web Audio 即時合成（擊球、招式、廟口鑼鼓、嗩吶、鞭炮），
 * 只有球評的人聲是預先合成好的小音檔（public/game/voice/）。
 *
 * 訊號流：各種聲音 → sfx 匯流排（講話時會被壓低）→ 主音量 → 壓縮器 → 喇叭；
 * 另外有一條殘響送出（體育館的空間感），重擊、鑼聲送得多，擊球聲只送一點。
 */

import type { SpecialId } from './engine/paddles';

const MUTE_KEY = 'pm-game-muted';

const readMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
};

/** 球評與喊聲的台詞，每個 key 對應 public/game/voice/<key>-<n>.mp3（可以有好幾個版本隨機挑） */
export type VoiceKey =
  | 'title'
  | 'hard'
  | 'nice'
  | 'great'
  | 'wow'
  | 'smash'
  | 'block'
  | 'out'
  | 'net'
  | 'lucky'
  | 'oops'
  | 'again'
  | 'win'
  | 'lose'
  | 'start'
  | 'awaken'
  | 'unstoppable'
  | 'review'
  | 'overturned'
  | SpecialId;

/** 每句有幾個版本（檔名 -1、-2…），由 scripts/voice/ 的產生腳本決定 */
export const VOICE_VARIANTS: Record<VoiceKey, number> = {
  title: 1,
  hard: 2,
  nice: 2,
  great: 2,
  wow: 1,
  smash: 2,
  block: 1,
  out: 1,
  net: 1,
  lucky: 1,
  oops: 2,
  again: 1,
  win: 1,
  lose: 1,
  start: 1,
  awaken: 1,
  unstoppable: 1,
  review: 1,
  overturned: 1,
  inferno: 1,
  thunder: 1,
  phantom: 1,
  frost: 1,
};

const voiceBase = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/game/voice`;

/** 五聲音階（D 宮）：嗩吶的旋律只用這幾個音，一聽就是廟會味 */
const PENTA = { D5: 587.3, E5: 659.3, Fs5: 740, A5: 880, B5: 987.8, D6: 1174.7, E6: 1318.5, A4: 440, B4: 493.9 };

interface Opt {
  delay?: number;
  /** 送進殘響的比例 */
  wet?: number;
}

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  /** 最後一級（壓縮器）：錄影時從這裡分一路出去 */
  private outNode: AudioNode | null = null;
  private tap: MediaStreamAudioDestinationNode | null = null;
  private sfx: GainNode | null = null;
  private verb: GainNode | null = null;
  private voiceBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private drive: WaveShaperNode | null = null;
  private voices = new Map<string, AudioBuffer>();
  /** 正在講的那句什麼時候講完（ctx 時間），講話中不疊另一句 */
  private talkingUntil = 0;
  private lastLine = new Map<VoiceKey, number>();
  muted = readMuted();

  /** 必須在使用者手勢（點擊、按鍵）裡呼叫，瀏覽器才允許出聲 */
  unlock() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      this.ctx = ctx;
      // 壓縮器把各層疊起來的瞬間峰值收住，重擊聽起來更「實」，也不會爆音
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 8;
      comp.ratio.value = 5;
      comp.attack.value = 0.003;
      comp.release.value = 0.18;
      comp.connect(ctx.destination);
      this.outNode = comp;
      this.master = ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(comp);
      this.sfx = ctx.createGain();
      this.sfx.connect(this.master);
      this.voiceBus = ctx.createGain();
      this.voiceBus.gain.value = 1.15;
      this.voiceBus.connect(this.master);
      const conv = ctx.createConvolver();
      conv.buffer = this.impulse(ctx, 1.9, 2.6);
      this.verb = ctx.createGain();
      this.verb.gain.value = 0.55;
      this.verb.connect(conv).connect(this.master);
      const len = ctx.sampleRate;
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      // 柔性削波：重擊的低頻加一點破音，聽起來比較「重」
      this.drive = ctx.createWaveShaper();
      const curve = new Float32Array(1024);
      for (let i = 0; i < curve.length; i++) {
        const x = (i / (curve.length - 1)) * 2 - 1;
        curve[i] = Math.tanh(x * 3.2) / Math.tanh(3.2);
      }
      this.drive.curve = curve;
      this.drive.connect(this.sfx);
      this.drive.connect(this.verb);
      // 第一次點進遊戲：台詞載完就大喊遊戲名稱
      void this.loadVoices().then(() => void this.say('title', { priority: true, cooldown: 0 }));
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (m) this.ambience(false);
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0');
    } catch {
      /* 無痕模式等情況存不了，只影響下次開啟 */
    }
  }

  /** 精彩球錄影用的音軌（音效、球評、觀眾聲）；還沒解鎖或不支援時是 null */
  captureTrack(): MediaStreamTrack | null {
    if (!this.ctx || !this.outNode) return null;
    try {
      if (!this.tap) {
        this.tap = this.ctx.createMediaStreamDestination();
        this.outNode.connect(this.tap);
      }
      return this.tap.stream.getAudioTracks()[0] ?? null;
    } catch {
      return null;
    }
  }

  dispose() {
    this.murmur = null;
    this.tap = null;
    this.rainNode = null;
    void this.ctx?.close();
    this.ctx = null;
  }

  /** 人工殘響：兩聲道各自衰減的雜訊，模擬室內球場的回音 */
  private impulse(ctx: AudioContext, seconds: number, decay: number) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  private ready() {
    return !this.muted && this.ctx && this.sfx && this.noise ? this.ctx : null;
  }

  /** 接到 sfx 匯流排，並依 wet 送一份進殘響 */
  private out(node: AudioNode, wet = 0) {
    node.connect(this.sfx!);
    if (wet > 0 && this.ctx && this.verb) {
      const s = this.ctx.createGain();
      s.gain.value = wet;
      node.connect(s).connect(this.verb);
    }
  }

  /** 一段濾波後的雜訊：擊球的「啵」、落地的「嗒」、鞭炮的「啪」都由它組成 */
  private burst(freq: number, q: number, gain: number, dur: number, { delay = 0, wet = 0 }: Opt = {}, type: BiquadFilterType = 'bandpass') {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(f).connect(g);
    this.out(g, wet);
    src.start(t, Math.random() * 0.6, dur + 0.02);
  }

  private tone(freq: number, type: OscillatorType, gain: number, dur: number, { delay = 0, wet = 0 }: Opt = {}, slideTo?: number) {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    this.out(g, wet);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /** 低頻重擊（像大鼓的鼓皮）：音高快速往下掉，可加破音 */
  private thump(from: number, to: number, gain: number, dur: number, { delay = 0, wet = 0.2 }: Opt = {}, driven = false) {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + dur * 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    if (driven && this.drive) g.connect(this.drive);
    else this.out(g, wet);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /** 低通雜訊的掃頻：轟鳴、風切聲 */
  private sweep(from: number, to: number, gain: number, dur: number, { delay = 0, wet = 0.15 }: Opt = {}, q = 1) {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g);
    this.out(g, wet);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  /** 金屬敲擊：一組不成整數倍的泛音，兩兩微微走音產生「嗡嗡」的拍頻（鑼、鈸、鐘都靠它） */
  private metal(base: number, ratios: number[], gain: number, dur: number, { delay = 0, wet = 0.5 }: Opt = {}, bend = 1) {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(gain * 0.35, t + dur * 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    this.out(g, wet);
    ratios.forEach((r, i) => {
      for (const detune of [0, 1.006]) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        const f = base * r * (detune || 1);
        o.frequency.setValueAtTime(f, t);
        if (bend !== 1) o.frequency.exponentialRampToValueAtTime(f * bend, t + dur * 0.7);
        const og = ctx.createGain();
        og.gain.value = 1 / (i + 1.6) / 2;
        o.connect(og).connect(g);
        o.start(t);
        o.stop(t + dur + 0.05);
      }
    });
  }

  // ───────── 廟口樂器 ─────────

  /** 大鼓「咚」 */
  private drum(gain = 0.7, delay = 0) {
    this.thump(150, 62, gain, 0.42, { delay, wet: 0.35 });
    this.burst(190, 1.2, gain * 0.5, 0.12, { delay, wet: 0.2 });
  }

  /** 大鑼「鏘──嗡」：音高慢慢往下沉 */
  private gong(gain = 0.5, delay = 0, base = 196) {
    this.metal(base, [1, 1.52, 2.01, 2.64, 3.31, 4.18], gain, 2.6, { delay, wet: 0.8 }, 0.94);
    this.burst(900, 0.7, gain * 0.6, 0.08, { delay, wet: 0.3 });
  }

  /** 小鑼「匡」：短而亮 */
  private smallGong(gain = 0.35, delay = 0) {
    this.metal(620, [1, 1.47, 2.09, 2.9], gain, 0.6, { delay, wet: 0.4 }, 1.06);
  }

  /** 鈸「七」 */
  private cymbal(gain = 0.4, dur = 0.9, delay = 0) {
    this.burst(7200, 0.6, gain, dur, { delay, wet: 0.5 }, 'highpass');
    this.metal(3100, [1, 1.38, 1.83, 2.41], gain * 0.35, dur * 0.7, { delay, wet: 0.4 });
  }

  /** 梆子（木魚）「叩」：廟口最熟悉的木頭聲 */
  private woodblock(gain = 0.35, delay = 0, pitch = 1) {
    this.tone(1180 * pitch, 'sine', gain, 0.07, { delay, wet: 0.15 });
    this.burst(2400 * pitch, 9, gain * 0.9, 0.05, { delay, wet: 0.1 });
  }

  /** 鑼鼓點：「咚 咚 鏘」，招式要放之前先來一段 */
  private luogu(gain = 1, delay = 0) {
    this.drum(0.6 * gain, delay);
    this.drum(0.6 * gain, delay + 0.13);
    this.gong(0.42 * gain, delay + 0.27);
    this.cymbal(0.35 * gain, 0.8, delay + 0.27);
  }

  /** 鞭炮：一串隨機間隔的「啪」，偶爾夾一聲大的 */
  private firecrackers(count: number, span: number, delay = 0, gain = 0.5) {
    for (let i = 0; i < count; i++) {
      const d = delay + Math.random() * span;
      const big = Math.random() < 0.12;
      const g = gain * (0.45 + Math.random() * 0.55) * (big ? 1.5 : 1);
      this.burst(big ? 900 : 2200 + Math.random() * 2600, big ? 0.6 : 1.1, g, big ? 0.08 : 0.018 + Math.random() * 0.02, { delay: d, wet: 0.35 }, big ? 'bandpass' : 'highpass');
      if (big) this.thump(120, 50, g * 0.6, 0.16, { delay: d, wet: 0.4 });
    }
  }

  /**
   * 嗩吶：鋸齒波過兩個共振峰，加顫音與每個音開頭往上滑（嗩吶吹奏的「抹音」）。
   * notes 是 [頻率, 長度秒] 的序列。
   */
  private suona(notes: [number, number][], gain = 0.16, delay = 0) {
    const ctx = this.ready();
    if (!ctx) return;
    let t = ctx.currentTime + delay;
    const total = notes.reduce((s, [, d]) => s + d, 0);
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const vib = ctx.createOscillator();
    vib.frequency.value = 6.2;
    const vibAmt = ctx.createGain();
    vibAmt.gain.setValueAtTime(0, t);
    vibAmt.gain.linearRampToValueAtTime(14, t + total);
    vib.connect(vibAmt).connect(o.frequency);
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.value = 1150;
    f1.Q.value = 2.2;
    const f2 = ctx.createBiquadFilter();
    f2.type = 'peaking';
    f2.frequency.value = 2900;
    f2.Q.value = 3;
    f2.gain.value = 9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    const start = t;
    for (const [f, d] of notes) {
      o.frequency.setValueAtTime(f * 0.94, t);
      o.frequency.exponentialRampToValueAtTime(f, t + Math.min(0.06, d * 0.4));
      g.gain.setTargetAtTime(gain, t, 0.015);
      g.gain.setTargetAtTime(gain * 0.72, t + d * 0.6, 0.05);
      t += d;
    }
    g.gain.setTargetAtTime(0.0001, t - 0.04, 0.06);
    o.connect(f1).connect(f2).connect(g);
    this.out(g, 0.45);
    o.start(start);
    vib.start(start);
    o.stop(t + 0.4);
    vib.stop(t + 0.4);
  }

  // ───────── 球場聲音 ─────────

  /**
   * 擊球聲（四層）：高頻接觸「喀」＋塑膠球中頻「啵」＋拍面的短鳴＋強力球的低頻重擊。
   * 每次音高隨機微調 ±4%，避免聽起來像同一個音檔重播。
   */
  hit(speed: number, perfect: boolean) {
    const k = Math.min(1, speed / 24);
    const pitch = 1 + (Math.random() - 0.5) * 0.08;
    this.burst(5200 * pitch, 1.2, 0.55 + 0.45 * k, 0.012, { wet: 0.05 });
    this.burst((1250 + 450 * k) * pitch, 7, 1.05 + 0.6 * k, 0.06, { wet: 0.12 });
    this.tone((1150 + 300 * k) * pitch, 'sine', 0.35 + 0.25 * k, 0.07, { wet: 0.08 }, 650 * pitch);
    if (k > 0.4) this.thump(160, 48, 0.25 + 0.5 * (k - 0.4), 0.16, {}, true);
    if (perfect) {
      this.tone(2637, 'sine', 0.1, 0.3, { delay: 0.015, wet: 0.4 });
      this.tone(3951, 'sine', 0.06, 0.38, { delay: 0.03, wet: 0.4 });
      this.cymbal(0.12, 0.3, 0.01);
    }
  }

  /** 揮拍風切聲：先聽到「咻」再聽到「啵」，打擊才有預期感 */
  swing(strong: boolean) {
    this.sweep(450, strong ? 2400 : 1500, strong ? 0.18 : 0.09, strong ? 0.16 : 0.12, { wet: 0.05 }, 0.8);
  }

  /** 連續完美：梆子音高隨連擊數往上爬 */
  streak(n: number) {
    const p = Math.pow(2, Math.min(n, 8) / 12);
    this.woodblock(0.3, 0.04, p);
    this.tone(1046.5 * p, 'triangle', 0.08, 0.22, { delay: 0.08, wet: 0.3 });
  }

  private murmur: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

  /** 觀眾背景低語：持續的低通雜訊，讓球場有空間感 */
  ambience(on: boolean) {
    const ctx = this.ctx;
    if (!on || this.muted) {
      if (this.murmur && ctx) {
        this.murmur.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
        const m = this.murmur;
        window.setTimeout(() => m.src.stop(), 1500);
        this.murmur = null;
      }
      return;
    }
    if (!ctx || !this.sfx || !this.noise || this.murmur) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.05, ctx.currentTime, 0.8);
    src.connect(lp).connect(gain).connect(this.sfx);
    src.start();
    this.murmur = { src, gain };
  }

  bounce(speed: number) {
    const k = Math.min(1, speed / 15);
    this.burst(900, 3, 0.18 + 0.35 * k, 0.05, { wet: 0.1 });
    this.thump(130, 80, 0.12 + 0.2 * k, 0.07, { wet: 0.05 });
  }

  net() {
    this.burst(260, 0.8, 0.5, 0.18, { wet: 0.2 });
    this.burst(1800, 2, 0.15, 0.25, { delay: 0.03, wet: 0.1 });
  }

  cord() {
    this.burst(600, 1.5, 0.35, 0.09, { wet: 0.2 });
    this.tone(420, 'sine', 0.12, 0.2, { wet: 0.2 });
  }

  whoosh() {
    this.sweep(400, 1200, 0.14, 0.2, { wet: 0.1 }, 0.6);
  }

  /** 得分：嗩吶兩音往上揚＋小鈸；失分：低沉的悶鑼 */
  point(won: boolean) {
    if (won) {
      this.suona(
        [
          [PENTA.A5, 0.12],
          [PENTA.D6, 0.32],
        ],
        0.14,
      );
      this.cymbal(0.18, 0.5, 0.12);
    } else {
      this.metal(150, [1, 1.5, 2.02], 0.22, 1.1, { wet: 0.5 }, 0.9);
    }
  }

  /** 必殺發動：鼓點越打越快集氣，「鏘」一聲爆開，再接各招的元素聲 */
  special(id: SpecialId) {
    for (let i = 0; i < 6; i++) this.drum(0.35 + i * 0.06, 0.62 * (1 - Math.pow(0.78, i)) * 1.25);
    this.sweep(180, 2600, 0.45, 0.75, { wet: 0.3 }, 0.8);
    const hitAt = 0.8;
    this.gong(0.55, hitAt);
    this.cymbal(0.45, 1.2, hitAt);
    this.thump(110, 32, 0.9, 0.9, { delay: hitAt }, true);
    if (id === 'inferno') {
      this.sweep(90, 700, 0.9, 1.1, { delay: hitAt, wet: 0.4 }, 0.6);
      this.firecrackers(16, 0.7, hitAt + 0.05, 0.45);
    } else if (id === 'thunder') {
      this.burst(2600, 0.4, 1.1, 0.22, { delay: hitAt, wet: 0.6 });
      this.thump(60, 22, 0.8, 1.4, { delay: hitAt + 0.02, wet: 0.6 });
      this.burst(140, 0.5, 0.7, 1.2, { delay: hitAt + 0.1, wet: 0.5 }, 'lowpass');
    } else if (id === 'phantom') {
      [880, 1108, 1320, 1760].forEach((f, i) => this.tone(f, 'sine', 0.12, 0.9, { delay: hitAt + i * 0.06, wet: 0.9 }));
      this.metal(330, [1, 1.41, 2.13], 0.2, 1.6, { delay: hitAt, wet: 0.9 }, 1.12);
    } else {
      [2093, 2637, 3136, 4186, 5274].forEach((f, i) => this.tone(f, 'triangle', 0.1, 0.7, { delay: hitAt + i * 0.04, wet: 0.7 }));
      for (let i = 0; i < 10; i++) this.burst(6000 + Math.random() * 5000, 4, 0.12, 0.03, { delay: hitAt + 0.05 + Math.random() * 0.4, wet: 0.5 });
    }
  }

  /** 必殺球落地 */
  specialImpact(id: SpecialId) {
    this.thump(140, 30, 0.95, 0.7, {}, true);
    this.burst(220, 0.5, 0.6, 0.4, { wet: 0.6 }, 'lowpass');
    if (id === 'thunder') {
      this.burst(1800, 0.3, 1.1, 0.2, { wet: 0.6 });
      this.thump(45, 22, 0.7, 1.2, { wet: 0.6 });
    } else if (id === 'inferno') {
      this.firecrackers(10, 0.45, 0.02, 0.4);
    } else if (id === 'frost') {
      [3136, 2637, 2093].forEach((f, i) => this.tone(f, 'triangle', 0.12, 0.5, { delay: i * 0.05, wet: 0.6 }));
      for (let i = 0; i < 12; i++) this.burst(7000 + Math.random() * 4000, 5, 0.14, 0.025, { delay: Math.random() * 0.3, wet: 0.4 });
    } else {
      this.tone(1320, 'sine', 0.14, 0.6, { wet: 0.8 });
    }
  }

  /** 破解必殺：亮鑼一響 */
  counter() {
    this.smallGong(0.45);
    this.cymbal(0.4, 0.8);
    this.thump(120, 45, 0.5, 0.3, {}, true);
  }

  /** 無雙覺醒：鑼鼓大段＋嗩吶往上衝＋鞭炮 */
  awaken() {
    [0, 0.12, 0.24, 0.36].forEach((d) => this.drum(0.7, d));
    this.gong(0.6, 0.5, 174.6);
    this.cymbal(0.5, 1.4, 0.5);
    this.suona(
      [
        [PENTA.D5, 0.14],
        [PENTA.E5, 0.14],
        [PENTA.Fs5, 0.14],
        [PENTA.A5, 0.14],
        [PENTA.D6, 0.6],
      ],
      0.17,
      0.5,
    );
    this.firecrackers(30, 1.4, 0.7, 0.45);
  }

  energyFull() {
    this.smallGong(0.3);
    this.tone(1568, 'sine', 0.1, 0.4, { delay: 0.06, wet: 0.5 });
  }

  /** 觀眾歡呼：寬頻聲浪＋零星拍手 */
  cheer(big: boolean) {
    this.sweep(600, 1400, big ? 0.35 : 0.18, big ? 1.8 : 1.1, { wet: 0.3 }, 0.5);
    this.sweep(1200, 2600, big ? 0.2 : 0.1, big ? 1.6 : 1, { delay: 0.1, wet: 0.3 }, 0.7);
    const claps = big ? 26 : 10;
    for (let i = 0; i < claps; i++) this.burst(1500 + Math.random() * 900, 1.4, 0.08 + Math.random() * 0.08, 0.025, { delay: 0.1 + Math.random() * (big ? 1.4 : 0.8), wet: 0.3 });
  }

  /** 連續來回里程碑（10、20、30 拍）：鑼鼓點，30 拍以上加鞭炮 */
  milestone(n: number) {
    this.luogu(n >= 20 ? 1 : 0.7);
    if (n >= 30) this.firecrackers(18, 0.9, 0.3, 0.4);
  }

  /** 機會球出現：梆子「叩叩」兩聲，提示該進攻了 */
  chance() {
    this.woodblock(0.32);
    this.woodblock(0.32, 0.09, 1.19);
  }

  /** 打出殺球／推擋／突擊：殺球是破音重砲＋鈸，推擋是乾脆的悶擊 */
  attack(smash: boolean) {
    if (smash) {
      this.thump(190, 36, 0.95, 0.42, {}, true);
      this.burst(1900, 0.7, 0.55, 0.09, { wet: 0.4 });
      this.cymbal(0.3, 0.7, 0.01);
      this.sweep(800, 3800, 0.22, 0.18, { wet: 0.2 }, 0.9);
    } else {
      this.thump(150, 70, 0.5, 0.16, {}, true);
      this.woodblock(0.22, 0, 0.8);
      this.sweep(800, 2600, 0.14, 0.16, { wet: 0.1 }, 0.9);
    }
  }

  highlight() {
    this.smallGong(0.3);
    this.smallGong(0.3, 0.16);
  }

  // ───────── 踢館之旅（關卡） ─────────

  /** 發球機出球：氣壓砲「噗」 */
  feed() {
    this.thump(220, 90, 0.35, 0.12, { wet: 0.1 });
    this.burst(700, 1, 0.2, 0.08, { wet: 0.1 }, 'lowpass');
  }

  /** 打倒手搖杯：塑膠杯「喀啦」＋飲料潑出來；大杯更響 */
  cup(big: boolean) {
    const p = big ? 0.8 : 1 + Math.random() * 0.15;
    this.burst(2600 * p, 2.5, 0.45, 0.05, { wet: 0.1 });
    this.burst(1400 * p, 4, 0.35, 0.08, { delay: 0.04, wet: 0.1 });
    this.sweep(2200, 500, big ? 0.3 : 0.18, 0.28, { delay: 0.05, wet: 0.2 }, 0.8);
  }

  /** 撿到珍珠：「啵」一聲，連續撿音高往上爬 */
  pearl(n: number) {
    const p = Math.pow(2, Math.min(n % 8, 7) / 12);
    this.tone(880 * p, 'sine', 0.22, 0.09, { wet: 0.2 }, 1320 * p);
  }

  /** 被砲彈打中、珍珠掉滿地 */
  spill() {
    this.thump(180, 60, 0.6, 0.2, {}, true);
    for (let i = 0; i < 6; i++) this.tone(700 + Math.random() * 700, 'sine', 0.08, 0.06, { delay: 0.08 + i * 0.05, wet: 0.2 });
  }

  /** 換風向：一陣呼嘯 */
  gust() {
    this.sweep(300, 900, 0.22, 1.2, { wet: 0.3 }, 0.5);
    this.sweep(500, 1600, 0.12, 1.0, { delay: 0.3, wet: 0.3 }, 0.7);
  }

  /** 雷聲（颱風關的閃電） */
  thunder() {
    this.thump(90, 30, 0.7, 1.2, { wet: 0.6 }, true);
    this.burst(200, 0.5, 0.35, 1.4, { delay: 0.05, wet: 0.6 }, 'lowpass');
  }

  private rainNode: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

  /** 雨聲：持續的高通雜訊（颱風關才開） */
  rain(on: boolean) {
    const ctx = this.ctx;
    if (!on || this.muted) {
      if (this.rainNode && ctx) {
        this.rainNode.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
        const m = this.rainNode;
        window.setTimeout(() => m.src.stop(), 1500);
        this.rainNode = null;
      }
      return;
    }
    if (!ctx || !this.sfx || !this.noise || this.rainNode) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.value = 2600;
    hp.Q.value = 0.4;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.07, ctx.currentTime, 0.8);
    src.connect(hp).connect(gain).connect(this.sfx);
    src.start();
    this.rainNode = { src, gain };
  }

  /** 終場：贏了鑼鼓＋嗩吶＋一長串鞭炮；輸了一聲沉鑼配往下滑的嗩吶 */
  win(won: boolean) {
    if (won) {
      this.luogu(1);
      this.suona(
        [
          [PENTA.A5, 0.16],
          [PENTA.B5, 0.16],
          [PENTA.D6, 0.3],
          [PENTA.B5, 0.14],
          [PENTA.A5, 0.14],
          [PENTA.Fs5, 0.16],
          [PENTA.A5, 0.7],
        ],
        0.16,
        0.35,
      );
      this.firecrackers(60, 2.2, 0.4, 0.42);
    } else {
      this.gong(0.45, 0, 146.8);
      this.suona(
        [
          [PENTA.A4 * 2, 0.3],
          [PENTA.Fs5, 0.3],
          [PENTA.E5, 0.3],
          [PENTA.B4, 0.8],
        ],
        0.11,
        0.25,
      );
    }
  }

  // ───────── 球評與喊聲 ─────────

  /** 解鎖音效時順便把台詞音檔載進來（全部加起來幾百 KB）；缺檔就安靜略過 */
  private async loadVoices() {
    const ctx = this.ctx;
    if (!ctx) return;
    const jobs: Promise<void>[] = [];
    for (const [key, n] of Object.entries(VOICE_VARIANTS)) {
      for (let i = 1; i <= n; i++) {
        const name = `${key}-${i}`;
        jobs.push(
          fetch(`${voiceBase}/${name}.mp3`)
            .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
            .then((b) => ctx.decodeAudioData(b))
            .then((buf) => void this.voices.set(name, buf))
            .catch(() => {}),
        );
      }
    }
    await Promise.all(jobs);
  }

  /**
   * 球評講一句。正在講話時不疊（priority 高的可以插話），同一句至少隔 cooldown 秒才重講；
   * 講話期間把其他音效壓低，台詞才聽得清楚。回傳有沒有真的講出來。
   */
  say(key: VoiceKey, { priority = false, cooldown = 4, delay = 0 }: { priority?: boolean; cooldown?: number; delay?: number } = {}) {
    const ctx = this.ready();
    if (!ctx || !this.voiceBus) return false;
    const now = ctx.currentTime;
    if (!priority && now < this.talkingUntil) return false;
    if (now - (this.lastLine.get(key) ?? -99) < cooldown) return false;
    const n = VOICE_VARIANTS[key];
    const buf = this.voices.get(`${key}-${1 + Math.floor(Math.random() * n)}`) ?? this.voices.get(`${key}-1`);
    if (!buf) return false;
    this.lastLine.set(key, now);
    const t = now + delay;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    // 一點點殘響，像場館廣播
    src.connect(this.voiceBus);
    const send = ctx.createGain();
    send.gain.value = 0.18;
    src.connect(send).connect(this.verb!);
    src.start(t);
    this.talkingUntil = t + buf.duration;
    const duck = this.sfx!.gain;
    duck.cancelScheduledValues(t);
    duck.setTargetAtTime(0.55, t, 0.03);
    duck.setTargetAtTime(1, t + buf.duration, 0.12);
    return true;
  }
}
