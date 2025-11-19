# 新聞區塊維護指南 (News Maintenance Guide)

本文件說明如何維護 `PickleMaster TW` 網站中的「匹克球新知」區塊。

## 1. 資料位置
所有新聞資料皆儲存於：`src/data/newsData.ts`

## 2. 如何新增新聞
請直接編輯 `src/data/newsData.ts` 檔案，在 `NEWS_DATA` 陣列中新增一個物件。

### 資料格式
```typescript
{
  id: 'unique-id-20250101', // 唯一識別碼，建議包含日期以避免重複
  title: '新聞標題',
  summary: '新聞摘要（建議 50-100 字）',
  date: '2025-01-01', // 發布日期 (YYYY-MM-DD)
  category: 'Taiwan', // 類別：Taiwan, International, Equipment, Courts, Tournament
  image: 'https://example.com/image.jpg', // 圖片連結 (建議使用 Unsplash 或圖床)
  source: '新聞來源名稱',
  link: 'https://original-source.com', // 原始新聞連結
  verified: true, // 是否已查證 (True/False)
  tags: ['Tag1', 'Tag2'] // 標籤 (選填)
}
```

### 圖片建議
- 使用高品質、橫向的圖片。
- 若無版權圖片，可使用 Unsplash 等免費圖庫。
- 圖片比例建議為 16:9。

## 3. 新球場資訊 (New Courts)
針對使用者特別關注的「新球場」資訊：
1. 將 `category` 設為 `'Courts'`。
2. 在 `summary` 中清楚描述球場地點、面數、以及是室內或室外。
3. 建議在 `tags` 中加入縣市名稱（如 `['Taipei', 'New Court']`），方便未來擴充搜尋功能。

## 4. 假新聞防治 (Verification)
為了確保資訊正確性：
- **查證來源**：發布前請務必確認消息來源是否可靠（如官方協會公告、知名新聞媒體）。
- **內部控管**：雖然前台已移除「已查證」標籤以避免誤導使用者，但維護者在新增資料時仍應自行查證。
- **來源標示**：務必在 `source` 與 `link` 欄位清楚標示原始出處。

## 5. 舊新聞處理 (Archiving)
為了保持版面整潔與資訊時效性：
- **自動過濾**：系統已設定自動過濾掉 `archived: true` 的新聞。
- **何時歸檔**：
    - **賽事新聞**：賽事結束後 1 個月可歸檔。
    - **一般新聞**：超過 6 個月至 1 年可歸檔。
    - **球場/裝備**：若資訊仍有價值（如球場介紹），可長期保留，不需歸檔。
- **操作方式**：在 `newsData.ts` 中將該則新聞的 `archived` 欄位設為 `true` 即可。

```typescript
{
  // ... 其他欄位
  archived: true // 加入此行即可隱藏新聞
}
```

## 6. 未來擴充建議
- 若新聞量變大，可考慮將 `newsData.ts` 遷移至 CMS (如 Contentful, Strapi) 或資料庫。
- 可增加「搜尋」功能，利用 `tags` 欄位進行篩選。
