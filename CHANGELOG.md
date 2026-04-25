# Changelog

All notable changes to Picklemaster Taiwan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.8.0] - Training Programs · Tactical Playbook · Hall of Fame (2026-04-25)

### 🎯 Mission
從「資訊權威」進化為「實用工具站」。三大新內容讓球友從查資料 → 真正執行訓練 → 比賽應用 → 連結歷史傳承。

### Featured Updates 🚀
- **8 套系統化訓練菜單**（含進度追蹤 localStorage）
- **30+ 比賽情境戰術劇本**
- **匹克球名人堂**（從 1965 創辦人到台灣推廣者）
- **Sitemap: 130 → 141 URLs**

### Added

#### 🏋️ 系統化訓練菜單（`/training-programs`）
- 8 套完整訓練計劃，每套含逐週逐日具體練習項目
- 索引頁支援等級 + 專注領域雙重篩選
- 詳情頁特色：
  - 週數選擇器（黏性 sticky）
  - 每日練習可勾選打勾，**進度自動儲存（localStorage）**
  - 視覺化進度條
  - HowTo JSON-LD schema
- **8 套菜單**：
  1. 新手 8 週入門完整菜單
  2. Dink 軟球 4 週特訓
  3. Third Shot Drop 4 週特訓
  4. 50+ 銀髮族 12 週入門
  5. 雙打配合 6 週默契養成
  6. 單打體能 6 週菜單
  7. 反手強化 4 週特訓
  8. Reset 防守大師 4 週特訓

#### 📋 戰術劇本庫（`/playbook`）
- 30+ 比賽情境 × 最佳回應對照
- 6 大分類：開局戰術、網前對戰、防守反擊、心理戰、雙打配合、單打應變
- 每則含：情境描述、為什麼發生、最佳回應、替代方案、職業案例
- 3 等級標記：新手必備、中階關鍵、進階武器
- 搜尋 + 雙重篩選

**精選情境**：
- 對方深發球壓底線
- 廚房 Dink Rally 中對方 Speed-up
- 被連續扣殺到腳邊
- 雙打搭檔失誤後的心理重置
- 連失 4 球該叫暫停？
- 一左一右搭檔的 Stacking 應用

#### 🏆 匹克球名人堂（`/hall-of-fame`）
- 4 大區塊：
  1. **創辦人**：Joel Pritchard、Bill Bell、Barney McCallum（1965 後院父親）
  2. **組織建設者**：David Lester、Sid Williams、Steve Wong
  3. **當代傳奇**：Simone Jardim、Tyson McGuffin、Ben Johns
  4. **台灣推廣者**：陳朝鍵 (CTPF)、CTPF 認證教練群、林書豪
- 每位含貢獻、年代、入選名人堂年份
- 與編年史、選手資料庫互相串連

### Changed

- **Header 導航**：
  - 「學習」加入「訓練菜單」+「戰術劇本庫」（NEW badge）
  - 「裝備選手」加入「名人堂」（NEW badge）
- **Static Generator**：
  - 新增 8 條訓練菜單詳情靜態頁
  - 三個新索引頁（training-programs / playbook / hall-of-fame）
  - Sitemap URLs: 130 → **141**
- **llms.txt**：完整更新

### Technical Notes

- **Training Program 進度追蹤**：使用 localStorage 儲存（純客戶端，零後端）
- **HowTo + CollectionPage Schema**：訓練菜單與戰術劇本都有結構化資料
- **內容深度**：
  - 訓練菜單總字數約 ~12,000 字
  - 戰術劇本總字數約 ~8,000 字
  - 名人堂約 ~3,000 字

### Build Stats
- 新增檔案：6 個（trainingProgramsData, playbookData, TrainingPrograms, TrainingProgramDetail, Playbook, HallOfFame）
- 訓練菜單：8 套
- 戰術情境：30 個
- 名人堂條目：12 位
- 總頁面：130 → **141+**
- **總字數累計：~80,000 → ~103,000 中文字**

---

## [v1.7.1] - Tier 1 Performance Optimization · Zero Visual Loss (2026-04-25)

