import type { Env } from './env';
import { getCourt } from './courts';
import { validateTags } from '../../src/utils/courtTags';
import { bad, notFound } from './errors';

// 只算近一年的評論：球場會整修、會換經營方式，太舊的評價反而誤導人
export const REVIEW_WINDOW = 365 * 86400_000;

function courtOr404(id: number) {
  const c = Number.isInteger(id) ? getCourt(id) : undefined;
  if (!c) throw notFound('找不到這座球場');
  return c;
}

export async function getReviews(env: Env, courtId: number, viewerId: string | null, now: number) {
  courtOr404(courtId);
  const { results } = await env.DB.prepare(
    `SELECT player_id, tags, updated_at FROM court_reviews WHERE court_id = ?1 AND updated_at > ?2`,
  )
    .bind(courtId, now - REVIEW_WINDOW)
    .all<{ player_id: string; tags: string; updated_at: number }>();
  const counts = new Map<string, number>();
  let mine: string[] | null = null;
  let updatedAt = 0;
  for (const r of results) {
    const tags = JSON.parse(r.tags) as string[];
    for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    if (r.player_id === viewerId) mine = tags;
    updatedAt = Math.max(updatedAt, r.updated_at);
  }
  return {
    courtId,
    total: results.length,
    tags: [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count })),
    updatedAt: updatedAt || null,
    mine,
  };
}

export async function putReview(env: Env, courtId: number, playerId: string, body: Record<string, unknown>, now: number) {
  courtOr404(courtId);
  const err = validateTags(body.tags);
  if (err) throw bad('invalid_tags', err);
  await env.DB.prepare(
    `INSERT INTO court_reviews (court_id, player_id, tags, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)
     ON CONFLICT (court_id, player_id) DO UPDATE SET tags = excluded.tags, updated_at = excluded.updated_at`,
  )
    .bind(courtId, playerId, JSON.stringify(body.tags), now)
    .run();
  return getReviews(env, courtId, playerId, now);
}

export async function deleteReview(env: Env, courtId: number, playerId: string, now: number) {
  courtOr404(courtId);
  await env.DB.prepare(`DELETE FROM court_reviews WHERE court_id = ?1 AND player_id = ?2`).bind(courtId, playerId).run();
  return getReviews(env, courtId, playerId, now);
}
