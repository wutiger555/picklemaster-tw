// 球場異動紀錄：/courts/updates
//
// 每一筆都對應一次實際的資料變更（可在 git log -- public/data/courts.json 找到），
// 不寫沒發生過的事。從 2026-07-30 開始記錄——那之前的資料曾重用過 id，歷史對不起來。
//
// 新增一筆的時機：courts.json 有新增、刪除、座標或地址修正、營業狀態變更時。
// courtIds 放「還在站上」的球場（頁面會連到球場頁並顯示目前名稱）；
// 已刪除的球場沒有頁面，名稱寫在 removedNames。
// scripts/generate-static-pages.cjs 用 loadTsModule 讀同一份資料產生預渲染頁。

export type CourtUpdateKind = 'added' | 'corrected' | 'removed' | 'status';

export interface CourtUpdate {
  date: string; // YYYY-MM-DD
  kind: CourtUpdateKind;
  title: string;
  detail: string;
  courtIds?: number[];
  removedNames?: string[];
}

export const COURT_UPDATE_KIND_LABEL: Record<CourtUpdateKind, string> = {
  added: '新增',
  corrected: '修正',
  removed: '移除',
  status: '營業狀態',
};

// 新的在前
export const COURT_UPDATES: CourtUpdate[] = [
  {
    date: '2026-10-06',
    kind: 'added',
    title: '再新增 12 座：高雄 4、新北 2、台中 2，台北、台南、彰化、花蓮各 1',
    detail: '包含內湖 24 小時的 Pick Le Mode、蘆洲兩座熱門球館（蘆沐、沐洲）、高雄三民與鳥松的三座專用館、5 月啟用的高雄鼓山運動中心，以及台中海線可隔出 8 面場的清水運動中心。每座都先在地圖上確認營業中，面數未公告者標「待查證」。',
    courtIds: [175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186],
  },
  {
    date: '2026-10-06',
    kind: 'removed',
    title: '移除「臺北市網球中心匹克球場」',
    detail: '這筆的地址與電話指向士林福林路，但臺北市網球中心實際在內湖民權東路；場館官網沒有提到匹克球，運動部 iPlay 的設施清單也只有網球、羽球等項目。唯一的來源是一篇內容錯誤百出的部落格，查證不到任何支持，所以移除。',
    removedNames: ['臺北市網球中心匹克球場'],
  },
  {
    date: '2026-10-06',
    kind: 'corrected',
    title: '雙北河濱與公園場：面數、地址與廚房線',
    detail: '華中河濱由 6 面更正為 4 面（兩個獨立來源一致），並補記擋風網與照明延至午夜；至善公園地址更正為至善路一段，且實際只有羽球場標線、沒有匹克球廚房線。另為大都會公園、天母、青年公園、明德球場標記「有永久廚房線」。',
    courtIds: [26, 9, 1, 51, 60, 61],
  },
  {
    date: '2026-10-06',
    kind: 'corrected',
    title: 'PIKA PIKA 原名與 DNA 電話',
    detail: '彰化 PIKA PIKA 就是原本的「花壇 PICKLE KING 匹克王」，與台中匹克王是不同場館；桃園 DNA Pickleball Club 補上電話 03-355-5374。',
    courtIds: [113, 161],
  },
  {
    date: '2026-10-05',
    kind: 'added',
    title: '台南 Heavy Dinker',
    detail: '台南南區鯤鯓路的匹克球專用場，LUZZ 球拍合作場域之一。官方未公告室內外與面數，本站依建物型態暫列室內 2 面，待查證。',
    courtIds: [174],
  },
  {
    date: '2026-10-05',
    kind: 'added',
    title: '一次新增 12 座：台北 1、新北 3、台中 3、桃園 1、新竹縣 1、台南 3',
    detail: '線索來自球拍品牌合作館名單、場館開幕報導與球友社群，每座都先在地圖上確認營業中並取得座標。包含 10/4 剛開幕的花博 THE COURT、台中南屯的 24 小時冷氣館，以及台南三座新場。面數未公告者標「待查證」。',
    courtIds: [162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173],
  },
  {
    date: '2026-10-05',
    kind: 'corrected',
    title: '修正 3 座球場位置',
    detail: '雲林 PK Park 原座標偏離 5.7 公里，門牌更正為興南里 30-6 號；台南府平公園偏離 1.2 公里；高雄橋頭公園偏離約 220 公尺，補上隆豐路門牌。',
    courtIds: [117, 14, 125],
  },
  {
    date: '2026-10-01',
    kind: 'added',
    title: '桃園 DNA Pickleball Club',
    detail: '桃園區春日路的 2 面專用館，提供場地租借、教練課與 Open Play。',
    courtIds: [161],
  },
  {
    date: '2026-10-01',
    kind: 'corrected',
    title: '彰化 PIKA PIKA 位置修正',
    detail: '同門牌的地圖地標與本站相差約 1.6 公里，改用正確座標。',
    courtIds: [113],
  },
  {
    date: '2026-10-01',
    kind: 'status',
    title: '匹克那邊 Pickle Side 仍暫停營業',
    detail: '十月複查仍標示暫時關閉，維持狀態並更新查證日。',
    courtIds: [92],
  },
  {
    date: '2026-09-23',
    kind: 'added',
    title: '台中日落匹克球 Sunset Pickleball',
    detail: '南屯 24 小時營業的室內館，透過官方預約頁訂場。',
    courtIds: [160],
  },
  {
    date: '2026-09-19',
    kind: 'added',
    title: '從匹克球協會名錄補進 22 座社群球敘場',
    detail: '比對中華民國匹克球協會「找球場」名錄後補進。多為學校與社區活動中心的固定球敘點，不是隨時可進場的場館，每座都寫明球敘時段與帶團者聯絡方式。',
    courtIds: [138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159],
  },
  {
    date: '2026-09-11',
    kind: 'corrected',
    title: '嘉義、高雄鼓山兩座地址與位置更正',
    detail: '嘉義市國民運動中心地址更正為彌陀路 327 巷 15 號、電話一併更新，座標原偏離約 1.2 公里；高雄鼓山匹克球場地址更正為雄峰路 18 號，座標原偏離約 1.5 公里。',
    courtIds: [28, 123],
  },
  {
    date: '2026-09-06',
    kind: 'added',
    title: '淡水盧彥勳匹克球俱樂部',
    detail: '真理大學旁的六面室內專用館，2025 年 11 月開幕。同日修正淡水 P.DANG 球館座標。',
    courtIds: [137, 53],
  },
  {
    date: '2026-09-06',
    kind: 'added',
    title: '台中補進三座漏收的球館',
    detail: '從球友社群貼文找到，都在地圖上確認營業中。匹克王是營運已久的成熟場館，只是本站一直漏收。',
    courtIds: [134, 135, 136],
  },
  {
    date: '2026-09-06',
    kind: 'removed',
    title: '合併潭子重複項',
    detail: '潭子只有一座國民暨兒童運動中心，另一筆記載的門牌查無此地址，併入既有資料。',
    courtIds: [21],
    removedNames: ['潭子國民運動中心匹克球場（重複項）'],
  },
  {
    date: '2026-09-02',
    kind: 'corrected',
    title: '依運動部官方資料修正公有場地座標',
    detail: '比對運動部「全國運動場館資訊網 iPlay」後，修正 43 座公有場地座標，其中 11 座偏離超過 1 公里（最大 2.4 公里），並補上交通方式、照明與空調等官方資料。',
    courtIds: [7, 8, 9, 10, 12, 15, 16, 17, 18, 19, 25, 26, 31, 33, 34, 36, 38, 40, 41, 43, 44, 46, 47, 48, 50, 55, 60, 61, 65, 74, 81, 84, 85, 86, 87, 88, 89, 90, 102, 103, 118, 124, 129],
  },
  {
    date: '2026-09-02',
    kind: 'added',
    title: '新北匹克八里',
    detail: '八里運動中心內的匹克球場。',
    courtIds: [133],
  },
  {
    date: '2026-09-02',
    kind: 'status',
    title: '匹克那邊 Pickle Side 暫停營業',
    detail: '地圖標示暫時關閉、官方粉專已移除，球場頁改以紅色標籤提示。',
    courtIds: [92],
  },
  {
    date: '2026-09-02',
    kind: 'removed',
    title: '移除 LOHO 龍潭重複項',
    detail: '樂活匹克球官網只有中壢與板橋兩館，沒有龍潭館；該筆是中壢館的重複項。',
    courtIds: [97],
    removedNames: ['Loho Pickleball Club 龍潭'],
  },
  {
    date: '2026-08-23',
    kind: 'added',
    title: '新竹 P9 複合式運動競技館',
    detail: '寶山鄉的室內複合館。',
    courtIds: [132],
  },
  {
    date: '2026-07-30',
    kind: 'added',
    title: '新北 PGC 三重館、桃園楊梅體育園區',
    detail: 'PGC 三重館是 24 小時無人自助的 2 面場；楊梅體育園區為公營室內 4 面場。',
    courtIds: [130, 131],
  },
  {
    date: '2026-07-30',
    kind: 'removed',
    title: '移除兩筆查無實體的資料',
    detail: 'Social N Pickle 龜山「24 小時場」在官方預約系統中查無此點，為大湖路店的重複項；YT SPORT 平鎮館標示「即將開幕」逾三個月，官網沒有這間館也沒有匹克球。',
    courtIds: [5],
    removedNames: ['Social N Pickle 桃園龜山 24 小時場', 'YT SPORT 平鎮匹克球館'],
  },
];