### 🎯 Mission
無視覺損失的效能優化。所有酷炫動畫、3D 效果、特效全部保留，只是「更快載入、更聰明地載入」。

### Highlights
- **首頁初次載入 gzip：~356KB → ~127KB（減少 64%）**
- **Three.js 載入策略**：從進首頁就強制載 → 滑到 hero 區或瀏覽器空閒時才載
- **解除 `Cache-Control: no-cache` 緊箍咒**：之前所有資源每次都要重抓（巨大 perf 災難）

### Changed

#### ⚡ Bundle 切分優化（vite.config.ts）
- `vendor-three` 845KB 一塊 → 細分為三塊（core 667KB / fiber 131KB / drei 46KB）
- 首次只載核心，drei 與 fiber 按需載入
- 新增 `vendor-leaflet`、`vendor-gsap`、`vendor-lenis` 獨立 chunk
- target: es2020、modern minify、CSS code split

#### 🎨 Hero 3D 智慧延後載入（HeroCourtPreview.tsx）
- 改用 **IntersectionObserver + requestIdleCallback** 雙重策略
- Hero 在視窗外時不載入 3D
- Hero 進入視窗後，等瀏覽器**空閒時**才開始下載 three.js
- 用戶仍可點擊立即載入（互動體驗保留）
- **初次載入 LCP 預估從 3.5s → 1.2s**

#### 🖼️ 圖片優化（imageOptimize.ts + NewsCard + NewsDetail）
- Unsplash 圖片自動加入 `?auto=format&q=75&w=...` 參數 → **WebP 自動回傳**（小 30-50%）
- 響應式 `srcSet`：手機載 400w、桌機載 800w
- 明確指定 `width` / `height` → 防止 Layout Shift（CLS 改善）
- `loading="lazy"` + `decoding="async"`

#### 🛜 Service Worker v4 完整重寫
- 4 個獨立 cache（static/assets/images/data）
- 不同資源用不同策略：
  - HTML：network-first（永遠最新）
  - JSON：stale-while-revalidate（即時 UI + 背景更新）
  - 圖片：cache-first（永久快取）
  - JS/CSS：cache-first（hashed 檔名永不過期）
  - Google Fonts：cache-first

#### 🚫 移除 Cache-Control 緊箍咒（index.html）
- 移除 `<meta http-equiv="Cache-Control" content="no-cache, no-store">`
- 之前每個訪客每次造訪都重抓全部資源（巨大浪費）
- 改由 Service Worker 控制 freshness

#### 🌐 DNS / Preconnect 優化
- preconnect 到 `images.unsplash.com`（含 crossorigin）
- DNS prefetch 到 `api.open-meteo.com`、`youtube.com`
- 移除不必要的 `www.google.com` preconnect

### Visual Impact
- **動畫 / 特效保留度：100%**
- 3D 球場、所有 framer-motion 動畫、Lenis smooth scroll、GSAP 全部不變
- 唯一細微感受：第一次造訪時 hero 3D 會晚 0.5-1 秒出現（瀏覽器空閒才載），整體頁面反而更快響應

### Technical Notes
- 對 Google Core Web Vitals 三大指標都正面：
  - LCP（最大內容繪製）↓ 載入更快
  - CLS（版面位移）↓ 圖片明確尺寸
  - TBT/INP（互動回應）↓ JS 不再卡主線程
- Service Worker 二次造訪幾乎秒開
- 對 Google 排名直接正面影響

---

## [v1.7.0] - Paddle Database & Video Hub (2026-04-25)

### 🎯 Mission
裝備與教學內容深化：球拍規格資料庫 + YouTube 國際名師精選聚合。讓「想買球拍」、「想看教學」的搜尋者最終都來這裡。

### Featured Updates 🚀
- **球拍資料庫**：25+ 款熱門球拍完整規格對照
- **影片教學中心**：20+ 支國際頂級 YouTube 教學精選
- **Sitemap: 128 → 130 URLs**

### Added

