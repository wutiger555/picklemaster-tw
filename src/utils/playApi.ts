import { PLAY_API, TURNSTILE_SITE_KEY } from '../config/play';

// ---------- 型別（對應 worker/src 的回應） ----------

export type Level = '2.0' | '2.5' | '3.0' | '3.5' | '4.0+' | 'unsure';
export type Format = 'rotation' | 'challenge' | 'partners' | 'singles';
export type Scoring = 'side_out_11' | 'rally_15' | 'rally_21';

export interface PlayerPublic {
  nickname: string;
  avatarSeed: number;
  level: Level | null;
  isMe?: boolean;
  isHost?: boolean;
}

export interface Me {
  nickname: string;
  avatarSeed: number;
  level: Level | null;
  dupr: string | null;
  createdAt: number;
}

export interface GameCourt {
  id: number;
  name?: string;
  city?: string;
  district?: string;
  type?: 'indoor' | 'outdoor' | 'covered';
  net?: string;
}

export interface GameSummary {
  id: string;
  court: GameCourt;
  title: string;
  startsAt: number;
  durationMin: number;
  courtsBooked: number;
  capacity: number;
  minPlayers: number;
  levelMin: number | null;
  levelMax: number | null;
  format: Format;
  scoring: Scoring;
  feeTotal: number;
  feeNote: string | null;
  beginner: boolean;
  cancelHours: number;
  cancelDeadline: number;
  communityUrl: string | null;
  note: string | null;
  recurWeekly: boolean;
  status: 'open' | 'cancelled' | 'auto_cancelled' | 'finished';
  cancelReason: string | null;
  confirmedCount?: number;
  waitlistCount?: number;
  host?: { nickname: string; avatarSeed: number; gamesHosted?: number } | null;
}

export interface GameDetail extends GameSummary {
  confirmed: PlayerPublic[];
  waitlist: PlayerPublic[];
  me: { status: string; position: number | null } | null;
  viewerIsHost: boolean;
}

export class PlayApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// ---------- 身分（存在這支手機的瀏覽器） ----------

const TOKEN_KEY = 'pm-play-token';
const ME_KEY = 'pm-play-me';
const MANAGE_KEY = (id: string) => `pm-play-manage-${id}`;

const store = {
  get(k: string): string | null {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set(k: string, v: string | null) {
    try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* 無痕模式等情況存不了，就只在這次瀏覽有效 */ }
  },
};

let memoryToken: string | null = null;
export const getToken = () => memoryToken ?? store.get(TOKEN_KEY);

export function getCachedMe(): Me | null {
  const raw = store.get(ME_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Me; } catch { return null; }
}

function saveIdentity(token: string, me: Me) {
  memoryToken = token;
  store.set(TOKEN_KEY, token);
  store.set(ME_KEY, JSON.stringify(me));
}

export function forgetIdentity() {
  memoryToken = null;
  store.set(TOKEN_KEY, null);
  store.set(ME_KEY, null);
}

export const getManageKey = (gameId: string) => store.get(MANAGE_KEY(gameId));
export const saveManageKey = (gameId: string, key: string) => store.set(MANAGE_KEY(gameId), key);

// ---------- Turnstile（無感驗證，使用者看不到） ----------

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  execute(target: string | HTMLElement): void;
  reset(id: string): void;
  remove(id: string): void;
}
declare global {
  interface Window { turnstile?: TurnstileApi }
}

let turnstileLoading: Promise<TurnstileApi> | null = null;
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!turnstileLoading) {
    turnstileLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
      s.onerror = () => { turnstileLoading = null; reject(new Error('turnstile')); };
      document.head.appendChild(s);
    });
  }
  return turnstileLoading;
}

async function turnstileToken(): Promise<string | undefined> {
  if (!TURNSTILE_SITE_KEY) return undefined;
  const ts = await loadTurnstile();
  const host = document.createElement('div');
  host.style.display = 'none';
  document.body.appendChild(host);
  try {
    return await new Promise<string>((resolve, reject) => {
      // widget 本身是 invisible 模式（在 Cloudflare 建立時設定），這裡只負責執行、不顯示任何東西
      ts.render(host, {
        sitekey: TURNSTILE_SITE_KEY,
        execution: 'execute',
        appearance: 'interaction-only',
        callback: (t: string) => resolve(t),
        'error-callback': () => {
          reject(new PlayApiError(0, 'turnstile_failed', '驗證沒有通過，請重新整理頁面再試一次'));
          return true;
        },
      });
      ts.execute(host);
    });
  } finally {
    host.remove();
  }
}

// ---------- 請求 ----------

