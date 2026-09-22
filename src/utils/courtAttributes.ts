// 屬性型球場清單頁（/courts/free 等）的單一資料來源。
//
// 為什麼要有這些頁：GSC 顯示屬性型查詢（免費／室內／24 小時）佔全站查詢曝光 14%，
// 但站上沒有對應的落地頁 —— 篩選只寫進 query string（/courts?fee=free），
// 那些網址不在 sitemap、沒有預渲染、canonical 又指回 /courts/，對 Google 等於不存在。
//
// 只做全國層級。縣市 × 屬性有 56 種組合，其中 33 種只有 1-2 座，
// 拆成獨立頁就是薄頁；那部分改在既有的城市頁裡分組呈現。
//
// scripts/generate-static-pages.cjs 會用 loadTsModule() 直接讀這支檔案做預渲染，
// 所以述詞與文案只有這一份，不會漂。
import type { Court } from '../types';

export interface CourtAttribute {
  slug: string;
  /** 短標籤，用在麵包屑與交叉連結 */
  label: string;
  h1: string;
  /** 頁面導言，也是 meta description 的開頭 */
  intro: string;
  match: (c: Court) => boolean;
}

/**
 * 是否 24 小時可進場。scripts/generate-static-pages.cjs 的 courtIs24h 直接用這一份，
 * 城市頁的「24 小時場 N 座」與 /courts/24h 才不會自相矛盾。
 *
 * 兩個容易搞錯的地方：
 *   - 「06:00-24:00」不是 24 小時，那個 24 是結束時刻（凌晨到清晨是關的）。
 *     所以要比對「24 小時」而不是只比對「24」。
 *   - 「全天開放」是 24 小時（公園、河濱場多半這樣寫），原本的規則漏掉了 12 座。
 *     但「全天（週二、四開放至 21:00）」有但書，用 ^全天開放 把它排除。
 */
export const is24h = (openingHours?: string): boolean => {
  const h = openingHours || '';
  return /24\s*小時/.test(h) || /^全天開放/.test(h);
};

export const COURT_ATTRIBUTES: CourtAttribute[] = [
  {
    slug: 'free',
    label: '免費',
    h1: '全台免費匹克球場',
    intro: '不用付場地費就能打的匹克球場，多為公園、河濱與學校場地。多數先到先打，熱門時段需要排隊輪場，建議自備球網確認方式與球。',
    match: (c) => c.fee === 'free',
  },
  {
    slug: 'indoor',
    label: '室內',
    h1: '全台室內匹克球場',
    intro: '不受天氣影響的室內匹克球場，包含國民運動中心時段與民營室內球館。下雨天與夏天午後最實用，部分場館有空調。',
    match: (c) => c.type === 'indoor',
  },
  {
    slug: 'outdoor',
    label: '戶外・風雨',
    h1: '全台戶外與風雨匹克球場',
    intro: '戶外球場與有頂棚的風雨球場。風雨球場下小雨仍可打，是戶外場與室內場之間的折衷選擇。',
    match: (c) => c.type !== 'indoor',
  },
  {
    slug: '24h',
    label: '24 小時',
    h1: '全台 24 小時匹克球場',
    intro: '標示 24 小時開放的匹克球場，適合早班前或下班後很晚才有空的人。多為戶外場地，夜間是否有照明請看各場地說明。',
    match: (c) => is24h(c.opening_hours),
  },
];

export const getAttributeBySlug = (slug?: string): CourtAttribute | undefined =>
  COURT_ATTRIBUTES.find((a) => a.slug === slug);
