import type { GameEngine } from './engine/game';

/**
 * 精彩球錄影：把 3D 畫面連同比分、連擊數、浮水印合成到一張 2D 畫布，再用 MediaRecorder 錄下來。
 *
 * MediaRecorder 的輸出不能從中間剪（後面的片段沒有檔頭、也不一定從關鍵影格開始），
 * 所以「保留最近幾秒」靠分段：每一分發球時重開一段；來回打太久就疊一段新的、舊的丟掉，
 * 確保手上那段至少涵蓋最近 8 秒。漂亮的一分打完就停止輪替，等重播播完再收尾成一個檔案。
 */

/** 依序試：Threads／IG 都吃 mp4（Safari 只會錄 mp4，新版 Chrome 也能錄），不行才退回 webm */
const TYPES = [
  'video/mp4;codecs=avc1.42E01F,mp4a.40.2',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4;codecs=avc1',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

export const clipMime = (): string | null => {
  try {
    if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement.prototype.captureStream !== 'function') return null;
    return TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
  } catch {
    return null;
  }
};

/** 至少保留最近幾秒 */
const KEEP = 8;
/** 一段錄超過這麼久（來回還沒打完）就疊一段新的：手上那段永遠涵蓋最近 8～18 秒 */
const ROTATE = 10;

interface Segment {
  rec: MediaRecorder;
  chunks: Blob[];
  start: number;
}

const CJK = '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", "Heiti TC", sans-serif';
const NUM = `Inter, ${CJK}`;

/** 連擊數字的顏色（和畫面上的連擊計數一致） */
const comboColor = (n: number) => (n >= 30 ? '#f0abfc' : n >= 20 ? '#fb923c' : n >= 10 ? '#fcd34d' : '#ffffff');

export class ClipRecorder {
  readonly mime: string;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private audio: MediaStreamTrack | null;
  private fps: number;
  private segs: Segment[] = [];
  private holding = false;
  private paused = false;
  private last = 0;
  private interval: number;
  private maxLong: number;
  private maxShort: number;
  /** 量測用：合成一幀花的時間（毫秒，指數平均）與幀數 */
  stats = { avgMs: 0, maxMs: 0, frames: 0 };

  constructor(mime: string, opts: { lowSpec: boolean; audio: MediaStreamTrack | null }) {
    this.mime = mime;
    this.fps = opts.lowSpec ? 24 : 30;
    this.interval = 1000 / this.fps;
    this.maxLong = opts.lowSpec ? 960 : 1280;
    this.maxShort = opts.lowSpec ? 540 : 720;
    this.audio = opts.audio;
  }

  /**
   * 換尺寸就換一張新畫布：mp4（avc1）錄到一半不能改解析度，
   * 正在收掉的舊錄影還會從舊畫布拿到同尺寸的畫面
   */
  private setup(w: number, h: number) {
    for (const t of this.stream?.getVideoTracks() ?? []) t.stop();
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    this.canvas = c;
    this.ctx = c.getContext('2d', { alpha: false });
    this.stream = c.captureStream(this.fps);
    if (this.audio) this.stream.addTrack(this.audio);
  }

  get recording() {
    return this.segs.length > 0;
  }

  /**
   * 錄影畫布的尺寸：跟遊戲畫面同比例，長邊最多 1280、短邊最多 720（H.264 要偶數）。
   * 只看比例不看實際像素：掉幀自動降解析度時不用重開錄影
   */
  private fit(w: number, h: number) {
    const r = Math.max(w, h) / Math.min(w, h);
    const long = Math.min(this.maxLong, this.maxShort * r);
    const short = long / r;
    const even = (x: number) => Math.max(2, Math.round(x / 2) * 2);
    return w >= h ? [even(long), even(short)] : [even(short), even(long)];
  }

  /** 暫停中不開新段：恢復後第一幀會自己開 */
  private startSegment() {
    if (!this.stream || this.paused) return;
    try {
      const rec = new MediaRecorder(this.stream, { mimeType: this.mime, videoBitsPerSecond: this.maxLong > 1000 ? 6_000_000 : 3_500_000 });
      const seg: Segment = { rec, chunks: [], start: performance.now() };
      rec.ondataavailable = (e) => e.data.size && seg.chunks.push(e.data);
      rec.start(1000);
      this.segs.push(seg);
    } catch (e) {
      console.warn('clip recorder failed to start', e);
    }
  }

