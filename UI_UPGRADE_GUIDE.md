# UI/UX 升級指南

本次升級全面改善了 Picklemaster TW 的設計系統，同時**完整保留所有原有功能**。

## ✨ 改善總覽

### 🎨 設計系統重構

#### 1. Design Tokens 系統
位置：`src/styles/designTokens.ts`

建立了完整的設計標記系統：
- **色彩系統**：主色（匹克球綠）、次色（運動藍）、輔色（警示橘）、中性灰階
- **字體系統**：display（粗黑體）、mono（等寬）、清晰的字級層級
- **間距系統**：8px 基準間距尺度
- **陰影系統**：包含 glassmorphism 和霓虹發光效果
- **動畫系統**：緩動函數和過渡配置

```typescript
import designTokens from '@/styles/designTokens';

// 使用色彩
const primaryColor = designTokens.colors.primary[500];

// 使用字體
const displayFont = designTokens.fontFamily.display;

// 使用陰影
const glassEffect = designTokens.glassmorphism.light;
```

#### 2. Tailwind 配置更新
位置：`tailwind.config.js`

整合了所有 Design Tokens：
```javascript
// 新的色彩類別
bg-primary-500       // 匹克球綠
bg-secondary-500     // 運動藍
bg-accent-500        // 警示橘
bg-neutral-{50-950}  // 中性灰階

// 新的字體類別
font-display         // 粗黑體標題
font-mono            // 等寬字體（數據/代碼）

// 新的字級類別
text-display-2xl     // 超大標題 (72px)
text-heading-xl      // 標題 (24px)
text-body-lg         // 內文 (16px)
text-caption-md      // 說明文字 (11px)

// 新的陰影類別
shadow-glass         // Glassmorphism 陰影
shadow-neon-primary  // 霓虹發光（綠）
shadow-elevated-lg   // 懸浮效果

// 新的動畫類別
animate-glow-pulse   // 發光脈衝
animate-shimmer      // 閃爍效果
animate-scale-in     // 彈性縮放
```

### 🃏 全新組件庫

#### 1. GlassCard - Glassmorphism 卡片
位置：`src/components/common/GlassCard.tsx`

功能特色：
- ✅ 6 種變體（light/medium/dark/primary/secondary/accent）
- ✅ 4 種尺寸（sm/md/lg/xl）
- ✅ 懸浮陰影動畫
- ✅ 磁性游標效果（3D 傾斜）
- ✅ 進入動畫支援

**使用範例：**
```tsx
import GlassCard from '@/components/common/GlassCard';

// 基礎使用
<GlassCard variant="light" size="md">
  <h3>標題</h3>
  <p>內容</p>
</GlassCard>

// 磁性效果 + 懸浮
<GlassCard variant="primary" magnetic hoverable>
  卡片內容
</GlassCard>

// 可點擊卡片
<GlassCard variant="secondary" clickable onClick={() => console.log('clicked')}>
  點擊我
</GlassCard>

// 使用簡化變體
import { GlassCardPrimary, GlassCardLight } from '@/components/common/GlassCard';

<GlassCardPrimary magnetic>主色卡片</GlassCardPrimary>
<GlassCardLight size="lg">淡色大卡片</GlassCardLight>
```

#### 2. LazyImage - 懶加載圖片
位置：`src/components/common/LazyImage.tsx`

功能特色：
- ✅ 自動懶加載（Intersection Observer）
- ✅ 淡入動畫
- ✅ 載入中狀態
- ✅ 載入失敗處理

**使用範例：**
```tsx
import LazyImage from '@/components/common/LazyImage';

<LazyImage
  src="/images/hero.jpg"
  alt="Hero Image"
  className="w-full h-auto"
  placeholder="/images/placeholder.jpg"
  fadeIn={true}
/>
```

#### 3. PaddleComparison - 裝備對比
位置：`src/components/equipment/PaddleComparison.tsx`

功能特色：
- ✅ 並排比較兩款球拍
- ✅ 動態性能指標條
- ✅ 優缺點對比
- ✅ 詳細規格表
- ✅ Glassmorphism 設計

