// SEO 元數據配置
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  structuredData?: any;
}

// FAQ 結構化資料
export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "什麼是匹克球（Pickleball）？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "匹克球（Pickleball）是一項結合網球、羽毛球和乒乓球特點的球拍運動。使用類似乒乓球拍的實心球拍和有孔的塑膠球，在類似羽毛球大小的場地上進行。匹克球易學易玩，適合各年齡層，是美國成長最快的運動之一。"
      }
    },
    {
      "@type": "Question",
      "name": "台灣哪裡可以打匹克球？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "台灣目前有超過55個匹克球場，分佈在台北、新北、台中、高雄、台南等主要城市。包括公園運動中心、學校操場、私人球館等。您可以使用我們的球場地圖功能，搜尋離您最近的匹克球場。"
      }
    },
    {
      "@type": "Question",
      "name": "匹克球的基本規則是什麼？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "匹克球的核心規則包括：1) 雙彈跳規則 - 發球和接發球都必須讓球落地彈起後才能擊球；2) 廚房區（Non-Volley Zone）- 在網前7英尺區域內不能截擊；3) 對角發球 - 發球必須對角線發向對方場地；4) 計分制 - 只有發球方得分，通常打到11分（領先2分）獲勝。"
      }
    },
    {
      "@type": "Question",
      "name": "新手如何開始學習匹克球？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "新手入門建議：1) 先了解基本規則，可使用我們的互動式規則教學；2) 選擇適合的球拍，初學者建議選擇中等重量（7.5-8.5盎司）的球拍；3) 找離家近的球場練習；4) 加入本地匹克球社群，與球友交流學習；5) 觀看教學影片學習基本技巧。我們提供完整的新手學習路徑幫助您快速上手。"
      }
    }
  ]
};

// 本地商家結構化資料（針對台灣市場）
export const localBusinessStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://picklemastertw.site/#localbusiness",
  "name": "Picklemaster Taiwan",
  "alternateName": "匹克大師台灣",
  "description": "台灣最完整的匹克球學習平台與社群",
  "url": "https://picklemastertw.site/",
  "telephone": "",
  "priceRange": "免費",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "TW",
    "addressRegion": "台灣"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "23.5",
    "longitude": "121.0"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "台北市"
    },
    {
      "@type": "City",
      "name": "新北市"
    },
    {
      "@type": "City",
      "name": "台中市"
    },
    {
      "@type": "City",
      "name": "高雄市"
    },
    {
      "@type": "City",
      "name": "台南市"
    }
  ]
};

// 頁面 SEO 配置
export const pageSEO: Record<string, SEOConfig> = {
  home: {
    title: '匹克球台灣 | Picklemaster Taiwan - 台灣首選匹克球入口網',
    description: '專為台灣打造的匹克球學習平台，提供全台匹克球場地圖、互動式規則教學、新手入門指南。搜尋匹克球、匹克球台灣的首選網站。',
    keywords: '匹克球,匹克球台灣,台灣匹克球,Picklemaster Taiwan,匹克球入門,匹克球規則',
    ogImage: '/og-image.png',
    structuredData: localBusinessStructuredData
  },
  courts: {
    title: '台灣匹克球場地圖 | 尋找附近的匹克球場',
    description: '收錄全台最完整的匹克球場資訊！台北、台中、高雄、台南匹克球場一網打盡。提供詳細地址、開放時間與收費資訊，讓您輕鬆找到打球好去處。',
    keywords: '台灣匹克球場,匹克球場,台北匹克球場,台中匹克球場,高雄匹克球場,台南匹克球場,新北匹克球場,匹克球場地圖',
    structuredData: localBusinessStructuredData
  },
  rules: {
    title: '匹克球規則完整教學 | 雙彈跳、廚房區詳解',
    description: '最清楚的匹克球規則教學！圖解雙彈跳規則、廚房區（Non-Volley Zone）限制、發球與計分方式。新手必看的匹克球規則懶人包。',
    keywords: '匹克球規則,匹克球教學,雙彈跳規則,廚房區,匹克球計分,匹克球發球',
    structuredData: faqStructuredData
  },
  equipment: {
    title: '匹克球裝備推薦 | 握拍、球拍選購指南',
    description: '工欲善其事，必先利其器。專業匹克球裝備選購指南，教您如何選擇適合的匹克球拍、握把尺寸與運動裝備。',
    keywords: '匹克球裝備,匹克球拍,握拍,匹克球拍推薦,匹克球鞋',
    structuredData: faqStructuredData
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
    keywords: '匹克球FAQ,匹克球常見問題,匹克球問答',
    structuredData: faqStructuredData
  },
  contact: {
    title: '聯絡我們 | 匹克大師台灣 Picklemaster Taiwan',
    description: '有任何關於匹克球的問題、合作提案或建議？歡迎隨時與我們聯繫。我們期待聽到您的聲音！',
    keywords: '聯絡我們,匹克球合作,匹克球問題'
  },
  'privacy-policy': {
    title: '隱私權政策 | 匹克大師台灣 Picklemaster Taiwan',
    description: 'Picklemaster Taiwan 的隱私權政策，說明我們如何收集、使用和保護您的個人資訊。',
    keywords: '隱私權政策,個資保護,網站條款'
  }
};

// 生成頁面標題
export const getPageTitle = (page: string): string => {
  return pageSEO[page]?.title || '匹克球台灣 | Picklemaster Taiwan';
};

// 生成頁面描述
export const getPageDescription = (page: string): string => {
  return pageSEO[page]?.description || '台灣最完整的匹克球學習平台';
};

// 生成關鍵字
export const getPageKeywords = (page: string): string => {
  return pageSEO[page]?.keywords || '匹克球,台灣匹克球,pickleball taiwan';
};
