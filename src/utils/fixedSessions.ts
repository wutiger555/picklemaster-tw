// 固定球敘：從 courts.json 的 features「球敘時段：…」整理出來的自有資料。
// 揪團大廳開站第一天就有內容，就是靠這份（2026-09 為 43 座，實際數字以資料為準）。
//
// scripts/generate-static-pages.cjs 會用 loadTsModule() 讀這支檔案預渲染 /play/，
// React 大廳也讀同一份，兩邊的解析規則不會漂。
import type { Court } from '../types';

export interface FixedSession {
  courtId: number;
  courtName: string;
  city: string;
  district?: string;
  /** 時段本文，例如「每週二、四 12:00~16:00／每週六 16:00~18:00，NT$150~200」 */
  schedule: string;
  /** 括號內的主辦或聯絡資訊，例如「臺北市匹克球協會」 */
  organizer?: string;
  /** 有提到的星期（0 = 週日）；解析不出來就是空陣列，代表「看時段說明」 */
  weekdays: number[];
  /** 拆成「星期＋起訖時間」，用來算下一次什麼時候開始；解析不出時間的就沒有 slot */
  slots: Slot[];
  /** 這座球場最後查證日 */
  verified?: string;
}

export interface Slot {
  weekday: number;
  /** 分鐘數，例如 19:30 = 1170 */
  start: number;
  end: number;
}

const PREFIX = '球敘時段：';
const DAY = { 日: 0, 天: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 } as const;

export function parseWeekdays(schedule: string): number[] {
  const days = new Set<number>();
  // 「每週二、四」「週三、週日」「星期一、三」「每星期二、四、五」「週一至五」
  const W = '(?:週|星期|禮拜)';
  const re = new RegExp(`${W}([一二三四五六日天](?:[、,，至到~～\\-－]?${W}?[一二三四五六日天])*)`, 'g');
  for (const m of schedule.matchAll(re)) {
    const seg = m[1].replace(/週|星期|禮拜/g, '');
    const range = seg.match(/^([一二三四五六日天])[至到~～\-－]([一二三四五六日天])$/);
    if (range) {
      let a = DAY[range[1] as keyof typeof DAY];
      const b = DAY[range[2] as keyof typeof DAY];
      for (let i = 0; i < 7 && a !== b; i++, a = (a + 1) % 7) days.add(a);
      days.add(b);
      continue;
    }
    for (const ch of seg) if (ch in DAY) days.add(DAY[ch as keyof typeof DAY]);
  }
  if (schedule.includes('平日')) [1, 2, 3, 4, 5].forEach((d) => days.add(d));
  if (schedule.includes('假日')) [0, 6].forEach((d) => days.add(d));
  return [...days].sort((a, b) => a - b);
}

const TIME_RANGE = /(\d{1,2}):(\d{2})\s*[~～\-－至到]\s*(\d{1,2}):(\d{2})/g;
const OPEN_START = /(\d{1,2}):(\d{2})\s*(?:起|開始)/g;

// 「每週二、四 18:30~22:00／每週六、日 14:00~18:00」→ 每個星期各自的時段。
// 用全形「／」分段（半形 / 會出現在「400 元/人」裡，不能拿來切）；
// 某段只寫時間沒寫星期時，沿用前一段的星期。
export function parseSlots(schedule: string): Slot[] {
  const out: Slot[] = [];
  let lastDays = parseWeekdays(schedule);
  for (const seg of schedule.split(/[／;；]/)) {
    const days = parseWeekdays(seg);
    if (days.length) lastDays = days;
    let found = false;
    for (const m of seg.matchAll(TIME_RANGE)) {
      const start = +m[1] * 60 + +m[2];
      const end = +m[3] * 60 + +m[4];
      if (end <= start || start >= 24 * 60) continue;
      found = true;
      for (const weekday of lastDays) out.push({ weekday, start, end });
    }
    // 只寫開始時間的（「18:30 起」）：沒有結束時間，先當 2 小時
    if (!found) {
      for (const m of seg.matchAll(OPEN_START)) {
        const start = +m[1] * 60 + +m[2];
        if (start >= 24 * 60) continue;
        for (const weekday of lastDays) out.push({ weekday, start, end: Math.min(start + 120, 24 * 60) });
      }
    }
  }
  return out;
}

export interface Occurrence {
  session: FixedSession;
  /** 台北日期 YYYY-MM-DD，「我會去」以這個為單位 */
  date: string;
  /** 當天的每個時段（Unix 毫秒），同一天可能有好幾段，例如早場、晚場 */
  times: { startsAt: number; endsAt: number }[];
  /** 下一個還沒結束的時段開始時間，拿來排序與顯示「今晚 19:00 開始」 */
  startsAt: number;
  endsAt: number;
}

const HOUR = 3600_000;
const pad = (n: number) => String(n).padStart(2, '0');

/** 台北時間（UTC+8，無日光節約）某天 00:00 的 Unix 毫秒 */
function taipeiMidnight(ms: number) {
  const d = new Date(ms + 8 * HOUR);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - 8 * HOUR;
}
export function taipeiDate(ms: number) {
  const d = new Date(ms + 8 * HOUR);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** 從 now 開始往後 days 天內每一場球敘；已經結束的不列 */
export function upcomingOccurrences(sessions: FixedSession[], now: number, days = 7): Occurrence[] {
  const out: Occurrence[] = [];
  const day0 = taipeiMidnight(now);
  for (let i = 0; i < days; i++) {
    const midnight = day0 + i * 24 * HOUR;
    const weekday = new Date(midnight + 8 * HOUR).getUTCDay();
    for (const s of sessions) {
      const times = s.slots
        .filter((x) => x.weekday === weekday)
        .map((x) => ({ startsAt: midnight + x.start * 60_000, endsAt: midnight + x.end * 60_000 }))
        .sort((a, b) => a.startsAt - b.startsAt);
      const next = times.find((t) => t.endsAt > now);
      if (!next) continue;
      out.push({ session: s, date: taipeiDate(midnight), times, startsAt: next.startsAt, endsAt: next.endsAt });
    }
  }
  return out.sort((a, b) => a.startsAt - b.startsAt);
}

/** 這座球場在這一天（YYYY-MM-DD，台北）有沒有球敘 —— Worker 驗證「我會去」用 */
export function hasSessionOn(session: FixedSession, date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return session.slots.some((x) => x.weekday === weekday);
}

export function getFixedSessions(courts: Court[]): FixedSession[] {
  const out: FixedSession[] = [];
  for (const c of courts) {
    if (c.status) continue; // 暫停或歇業的場地不列
    // 兩種寫法：一般場館寫在 features；協會名錄補進來的社群球敘場寫在 opening_hours
    const feature = (c.features || []).find((s) => s.startsWith(PREFIX));
    const raw = feature ?? (c.opening_hours?.startsWith(PREFIX) ? c.opening_hours : undefined);
    if (!raw) continue;
    let schedule = raw.slice(PREFIX.length).trim();
    let organizer: string | undefined;
    // features 的寫法會把主辦或聯絡人放在結尾括號；opening_hours 的括號是「早場」這類說明，不拆
    const paren = feature ? schedule.match(/（([^（）]+)）\s*$/) : null;
    if (paren) {
      organizer = paren[1].trim();
      schedule = schedule.slice(0, paren.index).trim();
    }
    out.push({
      courtId: c.id,
      courtName: c.name,
      city: c.location.city,
      district: c.location.district,
      schedule,
      organizer,
      weekdays: parseWeekdays(schedule),
      slots: parseSlots(schedule),
      verified: c.last_updated,
    });
  }
  return out;
}
