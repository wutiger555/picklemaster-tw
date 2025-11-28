const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_DIR = path.join(__dirname, '../docs');
const BASE_URL = 'https://picklemastertw.site';

// SEO Data (Copied from src/utils/seo.ts)
// Note: In a real build environment, we might want to import this from src directly,
// but for this script, we keep a copy to avoid TS compilation complexity in this simple script.
const pageSEO = {
  home: {
    title: '匹克球台灣 | Picklemaster Taiwan - 台灣首選匹克球入口網',
    description: '專為台灣打造的匹克球學習平台，提供全台匹克球場地圖、互動式規則教學、新手入門指南。搜尋匹克球、匹克球台灣的首選網站。',
    keywords: '匹克球,匹克球台灣,台灣匹克球,Picklemaster Taiwan,匹克球入門,匹克球規則'
  },
  courts: {
    title: '台灣匹克球場地圖 | 尋找附近的匹克球場',
    description: '收錄全台最完整的匹克球場資訊！台北、台中、高雄、台南匹克球場一網打盡。提供詳細地址、開放時間與收費資訊，讓您輕鬆找到打球好去處。',
    keywords: '台灣匹克球場,匹克球場,台北匹克球場,台中匹克球場,高雄匹克球場,台南匹克球場,新北匹克球場,匹克球場地圖'
  },
  rules: {
    title: '匹克球規則完整教學 | 雙彈跳、廚房區詳解',
    description: '最清楚的匹克球規則教學！圖解雙彈跳規則、廚房區（Non-Volley Zone）限制、發球與計分方式。新手必看的匹克球規則懶人包。',
    keywords: '匹克球規則,匹克球教學,雙彈跳規則,廚房區,匹克球計分,匹克球發球'
  },
  equipment: {
    title: '匹克球裝備推薦 | 握拍、球拍選購指南',
    description: '工欲善其事，必先利其器。專業匹克球裝備選購指南，教您如何選擇適合的匹克球拍、握把尺寸與運動裝備。',
    keywords: '匹克球裝備,匹克球拍,握拍,匹克球拍推薦,匹克球鞋'
  },
  'learning-paths': {
    title: '匹克球教學課程 | 從零開始學匹克球',
    description: '系統化的匹克球教學課程，涵蓋握拍姿勢、發球技巧、接發球策略到進階戰術。適合所有程度的匹克球愛好者。',
    keywords: '匹克球教學,匹克球課程,握拍教學,匹克球技巧,匹克球戰術,匹克球教練'
  },
  learning: {
    title: '匹克球技巧與戰術 | 廚房區攻防與第三球策略',
    description: '深入解析匹克球實戰技巧！掌握廚房區（Kitchen）攻防、第三球落點（Third Shot Drop）與截擊技術，提升您的比賽實力。',
    keywords: '匹克球技巧,匹克球戰術,匹克球廚房,第三球,匹克球截擊,匹克球教學'
  },
  game: {
    title: '匹克球互動遊戲 | 線上模擬體驗',
    description: '透過趣味的線上互動遊戲，熟悉匹克球規則與判斷。在遊戲中學習雙彈跳、界內界外判斷，寓教於樂。',
    keywords: '匹克球遊戲,匹克球模擬,線上匹克球'
  },
  scorer: {
    title: '匹克球計分器 | 比賽專用計分工具',
    description: '好用的匹克球計分小幫手，支援單雙打計分、發球順序提示。讓您專注比賽，不再忘記比分。',
    keywords: '匹克球計分器,匹克球計分,比賽計分'
  },
  resources: {
    title: '匹克球學習資源 | 影片、社群與協會資訊',
    description: '彙整豐富的匹克球學習資源，包含教學影片、台灣匹克球協會資訊、各地球隊與社群連結。',
    keywords: '匹克球資源,匹克球影片,台灣匹克球協會,匹克球社團'
  },
  about: {
    title: '關於 Picklemaster Taiwan | 推廣台灣匹克球運動',
    description: 'Picklemaster Taiwan 致力於推廣匹克球運動在台灣的發展，建立友善的學習平台與社群，讓更多人愛上這項有趣的運動。',
    keywords: '匹克球推廣,Picklemaster Taiwan,關於我們'
  },
  faq: {
    title: '匹克球常見問題 FAQ | 解決您的所有疑問',
    description: '整理匹克球新手最常遇到的問題，從規則疑難雜症到裝備保養，這裡都有解答。',
    keywords: '匹克球FAQ,匹克球常見問題,匹克球問答'
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

        // Sitemap XML content
        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Process each route
        for (const [route, seo] of Object.entries(pageSEO)) {
            const isHome = route === 'home';
            const urlPath = isHome ? '' : route;
            const fullUrl = `${BASE_URL}/${urlPath}`;

            console.log(`Generating static page for route: /${urlPath}`);

            // For home, we update the root index.html directly
            // For others, we create a directory
            let targetFile;

            if (isHome) {
                targetFile = templatePath;
            } else {
                const dirPath = path.join(BUILD_DIR, urlPath);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }
                targetFile = path.join(dirPath, 'index.html');
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
            const canonicalUrl = fullUrl;
            // Check if canonical tag exists, if not add it
            if (content.includes('<link rel="canonical"')) {
                 content = content.replace(
                    /<link rel="canonical" href=".*?" \/>/,
                    `<link rel="canonical" href="${canonicalUrl}" />`
                );
            } else {
                content = content.replace(
                    /<\/head>/,
                    `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`
                );
            }


            // Replace OG Tags (Basic replacement, relies on existing tags in template)
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

            // Write file
            fs.writeFileSync(targetFile, content);

            // Add to Sitemap
            sitemapContent += `
  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${isHome ? 'daily' : 'weekly'}</changefreq>
    <priority>${isHome ? '1.0' : '0.8'}</priority>
  </url>`;
        }

        // Finish Sitemap
        sitemapContent += `
</urlset>`;

        fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), sitemapContent);
        console.log('Sitemap generated successfully!');

        console.log('Static page generation completed successfully!');

    } catch (error) {
        console.error('Error generating static pages:', error);
        process.exit(1);
    }
}

generateStaticPages();
