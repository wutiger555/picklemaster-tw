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
    } else if (L.pattern === 'wind') {
      // 疾風：一道道彎曲的風切線，越往拍頭越密
      g.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        const y0 = h * (0.08 + i * 0.065);
        g.globalAlpha = 0.35 + r() * 0.55;
        g.strokeStyle = i % 3 === 0 ? L.accent : L.primary;
        g.lineWidth = 4 + r() * 10;
        g.beginPath();
        g.moveTo(-20, y0 + 40);
        g.bezierCurveTo(w * 0.3, y0 - 60 * r(), w * 0.6, y0 + 70 * r(), w + 20, y0 - 30);
        g.stroke();
      }
      // 拍面中央的旋渦
      g.globalAlpha = 0.8;
      g.strokeStyle = L.accent;
      g.lineWidth = 6;
      g.beginPath();
      for (let k = 0; k < 120; k++) {
        const a = k * 0.16;
        const rad = 8 + k * 1.3;
        const x = w / 2 + Math.cos(a) * rad;
        const y = h * 0.32 + Math.sin(a) * rad;
        if (k === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    } else if (L.pattern === 'stone') {
      // 鎮岳：岩層裂紋，縫裡透出熔岩光
      for (let i = 0; i < 7; i++) {
        let x = r() * w;
        let y = r() * h;
        g.globalAlpha = 0.9;
        g.strokeStyle = L.primary;
        g.shadowColor = L.primary;
        g.shadowBlur = 18;
        g.lineWidth = 3 + r() * 5;
        g.beginPath();
        g.moveTo(x, y);
        for (let k = 0; k < 9; k++) {
          x += (r() - 0.5) * 120;
          y += (r() - 0.3) * 110;
          g.lineTo(x, y);
        }
        g.stroke();
      }
      g.shadowBlur = 0;
      g.globalAlpha = 0.18;
      g.fillStyle = L.accent;
      for (let i = 0; i < 40; i++) g.fillRect(r() * w, r() * h, 6 + r() * 18, 3 + r() * 8);
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
export const decalTexture = (kind: 'scorch' | 'frost' | 'crack' | 'water') =>
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
    } else if (kind === 'water') {
      // 水灘：邊緣不規則的淺藍色，中間有幾道反光
      const grd = g.createRadialGradient(c, c, 0, c, c, c);
      grd.addColorStop(0, 'rgba(56,189,248,0.75)');
      grd.addColorStop(0.7, 'rgba(14,165,233,0.55)');
      grd.addColorStop(1, 'rgba(14,165,233,0)');
      g.fillStyle = grd;
      g.beginPath();
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const rad = c * (0.78 + r() * 0.2);
        if (i === 0) g.moveTo(c + Math.cos(a) * rad, c + Math.sin(a) * rad);
        else g.lineTo(c + Math.cos(a) * rad, c + Math.sin(a) * rad);
      }
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 5; i++) {
        g.lineWidth = 2 + r() * 3;
        g.beginPath();
        g.ellipse(c + (r() - 0.5) * c * 0.8, c + (r() - 0.5) * c * 0.8, 10 + r() * 30, 4 + r() * 8, r() * Math.PI, 0, Math.PI * 2);
        g.stroke();
      }
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

// ───────────────────────────── 戶外場地（新生公園）─────────────────────────────

/** 白天的天空：上深下淺的藍＋積雲（等距柱狀投影，畫面中線是地平線） */
export const daySkyTexture = () =>
  make('day-sky', 2048, 1024, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h / 2);
    grd.addColorStop(0, '#2f6fc4');
    grd.addColorStop(0.55, '#5f9ae0');
    grd.addColorStop(0.9, '#a9cdf0');
    grd.addColorStop(1, '#d9e9f5');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h / 2);
    g.fillStyle = '#c9dcc8';
    g.fillRect(0, h / 2, w, h / 2);
    const r = rng(17);
    // 每朵雲是一群柔邊圓：底部平、頂部蓬，越靠地平線越扁越小
    const puff = (x: number, y: number, rad: number, a: number) => {
      const c = g.createRadialGradient(x, y, 0, x, y, rad);
      c.addColorStop(0, `rgba(255,255,255,${a})`);
      c.addColorStop(0.6, `rgba(250,252,255,${a * 0.8})`);
      c.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = c;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
    };
    for (let i = 0; i < 46; i++) {
      const cy = h * (0.12 + r() * 0.34);
      const depth = cy / (h / 2); // 0 = 天頂，1 = 地平線
      const cx = r() * w;
      const span = (60 + r() * 160) * (1.2 - depth * 0.5);
      const n = 6 + Math.floor(r() * 10);
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const x = cx + (t - 0.5) * span * 2 + (r() - 0.5) * 30;
        const lift = Math.sin(t * Math.PI) * span * 0.35 * (1 - depth * 0.6);
        const rad = (18 + r() * 34) * (1.15 - depth * 0.55) * (0.7 + Math.sin(t * Math.PI) * 0.6);
        for (const off of [-w, 0, w]) puff(x + off, cy - lift * r(), rad, 0.55 + r() * 0.35);
      }
      // 雲底的淡灰陰影
      g.fillStyle = 'rgba(160,178,200,0.12)';
      g.beginPath();
      g.ellipse(cx, cy + 6, span, 7 * (1.2 - depth * 0.5), 0, 0, Math.PI * 2);
      g.fill();
    }
  });

