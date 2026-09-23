import { bad } from './errors';

// 去掉控制字元與前後空白；內容一律由前端以文字呈現（React 自動跳脫），分享頁另外跳脫
export function text(v: unknown, field: string, min: number, max: number, label: string): string {
  if (typeof v !== 'string') throw bad(`invalid_${field}`, `${label}格式不正確`);
  // eslint-disable-next-line no-control-regex
  const s = v.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (Array.from(s).length < min) throw bad(`invalid_${field}`, min <= 1 ? `請填寫${label}` : `${label}至少要 ${min} 個字`);
  if (Array.from(s).length > max) throw bad(`invalid_${field}`, `${label}最多 ${max} 個字`);
  return s;
}

export function optText(v: unknown, field: string, max: number, label: string): string | null {
  if (v === undefined || v === null || v === '') return null;
  return text(v, field, 1, max, label);
}

export function int(v: unknown, field: string, min: number, max: number, label: string): number {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
    throw bad(`invalid_${field}`, `${label}要介於 ${min} 到 ${max}`);
  }
  return v;
}

export function oneOf<T extends string>(v: unknown, field: string, options: readonly T[], label: string): T {
  if (typeof v !== 'string' || !options.includes(v as T)) throw bad(`invalid_${field}`, `${label}不在可選的項目裡`);
  return v as T;
}

export function bool(v: unknown): boolean {
  return v === true;
}

export const LEVELS = ['2.0', '2.5', '3.0', '3.5', '4.0+', 'unsure'] as const;
export const FORMATS = ['rotation', 'challenge', 'partners', 'singles'] as const; // 四上四下 / 挑戰場 / 固定搭檔 / 單打
export const SCORINGS = ['side_out_11', 'rally_15', 'rally_21'] as const;

// 程度範圍：2.0–5.0，每 0.5 一格
export function level(v: unknown, field: string): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'number' || v < 1 || v > 6 || Math.round(v * 2) !== v * 2) {
    throw bad(`invalid_${field}`, '程度要是 1.0 到 6.0 之間、以 0.5 為單位的數字');
  }
  return v;
}

export function dupr(v: unknown): string | null {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string' || !/^\d\.\d{1,3}$/.test(v) || +v < 2 || +v > 8) {
    throw bad('invalid_dupr', 'DUPR 分數要是 2.000 到 8.000 之間的數字');
  }
  return v;
}

// 團主的 LINE 社群連結：只收 https，而且限定 LINE 網域，避免被拿來放釣魚網址
export function communityUrl(v: unknown): string | null {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string' || v.length > 300) throw bad('invalid_community_url', 'LINE 社群連結格式不正確');
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    throw bad('invalid_community_url', 'LINE 社群連結格式不正確');
  }
  const okHost = ['line.me', 'lin.ee'].some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
  if (u.protocol !== 'https:' || !okHost) throw bad('invalid_community_url', '只能填 LINE 社群或 LINE 官方帳號的連結');
  return u.toString();
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {
    /* 往下丟錯 */
  }
  throw bad('invalid_json', '送出的資料格式不正確');
}