  private drop(seg: Segment) {
    seg.rec.ondataavailable = null;
    if (seg.rec.state !== 'inactive') seg.rec.stop();
    seg.chunks = [];
  }

  /** 新的一分開始：沒有要留的精彩球就整段重來 */
  restart() {
    if (this.holding) return;
    this.segs.forEach((s) => this.drop(s));
    this.segs = [];
    this.startSegment();
  }

  /** 這一分是精彩球：停止輪替，留著最久的那段等收尾 */
  hold() {
    this.holding = true;
  }

  get held() {
    return this.holding;
  }

  /** 收尾：停掉涵蓋最久的那段，輸出成檔案；其他段丟掉，重新開始錄 */
  finalize(name: string): Promise<File | null> {
    this.holding = false;
    const [keep, ...rest] = this.segs;
    rest.forEach((s) => this.drop(s));
    this.segs = [];
    this.startSegment();
    if (!keep) return Promise.resolve(null);
    return new Promise((resolve) => {
      const rec = keep.rec;
      rec.onstop = () => {
        const type = (rec.mimeType || this.mime).split(';')[0];
        const blob = new Blob(keep.chunks, { type });
        resolve(blob.size ? new File([blob], `${name}.${type.includes('mp4') ? 'mp4' : 'webm'}`, { type }) : null);
      };
      if (rec.state === 'inactive') rec.onstop(new Event('stop'));
      else rec.stop();
    });
  }

  setPaused(p: boolean) {
    this.paused = p;
    for (const s of this.segs) {
      if (p && s.rec.state === 'recording') s.rec.pause();
      else if (!p && s.rec.state === 'paused') s.rec.resume();
    }
  }

  dispose() {
    this.segs.forEach((s) => this.drop(s));
    this.segs = [];
    for (const t of this.stream?.getVideoTracks() ?? []) t.stop();
  }

