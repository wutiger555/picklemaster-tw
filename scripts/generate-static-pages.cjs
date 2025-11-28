const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_DIR = path.join(__dirname, '../docs');
const BASE_URL = 'https://picklemastertw.site';

// SEO Data (Copied from src/utils/seo.ts)
const pageSEO = {
    courts: {
        title: '台灣匹克球場地圖 | 55+球場完整資訊 - 台北台中高雄台南',
        description: '台灣最完整的匹克球場地圖！收錄台北、新北、台中、高雄、台南等全台55+個匹克球場。提供詳細地址、開放時間、室內/室外、收費資訊。搜尋離你最近的匹克球場，立即開始打球！',
        keywords: '匹克球場,台灣匹克球場,匹克球場地圖,台北匹克球場,台中匹克球場,高雄匹克球場,台南匹克球場,新北匹克球場,桃園匹克球場,pickleball court taiwan'
    },
    rules: {
        title: '匹克球規則完整教學 | 互動式3D規則說明 - 雙彈跳、廚房區詳解',
        description: '互動式匹克球規則教學！3D視覺化學習雙彈跳規則、廚房區（Non-Volley Zone）、對角發球等核心規則。包含互動球場點擊教學、球路徑動畫展示，讓你快速掌握匹克球規則。新手必看！',
        keywords: '匹克球規則,pickleball rules,匹克球雙彈跳,匹克球廚房區,匹克球發球規則,匹克球計分,匹克球界線,匹克球教學,匹克球入門'
    },
    equipment: {
        title: '匹克球裝備推薦 | 球拍選購指南、職業選手裝備分析',
        description: '專業匹克球裝備選購指南！詳細球拍材質分析（碳纖維、玻璃纖維、複合材質）、重量平衡點說明、握把尺寸選擇。包含職業選手裝備推薦、球拍對比工具、智能推薦系統，幫你找到最適合的匹克球拍！',
        keywords: '匹克球拍,pickleball paddle,匹克球裝備,球拍推薦,匹克球拍推薦,碳纖維球拍,玻璃纖維球拍,匹克球用品,匹克球裝備購買'
    },
    'learning-paths': {
        title: '匹克球學習路徑 | 新手到進階完整課程 - 系統化學習',
        description: '完整的匹克球學習路徑！從新手入門到進階高手，系統化課程包含基礎握拍、發球技巧、正反手擊球、截擊技術、戰術運用。適合初學者、中級球員、進階選手的分級學習內容。',
        keywords: '匹克球教學,匹克球課程,匹克球學習,匹克球訓練,匹克球入門,匹克球技巧,匹克球戰術,pickleball training,pickleball lesson'
    },
    learning: {
        title: '匹克球技巧教學 | 3D互動教學、球路分析、站位指導',
        description: '專業匹克球技巧教學平台！提供3D球場配置教學、360度站位指導、球路徑動畫分析。包含發球技巧、接發球技術、第三球策略、網前截擊等實戰技巧。互動式學習讓你快速進步！',
        keywords: '匹克球技巧,匹克球教學,匹克球訓練,匹克球發球,匹克球截擊,匹克球戰術,匹克球策略,pickleball technique'
    },
    game: {
        title: '匹克球互動遊戲 | 線上練習、規則模擬 - 在遊戲中學習',
        description: '真實模擬匹克球規則的互動遊戲！包含雙彈跳規則、廚房區限制、對角發球等完整規則。透過遊戲學習實戰技巧，熟悉比賽節奏。支援鍵盤操作，隨時隨地練習匹克球！',
        keywords: '匹克球遊戲,pickleball game,匹克球練習,匹克球模擬,線上匹克球,匹克球訓練遊戲'
    },
    scorer: {
        title: '匹克球計分器 | 專業比賽計分工具 - 支援單雙打、音效提示',
        description: '專業的匹克球計分器！支援單打、雙打計分，自動追蹤發球方、發球員編號。包含音效提示、震動反饋、比賽計時、歷史記錄。全螢幕模式適合實戰使用，手機平板完美支援！',
        keywords: '匹克球計分器,pickleball scorer,匹克球計分,比賽計分,匹克球裁判,匹克球比分'
    },
    resources: {
        title: '匹克球學習資源 | 官方組織、YouTube頻道、社群推薦',
        description: '精選匹克球學習資源！包含台灣匹克球協會等官方組織、Pickleball Kitchen等優質YouTube教學頻道、台灣匹克球社團等活躍社群。提供推薦書籍、影片教學、賽事資訊等完整資源。',
        keywords: '匹克球資源,匹克球影片,匹克球YouTube,台灣匹克球協會,匹克球社團,匹克球書籍,pickleball resources'
    },
    about: {
        title: '關於匹克球台灣 | Picklemaster Taiwan - 推廣台灣匹克球運動',
        description: 'Picklemaster Taiwan 致力於推廣台灣匹克球運動，提供完整的學習與社群平台。我們的使命是讓每個人都能享受匹克球的樂趣，透過降低入門門檻、提供完整資源、建立社群網絡，推動匹克球成為台灣主流運動。',
        keywords: '匹克球台灣,台灣匹克球,picklemaster taiwan,匹克球推廣,匹克球社群,台灣運動'
    },
    faq: {
        title: '匹克球常見問題 | 規則、裝備、場地疑問解答',
        description: '匹克球常見問題懶人包！彙整新手最常問的規則疑問、裝備選擇建議、場地資訊查詢等問題。什麼是雙彈跳？如何選擇球拍？哪裡可以打球？這裡都有解答！',
        keywords: '匹克球FAQ,匹克球問題,匹克球疑問,匹克球規則問題,匹克球新手問題'
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
