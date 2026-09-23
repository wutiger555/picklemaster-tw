import type { Env } from './env';
import { base64url, randomBytes, randomCode, sha256hex, signToken } from './crypto';
import { bad, notFound } from './errors';
import { promoteAll, publicGame, type GameRow } from './games';
import * as v from './validate';

interface PlayerRow {
  id: string;
  nickname: string;
  avatar_seed: number;
  level: string | null;
  dupr: string | null;
  created_at: number;
  deleted_at: number | null;
}

const pub = (p: PlayerRow) => ({
  nickname: p.nickname,
  avatarSeed: p.avatar_seed,
  level: p.level,
  dupr: p.dupr,
  createdAt: p.created_at,
});

export async function createPlayer(env: Env, body: Record<string, unknown>, now: number) {
  const nickname = v.text(body.nickname, 'nickname', 1, 12, '暱稱');
  const avatarSeed = v.int(body.avatarSeed ?? 0, 'avatar_seed', 0, 1_000_000, '頭像');
  const level = body.level === undefined || body.level === null ? null : v.oneOf(body.level, 'level', v.LEVELS, '程度');
  const id = base64url(randomBytes(16));
  await env.DB.prepare(`INSERT INTO players (id, nickname, avatar_seed, level, created_at) VALUES (?1, ?2, ?3, ?4, ?5)`)
    .bind(id, nickname, avatarSeed, level, now)
    .run();
  return { token: await signToken(env.TOKEN_SECRET, id), player: { nickname, avatarSeed, level, dupr: null, createdAt: now } };
}

async function loadPlayer(env: Env, id: string): Promise<PlayerRow> {
  const p = await env.DB.prepare(`SELECT * FROM players WHERE id = ?1 AND deleted_at IS NULL`).bind(id).first<PlayerRow>();
  if (!p) throw notFound('找不到你的球友資料');
  return p;
}

export async function getMe(env: Env, id: string, now: number) {
  const p = await loadPlayer(env, id);
  const { results } = await env.DB.prepare(
    `SELECT g.*, gp.status AS my_status
       FROM game_players gp JOIN games g ON g.id = gp.game_id
      WHERE gp.player_id = ?1 AND gp.status IN ('confirmed', 'waitlist') AND g.starts_at > ?2 - 3 * 3600000
      ORDER BY g.starts_at LIMIT 50`,
  )
    .bind(id, now)
    .all<GameRow & { my_status: string }>();
  const stats = await env.DB.prepare(
    `SELECT COALESCE(SUM(gp.status = 'attended' OR (gp.status = 'confirmed' AND g.status = 'finished')), 0) AS played,
            COALESCE(SUM(g.host_id = ?1 AND g.status IN ('open', 'finished')), 0) AS hosted
       FROM game_players gp JOIN games g ON g.id = gp.game_id
      WHERE gp.player_id = ?1`,
  )
    .bind(id)
    .first<{ played: number | null; hosted: number | null }>();
  return {
    player: pub(p),
    stats: { played: stats?.played ?? 0, hosted: stats?.hosted ?? 0 },
    games: results.map((g) => ({ ...publicGame(g), myStatus: g.my_status, isHost: g.host_id === id })),
  };
}

export async function updateMe(env: Env, id: string, body: Record<string, unknown>) {
  await loadPlayer(env, id);
  const sets: string[] = [];
  const vals: unknown[] = [];
  const set = (col: string, val: unknown) => {
    vals.push(val);
    sets.push(`${col} = ?${vals.length + 1}`);
  };
  if ('nickname' in body) set('nickname', v.text(body.nickname, 'nickname', 1, 12, '暱稱'));
  if ('avatarSeed' in body) set('avatar_seed', v.int(body.avatarSeed, 'avatar_seed', 0, 1_000_000, '頭像'));
  if ('level' in body) set('level', body.level === null ? null : v.oneOf(body.level, 'level', v.LEVELS, '程度'));
  if ('dupr' in body) set('dupr', v.dupr(body.dupr));
  if (!sets.length) throw bad('nothing_to_update', '沒有要修改的內容');
  await env.DB.prepare(`UPDATE players SET ${sets.join(', ')} WHERE id = ?1`).bind(id, ...vals).run();
  return pub(await loadPlayer(env, id));
}

// 球友碼：8 碼、去掉容易看錯的字元，顯示成 PK-XXXX-XXXX。只存雜湊，用過一次就失效。
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const normalizeCode = (s: string) => {
  const t = s.toUpperCase().replace(/[^0-9A-Z]/g, '');
  // 只有帶著 PK 前綴（共 10 碼）時才去掉，碼本身也可能以 PK 開頭
  return t.length === 10 && t.startsWith('PK') ? t.slice(2) : t;
};

export async function issueCode(env: Env, id: string) {
  await loadPlayer(env, id);
  const raw = randomCode(8, CODE_ALPHABET);
  await env.DB.prepare(`UPDATE players SET code_hash = ?2 WHERE id = ?1`).bind(id, await sha256hex(raw)).run();
  return { code: `PK-${raw.slice(0, 4)}-${raw.slice(4)}` };
}

export async function claimCode(env: Env, body: Record<string, unknown>) {
  const input = typeof body.code === 'string' ? normalizeCode(body.code) : '';
  if (input.length !== 8) throw bad('invalid_code', '球友碼是 8 碼，格式像 PK-7F3Q-92AB');
  const row = await env.DB.prepare(
    `UPDATE players SET code_hash = NULL WHERE code_hash = ?1 AND deleted_at IS NULL RETURNING *`,
  )
    .bind(await sha256hex(input))
    .first<PlayerRow>();
  if (!row) throw notFound('這組球友碼不存在，或已經用過了。請在舊手機重新產生一組');
  return { token: await signToken(env.TOKEN_SECRET, row.id), player: pub(row) };
}

// 刪除我的資料：暱稱清掉、未來的報名全部取消（空出來的位子由候補遞補）、自己開的未來團取消
export async function deleteMe(env: Env, id: string, now: number) {
  await loadPlayer(env, id);
  const { results } = await env.DB.prepare(
    `SELECT gp.game_id FROM game_players gp JOIN games g ON g.id = gp.game_id
      WHERE gp.player_id = ?1 AND gp.status IN ('confirmed', 'waitlist') AND g.status = 'open' AND g.host_id <> ?1`,
  )
    .bind(id)
    .all<{ game_id: string }>();
  await env.DB.batch([
    env.DB.prepare(`UPDATE games SET status = 'cancelled', cancel_reason = 'host_deleted', recur_weekly = 0, updated_at = ?2 WHERE host_id = ?1 AND status = 'open'`).bind(id, now),
    env.DB.prepare(
      `UPDATE game_players SET status = 'cancelled', updated_at = ?2
        WHERE player_id = ?1 AND status IN ('confirmed', 'waitlist')
          AND game_id IN (SELECT id FROM games WHERE status = 'open')`,
    ).bind(id, now),
    env.DB.prepare(`DELETE FROM session_interests WHERE player_id = ?1`).bind(id),
    env.DB.prepare(`DELETE FROM court_reviews WHERE player_id = ?1`).bind(id),
    env.DB.prepare(`UPDATE players SET nickname = '已刪除的球友', avatar_seed = 0, level = NULL, dupr = NULL, code_hash = NULL, deleted_at = ?2 WHERE id = ?1`).bind(id, now),
  ]);
  for (const r of results) await promoteAll(env, r.game_id, now);
}
