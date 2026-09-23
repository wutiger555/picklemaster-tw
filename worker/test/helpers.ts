import { exports } from 'cloudflare:workers';

let ipSeq = 0;
/** 每次都給不同 IP，避免測試彼此踩到頻率限制；要測頻率限制時自己指定 ip */
export const freshIp = () => `10.0.${Math.floor(++ipSeq / 250)}.${ipSeq % 250}`;

export async function api(
  path: string,
  opts: { method?: string; body?: unknown; token?: string; ip?: string; headers?: Record<string, string> } = {},
) {
  const headers: Record<string, string> = { 'CF-Connecting-IP': opts.ip ?? freshIp(), ...opts.headers };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await (exports as unknown as { default: Fetcher }).default.fetch(`https://go.picklemastertw.com${path}`, {
    method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* HTML 回應 */
  }
  return { status: res.status, json, text, headers: res.headers };
}

export async function newPlayer(nickname = '球友') {
  const r = await api('/api/players', { body: { nickname, avatarSeed: 1, level: '3.0' } });
  if (r.status !== 201) throw new Error(`createPlayer ${r.status} ${r.text}`);
  return r.json.token as string;
}

export const HOUR = 3600_000;
export const DAY = 24 * HOUR;

/** 台北時間的某一天某一點（測試用，避免跨日問題就一律用幾天後） */
export function inDays(days: number, hour = 19) {
  const d = new Date(Date.now() + 8 * HOUR);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour - 8, 0, 0, 0);
  return d.getTime();
}

export async function newGame(token: string, overrides: Record<string, unknown> = {}) {
  const r = await api('/api/games', {
    token,
    body: {
      courtId: 8, // 台北市北投運動中心，室內 4 面
      title: '北投室內雙打',
      startsAt: inDays(3),
      courtsBooked: 1,
      capacity: 6,
      levelMin: 3,
      levelMax: 3.5,
      feeTotal: 700,
      ...overrides,
      // 預設最低成團 4 人，但不能超過人數上限
      minPlayers: overrides.minPlayers ?? Math.min(4, Number(overrides.capacity ?? 6)),
    },
  });
  if (r.status !== 201) throw new Error(`createGame ${r.status} ${r.text}`);
  return r.json as { game: any; manageKey: string };
}
