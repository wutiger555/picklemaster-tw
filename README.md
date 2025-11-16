# 匹克大師台灣 | Picklemaster Taiwan

> 台灣最完整的匹克球（Pickleball）學習平台

[![Deploy to GitHub Pages](https://github.com/wutiger555/picklemaster-tw/actions/workflows/deploy.yml/badge.svg)](https://github.com/wutiger555/picklemaster-tw/actions/workflows/deploy.yml)

**線上體驗**：[https://wutiger555.github.io/picklemaster-tw/](https://wutiger555.github.io/picklemaster-tw/)

---

## 專案簡介

**匹克大師台灣（Picklemaster Taiwan）** 是專為台灣匹克球愛好者打造的一站式學習與資源平台，提供：

- **全台 55+ 球場地圖**：涵蓋台北、台中、高雄、台南等全台各縣市球場資訊
- **互動式規則教學**：點擊式球場圖解，直觀學習場地規則與區域說明
- **3D 球場配置**：360 度檢視球場結構，深入了解站位與策略
- **裝備選購指南**：球拍完全指南、職業選手裝備推薦、AI 智能推薦系統
- **系統化學習路徑**：從新手入門到進階技巧的完整學習路線
- **互動式遊戲**：實作完整匹克球規則與進階擊球控制的網頁遊戲

無論你是剛接觸匹克球的新手，還是想精進技術的進階玩家，這裡都能找到你需要的資源。

---

## 核心功能

### 1. 全台球場地圖
- 超過 55 個球場資訊，持續更新中
- 互動式地圖標示球場位置
- 篩選功能：依地區、室內/室外、收費/免費分類
- 球場詳細資訊：地址、開放時間、設施狀況
- 一鍵導航至球場

### 2. 規則教學
- **互動式球場**：點擊不同區域即時顯示規則說明
- **3D 球場配置**：360 度旋轉檢視，學習站位與規則
- **球路徑動畫**：視覺化展示發球、回球、雙跳規則

### 3. 裝備指南
- **球拍完全指南**：材質、重量、平衡點、握把尺寸完整解析
- **職業選手裝備**：頂尖選手使用的球拍型號與規格
- **智能推薦系統**：根據技術程度、打法風格、預算推薦適合球拍

### 4. 學習路徑
- **新手路徑**：基礎規則、握拍姿勢、發球技巧
- **中階路徑**：網前技術、雙打配合、戰術應用
- **進階路徑**：高階技巧、比賽策略、心理素質
- **進度追蹤**：自動儲存學習進度（LocalStorage）

### 5. 互動遊戲
- 完整實作匹克球規則（發球、雙跳區、得分系統）
- 進階擊球控制（方向、力道、旋轉）
- 真實物理引擎模擬球的彈跳與運動
- 適合新手練習與熟悉規則

### 6. 資源中心
- 台灣匹克球協會官方連結
- 國際匹克球組織資訊
- 線上教學影片整理
- 賽事資訊與活動公告

---

## 技術架構

### 核心技術
- **React 19** - 最新版 UI 框架
- **TypeScript** - 完整類型安全
- **Vite 7** - 極速開發與建置工具

### UI 與動畫
- **Tailwind CSS** - 響應式設計系統
- **Framer Motion** - 流暢的頁面轉場與 UI 動畫
- **GSAP** - 複雜動畫與滾動效果

### 3D 與互動
- **Three.js** - 3D 圖形渲染引擎
- **React Three Fiber** - React 的 Three.js 整合
- **@react-three/drei** - Three.js 實用工具集

### 地圖與數據
- **Leaflet.js** - 開源互動式地圖
- **react-leaflet** - React 的 Leaflet 封裝
- **OpenStreetMap** - 地圖資料來源

### 其他功能
- **React Router DOM** - 單頁應用路由管理
- **LocalStorage API** - 學習進度持久化儲存

### SEO 優化
- **結構化資料（JSON-LD）**：WebSite、Organization、Course、SportsActivityLocation
- **動態頁面標題**：每頁獨立 SEO 友善標題
- **Sitemap.xml**：完整頁面索引與更新頻率
- **地理位置標籤**：針對台灣本地搜尋優化
- **Open Graph & Twitter Cards**：社群媒體分享優化

---

## 專案結構

```
picklemaster-tw/
├── public/
│   ├── data/
│   │   └── courts.json         # 全台 55+ 球場資料
│   ├── logo.png                # 網站 Logo
│   ├── favicon.ico             # 網站圖示
│   ├── og-image.png            # 社群分享預覽圖
│   └── sitemap.xml             # 搜尋引擎索引
├── src/
│   ├── components/
│   │   ├── layout/             # Header, Footer 佈局組件
│   │   ├── court/              # 互動式球場、球路徑動畫
│   │   ├── equipment/          # 裝備指南、AI 推薦系統
│   │   ├── learning/           # 學習路徑、3D 球場
│   │   ├── map/                # 地圖組件
│   │   ├── game/               # 匹克球遊戲
│   │   ├── quiz/               # 互動測驗
│   │   └── hero/               # 首頁 Hero 組件
│   ├── pages/                  # 8 個主要頁面
│   │   ├── Home.tsx            # 首頁
│   │   ├── Rules.tsx           # 規則教學
│   │   ├── Equipment.tsx       # 裝備指南
│   │   ├── LearningPaths.tsx   # 學習路徑
│   │   ├── Courts.tsx          # 球場地圖
│   │   ├── Game.tsx            # 互動遊戲
│   │   ├── Resources.tsx       # 資源中心
│   │   └── About.tsx           # 關於我們
│   ├── hooks/
│   │   └── usePageTitle.ts     # 動態頁面標題 Hook
│   ├── utils/
│   │   └── constants.ts        # 常數定義（路由、品牌資訊）
│   ├── types/
│   │   └── index.ts            # TypeScript 類型定義
│   └── styles/
│       └── index.css           # 全域樣式與 Tailwind 配置
├── docs/                       # 建置輸出（GitHub Pages）
└── .github/
    └── workflows/
        └── deploy.yml          # 自動部署 CI/CD
```

---

## 本機開發

### 環境需求
- **Node.js** 18 或以上版本
- **npm** 或 **yarn** 套件管理工具

### 安裝與啟動

```bash
# 1. 複製專案
git clone https://github.com/wutiger555/picklemaster-tw.git
cd picklemaster-tw

# 2. 安裝依賴套件
npm install

# 3. 啟動開發伺服器（支援熱更新）
npm run dev

# 4. 開啟瀏覽器訪問
# http://localhost:5173
```

### 可用指令

```bash
npm run dev      # 啟動開發伺服器（Vite 熱更新）
npm run build    # 建置生產版本至 docs/ 目錄
npm run preview  # 預覽建置結果
npm run lint     # 執行 ESLint 程式碼檢查
```

---

## 部署

### GitHub Pages 自動部署

本專案使用 **GitHub Actions** 實現自動化部署：

1. 推送程式碼到 `main` 分支
2. GitHub Actions 自動觸發建置流程
3. 建置結果自動部署到 GitHub Pages
4. 約 2-3 分鐘後即可訪問更新後的網站

### 手動部署

```bash
# 建置生產版本
npm run build

# 建置檔案會輸出到 docs/ 目錄
# 提交並推送到 GitHub
git add docs
git commit -m "Deploy: Update production build"
git push origin main
```

**部署網址**：[https://wutiger555.github.io/picklemaster-tw/](https://wutiger555.github.io/picklemaster-tw/)

---

## SEO 優化策略

為確保在台灣搜尋「匹克球」相關關鍵字時能獲得良好排名，我們實施了以下優化：

### 1. Meta Tags 優化
- 包含「台北匹克球」、「台中匹克球」、「高雄匹克球」等城市關鍵字
- 長尾關鍵字：匹克球新手教學、匹克球雙打、匹克球發球規則
- 地理位置標籤：`geo.region: TW`、`geo.placename: Taiwan`

### 2. 結構化資料（Schema.org JSON-LD）
- **WebSite**：定義網站資訊與搜尋功能
- **Organization**：品牌識別
- **SportsActivityLocation**：運動場地標記
- **Course**：學習課程內容

### 3. Sitemap 與索引
- 完整的 `sitemap.xml` 涵蓋所有頁面
- 首頁設為 `daily` 更新，核心頁面 `weekly` 更新
- 優先級設定：首頁 1.0，球場地圖 0.95

### 4. 動態頁面標題
每個頁面都有獨立的 SEO 友善標題，例如：
- 首頁：「匹克大師台灣 | Picklemaster Taiwan - 台灣匹克球玩家社群與資源平台」
- 球場地圖：「全台匹克球場地圖 - 匹克大師台灣」
- 規則教學：「匹克球規則教學 - 匹克大師台灣」

### 建議後續行動
1. **提交至 Google Search Console**：加快索引速度
2. **建立反向連結**：與台灣匹克球協會、運動社群合作
3. **持續更新內容**：定期新增球場、教學文章

---

## 數據來源

- [中華民國匹克球協會](https://pickleball.org.tw) - 官方規則與賽事資訊
- [USA Pickleball](https://usapickleball.org) - 國際標準規則
- [OpenStreetMap](https://www.openstreetmap.org) - 地圖資料

---

## 貢獻指南

歡迎對專案做出貢獻！無論是新增球場資訊、修正錯誤、優化功能，都非常歡迎。

### 如何貢獻

1. **Fork** 本專案
2. 建立功能分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m 'Add some amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 開啟 **Pull Request**

### 貢獻類型
- 新增或更新球場資訊（`public/data/courts.json`）
- 修正錯誤或優化使用者體驗
- 新增教學內容或資源連結
- 改進 SEO 或效能
- 翻譯或在地化內容

---

## 授權條款

本專案採用 **MIT License** 授權條款。

詳見 [LICENSE](LICENSE) 檔案。

---

## 聯絡方式

如有任何問題、建議或合作機會，歡迎透過以下方式聯絡：

- **GitHub Issues**：[提交問題或建議](https://github.com/wutiger555/picklemaster-tw/issues)
- **專案維護者**：[@wutiger555](https://github.com/wutiger555)

---

## 致謝

- 感謝 **中華民國匹克球協會** 提供球場資訊與規則指導
- 感謝所有開源專案的貢獻者
- 感謝台灣匹克球社群的支持與回饋

---

**Built with React + TypeScript + Vite for Taiwan Pickleball Community**

Made in Taiwan 🇹🇼 | Version 1.0.0
