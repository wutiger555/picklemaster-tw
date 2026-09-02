# 🔍 SEO 優化與 Google Search Console 設定指南

本指南說明如何將網站提交給 Google 並最大化搜尋曝光度。

---

## 📋 目前已完成的 SEO 優化

### 1. ✅ Meta 標籤優化
- **標題**：包含主要關鍵字「台灣匹克球場地圖」
- **描述**：155 字以內，包含長尾關鍵字
- **關鍵字**：22+ 個相關關鍵字

### 2. ✅ 結構化資料 (Schema.org)
- `WebPage` - 頁面資訊
- `ItemList` - 球場列表
- `SportsActivityLocation` - 各球場詳細資訊
- `WebApplication` - 地圖應用功能
- `LocalBusiness` - 服務區域

### 3. ✅ Sitemap.xml
- 路徑：`/public/sitemap.xml`
- 已將 `/courts` 頁面優先級設為 1.0
- 包含 image 標籤

### 4. ✅ Robots.txt
- 允許所有搜尋引擎爬取
- 指向 sitemap 位置

### 5. ✅ Canonical URL
- 每頁都有 canonical 標籤避免重複內容

---

## 🚀 提交到 Google Search Console 步驟

### Step 1: 進入 Google Search Console
1. 前往 https://search.google.com/search-console
2. 使用你的 Google 帳號登入

### Step 2: 新增網站資源
1. 點擊左上角的下拉選單
2. 選擇「+ 新增資源」
3. 選擇「URL 前置字元」類型
4. 輸入：`https://picklemastertw.com`
5. 點擊「繼續」

### Step 3: 驗證網站所有權
選擇以下其中一種驗證方式：

#### 方法 A: HTML 檔案驗證（推薦）
1. 下載 Google 提供的 HTML 驗證檔案
2. 將檔案放入 `/public/` 目錄
3. 部署網站
4. 回到 Search Console 點擊「驗證」

#### 方法 B: HTML 標籤驗證
1. 複製 Google 提供的 meta 標籤
2. 在 `index.html` 的 `<head>` 中加入：
```html
<meta name="google-site-verification" content="你的驗證碼" />
```
3. 部署網站後點擊「驗證」

#### 方法 C: DNS 驗證
1. 到你的網域管理面板
2. 加入 Google 提供的 TXT 記錄
3. 等待 DNS 傳播（可能需要數小時）
4. 回到 Search Console 點擊「驗證」

### Step 4: 提交 Sitemap
1. 驗證成功後，點擊左側選單「Sitemap」
2. 在「新增 Sitemap」欄位輸入：`sitemap.xml`
3. 點擊「提交」
4. 狀態會顯示「成功」

### Step 5: 手動要求編入索引
1. 在 Search Console 頂部搜尋欄輸入：`https://picklemastertw.com/courts`
2. 點擊「要求編入索引」
3. 對其他重要頁面重複此步驟：
   - `https://picklemastertw.com/`
   - `https://picklemastertw.com/rules`
   - `https://picklemastertw.com/equipment`
   - `https://picklemastertw.com/learning`

---

## 📊 後續監測

### 每週檢查
1. **涵蓋範圍報告**：查看有多少頁面被索引
2. **成效報告**：查看曝光次數、點擊次數、排名
3. **行動裝置可用性**：確保無錯誤

### 預期時程
- **24-48 小時**：Google 開始爬取
- **1-2 週**：主要頁面開始出現在搜尋結果
- **1-3 個月**：排名逐漸穩定

---

## 🎯 額外優化建議

### 1. 建立外部連結 (Backlinks)
- 向台灣匹克球相關社群分享網站
- 與匹克球協會合作
- 在 PTT、Dcard 等論壇分享球場資訊

### 2. 持續更新內容
- 定期新增球場資訊
- 更新球場開放時間、價格
- 新增使用者評價

### 3. 社群媒體分享
- 在 Facebook 匹克球社團分享
- 建立 Instagram 帳號
- 在 LINE 群組推廣

### 4. 提交到其他搜尋引擎
- **Bing Webmaster Tools**: https://www.bing.com/webmasters
- **Baidu 站長平台** (可選): https://ziyuan.baidu.com

---

## 🔧 技術檢查清單

- [x] HTTPS 安全連線
- [x] 行動裝置響應式設計
- [x] 快速載入速度
- [x] 語意化 HTML
- [x] 圖片 alt 標籤
- [x] 麵包屑導覽
- [x] Canonical URL
- [x] Hreflang 標籤 (zh-TW)
- [x] Open Graph 標籤
- [x] Twitter Cards

---

## 📞 需要協助？

如有任何問題，可參考：
- [Google Search Console 說明](https://support.google.com/webmasters)
- [Google SEO 入門指南](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

---

*最後更新：2025-12-10*