#### 🏓 球拍完整資料庫（`/paddles`）
- 12 大品牌 25+ 款球拍規格對照
- 涵蓋 JOOLA、Selkirk、Paddletek、Six Zero、Engage、Franklin、CRBN、Gearbox、PROLITE、Vatic Pro、Electrum、Onix
- 每款資料包含：
  - 重量、厚度、核心類型、面板材質
  - 握把長度與尺寸
  - 4 維度評分（力量/控球/旋轉/容錯）
  - 代言選手、產品特色、適合族群、缺點
  - USAP 認證狀態、台幣價格
- **依品牌、等級篩選 + 排序**（評分高至低 / 價格低至高 / 高至低）
- ItemList JSON-LD schema

**精選球拍**：
- 職業：JOOLA Perseus Pro IV (16mm/14mm), Selkirk Labs Project 002, CRBN Truefoam, Bantam ALW-C
- 進階：JOOLA Hyperion CFS, Scorpeus Pro IV, Magnus 3, Vanguard Power Air, Six Zero DBD, Bantam TS-5, Six Zero Ruby, CRBN 1X, Vatic Pro Flash, Electrum Model E
- 中階：Engage Pursuit Pro1, Franklin Ben Johns Signature, Carbon STK, Onix Evoke
- 新手：PROLITE Titan Pro, Selkirk Amped S2

#### 📺 教學影片中心（`/videos`）
- 20 支精選 YouTube 國際名師教學
- 6 大類別：基礎、技術、戰術、裝備、比賽分析、心理
- 涵蓋頻道：
  - **Briones Pickleball** (140 萬訂閱)
  - **Pickleball University**
  - **Enhance Pickleball**
  - **JOOLA 官方頻道**
- 每支影片附：
  - 中文解說
  - 「為什麼推薦」理由
  - 適合等級
  - 預估觀看次數
- 分類與等級雙重篩選

**精選影片**：
- 新手：3 分鐘搞懂規則、握拍教學、新手 10 大錯誤
- 技術：Master the Dink、Third Shot Drop、Volley、Reset、Erne、Topspin Drive
- 戰術：雙打站位、Stacking、單打戰術、中間球戰術
- 裝備：2026 球拍購買指南、熱壓成型解析
- 比賽分析：Ben Johns 為什麼這麼強、ALW 反手秘密
- 心理：心理素質、賽前準備

### Changed

- **Header 導航**：
  - 「裝備選手」加入「球拍資料庫」（NEW badge）
  - 「裝備選手」加入「教學影片中心」（NEW badge）
- **靜態頁產生器**：新增 paddles + videos 路由
- **llms.txt**：完整列出新內容
- **Sitemap URLs**: 128 → **130**

### Build Stats
- 新增檔案：4 個（paddleDatabase.ts, videosData.ts, PaddleDatabase.tsx, Videos.tsx）
- 球拍資料：25 款
- 影片精選：20 支
- 總頁面：128 → **130+**

---

## [v1.6.0] - Players Database & History Timeline (2026-04-25)

### 🎯 Mission
深化權威內容最後一哩路：選手資料庫擴充 8x、加入 60 年匹克球編年史。每個選手名字、每個規則演變都是獨立 SEO 入口。

### Featured Updates 🚀
- **選手資料庫 3 → 25+ 位**（PPA Tour + MLP + 亞洲區 + 台灣）
- **每位選手獨立詳情頁**：含完整戰績、裝備、打法分析
- **匹克球 60 年編年史**：31 個關鍵事件 + 11 次規則演變
- **Sitemap: 102 → 128 URLs**

### Added

#### 🏆 選手資料庫（Players Database）
- `/pro-players` 重構，使用新資料源，25+ 位選手全部可連結到詳情頁
- `/players/:slug` 每位選手獨立詳情頁：
  - 基本資料（國籍、身高、慣用手、DUPR、打法）
  - 戰力雷達（力量/控球/速度/戰術/經驗 5 維度）
  - 生涯成就時間軸
  - 使用裝備與贊助商
  - 招牌技巧
  - Person JSON-LD 結構化資料
  - 相關選手推薦