async function request<T>(path: string, opts: { method?: string; body?: unknown; manageKey?: string | null } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.manageKey) headers['X-Manage-Key'] = opts.manageKey;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  let res: Response;
  try {
    res = await fetch(`${PLAY_API}${path}`, {
      method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new PlayApiError(0, 'network', '連不上伺服器，請確認網路後再試一次');
  }
  const data = await res.json().catch(() => null);
  // 這支手機存的身分伺服器不認得（例如被刪除、或密鑰輪替過）：清掉，下次報名時重新取暱稱
  if (res.status === 401 && token) forgetIdentity();
  if (!res.ok) {
    const err = data?.error;
    throw new PlayApiError(res.status, err?.code ?? 'unknown', err?.message ?? '發生錯誤，請稍後再試');
  }
  return data as T;
}

// ---------- API ----------

export async function ensurePlayer(profile: { nickname: string; avatarSeed: number; level: Level | null }): Promise<Me> {
  if (getToken()) {
    const { player } = await request<{ player: Me }>('/api/me', { method: 'PATCH', body: profile });
    store.set(ME_KEY, JSON.stringify(player));
    return player;
  }
  const turnstile = await turnstileToken();
  const r = await request<{ token: string; player: Me }>('/api/players', { body: { ...profile, turnstileToken: turnstile } });
  saveIdentity(r.token, r.player);
  return r.player;
}

export async function fetchMe() {
  const r = await request<{ player: Me; stats: { played: number; hosted: number }; games: (GameSummary & { myStatus: string; isHost: boolean })[] }>('/api/me');
  store.set(ME_KEY, JSON.stringify(r.player));
  return r;
}

export const updateMe = (patch: Partial<Pick<Me, 'nickname' | 'avatarSeed' | 'level' | 'dupr'>>) =>
  request<{ player: Me }>('/api/me', { method: 'PATCH', body: patch }).then((r) => {
    store.set(ME_KEY, JSON.stringify(r.player));
    return r.player;
  });

export const issuePlayerCode = () => request<{ code: string }>('/api/me/code', { method: 'POST' });

export async function claimPlayerCode(code: string): Promise<Me> {
  const turnstile = await turnstileToken();
  const r = await request<{ token: string; player: Me }>('/api/claim', { body: { code, turnstileToken: turnstile } });
  saveIdentity(r.token, r.player);
  return r.player;
}

export async function deleteMyData() {
  await request('/api/me', { method: 'DELETE' });
  forgetIdentity();
}

export const listGames = (q: { from?: number; days?: number; court?: number } = {}) => {
  const p = new URLSearchParams();
  if (q.from) p.set('from', String(q.from));
  if (q.days) p.set('days', String(q.days));
  if (q.court) p.set('court', String(q.court));
  return request<{ games: GameSummary[] }>(`/api/games?${p}`).then((r) => r.games);
};

export const getGame = (id: string) =>
  request<{ game: GameDetail }>(`/api/games/${encodeURIComponent(id)}`, { manageKey: getManageKey(id) }).then((r) => r.game);

export interface CreateGameInput {
  courtId: number;
  title: string;
  startsAt: number;
  durationMin: number;
  courtsBooked: number;
  capacity: number;
  minPlayers: number;
  levelMin: number | null;
  levelMax: number | null;
  format: Format;
  scoring: Scoring;
  feeTotal: number;
  feeNote?: string | null;
  beginner: boolean;
  cancelHours: number;
  communityUrl?: string | null;
  note?: string | null;
  recurWeekly: boolean;
}

export async function createGame(input: CreateGameInput) {
  const turnstile = await turnstileToken();
  const r = await request<{ game: GameDetail; manageKey: string }>('/api/games', { body: { ...input, turnstileToken: turnstile } });
  saveManageKey(r.game.id, r.manageKey);
  return r;
}

export const updateGame = (id: string, patch: Record<string, unknown>) =>
  request<{ game: GameDetail }>(`/api/games/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch, manageKey: getManageKey(id) }).then((r) => r.game);

export const joinGame = (id: string) =>
  request<{ me: { status: string; position: number | null } }>(`/api/games/${encodeURIComponent(id)}/join`, { method: 'POST' }).then((r) => r.me);

export const leaveGame = (id: string) =>
  request<{ status: string; promoted: boolean }>(`/api/games/${encodeURIComponent(id)}/leave`, { method: 'POST' });

export const reportGame = (id: string, reason: string) =>
  request<{ ok: true }>(`/api/games/${encodeURIComponent(id)}/report`, { body: { reason } });

// ---------- 固定球敘的「我會去」 ----------

export interface Interest {
  courtId: number;
  date: string;
  count: number;
  mine: boolean;
}

export const listInterests = (from: string, to: string) =>
  request<{ interests: Interest[] }>(`/api/interests?from=${from}&to=${to}`).then((r) => r.interests);

export const setInterest = (courtId: number, date: string, going: boolean) =>
  request<Interest>('/api/interests', { body: { courtId, date, going } });
