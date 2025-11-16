# 廣告系統整合指南

## 📢 匹克大師台灣 - 廣告系統使用說明

本文檔將詳細說明如何在網站中整合 Google AdSense 或其他廣告系統。

---

## 📋 目錄
1. [廣告組件概覽](#廣告組件概覽)
2. [Google AdSense 設定](#google-adsense-設定)
3. [廣告組件使用方法](#廣告組件使用方法)
4. [實際整合範例](#實際整合範例)
5. [測試模式說明](#測試模式說明)
6. [常見問題](#常見問題)

---

## 廣告組件概覽

我們已經創建了兩個廣告組件：

### 1. **AdBanner** 組件
位置：`src/components/ads/AdBanner.tsx`

**功能：**
- 支援多種廣告格式（橫幅、側邊、方形）
- 開發測試模式（顯示佔位符）
- Google AdSense 整合準備

**可用格式：**
- `horizontal` - 橫幅廣告 (寬100% × 高24-32)
- `vertical` - 側邊廣告 (寬64-全寬 × 高96)
- `square` - 方形廣告 (寬64 × 高64)

### 2. **AdSidebar** 組件
位置：`src/components/ads/AdSidebar.tsx`

**功能：**
- 側邊欄廣告展示
- 推薦連結區塊
- 黏性定位（跟隨滾動）

---

## Google AdSense 設定

### 步驟 1：申請 Google AdSense 帳戶

1. 前往 [Google AdSense](https://www.google.com/adsense/)
2. 使用 Google 帳戶登入
3. 填寫網站資訊並提交申請
4. 等待 Google 審核（通常需要 1-3 天）

### 步驟 2：取得 AdSense 發布者 ID

審核通過後，在 AdSense 後台取得您的發布者 ID：
- 格式：`ca-pub-XXXXXXXXXXXXXXXX`
- 位置：AdSense → 帳戶 → 帳戶資訊

### 步驟 3：在網站中添加 AdSense 腳本

**修改 `index.html`：**

找到 `/home/user/picklemaster-tw/index.html`，在 `<head>` 區塊中添加：

\`\`\`html
<!-- Google AdSense -->
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossorigin="anonymous">
</script>
\`\`\`

**⚠️ 重要：** 將 `ca-pub-XXXXXXXXXXXXXXXX` 替換為您的實際發布者 ID。

---

## 廣告組件使用方法

### 使用 AdBanner 組件

#### 1. 基本使用（測試模式）

在任何頁面中引入並使用：

\`\`\`tsx
import AdBanner from '../components/ads/AdBanner';

function MyPage() {
  return (
    <div>
      {/* 橫幅廣告（測試模式） */}
      <AdBanner
        format="horizontal"
        testMode={true}
      />
    </div>
  );
}
\`\`\`

#### 2. 生產環境使用（真實廣告）

\`\`\`tsx
import AdBanner from '../components/ads/AdBanner';

function MyPage() {
  return (
    <div>
      {/* 橫幅廣告（真實廣告） */}
      <AdBanner
        format="horizontal"
        testMode={false}
        adSlot="1234567890"  // 您的廣告單元 ID
      />
    </div>
  );
}
\`\`\`

#### 3. 取得廣告單元 ID

1. 登入 Google AdSense
2. 前往：廣告 → 單元 → 建立新單元
3. 選擇「顯示廣告」
4. 設定廣告名稱和大小
5. 複製廣告單元 ID（格式：`1234567890`）

#### 4. 修改 AdBanner 組件的發布者 ID

找到 `src/components/ads/AdBanner.tsx`，第 62 行：

\`\`\`tsx
<ins
  className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-XXXXXXXXXX"  // ← 替換為您的發布者 ID
  data-ad-slot={adSlot}
  data-ad-format={format === 'horizontal' ? 'horizontal' : 'auto'}
  data-full-width-responsive="true"
/>
\`\`\`

---

## 實際整合範例

### 範例 1：在首頁添加橫幅廣告

**檔案：** `src/pages/Home.tsx`

\`\`\`tsx
import AdBanner from '../components/ads/AdBanner';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* 英雄區塊 */}
      <section className="hero-section">
        {/* ... 原有內容 ... */}
      </section>

      {/* 第一個橫幅廣告 */}
      <div className="container mx-auto px-4 py-8">
        <AdBanner
          format="horizontal"
          testMode={false}  // 生產環境設為 false
          adSlot="1234567890"  // 您的廣告單元 ID
        />
      </div>

      {/* 核心功能區塊 */}
      <section className="features-section">
        {/* ... 原有內容 ... */}
      </section>

      {/* 第二個橫幅廣告 */}
      <div className="container mx-auto px-4 py-8">
        <AdBanner
          format="horizontal"
          testMode={false}
          adSlot="0987654321"  // 另一個廣告單元 ID
        />
      </div>
    </div>
  );
};
\`\`\`

### 範例 2：在球場頁面添加側邊欄廣告

**檔案：** `src/pages/Courts.tsx`

\`\`\`tsx
import AdSidebar from '../components/ads/AdSidebar';

const Courts = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主要內容區 */}
          <div className="lg:col-span-3">
            {/* 球場列表 */}
            {/* ... 原有內容 ... */}
          </div>

          {/* 側邊欄廣告（僅在桌面版顯示） */}
          <div className="hidden lg:block">
            <AdSidebar
              testMode={false}  // 生產環境設為 false
              adSlot="1111111111"  // 側邊欄廣告單元 ID
            />
          </div>
        </div>
      </div>
    </div>
  );
};
\`\`\`

### 範例 3：在文章中間插入方形廣告

**檔案：** `src/pages/Rules.tsx`

\`\`\`tsx
import AdBanner from '../components/ads/AdBanner';

const Rules = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* 第一部分內容 */}
      <section>
        <h2>規則說明</h2>
        <p>...</p>
      </section>

      {/* 中間插入方形廣告 */}
      <div className="flex justify-center my-8">
        <AdBanner
          format="square"
          testMode={false}
          adSlot="2222222222"
        />
      </div>

      {/* 第二部分內容 */}
      <section>
        <h2>進階技巧</h2>
        <p>...</p>
      </section>
    </div>
  );
};
\`\`\`

---

## 測試模式說明

### 何時使用測試模式？

- ✅ **開發階段** - 設定 `testMode={true}`
- ✅ **本地測試** - 設定 `testMode={true}`
- ❌ **生產環境** - 設定 `testMode={false}`

### 測試模式外觀

測試模式會顯示：
- 📢 廣告位置圖示
- 虛線邊框
- "廣告位置" 文字
- 廣告類型說明

### 切換到生產模式

只需將所有廣告組件的 `testMode` 改為 `false`：

\`\`\`tsx
// 開發階段
<AdBanner format="horizontal" testMode={true} />

// 生產環境
<AdBanner
  format="horizontal"
  testMode={false}
  adSlot="1234567890"
/>
\`\`\`

---

## 常見問題

### Q1: 廣告不顯示怎麼辦？

**A:** 檢查以下項目：
1. ✅ 確認已在 `index.html` 中添加 AdSense 腳本
2. ✅ 確認發布者 ID 正確（`ca-pub-XXXXXXXXXXXXXXXX`）
3. ✅ 確認廣告單元 ID 正確
4. ✅ 確認 `testMode={false}`
5. ✅ 檢查瀏覽器控制台是否有錯誤訊息
6. ✅ 確認網站已部署到公開域名（本地開發無法顯示真實廣告）

### Q2: 為什麼本地測試看不到廣告？

**A:** Google AdSense 只在公開域名上顯示廣告。本地開發（localhost）無法顯示。建議：
- 開發階段使用 `testMode={true}`
- 部署到 GitHub Pages 後使用 `testMode={false}`

### Q3: 如何調整廣告大小？

**A:** 修改 `src/components/ads/AdBanner.tsx` 中的 `getAdStyles()` 函數：

\`\`\`tsx
const getAdStyles = () => {
  switch (format) {
    case 'horizontal':
      return 'w-full h-32 md:h-40';  // 調整高度
    case 'vertical':
      return 'w-full md:w-80 h-96';  // 調整寬度和高度
    case 'square':
      return 'w-80 h-80';  // 調整方形大小
    default:
      return 'w-full h-24';
  }
};
\`\`\`

### Q4: 如何在手機版隱藏廣告？

**A:** 使用 Tailwind CSS 的響應式class：

\`\`\`tsx
{/* 僅在桌面版顯示 */}
<div className="hidden md:block">
  <AdBanner format="horizontal" testMode={false} adSlot="123" />
</div>

{/* 僅在手機版顯示 */}
<div className="block md:hidden">
  <AdBanner format="square" testMode={false} adSlot="456" />
</div>
\`\`\`

### Q5: 廣告收益需要多久才能看到？

**A:**
- AdSense 收益每月結算
- 需達到 $100 美元才能領取
- 付款通常在每月 21-26 日之間

### Q6: 可以使用其他廣告平台嗎？

**A:** 可以！只需修改 `AdBanner.tsx` 組件：

\`\`\`tsx
// 將 AdSense 代碼替換為其他平台的代碼
<div ref={adRef} className={getAdStyles()}>
  {/* 插入其他廣告平台的代碼 */}
</div>
\`\`\`

---

## 建議的廣告位置

根據使用者體驗，我們建議在以下位置放置廣告：

### 1. **首頁 (Home)**
- ✅ 英雄區塊下方（橫幅）
- ✅ 核心功能區塊後（橫幅）
- ✅ CTA 區塊前（橫幅）

### 2. **球場地圖 (Courts)**
- ✅ 側邊欄（側邊廣告）
- ✅ 球場列表中間（橫幅）

### 3. **規則教學 (Rules)**
- ✅ 每個 Tab 內容下方（橫幅）

### 4. **裝備指南 (Equipment)**
- ✅ 側邊欄（側邊廣告）
- ✅ 各個 Tab 內容中間（方形）

### 5. **學習路徑 (Learning Paths)**
- ✅ 測驗前（橫幅）
- ✅ 學習路徑卡片之間（方形）

---

## 快速開始檢查清單

- [ ] 1. 申請 Google AdSense 帳戶
- [ ] 2. 取得發布者 ID（`ca-pub-XXXXXXXXXXXXXXXX`）
- [ ] 3. 在 `index.html` 添加 AdSense 腳本
- [ ] 4. 創建廣告單元並取得廣告單元 ID
- [ ] 5. 修改 `AdBanner.tsx` 中的發布者 ID
- [ ] 6. 在各頁面添加廣告組件
- [ ] 7. 設定 `testMode={false}`
- [ ] 8. 部署到 GitHub Pages
- [ ] 9. 等待廣告開始顯示（可能需要幾小時）
- [ ] 10. 監控 AdSense 後台數據

---

## 技術支援

如有問題，請參考：
- [Google AdSense 說明中心](https://support.google.com/adsense)
- [AdSense 政策中心](https://support.google.com/adsense/answer/48182)

---

**最後更新：** 2025-11-16
**作者：** Max Wu (@wutiger555)