- **選手涵蓋**：
  - **男子 Top 10**: Ben Johns, JW Johnson, Gabriel Tardio, Federico Staksrud, Tyson McGuffin, Christian Alshon, Riley Newman, Collin Johns, Dylan Frazier, Pablo Tellez
  - **女子 Top 8**: Anna Leigh Waters, Catherine Parenteau, Anna Bright, Parris Todd, Jorja Johnson, Leigh Waters, Lea Jansen, Vivienne David
  - **傳奇/轉項**: Jack Sock（前 ATP #8）、Simone Jardim（名人堂）
  - **亞洲**: Daisuke Nakata（日本）、Nguyen Phuong（越南）、Paye Zhang（中國）
  - **台灣**: 陳冠宇（男單）、林怡安（女單）

#### 📅 匹克球編年史（History Timeline）
- `/history` 完整 1965-2026 時間軸
- **31 個關鍵事件**：
  - 1965 誕生於華盛頓州
  - 1976 首屆全美錦標賽
  - 1984 USAPA 成立
  - 2010 IFP 國際聯盟
  - 2016 PPA 職業化
  - **2017 CTPF 台灣協會成立**
  - 2020 COVID 帶動爆發
  - 2021 Drop Serve 合法化 + MLP 成立
  - 2022 LeBron/Brady 投資
  - **2024 APG 台中首屆亞洲運動會**
  - 2026 台灣人口破 120 萬
- **11 次規則演變史**：
  - Drop Serve 合法化
  - Let Serve 取消重發
  - Rally Scoring 實驗
  - 熱壓成型球拍規範
  - DUPR 官方化
  - 年齡組細化到 85+
- 視覺化時間軸（里程碑事件金色突顯）
- 可按類別篩選（全球/台灣/規則/賽事/科技）

### Changed

- **Header 導航**：「裝備選手」下拉新增「匹克球編年史」
- **SEO**：新增 history 頁面配置、Person schema 注入、Article schema for history
- **Static Generator**：
  - 25 條選手路由 `/players/:slug` 靜態 HTML 生成
  - history 頁面結構化資料
  - Sitemap URLs: 102 → **128**（+26）

### Technical Notes

- **SEO 關鍵字覆蓋爆發**：25 位選手 × 平均 3 個長尾關鍵字 = 75+ 新入口（「Ben Johns paddle」「Anna Leigh Waters bio」等）
- **權威內容**：歷史時間軸建立永久資產，不會過時
- **Person JSON-LD**：每位選手的 Schema 含 nationality, award, sponsor 等欄位，有助於 Google Knowledge Graph

### Build Stats
- 新增檔案：4 個（playersData.ts, historyData.ts, PlayerDetail.tsx, History.tsx）
- 修改：ProPlayers.tsx 大幅重構
- 總頁面：102 → **128+**
- 選手：3 → **25+**
- 歷史事件：0 → **31 個**
- 規則演變：0 → **11 次**

---

## [v1.5.0] - Long-Form Content & AI-Overview Optimization (2026-04-25)

### 🎯 Mission
把「Picklemaster Taiwan」升級為 AI 搜尋時代的匹克球內容權威。透過長文、FAQ、術語三線並進，最大化 Google AI Overview、Perplexity、ChatGPT 引用機率。

### Featured Updates 🚀
- **8 篇深度長文**（共 ~18,000 字）：每篇 2000-3000 字，涵蓋器材、運動科學、比較分析、族群指南
- **FAQ 13 題 → 100+ 題**（8 大類別）
- **術語字典 20 條 → 80+ 條**

### Added

#### 📖 深度專欄 Articles
- `/articles` 索引頁 + 6 大分類篩選
- `/articles/:slug` 每篇獨立詳情頁含：
  - Article JSON-LD + FAQPage JSON-LD（雙 schema 強化 AI 引用）
  - 目錄 TOC、章節錨點、相關文章推薦
  - 參考資料來源標註
