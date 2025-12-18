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
    },
    equipment: {
        title: '匹克球拍怎麼選？2025 新手裝備懶人包：職業選手也推薦',
        description: '買錯球拍最貴！完整匹克球拍材質分析（碳纖維 vs 玻璃纖維）、重量挑選指南。內含「球拍智能推薦系統」，30秒找出最適合你的命定球拍。',
        keywords: '匹克球拍,pickleball paddle,匹克球裝備,球拍推薦,匹克球拍推薦,碳纖維球拍,玻璃纖維球拍,匹克球用品,匹克球裝備購買',
        structuredData: {
            "@context": "https://schema.org",
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
    },
    'learning-paths': {
        title: '匹克球從 0 到 100：新手入門 → 高手進階完整學習地圖',
        description: '別在那裡亂打！系統化匹克球課程，從握拍發球到高階戰術（Third Shot Drop）。分級學習路徑，帶你一步步成為匹克球高手。免費開始學習！',
        keywords: '匹克球教學,匹克球課程,匹克球學習,匹克球訓練,匹克球入門,匹克球技巧,匹克球戰術,pickleball training,pickleball lesson',
        structuredData: {
            "@context": "https://schema.org",
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
    },
    learning: {
        title: '匹克球實戰技巧 | 3D 球路分析 & 360 度站位教學',
        description: '想變強必看！提供 3D 球場戰術板教學、職業選手球路分析。發球致勝技巧、第三球各種打法、網前截擊反應訓練。互動式內容讓你觀念大升級。',
        keywords: '匹克球技巧,匹克球教學,匹克球訓練,匹克球發球,匹克球截擊,匹克球戰術,匹克球策略,pickleball technique',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "匹克球互動技巧教學",
            "description": "3D互動式匹克球教學，包含站位、球路分析",
            "provider": { "@type": "Organization", "name": "Picklemaster Taiwan", "url": "https://picklemastertw.site" }
        }
    },
    game: {
        title: '免費玩！Pickle Master 匹克球 3D 互動遊戲 - 邊玩邊學規則',
        description: '無聊嗎？來場線上匹克球對戰！真實物理引擎模擬，在遊戲中熟悉雙彈跳與截擊時機。免下載直接玩，挑戰最高分！',
        keywords: '匹克球遊戲,pickleball game,匹克球練習,匹克球模擬,線上匹克球,匹克球訓練遊戲',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Pickle Master 互動遊戲",
            "applicationCategory": "Game",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0" }
        }
    },
    scorer: {
        title: '專業匹克球計分器 (App 免下載) - 支援單雙打 & 語音報分',
        description: '打球不再忘記比分！最受好評的線上計分板。全螢幕大字體、支援語音報分、發球方提示。手機就是最好的裁判，完全免費使用。',
        keywords: '匹克球計分器,pickleball scorer,匹克球計分,比賽計分,匹克球裁判,匹克球比分',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "匹克球專業計分器",
            "applicationCategory": "SportsApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": { "@type": "Offer", "price": "0" }
        }
    },
    resources: {
        title: '匹克球資源中心 | 台灣球隊、俱樂部、YouTube 頻道總整理',
        description: '找不到球友？這裡有全台匹克球社團與俱樂部名單。精選國內外優質 YouTube 教學頻道、必讀書籍推薦。加入台灣最熱情的匹克球社群！',
        keywords: '匹克球資源,匹克球影片,匹克球YouTube,台灣匹克球協會,匹克球社團,匹克球書籍,pickleball resources',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "匹克球學習資源彙整",
            "description": "彙整台灣匹克球相關資源、社群、教學頻道"
        }
    },
    about: {
        title: '關於 Picklemaster Taiwan | 我們的使命與故事',
        description: 'Picklemaster Taiwan 是由一群熱愛匹克球的工程師與球友共同打造。我們致力於推廣台灣匹克球運動，透過科技讓學習更有趣、找球場更方便。',
        keywords: '匹克球台灣,台灣匹克球,picklemaster taiwan,匹克球推廣,匹克球社群,台灣運動',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Picklemaster Taiwan",
            "url": "https://picklemastertw.site",
            "logo": "https://picklemastertw.site/logo.png"
        }
    },
    faq: {
        title: '匹克球 FAQ 懶人包 | 新手最常問的 100 個問題',
        description: '什麼是雙彈跳？球拍要買哪一種？哪裡可以學球？匯整所有匹克球新手最想知道的問題，一次幫你解答。',
        keywords: '匹克球FAQ,匹克球問題,匹克球疑問,匹克球規則問題,匹克球新手問題',
        structuredData: {
            "@context": "https://schema.org",
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
    },
    'pro-players': {
        title: '世界頂尖匹克球選手排名 & 裝備解密 | Picklemaster Taiwan',
        description: '認識世界排名前十的匹克球職業選手。Ben Johns 用什麼球拍？Anna Leigh Waters 的必殺技是什麼？完整戰力分析與裝備大公開。',
        keywords: '匹克球選手,匹克球排名,Ben Johns,Anna Leigh Waters,匹克球職業選手,PPA巡迴賽,APP巡迴賽,匹克球球星',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "世界頂尖匹克球選手列表",
            "itemListElement": [
                { "@type": "Person", "position": 1, "name": "Ben Johns" },
                { "@type": "Person", "position": 2, "name": "Anna Leigh Waters" },
                { "@type": "Person", "position": 3, "name": "Tyson McGuffin" }
            ]
        }
    },
    newcomer: {
        title: '第一次打匹克球就上手 - 台灣新手懶人包 | 費用試算 & 入門指南',
        description: '想打匹克球但不知道從何開始？專為台灣新手設計的懶人包。互動式預算試算（球拍/場地費）、羽球轉匹克球技巧分析、甚至幫你判斷適不適合這項運動。不用爬文，這一頁就夠！',
        keywords: '匹克球新手,匹克球入門,匹克球費用,匹克球拍價格,羽球轉匹克球,網球轉匹克球,匹克球教學,台灣匹克球',
        structuredData: {
            "@context": "https://schema.org",
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
    }
};

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

        console.log('Static page generation completed successfully!');

    } catch (error) {
        console.error('Error generating static pages:', error);
        process.exit(1);
    }
}

generateStaticPages();
