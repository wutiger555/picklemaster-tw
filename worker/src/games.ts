import type { Env } from './env';
import { getCourt } from './courts';
import { randomCode, base64url, randomBytes, sha256hex } from './crypto';
import { bad, conflict, forbidden, notFound } from './errors';
import * as v from './validate';

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export interface GameRow {
  id: string;
  court_id: number;
  host_id: string;
  title: string;
  starts_at: number;
  duration_min: number;
  courts_booked: number;
  capacity: number;
  min_players: number;
  level_min: number | null;
  level_max: number | null;
  format: string;
  scoring: string;
  fee_total: number;
  fee_note: string | null;
  beginner: number;
  cancel_hours: number;
  community_url: string | null;
  note: string | null;
  recur_weekly: number;
  series_id: string | null;
  manage_key_hash: string;
  status: string;
  cancel_reason: string | null;
  hidden: number;
  created_at: number;
  updated_at: number;
}

// ---------- 建立 ----------

export interface GameInput {
  courtId: number;
  title: string;
  startsAt: number;
  durationMin: number;
  courtsBooked: number;
  capacity: number;
  minPlayers: number;
  levelMin: number | null;
  levelMax: number | null;
  format: string;
  scoring: string;
  feeTotal: number;
  feeNote: string | null;
  beginner: boolean;
  cancelHours: number;
  communityUrl: string | null;
  note: string | null;
  recurWeekly: boolean;
}

export function parseGameInput(body: Record<string, unknown>, now: number): GameInput {
  const courtId = v.int(body.courtId, 'court', 1, 1_000_000, '球場');
  const court = getCourt(courtId);
  if (!court) throw bad('unknown_court', '找不到這座球場，請從站上的球場清單選擇');
  if (court.closed) throw bad('court_closed', '這座球場目前沒有營業，請換一座球場');

  const startsAt = v.int(body.startsAt, 'starts_at', 0, Number.MAX_SAFE_INTEGER, '開打時間');
  if (startsAt < now + 10 * 60_000) throw bad('starts_too_soon', '開打時間至少要在 10 分鐘之後');
  if (startsAt > now + 60 * DAY) throw bad('starts_too_far', '最多只能開 60 天內的團');

  const courtsBooked = v.int(body.courtsBooked ?? 1, 'courts_booked', 1, Math.max(1, Math.min(court.courtsCount, 12)), '場地面數');
  const capacity = v.int(body.capacity, 'capacity', 2, courtsBooked * 8, '人數上限');
  const minPlayers = v.int(body.minPlayers ?? Math.min(4, capacity), 'min_players', 2, capacity, '最低成團人數');
  const levelMin = v.level(body.levelMin, 'level_min');
  const levelMax = v.level(body.levelMax, 'level_max');
  if (levelMin !== null && levelMax !== null && levelMin > levelMax) throw bad('invalid_level', '程度下限不能高於上限');

  return {
    courtId,
    title: v.text(body.title, 'title', 2, 40, '團名'),
    startsAt,
    durationMin: v.int(body.durationMin ?? 120, 'duration', 30, 480, '打球時間（分鐘）'),
    courtsBooked,
    capacity,
    minPlayers,
    levelMin,
    levelMax,
    format: v.oneOf(body.format ?? 'rotation', 'format', v.FORMATS, '賽制'),
    scoring: v.oneOf(body.scoring ?? 'side_out_11', 'scoring', v.SCORINGS, '計分方式'),
    feeTotal: v.int(body.feeTotal ?? 0, 'fee_total', 0, 100_000, '場租總額'),
    feeNote: v.optText(body.feeNote, 'fee_note', 60, '費用說明'),
    beginner: v.bool(body.beginner),
    cancelHours: v.int(body.cancelHours ?? 6, 'cancel_hours', 0, 48, '取消截止時數'),
    communityUrl: v.communityUrl(body.communityUrl),
    note: v.optText(body.note, 'note', 300, '備註'),
    recurWeekly: v.bool(body.recurWeekly),
  };
}

