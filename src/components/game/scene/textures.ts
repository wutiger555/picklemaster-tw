import * as THREE from 'three';
import type { PaddleSpec } from '../engine/paddles';

/**
 * 全部用 canvas 即時畫出來的貼圖：不需要下載任何圖檔，也沒有授權問題。
 * 每種貼圖只產生一次並快取。
 */

const cache = new Map<string, THREE.Texture>();

const make = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
};

/** 可重複的偽亂數，讓每次產生的花紋一致 */
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

const noiseFill = (g: CanvasRenderingContext2D, w: number, h: number, base: string, amp: number, seed: number, size = 1) => {
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const r = rng(seed);
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      const n = (r() - 0.5) * amp;
      for (let yy = 0; yy < size; yy++) {
        for (let xx = 0; xx < size; xx++) {
          const i = ((y + yy) * w + (x + xx)) * 4;
          d[i] = Math.max(0, Math.min(255, d[i] + n));
          d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
          d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
        }
      }
    }
  }
  g.putImageData(img, 0, 0);
};

/** 壓克力球場面：細砂顆粒感（顏色貼圖＋凹凸貼圖共用） */
export const courtTexture = (color: string, key: string, repeat: [number, number]) => {
  const t = make(`court-${key}`, 512, 512, (g, w, h) => noiseFill(g, w, h, color, 22, 7 + key.length));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  return t;
};

export const grainBump = () => {
  const t = make('grain-bump', 256, 256, (g, w, h) => noiseFill(g, w, h, '#808080', 120, 3));
  t.colorSpace = THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(24, 48);
  return t;
};

/** 網子：菱形網格（透明貼圖） */
export const netTexture = () => {
  const t = make('net', 64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(20,20,24,1)';
    g.lineWidth = 3.2;
    g.beginPath();
    g.moveTo(0, 32);
    g.lineTo(32, 0);
    g.lineTo(64, 32);
    g.lineTo(32, 64);
    g.closePath();
    g.stroke();
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(150, 20);
  return t;
};

/** 碳纖維斜紋（2×2 twill） */
const drawCarbon = (g: CanvasRenderingContext2D, w: number, h: number, base: string, sheen: string, cell: number) => {
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      const k = ((x / cell + y / cell) >> 1) % 2 === 0;
      const grd = k ? g.createLinearGradient(x, y, x + cell, y) : g.createLinearGradient(x, y, x, y + cell);
      grd.addColorStop(0, base);
      grd.addColorStop(0.5, sheen);
      grd.addColorStop(1, base);
      g.fillStyle = grd;
      g.globalAlpha = 0.55;
      g.fillRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      g.globalAlpha = 1;
    }
  }
};

