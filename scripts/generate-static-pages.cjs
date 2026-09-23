const fs = require('fs');
const path = require('path');
const { renderOg } = require('./og-image.cjs');

// Configuration
const BUILD_DIR = path.join(__dirname, '../docs');
const BASE_URL = 'https://picklemastertw.com';

// 頁面網址一律帶尾斜線。GitHub Pages 以目錄提供頁面，/rules 會 301 到 /rules/，
// canonical 或 sitemap 若寫成無尾斜線，等於自我指向一個會轉址的網址，
// GSC 會標成「有重新導向的網頁」。只有頁面網址要加，圖片等資產不要。

// 球場主檔（模組層先讀，供 /courts 的 ItemList 結構化資料使用；
// 讀 public/ 而非 docs/，避免依賴 vite 的複製時序）
const ALL_COURTS = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../public/data/courts.json'), 'utf-8')
).courts;

// 為單頁產生專屬 OG 圖並替換 og:image / twitter:image；失敗則保留預設圖（優雅降級）
let ogGenerated = 0;
function applyOg(content, ogPathRel, opts) {
    const png = renderOg(opts);
    if (!png) return content;
    const abs = path.join(BUILD_DIR, ogPathRel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, png);
    const url = `${BASE_URL}/${ogPathRel}`;
    content = content.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${url}" />`);
    content = content.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${url}" />`);
    content = content.replace(/<meta property="og:image:alt" content=".*?" \/>/, `<meta property="og:image:alt" content="${(opts.title || '').replace(/"/g, '&quot;')}" />`);
    ogGenerated++;
    return content;
}

// HTML 逸出（供各詳情頁預渲染共用）
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 詳情頁預渲染骨架：麵包屑 + h1 + 內文，注入靜態 HTML 的 #root，
// 讓不執行 JS 的爬蟲/AI 引擎也讀得到內容（React createRoot 掛載時會自動替換）
function prerenderShell({ crumbs, h1, bodyHtml }) {
    const nav = crumbs.map((c, i) => (
        i < crumbs.length - 1 && c.href
            ? `<a href="${c.href}" style="color:#0d9488;text-decoration:none;">${esc(c.name)}</a> ›`
            : `<span>${esc(c.name)}</span>`
    )).join(' ');
    return `
      <main style="max-width:880px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,'PingFang TC','Microsoft JhengHei',sans-serif;color:#1f2937;line-height:1.7;">
        <nav aria-label="breadcrumb" style="font-size:13px;color:#6b7280;margin-bottom:16px;">${nav}</nav>
        <h1 style="font-size:30px;font-weight:800;margin:0 0 12px;">${esc(h1)}</h1>
        ${bodyHtml}
      </main>`;
}
function injectPrerender(content, shellHtml) {
    return content.replace('<div id="root"></div>', `<div id="root">${shellHtml}</div>`);
}

// SEO Data (Copied from src/utils/seo.ts)
const pageSEO = {
    courts: {
        title: '全台匹克球場地圖 2026 » GPS 一鍵找球場 150+ 免費/室內/24H 場地',
        description: '2026 全台最新匹克球場地圖！收錄 150+ 球場，17 縣市全覆蓋（含花博 MAJI、內湖 PicklePickle、板橋國運、台中 YIYI、雲林 PK Park、花蓮 PKing 等）。GPS 定位找最近球場，篩選室內冷氣、戶外免費、24 小時、風雨球場，桃園/新竹/彰化/嘉義新場全更新。',
        keywords: '匹克球場,匹克球場地,皮克球場地,台灣匹克球場,匹克球場地圖,匹克球場推薦,匹克球場預約,戶外匹克球場,免費匹克球場,室內匹克球場,附近匹克球場,最近匹克球場,24小時匹克球場,台北匹克球場,新北匹克球場,桃園匹克球場地,新竹匹克球場,台中匹克球場,彰化匹克球場,嘉義匹克球場,台南匹克球場,高雄匹克球場,屏東匹克球場,宜蘭匹克球場,花蓮匹克球場,南投匹克球場,天母公園匹克球場,大村匹克球,竹北星空匹克球場,北投匹克球場,信義匹克球場,士林匹克球場,內湖匹克球場,大安匹克球場,松山匹克球場,中和匹克球場,新莊匹克球場,板橋匹克球場,淡水匹克球場,龜山匹克球場,中壢匹克球場,平鎮匹克球場,西屯匹克球場,南屯匹克球場,東區匹克球場,鳳山匹克球場,左營匹克球場,前金匹克球場,埔里匹克球場,大村匹克球場,秀水匹克球場,公園匹克球場,河濱匹克球場,學校匹克球場,運動中心匹克球,網球中心匹克球場,PICKZONE,Pickle Day,Downstairs Pickleball,Social N Pickle,P.dang,Seattle Pickleball,pickleball court taiwan,pickleball court taipei,pickleball court kaohsiung,pickleball court taichung,pickleball court taoyuan,pickleball court hsinchu,pickleball near me',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/courts#webpage",
                    "url": "https://picklemastertw.com/courts/",
                    "name": "台灣匹克球場地圖 2026 | 全台 150+ 球場完整資訊",
                    "description": "2026 年台灣最完整的匹克球場地圖！GPS 定位找最近球場、篩選室內/戶外/免費/24 小時/公園/河濱場地。",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" },
                    "inLanguage": "zh-TW"
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "找球場", "item": "https://picklemastertw.com/courts/" }
                    ]
                },
                {
                    "@type": "SportsActivityLocation",
                    "name": "台灣匹克球場地圖",
                    "description": "提供全台灣超過 130 個匹克球場的詳細資訊與地圖，涵蓋雙北、桃竹、中彰投、雲嘉南、高屏、宜花東",
                    "geo": { "@type": "GeoCoordinates", "latitude": "23.5", "longitude": "121.0" },
                    "address": { "@type": "PostalAddress", "addressCountry": "TW", "addressRegion": "台灣" }
                },
                {
                    "@type": "ItemList",
                    "@id": "https://picklemastertw.com/courts#courtlist",
                    "name": "全台匹克球場完整列表",
                    "numberOfItems": ALL_COURTS.length,
                    "itemListElement": ALL_COURTS.map((c, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "name": c.name,
                        "url": `${BASE_URL}/courts/court-${c.id}/`
                    }))
                },
                {
                    "@type": "WebApplication",
                    "name": "台灣匹克球場地圖",
                    "description": "GPS 定位找最近球場、篩選室內/戶外/免費/民營場地的互動式地圖工具",
                    "applicationCategory": "SportsApplication",
                    "operatingSystem": "Any",
                    "featureList": ["GPS 定位找最近球場", "依城市篩選球場", "依類型篩選", "球場詳細資訊查看"],
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "TWD" }
                }
            ]
        }
    },
    rules: {
        title: '3分鐘學會匹克球！超簡單 3D 互動規則教學 (雙彈跳/廚房區)',
        description: '文字規則看不懂？全台獨家「3D 互動式教學」！點擊球場直接看解說。秒懂雙彈跳規則、廚房區禁區、發球順序。新手看完直接下場比賽！',
        keywords: '匹克球規則,pickleball rules,匹克球雙彈跳,匹克球廚房區,匹克球發球規則,匹克球計分,匹克球界線,匹克球教學,匹克球入門',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/rules#webpage",
                    "url": "https://picklemastertw.com/rules/",
                    "name": "3分鐘學會匹克球！超簡單 3D 互動規則教學",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "新手懶人包", "item": "https://picklemastertw.com/newcomer-guide/" },
                        { "@type": "ListItem", "position": 3, "name": "規則教學", "item": "https://picklemastertw.com/rules/" }
                    ]
                },
                {
                    "@type": "HowTo",
                    "name": "如何開始打匹克球 - 規則篇",
                    "description": "完整的匹克球規則指南，從雙彈跳到廚房區限制",
                    "step": [
                        { "@type": "HowToStep", "position": 1, "name": "雙彈跳規則", "text": "發球和接發球都必須讓球落地彈起後才能擊球" },
                        { "@type": "HowToStep", "position": 2, "name": "廚房區規則", "text": "在網前7英尺區域內不能截擊" },
                        { "@type": "HowToStep", "position": 3, "name": "發球規則", "text": "發球必須對角線發向對方場地" },
                        { "@type": "HowToStep", "position": 4, "name": "計分規則", "text": "只有發球方得分，通常打到11分獲勝" }
                    ]
                }
            ]
        }
    },
    equipment: {
        title: '匹克球拍怎麼選？2026 新手裝備懶人包：職業選手也推薦',
        description: '買錯球拍最貴！完整匹克球拍材質分析（碳纖維 vs 玻璃纖維）、重量挑選指南。內含「球拍智能推薦系統」，30秒找出最適合你的命定球拍。',
        keywords: '匹克球拍,pickleball paddle,匹克球裝備,球拍推薦,匹克球拍推薦,碳纖維球拍,玻璃纖維球拍,匹克球用品,匹克球裝備購買',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/equipment#webpage",
                    "url": "https://picklemastertw.com/equipment/",
                    "name": "匹克球拍選購指南",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "裝備指南", "item": "https://picklemastertw.com/equipment/" }
                    ]
                },
                {
                    // 2026-09：原本這裡是三筆 Product，各自帶 aggregateRating（4.3／50 則、
                    // 4.6／120 則、4.8／80 則）、自家掛名的 Review，以及 AggregateOffer + InStock。
                    // 那 250 則評論並不存在，本站也沒有評論系統、不販售商品，
                    //「入門級匹克球拍」更是價位帶而非實際商品 —— 違反 Google 評論摘要政策，
                    // 有招來「垃圾結構化標記」人工處罰的風險。改成只陳述得出來的事實。
                    // 對應的執行期副本在 src/utils/seo.ts 的 equipmentProductData。
                    "@type": "ItemList",
                    "name": "匹克球拍價位帶選購指南",
                    "description": "依預算區分的匹克球拍選購指南：材質、重量與適合程度說明",
                    "numberOfItems": 3,
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "入門級匹克球拍（NT$2,000 - 4,000）", "description": "複合材質、重量適中、容錯率高，適合初學者建立基本擊球感。建議選擇重量 7.6-8.0 oz 的款式。" },
                        { "@type": "ListItem", "position": 2, "name": "中階級匹克球拍（NT$4,000 - 8,000）", "description": "玻纖或混碳面板，兼顧控制與力量，適合 DUPR 3.0-3.5 的球員。" },
                        { "@type": "ListItem", "position": 3, "name": "高階級碳纖維匹克球拍（NT$8,000 - 15,000）", "description": "碳纖維面板，旋轉量與甜蜜點明顯優於中階拍，為職業選手主流選擇，適合 DUPR 4.0 以上升級。" }
                    ]
                }
            ]
        }
    },
    'learning-paths': {
        title: '匹克球從 0 到 100：新手入門 → 高手進階完整學習地圖',
        description: '別在那裡亂打！系統化匹克球課程，從握拍發球到高階戰術（Third Shot Drop）。分級學習路徑，帶你一步步成為匹克球高手。免費開始學習！',
        keywords: '匹克球教學,匹克球課程,匹克球學習,匹克球訓練,匹克球入門,匹克球技巧,匹克球戰術,pickleball training,pickleball lesson',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/learning-paths#webpage",
                    "url": "https://picklemastertw.com/learning-paths/",
                    "name": "匹克球完整學習課程",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "學習路徑", "item": "https://picklemastertw.com/learning-paths/" }
                    ]
                },
                {
                    "@type": "Course",
                    "name": "匹克球完整學習課程",
                    "description": "從新手到進階的系統化匹克球學習路徑",
                    "provider": { "@type": "Organization", "name": "Picklemaster Taiwan", "url": "https://picklemastertw.com" },
                    "hasCourseInstance": [
                        { "@type": "CourseInstance", "name": "新手入門課程", "courseMode": "online" },
                        { "@type": "CourseInstance", "name": "中階進修課程", "courseMode": "online" },
                        { "@type": "CourseInstance", "name": "高手養成課程", "courseMode": "online" }
                    ]
                }
            ]
        }
    },
    learning: {
        title: '匹克球實戰技巧 | 3D 球路分析 & 360 度站位教學',
        description: '想變強必看！提供 3D 球場戰術板教學、職業選手球路分析。發球致勝技巧、第三球各種打法、網前截擊反應訓練。互動式內容讓你觀念大升級。',
        keywords: '匹克球技巧,匹克球教學,匹克球訓練,匹克球發球,匹克球截擊,匹克球戰術,匹克球策略,pickleball technique',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/learning#webpage",
                    "url": "https://picklemastertw.com/learning/",
                    "name": "匹克球互動技巧教學",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "實戰技巧", "item": "https://picklemastertw.com/learning/" }
                    ]
                },
                {
                    "@type": "Course",
                    "name": "匹克球互動技巧教學",
                    "description": "3D互動式匹克球教學，包含站位、球路分析",
                    "provider": { "@type": "Organization", "name": "Picklemaster Taiwan", "url": "https://picklemastertw.com" }
                }
            ]
        }
    },
    game: {
        title: '免費玩！Pickle Master 匹克球 3D 互動遊戲 - 邊玩邊學規則',
        description: '無聊嗎？來場線上匹克球對戰！真實物理引擎模擬，在遊戲中熟悉雙彈跳與截擊時機。免下載直接玩，挑戰最高分！',
        keywords: '匹克球遊戲,pickleball game,匹克球練習,匹克球模擬,線上匹克球,匹克球訓練遊戲',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/game#webpage",
                    "url": "https://picklemastertw.com/game/",
                    "name": "Pickle Master 互動遊戲",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "互動遊戲", "item": "https://picklemastertw.com/game/" }
                    ]
                },
                {
                    "@type": "SoftwareApplication",
                    "name": "Pickle Master 互動遊戲",
                    "applicationCategory": "Game",
                    "operatingSystem": "Web",
                    "offers": { "@type": "Offer", "price": "0" }
                }
            ]
        }
    },
    scorer: {
        title: '專業匹克球計分器 (App 免下載) - 支援單雙打 & 語音報分',
        description: '打球不再忘記比分！最受好評的線上計分板。全螢幕大字體、支援語音報分、發球方提示。手機就是最好的裁判，完全免費使用。',
        keywords: '匹克球計分器,pickleball scorer,匹克球計分,比賽計分,匹克球裁判,匹克球比分',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/scorer#webpage",
                    "url": "https://picklemastertw.com/scorer/",
                    "name": "專業匹克球計分器",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "計分器", "item": "https://picklemastertw.com/scorer/" }
                    ]
                },
                {
                    "@type": "SoftwareApplication",
                    "name": "匹克球專業計分器",
                    "applicationCategory": "SportsApplication",
                    "operatingSystem": "Web, iOS, Android",
                    "offers": { "@type": "Offer", "price": "0" }
                }
            ]
        }
    },
    resources: {
        title: '匹克球資源中心 | 台灣球隊、俱樂部、YouTube 頻道總整理',
        description: '找不到球友？這裡有全台匹克球社團與俱樂部名單。精選國內外優質 YouTube 教學頻道、必讀書籍推薦。加入台灣最熱情的匹克球社群！',
        keywords: '匹克球資源,匹克球影片,匹克球YouTube,台灣匹克球協會,匹克球社團,匹克球書籍,pickleball resources',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/resources#webpage",
                    "url": "https://picklemastertw.com/resources/",
                    "name": "匹克球學習資源彙整",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "資源中心", "item": "https://picklemastertw.com/resources/" }
                    ]
                },
                {
                    "@type": "CollectionPage",
                    "name": "匹克球學習資源彙整",
                    "description": "彙整台灣匹克球相關資源、社群、教學頻道"
                }
            ]
        }
    },
    about: {
        title: '關於 Picklemaster Taiwan | 我們的使命與故事',
        description: 'Picklemaster Taiwan 是由一群熱愛匹克球的工程師與球友共同打造。我們致力於推廣台灣匹克球運動，透過科技讓學習更有趣、找球場更方便。',
        keywords: '匹克球台灣,台灣匹克球,picklemaster taiwan,匹克球推廣,匹克球社群,台灣運動',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/about#webpage",
                    "url": "https://picklemastertw.com/about/",
                    "name": "關於 Picklemaster Taiwan",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "更多", "item": "" },
                        { "@type": "ListItem", "position": 3, "name": "關於我們", "item": "https://picklemastertw.com/about/" }
                    ]
                },
                {
                    "@type": "Organization",
                    "name": "Picklemaster Taiwan",
                    "url": "https://picklemastertw.com",
                    "logo": "https://picklemastertw.com/logo.png"
                }
            ]
        }
    },
    faq: {
        title: '匹克球 FAQ 懶人包 | 新手最常問的 100 個問題',
        description: '什麼是雙彈跳？球拍要買哪一種？哪裡可以學球？匯整所有匹克球新手最想知道的問題，一次幫你解答。',
        keywords: '匹克球FAQ,匹克球問題,匹克球疑問,匹克球規則問題,匹克球新手問題',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/faq#webpage",
                    "url": "https://picklemastertw.com/faq/",
                    "name": "匹克球常見問題",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "新手懶人包", "item": "https://picklemastertw.com/newcomer-guide/" },
                        { "@type": "ListItem", "position": 3, "name": "常見問題", "item": "https://picklemastertw.com/faq/" }
                    ]
                },
                {
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "什麼是匹克球（Pickleball）？",
                            "acceptedAnswer": { "@type": "Answer", "text": "匹克球（Pickleball）是一項結合網球、羽毛球和乒乓球特點的球拍運動。使用類似乒乓球拍的實心球拍和有孔的塑膠球，在類似羽毛球大小的場地上進行。" }
                        },
                        {
                            "@type": "Question",
                            "name": "台灣哪裡可以打匹克球？",
                            "acceptedAnswer": { "@type": "Answer", "text": "台灣目前有超過55個匹克球場，分佈在台北、新北、台中、高雄、台南等主要城市。您可以查閱我們網站上的地圖。" }
                        },
                        {
                            "@type": "Question",
                            "name": "匹克球的基本規則是什麼？",
                            "acceptedAnswer": { "@type": "Answer", "text": "核心規則包括：雙彈跳規則、廚房區（Non-Volley Zone）限制、對角發球、以及每局11分制的特殊計分方式。" }
                        },
                        {
                            "@type": "Question",
                            "name": "匹克球和網球有什麼不同？",
                            "acceptedAnswer": { "@type": "Answer", "text": "匹克球場較小（約網球場1/3），使用實心拍與中空塑膠球（球速較慢），且有發球不落地、雙彈跳等特殊規則，節奏較網球更適合各年齡層。" }
                        }
                    ]
                }
            ]
        }
    },
    'pro-players': {
        title: '世界頂尖匹克球選手排名 & 裝備解密 | Picklemaster Taiwan',
        description: '認識世界排名前十的匹克球職業選手。Ben Johns 用什麼球拍？Anna Leigh Waters 的必殺技是什麼？完整戰力分析與裝備大公開。',
        keywords: '匹克球選手,匹克球排名,Ben Johns,Anna Leigh Waters,匹克球職業選手, PPA巡迴賽, APP巡迴賽, 匹克球球星',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/pro-players#webpage",
                    "url": "https://picklemastertw.com/pro-players/",
                    "name": "世界頂尖匹克球選手",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "裝備與攻略", "item": "https://picklemastertw.com/equipment/" },
                        { "@type": "ListItem", "position": 3, "name": "頂尖選手", "item": "https://picklemastertw.com/pro-players/" }
                    ]
                },
                {
                    "@type": "ItemList",
                    "name": "世界頂尖匹克球選手列表",
                    "itemListElement": [
                        { "@type": "Person", "position": 1, "name": "Ben Johns" },
                        { "@type": "Person", "position": 2, "name": "Anna Leigh Waters" },
                        { "@type": "Person", "position": 3, "name": "Tyson McGuffin" }
                    ]
                }
            ]
        }
    },
    aepl: {
        title: 'AEPL 職業聯賽專區｜台灣匹克球職業聯盟 球隊・賽程・戰力分析',
        description: '台灣第一個匹克球職業聯賽 AEPL 完整追蹤：首站冠軍桃園永豐雲豹、6 隊戰力卡、8 站巡迴賽程（第 2 站 9/19-20 高雄駁二）、Dreambreaker 賽制解說、選手焦點與戰報分析。總獎金百萬的創始賽季一站掌握。',
        keywords: 'AEPL,亞洲菁英匹克球聯盟,台灣匹克球職業聯賽,匹克球職業,桃園雲豹,台南旭日雷霆,Ahhh,蘆沐,富瑞特科技,鍾振煒,蔡萱,邱子恩,林志穎,匹克球隊,職業匹克球選手,台中火車站 匹克球,高雄駁二 匹克球',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "SportsOrganization",
                    "name": "AEPL 亞洲菁英匹克球聯盟",
                    "alternateName": "Asia Elite Pickleball League",
                    "sport": "Pickleball",
                    "foundingDate": "2026-05-22",
                    "areaServed": { "@type": "Country", "name": "Taiwan" },
                    "url": "https://picklemastertw.com/aepl/"
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "AEPL 職業聯賽", "item": "https://picklemastertw.com/aepl/" }
                    ]
                }
            ]
        }
    },
    tournaments: {
        title: '2026 台灣匹克球賽事總覽 | CTPF 全年認證賽、國際積分賽',
        description: '完整掌握 2026 台灣匹克球 26 場賽事：AEPL 職業聯賽、TCI APP ASIA TOUR 台北站、金碧盃、南華盃、臺北公開賽、APG 亞洲賽。報名時間、場地、組別、獎金一次看。',
        keywords: '2026匹克球賽事,台灣匹克球比賽,CTPF賽事,臺灣盃匹克球,NAPA盃,港都盃,中正盃,噶瑪蘭盃,臺北匹克球公開賽,APG 亞洲匹克球運動會,匹克球錦標賽,匹克球報名',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/tournaments#webpage",
                    "url": "https://picklemastertw.com/tournaments/",
                    "name": "2026 台灣匹克球賽事總覽",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "2026 賽事", "item": "https://picklemastertw.com/tournaments/" }
                    ]
                },
                {
                    "@type": "ItemList",
                    "name": "2026 台灣匹克球賽事",
                    "numberOfItems": 11,
                    "itemListElement": [
                        { "@type": "SportsEvent", "position": 1, "name": "2026 臺灣盃全國匹克球公開賽", "sport": "Pickleball", "startDate": "2026-01-30", "endDate": "2026-02-01", "location": { "@type": "Place", "name": "國立宜蘭大學體育館" } },
                        { "@type": "SportsEvent", "position": 2, "name": "2026 NAPA 盃全國匹克球錦標賽", "sport": "Pickleball", "startDate": "2026-02-28", "endDate": "2026-03-01" },
                        { "@type": "SportsEvent", "position": 3, "name": "2026 港都盃全國匹克球錦標賽", "sport": "Pickleball", "startDate": "2026-04-18", "location": { "@type": "Place", "name": "樹德科技大學" } },
                        { "@type": "SportsEvent", "position": 4, "name": "2026 全國中正盃匹克球錦標賽", "sport": "Pickleball", "startDate": "2026-06-20", "location": { "@type": "Place", "name": "台北市大安運動中心" } },
                        { "@type": "SportsEvent", "position": 5, "name": "2026 噶瑪蘭盃匹克球錦標賽", "sport": "Pickleball", "startDate": "2026-08-15", "location": { "@type": "Place", "name": "宜蘭運動公園" } },
                        { "@type": "SportsEvent", "position": 6, "name": "2026 臺北匹克球公開賽", "sport": "Pickleball", "startDate": "2026-09-12", "location": { "@type": "Place", "name": "臺北體育館" } },
                        { "@type": "SportsEvent", "position": 7, "name": "2026 亞洲匹克球運動會 (APG)", "sport": "Pickleball", "startDate": "2026-10-15" }
                    ]
                }
            ]
        }
    },
    glossary: {
        title: '匹克球術語大全 | 中英對照字典 - Dink, Erne, ATP 全收錄',
        description: '全台最完整的匹克球中英文術語字典。雙彈跳、廚房區、第三球下切、Erne、ATP、疊站、DUPR...規則、技術、戰術、裝備、場地、賽制一次看懂。',
        keywords: '匹克球術語,pickleball glossary,dink,erne,ATP,third shot drop,雙彈跳,廚房區,疊站,DUPR,匹克球英文,匹克球中英對照',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/glossary#webpage",
                    "url": "https://picklemastertw.com/glossary/",
                    "name": "匹克球術語大全",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "術語字典", "item": "https://picklemastertw.com/glossary/" }
                    ]
                },
                {
                    "@type": "DefinedTermSet",
                    "name": "匹克球術語大全",
                    "description": "中英對照匹克球術語權威字典，涵蓋規則、技術、戰術、裝備、場地、賽制"
                }
            ]
        }
    },
    ratings: {
        title: 'DUPR 評級指南 2026 | 全球通用匹克球動態評分系統完整解析',
        description: '2026 起 DUPR 成為全球匹克球賽事標準。1.0-8.0 評級意義、技術對照、典型球員、如何取得評分。台灣選手完整指南。',
        keywords: 'DUPR,DUPR評級,匹克球評分,匹克球等級,Dynamic Universal Pickleball Rating,匹克球 DUPR 台灣,pickleball rating',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/ratings#webpage",
                    "url": "https://picklemastertw.com/ratings/",
                    "name": "DUPR 評級指南 2026",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "DUPR 評級", "item": "https://picklemastertw.com/ratings/" }
                    ]
                },
                {
                    "@type": "DefinedTermSet",
                    "name": "DUPR 匹克球評級系統",
                    "description": "Dynamic Universal Pickleball Rating - 全球通用匹克球動態評分系統，範圍 1.0-8.0"
                }
            ]
        }
    },
    'training-programs': {
        title: '匹克球系統訓練菜單 | 8 套週日進度，從新手 8 週到進階 Reset 大師',
        description: '8 套系統化匹克球訓練菜單：新手 8 週入門、Dink 4 週特訓、銀髮族 12 週、雙打配合 6 週等。',
        keywords: '匹克球訓練菜單,匹克球練習,匹克球新手菜單,pickleball training program',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "匹克球系統訓練菜單",
            "url": "https://picklemastertw.com/training-programs/"
        }
    },
    playbook: {
        title: '匹克球戰術劇本庫 | 30+ 情境戰術對照',
        description: '30+ 比賽情境戰術速查：對方深發球、被連續強攻、搭檔失誤等。',
        keywords: '匹克球戰術,匹克球戰略,匹克球比賽戰術,pickleball tactics',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "匹克球戰術劇本庫"
        }
    },
    'hall-of-fame': {
        title: '匹克球名人堂 | 1965 創辦人、傳奇選手、台灣推廣者',
        description: '從 1965 三位後院父親 Joel Pritchard、Bill Bell、Barney McCallum，到 Ben Johns 等當代傳奇。',
        keywords: '匹克球名人堂,匹克球發明人,Joel Pritchard,USAPA Hall of Fame,陳朝鍵',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "匹克球名人堂",
            "url": "https://picklemastertw.com/hall-of-fame/"
        }
    },
    paddles: {
        title: '匹克球拍完整資料庫 | 26 大品牌 45 款規格對照、並排比較',
        description: 'JOOLA、Selkirk、Paddletek、Vatic Pro、Ronbus、Niupipo、Facolos、ProKennex 等 26 大品牌 45 款球拍。小紅書熱門、高 CP 值新手拍完整收錄，附拍型定位與六軸專業篩選，支援 2-4 支規格並排比較。',
        keywords: '匹克球拍資料庫,球拍規格,匹克球拍比較,匹克球拍推薦,新手匹克球拍,JOOLA Perseus,Vatic Pro,Ronbus,Niupipo,高CP值球拍,pickleball paddle database,paddle comparison',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "匹克球拍完整資料庫",
            "description": "26 大品牌 45 款熱門匹克球拍完整規格對照",
            "numberOfItems": 45,
            "url": "https://picklemastertw.com/paddles/"
        }
    },
    videos: {
        title: '匹克球教學影片中心 | 20+ 支精選 YouTube 國際名師',
        description: 'Briones、Pickleball University、Enhance Pickleball 等頂級頻道精選教學。每支附中文解說與推薦理由。',
        keywords: '匹克球影片,匹克球教學影片,pickleball tutorial,Briones Pickleball',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "匹克球教學影片中心",
            "url": "https://picklemastertw.com/videos/"
        }
    },
    history: {
        title: '匹克球 60 年編年史 1965-2026 | 全球與台灣大事記',
        description: '從 1965 年華盛頓州一個後院發明的遊戲，到 2026 年全球千萬人的運動。30+ 關鍵事件 + 11 次規則演變。',
        keywords: '匹克球歷史,匹克球起源,匹克球規則演變,CTPF 歷史,匹克球編年史',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "匹克球 60 年編年史 1965-2026",
            "description": "匹克球運動從 1965 年誕生至今的完整編年史",
            "datePublished": "2026-04-25",
            "author": { "@type": "Organization", "name": "Picklemaster Taiwan" }
        }
    },
    articles: {
        title: '匹克球深度專欄 | 器材評測、運動科學、族群指南一次看',
        description: '每篇 2000-3000 字深度長文。十大球拍評測、匹克球 vs 網球完整比較、傷害預防、銀髮族入門、營養體能訓練。',
        keywords: '匹克球長文,匹克球評測,匹克球科學,匹克球指南,pickleball article,匹克球教學文章',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "匹克球深度專欄",
            "description": "深度長文：器材評測、運動科學、技術戰術、族群指南",
            "url": "https://picklemastertw.com/articles/"
        }
    },
    techniques: {
        title: '匹克球技巧百科 | 12+ 深度教學：Dink、Drop、Erne、ATP 一次掌握',
        description: '從新手握拍到進階 ERNE/ATP，每個技巧都有完整步驟分解、常見錯誤修正、專屬練習菜單與職業選手心法。',
        keywords: '匹克球技巧,pickleball techniques,dink 教學,third shot drop,erne,ATP 匹克球',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "匹克球技巧百科",
            "description": "12+ 個匹克球技巧深度教學頁面",
            "url": "https://picklemastertw.com/techniques/"
        }
    },
    tools: {
        title: '匹克球工具箱 | DUPR 模擬器、輪轉排程、籤表、計分器',
        description: '球友與教練的純前端工具集：DUPR 評分模擬、雙打輪轉排程器、比賽籤表產生器、場地劃線指南、計分器。',
        keywords: '匹克球工具,DUPR 模擬器,輪轉排程,籤表產生器,匹克球計分器',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "匹克球工具箱"
        }
    },
    'tools/dupr-simulator': {
        title: 'DUPR 評分模擬器 | 預估下一場比賽對你的評分影響',
        description: '輸入你與對手 DUPR、比賽結果，即時預估你下一場的 DUPR 變動。',
        keywords: 'DUPR 模擬器,DUPR 計算,匹克球評分預估',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "DUPR Simulator",
            "applicationCategory": "SportsApplication",
            "operatingSystem": "Web"
        }
    },
    'tools/rotation': {
        title: '雙打輪轉排程器 | 5-16 人約球自動排輪次',
        description: '球友約球自動排輪次，避免重複配對。',
        keywords: '匹克球 輪轉,雙打輪轉,約球排程'
    },
    'tools/bracket': {
        title: '比賽籤表產生器 | 單淘汰、循環賽 PDF 列印',
        description: '自動生成單淘汰、循環賽籤表，支援列印。',
        keywords: '比賽籤表,pickleball bracket generator,匹克球賽事'
    },
    'tools/court-lines': {
        title: '匹克球場地劃線指南 | 標準尺寸 + 羽球場改造教學',
        description: '完整場地尺寸、廚房區、網高規範、場地材質建議。',
        keywords: '匹克球 場地尺寸,pickleball court dimensions,羽球場 改 匹克球'
    },
    'newcomer-guide': {
        title: '第一次打匹克球就上手 - 台灣新手懶人包 | 費用試算 & 入門指南',
        description: '想打匹克球但不知道從何開始？專為台灣新手設計的懶人包。互動式預算試算、羽球轉匹克球技巧分析。',
        keywords: '匹克球新手,匹克球入門,匹克球費用,匹克球拍價格,羽球轉匹克球,網球轉匹克球,匹克球教學,台灣匹克球',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/newcomer-guide#webpage",
                    "url": "https://picklemastertw.com/newcomer-guide/",
                    "name": "新手匹克球入門指南",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "新手懶人包", "item": "https://picklemastertw.com/newcomer-guide/" }
                    ]
                }
            ]
        }
    },
};

