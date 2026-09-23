import type { Env } from './env';
import data from '../../public/data/courts.json';
import { getFixedSessions, hasSessionOn, taipeiDate, type FixedSession } from '../../src/utils/fixedSessions';
import type { Court } from '../../src/types';
import { bad, notFound } from './errors';
import * as v from './validate';

// 固定球敘的解析規則跟前端共用同一支檔案，Worker 才能驗證「這天這座球場真的有球敘」
const SESSIONS = new Map<number, FixedSession>(getFixedSessions((data as { courts: Court[] }).courts).map((s) => [s.courtId, s]));
const DAY = 86400_000;
const MAX_DAYS = 14;

const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

export async function listInterests(env: Env, from: string, to: string, viewerId: string | null) {
  if (!isDate(from) || !isDate(to) || from > to) throw bad('invalid_range', '日期範圍格式不正確');
  const { results } = await env.DB.prepare(
    `SELECT court_id, date, COUNT(*) AS n, MAX(player_id = ?3) AS mine
       FROM session_interests WHERE date BETWEEN ?1 AND ?2
      GROUP BY court_id, date`,
  )
    .bind(from, to, viewerId ?? '')
    .all<{ court_id: number; date: string; n: number; mine: number }>();
  return results.map((r) => ({ courtId: r.court_id, date: r.date, count: r.n, mine: !!r.mine }));
}

export async function setInterest(env: Env, playerId: string, body: Record<string, unknown>, now: number) {
  const courtId = v.int(body.courtId, 'court', 1, 1_000_000, '球場');
  const date = body.date;
  if (!isDate(date)) throw bad('invalid_date', '日期格式不正確');
  const session = SESSIONS.get(courtId);
  if (!session) throw notFound('這座球場沒有固定球敘');
  const today = taipeiDate(now);
  const last = taipeiDate(now + (MAX_DAYS - 1) * DAY);
  if (date < today || date > last) throw bad('date_out_of_range', `只能表示今天到 ${MAX_DAYS} 天內的球敘`);
  if (!hasSessionOn(session, date)) throw bad('no_session', '這一天這座球場沒有球敘');

  if (body.going === false) {
    await env.DB.prepare(`DELETE FROM session_interests WHERE court_id = ?1 AND date = ?2 AND player_id = ?3`).bind(courtId, date, playerId).run();
  } else {
    await env.DB.prepare(`INSERT OR IGNORE INTO session_interests (court_id, date, player_id, created_at) VALUES (?1, ?2, ?3, ?4)`)
      .bind(courtId, date, playerId, now)
      .run();
  }
  const r = await env.DB.prepare(`SELECT COUNT(*) AS n FROM session_interests WHERE court_id = ?1 AND date = ?2`).bind(courtId, date).first<{ n: number }>();
  return { courtId, date, count: r?.n ?? 0, mine: body.going !== false };
}
