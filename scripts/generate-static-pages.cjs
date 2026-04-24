const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_DIR = path.join(__dirname, '../docs');
const BASE_URL = 'https://picklemastertw.site';

// SEO Data (Copied from src/utils/seo.ts)
const pageSEO = {
    courts: {
        title: '全台匹克球場地圖 2025 » GPS 一鍵找球場、免費/室內場地查詢',
        description: '不用再問哪裡可以打球了！收錄台灣 55+ 個匹克球場資訊。支援 GPS 定位搜尋最近球場，篩選室內冷氣、免費場地、風雨球場。台北、台中、高雄球場全收錄。',
        keywords: '匹克球場,台灣匹克球場,匹克球場地圖,台北匹克球場,台中匹克球場,高雄匹克球場,台南匹克球場,新北匹克球場,桃園匹克球場,免費匹克球場,室內匹克球場,戶外匹克球場,匹克球場推薦,匹克球場預約,pickleball court taiwan,pickle day,社區匹克球場,河濱匹克球場,大安森林公園匹克球,匹克球場地,附近匹克球場,最近匹克球場',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.site/courts#webpage",
                    "url": "https://picklemastertw.site/courts",
                    "name": "台灣匹克球場地圖 2025 | 全台 55+ 球場完整資訊",
                    "description": "2025年台灣最完整的匹克球場地圖！GPS 定位找最近球場、篩選室內/戶外/免費場地。",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" },
                    "inLanguage": "zh-TW"
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "找球場", "item": "https://picklemastertw.site/courts" }
                    ]
                },
                {
                    "@type": "SportsActivityLocation",
                    "name": "台灣匹克球場地圖",
                    "description": "提供全台灣超過55個匹克球場的詳細資訊與地圖",
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
                    "@id": "https://picklemastertw.site/rules#webpage",
                    "url": "https://picklemastertw.site/rules",
                    "name": "3分鐘學會匹克球！超簡單 3D 互動規則教學",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "新手專區", "item": "https://picklemastertw.site/newcomer" },
                        { "@type": "ListItem", "position": 3, "name": "規則教學", "item": "https://picklemastertw.site/rules" }
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
        title: '匹克球拍怎麼選？2025 新手裝備懶人包：職業選手也推薦',
        description: '買錯球拍最貴！完整匹克球拍材質分析（碳纖維 vs 玻璃纖維）、重量挑選指南。內含「球拍智能推薦系統」，30秒找出最適合你的命定球拍。',
        keywords: '匹克球拍,pickleball paddle,匹克球裝備,球拍推薦,匹克球拍推薦,碳纖維球拍,玻璃纖維球拍,匹克球用品,匹克球裝備購買',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.site/equipment#webpage",
                    "url": "https://picklemastertw.site/equipment",
                    "name": "匹克球拍選購指南",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "裝備指南", "item": "https://picklemastertw.site/equipment" }
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
                            "offers": { "@type": "AggregateOffer", "priceCurrency": "TWD", "lowPrice": "2000", "highPrice": "4000", "availability": "https://schema.org/InStock" }
                        },
                        {
                            "@type": "Product",
                            "position": 2,
                            "name": "中階級匹克球拍",
                            "description": "玻璃纖維材質，適合中級球員，提供良好的控球性和力量",
                            "category": "匹克球拍",
                            "offers": { "@type": "AggregateOffer", "priceCurrency": "TWD", "lowPrice": "4000", "highPrice": "8000", "availability": "https://schema.org/InStock" }
                        },
                        {
                            "@type": "Product",
                            "position": 3,
                            "name": "高階級碳纖維匹克球拍",
                            "description": "職業級碳纖維材質，輕量化設計，提供最佳性能表現",
                            "category": "匹克球拍",
                            "offers": { "@type": "AggregateOffer", "priceCurrency": "TWD", "lowPrice": "8000", "highPrice": "15000", "availability": "https://schema.org/InStock" }
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
                    "@id": "https://picklemastertw.site/learning-paths#webpage",
                    "url": "https://picklemastertw.site/learning-paths",
                    "name": "匹克球完整學習課程",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "學習路徑", "item": "https://picklemastertw.site/learning-paths" }
                    ]
                },
                {
                    "@type": "Course",
                    "name": "匹克球完整學習課程",
                    "description": "從新手到進階的系統化匹克球學習路徑",
                    "provider": { "@type": "Organization", "name": "Picklemaster Taiwan", "url": "https://picklemastertw.site" },
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
                    "@id": "https://picklemastertw.site/learning#webpage",
                    "url": "https://picklemastertw.site/learning",
                    "name": "匹克球互動技巧教學",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "實戰技巧", "item": "https://picklemastertw.site/learning" }
                    ]
                },
                {
                    "@type": "Course",
                    "name": "匹克球互動技巧教學",
                    "description": "3D互動式匹克球教學，包含站位、球路分析",
                    "provider": { "@type": "Organization", "name": "Picklemaster Taiwan", "url": "https://picklemastertw.site" }
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
                    "@id": "https://picklemastertw.site/game#webpage",
                    "url": "https://picklemastertw.site/game",
                    "name": "Pickle Master 互動遊戲",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "互動遊戲", "item": "https://picklemastertw.site/game" }
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
                    "@id": "https://picklemastertw.site/scorer#webpage",
                    "url": "https://picklemastertw.site/scorer",
                    "name": "專業匹克球計分器",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "計分器", "item": "https://picklemastertw.site/scorer" }
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
                    "@id": "https://picklemastertw.site/resources#webpage",
                    "url": "https://picklemastertw.site/resources",
                    "name": "匹克球學習資源彙整",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "資源中心", "item": "https://picklemastertw.site/resources" }
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
                    "@id": "https://picklemastertw.site/about#webpage",
                    "url": "https://picklemastertw.site/about",
                    "name": "關於 Picklemaster Taiwan",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "更多", "item": "" },
                        { "@type": "ListItem", "position": 3, "name": "關於我們", "item": "https://picklemastertw.site/about" }
                    ]
                },
                {
                    "@type": "Organization",
                    "name": "Picklemaster Taiwan",
                    "url": "https://picklemastertw.site",
                    "logo": "https://picklemastertw.site/logo.png"
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
                    "@id": "https://picklemastertw.site/faq#webpage",
                    "url": "https://picklemastertw.site/faq",
                    "name": "匹克球常見問題",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "新手專區", "item": "https://picklemastertw.site/newcomer" },
                        { "@type": "ListItem", "position": 3, "name": "常見問題", "item": "https://picklemastertw.site/faq" }
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
                    "@id": "https://picklemastertw.site/pro-players#webpage",
                    "url": "https://picklemastertw.site/pro-players",
                    "name": "世界頂尖匹克球選手",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "裝備與攻略", "item": "https://picklemastertw.site/equipment" },
                        { "@type": "ListItem", "position": 3, "name": "頂尖選手", "item": "https://picklemastertw.site/pro-players" }
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
    tournaments: {
        title: '2026 台灣匹克球賽事總覽 | CTPF 全年認證賽、國際積分賽',
        description: '完整掌握 2026 台灣匹克球賽事：臺灣盃、NAPA 盃、港都盃、中正盃、噶瑪蘭盃、臺北公開賽、APG 亞洲賽。報名時間、場地、組別、獎金一次看。',
        keywords: '2026匹克球賽事,台灣匹克球比賽,CTPF賽事,臺灣盃匹克球,NAPA盃,港都盃,中正盃,噶瑪蘭盃,臺北匹克球公開賽,APG 亞洲匹克球運動會,匹克球錦標賽,匹克球報名',
        structuredData: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": "https://picklemastertw.site/tournaments#webpage",
                    "url": "https://picklemastertw.site/tournaments",
                    "name": "2026 台灣匹克球賽事總覽",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "2026 賽事", "item": "https://picklemastertw.site/tournaments" }
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
                    "@id": "https://picklemastertw.site/glossary#webpage",
                    "url": "https://picklemastertw.site/glossary",
                    "name": "匹克球術語大全",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "術語字典", "item": "https://picklemastertw.site/glossary" }
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
                    "@id": "https://picklemastertw.site/ratings#webpage",
                    "url": "https://picklemastertw.site/ratings",
                    "name": "DUPR 評級指南 2026",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "DUPR 評級", "item": "https://picklemastertw.site/ratings" }
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
            "url": "https://picklemastertw.site/articles"
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
            "url": "https://picklemastertw.site/techniques"
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
                    "@id": "https://picklemastertw.site/newcomer-guide#webpage",
                    "url": "https://picklemastertw.site/newcomer-guide",
                    "name": "新手匹克球入門指南",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "新手懶人包", "item": "https://picklemastertw.site/newcomer-guide" }
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
                    "@id": "https://picklemastertw.site/newcomer#webpage",
                    "url": "https://picklemastertw.site/newcomer",
                    "name": "新手匹克球入門指南",
                    "isPartOf": { "@id": "https://picklemastertw.site/#website" }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://picklemastertw.site/" },
                        { "@type": "ListItem", "position": 2, "name": "新手專區", "item": "https://picklemastertw.site/newcomer" },
                        { "@type": "ListItem", "position": 3, "name": "新手懶人包", "item": "https://picklemastertw.site/newcomer" }
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