/** 球拍拍面：底材＋品牌花紋＋型號字樣 */
export const paddleFaceTexture = (spec: PaddleSpec) =>
  make(`paddle-${spec.id}`, 512, 1024, (g, w, h) => {
    const L = spec.look;
    drawCarbon(g, w, h, L.base, spec.look.pattern === 'rawcarbon' ? '#3a4048' : '#2b2b30', spec.look.pattern === 'rawcarbon' ? 10 : 16);
    const r = rng(spec.id.length * 97);
    g.save();
    if (L.pattern === 'flame') {
      // 由下往上竄的火焰
      for (let i = 0; i < 9; i++) {
        const x0 = r() * w;
        const grd = g.createLinearGradient(0, h, 0, h * 0.15);
        grd.addColorStop(0, L.accent);
        grd.addColorStop(0.45, L.primary);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.globalAlpha = 0.55 + r() * 0.4;
        g.beginPath();
        g.moveTo(x0 - 90, h);
        const top = h * (0.12 + r() * 0.35);
        g.bezierCurveTo(x0 - 60, h * 0.7, x0 + 70 * (r() - 0.5), top + 200, x0 + 30 * (r() - 0.5), top);
        g.bezierCurveTo(x0 + 50, top + 220, x0 + 80, h * 0.7, x0 + 90, h);
        g.fill();
      }
    } else if (L.pattern === 'bolt') {
      // 斜向雷光條紋
      g.globalAlpha = 0.9;
      g.fillStyle = L.primary;
      g.beginPath();
      g.moveTo(0, h * 0.55);
      g.lineTo(w, h * 0.25);
      g.lineTo(w, h * 0.42);
      g.lineTo(0, h * 0.72);
      g.fill();
      g.fillStyle = L.accent;
      g.beginPath();
      g.moveTo(w * 0.62, h * 0.08);
      g.lineTo(w * 0.36, h * 0.46);
      g.lineTo(w * 0.52, h * 0.46);
      g.lineTo(w * 0.3, h * 0.86);
      g.lineTo(w * 0.72, h * 0.38);
      g.lineTo(w * 0.55, h * 0.38);
      g.lineTo(w * 0.78, h * 0.08);
      g.closePath();
      g.fill();
    } else if (L.pattern === 'holo') {
      // 全像漸層
      const grd = g.createLinearGradient(0, 0, w, h);
      grd.addColorStop(0, L.primary);
      grd.addColorStop(0.35, '#ff6ad5');
      grd.addColorStop(0.6, L.accent);
      grd.addColorStop(1, L.primary);
      g.globalAlpha = 0.75;
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
      g.globalAlpha = 0.25;
      g.strokeStyle = '#ffffff';
      for (let i = 0; i < 18; i++) {
        g.lineWidth = 2 + r() * 6;
        g.beginPath();
        g.arc(w / 2, h * 0.45, 60 + i * 26, 0, Math.PI * 2);
        g.stroke();
      }
    } else {
      // 生碳纖維：保留碳紋，加冰藍色細線
      g.globalAlpha = 0.85;
      g.strokeStyle = L.primary;
      for (let i = 0; i < 6; i++) {
        g.lineWidth = i % 2 ? 3 : 10;
        g.beginPath();
        g.moveTo(-50, h * (0.2 + i * 0.12));
        g.lineTo(w + 50, h * (0.05 + i * 0.12));
        g.stroke();
      }
    }
    g.restore();
    // 品牌字樣與型號
    g.save();
    g.translate(w / 2, h * 0.5);
    g.rotate(-Math.PI / 2);
    g.textAlign = 'center';
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.font = 'italic 900 96px "Inter", "Helvetica Neue", Arial, sans-serif';
    g.fillText(spec.model.split(' ')[0], 0, 34);
    g.font = '700 30px "Inter", Arial, sans-serif';
    g.fillStyle = L.accent;
    g.fillText('PICKLE MASTER TW', 0, 86);
    g.restore();
    // 下方規格標
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.font = '600 22px "Inter", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText(`${spec.thickness}MM · ${spec.face.split(' ')[0]}`, w / 2, h * 0.93);
  });