- **8 篇長文**：
  - `2026-best-pickleball-paddles` 2026 十大匹克球拍完整評測
  - `pickleball-vs-tennis-badminton-padel` 匹克球 vs 網球 vs 羽球 vs Padel 完整比較
  - `2026-best-pickleball-shoes` 2026 最佳匹克球鞋選購指南
  - `indoor-vs-outdoor-balls` 匹克球室內球 vs 戶外球全解析
  - `pickleball-injury-prevention` 匹克球傷害預防完整指南
  - `senior-pickleball-guide` 50+ 歲銀髮族匹克球入門完全指南
  - `doubles-vs-singles` 匹克球雙打 vs 單打完整對照
  - `pickleball-nutrition-fitness` 匹克球選手的營養與體能訓練

#### ❓ FAQ 擴充（13 → 100 題）
- 8 大類別：基礎入門、規則細節、裝備器材、技術訓練、比賽賽事、球場設施、社群生活、運動健康
- 每類別 10-15 題，每題 2-5 句精準回答
- 新增：搜尋功能、類別篩選、FAQPage schema 自動生成
- 資料獨立為 `faqData.ts`（方便維護與擴充）

#### 📚 術語字典擴充（20 → 80+ 條）
- **規則**：+10 條（腳步犯規、重賽、干擾、擦網球、換發、首輪發球員、報分、平手決勝、球拍檢查、延遲比賽）
- **技術**：+13 條（Drive、Lob、Punch Volley、Roll Volley、Block Volley、Topspin、Backspin、Sidespin、Soft Hands、Paddle Up、Ready Position、Split Step、Follow Through）
- **戰術**：+10 條（Cross Court、Down the Line、Weak Side、Middle Shot、No Man's Land、Bert、Fake、Poach Signal、Reset Zone、Dink Rally）
- **裝備**：+10 條（握把尺寸、加握把膠帶、拍面、邊框、球拍重量、匹克球、Dura Fast 40、Franklin X-40、廚房線、專用球鞋）
- **場地**：+10 條（底線、邊線、中線、發球區、網柱、戶外球場、室內球場、風雨球場、壓克力面層、Sport Court）
- **賽制**：+11 條（Dreambreaker、循環賽、單淘汰、雙淘汰、瑞士制、分齡組、混合雙打、公開組、APG、CTPF、USAPA）
- **人物**：+2 條（Ben Johns、Anna Leigh Waters）

### Changed

#### 🔍 SEO / AI Overview 優化
- **sitemap.xml** 93 → **102 URLs**（+8 篇長文 + 1 索引頁）
- 每篇長文自動生成獨立 Article + FAQPage schema
- 靜態頁產生器新增 `articles/` 子路由批次生成
- llms.txt 完整列出所有長文、FAQ、術語字典
- SEOHead breadcrumbs 支援新路由

### Technical Notes

- **內容量化**：總字數從 ~15,000 增至 **~45,000 字**（3 倍）
- **結構化資料**：每篇長文雙 schema（Article + FAQPage），大幅提升 AI 引用機率
- **純資料檔設計**：articlesData.ts、faqData.ts、glossaryData.ts 三者可獨立維護
- **關鍵字覆蓋**：估計新增 500+ 個長尾關鍵字入口

### Build Stats
- 新增檔案：4 個（articlesData.ts, faqData.ts, Articles.tsx, ArticleDetail.tsx）
- 修改檔案：7 個（FAQ.tsx 重寫、glossaryData.ts 擴充、路由、SEO、生成器）
- 總頁面：88+ → **102+**
- 專欄長文：0 → **8 篇（18,000 字）**
- FAQ：13 → **100 題**
- 術語：20 → **80+ 條**

---

## [v1.4.0] - Content Depth & Pure-Info Tools (2026-04-24)

### 🎯 Mission
深化內容護城河與實用工具，從「權威資訊中心」走向「匹克球界 Wikipedia + 工具箱」。全部純前端、零後端、零資料庫。

### Featured Updates 🚀
- **12 個技巧深度百科頁**：從握拍到 ATP，每頁 2000+ 字完整教學
- **58 個球場獨立詳情頁**：自動生成，含即時天氣、Google 導航
- **4 個純前端工具**：DUPR 模擬器、輪轉排程、籤表產生、場地劃線指南
- **Open-Meteo 天氣整合**：戶外球場自動顯示當下適不適合打球

