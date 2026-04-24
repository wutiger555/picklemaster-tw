# Changelog

All notable changes to Picklemaster Taiwan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.3.0] - 2026 Authority & AI-Search Overhaul (2026-04-24)

### 🎯 Mission
將網站定位從「匹克球學習平台」升級為「台灣匹克球權威資訊中心」，對標國外專業運動站（如網球、padel 類）的內容深度與 UX 品質。全面擁抱 2026 AI 搜尋時代（GEO, Generative Engine Optimization）。

### Featured Updates 🚀
- **AI Search Ready**: 全站優化為 2026 AI 搜尋時代標準（GEO），包含 `llms.txt`、AI crawler 白名單、SportsEvent / DefinedTermSet / SportsOrganization 等進階 Schema
- **3 個全新權威頁面**: 2026 賽事總覽、術語字典、DUPR 評級指南
- **內容大規模更新**: 2026 最新新聞、CTPF 全年賽事資料、台灣匹克球 120 萬人口統計

### Added

#### 🏆 新頁面 (Authority Content)
- **`/tournaments` 2026 賽事總覽**: 完整收錄 11 場 2026 台灣 + 亞洲重要賽事（臺灣盃、NAPA 盃、港都盃、中正盃、噶瑪蘭盃、臺北公開賽、APG 等），含等級/狀態/報名時間篩選。
- **`/glossary` 術語字典**: 中英對照匹克球術語大全，涵蓋規則/技術/戰術/裝備/場地/賽制 6 大類。從 Dink、Third Shot Drop 到 ERNE、ATP、Shake & Bake 全收錄。
- **`/ratings` DUPR 評級指南**: 2026 全球通用動態評分系統 1.0-8.0 完整對照表，包含技術重點、典型球員、台灣選手取得管道。

#### 📰 內容更新
- **2026 最新新聞**: 新增 6 則 2026 年度新聞（匹克球人口突破 120 萬、NAPA 盃落幕、DUPR 成為全球標準、APG 籌備等）
- **賽事資料庫**: `src/data/tournamentsData.ts` 收錄 11 場 2026 賽事完整 metadata
- **術語資料庫**: `src/data/glossaryData.ts` 20+ 個權威條目

#### 🔍 AI 搜尋 / GEO 優化
- **`public/llms.txt`**: 全新 LLM-友善索引檔，引導 AI 系統（ChatGPT、Claude、Perplexity、Gemini）引用本站內容
- **`public/robots.txt`**: 明確白名單 16+ 個 AI crawler（GPTBot、ClaudeBot、PerplexityBot、Google-Extended 等）
- **Structured Data 擴充**:
  - `SportsEvent` Schema for 所有 2026 賽事
  - `DefinedTermSet` for 術語字典與 DUPR 評級
  - `SportsOrganization` 連結 CTPF
  - `Speakable` Schema for AI 語音讀取
  - `AboutPage` + `Sport` 主題知識圖譜
- **FAQ 擴充**: 新增 5 題 2026 相關問答（DUPR、賽事、廚房區、第三球下切、人口統計）
- **每頁 SEO**: Tournaments/Glossary/Ratings 三個新頁面各自有專屬 title/description/keywords

#### 🏗️ 首頁改造
- **2026 Stats**: 從 3 欄升級為 4 欄，加入「120 萬球友」「10+ 年度賽事」等權威數據
- **即將開打賽事 Section**: 動態顯示接下來 3 場賽事卡片，連結至完整列表
- **Authority Resources Bar**: 深色區塊直連術語字典、DUPR 評級、球場地圖三大支柱內容

#### 🧭 導航升級
- 主選單新增「賽事」頂層連結（提高曝光層級）
- 新手專區下拉加入「術語字典」
- 裝備與攻略下拉加入「DUPR 評級指南」

### Changed

- **`index.html`**: meta description 重寫納入 2026 關鍵字；OG image 加入尺寸與 alt；JSON-LD 從 3 個實體擴充至 6 個；加入 `geo.position`、`ICBM`、`referrer` 等進階 meta
- **`sitemap.xml`**: 全站 lastmod 更新至 2026-04-24，新增 tournaments/glossary/ratings/newcomer-guide 四個路由
- **`SEOHead.tsx`**: 支援新頁面的結構化資料注入；Home 頁也載入 FAQ schema 增加 AI Overview 曝光
- **Breadcrumbs**: 包含所有新頁面

### Technical Notes

