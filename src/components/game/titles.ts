import type { ArcadeStats } from '../../utils/playApi';

/**
 * 稱號：從累計數字算出來，不用人維護。
 * 依序檢查，越前面越稀有；排行榜每一行秀最稀有的一個，球友卡秀全部拿到的。
 */
export interface Title {
  icon: string;
  name: string;
  /** 怎麼拿到的（球友卡用） */
  how: string;
}

const RULES: { t: Title; ok: (s: ArcadeStats) => boolean }[] = [
  { t: { icon: '👑', name: '高手剋星', how: '擊敗高手電腦 20 場' }, ok: (s) => s.proWins >= 20 },
  { t: { icon: '🛡️', name: '生存傳奇', how: '連勝生存賽過 10 關' }, ok: (s) => s.survivalBest >= 10 },
  { t: { icon: '🥒', name: 'Dink 大師', how: 'Dink 挑戰連續 100 拍' }, ok: (s) => s.dinkBest >= 100 },
  { t: { icon: '🏅', name: '百戰老將', how: '贏 50 場比賽' }, ok: (s) => s.wins >= 50 },
  { t: { icon: '🔁', name: '來回機器', how: '一次來回打到 30 拍' }, ok: (s) => s.longestRally >= 30 },
  { t: { icon: '📅', name: '每日常客', how: '完成 30 次今日挑戰' }, ok: (s) => s.dailies >= 30 },
  { t: { icon: '🎯', name: '高手獵人', how: '擊敗高手電腦 5 場' }, ok: (s) => s.proWins >= 5 },
  { t: { icon: '🔥', name: '生存者', how: '連勝生存賽過 5 關' }, ok: (s) => s.survivalBest >= 5 },
  { t: { icon: '🪄', name: '網前魔術師', how: 'Dink 挑戰連續 50 拍' }, ok: (s) => s.dinkBest >= 50 },
  { t: { icon: '🌅', name: '早起鳥', how: '完成 7 次今日挑戰' }, ok: (s) => s.dailies >= 7 },
  { t: { icon: '🏟️', name: '球場常客', how: '贏 10 場比賽' }, ok: (s) => s.wins >= 10 },
  { t: { icon: '🌱', name: '創始球友', how: '2026 年底前就來打過' }, ok: (s) => s.firstAt !== null && s.firstAt < Date.UTC(2026, 11, 31, 16) },
  { t: { icon: '🥒', name: '新血', how: '打過第一場' }, ok: (s) => s.plays > 0 || s.dinkBest > 0 || s.survivalBest > 0 },
];

/** 拿到的全部稱號，最稀有的在前 */
export const titlesOf = (s: ArcadeStats): Title[] => RULES.filter((r) => r.ok(s)).map((r) => r.t);
export const topTitle = (s: ArcadeStats): Title | null => titlesOf(s)[0] ?? null;
/** 下一個可以拿的稱號（球友卡上給個目標） */
export const nextTitle = (s: ArcadeStats): Title | null => {
  for (let i = RULES.length - 1; i >= 0; i--) if (!RULES[i].ok(s)) return RULES[i].t;
  return null;
};
