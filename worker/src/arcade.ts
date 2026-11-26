import type { Env } from './env';
import { bad, notFound } from './errors';
import * as v from './validate';

/**
 * 匹克硬邦幫（/game）：雲端存檔與歷史累計排行榜。
 * 遊戲在玩家的瀏覽器裡跑，成績無法完全防偽：這裡只擋明顯不合理的成績（比分不合規則、時間太短）與送出頻率。
 */

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
/** 台北時間週一 00:00 = UTC 週日 16:00；1970-01-05 是週一 */
const WEEK0 = Date.UTC(1970, 0, 5) - 8 * HOUR;
export const weekOf = (t: number) => WEEK0 + Math.floor((t - WEEK0) / WEEK) * WEEK;

const MAX_PROFILE = 16_000;
/** match 一般比賽、dink 挑戰、daily 每日挑戰（達成才送）、survival 連勝生存賽（rallies＝過了幾關） */
const MODES = ['match', 'dink', 'daily', 'survival'] as const;
const DIFFS = ['rookie', 'club', 'pro'] as const;
const VENUES = ['arena', 'rosegarden', 'xinyi', 'riverside', 'beach'] as const;
/** 贏一場的積分：新手 1、球友 2、高手 4 */
const WIN_POINTS: Record<(typeof DIFFS)[number], number> = { rookie: 1, club: 2, pro: 4 };

export const BOARDS = ['points', 'pro', 'dink', 'survival'] as const;
/** 每日挑戰達成的積分；生存賽每過一關 1 分，最多算 10 關 */
const DAILY_POINTS = 3;
const SURVIVAL_POINTS_CAP = 10;
type Board = (typeof BOARDS)[number];

// ---------- 存檔 ----------

export async function getProfile(env: Env, playerId: string) {
  const r = await env.DB.prepare(`SELECT data, updated_at FROM arcade_profiles WHERE player_id = ?1`).bind(playerId).first<{ data: string; updated_at: number }>();
  if (!r) return { data: null, updatedAt: null };
  return { data: JSON.parse(r.data) as unknown, updatedAt: r.updated_at };
}

