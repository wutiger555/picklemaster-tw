// 固定球敘：從 courts.json 的 features「球敘時段：…」整理出來的自有資料。
// 揪團大廳開站第一天就有內容，就是靠這份（44 座左右，實際數字以資料為準）。
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
  /** 這座球場最後查證日 */
  verified?: string;
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
      verified: c.last_updated,
    });
  }
  return out;
}
