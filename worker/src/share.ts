import type { Env } from './env';
import { getCourt } from './courts';
import type { GameRow } from './games';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六'];

// 台灣沒有日光節約時間，固定 UTC+8
export function taipeiTime(ms: number) {
  const d = new Date(ms + 8 * 3600_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}（${WEEKDAY[d.getUTCDay()]}）${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

// 分享到 LINE 的連結會先到這裡：給爬蟲看 OG 卡片，給人轉址到主站的團頁
export function shareHtml(env: Env, g: GameRow | null, confirmed: number): string {
  const site = env.SITE_ORIGIN;
  if (!g || g.hidden) {
    return page(`${site}/play/`, '揪團約打｜PickleMaster', '找球友、看場況，全台匹克球揪團', `${site}/og-image.png`);
  }
  const court = getCourt(g.court_id);
  const target = `${site}/play/g/${encodeURIComponent(g.id)}/`;
  const left = Math.max(g.capacity - confirmed, 0);
  const level = g.level_min !== null && g.level_max !== null ? `程度 ${g.level_min.toFixed(1)}–${g.level_max.toFixed(1)}` : '程度不限';
  const state =
    g.status === 'open' ? (left > 0 ? `還有 ${left} 位` : '已額滿，可候補') : g.status === 'finished' ? '已結束' : '已取消';
  const desc = [taipeiTime(g.starts_at), court?.name ?? '', level, state].filter(Boolean).join(' · ');
  const image = court ? `${site}/og/court-${court.id}.png` : `${site}/og-image.png`;
  return page(target, `${g.title}｜揪團約打`, desc, image);
}

function page(target: string, title: string, desc: string, image: string) {
  const t = esc(title), d = esc(desc), u = esc(target), i = esc(image);
  return `<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title>
<meta name="robots" content="noindex">
<meta name="description" content="${d}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="PickleMaster 台灣匹克球">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${i}">
<meta property="og:url" content="${u}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${u}">
<meta http-equiv="refresh" content="0;url=${u}">
</head><body><p><a href="${u}">前往揪團頁面</a></p>
<script>location.replace(${JSON.stringify(target).replace(/</g, '\\u003c')})</script></body></html>`;
}