// 這兩頁原本不在 pageSEO 裡，因此既沒有預渲染也沒有進 sitemap，
// 對 Googlebot 一律回 404（scripts/audit-routes.cjs 就是為了抓這種洞）。
// 用賦值追加而非塞進物件字面值 —— 那個字面值裡有大量含大括號的字串，
// 程式化插入很容易插到嵌套物件中間。
pageSEO.contact = {
    title: '聯絡我們 | 資料回報與合作洽詢 | 匹克球台灣',
    description: '球場資訊有誤、想新增場地、或有合作提案？本站的球場與賽事資料全部人工查證，歡迎回報更正。可透過 GitHub Issues 提交問題與建議。',
    keywords: '匹克球台灣 聯絡,匹克球場回報,匹克球資料更正,picklemaster taiwan contact',
};
pageSEO['privacy-policy'] = {
    title: '隱私權政策 | 匹克球台灣',
    description: '本站蒐集哪些資訊、如何使用、存在哪裡、保存多久，以及你的權利。瀏覽不需註冊；揪團約打只存暱稱與報名紀錄，可隨時自行刪除。',
    keywords: '匹克球台灣 隱私權政策,picklemaster taiwan privacy policy',
};
// 資料方法頁：把「每座球場都人工查證並標示日期」這件事講清楚。
// 這是本站相對於自動抓取的名錄站最難被取代的部分，但原本只散落在各球場頁的一行小字。
// title/description 的實際數字在預渲染時由 courts.json 算出來覆蓋（見 INDEX_PAGES）。
// 揪團約打。React 端在 src/utils/seo.ts 的 pageSEO.play，兩邊要一致。
// 動態內容（使用者開的團）都在 /play/?g=… 由前端載入並 noindex；這裡只預渲染本站查證的固定球敘。
pageSEO['play'] = {
    title: '匹克球揪團約打｜臨打報名・固定球敘，不用註冊',
    description: '找匹克球臨打與球友：全台各地球場的固定球敘時段（本站逐筆查證）與線上揪團。挑一團、取個暱稱就能報名，額滿自動候補、有人取消自動遞補，不用註冊也不用下載 App。',
    keywords: '匹克球揪團,匹克球臨打,匹克球零打,匹克球約打,匹克球球敘,匹克球找球友,pickleball open play taiwan',
};

pageSEO['data-method'] = {
    title: '球場資料怎麼來、怎麼查證｜Picklemaster 資料方法',
    description: '本站的匹克球場資料來源、逐座人工查證流程、歇業複查方式與錯誤回報管道。每座球場都標示最後查證日期。',
    keywords: '匹克球場資料來源,匹克球場資料查證,picklemaster 資料方法,匹克球場資訊正確性',
};


// Training programs (per-slug static pages)
const PROGRAM_SLUGS = [
    { slug: 'beginner-8-week', title: '新手 8 週入門完整菜單', subtitle: '從 0 開始，8 週後能輕鬆下場打雙打' },
    { slug: 'dink-master-4-week', title: 'Dink 軟球 4 週特訓菜單', subtitle: '從不敢打軟球到 Dink 對戰王者' },
    { slug: 'drop-master-4-week', title: 'Third Shot Drop 4 週特訓', subtitle: '從中階升進階的關鍵技術' },
    { slug: 'senior-12-week', title: '50+ 銀髮族 12 週入門菜單', subtitle: '安全溫和、循序漸進' },
    { slug: 'doubles-partnership-6-week', title: '雙打配合 6 週默契養成', subtitle: '與固定搭檔的進階配合菜單' },
    { slug: 'singles-fitness-6-week', title: '單打體能 6 週菜單', subtitle: '提升心肺、爆發力、橫向移動' },
    { slug: 'backhand-master-4-week', title: '反手強化 4 週特訓', subtitle: '消除最大弱點 — 雙手反手養成' },
    { slug: 'reset-master-4-week', title: 'Reset 防守大師 4 週特訓', subtitle: '從業餘升職業的最後一哩路' },
];

// Players (per-slug static pages) — minimal subset for SEO
// ===== 球拍清單：直接從 src/data/paddleDatabase.ts 擷取，避免兩處維護 =====
const PADDLE_SLUGS = (() => {
    try {
        const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'paddleDatabase.ts'), 'utf-8');
        const body = src.slice(src.indexOf('export const PADDLE_DATABASE'), src.indexOf('/* ===== 正版購買管道'));
        const re = /slug: '([^']+)',\s*\n\s*brand: '([^']+)',\s*\n\s*model: '([^']+)',\s*\n\s*year: (\d+),[\s\S]*?level: '([^']+)',\s*\n\s*shape: '([^']+)',\s*\n\s*weight: '([^']+)',\s*\n\s*thickness: '([^']+)',\s*\n\s*core: '([^']+)',\s*\n\s*face: '([^']+)'/g;
        const out = [];
        let m;
        while ((m = re.exec(body)) !== null) {
            out.push({
                slug: m[1], brand: m[2], model: m[3], year: +m[4], level: m[5],
                shape: m[6], weight: m[7], thickness: m[8], core: m[9], face: m[10],
            });
        }
        return out;
    } catch (e) {
        console.warn('  ! 無法解析 paddleDatabase.ts，略過球拍詳細頁:', e.message);
        return [];
    }
})();

