# Changelog

All notable changes to Picklemaster Taiwan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

### Performance Improvements
- **Mobile Performance Optimization**: Targeted improvements for mobile PageSpeed score.
  - **LCP Optimization**: Preloaded logo image and optimized Hero section loading.
  - **Bundle Size Reduction**: Removed `framer-motion` from critical path (LoadingSpinner) and implemented `LazyMotion` for the Home page.
  - **Accessibility**: Added accessible attributes to interactive elements (Header menu, 3D Preview toggle).

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
