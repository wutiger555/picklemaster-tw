# 📱 手機版優化指南

## 已優化的項目

### ✅ 1. **響應式導航欄**
- 手機版漢堡選單
- 點擊展開/收起
- 8個選單項目在手機版整齊排列

### ✅ 2. **球場地圖頁面**
- 篩選器在手機版垂直排列 (`grid-cols-1 md:grid-cols-4`)
- 球場卡片自動適應寬度
- 搜尋框全寬顯示

### ✅ 3. **首頁**
- 統計數據在手機版 2欄顯示 (`grid-cols-2 md:grid-cols-4`)
- 功能卡片垂直堆疊 (`grid-cols-1 md:grid-cols-3`)
- 按鈕在手機版垂直排列 (`flex-col sm:flex-row`)

### ✅ 4. **關於頁面**
- 開發者資訊在手機版單欄顯示 (`grid-cols-1 md:grid-cols-3`)
- 技術標籤自動換行 (`flex-wrap`)

### ✅ 5. **廣告系統**
- 側邊欄廣告在手機版隱藏 (`hidden lg:block`)
- 橫幅廣告響應式高度 (`h-24 md:h-32`)

---

## ⚠️ 需要改進的項目

### 1. **匹克球遊戲（最重要）**

**問題：**
- 只支援鍵盤控制，手機用戶無法遊玩
- Canvas 固定寬度 1000px，在小螢幕上可能過寬

**建議解決方案：**

#### A. 添加觸控控制

在 `PickleballGame.tsx` 中添加虛擬按鈕：

\`\`\`tsx
{/* 手機版虛擬控制器 */}
<div className="block md:hidden mt-4">
  <div className="bg-white rounded-xl p-4">
    <p className="text-sm font-bold text-gray-700 mb-3 text-center">
      觸控控制
    </p>

    {/* 方向控制 */}
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div></div>
      <button
        onTouchStart={() => handleMobileMove('up')}
        onTouchEnd={() => handleMobileStop('up')}
        className="bg-sport-500 text-white rounded-lg p-4 active:bg-sport-600"
      >
        ↑
      </button>
      <div></div>

      <button
        onTouchStart={() => handleMobileMove('left')}
        onTouchEnd={() => handleMobileStop('left')}
        className="bg-sport-500 text-white rounded-lg p-4 active:bg-sport-600"
      >
        ←
      </button>
      <button
        onTouchStart={() => handleMobileMove('down')}
        onTouchEnd={() => handleMobileStop('down')}
        className="bg-sport-500 text-white rounded-lg p-4 active:bg-sport-600"
      >
        ↓
      </button>
      <button
        onTouchStart={() => handleMobileMove('right')}
        onTouchEnd={() => handleMobileStop('right')}
        className="bg-sport-500 text-white rounded-lg p-4 active:bg-sport-600"
      >
        →
      </button>
    </div>

    {/* 擊球按鈕 */}
    <button
      onTouchStart={() => handleMobileServe()}
      className="w-full bg-gradient-to-r from-pickleball-500 to-sport-500 text-white rounded-lg p-4 font-bold active:scale-95"
    >
      擊球 / 發球
    </button>
  </div>
</div>
\`\`\`

#### B. Canvas 響應式處理

\`\`\`tsx
// 添加 useEffect 監聽螢幕大小
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const updateCanvasSize = () => {
    const container = canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const scale = containerWidth / COURT.WIDTH;

    canvas.style.width = '100%';
    canvas.style.height = \`\${COURT.HEIGHT * scale}px\`;
  };

  updateCanvasSize();
  window.addEventListener('resize', updateCanvasSize);

  return () => window.removeEventListener('resize', updateCanvasSize);
}, []);
\`\`\`

### 2. **表格溢出處理**

如果有表格內容，添加水平滾動：

\`\`\`tsx
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* 表格內容 */}
  </table>
</div>
\`\`\`

### 3. **長文本處理**

對於長地址或URL，使用 `break-words` 或 `truncate`：

\`\`\`tsx
{/* 可換行 */}
<p className="break-words">
  {court.location.address}
</p>

{/* 超長截斷 */}
<p className="truncate max-w-xs">
  {court.website}
</p>
\`\`\`

### 4. **3D 模型載入優化**

在 `PaddleGuide.tsx` 和相關3D組件中：

\`\`\`tsx
{/* 手機版降低品質以提升性能 */}
<Canvas
  camera={{ position: [0, 0, 5], fov: isMobile ? 60 : 50 }}
  gl={{ antialias: !isMobile }}
>
  {/* ... */}
</Canvas>
\`\`\`

### 5. **字體大小優化**

某些標題在手機上可能過大，使用響應式字體：

\`\`\`tsx
{/* 從 text-6xl 改為 */}
<h1 className="text-4xl md:text-6xl font-black">
  標題
</h1>
\`\`\`

---

## 📊 手機版測試檢查清單

### 畫面尺寸
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] Android (360px - 412px)
- [ ] 平板 (768px - 1024px)

### 功能測試
- [ ] 導航選單正常展開/收起
- [ ] 球場地圖可正常操作
- [ ] 遊戲可用觸控控制
- [ ] 表單輸入正常
- [ ] 圖片正常載入
- [ ] 動畫流暢不卡頓
- [ ] 文字可讀性良好
- [ ] 按鈕大小適中（至少 44×44px）

### 性能測試
- [ ] 頁面載入時間 < 3秒
- [ ] 3D 模型不造成卡頓
- [ ] 滾動流暢
- [ ] 無記憶體洩漏

---

## 🛠️ 開發工具

### Chrome DevTools
1. 按 F12 開啟開發者工具
2. 點擊 "Toggle device toolbar" (Ctrl+Shift+M)
3. 選擇不同裝置測試

### 真機測試
使用 ngrok 或類似工具將本地開發伺服器暴露到網路：

\`\`\`bash
# 安裝 ngrok
npm install -g ngrok

# 啟動開發伺服器
npm run dev

# 在另一個終端
ngrok http 5173
\`\`\`

---

## 💡 最佳實踐

1. **優先使用 Tailwind 響應式 class**
   - `md:`, `lg:`, `xl:` 前綴
   - `hidden md:block` / `block md:hidden`

2. **觸控友善設計**
   - 按鈕最小 44×44px
   - 間距充足（至少 8px）
   - 避免 hover 效果（改用 active）

3. **圖片優化**
   - 使用 WebP 格式
   - 提供多種尺寸
   - 使用 lazy loading

4. **字體大小**
   - 正文最小 16px (text-base)
   - 標題使用響應式大小

5. **避免固定寬度**
   - 使用 `max-w-` 而非 `w-固定值`
   - 使用 `flex` 和 `grid` 而非固定 px

---

**最後更新：** 2025-11-16
**狀態：** 大部分已優化，遊戲觸控控制需要實作
