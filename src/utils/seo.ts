// SEO 元數據配置
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  structuredData?: any;
}

// 頁面 SEO 配置
export const pageSEO: Record<string, SEOConfig> = {
  home: {
    title: '匹克球台灣 | 台灣最完整的匹克球學習平台 - Picklemaster Taiwan',
    description: '匹克球台灣提供全台55+球場地圖、互動式規則教學、3D球場配置、專業裝備推薦。涵蓋台北、台中、高雄、台南等地區匹克球場資訊。從新手入門到進階技巧，完整學習路徑助你快速上手匹克球運動！',
    keywords: '匹克球,台灣匹克球,匹克球台灣,pickleball taiwan,匹克球場地圖,匹克球教學,匹克球規則,匹克球裝備,台北匹克球,台中匹克球,高雄匹克球,台南匹克球,匹克球入門',
    ogImage: '/og-image.png'
  },
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
    },
    {
      "@type": "Question",
      "name": "匹克球拍如何選擇？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "選擇匹克球拍需考慮：1) 材質 - 碳纖維（高級、輕量）、玻璃纖維（中級、耐用）、複合材質（初學、經濟）；2) 重量 - 輕拍（<7.3盎司）靈活、中拍（7.3-8.4盎司）平衡、重拍（>8.5盎司）力量大；3) 握把尺寸 - 測量手掌到無名指尖距離選擇；4) 球拍形狀 - 寬型（甜區大）或長型（觸球範圍廣）。我們提供球拍對比工具和智能推薦系統幫您選擇。"
      }
    },
    {
      "@type": "Question",
      "name": "匹克球和網球有什麼不同？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "主要差異：1) 場地大小 - 匹克球場（13.4m x 6.1m）比網球場小很多；2) 球拍 - 匹克球使用實心球拍，網球使用有線球拍；3) 球 - 匹克球使用塑膠有孔球，網球使用橡膠球；4) 規則 - 匹克球有雙彈跳規則和廚房區限制；5) 運動量 - 匹克球較溫和，適合更廣泛年齡層。"
      }
    },
    {
      "@type": "Question",
      "name": "台灣有匹克球比賽嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "是的，台灣匹克球運動正在快速發展，由中華民國匹克球協會主辦各項賽事。包括全國性錦標賽、分齡賽、地區性聯賽等。賽事資訊可關注台灣匹克球協會官網或加入本地匹克球社群獲取最新消息。"
      }
    },
    {
      "@type": "Question",
      "name": "打匹克球需要什麼裝備？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "基本裝備包括：1) 匹克球拍 - 價格從數百到數千元不等；2) 匹克球 - 室內用球（較軟）或室外用球（較硬）；3) 運動鞋 - 建議穿著室內運動鞋，避免黑色鞋底；4) 運動服裝 - 舒適透氣的運動服；5) 其他 - 護腕、運動毛巾、水壺等。初學者可先到球場租借球拍體驗。"
      }
    }
  ]
};

// 麵包屑結構化資料生成器
export const generateBreadcrumbStructuredData = (items: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
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
  ],
  "serviceType": [
    "匹克球教學",
    "匹克球場地圖",
    "匹克球裝備推薦",
    "匹克球規則教學",
    "匹克球社群"
  ]
};

// HowTo 結構化資料（如何開始打匹克球）
export const howToStructuredData = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "如何開始學習匹克球",
  "description": "完整的匹克球新手入門指南，從了解規則到實戰練習",
  "image": "https://picklemastertw.site/og-image.png",
  "totalTime": "PT2H",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "TWD",
    "value": "1000-3000"
  },
  "tool": [
    {
      "@type": "HowToTool",
      "name": "匹克球拍"
    },
    {
      "@type": "HowToTool",
      "name": "匹克球"
    },
    {
      "@type": "HowToTool",
      "name": "運動鞋"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "了解基本規則",
      "text": "學習匹克球的基本規則，包括雙彈跳、廚房區、發球規則等。使用我們的互動式規則教學快速掌握。",
      "url": "https://picklemastertw.site/rules"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "選擇適合的裝備",
      "text": "根據您的程度和預算選擇球拍。初學者建議選擇中等重量、複合材質的球拍，價格約1000-2000元。",
      "url": "https://picklemastertw.site/equipment"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "尋找附近球場",
      "text": "使用我們的球場地圖功能，找到離您最近的匹克球場。台灣目前有55+個球場可供選擇。",
      "url": "https://picklemastertw.site/courts"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "學習基本技巧",
      "text": "觀看教學影片學習發球、接發球、正反手等基本技巧。使用我們的3D互動教學理解站位和球路。",
      "url": "https://picklemastertw.site/learning"
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "加入社群練習",
      "text": "加入本地匹克球社群，與球友交流學習。參加初學者友善的練習活動，累積實戰經驗。",
      "url": "https://picklemastertw.site/resources"
    }
  ]
};