const PLAYER_SLUGS = [
    { slug: 'ben-johns', name: 'Ben Johns', country: 'USA', bio: '匹克球界 GOAT，連續 5+ 年世界第一。' },
    { slug: 'jw-johnson', name: 'JW Johnson', country: 'USA', bio: '20 歲出頭就登頂的年輕天才，身高臂長強攻打法。' },
    { slug: 'gabriel-tardio', name: 'Gabriel Tardio', country: 'USA', bio: '天才少年，15 歲擊敗世界前 10。' },
    { slug: 'federico-staksrud', name: 'Federico Staksrud', country: 'Argentina / USA', bio: '男單世界第一，阿根廷出生的全能型選手。' },
    { slug: 'tyson-mcguffin', name: 'Tyson McGuffin', country: 'USA', bio: '匹克球界最具群眾魅力的明星。' },
    { slug: 'christian-alshon', name: 'Christian Alshon', country: 'USA', bio: 'Selkirk 王牌，穩定的底線對抽。' },
    { slug: 'riley-newman', name: 'Riley Newman', country: 'USA', bio: 'Newman 家族兄妹檔一員，頂尖雙打選手。' },
    { slug: 'collin-johns', name: 'Collin Johns', country: 'USA', bio: 'Ben Johns 的親哥哥，前世界級桌球選手。' },
    { slug: 'dylan-frazier', name: 'Dylan Frazier', country: 'USA', bio: '新世代左撇子代表。' },
    { slug: 'pablo-tellez', name: 'Pablo Tellez', country: 'Colombia', bio: '哥倫比亞之光，強力底線抽球。' },
    { slug: 'anna-leigh-waters', name: 'Anna Leigh Waters', country: 'USA', bio: '女子匹克球 GOAT，18 歲三冠王。' },
    { slug: 'catherine-parenteau', name: 'Catherine Parenteau', country: 'Canada / USA', bio: '加拿大左撇子，精準控球大師。' },
    { slug: 'anna-bright', name: 'Anna Bright', country: 'USA', bio: '前網球選手，強攻女子圈罕見。' },
    { slug: 'parris-todd', name: 'Parris Todd', country: 'USA', bio: '前 WTA 選手，Vatic Pro 首席簽約。' },
    { slug: 'jorja-johnson', name: 'Jorja Johnson', country: 'USA', bio: 'JW Johnson 妹妹，19 歲進前 5。' },
    { slug: 'leigh-waters', name: 'Leigh Waters', country: 'USA', bio: 'Anna Leigh 母親，50+ 仍世界頂尖。' },
    { slug: 'lea-jansen', name: 'Lea Jansen', country: 'USA', bio: '前排球選手轉項，網前威脅。' },
    { slug: 'vivienne-david', name: 'Vivienne David', country: 'USA', bio: '混雙專家，與 Ben Johns 搭檔。' },
    { slug: 'jack-sock', name: 'Jack Sock', country: 'USA', bio: '前 ATP #8，最具代表性轉項案例。' },
    { slug: 'simone-jardim', name: 'Simone Jardim', country: 'Brazil / USA', bio: '匹克球名人堂，4 年女單世界第一。' },
    { slug: 'daisuke-nakata', name: 'Daisuke Nakata 中田大輔', country: 'Japan', bio: '日本匹克球代表。' },
    { slug: 'phuong-nguyen', name: 'Nguyen Phuong', country: 'Vietnam', bio: '越南匹克球之光，APG 銅牌。' },
    { slug: 'paye-zhang', name: 'Paye Zhang 張沛', country: 'China', bio: '中國女子代表，前桌球國手。' },
    { slug: 'taiwan-open-m1', name: '陳冠宇', country: 'Taiwan', bio: '台灣男單第一，CTPF 國家隊主力。' },
    { slug: 'taiwan-open-w1', name: '林怡安', country: 'Taiwan', bio: '台灣女單第一，精準控球。' },
];

// Articles (per-slug static pages) — mirror of src/data/articlesData.ts metadata only
const ARTICLE_SLUGS = [
    { slug: 'beginner-first-paddle-2026', title: '2026 新手第一支匹克球拍：不是挑最好的，是挑最不會拖累你的', summary: '新手第一支匹克球拍該怎麼選？先釐清三個問題，再看懂厚度、重量、材質三個關鍵規格，避開五個最常見的選拍錯誤，並說明台灣的實際購買管道與水貨風險。', category: '器材評測' },
    { slug: 'paddle-specs-explained-2026', title: '匹克球拍規格全解析：厚度、揮重、扭轉慣量到底在講什麼', summary: '為什麼兩支同重量的球拍打起來天差地遠？拆解核心厚度、靜態重量與揮重的差異、扭轉慣量如何決定容錯、四種面板材質的實戰差異，以及 2026 年 USAP 把 PBCoR 上限收緊到 .43 的影響。', category: '器材評測' },
    { slug: 'buy-paddle-taiwan-2026', title: '2026 台灣買匹克球拍完全指南：正版通路、水貨真相、價格行情', summary: '本站逐一查證 25 個品牌在台灣的購買管道。說明台灣實際的通路現況、水貨與平行輸入的保固現實、辨識假拍的五個檢查點，以及海外直購的成本試算。', category: '器材評測' },
    { slug: 'taiwan-pro-pickleball-2026', title: '台灣匹克球「職業元年」全解析：AEPL 開打，然後呢？', summary: '2026 年 8 月 29 日，AEPL 亞洲菁英匹克球聯盟在台中火車站空中廊道開打，台灣有了第一個匹克球職業聯賽。本文拆解 6 支企業隊背後的產業版圖、選手為何說「終於不用一直飛國外」、聯盟制度設計與國際接軌時程。', category: '產業動態' },
    { slug: '2026-best-pickleball-paddles', title: '2026 十大匹克球拍完整評測', summary: '2026 年十大熱門匹克球拍完整評測：JOOLA Perseus Pro IV、Selkirk Labs Project 002、Paddletek Bantam TS-5 等頂級選手愛用款。', category: '器材評測' },
    { slug: 'pickleball-vs-tennis-badminton-padel', title: '匹克球 vs 網球 vs 羽球 vs Padel 完整比較', summary: '四大拍類運動一次看懂：場地、難度、體能、社群文化。', category: '比較分析' },
    { slug: '2026-best-pickleball-shoes', title: '2026 最佳匹克球鞋選購指南', summary: '匹克球專用鞋 vs 網球鞋 vs 羽球鞋完整比較。2026 Top 8 匹克球鞋實測。', category: '器材評測' },
    { slug: 'indoor-vs-outdoor-balls', title: '匹克球室內球 vs 戶外球全解析', summary: '26 孔還是 40 孔？設計差異、球速、彈跳、耐用度、主流品牌實測。', category: '器材評測' },
    { slug: 'pickleball-injury-prevention', title: '匹克球傷害預防完整指南', summary: '5 大常見傷害（匹克球肘、膝蓋、腳踝、肩膀、眼睛）的成因、預防、應對方法。', category: '運動科學' },
    { slug: 'senior-pickleball-guide', title: '50+ 歲銀髮族匹克球入門完全指南', summary: '50+ 歲銀髮族匹克球入門完全指南：健康好處、裝備選擇、運動頻率建議。', category: '族群指南' },
    { slug: 'doubles-vs-singles', title: '匹克球雙打 vs 單打完整對照', summary: '規則差異、站位、戰術、體能消耗、適合族群。95% 球友打雙打的真正原因。', category: '技術戰術' },
    { slug: 'pickleball-nutrition-fitness', title: '匹克球選手的營養與體能訓練', summary: '賽前吃什麼、補水策略、重訓菜單、職業選手作息範例。', category: '運動科學' },
    { slug: 'taiwan-pickleball-lessons-guide', title: '台灣匹克球課程與教練完整指南', summary: 'CTPF C 級、PPR、IPTPA 教練認證差異、體驗課/團體班/私人教練費用行情、各縣市找課管道與挑教練檢查點。', category: '族群指南' },
    { slug: 'first-open-play-guide', title: '第一次參加匹克球球敘（Open Play）完整指南', summary: '怎麼找球敘、DUPR 程度自報、排拍輪場規矩、費用分攤行情與球場禮儀 8 條。', category: '族群指南' },
];

/**
 * 把一支 TS/TSX 模組轉譯後載進來，取得真實資料（而不是手維護的鏡像清單，那一定會漂）。
 * 用 esbuild 是因為它已經隨 vite 進來、而且比 regex 可靠得多 ——
 * 例如 glossaryData 有一條 termEn 用雙引號，只吃單引號的 regex 會靜默漏掉它。
 */
const tsModuleCache = new Map();
function loadTsModule(relPath) {
    if (tsModuleCache.has(relPath)) return tsModuleCache.get(relPath);
    const esbuild = require('esbuild');
    const out = esbuild.buildSync({
        entryPoints: [path.join(__dirname, '..', relPath)],
        bundle: true, write: false, format: 'cjs', platform: 'node',
        jsx: 'automatic', logLevel: 'silent',
    });
    const mod = { exports: {} };
    new Function('module', 'exports', 'require', out.outputFiles[0].text)(mod, mod.exports, require);
    tsModuleCache.set(relPath, mod.exports);
    return mod.exports;
}

/**
 * 術語字典：建置時直接解析 src/data/glossaryData.ts。
 * /glossary 原本只送空的 #root，89 條術語對不執行 JS 的爬蟲完全不存在。
 * 注意字串可能用單引號或雙引號（例如 termEn: "No Man's Land"），兩種都要吃。
 */
