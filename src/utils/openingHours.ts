// 由 opening_hours 自由文字推導「現在是否開放」。
// 設計原則：寧可回 unknown 也不誤判——找球場時「錯誤地顯示已打烊」比「不顯示」更糟。
export type OpenState =
  | { status: 'open'; closesAt?: string; always?: boolean }
  | { status: 'closed'; opensAt?: string }
  | { status: 'unknown' };

interface Segment { days: number[]; start: number; end: number }  // 分鐘數，end 可 >1440

const toHalfWidth = (s: string) =>
  s.replace(/[！-～]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, ' ');

const DAY_TOKENS: Record<string, number> = { 日: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };

// 解析日期前綴 → 星期陣列（JS getDay：0=日）
function parseDays(prefix: string): number[] | null {
  const p = prefix.replace(/\s/g, '');
  if (!p) return null;
  if (/每天|全年無休|天天/.test(p)) return [0, 1, 2, 3, 4, 5, 6];
  if (/平日|週間/.test(p)) return [1, 2, 3, 4, 5];
  if (/假日|週末|例假日/.test(p)) return [0, 6];
  // 「週一至週四」/「周一~周五」
  const range = p.match(/[週周星期]([日一二三四五六])\s*(?:至|到|~|-|–)\s*[週周星期]?([日一二三四五六])/);
  if (range) {
    const a = DAY_TOKENS[range[1]], b = DAY_TOKENS[range[2]];
    if (a === undefined || b === undefined) return null;
    const out: number[] = [];
    for (let i = 0; i < 7; i++) { const d = (a + i) % 7; out.push(d); if (d === b) break; }
    return out;
  }
  // 「週五週六」/「週二、四」列舉
  const listed = [...p.matchAll(/[週周星期]?([日一二三四五六])/g)].map(m => DAY_TOKENS[m[1]]).filter(d => d !== undefined);
  return listed.length ? [...new Set(listed)] : null;
}

const hhmmToMin = (h: string, m: string) => parseInt(h, 10) * 60 + parseInt(m, 10);

/** 解析 opening_hours 為時段；無法可靠解析時回 null */
export function parseOpeningHours(raw?: string): { always: true } | { segments: Segment[] } | null {
  if (!raw) return null;
  const s = toHalfWidth(raw).trim();
  if (/24\s*小時|全天候開放|00:00\s*-\s*24:00/.test(s)) return { always: true };

  const timeRe = /(\d{1,2}):(\d{2})\s*(?:-|~|–|至|到)\s*(\d{1,2}):(\d{2})/g;
  const matches = [...s.matchAll(timeRe)];
  if (matches.length === 0) return null;

  // 僅有單一時段且無其他敘述文字 → 視為每日適用
  if (matches.length === 1) {
    const before = s.slice(0, matches[0].index!).trim();
    const after = s.slice(matches[0].index! + matches[0][0].length).trim();
    const days = parseDays(before);
    const noise = (before && !days) || /休|僅|限|依|需|預約|公告|不定/.test(before + after);
    if (noise) return null;
    const [, h1, m1, h2, m2] = matches[0];
    return { segments: [{ days: days ?? [0, 1, 2, 3, 4, 5, 6], start: hhmmToMin(h1, m1), end: hhmmToMin(h2, m2) }] };
  }

  // 多時段：每段都必須有可辨識的日期前綴，否則放棄（避免誤判）
  const segments: Segment[] = [];
  let cursor = 0;
  for (const m of matches) {
    const prefix = s.slice(cursor, m.index!);
    cursor = m.index! + m[0].length;
    const days = parseDays(prefix.replace(/[，,、;；]/g, ' '));
    if (!days) return null;
    segments.push({ days, start: hhmmToMin(m[1], m[2]), end: hhmmToMin(m[3], m[4]) });
  }
  return segments.length ? { segments } : null;
}

const fmt = (min: number) => {
  if (min === 1440) return '24:00';           // 午夜打烊顯示 24:00 較直覺
  const t = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

/** 以 now 判斷目前開放狀態 */
export function getOpenState(raw?: string, now: Date = new Date()): OpenState {
  const parsed = parseOpeningHours(raw);
  if (!parsed) return { status: 'unknown' };
  if ('always' in parsed) return { status: 'open', always: true };

  const day = now.getDay();
  const cur = now.getHours() * 60 + now.getMinutes();
  const prevDay = (day + 6) % 7;

  // 今日時段
  const today = parsed.segments.filter(s => s.days.includes(day));
  // 昨日跨夜時段（end > 1440 表示延續到今天）
  const overnight = parsed.segments.filter(s => s.days.includes(prevDay) && s.end > 1440);

  for (const s of overnight) {
    if (cur < s.end - 1440) return { status: 'open', closesAt: fmt(s.end) };
  }
  for (const s of today) {
    if (cur >= s.start && cur < Math.min(s.end, 1440)) return { status: 'open', closesAt: fmt(s.end) };
  }
  if (today.length === 0 && overnight.length === 0) return { status: 'unknown' };

  const upcoming = today.filter(s => cur < s.start).sort((a, b) => a.start - b.start)[0];
  return upcoming ? { status: 'closed', opensAt: fmt(upcoming.start) } : { status: 'closed' };
}
