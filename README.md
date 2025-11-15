# 🎾 台灣匹克球學院 (Pickleball Academy Taiwan)

> 互動式、新手友善的台灣匹克球學習平台

[![Deploy to GitHub Pages](https://github.com/wutiger555/picklemaster-tw/actions/workflows/deploy.yml/badge.svg)](https://github.com/wutiger555/picklemaster-tw/actions/workflows/deploy.yml)

## 📋 專案簡介

台灣匹克球學院是一個專為台灣匹克球愛好者設計的互動式學習平台，提供：

- 🎮 **3D 互動教學**：沉浸式的技術動作學習體驗
- 🎾 **互動式球場圖解**：點擊學習場地規則與區域說明
- 🗺️ **全台球場地圖**：輕鬆找到離你最近的匹克球場
- 📚 **系統化學習路徑**：從新手到進階的完整課程
- 🎨 **流暢動畫效果**：GSAP 與 Framer Motion 打造的視覺體驗

## 🚀 技術棧

### 核心框架
- **React 18** - UI 框架
- **TypeScript** - 類型安全
- **Vite 5** - 快速開發與打包工具

### UI 與樣式
- **Tailwind CSS** - 響應式設計
- **Framer Motion** - 頁面轉場與 UI 動畫
- **GSAP** - 複雜動畫與滾動效果

### 3D 與互動
- **Three.js** - 3D 圖形渲染
- **React Three Fiber** - React 的 Three.js 封裝
- **@react-three/drei** - Three.js 實用工具集

### 地圖功能
- **Leaflet.js** - 互動式地圖
- **react-leaflet** - React 的 Leaflet 封裝

### 路由與狀態
- **React Router DOM** - 路由管理
- **LocalStorage** - 學習進度追蹤

## 📁 專案結構

```
pickleball-academy-tw/
├── public/
│   ├── data/
│   │   └── courts.json         # 球場資料
│   ├── models/                 # 3D 模型檔案
│   └── images/                 # 圖片資源
├── src/
│   ├── components/
│   │   ├── layout/            # Header, Footer, Navigation
│   │   ├── court/             # 球場互動組件
│   │   ├── learning/          # 學習路徑組件
│   │   ├── map/               # 地圖相關組件
│   │   └── animations/        # 動畫組件
│   ├── pages/                 # 頁面組件
│   ├── hooks/                 # 自訂 Hooks
│   ├── utils/                 # 工具函式
│   ├── types/                 # TypeScript 類型定義
│   └── styles/                # 全域樣式
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions 部署
└── docs/                      # 建置輸出目錄（GitHub Pages）
```

## 🛠️ 本機開發

### 環境需求

- Node.js 18+
- npm 或 yarn

### 安裝與執行

```bash
# 克隆專案
git clone https://github.com/wutiger555/picklemaster-tw.git
cd picklemaster-tw

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 開啟瀏覽器訪問
# http://localhost:5173
```

### 可用腳本

```bash
npm run dev      # 啟動開發伺服器（熱更新）
npm run build    # 建置生產版本
npm run preview  # 預覽建置結果
npm run lint     # 執行 ESLint 檢查
```

## 🌐 部署

### GitHub Pages 自動部署

本專案使用 GitHub Actions 自動部署到 GitHub Pages：

1. 推送程式碼到 `main` 分支
2. GitHub Actions 自動建置
3. 部署到 GitHub Pages

訪問網站：`https://wutiger555.github.io/picklemaster-tw/`

### 手動部署

```bash
# 建置專案
npm run build

# docs 目錄會包含所有建置檔案
# 提交並推送到 GitHub
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## 🎯 核心功能

### 1. 互動式球場教學

- 點擊球場不同區域顯示規則說明
- 滑鼠懸停顯示線條名稱與尺寸
- 動畫演示球的完整路徑
- 互動式規則測驗

### 2. 3D 技術動作教學

- 360 度旋轉觀看動作
- 分解步驟播放
- 關鍵身體部位標註
- 播放/暫停控制

### 3. 全台球場地圖

- 互動式地圖顯示球場位置
- 側邊欄篩選（地區、類型、收費）
- 球場詳細資訊卡片
- 導航功能

### 4. 學習路徑系統

- 新手、中階、進階三個路徑
- 進度追蹤（LocalStorage）
- 完成徽章系統

## 📚 資料來源

- [中華民國匹克球協會](https://pickleball.org.tw)
- [USA Pickleball](https://usapickleball.org)

## 🤝 貢獻

歡迎貢獻！請遵循以下步驟：

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 📧 聯絡方式

如有任何問題或建議，請透過以下方式聯絡：

- GitHub Issues: [專案 Issues](https://github.com/wutiger555/picklemaster-tw/issues)
- Email: [您的聯絡信箱]

## 🙏 致謝

- 感謝台灣匹克球協會提供球場資訊
- 感謝所有開源專案的貢獻者

---

Made with ❤️ for Taiwan Pickleball Community