function loadGlossary() {
    const src = fs.readFileSync(path.join(__dirname, '../src/data/glossaryData.ts'), 'utf-8');
    const S = `(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`;
    const re = new RegExp(
        `\\{\\s*id:\\s*${S},\\s*term:\\s*${S},\\s*termEn:\\s*${S},\\s*category:\\s*${S},\\s*definition:\\s*${S}`,
        'g'
    );
    const pick = (a, b) => (a !== undefined ? a : b).replace(/\\(['"])/g, '$1');
    const out = [];
    let m;
    while ((m = re.exec(src)) !== null) {
        out.push({
            term: pick(m[3], m[4]), termEn: pick(m[5], m[6]),
            category: pick(m[7], m[8]), definition: pick(m[9], m[10]),
        });
    }
    return out;
}

/**
 * 文章日期：建置時直接解析 src/data/articlesData.ts，回傳 slug → { published, updated }。
 * 原本 Article schema 的 datePublished 是硬寫死的 '2026-04-25'，14 篇全都一樣、
 * 而且沒有 dateModified —— 對一個以「資料查證日期」為賣點的站，這是直接餵錯訊號給 Google。
 * 不抄成鏡像清單的理由同 loadNewsItems()：手維護的副本一定會漂。
 */
function loadArticleDates() {
    const src = fs.readFileSync(path.join(__dirname, '../src/data/articlesData.ts'), 'utf-8');
    const dates = {};
    const re = /slug:\s*'([^']+)'[\s\S]*?publishedDate:\s*'([^']+)'[\s\S]*?updatedDate:\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(src)) !== null) dates[m[1]] = { published: m[2], updated: m[3] };
    return dates;
}

/**
 * 新聞頁：建置時直接解析 src/data/newsData.ts，不做手維護的鏡像清單。
 * 原本新聞詳細頁完全沒有預渲染，所有 /news/:id 對爬蟲都回 404
 * （使用者靠 404.html 的 SPA fallback 還看得到，但 Google 無法索引）。
 */
function loadNewsItems() {
    const src = fs.readFileSync(path.join(__dirname, '../src/data/newsData.ts'), 'utf-8');
    const items = [];
    // 以 id 為起點，content 用 backtick 包住、後面接 date 與 category。
    // 欄位之間可能夾行內註解（例如 date: '2025-10-15', // Estimated date），
    // 所以分隔用 W 而不是 \s* —— 否則 lazy 的 content 群組會往後吃掉下一則。
    const W = '(?:\\s|//[^\\n]*)*';
    const STR = "'((?:[^'\\\\]|\\\\.)*)'";
    const re = new RegExp(
        '\\{' + W + 'id:' + W + STR + ',' +
        W + 'title:' + W + STR + ',' +
        W + 'summary:' + W + STR + ',' +
        W + 'content:' + W + '`([\\s\\S]*?)`,' +
        W + 'date:' + W + STR + ',' +
        W + 'category:' + W + STR,
        'g'
    );
    let m;
    while ((m = re.exec(src)) !== null) {
        items.push({
            id: m[1],
            title: m[2].replace(/\\'/g, "'"),
            summary: m[3].replace(/\\'/g, "'"),
            content: m[4].trim(),
            date: m[5],
            category: m[6],
        });
    }
    return items;
}

// City hub pages — mirror of src/utils/cityData.ts
const CITY_SLUG_MAP = [
    { slug: 'taipei', city: '台北市' },
    { slug: 'new-taipei', city: '新北市' },
    { slug: 'keelung', city: '基隆市' },
    { slug: 'taoyuan', city: '桃園市' },
    { slug: 'hsinchu', city: '新竹縣' },
    { slug: 'hsinchu-city', city: '新竹市' },
    { slug: 'taichung', city: '台中市' },
    { slug: 'changhua', city: '彰化縣' },
    { slug: 'nantou', city: '南投縣' },
    { slug: 'yunlin', city: '雲林縣' },
    { slug: 'chiayi', city: '嘉義市' },
    { slug: 'chiayi-county', city: '嘉義縣' },
    { slug: 'tainan', city: '台南市' },
    { slug: 'kaohsiung', city: '高雄市' },
    { slug: 'pingtung', city: '屏東縣' },
    { slug: 'yilan', city: '宜蘭縣' },
    { slug: 'hualien', city: '花蓮縣' },
];

// Techniques (per-slug static pages) — mirror of src/data/techniquesData.ts (minimal subset for SEO)
const TECHNIQUE_SLUGS = [
    { slug: 'continental-grip', name: '大陸式握拍', nameEn: 'Continental Grip', tagline: '匹克球最通用的握拍法，一種握法應付所有球路' },
    { slug: 'dink', name: '軟球', nameEn: 'Dink', tagline: '匹克球靈魂技巧 — 廚房戰的核心武器' },
    { slug: 'third-shot-drop', name: '第三球下切', nameEn: 'Third Shot Drop', tagline: '從中階升級到進階的關鍵一球' },
    { slug: 'forehand-drive', name: '正手抽球', nameEn: 'Forehand Drive', tagline: '進攻基石 — 快速、低平、有穿透力' },
    { slug: 'backhand-drive', name: '反手抽球', nameEn: 'Backhand Drive', tagline: '業餘選手常輸的關鍵' },
    { slug: 'serve', name: '發球', nameEn: 'Serve', tagline: '比賽唯一自己掌握節奏的一球' },
    { slug: 'return-of-serve', name: '接發球', nameEn: 'Return of Serve', tagline: '打得深、跟上網前' },
    { slug: 'volley', name: '截擊', nameEn: 'Volley', tagline: '網前致勝武器' },
    { slug: 'reset', name: '重置球', nameEn: 'Reset', tagline: '被強攻？用軟球穩住戰局' },
    { slug: 'erne', name: 'ERNE 繞邊跳擊', nameEn: 'Erne', tagline: '匹克球最帥的進階技巧' },
    { slug: 'atp', name: 'ATP 繞網柱球', nameEn: 'Around The Post', tagline: '不過網、繞柱而擊' },
    { slug: 'stacking', name: '疊站戰術', nameEn: 'Stacking', tagline: '雙打隱形武器' },
];

async function generateStaticPages() {
    try {
        console.log('Starting static page generation...');

        // Read the template (index.html)
        const templatePath = path.join(BUILD_DIR, 'index.html');
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found at ${templatePath}. Make sure to run build first.`);
        }

        const template = fs.readFileSync(templatePath, 'utf-8');

        // Process each route
        for (const [route, seo] of Object.entries(pageSEO)) {
            console.log(`Generating static page for route: /${route}`);

            // Create directory
            const dirPath = path.join(BUILD_DIR, route);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Prepare content
            let content = template;

            // Replace Title
            content = content.replace(/<title>.*<\/title>/, `<title>${seo.title}</title>`);

            // Replace Meta Description（tag 跨行，需匹配整個標籤）
            content = content.replace(
                /<meta name="description"[^>]*>/,
                `<meta name="description" content="${seo.description}" />`
            );

            // Replace Meta Keywords
            content = content.replace(
                /<meta name="keywords" content=".*?" \/>/,
                `<meta name="keywords" content="${seo.keywords}" />`
            );

            // Replace Canonical URL
            const canonicalUrl = `${BASE_URL}/${route}/`;
            content = content.replace(
                /<link rel="canonical" href=".*?" \/>/,
                `<link rel="canonical" href="${canonicalUrl}" />`
            );

            // Replace OG Tags
            content = content.replace(
                /<meta property="og:title" content=".*?" \/>/,
                `<meta property="og:title" content="${seo.title}" />`
            );
            content = content.replace(
                /<meta property="og:description" content=".*?" \/>/,
                `<meta property="og:description" content="${seo.description}" />`
            );
            content = content.replace(
                /<meta property="og:url" content=".*?" \/>/,
                `<meta property="og:url" content="${canonicalUrl}" />`
            );

            // Replace Twitter Tags
            content = content.replace(
                /<meta name="twitter:title" content=".*?" \/>/,
                `<meta name="twitter:title" content="${seo.title}" />`
            );
            content = content.replace(
                /<meta name="twitter:description" content=".*?" \/>/,
                `<meta name="twitter:description" content="${seo.description}" />`
            );
            content = content.replace(
                /<meta name="twitter:url" content=".*?" \/>/,
                `<meta name="twitter:url" content="${canonicalUrl}" />`
            );

            // Inject Structured Data (JSON-LD)
            // Replace the default (home) JSON-LD block with the page-specific one
            if (seo.structuredData) {
                const jsonLdString = JSON.stringify(seo.structuredData); // Minified JSON
                // Regex to match the script tag containing application/ld+json
                // Note: This regex assumes standard formatting in index.html
                content = content.replace(
                    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
                    `<script type="application/ld+json">${jsonLdString}</script>`
                );
            }

            // Write file
            fs.writeFileSync(path.join(dirPath, 'index.html'), content);
        }

        // ===== Generate per-program pages =====
        console.log('Generating training program pages...');
        for (const p of PROGRAM_SLUGS) {
            const dirPath = path.join(BUILD_DIR, 'training-programs', p.slug);
            fs.mkdirSync(dirPath, { recursive: true });
            const title = `${p.title} | 匹克球訓練菜單`;
            const desc = `${p.subtitle} - 系統化訓練計劃，每週逐日詳細安排，含進度追蹤。`;
            const canonical = `${BASE_URL}/training-programs/${p.slug}/`;
            let content = template;
            content = content.replace(/<title>.*<\/title>/, `<title>${title}</title>`);
            content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`);
            content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
            content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
            content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
            content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
            const howToSchema = {
                "@context": "https://schema.org", "@type": "HowTo",
                "name": p.title, "description": p.subtitle, "url": canonical
            };
            content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(howToSchema)}</script>`);
            {
                const others = PROGRAM_SLUGS.filter(x => x.slug !== p.slug).slice(0, 5);
                const body = `
        <p style="font-size:17px;color:#4b5563;margin:0 0 16px;">${esc(p.subtitle)}</p>
        <p style="font-size:15px;margin:0 0 20px;">這份訓練菜單提供系統化、每週逐日的練習安排並可追蹤進度。跟著計畫穩定練習，逐步提升你的匹克球實力。</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">其他訓練菜單</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${others.map(o => `<li><a href="/training-programs/${o.slug}" style="color:#0d9488;">${esc(o.title)}</a> — ${esc(o.subtitle)}</li>`).join('')}</ul>
        </section>
        <p style="font-size:15px;"><a href="/training-programs" style="color:#0d9488;">所有訓練菜單</a>　·　<a href="/learning-paths" style="color:#0d9488;">學習路徑</a>　·　<a href="/courts" style="color:#0d9488;">找場地開練 →</a></p>`;
                content = injectPrerender(content, prerenderShell({
                    crumbs: [{ name: '首頁', href: '/' }, { name: '訓練菜單', href: '/training-programs' }, { name: p.title }],
                    h1: p.title, bodyHtml: body,
                }));
                content = applyOg(content, `og/program-${p.slug}.png`, { title: p.title, subtitle: p.subtitle, badge: '訓練菜單', type: 'program' });
            }
            fs.writeFileSync(path.join(dirPath, 'index.html'), content);
        }
        console.log(`  Generated ${PROGRAM_SLUGS.length} training program pages`);

        // ===== Generate per-player pages =====
        console.log('Generating player detail pages...');
        for (const p of PLAYER_SLUGS) {
            const dirPath = path.join(BUILD_DIR, 'players', p.slug);
            fs.mkdirSync(dirPath, { recursive: true });
            const title = `${p.name} 完整資料 | 球拍、戰績、打法 | 匹克球選手資料庫`;
            const desc = `${p.name} - ${p.country} 匹克球職業選手。${p.bio}`;
            const canonical = `${BASE_URL}/players/${p.slug}/`;
            let content = template;
            content = content.replace(/<title>.*<\/title>/, `<title>${title}</title>`);
            content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`);
            content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
            content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
            content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
            content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
            const playerSchema = {
                "@context": "https://schema.org", "@type": "Person",
                "name": p.name, "nationality": p.country,
                "jobTitle": "Professional Pickleball Player",
                "description": p.bio, "url": canonical
            };
            content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(playerSchema)}</script>`);
            {
                const others = PLAYER_SLUGS.filter(x => x.slug !== p.slug).slice(0, 8);
                const body = `
        <p style="font-size:15px;color:#6b7280;margin:0 0 12px;">${esc(p.country)} · 職業匹克球選手</p>
        <p style="font-size:16px;margin:0 0 20px;">${esc(p.bio)}</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">其他職業選手</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${others.map(o => `<li><a href="/players/${o.slug}" style="color:#0d9488;">${esc(o.name)}</a>（${esc(o.country)}）</li>`).join('')}</ul>
        </section>
        <p style="font-size:15px;"><a href="/pro-players" style="color:#0d9488;">職業選手總覽</a>　·　<a href="/hall-of-fame" style="color:#0d9488;">名人堂</a></p>`;
                content = injectPrerender(content, prerenderShell({
                    crumbs: [{ name: '首頁', href: '/' }, { name: '職業選手', href: '/pro-players' }, { name: p.name }],
                    h1: p.name, bodyHtml: body,
                }));
                content = applyOg(content, `og/player-${p.slug}.png`, { title: p.name, subtitle: `${p.country} · 職業匹克球選手`, badge: '選手', type: 'player' });
            }
            fs.writeFileSync(path.join(dirPath, 'index.html'), content);
        }
        console.log(`  Generated ${PLAYER_SLUGS.length} player detail pages`);

        // ===== Generate per-paddle pages =====
        if (PADDLE_SLUGS.length) {
            console.log('Generating paddle detail pages...');
            for (const pd of PADDLE_SLUGS) {
                const dirPath = path.join(BUILD_DIR, 'paddles', pd.slug);
                fs.mkdirSync(dirPath, { recursive: true });
                const full = `${pd.brand} ${pd.model}`;
                const title = `${full} 規格與評測 | 厚度 ${pd.thickness}、${pd.face} | 匹克球拍資料庫`;
                const desc = `${full}（${pd.year}）完整規格：${pd.shape}、核心 ${pd.thickness} ${pd.core}、拍面 ${pd.face}、重量 ${pd.weight}。拍型定位、力量控球旋轉容錯四項評比與台灣購買管道一次看。`;
                const canonical = `${BASE_URL}/paddles/${pd.slug}/`;
                let content = template;
                content = content.replace(/<title>.*<\/title>/, `<title>${title}</title>`);
                content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`);
                content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
                content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
                content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
                content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
                const productSchema = {
                    "@context": "https://schema.org", "@type": "Product",
                    "name": full, "brand": { "@type": "Brand", "name": pd.brand },
                    "category": "Pickleball Paddle", "description": desc, "url": canonical,
                    "additionalProperty": [
                        { "@type": "PropertyValue", "name": "核心厚度", "value": pd.thickness },
                        { "@type": "PropertyValue", "name": "重量", "value": pd.weight },
                        { "@type": "PropertyValue", "name": "拍面材質", "value": pd.face },
                        { "@type": "PropertyValue", "name": "核心材質", "value": pd.core },
                        { "@type": "PropertyValue", "name": "拍形", "value": pd.shape },
                    ],
                };
                content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`);
                {
                    const others = PADDLE_SLUGS.filter(x => x.slug !== pd.slug && x.brand === pd.brand).slice(0, 5);
                    const body = `
        <p style="font-size:15px;color:#6b7280;margin:0 0 12px;">${esc(pd.brand)} · ${esc(pd.level)}級 · ${esc(pd.year)}</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">規格</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">
            <li>拍形：${esc(pd.shape)}</li>
            <li>核心厚度：${esc(pd.thickness)}（${esc(pd.core)}）</li>
            <li>拍面材質：${esc(pd.face)}</li>
            <li>重量：${esc(pd.weight)}</li>
          </ul>
        </section>${others.length ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">${esc(pd.brand)} 其他型號</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${others.map(o => `<li><a href="/paddles/${o.slug}" style="color:#0d9488;">${esc(o.model)}</a></li>`).join('')}</ul>
        </section>` : ''}
        <p style="font-size:15px;"><a href="/paddles" style="color:#0d9488;">回球拍資料庫</a>　·　<a href="/equipment" style="color:#0d9488;">裝備選購指南</a></p>`;
                    content = injectPrerender(content, prerenderShell({
                        crumbs: [{ name: '首頁', href: '/' }, { name: '球拍資料庫', href: '/paddles' }, { name: pd.model }],
                        h1: full, bodyHtml: body,
                    }));
                }
                fs.writeFileSync(path.join(dirPath, 'index.html'), content);
            }
            console.log(`  Generated ${PADDLE_SLUGS.length} paddle detail pages`);
        }

        // ===== Generate per-article pages =====
        console.log('Generating article detail pages...');
        const articleDates = loadArticleDates();
        for (const a of ARTICLE_SLUGS) {
            const dirPath = path.join(BUILD_DIR, 'articles', a.slug);
            fs.mkdirSync(dirPath, { recursive: true });
            const title = `${a.title} | 匹克球深度專欄`;
            const desc = a.summary;
            const canonical = `${BASE_URL}/articles/${a.slug}/`;
            let content = template;
            content = content.replace(/<title>.*<\/title>/, `<title>${title}</title>`);
            content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`);
            content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
            content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
            content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
            content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
            const articleSchema = {
                "@context": "https://schema.org", "@type": "Article",
                "headline": a.title,
                "description": desc,
                "articleSection": a.category,
                "author": { "@type": "Organization", "name": "Picklemaster Taiwan" },
                "publisher": { "@type": "Organization", "name": "Picklemaster Taiwan", "logo": { "@type": "ImageObject", "url": "https://picklemastertw.com/android-chrome-v2-512x512.png" } },
                "mainEntityOfPage": canonical,
                ...(articleDates[a.slug] ? {
                    "datePublished": articleDates[a.slug].published,
                    "dateModified": articleDates[a.slug].updated,
                } : {}),
            };
            content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`);
            {
                const others = ARTICLE_SLUGS.filter(x => x.slug !== a.slug).slice(0, 6);
                const body = `
        <p style="font-size:14px;color:#6b7280;margin:0 0 12px;">${esc(a.category)}</p>
        <p style="font-size:17px;color:#4b5563;margin:0 0 24px;">${esc(a.summary)}</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">延伸閱讀</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${others.map(o => `<li style="margin-bottom:6px;"><a href="/articles/${o.slug}" style="color:#0d9488;">${esc(o.title)}</a></li>`).join('')}</ul>
        </section>
        <p style="font-size:15px;"><a href="/articles" style="color:#0d9488;">所有深度專欄</a>　·　<a href="/courts" style="color:#0d9488;">找球場開打</a>　·　<a href="/newcomer-guide" style="color:#0d9488;">新手懶人包</a></p>`;
                content = injectPrerender(content, prerenderShell({
                    crumbs: [{ name: '首頁', href: '/' }, { name: '深度專欄', href: '/articles' }, { name: a.title }],
                    h1: a.title, bodyHtml: body,
                }));
                content = applyOg(content, `og/article-${a.slug}.png`, { title: a.title, subtitle: a.category, badge: '深度專欄', type: 'article' });
            }
            fs.writeFileSync(path.join(dirPath, 'index.html'), content);
        }
        console.log(`  Generated ${ARTICLE_SLUGS.length} article detail pages`);

        // ===== Generate news detail pages =====
        console.log('Generating news detail pages...');
        {
            const newsItems = loadNewsItems();
            const CAT_LABEL = { Taiwan: '台灣', International: '國際', Equipment: '裝備', Rules: '規則', Courts: '球場', Tournament: '賽事' };
            for (const nw of newsItems) {
                const dirPath = path.join(BUILD_DIR, 'news', nw.id);
                fs.mkdirSync(dirPath, { recursive: true });
                const catLabel = CAT_LABEL[nw.category] || nw.category;
                const title = `${nw.title} | 匹克球新聞`;
                const desc = nw.summary;
                const canonical = `${BASE_URL}/news/${nw.id}/`;
                let content = template;
                content = content.replace(/<title>.*<\/title>/, `<title>${esc(title)}</title>`);
                content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`);
                content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
                content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(title)}" />`);
                content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(desc)}" />`);
                content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
                const newsSchema = {
                    "@context": "https://schema.org", "@type": "NewsArticle",
                    "headline": nw.title,
                    "description": desc,
                    "datePublished": nw.date,
                    "dateModified": nw.date,
                    "articleSection": catLabel,
                    "inLanguage": "zh-TW",
                    "author": { "@type": "Organization", "name": "Picklemaster Taiwan" },
                    "publisher": { "@type": "Organization", "name": "Picklemaster Taiwan", "logo": { "@type": "ImageObject", "url": `${BASE_URL}/android-chrome-v2-512x512.png` } },
                    "mainEntityOfPage": canonical,
                };
                content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(newsSchema).replace(/</g, '\\u003c')}</script>`);
                const others = newsItems.filter(x => x.id !== nw.id).slice(0, 6);
                const body = `
        <p style="font-size:14px;color:#6b7280;margin:0 0 4px;">${esc(catLabel)}　·　<time datetime="${esc(nw.date)}">${esc(nw.date)}</time></p>
        <p style="font-size:17px;color:#4b5563;margin:0 0 24px;">${esc(nw.summary)}</p>
        <section style="margin-bottom:24px;font-size:16px;line-height:1.8;">${nw.content}</section>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">其他最新消息</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${others.map(o => `<li style="margin-bottom:6px;"><a href="/news/${o.id}" style="color:#0d9488;">${esc(o.title)}</a>（${esc(o.date)}）</li>`).join('')}</ul>
        </section>
        <p style="font-size:15px;"><a href="/" style="color:#0d9488;">回首頁看所有消息</a>　·　<a href="/tournaments" style="color:#0d9488;">2026 賽事總覽</a>　·　<a href="/aepl" style="color:#0d9488;">AEPL 職業聯賽專區</a></p>`;
                content = injectPrerender(content, prerenderShell({
                    crumbs: [{ name: '首頁', href: '/' }, { name: '最新消息', href: '/' }, { name: nw.title }],
                    h1: nw.title, bodyHtml: body,
                }));
                content = applyOg(content, `og/news-${nw.id}.png`, { title: nw.title, subtitle: `${catLabel}　${nw.date}`, badge: '最新消息', type: 'news' });
                fs.writeFileSync(path.join(dirPath, 'index.html'), content);
            }
            console.log(`  Generated ${newsItems.length} news detail pages`);
        }

        // ===== Generate per-technique pages =====
        console.log('Generating technique detail pages...');
        for (const t of TECHNIQUE_SLUGS) {
            const dirPath = path.join(BUILD_DIR, 'techniques', t.slug);
            fs.mkdirSync(dirPath, { recursive: true });
            const title = `${t.name} (${t.nameEn}) 完整教學 | 匹克球技巧百科`;
            const desc = `${t.tagline} — 深度步驟分解、常見錯誤、練習菜單與職業選手心法。`;
            const canonical = `${BASE_URL}/techniques/${t.slug}/`;
            let content = template;
            content = content.replace(/<title>.*<\/title>/, `<title>${title}</title>`);
            content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`);
            content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
            content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
            content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
            content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
            const howTo = {
                "@context": "https://schema.org", "@type": "HowTo",
                "name": `如何學會${t.name}`,
                "description": t.tagline,
                "url": canonical
            };
            content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(howTo)}</script>`);
            {
                const others = TECHNIQUE_SLUGS.filter(x => x.slug !== t.slug).slice(0, 8);
                const body = `
        <p style="font-size:15px;color:#6b7280;margin:0 0 12px;">${esc(t.nameEn)}</p>
        <p style="font-size:17px;color:#4b5563;margin:0 0 24px;">${esc(t.tagline)}</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">其他匹克球技巧</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${others.map(o => `<li><a href="/techniques/${o.slug}" style="color:#0d9488;">${esc(o.name)}</a>（${esc(o.nameEn)}）</li>`).join('')}</ul>
        </section>
        <p style="font-size:15px;"><a href="/techniques" style="color:#0d9488;">技巧百科總覽</a>　·　<a href="/learning" style="color:#0d9488;">3D 互動技巧教學</a>　·　<a href="/courts" style="color:#0d9488;">找場地練習 →</a></p>`;
                content = injectPrerender(content, prerenderShell({
                    crumbs: [{ name: '首頁', href: '/' }, { name: '技巧百科', href: '/techniques' }, { name: `${t.name}（${t.nameEn}）` }],
                    h1: `${t.name}（${t.nameEn}）`, bodyHtml: body,
                }));
                content = applyOg(content, `og/technique-${t.slug}.png`, { title: t.name, subtitle: `${t.nameEn} · ${t.tagline}`, badge: '技巧', type: 'technique' });
            }
            fs.writeFileSync(path.join(dirPath, 'index.html'), content);
        }

        // ===== 索引頁預渲染（將「索引 → 詳情」連結網寫進靜態 HTML）=====
        console.log('Prerendering index/hub pages...');
        const INDEX_PAGES = [
            {
                route: 'aepl', h1: 'AEPL 職業聯賽專區', crumb: 'AEPL 職業聯賽',
                intro: '台灣第一個匹克球職業聯賽：AEPL 亞洲菁英匹克球聯盟 2026 創始賽季（8-11 月），6 支企業隊、全台 8 站巡迴、總獎金新台幣 100 萬元。首站台中站冠軍桃園永豐雲豹（冠軍戰 Dreambreaker 21:18 勝台南旭日雷霆），第 2 站 9 月 19-20 日高雄駁二特區。藝人林志穎擔任賽事大使。',
                items: [
                    { href: '/aepl', label: '桃園永豐雲豹', sub: '🏆 首站台中站冠軍。TPBL 雲豹體系，隊長鍾振煒（26 歲）、15 歲雙棲小將邱子恩；台啤建國廠國際標準場地年底落成' },
                    { href: '/aepl', label: '台南旭日雷霆', sub: '🥈 首站亞軍。尚騰汽車集團×寶嘉聯合共同成立，領隊吳睿弘、隊長蔡萱（20 年網球底子轉項）' },
                    { href: '/aepl', label: '新竹 YANKEY ACE', sub: '首站 4 強，與最終冠軍纏鬥至 3:2；企業背景待官方介紹' },
                    { href: '/aepl', label: '新北蘆沐', sub: '首站 4 強' },
                    { href: '/aepl', label: 'Ahhh', sub: '台北 Ahhh Social Pickleball Hub 場館品牌跨足職業球隊' },
                    { href: '/aepl', label: '富瑞特科技', sub: '科技產業企業隊' },
                ],
                foot: '<a href="/articles/taiwan-pro-pickleball-2026" style="color:#0d9488;">深度專欄：台灣匹克球職業元年全解析</a>　·　<a href="/tournaments" style="color:#0d9488;">2026 賽事總覽</a>',
            },
            {
                route: 'contact', h1: '聯絡我們', crumb: '聯絡我們',
                intro: '本站的球場與賽事資料全部人工查證，但場館開關、價格與時段變動很快。發現資訊有誤、想新增場地、或有合作提案，都歡迎告訴我們。',
                items: [
                    { href: 'https://github.com/wutiger555/picklemaster-tw/issues', label: 'GitHub Issues', sub: '目前最直接的回報管道：資料錯誤、缺漏場地、功能建議都可以在這裡提交' },
                    { href: '/courts', label: '球場資料回報', sub: '每個球場頁都標示「資料最後查證」日期；發現與現場不符，歡迎回報更正' },
                ],
                foot: '<a href="/about" style="color:#0d9488;">關於本站</a>　·　<a href="/privacy-policy" style="color:#0d9488;">隱私權政策</a>',
            },
            {
                route: 'privacy-policy', h1: '隱私權政策', crumb: '隱私權政策',
                intro: '瀏覽本站不需要註冊或登入。以下依個人資料保護法第 8 條說明我們蒐集哪些資料、為什麼蒐集、存在哪裡、保存多久，以及你的權利。',
                items: [
                    { href: '/privacy-policy', label: '瀏覽網站與工具', sub: '一般瀏覽不需要個人資料。計分器、訓練菜單進度等工具的資料只存在你自己瀏覽器的 localStorage，不會傳到本站' },
                    { href: '/play', label: '揪團約打', sub: '只在報名、開團、按「我會去」或評價球場時建立資料：暱稱、頭像樣式、自填程度、報名紀錄與一組隨機代號，存於 Cloudflare 雲端（境外），不蒐集姓名、email 或電話。IP 只以雜湊暫存 2 天用於防濫用。報名明細一年後自動刪除，可隨時在「我的球拍」自行刪除' },
                    { href: '/privacy-policy', label: '第三方服務', sub: 'Google AdSense 可能使用 Cookies 顯示廣告；地圖圖磚、天氣資料、字型與外部影片由第三方提供，這些服務可能有自己的紀錄行為' },
                    { href: '/privacy-policy', label: '你的權利', sub: '可查詢、更正、要求停止使用或刪除你的資料。揪團資料可在「我的球拍」直接修改或刪除，其他需求請透過聯絡頁面' },
                ],
                foot: '<a href="/about" style="color:#0d9488;">關於本站</a>　·　<a href="/contact" style="color:#0d9488;">聯絡我們</a>',
            },
            {
                route: 'techniques', h1: '匹克球技巧百科', crumb: '技巧百科',
                intro: '從握拍、發球到 Dink、第三球下切與進階戰術，完整收錄匹克球各項技巧的步驟拆解與練習要點。',
                items: TECHNIQUE_SLUGS.map(t => ({ href: `/techniques/${t.slug}`, label: `${t.name}（${t.nameEn}）`, sub: t.tagline })),
                foot: '<a href="/learning" style="color:#0d9488;">3D 互動技巧教學</a>　·　<a href="/training-programs" style="color:#0d9488;">訓練菜單</a>',
            },
            {
                route: 'articles', h1: '匹克球深度專欄', crumb: '深度專欄',
                intro: '器材評測、運動科學、技術戰術與族群指南 — 深入淺出的匹克球長文，幫你把每個主題一次搞懂。',
                items: ARTICLE_SLUGS.map(a => ({ href: `/articles/${a.slug}`, label: a.title, sub: a.summary })),
                foot: '<a href="/newcomer-guide" style="color:#0d9488;">新手懶人包</a>　·　<a href="/courts" style="color:#0d9488;">找球場開打</a>',
            },
            {
                route: 'pro-players', h1: '職業匹克球選手', crumb: '職業選手',
                intro: '世界頂尖匹克球選手資料庫：戰績、打法、慣用球拍與生涯成就一次掌握。',
                items: PLAYER_SLUGS.map(p => ({ href: `/players/${p.slug}`, label: p.name, sub: `${p.country} · ${p.bio}` })),
                foot: '<a href="/hall-of-fame" style="color:#0d9488;">名人堂</a>',
            },
            {
                route: 'training-programs', h1: '匹克球訓練菜單', crumb: '訓練菜單',
                intro: '系統化、每週逐日的匹克球訓練計畫，從新手入門到專項特訓，跟著練穩定進步。',
                items: PROGRAM_SLUGS.map(p => ({ href: `/training-programs/${p.slug}`, label: p.title, sub: p.subtitle })),
                foot: '<a href="/learning-paths" style="color:#0d9488;">學習路徑</a>　·　<a href="/courts" style="color:#0d9488;">找場地開練</a>',
            },
        ];

        // ===== 其餘原本送空 #root 的頁面 =====
        // 內容一律從真實資料來（loadTsModule），不手抄鏡像清單。
        // 只有工具頁與純敘述頁的 intro 是手寫的 —— 那是「這頁在做什麼」的說明，
        // 不是會隨資料變動的清單，漂移風險低。
        {
            const FAQ = loadTsModule('src/data/faqData.ts').FAQ_DATA;
            const VIDEOS = loadTsModule('src/data/videosData.ts').VIDEO_TUTORIALS;
            const TOURN = loadTsModule('src/data/tournamentsData.ts').TOURNAMENTS_2026;
            const PLAYBOOK = loadTsModule('src/data/playbookData.ts').PLAYBOOK;
            const HISTORY = loadTsModule('src/data/historyData.ts').HISTORY_TIMELINE;
            const PATHS = loadTsModule('src/data/learning-modules.tsx').learningPaths;
            const TIERS = loadTsModule('src/data/ratingsData.ts').RATING_TIERS;
            const HOF_MOD = loadTsModule('src/data/hallOfFameData.ts');
            const HOF = [...HOF_MOD.FOUNDERS, ...HOF_MOD.PIONEERS, ...HOF_MOD.LEGENDS, ...HOF_MOD.TAIWAN];
            const RULE_TERMS = loadGlossary().filter(t => t.category === '規則');
            const NAV = {
                courts: '<a href="/courts" style="color:#0d9488;">找球場</a>',
                rules: '<a href="/rules" style="color:#0d9488;">規則教學</a>',
                newcomer: '<a href="/newcomer-guide" style="color:#0d9488;">新手懶人包</a>',
                glossary: '<a href="/glossary" style="color:#0d9488;">術語字典</a>',
                tools: '<a href="/tools" style="color:#0d9488;">實用工具</a>',
                paddles: '<a href="/paddles" style="color:#0d9488;">球拍資料庫</a>',
                equipment: '<a href="/equipment" style="color:#0d9488;">裝備選購</a>',
                faq: '<a href="/faq" style="color:#0d9488;">常見問題</a>',
            };
            const foot = (...keys) => keys.map(k => NAV[k]).join('　·　');

            INDEX_PAGES.push(
                {
                    route: 'faq', h1: '匹克球常見問題', crumb: '常見問題',
                    intro: `新手到進階最常問的 ${FAQ.length} 個匹克球問題與解答，涵蓋規則、裝備、場地、費用與比賽。`,
                    termsHeading: `常見問題（${FAQ.length}）`,
                    terms: FAQ.map(f => ({ t: f.question, meta: f.category, d: f.answer })),
                    foot: foot('rules', 'newcomer', 'glossary'),
                },
                {
                    route: 'tournaments', h1: '2026 台灣匹克球賽事總覽', crumb: '賽事總覽',
                    intro: `2026 年全台 ${TOURN.length} 場匹克球賽事：日期、場地、主辦單位、分組與報名截止一次看，含 CTPF 認證賽事與 AEPL 職業聯賽。`,
                    termsHeading: `賽事列表（${TOURN.length}）`,
                    terms: TOURN.map(t => ({
                        t: t.name,
                        meta: [t.dateLabel, t.venue, t.city, t.level].filter(Boolean).join('・'),
                        d: [t.summary, t.organizer ? `主辦：${t.organizer}` : '', t.registrationDeadline ? `報名截止：${t.registrationDeadline}` : ''].filter(Boolean).join(' '),
                    })),
                    foot: '<a href="/aepl" style="color:#0d9488;">AEPL 職業聯賽</a>　·　' + foot('courts', 'rules'),
                },
                {
                    route: 'playbook', h1: '匹克球實戰情境手冊', crumb: '實戰手冊',
                    intro: `場上遇到狀況該怎麼處理？${PLAYBOOK.length} 個真實比賽情境，說明為什麼會發生、最佳應對與替代打法。`,
                    termsHeading: `情境列表（${PLAYBOOK.length}）`,
                    terms: PLAYBOOK.map(p => ({
                        t: p.scenario, meta: [p.category, p.level].filter(Boolean).join('・'),
                        d: `${p.whyHappens ? `成因：${p.whyHappens} ` : ''}建議：${p.bestResponse}`,
                    })),
                    foot: '<a href="/techniques" style="color:#0d9488;">技術教學</a>　·　' + foot('rules', 'glossary'),
                },
                {
                    route: 'history', h1: '匹克球發展史', crumb: '發展史',
                    intro: `從 1965 年美國華盛頓州 Bainbridge Island 的後院發明，到今天成為全球成長最快的球拍運動 —— ${HISTORY.length} 個關鍵時刻，含台灣發展歷程。`,
                    termsHeading: `時間軸（${HISTORY.length}）`,
                    terms: HISTORY.map(h => ({ t: `${h.year}　${h.title}`, meta: h.category, d: h.description })),
                    foot: '<a href="/hall-of-fame" style="color:#0d9488;">名人堂</a>　·　' + foot('rules', 'glossary'),
                },
                {
                    route: 'hall-of-fame', h1: '匹克球名人堂', crumb: '名人堂',
                    intro: `從發明者到當代球王，${HOF.length} 位對匹克球有決定性貢獻的人物，含台灣推廣先驅。`,
                    termsHeading: `入選人物（${HOF.length}）`,
                    terms: HOF.map(m => ({ t: m.name, meta: [m.role, m.era, m.inducted].filter(Boolean).join('・'), d: m.contribution })),
                    foot: '<a href="/history" style="color:#0d9488;">發展史</a>　·　<a href="/pro-players" style="color:#0d9488;">職業選手</a>',
                },
                {
                    route: 'ratings', h1: 'DUPR 匹克球評級完整說明', crumb: '評級制度',
                    intro: `DUPR（Dynamic Universal Pickleball Rating）是全球通用的匹克球技術評級，範圍 1.0 到 8.0。以下是 ${TIERS.length} 個級距各自的實際能力描述，幫你判斷自己大概在哪一段。`,
                    termsHeading: `評級級距（${TIERS.length}）`,
                    terms: TIERS.map(t => ({
                        t: `${t.range}　${t.level}`, meta: t.levelEn,
                        d: [t.description, t.skills && t.skills.length ? `典型能力：${t.skills.join('、')}` : '', t.typicalPlayer ? `典型球員：${t.typicalPlayer}` : ''].filter(Boolean).join(' '),
                    })),
                    foot: foot('glossary', 'newcomer') + '　·　<a href="/tools/dupr-simulator" style="color:#0d9488;">DUPR 分數試算</a>',
                },
                {
                    route: 'rules', h1: '匹克球規則教學', crumb: '規則教學',
                    intro: '匹克球規則的核心只有幾條：雙彈跳、廚房區禁止截擊、下手發球、發球方才能得分。本站提供 3D 互動式球場教學，點擊球場任一區域即可看到對應解說。以下是規則相關術語的完整定義。',
                    termsHeading: `規則術語（${RULE_TERMS.length}）`,
                    terms: RULE_TERMS.map(t => ({ t: t.term, meta: t.termEn, d: t.definition })),
                    foot: foot('newcomer', 'glossary', 'courts'),
                },
                {
                    route: 'learning-paths', h1: '匹克球學習路徑', crumb: '學習路徑',
                    intro: `依程度規劃的匹克球學習路線，共 ${PATHS.length} 條，從零基礎到進階戰術，每條路徑都拆成逐課的學習目標。`,
                    termsHeading: `學習路徑（${PATHS.length}）`,
                    terms: PATHS.map(p => ({
                        t: p.level, meta: [p.totalDuration, `${p.lessons.length} 課`].filter(Boolean).join('・'),
                        d: `${p.description}。課程：${p.lessons.map(l => l.title).join('、')}`,
                    })),
                    foot: '<a href="/techniques" style="color:#0d9488;">技術教學</a>　·　<a href="/training-programs" style="color:#0d9488;">訓練菜單</a>　·　' + foot('rules'),
                },
                {
                    route: 'videos', h1: '匹克球教學影片精選', crumb: '教學影片',
                    intro: `精選 ${VIDEOS.length} 支國內外匹克球教學影片，逐支標註頻道、長度、適合程度與「為什麼值得看」。`,
                    termsHeading: `影片清單（${VIDEOS.length}）`,
                    terms: VIDEOS.map(v => ({
                        t: v.title, meta: [v.channel, v.duration, v.level, v.category].filter(Boolean).join('・'),
                        d: [v.description, v.whyWatch ? `值得看的理由：${v.whyWatch}` : ''].filter(Boolean).join(' '),
                    })),
                    foot: '<a href="/techniques" style="color:#0d9488;">技術教學</a>　·　' + foot('rules', 'newcomer'),
                },
                {
                    route: 'paddles', h1: '匹克球拍資料庫', crumb: '球拍資料庫',
                    intro: `${PADDLE_SLUGS.length} 支主流匹克球拍的規格與定位：核心厚度、重量、面板材質與適合的打法，逐支獨立頁面。`,
                    itemsHeading: `球拍列表（${PADDLE_SLUGS.length}）`,
                    items: PADDLE_SLUGS.map(p => ({
                        href: `/paddles/${p.slug}`,
                        label: `${p.brand} ${p.model}`,
                        sub: [p.year, p.level, p.shape, p.thickness, p.weight, p.face].filter(Boolean).join('・'),
                    })),
                    foot: foot('equipment') + '　·　<a href="/articles/beginner-first-paddle-2026" style="color:#0d9488;">新手第一支球拍怎麼選</a>',
                },
                {
                    route: 'tools', h1: '匹克球實用工具', crumb: '實用工具',
                    intro: '打球與辦比賽會用到的計算工具，全部在瀏覽器本機執行，不需註冊。',
                    itemsHeading: '工具列表（4）',
                    items: [
                        { href: '/tools/dupr-simulator', label: 'DUPR 分數試算', sub: '輸入比賽結果，估算這場對你的 DUPR 評級大約有什麼影響' },
                        { href: '/tools/rotation', label: '輪場排點器', sub: '人數多於場地時，排出讓每個人上場次數平均的輪替表' },
                        { href: '/tools/bracket', label: '賽程表產生器', sub: '單淘汰、雙淘汰與循環賽的對戰表自動編排' },
                        { href: '/tools/court-lines', label: '場地劃線指南', sub: '在羽球場或網球場上加劃匹克球線的尺寸與步驟' },
                    ],
                    foot: foot('courts', 'rules'),
                },
                {
                    route: 'tools/dupr-simulator', h1: 'DUPR 分數試算工具', crumb: 'DUPR 分數試算',
                    intro: 'DUPR 評級會依每場比賽的比分與對手實力變動。輸入雙方目前評級與比賽結果，即可估算這場對你的評級大致影響，用來理解 DUPR 的計算邏輯。試算為概算，實際數值以 DUPR 官方為準。',
                    itemsHeading: '延伸閱讀',
                    items: [
                        { href: '/ratings', label: 'DUPR 評級完整說明', sub: '1.0 到 8.0 各級距的實際能力描述' },
                        { href: '/tools', label: '其他實用工具', sub: '輪場排點、賽程表、場地劃線' },
                    ],
                    foot: foot('glossary', 'courts'),
                },
                {
                    route: 'tools/rotation', h1: '匹克球輪場排點器', crumb: '輪場排點器',
                    intro: '球敘常見的問題：來了 11 個人但只有 2 面場地，怎麼排才公平。輸入人數與場地數，產生每個人上場次數平均、搭檔盡量不重複的輪替表。',
                    itemsHeading: '延伸閱讀',
                    items: [
                        { href: '/glossary', label: '什麼是球敘、排拍？', sub: '台灣球敘現場的輪場規矩' },
                        { href: '/tools/bracket', label: '賽程表產生器', sub: '要辦正式比賽時改用這個' },
                    ],
                    foot: foot('courts', 'faq'),
                },
                {
                    route: 'tools/bracket', h1: '匹克球賽程表產生器', crumb: '賽程表產生器',
                    intro: '辦小型比賽用的對戰表工具：輸入隊伍數，產生單淘汰、雙淘汰或循環賽的賽程與輪次安排。',
                    itemsHeading: '延伸閱讀',
                    items: [
                        { href: '/tournaments', label: '2026 賽事總覽', sub: '全台正式賽事的日期與報名資訊' },
                        { href: '/tools/rotation', label: '輪場排點器', sub: '一般球敘輪場用這個' },
                    ],
                    foot: foot('rules', 'courts'),
                },
                {
                    route: 'tools/court-lines', h1: '匹克球場地劃線指南', crumb: '場地劃線指南',
                    intro: '匹克球場標準尺寸為 20×44 英尺（6.10×13.41 公尺），與雙打羽球場幾乎相同，因此常直接在羽球場或網球場上加劃。本頁說明各項尺寸、廚房線位置與在既有場地上加線的步驟。',
                    itemsHeading: '延伸閱讀',
                    items: [
                        { href: '/rules', label: '匹克球規則教學', sub: '廚房區、雙彈跳等與場地相關的規則' },
                        { href: '/courts', label: '全台球場地圖', sub: '已經劃好線的場地在哪裡' },
                    ],
                    foot: foot('glossary', 'faq'),
                },
                {
                    route: 'scorer', h1: '匹克球計分器', crumb: '計分器',
                    intro: '匹克球的計分方式（發球方得分制、三碼報分 0-0-2）對新手不直覺。這個計分器幫你記住目前比分、發球方與第幾發球員，在場邊用手機就能操作，不需註冊。',
                    itemsHeading: '延伸閱讀',
                    items: [
                        { href: '/rules', label: '匹克球計分規則', sub: '為什麼要報三個數字、什麼時候換發球' },
                        { href: '/glossary', label: '術語字典', sub: '報分、換發、side out 等術語' },
                    ],
                    foot: foot('newcomer', 'courts'),
                },
                {
                    route: 'game', h1: '匹克球規則小測驗', crumb: '規則測驗',
                    intro: '用互動測驗檢查自己的匹克球規則觀念：發球、雙彈跳、廚房區、計分與界內外判定，答錯會告訴你正確規則與原因。',
                    itemsHeading: '延伸閱讀',
                    items: [
                        { href: '/rules', label: '3D 互動規則教學', sub: '先看懂規則再來測驗' },
                        { href: '/faq', label: '常見問題', sub: '規則爭議最常出現的狀況' },
                    ],
                    foot: foot('glossary', 'newcomer'),
                },
                {
                    route: 'newcomer-guide', h1: '匹克球新手入門指南', crumb: '新手懶人包',
                    intro: '第一次打匹克球需要知道的事：要花多少錢、第一支球拍怎麼挑、去哪裡找人一起打、球敘現場的規矩、以及從羽球或網球轉過來需要調整什麼。',
                    itemsHeading: '新手該看的幾頁',
                    items: [
                        { href: '/rules', label: '先把規則看懂', sub: '3D 互動教學，雙彈跳與廚房區是新手最常搞錯的兩條' },
                        { href: '/courts', label: '找離你最近的球場', sub: '全台場地地圖，可篩免費、室內、24 小時' },
                        { href: '/glossary', label: '看懂球敘、排拍在說什麼', sub: '台灣球敘現場的用語與規矩' },
                        { href: '/equipment', label: '裝備要買什麼', sub: '球拍、球鞋、球的選購重點與預算' },
                        { href: '/articles/first-open-play-guide', label: '第一次參加球敘完整指南', sub: '怎麼找球敘、程度怎麼報、費用怎麼分攤' },
                    ],
                    foot: foot('faq', 'tools'),
                },
                {
                    route: 'equipment', h1: '匹克球裝備選購指南', crumb: '裝備選購',
                    intro: '匹克球裝備的三個重點：球拍（核心厚度、重量、面板材質）、球鞋（需要橫向支撐，跑鞋不適合）、球（室內 26 孔／戶外 40 孔）。本頁說明各項選購邏輯與台灣的購買管道。',
                    itemsHeading: '延伸閱讀',
                    items: [
                        { href: '/paddles', label: '球拍資料庫', sub: '主流球拍規格逐支比較' },
                        { href: '/articles/beginner-first-paddle-2026', label: '新手第一支球拍怎麼選', sub: '不是挑最好的，是挑最不會拖累你的' },
                        { href: '/articles/paddle-specs-explained-2026', label: '球拍規格全解析', sub: '厚度、揮重、扭轉慣量到底在講什麼' },
                        { href: '/articles/2026-best-pickleball-shoes', label: '匹克球鞋選購指南', sub: '專用鞋 vs 網球鞋 vs 羽球鞋' },
                        { href: '/articles/indoor-vs-outdoor-balls', label: '室內球 vs 戶外球', sub: '26 孔還是 40 孔' },
                        { href: '/articles/buy-paddle-taiwan-2026', label: '台灣買球拍完全指南', sub: '正版通路、水貨真相與價格行情' },
                    ],
                    foot: foot('newcomer', 'faq'),
                },
                {
                    route: 'learning', h1: '匹克球互動學習', crumb: '互動學習',
                    intro: '用 3D 球場與動畫理解匹克球：球場各區域的名稱與作用、球的飛行路線、站位與移動，搭配球拍選購建議與職業選手用拍參考。',
                    itemsHeading: '延伸閱讀',
                    items: [
                        { href: '/learning-paths', label: '依程度規劃的學習路徑', sub: '從零基礎到進階戰術的逐課路線' },
                        { href: '/rules', label: '3D 互動規則教學', sub: '點擊球場看對應規則解說' },
                        { href: '/techniques', label: '技術教學', sub: '軟球、第三球下切、截擊等單項技巧' },
                    ],
                    foot: foot('glossary', 'courts'),
                },
                {
                    route: 'resources', h1: '匹克球資源整理', crumb: '資源整理',
                    intro: '打匹克球會用到的外部資源整理：官方組織與規則書、評級系統、賽事資訊、教學頻道與台灣在地社群。',
                    itemsHeading: '站內相關頁面',
                    items: [
                        { href: '/videos', label: '教學影片精選', sub: '國內外教學頻道逐支評註' },
                        { href: '/glossary', label: '中英術語字典', sub: '看英文教學前先補術語' },
                        { href: '/ratings', label: 'DUPR 評級說明', sub: '國際通用的技術分級' },
                        { href: '/tournaments', label: '2026 賽事總覽', sub: '全台賽事日期與報名' },
                    ],
                    foot: foot('courts', 'faq'),
                },
                {
                    // 數字與 src/pages/DataMethod.tsx 用同一份 courts.json 算，兩邊一致。
                    route: 'data-method', h1: '球場資料怎麼來、怎麼查證', crumb: '資料方法',
                    ...(() => {
                        const ages = ALL_COURTS.map(c => c.last_updated)
                            .filter(Boolean)
                            .map(d => Math.floor((Date.now() - Date.parse(d)) / 86400000))
                            .sort((a, b) => a - b);
                        const median = ages[Math.floor(ages.length / 2)];
                        const within90 = ages.filter(d => d <= 90).length;
                        const pct = Math.round((within90 / ages.length) * 100);
                        const cities = new Set(ALL_COURTS.map(c => c.location.city)).size;
                        const surfaces = ALL_COURTS.reduce((n, c) => n + (c.courts_count || 0), 0);
                        return {
                            title: '球場資料怎麼來、怎麼查證｜Picklemaster 資料方法',
                            description: `本站 ${ALL_COURTS.length} 座匹克球場全部人工查證並標示查證日期，中位查證時距 ${median} 天、${pct}% 在 90 天內確認過。說明資料來源、查證流程、歇業複查方式與錯誤回報管道。`,
                            intro: `場館會搬家、會漲價、會歇業，而過期的球場資訊比沒有資訊更糟 —— 你會白跑一趟。所以本站 ${ALL_COURTS.length} 座球場（${cities} 個縣市、合計 ${surfaces} 面）每一座都人工查證過，並把查證日期直接標在球場頁上：目前中位查證時距 ${median} 天，${within90} 座（${pct}%）在 90 天內確認過，最近一次是 ${ages[0]} 天前。`,
                        };
                    })(),
                    termsHeading: '查證流程',
                    terms: [
                        { t: '01　收錄：先確認場地真的存在', d: '新場地來自匹克球協會名錄、運動部 iPlay 場館資訊網、場館社群公告與讀者回報。每一筆都要能對到具體地址與座標才會收錄，不會只憑一則貼文就上架。' },
                        { t: '02　查證：逐座確認並記錄日期', d: '確認地址、球場面數、室內或戶外、收費方式、開放時間。每座球場都記下查證日期並顯示在該球場頁上 —— 你看得到這筆資料是什麼時候確認的，而不是只能猜。' },
                        { t: '03　機械巡檢：每次更新都跑一遍', d: '自動檢查外部連結是否失效、哪些場地超過 120 天沒查證、資料是否有缺漏或格式錯誤，以及已標記關閉的場地是否該回頭複查。' },
                        { t: '04　歇業複查：機器查不出來的部分人工看', d: '網站回 HTTP 200 不代表場館還在營業 —— 實際遇過官網正常、粉專已刪、Google 地圖標示永久歇業的情況。所以營業狀態一律人工查 Google 地圖確認，確認歇業的場地會直接在標題標示【已歇業】而不是悄悄刪掉。' },
                        { t: '資料來源與授權', d: '部分場館的位置、聯絡方式、大眾運輸與實景照片來自運動部全國運動場館資訊網 iPlay，依政府網站資料開放宣告使用，並在各球場頁標註來源場館名稱。其餘資訊為本站自行查證整理。' },
                        { t: '發現資料有誤怎麼辦', d: '查證再勤也追不上所有變動。發現地址、費用、時段與現場不符，或知道本站還沒收錄的場地，歡迎透過聯絡頁告訴我們 —— 更正會連同新的查證日期一起更新。' },
                    ],
                    foot: '<a href="/courts" style="color:#0d9488;">全台球場地圖</a>　·　<a href="/contact" style="color:#0d9488;">回報資料錯誤</a>　·　<a href="/about" style="color:#0d9488;">關於本站</a>',
                },
                {
                    // 揪團大廳：預渲染本站查證的固定球敘（自有資料）。使用者開的團是前端即時載入、noindex，不進這裡。
                    // 解析規則與 React 大廳共用 src/utils/fixedSessions.ts。
                    route: 'play', h1: '匹克球揪團約打', crumb: '揪團約打',
                    ...(() => {
                        const sessions = loadTsModule('src/utils/fixedSessions.ts').getFixedSessions(ALL_COURTS);
                        const cities = new Set(sessions.map(x => x.city)).size;
                        return {
                            intro: `挑一團、取個暱稱就能報名，不用註冊也不用下載 App：額滿自動候補，有人取消自動遞補，開打前 3 小時人數不足會自動取消並通知。下面是全台 ${cities} 個縣市、${sessions.length} 個球場公告的固定球敘時段，由本站逐筆查證，直接到場或聯絡主辦即可參加。`,
                            termsHeading: `每週固定球敘（${sessions.length}）`,
                            terms: sessions.map(x => ({
                                t: x.courtName,
                                meta: `${x.city}${x.district || ''}`,
                                d: `${x.schedule}${x.organizer ? `（主辦／聯絡：${x.organizer}）` : ''}${x.verified ? `　${x.verified} 查證` : ''}`,
                            })),
                        };
                    })(),
                    foot: '<a href="/courts" style="color:#0d9488;">全台球場地圖</a>　·　<a href="/tools/rotation" style="color:#0d9488;">輪場排點器</a>　·　<a href="/ratings" style="color:#0d9488;">程度（DUPR）說明</a>',
                },
                {
                    route: 'about', h1: '關於 Picklemaster', crumb: '關於我們',
                    intro: '本站是台灣的匹克球資訊平台。球場資料逐座人工查證並標示查證日期，場館開關與費用變動快，發現與現場不符歡迎回報更正。內容涵蓋球場地圖、規則教學、賽事追蹤、裝備選購與術語字典。',
                    itemsHeading: '站內主要單元',
                    items: [
                        { href: '/courts', label: '全台球場地圖', sub: '逐座查證的場地資訊與 GPS 導航' },
                        { href: '/rules', label: '3D 互動規則教學', sub: '點擊球場看規則解說' },
                        { href: '/tournaments', label: '賽事總覽', sub: 'CTPF 認證賽事與 AEPL 職業聯賽' },
                        { href: '/contact', label: '聯絡我們', sub: '資料回報、新增場地、合作提案' },
                        { href: '/privacy-policy', label: '隱私權政策', sub: '本站如何處理你的資料' },
                    ],
                    foot: foot('faq', 'glossary'),
                },
            );
        }
        let indexPageCount = 0;
        for (const page of INDEX_PAGES) {
            const filePath = path.join(BUILD_DIR, page.route, 'index.html');
            if (!fs.existsSync(filePath)) continue;
            let content = fs.readFileSync(filePath, 'utf-8');
            // items = 有內頁可連的清單；terms = 內容本身就是價值、沒有內頁可連的（問答、賽事、情境…），
            // 用 dl 輸出全文，讓爬蟲讀得到答案而不是只讀到一串標題。
            const items = page.items || [];
            const terms = page.terms || [];
            const body = `
        <p style="font-size:17px;color:#4b5563;margin:0 0 24px;">${esc(page.intro)}</p>
        ${items.length ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">${esc(page.itemsHeading || `完整列表（${items.length}）`)}</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${items.map(it => `<li style="margin-bottom:8px;"><a href="${it.href}" style="color:#0d9488;font-weight:600;">${esc(it.label)}</a>${it.sub ? `<br><span style="color:#6b7280;font-size:13px;">${esc(it.sub)}</span>` : ''}</li>`).join('')}</ul>
        </section>` : ''}
        ${terms.length ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">${esc(page.termsHeading || `完整內容（${terms.length}）`)}</h2>
          <dl style="margin:0;">${terms.map(t => `<dt style="font-weight:600;font-size:16px;margin:12px 0 2px;">${esc(t.t)}${t.meta ? `<span style="color:#6b7280;font-weight:400;font-size:14px;"> — ${esc(t.meta)}</span>` : ''}</dt><dd style="margin:0;font-size:15px;color:#4b5563;">${esc(t.d)}</dd>`).join('')}</dl>
        </section>` : ''}
        <p style="font-size:15px;">${page.foot}</p>`;
            // 有些頁的 title/description 需要用即時算出來的數字（例如 /data-method 的查證統計），
            // 才能跟 React 端 SEOHead 產出的字串一致。
            if (page.title) {
                content = content.replace(/<title>.*<\/title>/, `<title>${esc(page.title)}</title>`);
                content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(page.title)}" />`);
            }
            if (page.description) {
                content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(page.description)}" />`);
                content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(page.description)}" />`);
            }
            content = injectPrerender(content, prerenderShell({
                crumbs: [{ name: '首頁', href: '/' }, { name: page.crumb }],
                h1: page.h1, bodyHtml: body,
            }));
            if (page.route === 'play') {
                // 分享到 LINE 的每一團都會顯示這張卡（團的細節寫在分享訊息文字裡）
                content = applyOg(content, 'og/play.png', {
                    title: '揪團約打', type: 'court', badge: '臨打報名',
                    subtitle: '取個暱稱就能報名 · 額滿自動候補 · 不用下載 App',
                });
            }
            if (page.route === 'aepl') {
                content = applyOg(content, 'og/aepl.png', {
                    title: 'AEPL 職業聯賽專區', type: 'player', badge: '職業聯賽',
                    subtitle: '6 隊戰力卡 · 8 站賽程 · 賽前情報分析',
                });
            }
            fs.writeFileSync(filePath, content);
            indexPageCount++;
        }
        console.log(`  Prerendered ${indexPageCount} index/hub pages`);

        // ===== Prerender /glossary =====
        // 術語的價值就是定義本身的文字（例如「球敘是什麼」），不預渲染等於整本字典不存在。
        {
            const glossaryPath = path.join(BUILD_DIR, 'glossary', 'index.html');
            if (fs.existsSync(glossaryPath)) {
                const terms = loadGlossary();
                const byCategory = {};
                for (const t of terms) (byCategory[t.category] = byCategory[t.category] || []).push(t);
                const body = `
        <p style="font-size:17px;color:#4b5563;margin:0 0 24px;">匹克球（皮克球）中英術語對照與解釋，共 ${terms.length} 條，涵蓋規則、技術、戰術、裝備、場地與賽制。</p>
        ${Object.entries(byCategory).map(([cat, list]) => `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">${esc(cat)}（${list.length}）</h2>
          <dl style="margin:0;">${list.map(t => `<dt style="font-weight:600;font-size:16px;margin:12px 0 2px;">${esc(t.term)}<span style="color:#6b7280;font-weight:400;font-size:14px;"> — ${esc(t.termEn)}</span></dt><dd style="margin:0;font-size:15px;color:#4b5563;">${esc(t.definition)}</dd>`).join('')}</dl>
        </section>`).join('')}
        <p style="font-size:15px;"><a href="/rules" style="color:#0d9488;">匹克球規則教學</a>　·　<a href="/newcomer-guide" style="color:#0d9488;">新手入門指南</a>　·　<a href="/courts" style="color:#0d9488;">找球場</a></p>`;
                const content = injectPrerender(fs.readFileSync(glossaryPath, 'utf-8'), prerenderShell({
                    crumbs: [{ name: '首頁', href: '/' }, { name: '術語字典' }],
                    h1: `匹克球術語字典｜${terms.length} 條中英對照`,
                    bodyHtml: body,
                }));
                fs.writeFileSync(glossaryPath, content);
                console.log(`  Prerendered /glossary (${terms.length} terms)`);
            }
        }

        // ===== Generate per-court pages =====
        console.log('Generating court detail pages...');
        try {
            const courtsData = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'data', 'courts.json'), 'utf-8'));

            // --- SEO helpers（球場頁：預渲染內容 + 結構化資料，讓不執行 JS 的爬蟲/AI 引擎也讀得到）---
            const typeLabelOf = (t) => t === 'indoor' ? '室內' : t === 'covered' ? '風雨' : '戶外';
            const ownLabelOf = (o) => ({ public: '公營', private: '民營', school: '學校', community: '社區' }[o] || o || '');
            // 與 src/utils/courtAttributes.ts 共用同一條規則，城市頁的「24 小時場 N 座」
            // 才不會跟 /courts/24h 列出的數量對不起來。
            const courtIs24h = loadTsModule('src/utils/courtAttributes.ts').is24h;
            const ATTRS_FOR_CITY = loadTsModule('src/utils/courtAttributes.ts').COURT_ATTRIBUTES;
            const citySlugOf = (cityName) => (CITY_SLUG_MAP.find(c => c.city === cityName) || {}).slug;

            // 城市 hub：導言／簡稱取自 src/utils/cityData.ts（單一資料來源，避免重複維護）
            const cityMeta = {};
            try {
                const cityDataSrc = fs.readFileSync(path.join(__dirname, '../src/utils/cityData.ts'), 'utf-8');
                const re = /slug:\s*'([^']+)',\s*city:\s*'([^']+)',\s*shortName:\s*'([^']+)',\s*intro:\s*'((?:[^'\\]|\\.)*)'/g;
                let mm;
                while ((mm = re.exec(cityDataSrc)) !== null) {
                    cityMeta[mm[2]] = { slug: mm[1], shortName: mm[3], intro: mm[4].replace(/\\'/g, "'") };
                }
            } catch (e) { /* 導言缺失不影響其他內容 */ }
            const shortNameOf = (city) => (cityMeta[city] && cityMeta[city].shortName) || city.replace(/[市縣]$/, '');

            const buildCityFaqs = (city, cityCourts) => {
                const shortName = shortNameOf(city);
                const indoor = cityCourts.filter(c => c.type === 'indoor').length;
                const outdoor = cityCourts.filter(c => c.type !== 'indoor').length;
                const freeCourts = cityCourts.filter(c => c.fee === 'free');
                const indoorCourts = cityCourts.filter(c => c.type === 'indoor' || c.type === 'covered');
                const faqs = [{
                    q: `${shortName}有幾座匹克球場？`,
                    a: `本站目前收錄${city} ${cityCourts.length} 座匹克球場（室內 ${indoor} 座、戶外/風雨 ${outdoor} 座），持續更新中。`,
                }];
                if (freeCourts.length) faqs.push({
                    q: `${shortName}哪裡可以免費打匹克球？`,
                    a: `${city}有 ${freeCourts.length} 座免費球場：${freeCourts.slice(0, 5).map(c => c.name).join('、')}${freeCourts.length > 5 ? ' 等' : ''}。免費場通常先到先打，熱門時段需排隊輪場。`,
                });
                if (indoorCourts.length) faqs.push({
                    q: `${shortName}下雨天去哪打匹克球？`,
                    a: `${city}有 ${indoorCourts.length} 座室內或風雨球場：${indoorCourts.slice(0, 5).map(c => c.name).join('、')}${indoorCourts.length > 5 ? ' 等' : ''}，不受天氣影響。`,
                });
                return faqs;
            };

            const cityPrerender = (city, cityCourts, faqs, otherCities) => {
                const meta = cityMeta[city] || {};
                const shortName = shortNameOf(city);
                const free = cityCourts.filter(c => c.fee === 'free').length;
                const indoor = cityCourts.filter(c => c.type === 'indoor').length;
                const outdoor = cityCourts.filter(c => c.type !== 'indoor').length;
                const open24 = cityCourts.filter(c => courtIs24h(c.opening_hours)).length;
                return `
      <main style="max-width:960px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,'PingFang TC','Microsoft JhengHei',sans-serif;color:#1f2937;line-height:1.7;">
        <nav aria-label="breadcrumb" style="font-size:13px;color:#6b7280;margin-bottom:16px;">
          <a href="/" style="color:#0d9488;text-decoration:none;">首頁</a> ›
          <a href="/courts" style="color:#0d9488;text-decoration:none;">球場地圖</a> ›
          <span>${esc(city)}匹克球場</span>
        </nav>
        <h1 style="font-size:30px;font-weight:800;margin:0 0 8px;">${esc(city)}匹克球場地圖｜${cityCourts.length} 座場地</h1>
        ${meta.intro ? `<p style="color:#4b5563;margin:0 0 12px;">${esc(meta.intro)}</p>` : ''}
        <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">室內 ${indoor} 座・戶外/風雨 ${outdoor} 座・免費 ${free} 座${open24 ? `・24 小時 ${open24} 座` : ''}</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">${esc(city)}匹克球場完整名單</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${cityCourts.map(c => `<li style="margin-bottom:6px;"><a href="/courts/court-${c.id}" style="color:#0d9488;font-weight:600;">${esc(c.name)}</a>（${typeLabelOf(c.type)}・${c.courts_count} 面・${c.fee === 'free' ? '免費' : '收費'}）— ${esc(c.location.address)}</li>`).join('')}</ul>
        </section>
        ${(() => {
                    // 屬性分組：直接回答「台中免費匹克球場地」這類查詢（GSC 上該查詢 73 曝光、排名 9.7）。
                    // 不另開縣市 × 屬性頁 —— 56 種組合裡 33 種只有 1-2 座，拆頁就是薄頁。
                    const groups = ATTRS_FOR_CITY
                        .map(a => ({ a, list: cityCourts.filter(a.match) }))
                        .filter(g => g.list.length > 0);
                    if (!groups.length) return '';
                    return `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">${esc(city)}依條件分類</h2>
          ${groups.map(g => `<p style="font-size:15px;margin:0 0 8px;"><strong>${esc(g.a.label)}（${g.list.length} 座）：</strong>${g.list.map(c => `<a href="/courts/court-${c.id}" style="color:#0d9488;">${esc(c.name)}</a>`).join('、')}　<a href="/courts/${g.a.slug}" style="color:#6b7280;font-size:13px;">看全台${esc(g.a.label)}球場 →</a></p>`).join('')}
        </section>`;
                })()}
        ${faqs.length ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">${esc(shortName)}匹克球常見問題</h2>
          ${faqs.map(f => `<div style="margin-bottom:12px;"><h3 style="font-size:16px;font-weight:600;margin:0 0 4px;">${esc(f.q)}</h3><p style="font-size:15px;margin:0;color:#4b5563;">${esc(f.a)}</p></div>`).join('')}
        </section>` : ''}
        ${otherCities.length ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">探索其他縣市球場</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${otherCities.map(o => `<li><a href="/courts/${o.slug}" style="color:#0d9488;">${esc(o.city)}匹克球場</a>（${o.count} 座）</li>`).join('')}</ul>
        </section>` : ''}
        <p style="font-size:14px;"><a href="/courts" style="color:#0d9488;">開啟全台匹克球場互動地圖（GPS 找最近球場、即時天氣）→</a></p>
      </main>`;
            };

            const buildCourtFaqs = (court) => {
                const city = court.location.city || '';
                const district = court.location.district || '';
                const typeLabel = typeLabelOf(court.type);
                const faqs = [];
                faqs.push({
                    q: `${court.name}在哪裡？怎麼前往？`,
                    a: `${court.name}位於${court.location.address}（${city}${district}）。可用 Google 地圖開車導航，或查詢公車／捷運等大眾運輸即時路線前往。`,
                });
                faqs.push({
                    q: `${court.name}要收費嗎？`,
                    a: court.fee === 'free'
                        ? `${court.name}為免費開放的匹克球場，通常先到先打，熱門時段可能需要排隊輪場。`
                        : `${court.name}為收費球場，費用為${court.price || '依現場公告'}。建議事先確認時段與預約方式。`,
                });
                faqs.push({
                    q: `${court.name}的開放時間是？`,
                    a: `${court.name}的開放時間為${court.opening_hours || '依現場公告'}。${courtIs24h(court.opening_hours) ? '為 24 小時開放場地，深夜也能打球。' : ''}`.trim(),
                });
                faqs.push({
                    q: `${court.name}有幾面球場？是室內還是戶外？`,
                    a: `${court.name}共有 ${court.courts_count} 面球場，屬於${typeLabel}場地${court.surface ? `，場地材質為${court.surface}` : ''}。`,
                });
                if (court.facilities && court.facilities.length) {
                    faqs.push({
                        q: `${court.name}有哪些設施？`,
                        a: `${court.name}提供的設施包含：${court.facilities.join('、')}。`,
                    });
                }
                return faqs;
            };

            const courtPrerender = (court, siblings) => {
                const city = court.location.city || '';
                const district = court.location.district || '';
                const citySlug = citySlugOf(city);
                const typeLabel = typeLabelOf(court.type);
                const ownLabel = ownLabelOf(court.ownership);
                const feeText = court.fee === 'free' ? '免費' : (court.price || '付費');
                const faqs = buildCourtFaqs(court);
                const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}`;
                return `
      <main style="max-width:960px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,'PingFang TC','Microsoft JhengHei',sans-serif;color:#1f2937;line-height:1.7;">
        <nav aria-label="breadcrumb" style="font-size:13px;color:#6b7280;margin-bottom:16px;">
          <a href="/" style="color:#0d9488;text-decoration:none;">首頁</a> ›
          <a href="/courts" style="color:#0d9488;text-decoration:none;">球場地圖</a> ›
          ${citySlug ? `<a href="/courts/${citySlug}" style="color:#0d9488;text-decoration:none;">${esc(city)}匹克球場</a> ›` : ''}
          <span>${esc(court.name)}</span>
        </nav>
        <h1 style="font-size:30px;font-weight:800;margin:0 0 8px;">${esc(court.name)}</h1>
        ${court.status ? `<p style="margin:0 0 10px;padding:10px 14px;border:2px solid #fecdd3;background:#fff1f2;border-radius:10px;color:#881337;font-size:15px;"><strong>⚠️ 此場地目前${court.status === 'permanently_closed' ? '已歇業' : '暫時關閉'}</strong>${court.status_note ? `　${esc(court.status_note)}` : ''}${court.status_verified ? `（查證日期 ${esc(court.status_verified)}）` : ''}</p>` : ''}
        <p style="color:#4b5563;margin:0 0 4px;">📍 ${esc(court.location.address)}</p>
        <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">${esc(city)}${esc(district)}・${typeLabel}球場・${court.courts_count} 面・${esc(feeText)}${courtIs24h(court.opening_hours) ? '・24 小時開放' : ''}</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">基本資訊</h2>
          <ul style="list-style:none;padding:0;margin:0;font-size:15px;">
            <li><strong>地址：</strong>${esc(court.location.address)}</li>
            <li><strong>開放時間：</strong>${esc(court.opening_hours || '依現場公告')}</li>
            <li><strong>費用：</strong>${esc(feeText)}</li>
            <li><strong>球場數：</strong>${court.courts_count} 面</li>
            <li><strong>類型：</strong>${typeLabel}${court.surface ? `（${esc(court.surface)}）` : ''}</li>
            ${ownLabel ? `<li><strong>經營類型：</strong>${esc(ownLabel)}</li>` : ''}
            ${court.contact ? `<li><strong>聯絡電話：</strong>${esc(court.contact)}</li>` : ''}
            ${court.last_updated ? `<li><strong>資料最後查證：</strong><time datetime="${esc(court.last_updated)}">${esc(court.last_updated)}</time>（費用與時段請以場館現場公告為準）</li>` : ''}
            ${court.iplay ? `<li style="color:#6b7280;font-size:14px;">場館位置與聯絡資料部分來源：<a href="https://iplay.sports.gov.tw/" style="color:#0d9488;">運動部全國運動場館資訊網 iPlay</a>（${esc(court.iplay.venue)}）</li>` : ''}
          </ul>
        </section>
        ${court.features && court.features.length ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">場地特色</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${court.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
        </section>` : ''}
        ${court.facilities && court.facilities.length ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">設施</h2>
          <p style="font-size:15px;margin:0;">${court.facilities.map(esc).join('、')}</p>
        </section>` : ''}
        ${court.reviews ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">場地說明</h2>
          <p style="font-size:15px;margin:0;">${esc(court.reviews)}</p>
        </section>` : ''}
        ${court.iplay && court.iplay.photos && court.iplay.photos.length ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">場地實景</h2>
          ${court.iplay.photos.map(ph => `<figure style="margin:0 0 12px;"><img src="${esc(ph.src)}" alt="${esc(court.name)}－${esc(ph.caption)}（${esc(ph.taken)}）" width="${ph.width}" height="${ph.height}" loading="lazy" style="max-width:100%;height:auto;border-radius:10px;" /><figcaption style="font-size:13px;color:#6b7280;margin-top:4px;">${esc(ph.caption)}・${esc(ph.taken)} 拍攝</figcaption></figure>`).join('')}
          <p style="font-size:13px;color:#6b7280;margin:0;">照片來源：<a href="${esc(court.iplay.page || 'https://iplay.sports.gov.tw/')}" style="color:#0d9488;">運動部全國運動場館資訊網 iPlay</a>，依政府網站資料開放宣告使用。</p>
        </section>` : ''}
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">怎麼去</h2>
          ${court.iplay && court.iplay.transit ? `<p style="font-size:15px;margin:0 0 8px;"><strong>大眾運輸：</strong>${esc(court.iplay.transit)}</p>` : ''}
          ${court.iplay && court.iplay.park ? `<p style="font-size:15px;margin:0 0 8px;"><strong>停車：</strong>${esc(court.iplay.park)}</p>` : ''}
          ${court.iplay && (court.iplay.indoor_outdoor || court.iplay.lighting || court.iplay.air_conditioning) ? `<p style="font-size:15px;margin:0 0 8px;"><strong>現場條件：</strong>${[court.iplay.indoor_outdoor, court.iplay.lighting ? '夜間照明' : '', court.iplay.air_conditioning ? '有空調' : ''].filter(Boolean).map(esc).join('、')}</p>` : ''}
          ${court.iplay && court.iplay.tel ? `<p style="font-size:15px;margin:0 0 8px;"><strong>場館電話：</strong>${esc(court.iplay.tel)}</p>` : ''}
          <p style="font-size:15px;margin:0;"><a href="${navUrl}" style="color:#0d9488;">開啟 Google 地圖導航前往 ${esc(court.name)}</a></p>
        </section>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">常見問題</h2>
          ${faqs.map(f => `<div style="margin-bottom:12px;"><h3 style="font-size:16px;font-weight:600;margin:0 0 4px;">${esc(f.q)}</h3><p style="font-size:15px;margin:0;color:#4b5563;">${esc(f.a)}</p></div>`).join('')}
        </section>
        ${siblings && siblings.length ? `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">${esc(city)}其他匹克球場</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${siblings.map(s => `<li><a href="/courts/court-${s.id}" style="color:#0d9488;">${esc(s.name)}</a>（${typeLabelOf(s.type)}・${s.courts_count} 面・${s.fee === 'free' ? '免費' : '收費'}）</li>`).join('')}</ul>
          ${citySlug ? `<p style="margin:12px 0 0;font-size:15px;"><a href="/courts/${citySlug}" style="color:#0d9488;font-weight:600;">查看${esc(city)}全部匹克球場 →</a></p>` : ''}
        </section>` : ''}
        <p style="font-size:14px;"><a href="/courts" style="color:#0d9488;">← 返回全台匹克球場地圖</a></p>
      </main>`;
            };

            const courtStructured = (court) => {
                const city = court.location.city || '';
                const citySlug = citySlugOf(city);
                const canonical = `${BASE_URL}/courts/court-${court.id}/`;
                const typeLabel = typeLabelOf(court.type);
                const faqs = buildCourtFaqs(court);
                const crumbs = [
                    { "@type": "ListItem", "position": 1, "name": "首頁", "item": BASE_URL + "/" },
                    { "@type": "ListItem", "position": 2, "name": "球場地圖", "item": BASE_URL + "/courts/" },
                ];
                if (citySlug) crumbs.push({ "@type": "ListItem", "position": 3, "name": `${city}匹克球場`, "item": `${BASE_URL}/courts/${citySlug}/` });
                crumbs.push({ "@type": "ListItem", "position": crumbs.length + 1, "name": court.name, "item": canonical });
                return {
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "SportsActivityLocation",
                            "@id": `${canonical}#place`,
                            "name": court.name,
                            "sport": "Pickleball",
                            "description": `${court.name}是位於${city}${court.location.district || ''}的${typeLabel}匹克球場，共 ${court.courts_count} 面球場，${court.fee === 'free' ? '免費開放' : '收費'}。`,
                            "address": { "@type": "PostalAddress", "streetAddress": court.location.address, "addressLocality": court.location.district, "addressRegion": city, "addressCountry": "TW" },
                            "geo": { "@type": "GeoCoordinates", "latitude": court.location.lat, "longitude": court.location.lng },
                            ...(court.status ? {} : { "openingHours": court.opening_hours }),
                            "isAccessibleForFree": court.fee === 'free',
                            "priceRange": court.fee === 'free' ? '免費' : (court.price || '付費'),
                            "url": canonical,
                            "hasMap": `https://www.google.com/maps/search/?api=1&query=${court.location.lat},${court.location.lng}`,
                            ...(court.contact ? { "telephone": court.contact } : {}),
                            ...(court.facilities && court.facilities.length ? { "amenityFeature": court.facilities.map(f => ({ "@type": "LocationFeatureSpecification", "name": f, "value": true })) } : {}),
                            ...(court.last_updated ? { "dateModified": court.last_updated } : {}),
                            ...(court.status ? { "disambiguatingDescription": `本站於 ${court.status_verified || '近期'} 查證：此場地${court.status === 'permanently_closed' ? '已歇業' : '暫時關閉'}` } : {}),
                            ...(court.iplay && court.iplay.transit ? { "publicTransportInformation": court.iplay.transit } : {}),
                            ...(court.iplay && court.iplay.website ? { "sameAs": court.iplay.website } : {}),
                            ...(court.iplay && court.iplay.photos && court.iplay.photos.length ? { "image": court.iplay.photos.map(ph => BASE_URL + ph.src) } : {}),
                        },
                        { "@type": "BreadcrumbList", "itemListElement": crumbs },
                        { "@type": "FAQPage", "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) },
                    ],
                };
            };

            for (const court of courtsData.courts) {
                const slug = `court-${court.id}`;
                const dirPath = path.join(BUILD_DIR, 'courts', slug);
                fs.mkdirSync(dirPath, { recursive: true });
                const city = court.location.city || '';
                const district = court.location.district || '';
                const typeLabel = typeLabelOf(court.type);
                const feeLabel = court.fee === 'free' ? '免費' : '收費';
                const siblings = courtsData.courts.filter(c => c.location.city === city && c.id !== court.id).slice(0, 6);
                const statusTag = court.status === 'permanently_closed' ? '【已歇業】' : court.status === 'temporarily_closed' ? '【暫時關閉】' : '';
                // 場館名本身已含「匹克球」時不再補「匹克球場」，避免標題重複同一個詞被行動版截掉
                const title = `${statusTag}${court.name}｜${city}${district}${court.name.includes('匹克球') ? '' : '匹克球場'}・${typeLabel}${court.courts_count}面${feeLabel}`;
                const statusDesc = court.status ? `${court.status === 'permanently_closed' ? '【本站查證：已歇業】' : '【本站查證：暫時關閉】'}${court.status_verified ? `（${court.status_verified}）` : ''}` : '';
                const desc = `${statusDesc}${court.name}位於${court.location.address}，為${typeLabel}${feeLabel}匹克球場，共 ${court.courts_count} 面。開放時間：${court.opening_hours || '依現場公告'}。${court.fee !== 'free' && court.price ? `費用：${court.price}。` : ''}${court.facilities && court.facilities.length ? `設施：${court.facilities.slice(0, 4).join('、')}。` : ''}`;
                const canonical = `${BASE_URL}/courts/${slug}/`;
                let content = template;
                content = content.replace(/<title>.*<\/title>/, `<title>${esc(title)}</title>`);
                content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`);
                content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
                content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(title)}" />`);
                content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(desc)}" />`);
                content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
                content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(courtStructured(court)).replace(/</g, '\\u003c')}</script>`);
                content = content.replace('<div id="root"></div>', `<div id="root">${courtPrerender(court, siblings)}</div>`);
                content = applyOg(content, `og/court-${court.id}.png`, {
                    title: court.name, type: 'court', badge: '球場',
                    subtitle: `${city}${district} · ${typeLabel} · ${court.fee === 'free' ? '免費' : '付費'} · ${court.courts_count} 面`,
                });
                fs.writeFileSync(path.join(dirPath, 'index.html'), content);
            }
            console.log(`  Generated ${courtsData.courts.length} court detail pages`);

            // ===== Generate city hub pages =====
            // 各縣市球場數（供「其他縣市」內部連結顯示）
            const cityCountMap = {};
            for (const c of courtsData.courts) cityCountMap[c.location.city] = (cityCountMap[c.location.city] || 0) + 1;

            let cityPageCount = 0;
            for (const { slug, city } of CITY_SLUG_MAP) {
                // 與 CityCourts.tsx 一致的排序（新場 → 免費 → 場數多）
                const cityCourts = courtsData.courts
                    .filter(c => c.location.city === city)
                    .sort((a, b) => {
                        if (!!a.is_new !== !!b.is_new) return a.is_new ? -1 : 1;
                        if ((a.fee === 'free') !== (b.fee === 'free')) return a.fee === 'free' ? -1 : 1;
                        return b.courts_count - a.courts_count;
                    });
                if (cityCourts.length === 0) continue;
                const dirPath = path.join(BUILD_DIR, 'courts', slug);
                fs.mkdirSync(dirPath, { recursive: true });
                const free = cityCourts.filter(c => c.fee === 'free').length;
                const indoor = cityCourts.filter(c => c.type === 'indoor').length;
                const open24 = cityCourts.filter(c => courtIs24h(c.opening_hours)).length;
                const faqs = buildCityFaqs(city, cityCourts);
                const otherCities = CITY_SLUG_MAP
                    .filter(o => o.city !== city && (cityCountMap[o.city] || 0) > 0)
                    .map(o => ({ slug: o.slug, city: o.city, count: cityCountMap[o.city] }));
                const title = `${city}匹克球場地圖 2026｜${cityCourts.length} 座場地完整名單（免費/室內/收費）`;
                // 「皮克球」是 Pickleball 的常見錯字寫法，GSC 上有可觀曝光但站內從未出現，
                // 搜尋結果摘要因此不會標粗任何字。這裡在描述帶一次，不做關鍵字堆疊。
                const desc = `${city}匹克球場（皮克球場）完整攻略：免費場 ${free} 座、室內場 ${indoor} 座${open24 ? `、24 小時場 ${open24} 座` : ''}，共 ${cityCourts.length} 座場地。地址、開放時間、費用、特色一次看，附 GPS 導航。`;
                const canonical = `${BASE_URL}/courts/${slug}/`;
                let content = template;
                content = content.replace(/<title>.*<\/title>/, `<title>${esc(title)}</title>`);
                content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`);
                content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
                content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(title)}" />`);
                content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(desc)}" />`);
                content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
                const ldJson = {
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "ItemList",
                            "name": `${city}匹克球場完整列表`, "numberOfItems": cityCourts.length,
                            "itemListElement": cityCourts.map((c, i) => ({
                                "@type": "SportsActivityLocation", "position": i + 1, "name": c.name, "sport": "Pickleball",
                                "address": { "@type": "PostalAddress", "streetAddress": c.location.address, "addressLocality": c.location.district, "addressRegion": c.location.city, "addressCountry": "TW" },
                                "isAccessibleForFree": c.fee === 'free',
                                "url": `${BASE_URL}/courts/court-${c.id}/`
                            }))
                        },
                        {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                { "@type": "ListItem", "position": 1, "name": "首頁", "item": BASE_URL + "/" },
                                { "@type": "ListItem", "position": 2, "name": "球場地圖", "item": BASE_URL + "/courts/" },
                                { "@type": "ListItem", "position": 3, "name": `${city}匹克球場`, "item": canonical },
                            ]
                        },
                        {
                            "@type": "FAQPage",
                            "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
                        },
                    ],
                };
                content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(ldJson).replace(/</g, '\\u003c')}</script>`);
                content = content.replace('<div id="root"></div>', `<div id="root">${cityPrerender(city, cityCourts, faqs, otherCities)}</div>`);
                content = applyOg(content, `og/city-${slug}.png`, {
                    title: `${city}匹克球場地圖`, type: 'city', badge: '城市',
                    subtitle: `${cityCourts.length} 座場地 · 免費 ${free} · 室內 ${indoor}${open24 ? ` · 24H ${open24}` : ''}`,
                });
                fs.writeFileSync(path.join(dirPath, 'index.html'), content);
                cityPageCount++;
            }
            console.log(`  Generated ${cityPageCount} city hub pages`);

            // ===== Prerender /courts =====
            // 這頁原本只送空的 #root 給爬蟲，而它是全站曝光第三高的頁，
            // 也是 17 個城市頁唯一該有的上游入口（先前對它們零連結）。
            {
                const indexPath = path.join(BUILD_DIR, 'courts', 'index.html');
                if (fs.existsSync(indexPath)) {
                    const cities = CITY_SLUG_MAP
                        .map(({ slug, city }) => ({
                            slug, city,
                            list: courtsData.courts
                                .filter(c => c.location.city === city)
                                .sort((a, b) => b.courts_count - a.courts_count),
                        }))
                        .filter(c => c.list.length > 0);
                    const total = courtsData.courts.length;
                    const free = courtsData.courts.filter(c => c.fee === 'free').length;
                    const indoor = courtsData.courts.filter(c => c.type === 'indoor').length;
                    const body = `
        <p style="font-size:17px;color:#4b5563;margin:0 0 8px;">全台 ${cities.length} 縣市共 ${total} 座匹克球場（皮克球場）完整名單：室內 ${indoor} 座、免費 ${free} 座。每座球場都有地址、開放時間、費用與 GPS 導航，並標示本站資料最後查證日期。</p>
        <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">互動地圖支援 GPS 定位找最近球場、依室內／戶外／免費／24 小時篩選。</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">依條件找匹克球場</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${loadTsModule('src/utils/courtAttributes.ts').COURT_ATTRIBUTES.map(a => {
                        const n = courtsData.courts.filter(a.match).length;
                        return n ? `<li style="margin-bottom:4px;"><a href="/courts/${a.slug}" style="color:#0d9488;font-weight:600;">${esc(a.h1)}</a>（${n} 座）</li>` : '';
                    }).join('')}</ul>
        </section>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">依縣市找匹克球場</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${cities.map(c => `<li style="margin-bottom:4px;"><a href="/courts/${c.slug}" style="color:#0d9488;font-weight:600;">${esc(c.city)}匹克球場</a>（${c.list.length} 座）</li>`).join('')}</ul>
        </section>
        ${cities.map(c => `
        <section style="margin-bottom:20px;">
          <h2 style="font-size:18px;font-weight:700;margin:0 0 8px;"><a href="/courts/${c.slug}" style="color:#1f2937;text-decoration:none;">${esc(c.city)}匹克球場（${c.list.length} 座）</a></h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${c.list.map(x => `<li style="margin-bottom:4px;"><a href="/courts/court-${x.id}" style="color:#0d9488;">${esc(x.name)}</a>（${typeLabelOf(x.type)}・${x.courts_count} 面・${x.fee === 'free' ? '免費' : '收費'}）</li>`).join('')}</ul>
        </section>`).join('')}
        <p style="font-size:15px;"><a href="/rules" style="color:#0d9488;">匹克球規則教學</a>　·　<a href="/newcomer-guide" style="color:#0d9488;">新手入門指南</a>　·　<a href="/equipment" style="color:#0d9488;">裝備選購</a></p>`;
                    const content = injectPrerender(fs.readFileSync(indexPath, 'utf-8'), prerenderShell({
                        crumbs: [{ name: '首頁', href: '/' }, { name: '找球場' }],
                        h1: `全台匹克球場地圖｜${cities.length} 縣市 ${total} 座場地`,
                        bodyHtml: body,
                    }));
                    fs.writeFileSync(indexPath, content);
                    console.log(`  Prerendered /courts (${cities.length} cities, ${total} courts)`);
                }
            }

            // ===== 屬性型球場頁 /courts/free、/courts/indoor、/courts/outdoor、/courts/24h =====
            // 屬性定義與文案由 src/utils/courtAttributes.ts 提供（React 頁面讀同一份）。
            // 只做全國層級：縣市 × 屬性有 56 種組合，其中 33 種只有 1-2 座，拆頁就是薄頁。
            {
                const { COURT_ATTRIBUTES } = loadTsModule('src/utils/courtAttributes.ts');
                for (const attr of COURT_ATTRIBUTES) {
                    const matched = courtsData.courts.filter(attr.match);
                    if (!matched.length) continue;
                    const byCity = CITY_SLUG_MAP
                        .map(({ slug, city }) => ({
                            slug, city,
                            list: matched.filter(c => c.location.city === city).sort((a, b) => b.courts_count - a.courts_count),
                        }))
                        .filter(g => g.list.length > 0)
                        .sort((a, b) => b.list.length - a.list.length);
                    const surfaces = matched.reduce((n, c) => n + (c.courts_count || 0), 0);
                    const canonical = `${BASE_URL}/courts/${attr.slug}/`;
                    const title = `${attr.h1} 2026｜${matched.length} 座完整名單、地址與開放時間`;
                    const desc = `${attr.intro}本站收錄 ${matched.length} 座，分布 ${byCity.length} 個縣市，每座標示最後查證日期。`;
                    const faqs = [
                        {
                            q: `全台有幾座${attr.label}匹克球場？`,
                            a: `本站目前收錄 ${matched.length} 座${attr.label}匹克球場，分布於 ${byCity.length} 個縣市，合計 ${surfaces} 面球場。每座都標示本站最後查證日期。`,
                        },
                        {
                            q: `哪個縣市的${attr.label}匹克球場最多？`,
                            a: `${byCity.slice(0, 5).map(g => `${g.city} ${g.list.length} 座`).join('、')}。`,
                        },
                    ];
                    const body = `
        <p style="font-size:17px;color:#4b5563;margin:0 0 8px;">${esc(attr.intro)}</p>
        <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">本站收錄 ${matched.length} 座，分布 ${byCity.length} 個縣市，合計 ${surfaces} 面球場。</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">其他分類</h2>
          <p style="font-size:15px;margin:0;">${COURT_ATTRIBUTES.filter(a => a.slug !== attr.slug).map(a => `<a href="/courts/${a.slug}" style="color:#0d9488;">${esc(a.label)}匹克球場</a>`).join('　·　')}　·　<a href="/courts" style="color:#0d9488;">全部球場</a></p>
        </section>
        ${byCity.map(g => `
        <section style="margin-bottom:20px;">
          <h2 style="font-size:18px;font-weight:700;margin:0 0 8px;"><a href="/courts/${g.slug}" style="color:#1f2937;text-decoration:none;">${esc(g.city)}</a>（${g.list.length} 座）</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${g.list.map(c => `<li style="margin-bottom:6px;"><a href="/courts/court-${c.id}" style="color:#0d9488;font-weight:600;">${esc(c.name)}</a>（${typeLabelOf(c.type)}・${c.courts_count} 面・${c.fee === 'free' ? '免費' : '收費'}・${esc(c.opening_hours || '依現場公告')}）— ${esc(c.location.address)}</li>`).join('')}</ul>
        </section>`).join('')}
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">常見問題</h2>
          ${faqs.map(f => `<div style="margin-bottom:12px;"><h3 style="font-size:16px;font-weight:600;margin:0 0 4px;">${esc(f.q)}</h3><p style="font-size:15px;margin:0;color:#4b5563;">${esc(f.a)}</p></div>`).join('')}
        </section>`;
                    const ldJson = {
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "ItemList", "name": attr.h1, "numberOfItems": matched.length,
                                "itemListElement": matched.map((c, i) => ({
                                    "@type": "SportsActivityLocation", "position": i + 1, "name": c.name, "sport": "Pickleball",
                                    "address": { "@type": "PostalAddress", "streetAddress": c.location.address, "addressLocality": c.location.district, "addressRegion": c.location.city, "addressCountry": "TW" },
                                    "isAccessibleForFree": c.fee === 'free',
                                    "url": `${BASE_URL}/courts/court-${c.id}/`,
                                })),
                            },
                            { "@type": "FAQPage", "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) },
                            {
                                "@type": "BreadcrumbList", "itemListElement": [
                                    { "@type": "ListItem", "position": 1, "name": "首頁", "item": BASE_URL + "/" },
                                    { "@type": "ListItem", "position": 2, "name": "球場地圖", "item": `${BASE_URL}/courts/` },
                                    { "@type": "ListItem", "position": 3, "name": attr.h1, "item": canonical },
                                ],
                            },
                        ],
                    };
                    const dirPath = path.join(BUILD_DIR, 'courts', attr.slug);
                    fs.mkdirSync(dirPath, { recursive: true });
                    let content = template;
                    content = content.replace(/<title>.*<\/title>/, `<title>${esc(title)}</title>`);
                    content = content.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`);
                    content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
                    content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(title)}" />`);
                    content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(desc)}" />`);
                    content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
                    content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(ldJson).replace(/</g, '\\u003c')}</script>`);
                    content = injectPrerender(content, prerenderShell({
                        crumbs: [{ name: '首頁', href: '/' }, { name: '球場地圖', href: '/courts' }, { name: attr.label }],
                        h1: `${attr.h1}｜${matched.length} 座`,
                        bodyHtml: body,
                    }));
                    content = applyOg(content, `og/courts-${attr.slug}.png`, {
                        title: attr.h1, type: 'city', badge: '球場分類',
                        subtitle: `${matched.length} 座 · ${byCity.length} 縣市 · 合計 ${surfaces} 面`,
                    });
                    fs.writeFileSync(path.join(dirPath, 'index.html'), content);
                }
                console.log(`  Prerendered ${COURT_ATTRIBUTES.length} attribute court pages`);
            }

            // ===== Prerender / =====
            // 首頁同樣只送空的 #root。曝光不高，但它是全站權重起點，
            // 也是不執行 JS 的 AI 引擎最常抓的一頁。
            {
                const homePath = path.join(BUILD_DIR, 'index.html');
                if (fs.existsSync(homePath)) {
                    const total = courtsData.courts.length;
                    const cityCounts = CITY_SLUG_MAP
                        .map(({ slug, city }) => ({ slug, city, n: courtsData.courts.filter(c => c.location.city === city).length }))
                        .filter(c => c.n > 0)
                        .sort((a, b) => b.n - a.n);
                    const sections = [
                        { href: '/courts', label: `全台匹克球場地圖（${total} 座）`, sub: `${cityCounts.length} 縣市球場名單，含地址、開放時間、費用與 GPS 導航` },
                        { href: '/rules', label: '匹克球規則教學', sub: '3D 互動式教學，秒懂雙彈跳、廚房區與發球順序' },
                        { href: '/newcomer-guide', label: '新手入門指南', sub: '第一次打匹克球需要準備什麼、怎麼找人一起打' },
                        { href: '/equipment', label: '裝備選購指南', sub: '球拍、球鞋、球的選購重點與台灣購買管道' },
                        { href: '/tournaments', label: '2026 賽事總覽', sub: 'CTPF 認證賽事、AEPL 職業聯賽賽程與戰報' },
                        { href: '/glossary', label: '中英術語字典', sub: 'dink、ATP、第三球下切等術語的中英對照與解釋' },
                    ];
                    const body = `
        <p style="font-size:17px;color:#4b5563;margin:0 0 24px;">Picklemaster 是台灣的匹克球（Pickleball，也常被寫成皮克球）資訊平台：全台 ${total} 座球場地圖、3D 互動規則教學、賽事追蹤、裝備選購與術語字典。球場資料逐座人工查證並標示查證日期。</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">主要單元</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${sections.map(s => `<li style="margin-bottom:8px;"><a href="${s.href}" style="color:#0d9488;font-weight:600;">${esc(s.label)}</a><br><span style="color:#6b7280;font-size:13px;">${esc(s.sub)}</span></li>`).join('')}</ul>
        </section>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">依縣市找球場</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${cityCounts.map(c => `<li style="margin-bottom:4px;"><a href="/courts/${c.slug}" style="color:#0d9488;">${esc(c.city)}匹克球場</a>（${c.n} 座）</li>`).join('')}</ul>
        </section>`;
                    const content = injectPrerender(fs.readFileSync(homePath, 'utf-8'), prerenderShell({
                        crumbs: [{ name: '首頁' }],
                        h1: '匹克球台灣 Picklemaster｜球場地圖、規則教學與賽事追蹤',
                        bodyHtml: body,
                    }));
                    fs.writeFileSync(homePath, content);
                    console.log('  Prerendered /');
                }
            }
        } catch (e) {
            console.warn('  Skip per-court generation:', e.message);
        }

        // Generate Sitemap.xml (2026 enhanced)
        console.log('Generating sitemap.xml...');
        const priorityMap = {
            courts: { p: '1.0', f: 'daily' },
            tournaments: { p: '1.0', f: 'weekly' },
            equipment: { p: '0.95', f: 'weekly' },
            learning: { p: '0.95', f: 'weekly' },
            'newcomer-guide': { p: '0.95', f: 'weekly' },
            rules: { p: '0.9', f: 'weekly' },
            'learning-paths': { p: '0.9', f: 'weekly' },
            faq: { p: '0.9', f: 'weekly' },
            glossary: { p: '0.9', f: 'monthly' },
            ratings: { p: '0.9', f: 'monthly' },
            resources: { p: '0.85', f: 'weekly' },
            'pro-players': { p: '0.85', f: 'monthly' },
            game: { p: '0.8', f: 'monthly' },
            scorer: { p: '0.75', f: 'monthly' },
            about: { p: '0.7', f: 'monthly' },
            play: { p: '0.85', f: 'daily' },
        };

        // lastmod 只在拿得到「真實異動日」時才寫。
        // 原本 336 筆裡有 309 筆蓋的是建置日期 —— 每跑一次 build 就把全站推成今天，
        // 而 Google 的作法是：lastmod 一旦被判定不可信，就整個忽略掉。
        // 球場 156 筆本來就有人工查證日（last_updated），文章有 updatedDate，
        // 新聞有發佈日；其餘拿不到真實日期的，寧可不寫 —— lastmod 本來就是選填。
        const urlEntry = (loc, { lastmod, changefreq, priority }) => `
    <url>
        <loc>${loc}</loc>${lastmod ? `
        <lastmod>${lastmod}</lastmod>` : ''}
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`;

        // 球場異動日：城市頁取該市最新、/ 與 /courts 取全站最新
        let courtsForSitemap = [];
        try {
            courtsForSitemap = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'data', 'courts.json'), 'utf-8')).courts;
        } catch (e) { /* skip if missing */ }
        const newestOf = (list) => list.map(c => c.last_updated).filter(Boolean).sort().pop();
        const courtsNewest = newestOf(courtsForSitemap);
        const articleDatesForSitemap = loadArticleDates();

        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
        sitemapContent += urlEntry(`${BASE_URL}/`, { lastmod: courtsNewest, changefreq: 'daily', priority: '1.0' });

        for (const route of Object.keys(pageSEO)) {
            const meta = priorityMap[route] || { p: '0.7', f: 'monthly' };
            sitemapContent += urlEntry(`${BASE_URL}/${route}/`, {
                lastmod: route === 'courts' ? courtsNewest : undefined,
                changefreq: meta.f, priority: meta.p,
            });
        }

        for (const p of PROGRAM_SLUGS) {
            sitemapContent += urlEntry(`${BASE_URL}/training-programs/${p.slug}/`, { changefreq: 'monthly', priority: '0.85' });
        }

        for (const p of PLAYER_SLUGS) {
            sitemapContent += urlEntry(`${BASE_URL}/players/${p.slug}/`, { changefreq: 'monthly', priority: '0.85' });
        }

        for (const pd of PADDLE_SLUGS) {
            sitemapContent += urlEntry(`${BASE_URL}/paddles/${pd.slug}/`, { changefreq: 'monthly', priority: '0.8' });
        }

        for (const a of ARTICLE_SLUGS) {
            sitemapContent += urlEntry(`${BASE_URL}/articles/${a.slug}/`, {
                lastmod: (articleDatesForSitemap[a.slug] || {}).updated,
                changefreq: 'monthly', priority: '0.9',
            });
        }

        for (const nw of loadNewsItems()) {
            sitemapContent += urlEntry(`${BASE_URL}/news/${nw.id}/`, { lastmod: nw.date, changefreq: 'monthly', priority: '0.7' });
        }

        for (const t of TECHNIQUE_SLUGS) {
            sitemapContent += urlEntry(`${BASE_URL}/techniques/${t.slug}/`, { changefreq: 'monthly', priority: '0.85' });
        }

        for (const { slug, city } of CITY_SLUG_MAP) {
            const cityCourts = courtsForSitemap.filter(c => c.location.city === city);
            if (!cityCourts.length) continue;
            sitemapContent += urlEntry(`${BASE_URL}/courts/${slug}/`, {
                lastmod: newestOf(cityCourts), changefreq: 'weekly', priority: '0.95',
            });
        }

        // 屬性型球場頁（/courts/free 等）
        for (const attr of loadTsModule('src/utils/courtAttributes.ts').COURT_ATTRIBUTES) {
            const matched = courtsForSitemap.filter(attr.match);
            if (!matched.length) continue;
            sitemapContent += urlEntry(`${BASE_URL}/courts/${attr.slug}/`, {
                lastmod: newestOf(matched), changefreq: 'weekly', priority: '0.9',
            });
        }

        for (const court of courtsForSitemap) {
            sitemapContent += urlEntry(`${BASE_URL}/courts/court-${court.id}/`, {
                lastmod: court.last_updated, changefreq: 'monthly', priority: '0.8',
            });
        }

        sitemapContent += `
</urlset>`;

        fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), sitemapContent);
        console.log('sitemap.xml generated successfully!');

        console.log(`  Generated ${ogGenerated} per-page OG images`);
        console.log('Static page generation completed successfully!');
    } catch (error) {
        console.error('Error generating static pages:', error);
        process.exit(1);
    }
}

generateStaticPages();