**使用範例：**
```tsx
import PaddleComparison from '@/components/equipment/PaddleComparison';

// 使用預設數據
<PaddleComparison />

// 使用自訂數據
<PaddleComparison paddles={customPaddles} />
```

### 🎬 進階動畫系統

位置：`src/utils/animations.ts`

提供可重用的 Framer Motion 動畫變體：

**使用範例：**
```tsx
import { fadeInUp, scaleIn, staggerContainer, staggerItem } from '@/utils/animations';

// 淡入向上
<motion.div variants={fadeInUp} initial="hidden" animate="visible">
  內容
</motion.div>

// 縮放進入
<motion.div variants={scaleIn} initial="hidden" whileInView="visible">
  內容
</motion.div>

// 交錯動畫（列表）
<motion.ul variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item.id} variants={staggerItem}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>

// 懸浮效果
<motion.div variants={hoverLift} initial="rest" whileHover="hover">
  懸停時會上升
</motion.div>

// 霓虹發光
<motion.button variants={hoverGlow} initial="rest" whileHover="hover">
  懸停發光
</motion.button>
```

**可用動畫變體：**
- `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn`, `scaleInBounce`, `scalePulse`
- `slideInLeft`, `slideInRight`
- `rotateIn`, `flipCard`
- `staggerContainer`, `staggerItem`
- `hoverLift`, `hoverGlow`, `hoverTilt`
- `glassCardEnter`, `glassCardHover`
- `pageTransition`, `pageSlideTransition`
- `breathe`, `shake`, `bounce`

### ⚡ 效能優化工具

#### useInView Hook
位置：`src/hooks/useInView.ts`

使用 Intersection Observer API 檢測元素是否在視窗中：

**使用範例：**
```tsx
import { useInView, useInViewOnce } from '@/hooks/useInView';

// 基礎使用
function MyComponent() {
  const { ref, inView } = useInView({ threshold: 0.5, once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
    >
      內容
    </motion.div>
  );
}

// 使用預設配置
function SimpleComponent() {
  const { ref, inView } = useInViewOnce();

  return (
    <div ref={ref} className={inView ? 'visible' : 'hidden'}>
      內容
    </div>
  );
}

// 帶回調
const { ref, inView } = useInView({
  threshold: 0.1,
  once: true,
  onEnter: () => console.log('進入視窗'),
  onLeave: () => console.log('離開視窗'),
});
```

### 🏠 Hero Section 升級

位置：`src/pages/Home.tsx`

改善內容：
- ✅ **保留原有 360度旋轉球場預覽**
- ✅ 視差滾動效果（3 層背景動畫）
- ✅ 霓虹發光 CTA 按鈕
- ✅ 更新為新的設計標記色彩

**視差效果實現：**
```tsx
const { scrollY } = useScroll();
const parallaxY1 = useTransform(scrollY, [0, 500], [0, -50]);
const parallaxY2 = useTransform(scrollY, [0, 500], [0, -100]);
const parallaxY3 = useTransform(scrollY, [0, 500], [0, -150]);

<motion.div style={{ y: parallaxY1 }} className="...">
  背景元素 1
</motion.div>
```

**霓虹發光按鈕：**
```tsx
<Link
  to={ROUTES.RULES}
  className="... shadow-neon-primary hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-glow-pulse"
>
  <span className="absolute inset-0 bg-shimmer-gradient animate-shimmer"></span>
  <span className="relative">開始學習</span>
</Link>
```

## 🔒 向後相容保證

### 保留的原有功能

1. **所有頁面和路由** ✅
   - Home, Rules, Equipment, Learning, Courts, Game, Scorer 等

2. **360度球場預覽** ✅
   - `HeroCourtPreview` 組件完整保留
   - Three.js 3D 渲染功能正常

3. **原有色彩變數** ✅
   ```javascript
   pickleball-{50-900}  // 原有的亮黃橘色
   sport-{50-900}       // 原有的運動藍
   court-{50-900}       // 原有的活力綠
   ```

