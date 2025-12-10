# Changelog

All notable changes to Picklemaster Taiwan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### 🎨 全站設計語言統一 (December 2024)

##### 🏠 首頁全新設計
- **匹克球視覺元素**：球場線條背景、浮動匹克球、廚房區標示
- **繽紛漸層配色**：翠綠 Hero、藍紫/橘紅功能區塊
- **橫向大區塊設計**：01-03 功能導航，hover 全區塊變色
- **全寬分割線**：取代卡片邊框的現代設計

##### 📚 學習中心 (Learning.tsx)
- **紫色漸層 Hero**：環形裝飾圖案
- **大區塊功能入口**：技巧教學(玫瑰)、球場解說(翠綠)、規則(藍)、測驗(紫)
- **建議學習順序**：01-05 深色區塊設計
- **完整學習路徑時間軸**

##### 🎯 技巧教學 (Techniques.tsx)
- **玫瑰-橘色漸層 Hero**：動態球拍裝飾
- **深色影片區**：專業影片教學展示
- **五大技巧互動選擇器**：左側選單右側詳情

##### 🏟️ 球場解說 (CourtGuide.tsx)
- **翠綠漸層 Hero**：球場線條背景
- **深色工具切換區**：3D 球場、互動球場、球路軌跡
- **區域選擇器**：廚房區/發球區/底線/過渡區詳解
- **球場尺寸數據區塊**

##### ✏️ 知識測驗 (Quiz.tsx)
- **紫色漸層 Hero**：旋轉鉛筆裝飾
- **簡潔測驗界面**：大進度條、清晰選項
- **即時反饋與解說**
- **漸層結果頁面**：根據成績顯示不同配色

##### 📖 規則教學 (Rules.tsx)
- **藍紫漸層 Hero**：球場線條背景
- **四大規則互動選擇器**：雙彈跳/廚房區/發球/計分
- **深色視覺化工具區**
- **運動對比區塊**

##### 🎯 設計原則
- **移除卡片式設計**：使用全寬區塊和大膽排版
- **匹克球視覺識別**：球場線條、匹克球圖形、廚房區標示
- **繽紛區塊配色**：每個功能區塊使用獨立漸層
- **大型編號設計**：01, 02, 03 等數字作為視覺元素

#### 🎓 學習內容重組：獨立專題頁面 (December 2024)


##### 📄 新增專題頁面
- **技巧教學 `/techniques`**：發球、Dink、截擊等五大核心技巧分類詳解，含影片教學
- **球場解說 `/court-guide`**：3D 互動球場、區域規則、球路軌跡動畫，尺寸規格一覽
- **知識測驗 `/quiz`**：6 題快問快答互動測驗，含即時反饋和詳細解說

##### 🏠 學習中心 Hub 頁面
- **Learning.tsx 重新設計**：從內容頁面轉為學習資源入口 Hub
- **六大資源卡片**：技巧教學、球場解說、知識測驗、規則教學、視覺化學習、裝備指南
- **建議學習順序**：5 步驟學習路徑規劃（規則→球場→技巧→測驗→實戰）
- **學習路徑時間軸**：保留完整課程進度追蹤

##### 🧭 導航更新
- **Header 選單擴充**：學習下拉選單新增「學習中心」「技巧教學」「球場解說」「知識測驗」
- **NEW 標籤**：新頁面標記方便用戶發現

##### 📖 Rules.tsx 規則頁面重新設計
- **移除 Tab 導航**：所有內容以區塊方式直接展示
- **四大核心規則卡片**：雙彈跳、廚房區、發球、計分規則可展開詳解
- **互動工具保留**：3D 球場、互動球場、球路軌跡以按鈕切換
- **新增 FAQ 區塊**：5 個常見規則問題快速解答
- **運動對比區塊**：匹克球 vs 網球 vs 羽球視覺化比較
- **相關連結**：連接到技巧教學、球場解說、測驗、找球場


#### 📰 匹克球新知區塊大幅擴充 (December 2024)


##### 📝 新聞內容擴充
- **新增 14 則台灣相關消息**：從原本 5 則擴充至 14 則
- **最新消息優先**：所有新聞按日期排序，最新的消息在最上面
- **台灣為主**：內容以台灣本地賽事、球場、活動為主
- **涵蓋時間**：2024 年 8 月至 2025 年 12 月的最新動態
- **新聞類型**：
  - 🏆 賽事資訊：台北公開賽、星動盃、中信科大盃、亞洲錦標賽
  - 📍 新球場：龍山河濱、勤美誠品高空球場、信義 A11、大里仁化
  - 🇹🇼 台灣消息：世界盃佳績、參與人數統計、工作坊活動
  - 🏆 即將開始：114 年度臺灣盃、臺中市市長盃

