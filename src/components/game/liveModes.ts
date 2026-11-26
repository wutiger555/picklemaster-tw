import type { Difficulty } from './engine/ai';
import type { TeamStats } from './engine/game';
import type { ShotKind } from './engine/shots';
import { WEEKLY_RULES, type WeeklyRule, type WeeklyRuleDef } from './engine/liveRules';
import { VENUES, type MenuVenue } from './venues';

/**
 * 會自己輪換的三個模式：每日挑戰、本週規則賽、連勝生存賽。
 * 全部由日期（台北時間）決定內容，建好之後不用人維護。
 */

const HOUR = 3600_000;
const DAY = 24 * HOUR;
/** 台北時間週一 00:00 = UTC 週日 16:00；1970-01-05 是週一（和後端 arcade.ts 同一個算法） */
const WEEK0 = Date.UTC(1970, 0, 5) - 8 * HOUR;
export const dayIndex = (now = Date.now()) => Math.floor((now + 8 * HOUR) / DAY);
export const weekIndex = (now = Date.now()) => Math.floor((now - WEEK0) / (7 * DAY));
export const dayEndsAt = (now = Date.now()) => (dayIndex(now) + 1) * DAY - 8 * HOUR;

/** 可重複的偽亂數：同一天／同一週每個人拿到同一題 */
const rng = (seed: number) => {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const pick = <T,>(r: () => number, list: readonly T[]) => list[Math.floor(r() * list.length)];

// ───────────────────────────── 本週規則賽 ─────────────────────────────

export const weeklyRule = (specials: boolean, now = Date.now()): WeeklyRuleDef => {
  const pool = WEEKLY_RULES.filter((r) => specials || !r.specialsOnly);
  return pool[weekIndex(now) % pool.length];
};

// ───────────────────────────── 每日挑戰 ─────────────────────────────

/** 一場打完的摘要（finish 時整理給挑戰判定） */
export interface MatchSummary {
  won: boolean;
  score: [number, number];
  longestRally: number;
  stats: TeamStats;
  /** 我這場致勝球的球路統計 */
  winnerKinds: Partial<Record<ShotKind, number>>;
  dinkStreak: number;
  durationMs: number;
  doubles: boolean;
}

export interface DailyChallenge {
  day: number;
  title: string;
  desc: string;
  icon: string;
  mode: 'match' | 'dink';
  difficulty: Difficulty;
  doubles: boolean;
  venue: MenuVenue;
  check: (s: MatchSummary) => boolean;
}

const DIFF_LABEL: Record<Difficulty, string> = { rookie: '新手', club: '球友', pro: '高手' };
const sumKinds = (k: MatchSummary['winnerKinds'], kinds: ShotKind[]) => kinds.reduce((n, x) => n + (k[x] ?? 0), 0);

type Template = (r: () => number, difficulty: Difficulty, venue: MenuVenue) => Omit<DailyChallenge, 'day' | 'venue' | 'difficulty'> & { difficulty?: Difficulty };

const TEMPLATES: Template[] = [
  (r, d) => {
    const n = 2 + Math.floor(r() * 3);
    return { icon: '🧹', title: `乾淨贏球`, desc: `打敗${DIFF_LABEL[d]}，失誤不超過 ${n} 次`, mode: 'match', doubles: false, check: (s) => s.won && s.stats.errors <= n };
  },
  (r, d) => {
    const n = 2 + Math.floor(r() * 2);
    return { icon: '💥', title: '殺手', desc: `打敗${DIFF_LABEL[d]}，殺球得分至少 ${n} 次`, mode: 'match', doubles: false, check: (s) => s.won && sumKinds(s.winnerKinds, ['smash']) >= n };
  },
  (r) => {
    const n = 12 + Math.floor(r() * 3) * 4;
    return { icon: '🔁', title: '連擊', desc: `任何比賽裡打出一次 ${n} 拍以上的來回`, mode: 'match', doubles: false, check: (s) => s.longestRally >= n };
  },
  (r, d) => {
    const cap = d === 'pro' ? 7 : 4 + Math.floor(r() * 2);
    return { icon: '🧱', title: '封鎖', desc: `打敗${DIFF_LABEL[d]}，對手不能拿到 ${cap + 1} 分`, mode: 'match', doubles: false, check: (s) => s.won && s.score[1] <= cap };
  },
  (r, d) => {
    const n = 2 + Math.floor(r() * 2);
    return { icon: '🥒', title: '網前王', desc: `打敗${DIFF_LABEL[d]}，用 dink 或放小球得分 ${n} 次`, mode: 'match', doubles: false, check: (s) => s.won && sumKinds(s.winnerKinds, ['dink', 'drop']) >= n };
  },
  (r) => {
    const n = 8 + Math.floor(r() * 3) * 2;
    return { icon: '⭐', title: '手感', desc: `一場比賽打出 ${n} 次完美擊球`, mode: 'match', doubles: false, check: (s) => s.stats.perfect >= n };
  },
  (r) => {
    const n = 20 + Math.floor(r() * 3) * 5;
    return { icon: '🎯', title: 'Dink 馬拉松', desc: `Dink 挑戰連續 ${n} 拍`, mode: 'dink', doubles: false, check: (s) => s.dinkStreak >= n };
  },
  (_r, d) => ({ icon: '🤝', title: '雙打', desc: `雙打打敗${DIFF_LABEL[d]}`, mode: 'match', doubles: true, check: (s) => s.won && s.doubles }),
  (r, d) => {
    const n = 1 + Math.floor(r() * 2);
    return { icon: '🎾', title: '發球得分', desc: `打敗${DIFF_LABEL[d]}，發球直接得分 ${n} 次`, mode: 'match', doubles: false, check: (s) => s.won && s.stats.aces >= n };
  },
  () => ({ icon: '🛫', title: '客場', desc: '在指定球場打敗高手', mode: 'match', doubles: false, difficulty: 'pro', check: (s) => s.won }),
  (_r, d) => ({ icon: '🍋', title: '守規矩', desc: `打敗${DIFF_LABEL[d]}，零廚房違例、失誤不超過 3 次`, mode: 'match', doubles: false, check: (s) => s.won && s.stats.kitchenFaults === 0 && s.stats.errors <= 3 }),
  (r, d) => {
    const m = 4 + Math.floor(r() * 2);
    return { icon: '⏱️', title: '速戰', desc: `${m} 分鐘內打敗${DIFF_LABEL[d]}`, mode: 'match', doubles: false, check: (s) => s.won && s.durationMs <= m * 60_000 };
  },
];

export const dailyChallenge = (now = Date.now()): DailyChallenge => {
  const day = dayIndex(now);
  const r = rng(day);
  const tpl = pick(r, TEMPLATES);
  const difficulty = pick(r, ['rookie', 'club', 'club', 'pro'] as const);
  const venue = pick(r, VENUES).id;
  const c = tpl(r, difficulty, venue);
  const d = c.difficulty ?? difficulty;
  const venueName = VENUES.find((v) => v.id === venue)!.short;
  return { ...c, day, difficulty: d, venue, desc: c.title === '客場' ? `在${venueName}打敗高手` : c.desc };
};

/** 每日挑戰的本機紀錄（會同步到雲端） */
export interface DailyProgress {
  lastDone: number;
  streak: number;
  total: number;
}
export const DAILY_KEY = 'pm-game-daily';
export const readDaily = (): DailyProgress => {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    return raw ? { lastDone: -1, streak: 0, total: 0, ...JSON.parse(raw) } : { lastDone: -1, streak: 0, total: 0 };
  } catch {
    return { lastDone: -1, streak: 0, total: 0 };
  }
};
export const markDailyDone = (now = Date.now()): DailyProgress => {
  const p = readDaily();
  const day = dayIndex(now);
  if (p.lastDone === day) return p;
  const next: DailyProgress = { lastDone: day, streak: p.lastDone === day - 1 ? p.streak + 1 : 1, total: p.total + 1 };
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(next));
  } catch {
    /* 存不了 */
  }
  return next;
};
/** 今天做完了；連續天數只在昨天或今天有做時才算還活著 */
export const dailyStatus = (now = Date.now()) => {
  const p = readDaily();
  const day = dayIndex(now);
  return { done: p.lastDone === day, streak: p.lastDone >= day - 1 ? p.streak : 0, total: p.total };
};

