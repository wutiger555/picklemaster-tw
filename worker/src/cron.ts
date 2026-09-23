import type { Env } from './env';
import { createGame, DAY, HOUR, WEEK, type GameInput, type GameRow } from './games';

// 人數不足時，開打前幾小時自動取消（規劃：3 小時）
export const AUTO_CANCEL_HOURS = 3;
const RETENTION = 365 * DAY;

// 每 5 分鐘：自動取消、結束、產生下一場固定團
export async function runMaintenance(env: Env, now: number) {
  // 1. 人數不足自動取消（不算團主取消紀錄）
  const cancelled = await env.DB.prepare(
    `UPDATE games SET status = 'auto_cancelled', cancel_reason = 'not_enough', updated_at = ?1
      WHERE status = 'open' AND starts_at - ?2 <= ?1 AND starts_at > ?1
        AND (SELECT COUNT(*) FROM game_players WHERE game_id = games.id AND status = 'confirmed') < min_players
     RETURNING id`,
  )
    .bind(now, AUTO_CANCEL_HOURS * HOUR)
    .all<{ id: string }>();

  // 2. 打完的團標為結束
  const finished = await env.DB.prepare(
    `UPDATE games SET status = 'finished', updated_at = ?1
      WHERE status = 'open' AND starts_at + duration_min * 60000 <= ?1
     RETURNING id`,
  )
    .bind(now)
    .all<{ id: string }>();

  // 3. 每週固定團：這一場開打後，就開好下一週那場（像 LINE 接龍打完就發下週的）
  const { results: due } = await env.DB.prepare(
    `SELECT g.* FROM games g
      WHERE g.recur_weekly = 1 AND g.series_id IS NOT NULL AND g.starts_at <= ?1
        AND g.status IN ('open', 'finished', 'auto_cancelled', 'cancelled')
        AND NOT EXISTS (SELECT 1 FROM games n WHERE n.series_id = g.series_id AND n.starts_at > g.starts_at)
        AND EXISTS (SELECT 1 FROM players p WHERE p.id = g.host_id AND p.deleted_at IS NULL)`,
  )
    .bind(now)
    .all<GameRow>();
  let created = 0;
  for (const g of due) {
    // 被取消的那一場只要沒勾「結束固定團」（recur_weekly 會被設成 0），下週照常開
    let next = g.starts_at + WEEK;
    while (next <= now) next += WEEK;
    const input: GameInput = {
      courtId: g.court_id,
      title: g.title,
      startsAt: next,
      durationMin: g.duration_min,
      courtsBooked: g.courts_booked,
      capacity: g.capacity,
      minPlayers: g.min_players,
      levelMin: g.level_min,
      levelMax: g.level_max,
      format: g.format,
      scoring: g.scoring,
      feeTotal: g.fee_total,
      feeNote: g.fee_note,
      beginner: !!g.beginner,
      cancelHours: g.cancel_hours,
      communityUrl: g.community_url,
      note: g.note,
      recurWeekly: true,
    };
    await createGame(env, g.host_id, input, now, g);
    created++;
  }
  return { autoCancelled: cancelled.results.length, finished: finished.results.length, seriesCreated: created };
}

// 每天一次：清頻率限制紀錄、刪除一年前的團（個資只留一年）
export async function runDaily(env: Env, now: number) {
  const cutoff = now - RETENTION;
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM rate_limits WHERE window_start < ?1`).bind(now - 2 * DAY),
    // 評論只顯示近一年，兩年前的直接刪
    env.DB.prepare(`DELETE FROM court_reviews WHERE updated_at < ?1`).bind(now - 2 * RETENTION),
    // 「我會去」只對當次球敘有意義，過了兩天就刪
    env.DB.prepare(`DELETE FROM session_interests WHERE date < ?1`).bind(new Date(now + 8 * 3600_000 - 2 * DAY).toISOString().slice(0, 10)),
    env.DB.prepare(`DELETE FROM game_players WHERE game_id IN (SELECT id FROM games WHERE starts_at < ?1)`).bind(cutoff),
    env.DB.prepare(`DELETE FROM reports WHERE game_id IN (SELECT id FROM games WHERE starts_at < ?1)`).bind(cutoff),
    env.DB.prepare(`DELETE FROM games WHERE starts_at < ?1`).bind(cutoff),
  ]);
}