##### 🎨 NewsSection 組件改造
- **網格/列表視圖切換**：用戶可選擇偏好的瀏覽方式
- **改進類別篩選**：新增「賽事」篩選選項
- **標籤顯示**：每則新聞顯示相關標籤
- **即將開始標記**：即將舉辦的活動有動態標記
- **連結到更多資源**：FAQ、學習資源、匹克球協會官網

#### 🎨 Major Page Redesigns (December 2024)


##### 📍 Courts Page (`/courts`)
- **Modern Hero Section**: Gradient background with animated statistics cards
- **Region Filtering**: New region-based filtering (北部/中部/南部/東部)
- **Improved Search**: Glassmorphic search bar in hero section
- **Card Grid Layout**: Modern card design with hover effects and shadows
- **Sticky Filter Bar**: Filters stay visible while scrolling
- **SEO Content Block**: Added FAQ section for common court questions
- **Related Resources**: New section linking to Rules, Equipment, and Learning
- **Breadcrumb Navigation**: Added for better site structure

##### 🏓 Equipment Page (`/equipment`)
- **Removed Tab Navigation**: All content now displayed as scrollable sections
- **Quick Selection Guide**: New "快速選購指南" section for different user types
- **Price Tier Overview**: Visual cards showing Entry/Intermediate/Advanced tiers
- **Section Anchors**: Quick navigation buttons in hero section
- **Badge Highlights**: "最推薦" badge for intermediate tier
- **Other Equipment Section**: Dark-themed section for shoes, balls, apparel
- **Improved Visual Hierarchy**: Section labels with colored badges

##### 🎯 Learning Page (`/learning`)
- **Accordion-Style Sections**: Collapsible content blocks (3D Court, Interactive Court, Ball Animation)
- **Quick Resource Links**: Top-of-page links to Rules, Equipment, Courts
- **Skill Categories**: New visual cards for Serve, Return, Dink, Volley techniques
- **Toggle Quiz**: Quiz section now toggleable for cleaner experience
- **Animated Wave Background**: SVG wave animation in hero section
- **CTA Section**: New dark-themed "準備好開始練習了嗎？" call-to-action
- **Improved Loading States**: Smoother transitions between sections

##### 🔍 SEO & Discoverability Improvements
- **Breadcrumb Navigation**: Added to all three pages
- **Internal Linking**: Cross-page links in related content sections
- **FAQ Sections**: Added common questions with answers for SEO
- **Semantic Structure**: Improved heading hierarchy (H1 → H2 → H3)
- **Related Resources**: Every page now links to complementary content

#### 🎥 Video Integration
- **New `VideoTutorials` component**: Grid layout with hover effects, duration/level badges
- **New `VideoSpotlight` component**: Cinematic home page section with video preview
- **3 New Tutorials**: Continental Grip, Forehand Drive, Punch Volley
- **Video Modal**: Full-screen playback with backdrop blur
- **SEO Optimization**: Added `VideoObject` Schema, poster images, and lazy loading

#### 🏓 Sport Comparison Feature
- **New component**: `SportComparison.tsx` - Visual comparison between Pickleball, Tennis, and Badminton
- **Interactive FAQ section**: 4 detailed Q&A about transitioning from Tennis/Badminton to Pickleball
- **Court size visualization**: Side-by-side comparison with accurate measurements and diagrams
- **Data comparison table**: 8 key metrics (court size, paddle weight, ball speed, etc.)
- **Animated charts**: Height-based bar charts showing area proportions (Tennis 100% vs Pickleball 31%)

#### 🏸 Paddle Equipment Expansion
- **Expanded paddle database** from 2 to 16 models
- **9 brands**: Gamma, Franklin, HEAD, Paddletek, Engage, ProKennex, Selkirk, JOOLA, Wilson
- **Price range filtering**: Budget ($2-3.5K), Mid-range ($4-7K), Premium ($7K+)
- **Detailed specifications**: Weight, grip size, core type, surface material, thickness for each paddle
- **Performance ratings**: Power, control, spin, durability scores for every model

#### 📚 Learning Path Redesign
- **Beginner path expanded** from 4 to 10 lessons for complete newcomers
- **Story-driven narrative**: Each path has an introduction to set context
- **Detailed lesson content**: Each lesson now includes 4-6 key learning points
- **Logical progression**: 
  1. What is Pickleball → 2. Equipment → 3. Rules → 4. Grip → 5. Serving → 
  6. Receiving → 7. Basic Shots → 8. Movement → 9. Etiquette → 10. First Match
- **Mid-tier improvements**: Added "Third Shot Drop" strategy (most important tactic)
- **Advanced path**: Expanded to 5 lessons with mental training and coaching

#### 🎯 Scorer Simplification
- **Complete redesign** from 872 lines to 400 lines
- **Removed complex features**: Timer, history, sets tracking, score reduction, fullscreen toggle, sound system
- **Focus on essentials**: Large score display, clear serve indication, quick actions only
- **Mobile optimized**: Automatic landscape/portrait layout adaptation
- **Simplified settings**: Only game type (singles/doubles) and target score (11/15/21)
- **Touch-friendly**: Entire score area is tappable, haptic feedback support

