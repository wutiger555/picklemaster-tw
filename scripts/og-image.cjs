// build 時產生每頁專屬 OG 分享圖（1200×630 PNG）。
// 使用 @resvg/resvg-js + commit 進 repo 的 subset 字型（scripts/assets/og-font.ttf），
// CI 只需 node，無需系統字型；任一環節失敗則回傳 null，讓 build 優雅降級（沿用預設 OG 圖）。
const fs = require('fs');
const path = require('path');

let Resvg = null;
let fontBuffer = null;
let ready = null;

function init() {
  if (ready !== null) return ready;
  try {
    Resvg = require('@resvg/resvg-js').Resvg;
    fontBuffer = fs.readFileSync(path.join(__dirname, 'assets', 'og-font.ttf'));
    ready = true;
  } catch (e) {
    console.warn('  [og] 停用 OG 圖生成：', e.message);
    ready = false;
  }
  return ready;
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 依 CJK/半形估算寬度做斷行（resvg 不會自動換行）；超過 maxLines 則在末行截斷加省略號
function wrapTitle(title, fontSize, maxWidth, maxLines) {
  const chars = [...String(title)];
  const widthOf = (ch) => (/[\x00-\xff]/.test(ch) ? 0.56 : 1) * fontSize;
  const lines = [];
  let cur = '';
  let curW = 0;
  for (const ch of chars) {
    const w = widthOf(ch);
    if (curW + w > maxWidth && cur) {
      if (lines.length === maxLines - 1) {
        // 已在最後一行且還放不下 → 截斷
        cur = cur.slice(0, -1) + '…';
        break;
      }
      lines.push(cur);
      cur = '';
      curW = 0;
    }
    cur += ch;
    curW += w;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

const ACCENTS = {
  court: ['#0d9488', '#0891b2'],
  city: ['#0f766e', '#0e7490'],
  technique: ['#0891b2', '#2563eb'],
  player: ['#e11d48', '#ea580c'],
  article: ['#d97706', '#ea580c'],
  program: ['#059669', '#0d9488'],
  default: ['#0d9488', '#0891b2'],
};

/**
 * @returns {Buffer|null} PNG buffer，失敗回 null
 */
function renderOg({ title, subtitle = '', badge = '', type = 'default' }) {
  if (!init()) return null;
  try {
    const [c1, c2] = ACCENTS[type] || ACCENTS.default;
    const titleSize = title && [...title].length > 16 ? 64 : 76;
    const lines = wrapTitle(title, titleSize, 1040, 3);
    const lineH = titleSize * 1.25;
    const subSize = 36;
    const titleBlockH = lines.length * lineH;
    const totalH = titleBlockH + (subtitle ? 30 + subSize : 0);
    // 在徽章下方(≈250)到網域上方(≈560)的區域垂直置中，避免與徽章重疊
    const regionTop = 250, regionBottom = 560;
    const startTop = regionTop + Math.max(0, (regionBottom - regionTop - totalH) / 2);
    const firstBaseline = startTop + titleSize * 0.8;
    const titleTspans = lines.map((ln, i) =>
      `<text x="80" y="${Math.round(firstBaseline + i * lineH)}" font-family="Noto Sans TC" font-size="${titleSize}" font-weight="700" fill="#ffffff">${esc(ln)}</text>`
    ).join('');
    const subBaseline = Math.round(startTop + titleBlockH + 30 + subSize * 0.8);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="120" r="230" fill="#ffffff" opacity="0.06"/>
  <circle cx="1120" cy="560" r="150" fill="#ffffff" opacity="0.05"/>
  <text x="80" y="96" font-family="Noto Sans TC" font-size="30" font-weight="700" fill="#ffffff" letter-spacing="2">PICKLEMASTER</text>
  <text x="80" y="128" font-family="Noto Sans TC" font-size="18" fill="#ffffff" opacity="0.75" letter-spacing="3">TAIWAN PICKLEBALL</text>
  ${badge ? `<rect x="80" y="168" width="${44 + [...badge].length * 30}" height="46" rx="23" fill="#ffffff" opacity="0.18"/>
  <text x="${102}" y="200" font-family="Noto Sans TC" font-size="26" font-weight="700" fill="#ffffff">${esc(badge)}</text>` : ''}
  ${titleTspans}
  ${subtitle ? `<text x="80" y="${subBaseline}" font-family="Noto Sans TC" font-size="${subSize}" fill="#ffffff" opacity="0.9">${esc(subtitle)}</text>` : ''}
  <text x="80" y="586" font-family="Noto Sans TC" font-size="26" fill="#ffffff" opacity="0.8">picklemastertw.site</text>
</svg>`;

    const r = new Resvg(svg, {
      font: { loadSystemFonts: false, fontBuffers: [fontBuffer], defaultFontFamily: 'Noto Sans TC' },
      fitTo: { mode: 'width', value: 1200 },
    });
    return r.render().asPng();
  } catch (e) {
    console.warn('  [og] 單張生成失敗：', e.message);
    return null;
  }
}

module.exports = { renderOg, ogAvailable: init };
