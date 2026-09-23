// 球場評論的標籤（前端與 Worker 共用這一份，Worker 用它驗證送進來的標籤）。
//
// 只給標籤、不開放自由文字：沒有內容要審核，也比較不會被拿來洗版或吵架。
// 同一組 conflicts 裡的標籤互斥（例如「地面不滑」和「地面偏滑」不能同時選）。
export interface CourtTag {
  key: string;
  label: string;
  group: '場地' | '環境' | '交通與設施' | '人潮';
  /** good＝好的描述、heads_up＝提醒，只影響顯示顏色，不做分數 */
  tone: 'good' | 'heads_up';
}

export const COURT_TAGS: CourtTag[] = [
  { key: 'floor_grip', label: '地面不滑', group: '場地', tone: 'good' },
  { key: 'floor_slippery', label: '地面偏滑', group: '場地', tone: 'heads_up' },
  { key: 'lines_clear', label: '線畫得清楚', group: '場地', tone: 'good' },
  { key: 'net_good', label: '球網狀況好', group: '場地', tone: 'good' },
  { key: 'net_bring', label: '要自己帶網', group: '場地', tone: 'heads_up' },

  { key: 'lights_good', label: '燈光充足', group: '環境', tone: 'good' },
  { key: 'cool', label: '通風涼爽', group: '環境', tone: 'good' },
  { key: 'hot', label: '很熱要注意', group: '環境', tone: 'heads_up' },
  { key: 'windy', label: '風大', group: '環境', tone: 'heads_up' },
  { key: 'shade', label: '有遮蔭或雨棚', group: '環境', tone: 'good' },

  { key: 'parking_easy', label: '好停車', group: '交通與設施', tone: 'good' },
  { key: 'parking_hard', label: '停車難', group: '交通與設施', tone: 'heads_up' },
  { key: 'transit', label: '大眾運輸方便', group: '交通與設施', tone: 'good' },
  { key: 'toilet', label: '有廁所', group: '交通與設施', tone: 'good' },
  { key: 'water', label: '有飲水機', group: '交通與設施', tone: 'good' },

  { key: 'queue', label: '常要排隊', group: '人潮', tone: 'heads_up' },
  { key: 'easy_to_join', label: '人少好約', group: '人潮', tone: 'good' },
  { key: 'beginner_friendly', label: '新手友善', group: '人潮', tone: 'good' },
  { key: 'strong_players', label: '高手多', group: '人潮', tone: 'heads_up' },
];

export const TAG_GROUPS = ['場地', '環境', '交通與設施', '人潮'] as const;

export const TAG_CONFLICTS: string[][] = [
  ['floor_grip', 'floor_slippery'],
  ['net_good', 'net_bring'],
  ['cool', 'hot'],
  ['parking_easy', 'parking_hard'],
  ['queue', 'easy_to_join'],
];

export const MAX_TAGS = 8;

const KEYS = new Set(COURT_TAGS.map((t) => t.key));
export const tagByKey = new Map(COURT_TAGS.map((t) => [t.key, t]));

/** 回傳錯誤訊息；沒問題就回傳 null */
export function validateTags(tags: unknown): string | null {
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string')) return '標籤格式不正確';
  if (!tags.length) return '至少選一個標籤';
  if (tags.length > MAX_TAGS) return `最多選 ${MAX_TAGS} 個標籤`;
  if (new Set(tags).size !== tags.length) return '標籤重複了';
  const bad = tags.find((t) => !KEYS.has(t));
  if (bad) return '有不認得的標籤';
  for (const pair of TAG_CONFLICTS) {
    if (pair.every((k) => tags.includes(k))) return `「${tagByKey.get(pair[0])?.label}」和「${tagByKey.get(pair[1])?.label}」不能同時選`;
  }
  return null;
}

/** 選了某個標籤時，要一併取消哪些互斥的標籤 */
export function conflictsOf(key: string): string[] {
  return TAG_CONFLICTS.filter((p) => p.includes(key)).flat().filter((k) => k !== key);
}
