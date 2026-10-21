/**
 * 球場面數的顯示規則。
 *
 * `courts_count === 0` 代表「場館沒有公開面數」，不是「有 0 面場地」。
 * 2026-10-21 收 OIN 匹克基地 林口場與匹克立 PickleRi 時遇到這個情況：兩座都確認
 * 存在且營業中（OIN 有 26 則評論、4.9 星），但官網、社群、地圖、各家目錄都查不到
 * 面數。填一個數字是造假，直接印 `{courts_count} 面` 則會在球場頁、地圖 popup、
 * 搜尋結果與 SEO title/description 裡變成「0 面球場」——同樣是假資訊。
 *
 * 所以面數改走這裡統一輸出。排序與加總不用特別處理：`b.courts_count - a.courts_count`
 * 會自然把未公告的排到最後，`reduce` 加 0 也不影響總面數。
 */

/** 面數未公告時的統一字樣 */
export const COURTS_COUNT_UNKNOWN = '面數未公告';

/** 是否為「未公告」 */
export const isCourtsCountUnknown = (n: number) => !n || n <= 0;

/**
 * 標籤用（卡片、晶片、popup、列表）。
 * compact = true 時不留空格，給 SEO title 這種要緊湊的地方用。
 */
export const formatCourts = (n: number, compact = false) =>
  isCourtsCountUnknown(n) ? COURTS_COUNT_UNKNOWN : compact ? `${n}面` : `${n} 面`;

/** 句子用（FAQ 答案、meta description）。 */
export const formatCourtsPhrase = (n: number) =>
  isCourtsCountUnknown(n) ? '面數未對外公告' : `共 ${n} 面球場`;

/**
 * SEO title 片段。title 的格式是「…・{室內}{面數}{收費}」，面數是數字時緊貼著讀得通
 * （室內4面收費），但換成「面數未公告」就會黏成「室內面數未公告收費」，
 * 所以未公告時自己補上前後分隔符。
 */
export const formatCourtsTitleSegment = (n: number) =>
  isCourtsCountUnknown(n) ? `・${COURTS_COUNT_UNKNOWN}・` : `${n}面`;