4. **所有原有組件** ✅
   - PaddleRecommender（推薦工具）
   - PaddleGuide（完全指南）
   - QuizCard（測驗卡片）
   - CourtViewer3D（3D 球場）
   - 等等...

5. **所有動畫** ✅
   ```javascript
   animate-float
   animate-slide-down
   animate-bounce-slow
   animate-pulse-slow
   ```

## 📦 如何使用新功能

### 在新頁面使用

```tsx
import GlassCard from '@/components/common/GlassCard';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { useInViewOnce } from '@/hooks/useInView';
import { motion } from 'framer-motion';

function NewPage() {
  const { ref, inView } = useInViewOnce();

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Glassmorphism 卡片 */}
      <GlassCard variant="primary" magnetic hoverable>
        <h2 className="text-display-lg font-display font-black text-neutral-900">
          標題
        </h2>
        <p className="text-body-lg text-neutral-700">
          內容
        </p>
      </GlassCard>

      {/* 滾動觸發動畫 */}
      <motion.div
        ref={ref}
        variants={fadeInUp}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        滾動到這裡時會淡入
      </motion.div>

      {/* 使用新的設計標記 */}
      <button className="bg-primary-500 text-white px-6 py-3 rounded-xl shadow-neon-primary hover:shadow-elevated-lg">
        霓虹按鈕
      </button>
    </div>
  );
}
```

### 升級現有組件

```tsx
// 之前
<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
  內容
</div>

// 現在（使用 GlassCard）
<GlassCard variant="secondary" size="md">
  內容
</GlassCard>

// 之前
<img src="/image.jpg" alt="Image" />

// 現在（使用 LazyImage）
<LazyImage src="/image.jpg" alt="Image" fadeIn />
```

## 🎯 設計原則

### 色彩使用指南

1. **主色（Primary - 綠）**：主要 CTA、重要元素
2. **次色（Secondary - 藍）**：次要動作、資訊展示
3. **輔色（Accent - 橘）**：警示、強調、限時優惠
4. **中性色（Neutral）**：背景、邊框、文字

### 字體使用指南

1. **display**：大標題、Hero 標題
2. **sans**：一般內文、介面文字
3. **mono**：數據、統計、代碼

### 動畫使用指南

1. **微交互**：使用 `transition.fast` (0.2s)
2. **一般動畫**：使用 `transition.medium` (0.3s)
3. **強調動畫**：使用 `transition.slow` (0.5s)
4. **滾動觸發**：搭配 `useInView` Hook

## 🚀 性能建議

1. **圖片優化**：
   - 使用 `LazyImage` 組件
   - 提供 placeholder
   - 使用適當的圖片格式

2. **動畫優化**：
   - 使用 `once: true` 避免重複觸發
   - 大量元素使用 `stagger` 動畫
   - 避免過度使用 3D 變換

3. **組件優化**：
   - 使用 `React.memo` 避免不必要的重渲染
   - 懶加載非關鍵組件
   - 合理使用 `Suspense`

## 📚 參考資源

- [Framer Motion 文檔](https://www.framer.com/motion/)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Glassmorphism 設計](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)

## 🐛 問題排查

### Build 錯誤

如果遇到 TypeScript 錯誤：
```bash
npm install --save-dev @types/node
npm run build
```

### 動畫不工作

確保已安裝 Framer Motion：
```bash
npm install framer-motion
```

### 樣式不顯示

確保 Tailwind 配置正確導入 Design Tokens：
```javascript
// tailwind.config.js
import designTokens from './src/styles/designTokens';
```

## 💡 下一步建議

1. **逐步採用新組件**：在新頁面或新功能中優先使用新的設計系統
2. **重構舊組件**：有時間時逐步將舊組件升級為新組件
3. **統一設計語言**：確保整個應用使用一致的設計標記
4. **性能監控**：追蹤頁面載入時間和動畫性能
5. **用戶測試**：收集用戶對新 UI 的反饋

---

**版本**：1.0.0
**最後更新**：2025-11-17
**作者**：Claude Code
