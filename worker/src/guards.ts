import type { Context } from 'hono';
import type { AppEnv, Env } from './env';
import { ApiError } from './errors';
import { sha256hex } from './crypto';

export async function ipHash(c: Context<AppEnv>): Promise<string> {
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
  // 只存雜湊，不存原始 IP
  return (await sha256hex(`${ip}|${c.env.TOKEN_SECRET}`)).slice(0, 16);
}

// 寫入動作前的無感防機器人驗證
export async function verifyTurnstile(c: Context<AppEnv>, token: unknown): Promise<void> {
  const env: Env = c.env;
  if (env.TURNSTILE_MODE === 'off') return;
  if (!env.TURNSTILE_SECRET) throw new ApiError(500, 'turnstile_misconfigured', '伺服器設定有誤，請稍後再試');
  if (typeof token !== 'string' || !token) throw new ApiError(400, 'turnstile_required', '請稍等驗證完成後再送出');
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  const ip = c.req.header('CF-Connecting-IP');
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const out = (await res.json()) as { success?: boolean };
  if (!out.success) throw new ApiError(403, 'turnstile_failed', '驗證沒有通過，請重新整理頁面再試一次');
}

export const LIMITS = {
  createPlayer: { max: 5, windowMs: 3600_000 },
  createGame: { max: 10, windowMs: 86400_000 },
  join: { max: 60, windowMs: 3600_000 },
  claim: { max: 10, windowMs: 3600_000 },
  report: { max: 20, windowMs: 86400_000 },
} as const;

export async function rateLimit(c: Context<AppEnv>, action: keyof typeof LIMITS, now: number): Promise<void> {
  const { max, windowMs } = LIMITS[action];
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${action}:${await ipHash(c)}:${windowStart}`;
  const row = await c.env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
     ON CONFLICT (key) DO UPDATE SET count = count + 1
     RETURNING count`,
  )
    .bind(key, windowStart)
    .first<{ count: number }>();
  if ((row?.count ?? 0) > max) throw new ApiError(429, 'rate_limited', '操作太頻繁了，請稍後再試');
}