// ───────────────────────────── 連勝生存賽 ─────────────────────────────

export const SURVIVAL_TARGET = 5;
const SURVIVAL_KEY = 'pm-game-survival';

export interface SurvivalRound {
  round: number;
  difficulty: Difficulty;
  venue: MenuVenue;
  /** 第 5 關起加規則 */
  rule: WeeklyRule | null;
  doubles: boolean;
}

/** 第 n 關（1 起算）的設定：難度爬升、球場輪換、第 5 關起每關一條規則、第 8 關起偶數關打雙打 */
export const survivalRound = (round: number, specials: boolean): SurvivalRound => {
  const r = rng(round * 7919 + 17);
  const difficulty: Difficulty = round <= 2 ? 'rookie' : round <= 4 ? 'club' : 'pro';
  const venue = VENUES[(round - 1) % VENUES.length].id;
  const pool = WEEKLY_RULES.filter((x) => specials || !x.specialsOnly);
  const rule = round >= 5 ? pick(r, pool).id : null;
  return { round, difficulty, venue, rule, doubles: round >= 8 && round % 2 === 0 };
};

export const readSurvivalBest = (): number => {
  try {
    return Number(localStorage.getItem(SURVIVAL_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
};
export const saveSurvivalBest = (rounds: number) => {
  if (rounds <= readSurvivalBest()) return;
  try {
    localStorage.setItem(SURVIVAL_KEY, String(rounds));
  } catch {
    /* 存不了 */
  }
};

/** 開賽時帶的「活動模式」資訊；finish 時用來判定、記錄 */
export type LiveStart = { kind: 'daily'; challenge: DailyChallenge } | { kind: 'rule'; rule: WeeklyRuleDef } | { kind: 'survival'; round: SurvivalRound };