// Players (per-slug static pages) — minimal subset for SEO
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
    { slug: '2026-best-pickleball-paddles', title: '2026 十大匹克球拍完整評測', summary: '2026 年十大熱門匹克球拍完整評測：JOOLA Perseus Pro IV、Selkirk Labs Project 002、Paddletek Bantam TS-5 等頂級選手愛用款。', category: '器材評測' },
    { slug: 'pickleball-vs-tennis-badminton-padel', title: '匹克球 vs 網球 vs 羽球 vs Padel 完整比較', summary: '四大拍類運動一次看懂：場地、難度、體能、社群文化。', category: '比較分析' },
    { slug: '2026-best-pickleball-shoes', title: '2026 最佳匹克球鞋選購指南', summary: '匹克球專用鞋 vs 網球鞋 vs 羽球鞋完整比較。2026 Top 8 匹克球鞋實測。', category: '器材評測' },
    { slug: 'indoor-vs-outdoor-balls', title: '匹克球室內球 vs 戶外球全解析', summary: '26 孔還是 40 孔？設計差異、球速、彈跳、耐用度、主流品牌實測。', category: '器材評測' },
    { slug: 'pickleball-injury-prevention', title: '匹克球傷害預防完整指南', summary: '5 大常見傷害（匹克球肘、膝蓋、腳踝、肩膀、眼睛）的成因、預防、應對方法。', category: '運動科學' },
    { slug: 'senior-pickleball-guide', title: '50+ 歲銀髮族匹克球入門完全指南', summary: '50+ 歲銀髮族匹克球入門完全指南：健康好處、裝備選擇、運動頻率建議。', category: '族群指南' },
    { slug: 'doubles-vs-singles', title: '匹克球雙打 vs 單打完整對照', summary: '規則差異、站位、戰術、體能消耗、適合族群。95% 球友打雙打的真正原因。', category: '技術戰術' },
    { slug: 'pickleball-nutrition-fitness', title: '匹克球選手的營養與體能訓練', summary: '賽前吃什麼、補水策略、重訓菜單、職業選手作息範例。', category: '運動科學' },
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

            // Replace Meta Description
            content = content.replace(
                /<meta name="description" content=".*?" \/>/,
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
            content = content.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${desc}" />`);
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
            fs.writeFileSync(path.join(dirPath, 'index.html'), content);
        }
        console.log(`  Generated ${PLAYER_SLUGS.length} player detail pages`);

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
            content = content.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${desc}" />`);
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
                "publisher": { "@type": "Organization", "name": "Picklemaster Taiwan", "logo": { "@type": "ImageObject", "url": "https://picklemastertw.site/android-chrome-v2-512x512.png" } },
                "mainEntityOfPage": canonical,
                "datePublished": "2026-04-25"
            };
            content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`);
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
            content = content.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${desc}" />`);
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
            fs.writeFileSync(path.join(dirPath, 'index.html'), content);
        }

        // ===== Generate per-court pages =====
        console.log('Generating court detail pages...');
        try {
            const courtsData = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'data', 'courts.json'), 'utf-8'));
            for (const court of courtsData.courts) {
                const slug = `court-${court.id}`;
                const dirPath = path.join(BUILD_DIR, 'courts', slug);
                fs.mkdirSync(dirPath, { recursive: true });
                const title = `${court.name} | ${court.location.city}${court.location.district || ''}匹克球場資訊`;
                const desc = `${court.name}位於${court.location.address}，${court.type === 'indoor' ? '室內' : '戶外'}場、${court.courts_count}面、${court.fee === 'free' ? '免費' : court.price || '付費'}。`;
                const canonical = `${BASE_URL}/courts/${slug}`;
                let content = template;
                content = content.replace(/<title>.*<\/title>/, `<title>${title}</title>`);
                content = content.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${desc}" />`);
                content = content.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
                content = content.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
                content = content.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
                content = content.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
                const ldJson = {
                    "@context": "https://schema.org", "@type": "SportsActivityLocation",
                    "name": court.name, "sport": "Pickleball",
                    "address": { "@type": "PostalAddress", "streetAddress": court.location.address, "addressLocality": court.location.district, "addressRegion": court.location.city, "addressCountry": "TW" },
                    "geo": { "@type": "GeoCoordinates", "latitude": court.location.lat, "longitude": court.location.lng },
                    "openingHours": court.opening_hours,
                    "isAccessibleForFree": court.fee === 'free',
                    "url": canonical
                };
                content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(ldJson)}</script>`);
                fs.writeFileSync(path.join(dirPath, 'index.html'), content);
            }
            console.log(`  Generated ${courtsData.courts.length} court detail pages`);
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

        console.log('Static page generation completed successfully!');
    } catch (error) {
        console.error('Error generating static pages:', error);
        process.exit(1);
    }
}

generateStaticPages();
