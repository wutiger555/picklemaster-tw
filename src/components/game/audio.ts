/**
 * 遊戲音效：全部用 Web Audio 即時合成，不需要下載音檔。
 * 匹克球的「啵」聲是塑膠洞洞球打在硬拍面上，比網球更脆、頻率更高。
 */

const MUTE_KEY = 'pm-game-muted';

const readMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
};

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  muted = readMuted();

  /** 必須在使用者手勢（點擊、按鍵）裡呼叫，瀏覽器才允許出聲 */
  unlock() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(this.ctx.destination);
      const len = Math.floor(this.ctx.sampleRate * 0.4);
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0');
    } catch {
      /* 無痕模式等情況存不了，只影響下次開啟 */
    }
  }

  dispose() {
    void this.ctx?.close();
    this.ctx = null;
  }

  private ready() {
    return !this.muted && this.ctx && this.master && this.noise ? this.ctx : null;
  }

  /** 一段濾波後的雜訊：擊球的「啵」、落地的「嗒」都由它組成 */
  private burst(freq: number, q: number, gain: number, dur: number, delay = 0) {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(bp).connect(g).connect(this.master!);
    src.start(t, Math.random() * 0.2, dur + 0.02);
  }

  private tone(freq: number, type: OscillatorType, gain: number, dur: number, delay = 0, slideTo?: number) {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /** 擊球：球速越快越響、越尖 */
  hit(speed: number, perfect: boolean) {
    const k = Math.min(1, speed / 24);
    this.burst(1500 + 900 * k, 2.2, 0.55 + 0.5 * k, 0.07);
    this.tone(820 + 300 * k, 'triangle', 0.18 + 0.15 * k, 0.05);
    if (perfect) this.tone(1760, 'sine', 0.08, 0.18, 0.02);
  }

  bounce(speed: number) {
    const k = Math.min(1, speed / 15);
    this.burst(900, 3, 0.18 + 0.35 * k, 0.05);
  }

  net() {
    this.burst(260, 0.8, 0.5, 0.18);
  }

  cord() {
    this.burst(600, 1.5, 0.35, 0.09);
    this.tone(420, 'sine', 0.1, 0.12);
  }

  whoosh() {
    this.burst(500, 0.6, 0.12, 0.16);
  }

  /** 得分：上行三和弦；失分：下行兩音 */
  point(won: boolean) {
    if (won) {
      [523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, 'triangle', 0.16, 0.22, i * 0.07));
    } else {
      this.tone(392, 'triangle', 0.13, 0.2);
      this.tone(311.1, 'triangle', 0.13, 0.3, 0.12);
    }
  }

  /** 低通雜訊的掃頻：轟鳴、風切聲 */
  private sweep(from: number, to: number, gain: number, dur: number, delay = 0, q = 1) {
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
    src.connect(f).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  /** 必殺發動：集氣→爆發，四招各有音色 */
  special(id: 'inferno' | 'thunder' | 'phantom' | 'frost') {
    this.sweep(180, 2400, 0.5, 0.75, 0, 0.8);
    this.tone(110, 'sawtooth', 0.12, 0.8, 0, 55);
    if (id === 'inferno') {
      this.sweep(90, 600, 0.9, 1.1, 0.8, 0.6);
      this.burst(300, 0.5, 1, 0.5, 0.8);
    } else if (id === 'thunder') {
      this.burst(2500, 0.4, 1.1, 0.25, 0.8);
      this.tone(60, 'sine', 0.6, 0.9, 0.82, 30);
      this.burst(120, 0.4, 0.8, 0.8, 0.9);
    } else if (id === 'phantom') {
      [880, 1108, 1320, 1760].forEach((f, i) => this.tone(f, 'sine', 0.12, 0.6, 0.8 + i * 0.05));
      this.sweep(3000, 600, 0.3, 0.8, 0.8, 3);
    } else {
      [2093, 2637, 3136, 4186].forEach((f, i) => this.tone(f, 'triangle', 0.1, 0.5, 0.8 + i * 0.04));
      this.burst(6000, 1, 0.4, 0.4, 0.8);
    }
  }

  /** 必殺球落地 */
  specialImpact(id: 'inferno' | 'thunder' | 'phantom' | 'frost') {
    if (id === 'thunder') {
      this.burst(1800, 0.3, 1.2, 0.2);
      this.tone(45, 'sine', 0.7, 1, 0, 25);
    } else if (id === 'inferno') {
      this.burst(200, 0.4, 0.9, 0.5);
    } else if (id === 'frost') {
      [3136, 2637, 2093].forEach((f, i) => this.tone(f, 'triangle', 0.1, 0.4, i * 0.05));
    } else {
      this.tone(1320, 'sine', 0.12, 0.4);
    }
  }

  counter() {
    this.tone(1568, 'square', 0.18, 0.25);
    this.tone(2093, 'triangle', 0.2, 0.5, 0.03);
    this.burst(3500, 1, 0.7, 0.15);
  }

  energyFull() {
    [523.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 'sine', 0.12, 0.35, i * 0.06));
  }

  /** 觀眾歡呼：寬頻雜訊的聲浪 */
  cheer(big: boolean) {
    this.sweep(600, 1400, big ? 0.35 : 0.18, big ? 1.8 : 1.1, 0, 0.5);
    this.sweep(1200, 2600, big ? 0.2 : 0.1, big ? 1.6 : 1, 0.1, 0.7);
  }

  highlight() {
    [659.25, 880, 1318.5].forEach((f, i) => this.tone(f, 'sine', 0.14, 0.3, i * 0.06));
  }

  win(won: boolean) {
    const notes = won ? [523.25, 659.25, 783.99, 1046.5] : [440, 392, 349.2, 293.7];
    notes.forEach((f, i) => this.tone(f, 'triangle', 0.18, 0.4, i * 0.13));
  }
}