export async function createGame(env: Env, hostId: string, input: GameInput, now: number, seriesFrom?: GameRow) {
  const id = randomCode(10);
  let manageKey: string | null = null;
  let manageKeyHash: string;
  if (seriesFrom) {
    // 每週固定團的下一場沿用同一把管理密鑰，團主原本的管理連結繼續有效
    manageKeyHash = seriesFrom.manage_key_hash;
  } else {
    manageKey = base64url(randomBytes(24));
    manageKeyHash = await sha256hex(manageKey);
  }
  const seriesId = input.recurWeekly ? (seriesFrom?.series_id ?? id) : null;

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO games (id, court_id, host_id, title, starts_at, duration_min, courts_booked, capacity, min_players,
         level_min, level_max, format, scoring, fee_total, fee_note, beginner, cancel_hours, community_url, note,
         recur_weekly, series_id, manage_key_hash, status, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, 'open', ?23, ?23)`,
    ).bind(
      id, input.courtId, hostId, input.title, input.startsAt, input.durationMin, input.courtsBooked, input.capacity,
      input.minPlayers, input.levelMin, input.levelMax, input.format, input.scoring, input.feeTotal, input.feeNote,
      input.beginner ? 1 : 0, input.cancelHours, input.communityUrl, input.note, input.recurWeekly ? 1 : 0, seriesId,
      manageKeyHash, now,
    ),
    // 團主自動佔第一個位子
    env.DB.prepare(
      `INSERT INTO game_players (game_id, player_id, status, joined_at, updated_at) VALUES (?1, ?2, 'confirmed', ?3, ?3)`,
    ).bind(id, hostId, now),
  ]);
  return { id, manageKey };
}

// ---------- 讀取 ----------

export async function loadGame(env: Env, id: string): Promise<GameRow> {
  const g = await env.DB.prepare(`SELECT * FROM games WHERE id = ?1`).bind(id).first<GameRow>();
  if (!g) throw notFound();
  return g;
}

export async function isHost(g: GameRow, playerId: string | null, manageKey: string | undefined) {
  if (playerId && playerId === g.host_id) return true;
  if (manageKey && (await sha256hex(manageKey)) === g.manage_key_hash) return true;
  return false;
}

interface RosterRow {
  player_id: string;
  status: string;
  joined_at: number;
  nickname: string;
  avatar_seed: number;
  level: string | null;
}

export async function gameDetail(env: Env, g: GameRow, viewerId: string | null, viewerIsHost: boolean) {
  const { results } = await env.DB.prepare(
    `SELECT gp.player_id, gp.status, gp.joined_at, p.nickname, p.avatar_seed, p.level
       FROM game_players gp JOIN players p ON p.id = gp.player_id
      WHERE gp.game_id = ?1 AND gp.status IN ('confirmed', 'waitlist', 'attended', 'no_show')
      ORDER BY gp.joined_at, gp.player_id`,
  )
    .bind(g.id)
    .all<RosterRow>();
  const host = await env.DB.prepare(
    `SELECT p.nickname, p.avatar_seed,
            (SELECT COUNT(*) FROM games WHERE host_id = p.id AND status IN ('open', 'finished')) AS hosted
       FROM players p WHERE p.id = ?1`,
  )
    .bind(g.host_id)
    .first<{ nickname: string; avatar_seed: number; hosted: number }>();

  // 名單只給暱稱與頭像，不外流球友 ID
  const pub = (r: RosterRow) => ({ nickname: r.nickname, avatarSeed: r.avatar_seed, level: r.level, isMe: r.player_id === viewerId, isHost: r.player_id === g.host_id });
  const confirmed = results.filter((r) => r.status === 'confirmed' || r.status === 'attended' || r.status === 'no_show').map(pub);
  const waitlist = results.filter((r) => r.status === 'waitlist').map(pub);
  const mine = viewerId ? await myStatus(env, g.id, viewerId) : null;

  return {
    ...publicGame(g),
    host: host ? { nickname: host.nickname, avatarSeed: host.avatar_seed, gamesHosted: host.hosted } : null,
    confirmed,
    waitlist,
    me: mine,
    viewerIsHost,
  };
}

export function publicGame(g: GameRow) {
  const court = getCourt(g.court_id);
  return {
    id: g.id,
    court: court ? { id: court.id, name: court.name, city: court.city, district: court.district, type: court.type, net: court.net } : { id: g.court_id },
    title: g.title,
    startsAt: g.starts_at,
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
    cancelDeadline: g.starts_at - g.cancel_hours * HOUR,
    communityUrl: g.community_url,
    note: g.note,
    recurWeekly: !!g.recur_weekly,
    status: g.status,
    cancelReason: g.cancel_reason,
  };
}

async function myStatus(env: Env, gameId: string, playerId: string) {
  const row = await env.DB.prepare(`SELECT status, joined_at FROM game_players WHERE game_id = ?1 AND player_id = ?2`)
    .bind(gameId, playerId)
    .first<{ status: string; joined_at: number }>();
  if (!row) return null;
  let position: number | null = null;
  if (row.status === 'waitlist') {
    const r = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM game_players
        WHERE game_id = ?1 AND status = 'waitlist' AND (joined_at < ?2 OR (joined_at = ?2 AND player_id <= ?3))`,
    )
      .bind(gameId, row.joined_at, playerId)
      .first<{ n: number }>();
    position = r?.n ?? null;
  }
  return { status: row.status, position };
}

export interface ListQuery {
  from: number;
  to: number;
  courtId?: number;
  city?: string;
}