/** 遠方樹林剪影：一圈圓柱面上的樹冠輪廓（上方透明） */
export const treelineTexture = () => {
  const t = make('treeline', 2048, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const r = rng(23);
    const layers = [
      { base: h * 0.55, amp: 70, col: '#6f8f7a' },
      { base: h * 0.68, amp: 60, col: '#4e7354' },
      { base: h * 0.8, amp: 40, col: '#3b5f40' },
    ];
    for (const L of layers) {
      g.fillStyle = L.col;
      g.beginPath();
      g.moveTo(0, h);
      let x = 0;
      while (x <= w) {
        const rad = 14 + r() * 34;
        const y = L.base - r() * L.amp;
        g.arc(x, y, rad, Math.PI, 0);
        x += rad * 1.3;
      }
      g.lineTo(w, h);
      g.closePath();
      g.fill();
    }
    // 偶爾冒出的大王椰子
    g.strokeStyle = '#7d8a80';
    g.fillStyle = '#4f7350';
    for (let i = 0; i < 26; i++) {
      const x = r() * w;
      const top = h * (0.08 + r() * 0.2);
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x, h * 0.6);
      g.lineTo(x, top);
      g.stroke();
      for (let k = 0; k < 7; k++) {
        const a = Math.PI + (k / 6) * Math.PI;
        g.beginPath();
        g.ellipse(x + Math.cos(a) * 9, top + Math.sin(a) * 5 + 4, 11, 2.5, a, 0, Math.PI * 2);
        g.fill();
      }
    }
  });
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  return t;
};