#### 📰 News System
- **News data structure**: `newsData.ts` with complete NewsItem interface
- **NewsCard component**: Display individual news items with category badges
- **NewsSection component**: Feed with category filters (News, Events, Education, Courts)
- **NewsDetail page**: Full content view with routing support
- **Archive system**: Added `archived` field for news management
- **Tags support**: Categorization and filtering capabilities

#### 🎨 UI/UX Improvements
- **Header redesign**: Modern sports brand aesthetic with Inter font
  - Removed emojis for professional look
  - Dynamic brand name "PICKLEMASTER" with gradient text
  - Speed lines for motion effect
  - Layered background with court pattern texture
  - Fixed dropdown menu interaction (removed gap issue)
- **Game page update**: "Pickle Master" branding with FPS game description
- **SEO enhancements**: Custom title, description, and image props for pages

### Fixed

#### 🗺️ Map Z-Index Issue
- Fixed map overlaying header by reducing legend z-index from `z-10` to `z-[5]`
- Added CSS overrides for Leaflet's default z-index values
- All Leaflet panes now set to `z-index: 1` (well below header's `z-50`)

#### 🎯 Dropdown Menu Interaction
- Removed gap between button and dropdown menu
- Added continuous hover area using `pt-2` on dropdown wrapper
- Moved `onMouseEnter` to button element for better UX

### Changed

#### 📝 Documentation Updates
- Created `NEWS_MAINTENANCE.md` for news content guidelines
- Updated `README.md` with new "Pickle Master" game features
- All game instructions now in Traditional Chinese

#### 🎮 Game Mechanics
- Renamed to "Pickle Master" (匹克球大師)
- Updated controls description: Focus, Fireball, Lucky Shot
- Documented core rules: Kitchen zone, Two-bounce rule

### Removed
- Unused `animate-pulse-slow` CSS (kept in file but not actively used)
- Sport selector buttons (merged into single view)
- Complex scorer features (timer, history, sets, etc.)

---

## [Previous Versions]

### v1.1.0 - Branding Update
- **Brand New Mascot Logo**: Introduced a new pickleball character mascot (`picklemasterlogo.png`) to enhance brand identity.
- **Icon System Overhaul**: Generated comprehensive set of favicons and app icons with `v2` cache-busting filenames to ensure immediate update on all devices.
- **Hero Section Redesign**: Integrated the new mascot into the homepage hero section with responsive animations (desktop side-by-side, mobile centered).
- **Header Logo Update**: Increased logo size for better visibility and updated to the new mascot design.
- **SEO & Social Sharing**: Updated `og-image.png` with the new branding for better social media previews.
- **PWA Assets**: Updated Android Chrome icons and `manifest.json` to use the new v2 assets.
- **Documentation**: Updated `README.md` and `CHANGELOG.md` to reflect these changes.

### v1.0.0 - Initial Release
- Interactive map with 55+ courts across Taiwan
- Basic learning paths (Beginner, Intermediate, Advanced)
- Rules教學 with interactive court
- Equipment guide with 2 paddle comparisons
- News system foundation
- Google AdSense integration
- Mobile-responsive design
- SEO optimization with structured data

---

## Migration Notes

### For Users
- **Scorer**: If you were using the old scorer's timer or history features, these have been removed. The new scorer focuses on essential gameplay tracking only.
- **Learning Paths**: Beginner path now has 10 lessons instead of 4. Your progress tracking will need to be reset.

### For Developers
- **SEOHead component**: Now accepts `title`, `description`, and `image` as direct props
- **NewsItem interface**: Added optional `content` field, removed `verified` field
- **SportComparison**: No longer uses sport selector state, all content displayed at once

---

## Roadmap

### Upcoming Features
- [ ] User accounts and progress tracking
- [ ] Video tutorials for each learning path lesson
- [ ] Community forum for players to connect
- [ ] Tournament calendar and registration
- [ ] Mobile app (iOS/Android)
- [ ] Advanced statistics and analytics for players
- [ ] Integration with booking systems for courts
- [ ] Coaching marketplace

### SEO Goals
- [ ] Rank #1 for "匹克球" on Google Taiwan
- [ ] Rank #1 for "匹克球 台灣"
- [ ] Top 3 for "pickleball Taiwan"
- [ ] Featured snippet for "匹克球規則"

---

## Contact & Support

- **Website**: [https://picklemastertw.site/](https://picklemastertw.site/)
- **Issues**: [GitHub Issues](https://github.com/wutiger555/picklemaster-tw/issues)
- **Email**: Contact through website

---

**Note**: This changelog is maintained manually. For detailed commit history, see [Git commits](https://github.com/wutiger555/picklemaster-tw/commits/main).
