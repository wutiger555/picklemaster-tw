# 專案架構文檔 (Project Structure)

本文檔描述 Picklemaster Taiwan 的專案架構和組織方式。

## 📁 目錄結構

```
picklemaster-tw/
├── docs/                          # 建置輸出目錄（部署到 GitHub Pages）
│   └── guides/                    # 開發指南文檔
│       ├── ADVERTISING_GUIDE.md   # 廣告整合指南
│       ├── MOBILE_OPTIMIZATION.md # 移動端優化文檔
│       ├── NEWS_MAINTENANCE.md    # 新聞維護指南
│       ├── UI_UPGRADE_GUIDE.md    # UI 升級指南
│       └── POSTCSS_FIX.md         # PostCSS 問題修復記錄
├── public/                        # 靜態資源
│   ├── logo.png                   # 網站 Logo
│   ├── og-image.png               # Open Graph 圖片
│   └── ...
├── src/                           # 源代碼
│   ├── components/                # React 組件
│   │   ├── ads/                   # 廣告組件
│   │   ├── common/                # 共用組件
│   │   ├── court/                 # 球場相關組件
│   │   ├── equipment/             # 裝備相關組件
│   │   ├── game/                  # 遊戲組件
│   │   ├── home/                  # 首頁組件
│   │   ├── layout/                # 佈局組件
│   │   ├── learning/              # 學習路徑組件
│   │   ├── map/                   # 地圖組件
│   │   ├── news/                  # 新聞組件
│   │   ├── quiz/                  # 測驗組件
│   │   └── rules/                 # 規則教學組件
│   ├── data/                      # 數據文件
│   │   ├── courtsData.ts          # 球場數據
│   │   └── newsData.ts            # 新聞數據
│   ├── hooks/                     # 自定義 Hooks
│   ├── pages/                     # 頁面組件
│   ├── types/                     # TypeScript 類型定義
│   ├── utils/                     # 工具函數
│   │   ├── seo.ts                 # SEO 配置
│   │   ├── constants.ts           # 常量定義
│   │   └── animations.ts          # 動畫配置
│   ├── App.tsx                    # 主應用組件
│   ├── index.css                  # 全局樣式
│   └── main.tsx                   # 應用入口
├── CHANGELOG.md                   # 變更日誌
├── README.md                      # 專案說明
├── package.json                   # NPM 配置
├── tsconfig.json                  # TypeScript 配置
├── tailwind.config.js             # Tailwind CSS 配置
└── vite.config.ts                 # Vite 配置
```

## 🧩 核心組件架構

### 頁面 (Pages)
- `Home.tsx` - 首頁，包含 Hero、Features、News 等區塊
- `Courts.tsx` - 球場地圖頁面
- `Rules.tsx` - 規則教學頁面（互動式球場、3D 視圖、運動對比）
- `Equipment.tsx` - 裝備推薦頁面
- `Learning.tsx` - 學習資源頁面
- `LearningPaths.tsx` - 學習路徑頁面
- `Game.tsx` - 互動遊戲頁面
- `Scorer.tsx` - 計分器頁面
- `Resources.tsx` - 資源列表頁面
- `NewsDetail.tsx` - 新聞詳情頁面
- `About.tsx` - 關於頁面

### 共用組件 (Common Components)
- `SEOHead.tsx` - SEO 元數據管理
- `GlassCard.tsx` - Glassmorphism 卡片組件
- `Button.tsx` - 按鈕組件

### 佈局組件 (Layout)
- `Header.tsx` - 頂部導航欄
- `Footer.tsx` - 底部區塊

### 數據管理
- `courtsData.ts` - 包含 55+ 台灣球場的完整資料
- `newsData.ts` - 新聞文章數據
- `seo.ts` - 各頁面 SEO 配置

## 📦 技術棧

### 核心框架
- **React 19** - UI 框架
- **TypeScript 5.7** - 類型安全
- **Vite 7** - 建置工具

### UI/樣式
- **Tailwind CSS** - CSS 框架
- **Framer Motion** - 動畫庫

### 地圖/3D
- **Leaflet** - 互動地圖
- **React Three Fiber** - 3D 渲染

### 路由
- **React Router DOM** - 客戶端路由

### 部署
- **GitHub Pages** - 靜態網站託管
- **GitHub Actions** - 自動化部署

## 🎯 SEO 策略

### 關鍵字策略
**主要關鍵字**：
- 匹克球
- 匹克球台灣
- pickleball taiwan