/** 握把纏帶：斜纏＋透氣孔 */
export const gripTexture = (color: string) => {
  const t = make(`grip-${color}`, 128, 256, (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.lineWidth = 3;
    for (let y = -w; y < h + w; y += 22) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y + w * 0.6);
      g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,0.28)';
    for (let y = 6; y < h; y += 11) for (let x = 6 + ((y / 11) % 2) * 5; x < w; x += 10) g.fillRect(x, y, 2, 2);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/**
 * 戶外球：40 個洞均勻分布（費氏球面點），畫在等距柱狀投影上。
 * alpha 通道挖洞，球內再放一顆深色球，看起來就是真的洞洞球。
 */
export const ballTexture = () =>
  make('ball', 1024, 512, (g, w, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h);
    const n = 40;
    const golden = Math.PI * (3 - Math.sqrt(5));
    g.fillStyle = '#000000';
    for (let i = 0; i < n; i++) {
      const y = 1 - ((i + 0.5) / n) * 2;
      const lat = Math.asin(y);
      const lon = (i * golden) % (Math.PI * 2);
      const px = (lon / (Math.PI * 2)) * w;
      const py = (0.5 - lat / Math.PI) * h;
      // 洞半徑約 5 mm（球半徑 37 mm）→ 角半徑約 0.14 rad
      const ry = (0.14 / Math.PI) * h;
      const rx = Math.min(w / 2, ry / Math.max(0.12, Math.cos(lat)));
      for (const off of [-w, 0, w]) {
        g.beginPath();
        g.ellipse(px + off, py, rx, ry, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
  });

/** 跑馬燈廣告看板 */
export const ledTexture = (text: string, color: string) => {
  const t = make(`led-${text}`, 2048, 128, (g, w, h) => {
    g.fillStyle = '#05070c';
    g.fillRect(0, 0, w, h);
    g.font = '900 78px "Inter", "PingFang TC", "Noto Sans TC", sans-serif';
    g.textBaseline = 'middle';
    g.fillStyle = color;
    // 平均分配間距，讓貼圖左右接得起來（跑馬燈才不會斷字）
    const unit = g.measureText(text).width + 80;
    const n = Math.max(1, Math.floor(w / unit));
    for (let i = 0; i < n; i++) g.fillText(text, i * (w / n) + 20, h / 2 + 4);
    // LED 點陣感
    g.fillStyle = 'rgba(0,0,0,0.35)';
    for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    for (let xx = 0; xx < w; xx += 4) g.fillRect(xx, 0, 1, h);
  });
  t.wrapS = THREE.RepeatWrapping;
  return t;
};

/** 柔和圓點：粒子、光暈共用 */
export const glowTexture = () => {
  const t = make('glow', 128, 128, (g, w) => {
    const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, 'rgba(255,255,255,0.75)');
    grd.addColorStop(0.6, 'rgba(255,255,255,0.18)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, w);
  });
  t.colorSpace = THREE.NoColorSpace;
  return t;
};

/** 地面痕跡：焦痕、冰霜、雷擊裂痕 */
export const decalTexture = (kind: 'scorch' | 'frost' | 'crack') =>
  make(`decal-${kind}`, 256, 256, (g, w) => {
    const c = w / 2;
    const r = rng(kind.length * 31);
    if (kind === 'scorch') {
      const grd = g.createRadialGradient(c, c, 0, c, c, c);
      grd.addColorStop(0, 'rgba(10,6,4,0.95)');
      grd.addColorStop(0.5, 'rgba(40,16,6,0.7)');
      grd.addColorStop(0.75, 'rgba(255,90,20,0.35)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, w, w);
    } else if (kind === 'frost') {
      const grd = g.createRadialGradient(c, c, 0, c, c, c);
      grd.addColorStop(0, 'rgba(230,250,255,0.95)');
      grd.addColorStop(0.6, 'rgba(120,220,255,0.55)');
      grd.addColorStop(1, 'rgba(120,220,255,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, w, w);
      g.strokeStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < 14; i++) {
        const a = r() * Math.PI * 2;
        g.lineWidth = 1 + r() * 2.5;
        g.beginPath();
        g.moveTo(c, c);
        g.lineTo(c + Math.cos(a) * c * (0.5 + r() * 0.45), c + Math.sin(a) * c * (0.5 + r() * 0.45));
        g.stroke();
      }
    } else {
      g.strokeStyle = 'rgba(15,20,40,0.95)';
      g.shadowColor = 'rgba(120,170,255,1)';
      g.shadowBlur = 8;
      for (let i = 0; i < 9; i++) {
        let x = c;
        let y = c;
        let a = r() * Math.PI * 2;
        g.lineWidth = 3 + r() * 3;
        g.beginPath();
        g.moveTo(x, y);
        for (let k = 0; k < 6; k++) {
          a += (r() - 0.5) * 0.9;
          x += Math.cos(a) * 18;
          y += Math.sin(a) * 18;
          g.lineTo(x, y);
        }
        g.stroke();
      }
    }
  });

/** 球場外圍噴漆字樣 */
export const courtLogoTexture = () =>
  make('court-logo', 1024, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.font = 'italic 900 120px "Inter", Arial, sans-serif';
    g.fillText('PICKLE MASTER', w / 2, h / 2);
  });

/** 夜空：漸層＋星星 */
export const skyTexture = () =>
  make('sky', 1024, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#02040c');
    grd.addColorStop(0.55, '#0b1736');
    grd.addColorStop(0.8, '#1d2f5c');
    grd.addColorStop(1, '#3a3d63');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    const r = rng(42);
    for (let i = 0; i < 500; i++) {
      const y = r() * h * 0.6;
      g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`;
      g.fillRect(r() * w, y, r() < 0.1 ? 2 : 1, r() < 0.1 ? 2 : 1);
    }
  });
