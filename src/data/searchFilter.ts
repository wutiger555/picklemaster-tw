// 純過濾邏輯（無資料相依）— 可被 SearchBar 靜態載入而不拖入大型資料檔。
// 完整索引的建立見 searchIndex.ts（僅動態載入，獨立 chunk）。
export interface SearchEntry {
  title: string;
  description: string;
  path: string;
  category: string;
  keywords: string[];
}

// 依查詢字排序過濾：標題完全符合 > 標題開頭 > 標題包含 > 描述 > 關鍵字
export function searchEntries(index: SearchEntry[], rawQuery: string, limit = 12): SearchEntry[] {
  const q = rawQuery.trim().toLowerCase();
  if (q.length < 1) return [];
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const e of index) {
    const title = e.title.toLowerCase();
    let score = 0;
    if (title === q) score = 100;
    else if (title.startsWith(q)) score = 80;
    else if (title.includes(q)) score = 60;
    else if (e.description.toLowerCase().includes(q)) score = 30;
    else if (e.keywords.some(k => k.toLowerCase().includes(q))) score = 20;
    if (score > 0) scored.push({ e, score });
  }
  scored.sort((a, b) => b.score - a.score || a.e.title.length - b.e.title.length);
  return scored.slice(0, limit).map(s => s.e);
}