export async function putProfile(env: Env, playerId: string, body: Record<string, unknown>, now: number) {
  if (typeof body.data !== 'object' || body.data === null || Array.isArray(body.data)) throw bad('invalid_profile', '存檔格式不對');
  const text = JSON.stringify(body.data);
  if (text.length > MAX_PROFILE) throw bad('profile_too_large', '存檔太大了');
  await env.DB.prepare(
    `INSERT INTO arcade_profiles (player_id, data, updated_at) VALUES (?1, ?2, ?3)
     ON CONFLICT (player_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  )
    .bind(playerId, text, now)
    .run();
  return { updatedAt: now };
}

// ---------- 比賽結果 ----------

/** 換發球制 11 分（15 分週是 15）、贏 2 分：贏家剛好 11 且領先至少 2，或超過 11 時剛好領先 2 */
const validMatchScore = (w: number, l: number, target = 11) => (w === target && l <= target - 2) || (w > target && w - l === 2);

export async function postResult(env: Env, playerId: string, body: Record<string, unknown>, now: number) {
  const mode = v.oneOf(body.mode, 'mode', MODES, '模式');
  const difficulty = v.oneOf(body.difficulty, 'difficulty', DIFFS, '程度');
  const venue = v.oneOf(body.venue, 'venue', VENUES, '場地');
  const doubles = body.doubles === true;
  const specials = body.specials !== false;
  const durationMs = v.int(body.durationMs, 'duration_ms', 0, 3 * HOUR, '比賽時間');
  // 球友卡用的細節（選填）
  const longestRally = body.longestRally === undefined ? 0 : v.int(body.longestRally, 'longest_rally', 0, 500, '最長連擊');
  const character = typeof body.character === 'string' ? body.character.slice(0, 24) : null;
  const paddle = typeof body.paddle === 'string' ? body.paddle.slice(0, 24) : null;
  let won = false;
  let scoreMe = 0;
  let scoreOpp = 0;
  let rallies = 0;
  let points = 0;
  if (mode === 'daily' && body.scoreMe === undefined) {
    // Dink 類型的每日挑戰：達成才送，帶拍數
    rallies = v.int(body.rallies, 'rallies', 1, 2000, '拍數');
    if (durationMs < rallies * 800) throw bad('implausible_result', '這場的成績不太合理，沒有記錄');
    won = true;
    points = DAILY_POINTS;
  } else if (mode === 'match' || mode === 'daily') {
    scoreMe = v.int(body.scoreMe, 'score_me', 0, 40, '比分');
    scoreOpp = v.int(body.scoreOpp, 'score_opp', 0, 40, '比分');
    won = scoreMe > scoreOpp;
    // 15 分週：先到 15 贏 2 分
    const target = scoreMe >= 15 || scoreOpp >= 15 ? 15 : 11;
    const ok = won ? validMatchScore(scoreMe, scoreOpp, target) : validMatchScore(scoreOpp, scoreMe, target);
    // 每一分至少要打幾秒（發球＋回球）；換發球制實際打的分數比總分多，所以這是很寬鬆的下限
    if (!ok || durationMs < (scoreMe + scoreOpp) * 4000) throw bad('implausible_result', '這場的成績不太合理，沒有記錄');
    // 每日挑戰：達成才會送上來（有些題目不用贏，像連擊、完美擊球），給固定積分
    points = mode === 'daily' ? DAILY_POINTS : won ? WIN_POINTS[difficulty] : 0;
  } else if (mode === 'survival') {
    // 過了幾關；每關先到 5 分，一關至少要打 40 秒
    rallies = v.int(body.rallies, 'rallies', 0, 30, '關數');
    if (durationMs < rallies * 40_000) throw bad('implausible_result', '這場的成績不太合理，沒有記錄');
    won = rallies > 0;
    points = Math.min(rallies, SURVIVAL_POINTS_CAP);
  } else {
    rallies = v.int(body.rallies, 'rallies', 0, 2000, '拍數');
    if (durationMs < rallies * 800) throw bad('implausible_result', '這場的成績不太合理，沒有記錄');
  }
  // 每日挑戰一天只記一次（台北時間）
  if (mode === 'daily') {
    const dayStart = Math.floor((now + 8 * HOUR) / DAY) * DAY - 8 * HOUR;
    const dup = await env.DB.prepare(`SELECT 1 FROM arcade_results WHERE player_id = ?1 AND mode = 'daily' AND created_at >= ?2 LIMIT 1`).bind(playerId, dayStart).first();
    if (dup) throw bad('daily_done', '今天的挑戰已經記過了');
  }
  await env.DB.prepare(
    `INSERT INTO arcade_results (player_id, week, mode, difficulty, doubles, specials, venue, won, score_me, score_opp, rallies, points, duration_ms, created_at, longest_rally, character, paddle)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)`,
  )
    .bind(playerId, weekOf(now), mode, difficulty, doubles ? 1 : 0, specials ? 1 : 0, venue, won ? 1 : 0, scoreMe, scoreOpp, rallies, points, durationMs, now, longestRally, character, paddle)
    .run();
  return { points, week: weekOf(now) };
}

// ---------- 排行榜 ----------

/** 每個榜的「這位球友的歷史累計值」 */
const VALUE: Record<Board, string> = {
  points: `SUM(r.points)`,
  pro: `SUM(r.won AND r.difficulty = 'pro')`,
  dink: `MAX(CASE WHEN r.mode = 'dink' THEN r.rallies ELSE 0 END)`,
  survival: `MAX(CASE WHEN r.mode = 'survival' THEN r.rallies ELSE 0 END)`,
};

export async function leaderboard(env: Env, board: string, playerId: string | null, now: number) {
  if (!(BOARDS as readonly string[]).includes(board)) throw notFound('沒有這個排行榜');
  const b = board as Board;
  const { results } = await env.DB.prepare(
    `SELECT p.nickname, p.avatar_seed, r.player_id, ${VALUE[b]} AS value, ${AGG}
       FROM arcade_results r JOIN players p ON p.id = r.player_id
      WHERE p.deleted_at IS NULL
      GROUP BY r.player_id
     HAVING value > 0
      ORDER BY value DESC, MIN(r.created_at) ASC
      LIMIT 50`,
  ).all<{ nickname: string; avatar_seed: number; player_id: string; value: number } & AggRow>();
  const rows = results.map((r, i) => ({ rank: i + 1, id: r.player_id, nickname: r.nickname, avatarSeed: r.avatar_seed, value: r.value, isMe: r.player_id === playerId, ...aggOut(r) }));
  let me: { rank: number | null; value: number } | null = null;
  if (playerId) {
    const mine = await env.DB.prepare(`SELECT ${VALUE[b]} AS value FROM arcade_results r WHERE r.player_id = ?1`).bind(playerId).first<{ value: number | null }>();
    const value = mine?.value ?? 0;
    let rank: number | null = null;
    if (value > 0) {
      const above = await env.DB.prepare(
        `SELECT COUNT(*) AS n FROM (SELECT ${VALUE[b]} AS value FROM arcade_results r JOIN players p ON p.id = r.player_id
            WHERE p.deleted_at IS NULL GROUP BY r.player_id HAVING value > ?1)`,
      )
        .bind(value)
        .first<{ n: number }>();
      rank = (above?.n ?? 0) + 1;
    }
    me = { rank, value };
  }
  // 歷史累計：since 是最早一筆成績的時間（畫面上寫「自 X 月起」）
  const first = await env.DB.prepare(`SELECT MIN(created_at) AS t FROM arcade_results`).first<{ t: number | null }>();
  void now;
  return { board: b, since: first?.t ?? null, rows, me };
}

// ---------- 球友卡 ----------

/** 每位球友的累計數字（排行榜每一行和球友卡共用） */
const AGG = `
  SUM(r.mode IN ('match','daily') AND r.won) AS wins,
  SUM(r.mode IN ('match','daily')) AS plays,
  SUM(r.won AND r.difficulty = 'pro' AND r.mode IN ('match','daily')) AS pro_wins,
  SUM(r.points) AS points,
  MAX(CASE WHEN r.mode = 'dink' THEN r.rallies ELSE 0 END) AS dink_best,
  MAX(CASE WHEN r.mode = 'survival' THEN r.rallies ELSE 0 END) AS survival_best,
  MAX(r.longest_rally) AS longest_rally,
  SUM(r.mode = 'daily') AS dailies,
  MIN(r.created_at) AS first_at`;
interface AggRow {
  wins: number | null;
  plays: number | null;
  pro_wins: number | null;
  points: number | null;
  dink_best: number | null;
  survival_best: number | null;
  longest_rally: number | null;
  dailies: number | null;
  first_at: number | null;
}
const aggOut = (r: AggRow) => ({
  wins: r.wins ?? 0,
  plays: r.plays ?? 0,
  proWins: r.pro_wins ?? 0,
  points: r.points ?? 0,
  dinkBest: r.dink_best ?? 0,
  survivalBest: r.survival_best ?? 0,
  longestRally: r.longest_rally ?? 0,
  dailies: r.dailies ?? 0,
  firstAt: r.first_at ?? null,
});

/** 最常出現的值（場地、選手、球拍） */
const favorite = async (env: Env, playerId: string, col: 'venue' | 'character' | 'paddle') => {
  const r = await env.DB.prepare(`SELECT ${col} AS v, COUNT(*) AS n FROM arcade_results WHERE player_id = ?1 AND ${col} IS NOT NULL GROUP BY ${col} ORDER BY n DESC LIMIT 1`)
    .bind(playerId)
    .first<{ v: string; n: number }>();
  return r ? { value: r.v, count: r.n } : null;
};

/** 公開的球友卡：暱稱、加入時間、累計數字、最愛、最近幾場 */
export async function playerCard(env: Env, id: string) {
  const p = await env.DB.prepare(`SELECT nickname, avatar_seed, created_at FROM players WHERE id = ?1 AND deleted_at IS NULL`)
    .bind(id)
    .first<{ nickname: string; avatar_seed: number; created_at: number }>();
  if (!p) throw notFound('找不到這位球友');
  const agg = await env.DB.prepare(`SELECT ${AGG} FROM arcade_results r WHERE r.player_id = ?1`).bind(id).first<AggRow>();
  const byDiff = await env.DB.prepare(
    `SELECT difficulty, SUM(won) AS wins, COUNT(*) AS plays FROM arcade_results WHERE player_id = ?1 AND mode IN ('match','daily') GROUP BY difficulty`,
  )
    .bind(id)
    .all<{ difficulty: string; wins: number; plays: number }>();
  const { results: recent } = await env.DB.prepare(
    `SELECT mode, difficulty, venue, won, score_me, score_opp, rallies, created_at FROM arcade_results WHERE player_id = ?1 ORDER BY created_at DESC LIMIT 8`,
  )
    .bind(id)
    .all<{ mode: string; difficulty: string; venue: string; won: number; score_me: number; score_opp: number; rallies: number; created_at: number }>();
  const [favVenue, favCharacter, favPaddle] = await Promise.all([favorite(env, id, 'venue'), favorite(env, id, 'character'), favorite(env, id, 'paddle')]);
  return {
    nickname: p.nickname,
    avatarSeed: p.avatar_seed,
    joinedAt: p.created_at,
    ...aggOut(agg ?? ({} as AggRow)),
    byDifficulty: Object.fromEntries(byDiff.results.map((d) => [d.difficulty, { wins: d.wins, plays: d.plays }])),
    favVenue,
    favCharacter,
    favPaddle,
    recent: recent.map((x) => ({ mode: x.mode, difficulty: x.difficulty, venue: x.venue, won: !!x.won, score: [x.score_me, x.score_opp], rallies: x.rallies, at: x.created_at })),
  };
}

/** 刪除球友資料時一併刪除遊戲存檔與成績 */
export const deleteArcade = (env: Env, playerId: string) => [
  env.DB.prepare(`DELETE FROM arcade_profiles WHERE player_id = ?1`).bind(playerId),
  env.DB.prepare(`DELETE FROM arcade_results WHERE player_id = ?1`).bind(playerId),
];

