import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import type { AppEnv, Env } from './env';
import { verifyToken } from './crypto';
import { ApiError, bad, unauthorized } from './errors';
import { rateLimit, verifyTurnstile } from './guards';
import { readJson } from './validate';
import * as games from './games';
import * as players from './players';
import { runDaily, runMaintenance } from './cron';
import { shareHtml } from './share';
import { listInterests, setInterest } from './interests';
import { deleteReview, getReviews, putReview } from './reviews';
import * as arcade from './arcade';

const app = new Hono<AppEnv>();

app.use('/api/*', (c, next) =>
  cors({
    origin: (origin) => (c.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).includes(origin) ? origin : null),
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Manage-Key'],
    maxAge: 86400,
  })(c, next),
);

// 解析球友 token（沒帶或無效都當作訪客，需要身分的路由再擋）
app.use('/api/*', async (c, next) => {
  const auth = c.req.header('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  c.set('playerId', token ? await verifyToken(c.env.TOKEN_SECRET, token) : null);
  await next();
});

const requirePlayer = (c: Context<AppEnv>) => {
  const id = c.get('playerId');
  if (!id) throw unauthorized();
  return id;
};

app.onError((err, c) => {
  if (err instanceof ApiError) return c.json({ error: { code: err.code, message: err.message } }, err.status);
  console.error(err);
  return c.json({ error: { code: 'internal', message: '伺服器出了點問題，請稍後再試' } }, 500);
});

app.get('/api/health', (c) => c.json({ ok: true }));

// ---------- 球友 ----------

app.post('/api/players', async (c) => {
  const now = Date.now();
  const body = await readJson(c.req.raw);
  await rateLimit(c, 'createPlayer', now);
  await verifyTurnstile(c, body.turnstileToken);
  return c.json(await players.createPlayer(c.env, body, now), 201);
});

app.get('/api/me', async (c) => c.json(await players.getMe(c.env, requirePlayer(c), Date.now())));

app.patch('/api/me', async (c) => c.json({ player: await players.updateMe(c.env, requirePlayer(c), await readJson(c.req.raw)) }));

app.delete('/api/me', async (c) => {
  await players.deleteMe(c.env, requirePlayer(c), Date.now());
  return c.json({ ok: true });
});

app.post('/api/me/code', async (c) => c.json(await players.issueCode(c.env, requirePlayer(c))));

app.post('/api/claim', async (c) => {
  const body = await readJson(c.req.raw);
  await rateLimit(c, 'claim', Date.now());
  await verifyTurnstile(c, body.turnstileToken);
  return c.json(await players.claimCode(c.env, body));
});

// ---------- 小遊戲（匹克硬邦幫）：雲端存檔與每週排行榜 ----------

// 緊急開關：關掉時直接回 503，不碰資料庫；手機端看到 arcade_off 會停 24 小時
app.use('/api/arcade/*', async (c, next) => {
  if (c.env.ARCADE_MODE === 'off') throw new ApiError(503, 'arcade_off', '遊戲雲端功能暫停中，進度先存在這支手機上');
  await next();
});

app.get('/api/arcade/profile', async (c) => c.json(await arcade.getProfile(c.env, requirePlayer(c))));

app.put('/api/arcade/profile', async (c) => {
  const now = Date.now();
  const pid = requirePlayer(c);
  await rateLimit(c, 'arcadeProfile', now);
  return c.json(await arcade.putProfile(c.env, pid, await readJson(c.req.raw), now));
});

app.post('/api/arcade/results', async (c) => {
  const now = Date.now();
  const pid = requirePlayer(c);
  await rateLimit(c, 'arcadeResult', now);
  return c.json(await arcade.postResult(c.env, pid, await readJson(c.req.raw), now), 201);
});

app.get('/api/arcade/leaderboard/:board', async (c) => {
  const pid = c.get('playerId');
  // 沒帶身分的公開排行可以快取；帶身分的要算自己的名次，不快取
  c.header('Cache-Control', pid ? 'private, no-store' : 'public, max-age=60');
  return c.json(await arcade.leaderboard(c.env, c.req.param('board'), pid, Date.now()));
});

// ---------- 約打團 ----------

app.get('/api/games', async (c) => {
  const now = Date.now();
  const from = Number(c.req.query('from') ?? now - 2 * games.HOUR);
  const days = Math.min(Math.max(Number(c.req.query('days') ?? 14), 1), 60);
  const court = c.req.query('court');
  const list = await games.listGames(c.env, {
    from: Number.isFinite(from) ? from : now,
    to: (Number.isFinite(from) ? from : now) + days * games.DAY,
    courtId: court ? Number(court) : undefined,
    city: c.req.query('city') || undefined,
  });
  c.header('Cache-Control', 'public, max-age=30');
  return c.json({ games: list });
});

app.get('/api/games/:id', async (c) => {
  const g = await games.loadGame(c.env, c.req.param('id'));
  const pid = c.get('playerId');
  const host = await games.isHost(g, pid, c.req.header('X-Manage-Key'));
  if (g.hidden && !host) throw new ApiError(404, 'not_found', '這一團目前無法顯示');
  return c.json({ game: await games.gameDetail(c.env, g, pid, host) });
});

app.post('/api/games', async (c) => {
  const now = Date.now();
  const hostId = requirePlayer(c);
  const body = await readJson(c.req.raw);
  await rateLimit(c, 'createGame', now);
  await verifyTurnstile(c, body.turnstileToken);
  const input = games.parseGameInput(body, now);
  await assertCanHost(c.env, hostId, now);
  const { id, manageKey } = await games.createGame(c.env, hostId, input, now);
  const g = await games.loadGame(c.env, id);
  return c.json({ game: await games.gameDetail(c.env, g, hostId, true), manageKey }, 201);
});

// 新球友第一週最多同時開 1 團，之後最多 5 團
async function assertCanHost(env: Env, hostId: string, now: number) {
  const r = await env.DB.prepare(
    `SELECT p.created_at, (SELECT COUNT(*) FROM games WHERE host_id = p.id AND status = 'open') AS open
       FROM players p WHERE p.id = ?1 AND p.deleted_at IS NULL`,
  )
    .bind(hostId)
    .first<{ created_at: number; open: number }>();
  if (!r) throw unauthorized();
  const limit = now - r.created_at < 7 * games.DAY ? 1 : 5;
  if (r.open >= limit) {
    throw new ApiError(409, 'too_many_hosted', limit === 1 ? '新球友第一週最多同時開 1 團' : '最多同時開 5 團，先等其中一團結束吧');
  }
}

app.patch('/api/games/:id', async (c) => {
  const now = Date.now();
  const g = await games.loadGame(c.env, c.req.param('id'));
  games.assertHost(await games.isHost(g, c.get('playerId'), c.req.header('X-Manage-Key')));
  await games.updateGame(c.env, g, await readJson(c.req.raw), now);
  const fresh = await games.loadGame(c.env, g.id);
  return c.json({ game: await games.gameDetail(c.env, fresh, c.get('playerId'), true) });
});

app.post('/api/games/:id/join', async (c) => {
  const now = Date.now();
  const pid = requirePlayer(c);
  await rateLimit(c, 'join', now);
  return c.json({ me: await games.joinGame(c.env, c.req.param('id'), pid, now) });
});

app.post('/api/games/:id/leave', async (c) => {
  const pid = requirePlayer(c);
  return c.json(await games.leaveGame(c.env, c.req.param('id'), pid, Date.now()));
});

// 3 個不同球友檢舉就自動隱藏，站主只需要看被隱藏的清單
app.post('/api/games/:id/report', async (c) => {
  const now = Date.now();
  const pid = requirePlayer(c);
  await rateLimit(c, 'report', now);
  const body = await readJson(c.req.raw);
  const reason = typeof body.reason === 'string' ? body.reason.slice(0, 200) : '';
  if (!reason) throw bad('invalid_reason', '請選擇檢舉原因');
  const g = await games.loadGame(c.env, c.req.param('id'));
  await c.env.DB.batch([
    c.env.DB.prepare(`INSERT OR IGNORE INTO reports (game_id, reporter_id, reason, created_at) VALUES (?1, ?2, ?3, ?4)`).bind(g.id, pid, reason, now),
    c.env.DB.prepare(`UPDATE games SET hidden = 1, updated_at = ?2 WHERE id = ?1 AND (SELECT COUNT(*) FROM reports WHERE game_id = ?1) >= 3`).bind(g.id, now),
  ]);
  return c.json({ ok: true });
});

// ---------- 固定球敘的「我會去」 ----------

app.get('/api/interests', async (c) => {
  const list = await listInterests(c.env, c.req.query('from') ?? '', c.req.query('to') ?? '', c.get('playerId'));
  return c.json({ interests: list });
});

app.post('/api/interests', async (c) => {
  const now = Date.now();
  const pid = requirePlayer(c);
  await rateLimit(c, 'join', now);
  return c.json(await setInterest(c.env, pid, await readJson(c.req.raw), now));
});

// ---------- 球場評論（標籤） ----------

app.get('/api/courts/:id/reviews', async (c) => {
  c.header('Cache-Control', 'public, max-age=60');
  return c.json(await getReviews(c.env, Number(c.req.param('id')), c.get('playerId'), Date.now()));
});

app.put('/api/courts/:id/reviews', async (c) => {
  const now = Date.now();
  const pid = requirePlayer(c);
  await rateLimit(c, 'report', now);
  return c.json(await putReview(c.env, Number(c.req.param('id')), pid, await readJson(c.req.raw), now));
});

app.delete('/api/courts/:id/reviews', async (c) => {
  const pid = requirePlayer(c);
  return c.json(await deleteReview(c.env, Number(c.req.param('id')), pid, Date.now()));
});

// ---------- 分享頁（給 LINE 預覽用） ----------

app.get('/g/:id', async (c) => {
  const g = await c.env.DB.prepare(`SELECT * FROM games WHERE id = ?1`).bind(c.req.param('id')).first<games.GameRow>();
  const n = g
    ? await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM game_players WHERE game_id = ?1 AND status = 'confirmed'`).bind(g.id).first<{ n: number }>()
    : null;
  c.header('Cache-Control', 'public, max-age=60');
  return c.html(shareHtml(c.env, g, n?.n ?? 0));
});

app.get('/', (c) => c.redirect(`${c.env.SITE_ORIGIN}/play/`, 302));

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const now = Date.now();
    if (event.cron === '0 19 * * *') ctx.waitUntil(runDaily(env, now));
    else ctx.waitUntil(runMaintenance(env, now).then((r) => console.log('maintenance', JSON.stringify(r))));
  },
} satisfies ExportedHandler<Env>;