- **SEO 2026 Best Practices**: 遵循 searchengineland、Vercel、Google 2026 指引：內容以「chunks」組織、headings 階層清晰、scannable 格式、JSON-LD 為主要結構化資料格式
- **AI Citation Optimization**: 根據研究，正確的 Schema 讓內容被 AI 引用機率提升 2.5 倍；清晰格式提升 28-40%

### Fixed
- Tournaments 頁面已過賽事自動隱藏（可用選單切換顯示）

---

## [v1.2.0] - Visual & SEO Overhaul

### Featured Updates 🚀
- **Commercial-Grade Design**: Complete restyling of key pages (Home, Equipment, Newcomer) with a "Sporty/Modern" aesthetic inspired by top sports brands.
- **Smooth Experience**: Integrated `Lenis` for premium scroll mechanics.
- **SEO & Discovery**: Automated sitemap generation and improved metadata structure.

### Added

#### 🎨 Visual Overhaul & UI
- **Home Hero Section**: High-energy gradient text, animated background rings, and integrated 3D court preview.
- **Newcomer Guide**: "Bento Grid" layout, dynamic motion effects, and localized content for beginners.
- **Equipment Page**: Flagship product-page style with dark mode, full-width visuals, and interactive AI recommender.
- **Premium Footer**: Nike-style organized layout with deep neutral colors and structured navigation.
- **Animation System**: Added `spin-slow`, `pulse-slow`, and `gradient-x` animations to Tailwind config.

#### ⚙️ Technical Core
- **Smooth Scroll**: Implemented `@studio-freight/lenis` for fluid, momentum-based scrolling.
- **Sitemap Generation**: Updated `generate-static-pages.cjs` to automatically build `sitemap.xml` for Google Search Console.
- **Deployment**: Verified and optimized GitHub Actions workflow for automated CD.

#### 🏆 Pro Players Page
- **New "Titans" Section**: Interactive 3D trading cards for top players (Ben Johns, Anna Leigh Waters)
- **Stats Visualization**: Dynamic power/control/speed bars for each player
- **Equipment Integration**: Direct links to player's paddle of choice
- **Special Entry**: Added "Tesla Bot" as a fun easter egg

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

### Changed

#### 🎨 UI/UX Improvements
- **Header redesign**: Modern sports brand aesthetic with Inter font
  - Removed emojis for professional look
  - Dynamic brand name "PICKLEMASTER" with gradient text
  - Speed lines for motion effect
  - Layered background with court pattern texture
  - Fixed dropdown menu interaction (removed gap issue)
- **Game page update**: "Pickle Master" branding with FPS game description
- **SEO enhancements**: Custom title, description, and image props for pages

#### 🧭 Navigation Structure
- **Consolidated Menu**: Merged "Equipment" and "Pro Players" into "**職業與裝備**" (Gear & Pros)
- **Simplified "More"**: Renamed "Resources" to "更多" (More) containing About and Resources

#### 🎨 UI & Content (General)
- **Learning Paths**: Redesigned timeline for premium look (removed rainbow gradient)
- **News Feed**: Updated Taipei Open results and added Tesla/Razer paddle news
- **Image Handling**: Added elegant gradient fallbacks for broken news images

#### 🚀 Performance Improvements
- **Mobile Performance Optimization**: Targeted improvements for mobile PageSpeed score.
  - **LCP Optimization**: Preloaded logo image and optimized Hero section loading.
  - **Bundle Size Reduction**: Removed `framer-motion` from critical path (LoadingSpinner) and implemented `LazyMotion` for the Home page.
  - **Accessibility**: Added accessible attributes to interactive elements (Header menu, 3D Preview toggle).

### Fixed

#### 🔧 Court Visualizer Refinement
- **Logic Correction**: Fixed serve and return paths to strictly follow cross-court rules
- **UI Upgrade**: Replaced emoji controls with professional SVG playback bar
- **Step Navigation**: Added clickable step indicators and progress tracking
- **Visual Accuracy**: Corrected court markings (kitchen line does not cross center)

#### 🗺️ Map Z-Index Issue
- Fixed map overlaying header by reducing legend z-index from `z-10` to `z-[5]`
- Added CSS overrides for Leaflet's default z-index values
- All Leaflet panes now set to `z-index: 1` (well below header's `z-50`)

#### 🎯 Dropdown Menu Interaction
- Removed gap between button and dropdown menu
- Added continuous hover area using `pt-2` on dropdown wrapper
- Moved `onMouseEnter` to button element for better UX

### Documentation
- Created `NEWS_MAINTENANCE.md` for news content guidelines
- Updated `README.md` with new "Pickle Master" game features
- All game instructions now in Traditional Chinese

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
