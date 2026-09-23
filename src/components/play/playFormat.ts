import type { Format, GameSummary, Level, Scoring } from '../../utils/playApi';

export const FORMAT_LABEL: Record<Format, { name: string; desc: string }> = {
  rotation: { name: '四上四下', desc: '打完一局，4 人一起下場換人' },
  challenge: { name: '挑戰場', desc: '贏的留下並拆開，各配新搭檔' },
  partners: { name: '固定搭檔', desc: '自帶搭檔，兩兩對戰' },
  singles: { name: '單打', desc: '一對一' },
};

export const SCORING_LABEL: Record<Scoring, string> = {
  side_out_11: '傳統 11 分',
  rally_15: '每球得分 15',
  rally_21: '每球得分 21',
};

export const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: '2.0', label: '2.0' },
  { value: '2.5', label: '2.5' },
  { value: '3.0', label: '3.0' },
  { value: '3.5', label: '3.5' },
  { value: '4.0+', label: '4.0+' },
  { value: 'unsure', label: '不確定' },
];

// 對應站內 /ratings 的描述，寫「做得到什麼」而不是分數
const LEVEL_DESC: [number, string][] = [
  [2.0, '剛上完體驗課，能發球、知道基本規則'],
  [2.5, '能來回 5 拍以上，開始練網前小球'],
  [3.0, '網前小球打得穩，懂雙彈跳與廚房規則'],
  [3.5, '第三拍有想法，能控制球速與落點'],
  [4.0, '軟硬球都能掌控，雙打站位有默契'],
  [4.5, '穩定度高，懂得製造與把握機會'],
  [5.0, '全面型，比賽壓力下失誤很少'],
];
export const levelDesc = (v: number) => LEVEL_DESC.reduce((t, [k, s]) => (v >= k ? s : t), LEVEL_DESC[0][1]);

export const levelText = (g: Pick<GameSummary, 'levelMin' | 'levelMax'>) =>
  g.levelMin !== null && g.levelMax !== null ? `${g.levelMin.toFixed(1)}–${g.levelMax.toFixed(1)}` : '不限';

const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六'];
const pad = (n: number) => String(n).padStart(2, '0');

// 一律以台北時間顯示（台灣沒有日光節約，固定 UTC+8）
export function tp(ms: number) {
  const d = new Date(ms + 8 * 3600_000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay(), hh: d.getUTCHours(), mm: d.getUTCMinutes() };
}
export const hm = (ms: number) => { const t = tp(ms); return `${pad(t.hh)}:${pad(t.mm)}`; };

/** 台北時間某天 00:00 的 Unix 毫秒 */
export function taipeiDayStart(offsetDays: number, now = Date.now()) {
  const t = tp(now);
  return Date.UTC(t.y, t.m - 1, t.d + offsetDays) - 8 * 3600_000;
}
export const dayOffset = (ms: number, now = Date.now()) => Math.floor((ms - taipeiDayStart(0, now)) / 86400_000);

export function dayLabel(ms: number, now = Date.now()) {
  const off = dayOffset(ms, now);
  const t = tp(ms);
  if (off === 0) return '今天';
  if (off === 1) return '明天';
  if (off === 2) return '後天';
  return `${t.m}/${t.d}（${WEEKDAY[t.wd]}）`;
}
export const weekdayName = (wd: number) => `週${WEEKDAY[wd]}`;

export function untilText(ms: number, now = Date.now()) {
  const m = Math.round((ms - now) / 60000);
  if (m <= 0) return '進行中';
  if (m < 60) return `${m} 分鐘後開打`;
  if (m < 60 * 24) return `${Math.floor(m / 60)} 小時後開打`;
  return `${Math.floor(m / 1440)} 天後`;
}

/** 要自備或帶移動式網子的球場 */
export const needsNet = (net?: string) => net === 'self' || net === 'portable';

export const perPerson = (g: Pick<GameSummary, 'feeTotal'>, people: number) =>
  g.feeTotal > 0 ? Math.ceil(g.feeTotal / Math.max(people, 1)) : 0;