export async function listGames(env: Env, q: ListQuery) {
  const { results } = await env.DB.prepare(
    `SELECT g.*,
            (SELECT COUNT(*) FROM game_players WHERE game_id = g.id AND status = 'confirmed') AS n_confirmed,
            (SELECT COUNT(*) FROM game_players WHERE game_id = g.id AND status = 'waitlist') AS n_waitlist,
            p.nickname AS host_nickname, p.avatar_seed AS host_seed
       FROM games g JOIN players p ON p.id = g.host_id
      WHERE g.status = 'open' AND g.hidden = 0 AND g.starts_at >= ?1 AND g.starts_at < ?2
        AND (?3 IS NULL OR g.court_id = ?3)
      ORDER BY g.starts_at
      LIMIT 200`,
  )
    .bind(q.from, q.to, q.courtId ?? null)
    .all<GameRow & { n_confirmed: number; n_waitlist: number; host_nickname: string; host_seed: number }>();
  return results
    .filter((g) => !q.city || getCourt(g.court_id)?.city === q.city)
    .map((g) => ({
      ...publicGame(g),
      confirmedCount: g.n_confirmed,
      waitlistCount: g.n_waitlist,
      host: { nickname: g.host_nickname, avatarSeed: g.host_seed },
    }));
}

// ---------- 報名 / 取消 ----------

// 名額判斷、寫入都在同一條 SQL 裡完成。D1 對同一個資料庫的寫入是逐條執行的，
// 所以 10 個人同時搶最後 1 個位子，只會有 1 個人拿到 confirmed。
const JOIN_SQL = `
INSERT INTO game_players (game_id, player_id, status, joined_at, updated_at)
SELECT g.id, ?2,
       CASE WHEN (SELECT COUNT(*) FROM game_players gp
                   WHERE gp.game_id = g.id AND gp.status = 'confirmed' AND gp.player_id <> ?2) < g.capacity
            THEN 'confirmed' ELSE 'waitlist' END,
       ?3, ?3
  FROM games g
 WHERE g.id = ?1 AND g.status = 'open' AND g.hidden = 0 AND g.starts_at > ?3
ON CONFLICT (game_id, player_id) DO UPDATE
   SET status = excluded.status, joined_at = excluded.joined_at, updated_at = excluded.updated_at
 WHERE game_players.status IN ('cancelled', 'late_cancel')
RETURNING status`;

// 有空位就讓候補第一位遞補；沒空位或不是 open 的團就什麼都不做
const PROMOTE_SQL = `
UPDATE game_players SET status = 'confirmed', updated_at = ?2
 WHERE game_id = ?1
   AND player_id = (SELECT player_id FROM game_players
                     WHERE game_id = ?1 AND status = 'waitlist'
                     ORDER BY joined_at, player_id LIMIT 1)
   AND (SELECT COUNT(*) FROM game_players WHERE game_id = ?1 AND status = 'confirmed')
       < (SELECT capacity FROM games WHERE id = ?1 AND status = 'open')
RETURNING player_id`;

const NEW_PLAYER_WINDOW = 7 * DAY;
const MAX_ACTIVE_NEW = 2;
const MAX_ACTIVE = 8;

export async function joinGame(env: Env, gameId: string, playerId: string, now: number) {
  const g = await loadGame(env, gameId);
  if (g.status !== 'open' || g.hidden) throw conflict('game_closed', '這一團已經取消或結束了');
  if (g.starts_at <= now) throw conflict('game_started', '這一團已經開打，不能再報名');

  const existing = await myStatus(env, gameId, playerId);
  if (existing && (existing.status === 'confirmed' || existing.status === 'waitlist')) return existing;

  const p = await env.DB.prepare(
    `SELECT p.created_at,
            (SELECT COUNT(*) FROM game_players gp JOIN games g ON g.id = gp.game_id
              WHERE gp.player_id = p.id AND gp.status IN ('confirmed', 'waitlist')
                AND g.status = 'open' AND g.starts_at > ?2) AS active
       FROM players p WHERE p.id = ?1 AND p.deleted_at IS NULL`,
  )
    .bind(playerId, now)
    .first<{ created_at: number; active: number }>();
  if (!p) throw notFound('找不到你的球友資料，請重新整理頁面');
  const limit = now - p.created_at < NEW_PLAYER_WINDOW ? MAX_ACTIVE_NEW : MAX_ACTIVE;
  if (p.active >= limit) {
    throw conflict('too_many_active', limit === MAX_ACTIVE_NEW ? `新球友第一週最多同時報名 ${MAX_ACTIVE_NEW} 團` : `最多同時報名 ${MAX_ACTIVE} 團`);
  }

  const row = await env.DB.prepare(JOIN_SQL).bind(gameId, playerId, now).first<{ status: string }>();
  if (!row) throw conflict('game_closed', '這一團剛剛關閉報名了');
  return myStatus(env, gameId, playerId);
}

