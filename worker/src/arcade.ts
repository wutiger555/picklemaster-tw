import type { Env } from './env';
import { bad, notFound } from './errors';
import * as v from './validate';

/**
 * 匹克硬邦幫（/game）：雲端存檔與每週排行榜。
 * 遊戲在玩家的瀏覽器裡跑，成績無法完全防偽：這裡只擋明顯不合理的成績（比分不合規則、時間太短），
 * 排行榜每週歸零，作弊頂多霸榜一週。
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
  let won = false;
  let scoreMe = 0;
  let scoreOpp = 0;
  let rallies = 0;
  let points = 0;
  if (mode === 'match' || mode === 'daily') {
    scoreMe = v.int(body.scoreMe, 'score_me', 0, 40, '比分');
    scoreOpp = v.int(body.scoreOpp, 'score_opp', 0, 40, '比分');
    won = scoreMe > scoreOpp;
    // 15 分週：先到 15 贏 2 分
    const target = scoreMe >= 15 || scoreOpp >= 15 ? 15 : 11;
    const ok = won ? validMatchScore(scoreMe, scoreOpp, target) : validMatchScore(scoreOpp, scoreMe, target);
    // 每一分至少要打幾秒（發球＋回球）；換發球制實際打的分數比總分多，所以這是很寬鬆的下限
    if (!ok || durationMs < (scoreMe + scoreOpp) * 4000) throw bad('implausible_result', '這場的成績不太合理，沒有記錄');
    // 每日挑戰：達成（贏）才會送上來，給固定積分
    if (mode === 'daily' && !won) throw bad('implausible_result', '每日挑戰要達成才算');
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
  await env.DB.prepare(
    `INSERT INTO arcade_results (player_id, week, mode, difficulty, doubles, specials, venue, won, score_me, score_opp, rallies, points, duration_ms, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)`,
  )
    .bind(playerId, weekOf(now), mode, difficulty, doubles ? 1 : 0, specials ? 1 : 0, venue, won ? 1 : 0, scoreMe, scoreOpp, rallies, points, durationMs, now)
    .run();
  return { points, week: weekOf(now) };
}

// ---------- 排行榜 ----------

/** 每個榜的「這位球友本週的值」 */
const VALUE: Record<Board, string> = {
  points: `SUM(r.points)`,
  pro: `SUM(r.won AND r.difficulty = 'pro')`,
  dink: `MAX(CASE WHEN r.mode = 'dink' THEN r.rallies ELSE 0 END)`,
  survival: `MAX(CASE WHEN r.mode = 'survival' THEN r.rallies ELSE 0 END)`,
};

export async function leaderboard(env: Env, board: string, playerId: string | null, now: number) {
  if (!(BOARDS as readonly string[]).includes(board)) throw notFound('沒有這個排行榜');
  const b = board as Board;
  const week = weekOf(now);
  const { results } = await env.DB.prepare(
    `SELECT p.nickname, p.avatar_seed, r.player_id, ${VALUE[b]} AS value
       FROM arcade_results r JOIN players p ON p.id = r.player_id
      WHERE r.week = ?1 AND p.deleted_at IS NULL
      GROUP BY r.player_id
     HAVING value > 0
      ORDER BY value DESC, MIN(r.created_at) ASC
      LIMIT 50`,
  )
    .bind(week)
    .all<{ nickname: string; avatar_seed: number; player_id: string; value: number }>();
  const rows = results.map((r, i) => ({ rank: i + 1, nickname: r.nickname, avatarSeed: r.avatar_seed, value: r.value, isMe: r.player_id === playerId }));
  let me: { rank: number | null; value: number } | null = null;
  if (playerId) {
    const mine = await env.DB.prepare(`SELECT ${VALUE[b]} AS value FROM arcade_results r WHERE r.week = ?1 AND r.player_id = ?2`)
      .bind(week, playerId)
      .first<{ value: number | null }>();
    const value = mine?.value ?? 0;
    let rank: number | null = null;
    if (value > 0) {
      const above = await env.DB.prepare(
        `SELECT COUNT(*) AS n FROM (SELECT ${VALUE[b]} AS value FROM arcade_results r JOIN players p ON p.id = r.player_id
            WHERE r.week = ?1 AND p.deleted_at IS NULL GROUP BY r.player_id HAVING value > ?2)`,
      )
        .bind(week, value)
        .first<{ n: number }>();
      rank = (above?.n ?? 0) + 1;
    }
    me = { rank, value };
  }
  return { board: b, week, resetsAt: week + WEEK, rows, me };
}

/** 刪除球友資料時一併刪除遊戲存檔與成績 */
export const deleteArcade = (env: Env, playerId: string) => [
  env.DB.prepare(`DELETE FROM arcade_profiles WHERE player_id = ?1`).bind(playerId),
  env.DB.prepare(`DELETE FROM arcade_results WHERE player_id = ?1`).bind(playerId),
];