**長尾關鍵字**：
- 匹克球規則
- 匹克球場地圖
- 匹克球教學
- 台北匹克球場
- 匹克球拍推薦

### 結構化數據 (Structured Data)
- **WebSite** - 網站基本資訊
- **Organization** - 組織資訊
- **SportsActivityLocation** - 球場位置
- **Course** - 學習課程
- **FAQPage** - 常見問題
- **HowTo** - 教學指南
- **BreadcrumbList** - 麵包屑導航

### Open Graph
- 所有頁面都有 OG 標籤
- 自定義 OG 圖片 (`og-image.png`)
- 支援社交媒體分享

## 🔌 第三方整合

### Google AdSense
- 客戶端 ID: `ca-pub-7062108661079564`
- 位置：`index.html` 第 50-52 行
- 廣告組件：`src/components/ads/AdBanner.tsx`

### Google Fonts
- **Inter** - 現代無襯線字體（用於品牌名稱和 UI）
- **Noto Sans TC** - 繁體中文字體（用於內容）

## 📱 響應式設計

### 斷點 (Breakpoints)
```javascript
{
  sm: '640px',  // 手機橫屏
  md: '768px',  // 平板直屏
  lg: '1024px', // 平板橫屏 / 小筆電
  xl: '1280px', // 桌面
  '2xl': '1536px' // 大螢幕
}
```

### 移動端優化
- 所有頁面支援響應式佈局
- 計分器支援橫屏/直屏自動適配
- 觸控友好的 UI 元素
- 觸覺反饋支援（計分器）

## 🚀 開發工作流程

### 本機開發
```bash
npm install       # 安裝依賴
npm run dev       # 啟動開發服務器 (port 5173)
```

### 建置
```bash
npm run build     # 生產環境建置
npm run preview   # 預覽建置結果
```

### 部署
- 推送到 `main` 分支自動觸發 GitHub Actions
- 建置結果部署到 `docs/` 目錄
- 自動發布到 GitHub Pages

## 🗂️ 文檔管理

### 核心文檔（根目錄）
- `README.md` - 專案說明和快速開始
- `CHANGELOG.md` - 版本變更記錄

### 開發指南（docs/guides/）
- `ADVERTISING_GUIDE.md` - 廣告整合
- `MOBILE_OPTIMIZATION.md` - 移動端優化
- `NEWS_MAINTENANCE.md` - 新聞維護
- `UI_UPGRADE_GUIDE.md` - UI 升級
- `POSTCSS_FIX.md` - 技術問題修復

## 📊 性能優化

### 程式碼分割
- 路由級別的程式碼分割
- 動態導入大型組件

### 圖片優化
- 使用 WebP 格式
- 適當的圖片尺寸
- Lazy loading

### SEO 優化
- Server-side rendering friendly
- 語義化 HTML
- 結構化數據
- Sitemap 生成

## 🔐 最佳實踐

### TypeScript
- 所有組件使用 TypeScript
- 嚴格模式啟用
- 類型定義集中在 `src/types/`

### 程式碼風格
- ESLint 配置
- Prettier 格式化
- 組件命名: PascalCase
- 文件命名: camelCase.ts 或 PascalCase.tsx

### Git 工作流程
- 建議功能更新到 CHANGELOG.md
- 提交訊息使用清楚的描述
- 遵循語義化版本控制

## 📈 未來規劃

### 短期目標
- [ ] SEO 排名優化至前 3 名
- [ ] 新增更多球場數據
- [ ] 影片教學整合

### 中期目標
- [ ] 用戶帳號系統
- [ ] 進度追蹤功能
- [ ] 社群論壇

### 長期目標
- [ ] 移動應用 (iOS/Android)
- [ ] 球場預訂系統整合
- [ ] 教練市集平台

---

## 🆘 常見問題

**Q: 如何添加新的球場數據？**
A: 編輯 `src/data/courtsData.ts`，按照現有格式添加新球場資訊。

**Q: 如何更新 SEO 配置？**
A: 編輯 `src/utils/seo.ts` 中對應頁面的配置。

**Q: 如何添加新聞？**
A: 按照 `docs/guides/NEWS_MAINTENANCE.md` 中的指南操作。

**Q: 建置失敗怎麼辦？**
A: 檢查 GitHub Actions 日誌，通常是 TypeScript 類型錯誤或缺少依賴。

---

**維護者**: Picklemaster Taiwan 團隊  
**最後更新**: 2025-01-20