/** 草地：深淺斑駁的綠＋割草條紋 */
export const grassTexture = () => {
  const t = make('grass', 512, 512, (g, w, h) => {
    noiseFill(g, w, h, '#6f9a45', 30, 11, 2);
    const r = rng(5);
    for (let i = 0; i < 90; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(40,70,20,0.10)' : 'rgba(170,200,90,0.10)';
      g.beginPath();
      g.ellipse(r() * w, r() * h, 20 + r() * 60, 10 + r() * 40, r() * 3, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(255,255,255,0.04)';
    g.fillRect(0, 0, w / 2, h);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** 修剪過的樹籬：細碎葉面 */
export const hedgeTexture = () => {
  const t = make('hedge', 256, 256, (g, w, h) => {
    noiseFill(g, w, h, '#4f7f35', 40, 13, 2);
    const r = rng(9);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = r() < 0.55 ? 'rgba(25,55,15,0.45)' : 'rgba(150,200,80,0.35)';
      g.beginPath();
      g.ellipse(r() * w, r() * h, 2 + r() * 3, 1 + r() * 2, r() * 3, 0, Math.PI * 2);
      g.fill();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** 花崗岩矮牆：灰白小麻點 */
export const graniteTexture = () => {
  const t = make('granite', 256, 256, (g, w, h) => {
    noiseFill(g, w, h, '#b9b6ae', 46, 21, 1);
    const r = rng(31);
    for (let i = 0; i < 700; i++) {
      g.fillStyle = r() < 0.6 ? 'rgba(60,60,60,0.5)' : 'rgba(255,255,255,0.5)';
      g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** 舊硬地球場：墨綠偏灰，有雨水漬與磨損 */
export const wornCourtTexture = () => {
  const t = make('worn-court', 1024, 1024, (g, w, h) => {
    noiseFill(g, w, h, '#4f7a62', 16, 41, 1);
    const r = rng(77);
    for (let i = 0; i < 70; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 30 + r() * 140;
      const c = g.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() < 0.6;
      c.addColorStop(0, dark ? 'rgba(30,50,40,0.16)' : 'rgba(200,220,200,0.10)');
      c.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = c;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** 羽毛球雙打場的白線（透明底）：畫布上方是 −z 端 */
export const badmintonLinesTexture = () =>
  make('badminton-lines', 1024, 2048, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const sx = w / 6.1;
    const sz = h / 13.4;
    const lw = 0.04;
    g.fillStyle = 'rgba(245,247,242,0.95)';
    const rect = (x: number, z: number, ww: number, hh: number) => g.fillRect(x * sx, z * sz, ww * sx, hh * sz);
    // 外框（雙打邊線、底線）
    rect(0, 0, 6.1, lw);
    rect(0, 13.4 - lw, 6.1, lw);
    rect(0, 0, lw, 13.4);
    rect(6.1 - lw, 0, lw, 13.4);
    // 單打邊線
    rect(0.46, 0, lw, 13.4);
    rect(6.1 - 0.46 - lw, 0, lw, 13.4);
    for (const end of [0, 1]) {
      const z = (zz: number) => (end ? 13.4 - zz - lw : zz);
      // 雙打長發球線、前發球線
      rect(0, z(0.76), 6.1, lw);
      rect(0, z(6.7 - 1.98), 6.1, lw);
      // 中線：前發球線到底線
      const z0 = end ? 6.7 + 1.98 : 0;
      rect(3.05 - lw / 2, z0, lw, 6.7 - 1.98);
    }
  });

/** 白色建築外牆：橫向窗帶 */
export const buildingTexture = () => {
  const t = make('building', 512, 512, (g, w, h) => {
    noiseFill(g, w, h, '#eef0ee', 8, 51, 2);
    for (let row = 0; row < 2; row++) {
      const y = 110 + row * 220;
      for (let x = 40; x < w; x += 128) {
        const grd = g.createLinearGradient(0, y, 0, y + 80);
        grd.addColorStop(0, '#7f939e');
        grd.addColorStop(1, '#b4c4cc');
        g.fillStyle = grd;
        g.fillRect(x, y, 44, 80);
      }
      g.fillStyle = 'rgba(0,0,0,0.05)';
      g.fillRect(0, y + 110, w, 5);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** 大王椰子葉：中肋＋羽狀小葉（透明底） */
export const palmFrondTexture = () =>
  make('palm-frond', 128, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = '#3f6a2c';
    g.lineCap = 'round';
    for (let y = 8; y < h - 4; y += 7) {
      const t = y / h;
      const len = (w / 2) * Math.sin(Math.min(1, t * 1.15) * Math.PI) * 0.95;
      g.lineWidth = 3.5;
      g.strokeStyle = (y / 7) % 2 ? '#3f6a2c' : '#4f7d36';
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(w / 2, y);
        g.lineTo(w / 2 + s * len, y + len * 0.55);
        g.stroke();
      }
    }
    g.strokeStyle = '#a3a77a';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(w / 2, 0);
    g.lineTo(w / 2, h);
    g.stroke();
  });

/** 臺北玫瑰園立牌：墨綠底、白字、一朵玫瑰 */
export const gardenSignTexture = () =>
  make('garden-sign', 1024, 400, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#24503a');
    grd.addColorStop(1, '#173726');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(230,214,160,0.85)';
    g.lineWidth = 6;
    g.strokeRect(18, 18, w - 36, h - 36);
    // 玫瑰：五片花瓣＋花心＋葉子
    const cx = 150;
    const cy = 170;
    g.fillStyle = '#4f8a3a';
    g.beginPath();
    g.ellipse(cx - 44, cy + 62, 34, 14, -0.5, 0, Math.PI * 2);
    g.ellipse(cx + 44, cy + 62, 34, 14, 0.5, 0, Math.PI * 2);
    g.fill();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      g.fillStyle = i % 2 ? '#d61f3c' : '#e8365a';
      g.beginPath();
      g.arc(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34, 40, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#b3122f';
    g.beginPath();
    g.arc(cx, cy, 30, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#f37a93';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(cx, cy, 16, 0.3, Math.PI * 1.7);
    g.stroke();
    g.fillStyle = '#ffffff';
    g.textBaseline = 'middle';
    g.font = '900 132px "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    g.fillText('臺北玫瑰園', 270, 150);
    g.fillStyle = 'rgba(230,214,160,0.95)';
    g.font = '700 50px "Inter", "Helvetica Neue", Arial, sans-serif';
    g.fillText('TAIPEI ROSE GARDEN', 276, 262);
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.font = '600 36px "PingFang TC", "Noto Sans TC", sans-serif';
    g.fillText('新生公園 · 羽毛球場', 278, 330);
  });

// ───────────────────────────── 海邊・颱風天（踢館之旅）─────────────────────────────

/** 颱風天的天空：低垂的灰雲，越靠地平線越亮（storm = 颱風正面，暗很多） */
export const stormSkyTexture = (storm: boolean) =>
  make(`storm-sky-${storm}`, 1024, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h / 2);
    grd.addColorStop(0, storm ? '#1a2230' : '#4b5c70');
    grd.addColorStop(0.7, storm ? '#3a4a5c' : '#8496a8');
    grd.addColorStop(1, storm ? '#6b7b88' : '#b9c6cf');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h / 2);
    g.fillStyle = storm ? '#2b3a44' : '#5d7180';
    g.fillRect(0, h / 2, w, h / 2);
    const r = rng(311);
    // 一層層扁扁的雲帶（颱風外圍環流），橫向拉長
    for (let i = 0; i < 70; i++) {
      const y = h * (0.04 + r() * 0.44);
      const x = r() * w;
      const rx = 80 + r() * 220;
      const ry = 8 + r() * 26;
      const dark = r() < 0.6;
      const a = storm ? 0.25 + r() * 0.35 : 0.15 + r() * 0.25;
      for (const off of [-w, 0, w]) {
        const c = g.createRadialGradient(x + off, y, 0, x + off, y, rx);
        c.addColorStop(0, dark ? `rgba(20,28,40,${a})` : `rgba(200,210,220,${a * 0.6})`);
        c.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = c;
        g.save();
        g.translate(x + off, y);
        g.scale(1, ry / rx);
        g.translate(-(x + off), -y);
        g.beginPath();
        g.arc(x + off, y, rx, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
    }
  });

/** 沙灘：細沙顆粒＋零星貝殼碎 */
export const sandTexture = () => {
  const t = make('sand', 512, 512, (g, w, h) => {
    noiseFill(g, w, h, '#c9b28a', 34, 91);
    const r = rng(5);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(255,248,230,0.5)' : 'rgba(120,96,64,0.35)';
      g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 14);
  return t;
};

/** 海面：一條條浪紋（貼圖往岸邊捲動，看起來在打浪） */
export const seaTexture = () => {
  const t = make('sea', 256, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#2b5566');
    grd.addColorStop(1, '#335f70');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    const r = rng(77);
    for (let i = 0; i < 90; i++) {
      const y = r() * h;
      const x = r() * w;
      const len = 20 + r() * 70;
      g.strokeStyle = `rgba(220,240,245,${0.12 + r() * 0.3})`;
      g.lineWidth = 1 + r() * 2.5;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + len / 2, y - 3, x + len, y);
      g.stroke();
      g.beginPath();
      g.moveTo(x - w, y);
      g.quadraticCurveTo(x - w + len / 2, y - 3, x - w + len, y);
      g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 6);
  return t;
};

/** 飲料攤的條紋遮雨棚 */
export const awningTexture = () =>
  make('awning', 256, 64, (g, w, h) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#fff7ed' : '#e11d48';
      g.fillRect((i * w) / 8, 0, w / 8 + 1, h);
    }
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(0, h - 10, w, 10);
  });

/** 飲料攤招牌：黃底紅字，夜市味 */
export const boothSignTexture = () =>
  make('booth-sign', 512, 160, (g, w, h) => {
    g.fillStyle = '#facc15';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#7c2d12';
    g.lineWidth = 10;
    g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = '#b91c1c';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '900 86px "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    g.fillText('颱風珍奶', w / 2, h / 2 - 8);
    g.fillStyle = '#7c2d12';
    g.font = '800 26px "PingFang TC", "Noto Sans TC", sans-serif';
    g.fillText('風雨無阻・全糖去冰', w / 2, h - 24);
  });

/** 手搖杯的杯身貼紙（一圈） */
export const cupLabelTexture = () => {
  const t = make('cup-label', 256, 128, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#f2dcc0');
    grd.addColorStop(0.55, '#c99b6d');
    grd.addColorStop(1, '#7a5233');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    // 杯底的珍珠
    const r = rng(23);
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(40,22,12,${0.7 + r() * 0.3})`;
      g.beginPath();
      g.arc(r() * w, h - 6 - r() * 26, 4 + r() * 3, 0, Math.PI * 2);
      g.fill();
    }
    // 杯身貼紙
    g.fillStyle = '#fff7ed';
    g.fillRect(w * 0.3, h * 0.2, w * 0.4, h * 0.32);
    g.fillStyle = '#e11d48';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '900 30px "PingFang TC", "Noto Sans TC", sans-serif';
    g.fillText('珍奶', w * 0.5, h * 0.36);
  });
  t.wrapS = THREE.RepeatWrapping;
  return t;
};
