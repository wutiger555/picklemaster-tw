import { type ArcadeResult, getArcadeProfile, getToken, postArcadeResult, putArcadeProfile } from '../../utils/playApi';

/**
 * 遊戲進度的雲端存檔（和揪團共用球友身分）。
 * 本機的 localStorage 仍是主要存檔：遊戲隨時能玩，雲端只是備份與換手機用。
 * 連不上伺服器或額度用完時，什麼都不擋：存檔下次再傳、成績排隊等下次一起送。
 */

/** 會同步的本機存檔（key → 合併方式） */
const KEYS = {
  records: 'pm-game-records',
  tour: 'pm-game-tour',
  settings: 'pm-game-settings',
  tips: 'pm-game-tips',
  tutorial: 'pm-game-tutorial-done',
  welcome: 'pm-game-welcome',
} as const;
type Field = keyof typeof KEYS;
export type Snapshot = Partial<Record<Field, unknown>>;

const QUEUE_KEY = 'pm-game-cloud-queue';
/** 後端關掉遊戲雲端功能（緊急開關）時，這個時間之前都不再送請求 */
const OFF_KEY = 'pm-game-cloud-off-until';
const SYNCED_KEY = 'pm-game-cloud-synced';

const read = (k: string): unknown => {
  try {
    const raw = localStorage.getItem(k);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch {
    return undefined;
  }
};
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  } catch {
    /* 無痕模式存不了 */
  }
};

export const readLocal = (): Snapshot => {
  const s: Snapshot = {};
  for (const f of Object.keys(KEYS) as Field[]) {
    const v = read(KEYS[f]);
    if (v !== undefined) s[f] = v;
  }
  return s;
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** 兩份數字表（可巢狀）逐格取大：勝場、出賽、最佳紀錄、踢館星數與最高分都只會往上加 */
const maxDeep = (a: unknown, b: unknown): unknown => {
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (typeof a === 'boolean' || typeof b === 'boolean') return !!a || !!b;
  if (isObj(a) && isObj(b)) {
    const out: Record<string, unknown> = { ...b, ...a };
    for (const k of Object.keys(out)) if (k in a && k in b) out[k] = maxDeep(a[k], b[k]);
    return out;
  }
  return a ?? b;
};

/**
 * 本機與雲端合併：戰績、星數取大；看過的提示取聯集；教學看過任一邊算看過；
 * 設定以本機為準（這支手機上剛調的），本機沒有才用雲端的（換新手機）。
 */
export const merge = (local: Snapshot, remote: Snapshot): Snapshot => {
  const out: Snapshot = { ...remote, ...local };
  if (local.records !== undefined && remote.records !== undefined) out.records = maxDeep(local.records, remote.records);
  if (local.tour !== undefined && remote.tour !== undefined) out.tour = maxDeep(local.tour, remote.tour);
  if (isObj(local.tips) && isObj(remote.tips)) {
    const a = Array.isArray(local.tips.seen) ? local.tips.seen : [];
    const b = Array.isArray(remote.tips.seen) ? remote.tips.seen : [];
    out.tips = { seen: [...new Set([...a, ...b])] };
  }
  if (local.tutorial === '1' || remote.tutorial === '1' || local.tutorial === 1 || remote.tutorial === 1) out.tutorial = '1';
  return out;
};

const same = (a: Snapshot, b: Snapshot) => JSON.stringify(a) === JSON.stringify(b);

export const signedIn = () => !!getToken();

/** 雲端功能可用：有身分，而且後端沒有暫停遊戲雲端功能 */
const cloudOn = () => {
  const until = read(OFF_KEY);
  return signedIn() && !(typeof until === 'number' && Date.now() < until);
};
/** 後端回 arcade_off：24 小時內不再送任何遊戲請求 */
const noteOff = (e: unknown) => {
  if ((e as { code?: string }).code === 'arcade_off') write(OFF_KEY, Date.now() + 24 * 3600_000);
};

/** 進遊戲時拉一次：合併雲端存檔寫回本機，本機比較新的部分再傳上去；回傳合併後的存檔（沒登入回 null） */
export async function pull(): Promise<Snapshot | null> {
  if (!cloudOn()) return null;
  try {
    const r = await getArcadeProfile();
    const local = readLocal();
    const remote = (r.data ?? {}) as Snapshot;
    const merged = merge(local, remote);
    for (const f of Object.keys(merged) as Field[]) write(KEYS[f], merged[f]);
    if (!same(merged, remote)) await putArcadeProfile(merged as Record<string, unknown>);
    write(SYNCED_KEY, Date.now());
    void flushQueue();
    return merged;
  } catch (e) {
    noteOff(e);
    return null;
  }
}

let pushTimer: number | null = null;
/** 存檔有變（打完一場、過關）：等 2 秒合併成一次上傳，省請求次數 */
export function schedulePush() {
  if (!cloudOn()) return;
  if (pushTimer !== null) window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => {
    pushTimer = null;
    putArcadeProfile(readLocal() as Record<string, unknown>)
      .then(() => write(SYNCED_KEY, Date.now()))
      // 失敗就等下次進遊戲 pull 時再合併上傳
      .catch(noteOff);
  }, 2000);
}

export const lastSynced = (): number | null => {
  const v = read(SYNCED_KEY);
  return typeof v === 'number' ? v : null;
};

// ---------- 比賽結果（排行榜） ----------

const loadQueue = (): ArcadeResult[] => {
  const v = read(QUEUE_KEY);
  return Array.isArray(v) ? (v as ArcadeResult[]) : [];
};

/** 送出一場的成績；連不上就排隊（最多留 20 場），下次再送。回傳這場拿到的積分（沒送出回 null） */
export async function submitResult(r: ArcadeResult): Promise<number | null> {
  if (!cloudOn()) return null;
  try {
    const out = await postArcadeResult(r);
    void flushQueue();
    return out.points;
  } catch (e) {
    noteOff(e);
    // 伺服器明確拒絕（成績不合理、頻率限制）就不再重送；只有網路問題才排隊
    if ((e as { status?: number }).status === 0) write(QUEUE_KEY, [...loadQueue(), r].slice(-20));
    return null;
  }
}

let flushing = false;
async function flushQueue() {
  if (flushing) return;
  const q = loadQueue();
  if (!q.length) return;
  flushing = true;
  write(QUEUE_KEY, []);
  for (let i = 0; i < q.length; i++) {
    try {
      await postArcadeResult(q[i]);
    } catch (e) {
      // 又斷線了：這場和後面還沒送的放回佇列
      if ((e as { status?: number }).status === 0) {
        write(QUEUE_KEY, [...loadQueue(), ...q.slice(i)].slice(-20));
        break;
      }
    }
  }
  flushing = false;
}

// ---------- 排行榜快取（5 分鐘，省請求） ----------

export const boardCacheKey = (b: string) => `pm-game-board-${b}-${signedIn() ? 'me' : 'anon'}`;

/** 剛打完一場：清掉排行榜快取，打開時看得到自己最新的名次 */
export const invalidateBoards = () => {
  try {
    for (const b of ['points', 'pro', 'dink']) for (const who of ['me', 'anon']) sessionStorage.removeItem(`pm-game-board-${b}-${who}`);
  } catch {
    /* 存不了 */
  }
};