export async function leaveGame(env: Env, gameId: string, playerId: string, now: number) {
  const g = await loadGame(env, gameId);
  if (g.host_id === playerId) throw conflict('host_cannot_leave', '團主不能退出自己的團；不打了的話，請改用「取消這一團」');
  const [left, promoted] = await env.DB.batch<{ status?: string; player_id?: string }>([
    env.DB.prepare(
      `UPDATE game_players
          SET status = CASE WHEN status = 'confirmed' AND ?3 > ?4 THEN 'late_cancel' ELSE 'cancelled' END,
              updated_at = ?3
        WHERE game_id = ?1 AND player_id = ?2 AND status IN ('confirmed', 'waitlist')
       RETURNING status`,
    ).bind(gameId, playerId, now, g.starts_at - g.cancel_hours * HOUR),
    env.DB.prepare(PROMOTE_SQL).bind(gameId, now),
  ]);
  const status = left.results[0]?.status;
  if (!status) throw conflict('not_joined', '你沒有報名這一團');
  return { status, promoted: promoted.results.length > 0 };
}

export async function promoteAll(env: Env, gameId: string, now: number) {
  // 容量變大時一次補滿；每輪最多補一位，上限 48 輪（容量上限）
  for (let i = 0; i < 48; i++) {
    const r = await env.DB.prepare(PROMOTE_SQL).bind(gameId, now).all();
    if (!r.results.length) break;
  }
}

// ---------- 團主修改 ----------

export async function updateGame(env: Env, g: GameRow, body: Record<string, unknown>, now: number) {
  if (g.status !== 'open') throw conflict('game_closed', '這一團已經取消或結束，不能再修改');

  if (body.status === 'cancelled') {
    const reason = v.oneOf(body.cancelReason ?? 'host', 'cancel_reason', ['host', 'weather'] as const, '取消原因');
    await env.DB.prepare(`UPDATE games SET status = 'cancelled', cancel_reason = ?2, recur_weekly = CASE WHEN ?3 THEN 0 ELSE recur_weekly END, updated_at = ?4 WHERE id = ?1`)
      .bind(g.id, reason, body.endSeries === true ? 1 : 0, now)
      .run();
    return;
  }

  const sets: string[] = [];
  const vals: unknown[] = [];
  const set = (col: string, val: unknown) => {
    vals.push(val);
    sets.push(`${col} = ?${vals.length + 1}`);
  };
  if ('title' in body) set('title', v.text(body.title, 'title', 2, 40, '團名'));
  if ('note' in body) set('note', v.optText(body.note, 'note', 300, '備註'));
  if ('feeTotal' in body) set('fee_total', v.int(body.feeTotal, 'fee_total', 0, 100_000, '場租總額'));
  if ('feeNote' in body) set('fee_note', v.optText(body.feeNote, 'fee_note', 60, '費用說明'));
  if ('communityUrl' in body) set('community_url', v.communityUrl(body.communityUrl));
  if ('beginner' in body) set('beginner', v.bool(body.beginner) ? 1 : 0);
  if ('recurWeekly' in body) set('recur_weekly', v.bool(body.recurWeekly) ? 1 : 0);
  let capacityChanged = false;
  if ('capacity' in body) {
    const cap = v.int(body.capacity, 'capacity', 2, g.courts_booked * 8, '人數上限');
    const n = await env.DB.prepare(`SELECT COUNT(*) AS n FROM game_players WHERE game_id = ?1 AND status = 'confirmed'`)
      .bind(g.id)
      .first<{ n: number }>();
    if (cap < (n?.n ?? 0)) throw bad('capacity_below_confirmed', `已經有 ${n?.n} 人報名，人數上限不能低於這個數字`);
    set('capacity', cap);
    // 人數上限調到比最低成團人數還低時，最低成團跟著降，否則這團永遠湊不滿、一定會被自動取消
    if (cap < g.min_players) set('min_players', cap);
    capacityChanged = cap > g.capacity;
  }
  if (!sets.length) throw bad('nothing_to_update', '沒有要修改的內容');
  vals.push(now);
  sets.push(`updated_at = ?${vals.length + 1}`);
  await env.DB.prepare(`UPDATE games SET ${sets.join(', ')} WHERE id = ?1`).bind(g.id, ...vals).run();
  if ('recurWeekly' in body && v.bool(body.recurWeekly) && !g.series_id) {
    await env.DB.prepare(`UPDATE games SET series_id = id WHERE id = ?1`).bind(g.id).run();
  }
  if (capacityChanged) await promoteAll(env, g.id, now);
}

export function assertHost(ok: boolean) {
  if (!ok) throw forbidden();
}

export { HOUR, DAY, WEEK };