  /** 每一幀（在畫面畫完之後）呼叫：限速合成到錄影畫布，順便管理分段輪替 */
  frame(src: HTMLCanvasElement, eng: GameEngine, names: [string, string]) {
    if (this.paused || !src.width) return;
    const now = performance.now();
    if (now - this.last < this.interval - 2) return;
    this.last = now;
    const t0 = now;

    // 畫面比例變了（手機轉向、視窗縮放）：沒有要留的片段就換尺寸重錄；要留的就先照舊比例裁切
    const [w, h] = this.fit(src.width, src.height);
    if (!this.canvas || ((this.canvas.width !== w || this.canvas.height !== h) && (!this.holding || !this.segs.length))) {
      this.segs.forEach((s) => this.drop(s));
      this.segs = [];
      this.setup(w, h);
    }
    const c = this.canvas!;
    if (!this.segs.length) this.startSegment();
    if (!this.holding) {
      const newest = this.segs[this.segs.length - 1];
      const age = (now - newest.start) / 1000;
      if (this.segs.length === 1 && age > ROTATE) this.startSegment();
      else if (this.segs.length > 1 && age >= KEEP) this.drop(this.segs.shift()!);
    }

    const g = this.ctx!;
    // 等比例裁切鋪滿
    const k = Math.max(c.width / src.width, c.height / src.height);
    const dw = src.width * k;
    const dh = src.height * k;
    g.drawImage(src, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
    this.overlay(g, c.width, c.height, eng, names);

    const ms = performance.now() - t0;
    const s = this.stats;
    s.frames++;
    s.avgMs = s.frames === 1 ? ms : s.avgMs * 0.95 + ms * 0.05;
    s.maxMs = Math.max(s.maxMs, ms);
  }

  /** 疊字：比分、連擊數、重播標記、浮水印 */
  private overlay(g: CanvasRenderingContext2D, W: number, H: number, eng: GameEngine, names: [string, string]) {
    const u = Math.min(W, H) / 720;
    const pad = 22 * u;
    const replay = eng.replay;

    if (replay) {
      // 轉播重播的上下黑邊
      g.fillStyle = 'rgba(0,0,0,0.85)';
      g.fillRect(0, 0, W, H * 0.075);
      g.fillRect(0, H * 0.925, W, H * 0.075);
    }
    const top = replay ? H * 0.075 + pad * 0.6 : pad;

    // 記分板
    if (eng.mode === 'match') {
      const sc = eng.match.score;
      g.font = `800 ${22 * u}px ${CJK}`;
      const n0 = names[0];
      const n1 = names[1];
      const wn0 = g.measureText(n0).width;
      const wn1 = g.measureText(n1).width;
      g.font = `900 ${34 * u}px ${NUM}`;
      const ws = g.measureText(`${sc[0]} – ${sc[1]}`).width;
      const bw = wn0 + wn1 + ws + 64 * u;
      const bh = 52 * u;
      g.fillStyle = 'rgba(2,6,23,0.72)';
      round(g, pad, top, bw, bh, 14 * u);
      g.fill();
      g.fillStyle = '#34d399';
      round(g, pad, top, 6 * u, bh, 3 * u);
      g.fill();
      g.textBaseline = 'middle';
      const cy = top + bh / 2;
      let x = pad + 20 * u;
      g.font = `800 ${22 * u}px ${CJK}`;
      g.fillStyle = '#a7f3d0';
      g.fillText(n0, x, cy);
      x += wn0 + 12 * u;
      g.font = `900 ${34 * u}px ${NUM}`;
      g.fillStyle = '#ffffff';
      g.fillText(`${sc[0]} – ${sc[1]}`, x, cy + 1 * u);
      x += ws + 12 * u;
      g.font = `800 ${22 * u}px ${CJK}`;
      g.fillStyle = '#fed7aa';
      g.fillText(n1, x, cy);
    }

    // 連擊數
    const hits = eng.rally.hits;
    if (eng.mode === 'match' && hits >= 3 && (eng.phase === 'rally' || eng.phase === 'dead')) {
      const y = H * 0.42;
      g.save();
      g.translate(pad + 6 * u, y);
      g.rotate(-0.1);
      g.textBaseline = 'alphabetic';
      g.font = `italic 900 ${88 * u}px ${NUM}`;
      const col = comboColor(hits);
      g.lineWidth = 8 * u;
      g.strokeStyle = '#000';
      g.lineJoin = 'round';
      g.strokeText(String(hits), 0, 0);
      g.shadowColor = col;
      g.shadowBlur = 18 * u;
      g.fillStyle = col;
      g.fillText(String(hits), 0, 0);
      g.shadowBlur = 0;
      const nw = g.measureText(String(hits)).width;
      g.font = `italic 900 ${36 * u}px ${NUM}`;
      g.lineWidth = 6 * u;
      g.strokeText('HIT', nw + 8 * u, 0);
      g.fillStyle = '#fff';
      g.fillText('HIT', nw + 8 * u, 0);
      g.restore();
    }

    // 重播標記：紅底 REPLAY＋這一球的名堂
    if (replay) {
      g.textBaseline = 'middle';
      g.font = `900 ${24 * u}px ${NUM}`;
      const label = 'REPLAY';
      const lw = g.measureText(label).width + 52 * u;
      const lh = 44 * u;
      const lx = W - pad - lw;
      g.fillStyle = '#dc2626';
      round(g, lx, top, lw, lh, 8 * u);
      g.fill();
      g.fillStyle = '#fff';
      g.beginPath();
      g.arc(lx + 20 * u, top + lh / 2, 6 * u, 0, Math.PI * 2);
      g.fill();
      g.fillText(label, lx + 34 * u, top + lh / 2 + 1 * u);
      g.textAlign = 'right';
      g.font = `italic 900 ${40 * u}px ${CJK}`;
      g.lineWidth = 7 * u;
      g.strokeStyle = '#000';
      g.strokeText(replay.label, W - pad, top + lh + 36 * u);
      g.fillStyle = '#fcd34d';
      g.fillText(replay.label, W - pad, top + lh + 36 * u);
      g.textAlign = 'left';
    }

    // 浮水印
    const by = replay ? H * 0.925 - pad * 0.6 : H - pad;
    g.textAlign = 'right';
    g.textBaseline = 'alphabetic';
    g.globalAlpha = 0.85;
    g.font = `italic 900 ${30 * u}px ${CJK}`;
    g.lineWidth = 5 * u;
    g.strokeStyle = 'rgba(0,0,0,0.75)';
    g.strokeText('匹克硬邦幫', W - pad, by - 24 * u);
    g.fillStyle = '#fde047';
    g.fillText('匹克硬邦幫', W - pad, by - 24 * u);
    g.font = `700 ${17 * u}px ${NUM}`;
    g.lineWidth = 4 * u;
    g.strokeText('picklemaster.tw/game', W - pad, by);
    g.fillStyle = '#fff';
    g.fillText('picklemaster.tw/game', W - pad, by);
    g.globalAlpha = 1;
    g.textAlign = 'left';
  }
}

const round = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};