### Added

#### 📖 技巧百科（Techniques）
- `/techniques` 索引頁：12 個技巧，可依分類（擊球/發球/網前/防守/戰術/步法）、等級（新手→高手）篩選
- `/techniques/:slug` 每個技巧獨立深度頁，含：
  - 關鍵要點、步驟分解、常見錯誤與修正、專屬練習菜單
  - 職業選手心法、相關技巧、YouTube 搜尋建議
  - HowTo Schema 結構化資料（AI 搜尋優化）
- **12 個技巧**：Continental Grip、Dink、Third Shot Drop、Forehand/Backhand Drive、Serve、Return of Serve、Volley、Reset、Erne、ATP、Stacking

#### 🗺️ 球場詳情頁（Court Detail）
- `/courts/court-{id}` 每座球場獨立頁
- 完整資訊表、設施清單、場地說明
- Google 導航、地圖檢視、線上預約快速按鈕
- **戶外球場自動顯示即時天氣**（Open-Meteo API，無需 key）
- SportsActivityLocation JSON-LD 結構化資料
- 58 座球場 = 58 個獨立 SEO 頁面

#### 🛠️ 純前端工具箱（Tools）
- `/tools` 工具總覽頁
- `/tools/dupr-simulator` **DUPR 評分模擬器**
  - 輸入你與對手 DUPR、比賽結果，預估下一場評分變動
  - 採用簡化 Elo 演算法（實際 DUPR 用貝葉斯動態模型）
- `/tools/rotation` **雙打輪轉排程器**
  - 5-16 人自動排輪次，避免重複配對
  - 可自訂球員名字、設定場次與場地數
  - 支援列印帶到球場用
- `/tools/bracket` **比賽籤表產生器**
  - 單淘汰 + 循環賽兩種賽制
  - 自動處理不完整人數（bye），列印友善
- `/tools/court-lines` **場地劃線指南**
  - 完整標準尺寸表、SVG 場地示意圖
  - 羽球場改造匹克球場逐步教學
  - 6 種場地材質比較

#### 🌤️ 天氣整合
- `WeatherWidget` 組件：Open-Meteo API（無 key、免費、商用可用）
- 戶外球場詳情頁自動顯示：溫度、天氣代碼、風速、濕度、降雨
- 自動判斷「適合打球」或「建議改期/改室內場」

#### 🧭 導航大改
- 選單重整為 5 大區塊：找球場、賽事、學習、裝備選手、工具、更多
- 「學習」下拉含技巧百科、新手懶人包、規則、學習路徑、術語、FAQ
- 「工具」下拉一鍵通達所有工具

### Changed

- **`llms.txt`** 大幅擴充：新增技巧百科、工具箱、球場個別頁描述
- **Courts 頁**：列表與卡片的球場名稱改為連結，可點擊進入詳情
- **靜態頁產生器**：
  - 新增 12 條技巧路由 + 58 條球場路由的靜態 HTML 生成
  - 每頁注入專屬 HowTo / SportsActivityLocation JSON-LD
  - sitemap.xml 總 URL 從 18 增至 **88+**
- **SEO**：seo.ts 新增 7 個頁面配置（techniques, tools, 4 tools, ...）

### Technical Notes

- **純前端實作**：所有工具使用 React state + localStorage（無後端、無 DB）
- **Open-Meteo**：選用無 key、CORS 友善、Taiwan 時區支援的氣象 API
- **SEO 爆發**：從 v1.3.0 的 ~20 條 URL → v1.4.0 的 ~88 條，每條都有獨特內容與 schema
- **類型安全**：所有新頁面皆有完整 TypeScript 類型

### Build Stats
- 新增檔案：12 個 (data + pages + tools + component)
- 技巧內容：~12,000 字中文深度教學
- 總路由：16 → 28（+ 動態 slug 路由）
- 靜態生成頁：16 → 88+

---

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
