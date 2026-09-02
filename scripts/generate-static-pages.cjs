const fs = require('fs');
const path = require('path');
const { renderOg } = require('./og-image.cjs');

// Configuration
const BUILD_DIR = path.join(__dirname, '../docs');
const BASE_URL = 'https://picklemastertw.com';

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
        title: '全台匹克球場地圖 2026 » GPS 一鍵找球場 125+ 免費/室內/24H 場地',
        description: '2026 全台最新匹克球場地圖！收錄 125+ 球場，17 縣市全覆蓋（含花博 MAJI、內湖 PicklePickle、板橋國運、台中 YIYI、雲林 PK Park、花蓮 PKing 等）。GPS 定位找最近球場，篩選室內冷氣、戶外免費、24 小時、風雨球場，桃園/新竹/彰化/嘉義新場全更新。',
        keywords: '匹克球場,匹克球場地,皮克球場地,台灣匹克球場,匹克球場地圖,匹克球場推薦,匹克球場預約,戶外匹克球場,免費匹克球場,室內匹克球場,附近匹克球場,最近匹克球場,24小時匹克球場,台北匹克球場,新北匹克球場,桃園匹克球場地,新竹匹克球場,台中匹克球場,彰化匹克球場,嘉義匹克球場,台南匹克球場,高雄匹克球場,屏東匹克球場,宜蘭匹克球場,花蓮匹克球場,南投匹克球場,天母公園匹克球場,大村匹克球,竹北星空匹克球場,北投匹克球場,信義匹克球場,士林匹克球場,內湖匹克球場,大安匹克球場,松山匹克球場,中和匹克球場,新莊匹克球場,板橋匹克球場,淡水匹克球場,龜山匹克球場,中壢匹克球場,平鎮匹克球場,西屯匹克球場,南屯匹克球場,東區匹克球場,鳳山匹克球場,左營匹克球場,前金匹克球場,埔里匹克球場,大村匹克球場,秀水匹克球場,公園匹克球場,河濱匹克球場,學校匹克球場,運動中心匹克球,網球中心匹克球場,PICKZONE,Pickle Day,Downstairs Pickleball,Social N Pickle,P.dang,Seattle Pickleball,pickleball court taiwan,pickleball court taipei,pickleball court kaohsiung,pickleball court taichung,pickleball court taoyuan,pickleball court hsinchu,pickleball near me',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/courts#webpage",
                    "url": "https://picklemastertw.com/courts",
                    "name": "台灣匹克球場地圖 2026 | 全台 125+ 球場完整資訊",
                    "description": "2026 年台灣最完整的匹克球場地圖！GPS 定位找最近球場、篩選室內/戶外/免費/24 小時/公園/河濱場地。",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" },
                    "inLanguage": "zh-TW"
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "找球場", "item": "https://picklemastertw.com/courts" }
                    ]
                },
                {
                    "@type": "SportsActivityLocation",
                    "name": "台灣匹克球場地圖",
                    "description": "提供全台灣超過 70 個匹克球場的詳細資訊與地圖，涵蓋雙北、桃竹、中彰投、雲嘉南、高屏、宜花東",
                    "geo": { "@type": "GeoCoordinates", "latitude": "23.5", "longitude": "121.0" },
                    "address": { "@type": "PostalAddress", "addressCountry": "TW", "addressRegion": "台灣" }
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
                    "url": "https://picklemastertw.com/rules",
                    "name": "3分鐘學會匹克球！超簡單 3D 互動規則教學",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "新手專區", "item": "https://picklemastertw.com/newcomer" },
                        { "@type": "ListItem", "position": 3, "name": "規則教學", "item": "https://picklemastertw.com/rules" }
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
                    "url": "https://picklemastertw.com/equipment",
                    "name": "匹克球拍選購指南",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "裝備指南", "item": "https://picklemastertw.com/equipment" }
                    ]
                },
                {
                    "@type": "ItemList",
                    "name": "匹克球拍選購指南",
                    "description": "專業匹克球拍推薦與選購指南，包含材質分析、重量選擇、價格範圍",
                    "numberOfItems": 3,
                    "itemListElement": [
                        {
                            "@type": "Product",
                            "position": 1,
                            "name": "入門級匹克球拍",
                            "description": "適合新手的複合材質匹克球拍，重量適中，價格實惠",
                            "category": "匹克球拍",
                            "brand": { "@type": "Brand", "name": "Picklemaster Taiwan 推薦" },
                            "offers": { "@type": "AggregateOffer", "priceCurrency": "TWD", "lowPrice": "2000", "highPrice": "4000", "offerCount": "8", "availability": "https://schema.org/InStock" },
                            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.3", "reviewCount": "50", "bestRating": "5", "worstRating": "1" },
                            "review": [{ "@type": "Review", "author": { "@type": "Organization", "name": "Picklemaster Taiwan" }, "datePublished": "2026-01-15", "reviewBody": "入門級球拍價位親民、容錯率高，是初學者建立基本擊球感的最佳選擇。建議優先選擇複合材質、重量 7.6-8.0oz 的款式。", "reviewRating": { "@type": "Rating", "ratingValue": "4.3", "bestRating": "5", "worstRating": "1" } }]
                        },
                        {
                            "@type": "Product",
                            "position": 2,
                            "name": "中階級匹克球拍",
                            "description": "玻璃纖維材質，適合中級球員，提供良好的控球性和力量",
                            "category": "匹克球拍",
                            "brand": { "@type": "Brand", "name": "Picklemaster Taiwan 推薦" },
                            "offers": { "@type": "AggregateOffer", "priceCurrency": "TWD", "lowPrice": "4000", "highPrice": "8000", "offerCount": "12", "availability": "https://schema.org/InStock" },
                            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.6", "reviewCount": "120", "bestRating": "5", "worstRating": "1" },
                            "review": [{ "@type": "Review", "author": { "@type": "Organization", "name": "Picklemaster Taiwan" }, "datePublished": "2026-02-08", "reviewBody": "中階拍兼顧控制與力量，玻纖或混碳面板手感佳，DUPR 3.0-3.5 球員首選價位帶。實測 Selkirk、Joola、Engage 等品牌在此區間表現穩定。", "reviewRating": { "@type": "Rating", "ratingValue": "4.6", "bestRating": "5", "worstRating": "1" } }]
                        },
                        {
                            "@type": "Product",
                            "position": 3,
                            "name": "高階級碳纖維匹克球拍",
                            "description": "職業級碳纖維材質，輕量化設計，提供最佳性能表現",
                            "category": "匹克球拍",
                            "brand": { "@type": "Brand", "name": "Picklemaster Taiwan 推薦" },
                            "offers": { "@type": "AggregateOffer", "priceCurrency": "TWD", "lowPrice": "8000", "highPrice": "15000", "offerCount": "18", "availability": "https://schema.org/InStock" },
                            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "80", "bestRating": "5", "worstRating": "1" },
                            "review": [{ "@type": "Review", "author": { "@type": "Organization", "name": "Picklemaster Taiwan" }, "datePublished": "2026-03-20", "reviewBody": "頂級碳纖維拍的旋轉量與甜蜜點都遠勝中階拍，職業選手主流選擇。Joola Pro IV、Six Zero Black Diamond、CRBN1X 都在此價格區間，DUPR 4.0+ 推薦升級。", "reviewRating": { "@type": "Rating", "ratingValue": "4.8", "bestRating": "5", "worstRating": "1" } }]
                        }
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
                    "url": "https://picklemastertw.com/learning-paths",
                    "name": "匹克球完整學習課程",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "學習路徑", "item": "https://picklemastertw.com/learning-paths" }
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
                    "url": "https://picklemastertw.com/learning",
                    "name": "匹克球互動技巧教學",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "實戰技巧", "item": "https://picklemastertw.com/learning" }
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
                    "url": "https://picklemastertw.com/game",
                    "name": "Pickle Master 互動遊戲",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "互動遊戲", "item": "https://picklemastertw.com/game" }
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
                    "url": "https://picklemastertw.com/scorer",
                    "name": "專業匹克球計分器",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "計分器", "item": "https://picklemastertw.com/scorer" }
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
                    "url": "https://picklemastertw.com/resources",
                    "name": "匹克球學習資源彙整",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "資源中心", "item": "https://picklemastertw.com/resources" }
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
                    "url": "https://picklemastertw.com/about",
                    "name": "關於 Picklemaster Taiwan",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "更多", "item": "" },
                        { "@type": "ListItem", "position": 3, "name": "關於我們", "item": "https://picklemastertw.com/about" }
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
                    "url": "https://picklemastertw.com/faq",
                    "name": "匹克球常見問題",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "新手專區", "item": "https://picklemastertw.com/newcomer" },
                        { "@type": "ListItem", "position": 3, "name": "常見問題", "item": "https://picklemastertw.com/faq" }
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
                    "url": "https://picklemastertw.com/pro-players",
                    "name": "世界頂尖匹克球選手",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "裝備與攻略", "item": "https://picklemastertw.com/equipment" },
                        { "@type": "ListItem", "position": 3, "name": "頂尖選手", "item": "https://picklemastertw.com/pro-players" }
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
                    "url": "https://picklemastertw.com/aepl"
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "AEPL 職業聯賽", "item": "https://picklemastertw.com/aepl" }
                    ]
                }
            ]
        }
    },
    tournaments: {
        title: '2026 台灣匹克球賽事總覽 | CTPF 全年認證賽、國際積分賽',
        description: '完整掌握 2026 台灣匹克球 23 場賽事：AEPL 職業聯賽、TCI APP ASIA TOUR 台北站、金碧盃、南華盃、臺北公開賽、APG 亞洲賽。報名時間、場地、組別、獎金一次看。',
        keywords: '2026匹克球賽事,台灣匹克球比賽,CTPF賽事,臺灣盃匹克球,NAPA盃,港都盃,中正盃,噶瑪蘭盃,臺北匹克球公開賽,APG 亞洲匹克球運動會,匹克球錦標賽,匹克球報名',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/tournaments#webpage",
                    "url": "https://picklemastertw.com/tournaments",
                    "name": "2026 台灣匹克球賽事總覽",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "2026 賽事", "item": "https://picklemastertw.com/tournaments" }
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
                    "url": "https://picklemastertw.com/glossary",
                    "name": "匹克球術語大全",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "術語字典", "item": "https://picklemastertw.com/glossary" }
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
                    "url": "https://picklemastertw.com/ratings",
                    "name": "DUPR 評級指南 2026",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "DUPR 評級", "item": "https://picklemastertw.com/ratings" }
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
            "url": "https://picklemastertw.com/training-programs"
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
            "url": "https://picklemastertw.com/hall-of-fame"
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
            "url": "https://picklemastertw.com/paddles"
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
            "url": "https://picklemastertw.com/videos"
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
            "url": "https://picklemastertw.com/articles"
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
            "url": "https://picklemastertw.com/techniques"
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
                    "url": "https://picklemastertw.com/newcomer-guide",
                    "name": "新手匹克球入門指南",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "新手懶人包", "item": "https://picklemastertw.com/newcomer-guide" }
                    ]
                }
            ]
        }
    },
    newcomer: {
        title: '第一次打匹克球就上手 - 台灣新手懶人包 | 費用試算 & 入門指南',
        description: '想打匹克球但不知道從何開始？專為台灣新手設計的懶人包。互動式預算試算（球拍/場地費）、羽球轉匹克球技巧分析、甚至幫你判斷適不適合這項運動。不用爬文，這一頁就夠！',
        keywords: '匹克球新手,匹克球入門,匹克球費用,匹克球拍價格,羽球轉匹克球,網球轉匹克球,匹克球教學,台灣匹克球',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.com/newcomer#webpage",
                    "url": "https://picklemastertw.com/newcomer",
                    "name": "新手匹克球入門指南",
                    "isPartOf": { "@id": "https://picklemastertw.com/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.com/" },
                        { "@type": "ListItem", "position": 2, "name": "新手專區", "item": "https://picklemastertw.com/newcomer" },
                        { "@type": "ListItem", "position": 3, "name": "新手懶人包", "item": "https://picklemastertw.com/newcomer" }
                    ]
                },
                {
                    "@type": "HowTo",
                    "name": "新手匹克球入門指南",
                    "description": "完整的台灣匹克球新手入門攻略，包含費用試算、規則教學與裝備選購",
                    "step": [
                        { "@type": "HowToStep", "position": 1, "name": "自我評估", "text": "確認自己是否適合匹克球運動（如有羽球背景、想找低負擔運動）" },
                        { "@type": "HowToStep", "position": 2, "name": "預算規劃", "text": "透過費用計算機評估入門成本（球拍、場地費）" },
                        { "@type": "HowToStep", "position": 3, "name": "學習規則", "text": "掌握雙彈跳、廚房區等核心規則" },
                        { "@type": "HowToStep", "position": 4, "name": "尋找球場", "text": "搜尋住家附近的匹克球場地" }
                    ]
                }
            ]
        }
    }
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
            const canonicalUrl = `${BASE_URL}/${route}`;
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
            const canonical = `${BASE_URL}/training-programs/${p.slug}`;
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
            const canonical = `${BASE_URL}/players/${p.slug}`;
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
                const canonical = `${BASE_URL}/paddles/${pd.slug}`;
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
        for (const a of ARTICLE_SLUGS) {
            const dirPath = path.join(BUILD_DIR, 'articles', a.slug);
            fs.mkdirSync(dirPath, { recursive: true });
            const title = `${a.title} | 匹克球深度專欄`;
            const desc = a.summary;
            const canonical = `${BASE_URL}/articles/${a.slug}`;
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
                "datePublished": "2026-04-25"
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

        // ===== Generate per-technique pages =====
        console.log('Generating technique detail pages...');
        for (const t of TECHNIQUE_SLUGS) {
            const dirPath = path.join(BUILD_DIR, 'techniques', t.slug);
            fs.mkdirSync(dirPath, { recursive: true });
            const title = `${t.name} (${t.nameEn}) 完整教學 | 匹克球技巧百科`;
            const desc = `${t.tagline} — 深度步驟分解、常見錯誤、練習菜單與職業選手心法。`;
            const canonical = `${BASE_URL}/techniques/${t.slug}`;
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
        let indexPageCount = 0;
        for (const page of INDEX_PAGES) {
            const filePath = path.join(BUILD_DIR, page.route, 'index.html');
            if (!fs.existsSync(filePath)) continue;
            let content = fs.readFileSync(filePath, 'utf-8');
            const body = `
        <p style="font-size:17px;color:#4b5563;margin:0 0 24px;">${esc(page.intro)}</p>
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">完整列表（${page.items.length}）</h2>
          <ul style="margin:0;padding-left:20px;font-size:15px;">${page.items.map(it => `<li style="margin-bottom:8px;"><a href="${it.href}" style="color:#0d9488;font-weight:600;">${esc(it.label)}</a>${it.sub ? `<br><span style="color:#6b7280;font-size:13px;">${esc(it.sub)}</span>` : ''}</li>`).join('')}</ul>
        </section>
        <p style="font-size:15px;">${page.foot}</p>`;
            content = injectPrerender(content, prerenderShell({
                crumbs: [{ name: '首頁', href: '/' }, { name: page.crumb }],
                h1: page.h1, bodyHtml: body,
            }));
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

        // ===== Generate per-court pages =====
        console.log('Generating court detail pages...');
        try {
            const courtsData = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'data', 'courts.json'), 'utf-8'));

            // --- SEO helpers（球場頁：預渲染內容 + 結構化資料，讓不執行 JS 的爬蟲/AI 引擎也讀得到）---
            const typeLabelOf = (t) => t === 'indoor' ? '室內' : t === 'covered' ? '風雨' : '戶外';
            const ownLabelOf = (o) => ({ public: '公營', private: '民營', school: '學校', community: '社區' }[o] || o || '');
            const courtIs24h = (h) => /24\s*小時/.test(h || '');
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
                const canonical = `${BASE_URL}/courts/court-${court.id}`;
                const typeLabel = typeLabelOf(court.type);
                const faqs = buildCourtFaqs(court);
                const crumbs = [
                    { "@type": "ListItem", "position": 1, "name": "首頁", "item": BASE_URL + "/" },
                    { "@type": "ListItem", "position": 2, "name": "球場地圖", "item": BASE_URL + "/courts" },
                ];
                if (citySlug) crumbs.push({ "@type": "ListItem", "position": 3, "name": `${city}匹克球場`, "item": `${BASE_URL}/courts/${citySlug}` });
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
                            "openingHours": court.opening_hours,
                            "isAccessibleForFree": court.fee === 'free',
                            "priceRange": court.fee === 'free' ? '免費' : (court.price || '付費'),
                            "url": canonical,
                            "hasMap": `https://www.google.com/maps/search/?api=1&query=${court.location.lat},${court.location.lng}`,
                            ...(court.contact ? { "telephone": court.contact } : {}),
                            ...(court.facilities && court.facilities.length ? { "amenityFeature": court.facilities.map(f => ({ "@type": "LocationFeatureSpecification", "name": f, "value": true })) } : {}),
                            ...(court.last_updated ? { "dateModified": court.last_updated } : {}),
                            ...(court.iplay && court.iplay.transit ? { "publicTransportInformation": court.iplay.transit } : {}),
                            ...(court.iplay && court.iplay.website ? { "sameAs": court.iplay.website } : {}),
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
                const title = `${court.name}｜${city}${district}匹克球場・${typeLabel}${court.courts_count}面${feeLabel} | 地址、開放時間、導航`;
                const desc = `${court.name}位於${court.location.address}，為${typeLabel}${feeLabel}匹克球場，共 ${court.courts_count} 面。開放時間：${court.opening_hours || '依現場公告'}。${court.fee !== 'free' && court.price ? `費用：${court.price}。` : ''}${court.facilities && court.facilities.length ? `設施：${court.facilities.slice(0, 4).join('、')}。` : ''}提供 GPS 開車導航與大眾運輸路線，${city}打匹克球的完整場地資訊。`;
                const canonical = `${BASE_URL}/courts/${slug}`;
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
                const desc = `${city}匹克球場完整攻略：免費場 ${free} 座、室內場 ${indoor} 座${open24 ? `、24 小時場 ${open24} 座` : ''}，共 ${cityCourts.length} 座場地。地址、開放時間、費用、特色一次看，附 GPS 導航。`;
                const canonical = `${BASE_URL}/courts/${slug}`;
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
                                "url": `${BASE_URL}/courts/court-${c.id}`
                            }))
                        },
                        {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                { "@type": "ListItem", "position": 1, "name": "首頁", "item": BASE_URL + "/" },
                                { "@type": "ListItem", "position": 2, "name": "球場地圖", "item": BASE_URL + "/courts" },
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
        } catch (e) {
            console.warn('  Skip per-court generation:', e.message);
        }

        // Generate Sitemap.xml (2026 enhanced)
        console.log('Generating sitemap.xml...');
        const today = new Date().toISOString().split('T')[0];
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
            newcomer: { p: '0.7', f: 'monthly' },
        };

        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>${BASE_URL}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>`;

        for (const route of Object.keys(pageSEO)) {
            const meta = priorityMap[route] || { p: '0.7', f: 'monthly' };
            sitemapContent += `
    <url>
        <loc>${BASE_URL}/${route}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${meta.f}</changefreq>
        <priority>${meta.p}</priority>
    </url>`;
        }

        // Add per-program URLs
        for (const p of PROGRAM_SLUGS) {
            sitemapContent += `
    <url>
        <loc>${BASE_URL}/training-programs/${p.slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.85</priority>
    </url>`;
        }

        // Add per-player URLs
        for (const p of PLAYER_SLUGS) {
            sitemapContent += `
    <url>
        <loc>${BASE_URL}/players/${p.slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.85</priority>
    </url>`;
        }

        // Add per-paddle URLs
        for (const pd of PADDLE_SLUGS) {
            sitemapContent += `
    <url>
        <loc>${BASE_URL}/paddles/${pd.slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        }

        // Add per-article URLs
        for (const a of ARTICLE_SLUGS) {
            sitemapContent += `
    <url>
        <loc>${BASE_URL}/articles/${a.slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>`;
        }

        // Add per-technique URLs
        for (const t of TECHNIQUE_SLUGS) {
            sitemapContent += `
    <url>
        <loc>${BASE_URL}/techniques/${t.slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.85</priority>
    </url>`;
        }

        // Add city hub URLs
        try {
            const courtsData = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'data', 'courts.json'), 'utf-8'));
            for (const { slug, city } of CITY_SLUG_MAP) {
                if (!courtsData.courts.some(c => c.location.city === city)) continue;
                sitemapContent += `
    <url>
        <loc>${BASE_URL}/courts/${slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.95</priority>
    </url>`;
            }
        } catch (e) { /* skip if missing */ }

        // Add per-court URLs
        try {
            const courtsData = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'data', 'courts.json'), 'utf-8'));
            for (const court of courtsData.courts) {
                sitemapContent += `
    <url>
        <loc>${BASE_URL}/courts/court-${court.id}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
            }
        } catch (e) { /* skip if missing */ }

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
