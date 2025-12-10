// SEO 元數據配置
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  structuredData?: any;
}

// 頁面 SEO 配置 - 針對長尾關鍵字優化
export const pageSEO: Record<string, SEOConfig> = {
  home: {
    title: '匹克球台灣 Pickleball Taiwan | 規則教學・球場地圖・裝備推薦',
    description: '台灣匹克球入門首選！提供全台55+球場地圖（台北/台中/高雄）、互動式規則教學、3D球場配置、球拍選購指南。不論你是想了解「匹克球是什麼」還是「匹克球怎麼打」，從零開始30分鐘學會匹克球！',
    keywords: '匹克球,pickleball,匹克球是什麼,匹克球怎麼打,匹克球規則,匹克球台灣,台灣匹克球,匹克球教學,匹克球入門,匹克球初學者,pickleball taiwan,匹克球場地圖',
    ogImage: '/og-image.png'
  },
  courts: {
    title: '台灣匹克球場地圖 | 台北・台中・高雄・台南 55+球場完整資訊',
    description: '找不到匹克球場？這裡收錄全台55+個匹克球場！台北大安森林公園、新北河濱公園、台中市民廣場、高雄運動中心等。提供地址、開放時間、室內外、免費/收費、如何預約等完整資訊。',
    keywords: '匹克球場,台灣匹克球場,匹克球場地圖,台北匹克球場,大安森林公園匹克球,新北匹克球場,台中匹克球場,高雄匹克球場,台南匹克球場,免費匹克球場,室內匹克球場,哪裡可以打匹克球'
  },
  rules: {
    title: '匹克球規則完整教學 | 雙彈跳規則・廚房區・發球規則・計分方式',
    description: '匹克球規則一次搞懂！互動式教學讓你快速理解「雙彈跳規則」「廚房區（Non-Volley Zone）不能做什麼」「發球要怎麼發」「怎麼計分」。包含3D球場展示和球路徑動畫，新手必看的完整規則說明！',
    keywords: '匹克球規則,pickleball rules,匹克球雙彈跳,匹克球廚房區,匹克球發球規則,匹克球計分規則,匹克球怎麼計分,匹克球界線規則,匹克球NVZ,匹克球Non-Volley Zone'
  },
  equipment: {
    title: '匹克球拍推薦2024 | 新手選購指南・材質比較・職業選手裝備',
    description: '不知道怎麼選匹克球拍？本指南詳解球拍材質（碳纖維/玻璃纖維/複合材質）、重量選擇、握把尺寸。提供職業選手使用球拍分析、智能推薦工具，幫你在1000-8000元預算內找到最適合的匹克球拍！',
    keywords: '匹克球拍,匹克球拍推薦,pickleball paddle,匹克球拍怎麼選,碳纖維匹克球拍,新手匹克球拍,匹克球裝備,匹克球拍價格,匹克球拍品牌,匹克球拍材質'
  },
  'learning-paths': {
    title: '匹克球學習路徑 | 新手入門→中階進修→高手養成 完整課程',
    description: '系統化的匹克球學習課程！從「新手入門」認識球場和握拍、「中階進修」學習戰術和技巧、到「高手養成」精進比賽策略。每個階段都有明確目標，讓你循序漸進成為匹克球高手！',
    keywords: '匹克球教學,匹克球課程,匹克球學習,匹克球訓練,匹克球入門課程,匹克球技巧教學,匹克球怎麼學,匹克球培訓,pickleball lesson'
  },
  learning: {
    title: '匹克球學習中心 | 技巧教學・規則解說・互動測驗・完整資源',
    description: '一站式匹克球學習平台！規則教學、技巧影片、3D互動球場、知識測驗，從入門到進階完整學習資源。系統化學習路徑帶你從新手成為匹克球高手！',
    keywords: '匹克球教學,匹克球學習,學習匹克球,匹克球入門,匹克球新手,匹克球初學者,匹克球課程,pickleball教學'
  },
  techniques: {
    title: '匹克球技巧教學 | 發球・Dink・截擊・第三拍落地球 專業影片示範',
    description: '五大核心匹克球技巧完整教學！發球技術、接發球要領、Dink 軟球技術、網前截擊、戰術策略。包含專業影片示範，讓你的匹克球技術快速進步！',
    keywords: '匹克球技巧,匹克球發球,匹克球Dink,匹克球截擊,匹克球第三拍,匹克球落地球,匹克球戰術,匹克球擊球技術,pickleball techniques'
  },
  'court-guide': {
    title: '匹克球球場解說 | 3D互動球場・廚房區規則・區域詳解',
    description: '透過3D互動球場了解匹克球場地配置！廚房區（NVZ）、發球區、底線區完整規則說明。包含球路軌跡動畫、場地尺寸規格，讓你完全掌握球場規則！',
    keywords: '匹克球場,匹克球場地,匹克球廚房區,匹克球NVZ,匹克球發球區,匹克球場尺寸,匹克球場規格,3D匹克球場,pickleball court'
  },
  quiz: {
    title: '匹克球知識測驗 | 規則快問快答・學習成果檢驗',
    description: '測試你的匹克球知識！6題互動測驗涵蓋雙彈跳、廚房區、發球、計分等核心規則。每題都有詳細解說，即時反饋幫助你加深記憶！',
    keywords: '匹克球測驗,匹克球規則測驗,匹克球問答,pickleball quiz,匹克球考試,匹克球知識測試'
  },
  faq: {
    title: '匹克球常見問題FAQ | 什麼是匹克球・規則・場地・裝備 完整解答',
    description: '關於匹克球的常見問題解答：匹克球是什麼？台灣哪裡可以打匹克球？匹克球規則怎麼玩？新手如何開始？球拍怎麼選？和網球有什麼不同？一次解答所有疑問！',
    keywords: '匹克球是什麼,匹克球FAQ,匹克球問答,匹克球和網球差別,匹克球新手,匹克球入門問題,匹克球常見問題,pickleball是什麼'
  },
  game: {
    title: '匹克球互動遊戲 | 線上練習模擬・規則學習遊戲',
    description: '邊玩邊學匹克球！真實模擬匹克球比賽規則的線上互動遊戲，練習雙彈跳規則、廚房區限制、對角發球。不用出門就能熟悉匹克球規則和比賽節奏！',
    keywords: '匹克球遊戲,pickleball game,匹克球線上遊戲,匹克球練習,匹克球模擬,匹克球規則遊戲'
  },
  scorer: {
    title: '匹克球計分器 | 專業比賽計分・單打雙打・發球追蹤',
    description: '免費匹克球計分器！支援單打/雙打計分、自動追蹤發球方和發球員、音效提示、全螢幕模式。手機平板都能用，實戰比賽必備工具！',
    keywords: '匹克球計分器,pickleball scorer,匹克球計分app,匹克球比分,匹克球記分,匹克球計分方式'
  },
  resources: {
    title: '匹克球學習資源 | 台灣協會・YouTube教學・社群推薦',
    description: '精選匹克球學習資源！台灣匹克球協會資訊、Pickleball Kitchen等優質YouTube教學頻道、台灣匹克球社團推薦。提供書籍、影片、賽事資訊，加速你的學習！',
    keywords: '匹克球資源,匹克球YouTube,台灣匹克球協會,匹克球社團,匹克球影片教學,匹克球書籍,匹克球比賽'
  },
  about: {
    title: '關於匹克球台灣 Picklemaster Taiwan | 推廣台灣匹克球運動',
    description: 'Picklemaster Taiwan 致力於推廣台灣匹克球運動，提供完整學習平台。降低入門門檻、提供完整資源、建立社群網絡，讓每個人都能享受匹克球的樂趣！',
    keywords: '匹克球台灣,台灣匹克球,picklemaster taiwan,匹克球推廣,匹克球社群'
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
export const generateBreadcrumbStructuredData = (items: Array<{ name: string, url: string }>) => {
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

// Equipment 頁面 - 球拍產品結構化資料
export const equipmentProductData = {
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
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "TWD",
        "lowPrice": "2000",
        "highPrice": "4000",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.3",
        "reviewCount": "50"
      }
    },
    {
      "@type": "Product",
      "position": 2,
      "name": "中階級匹克球拍",
      "description": "玻璃纖維材質，適合中級球員，提供良好的控球性和力量",
      "category": "匹克球拍",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "TWD",
        "lowPrice": "4000",
        "highPrice": "8000",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.6",
        "reviewCount": "120"
      }
    },
    {
      "@type": "Product",
      "position": 3,
      "name": "高階級碳纖維匹克球拍",
      "description": "職業級碳纖維材質，輕量化設計，提供最佳性能表現",
      "category": "匹克球拍",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "TWD",
        "lowPrice": "8000",
        "highPrice": "15000",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "80"
      }
    }
  ]
};

// Courts 頁面 - 球場地圖結構化資料
export const courtsLocationData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "台灣匹克球場地圖",
  "description": "台灣55+個匹克球場完整資訊，包含台北、新北、台中、高雄、台南等地區",
  "numberOfItems": 55,
  "itemListElement": [
    {
      "@type": "SportsActivityLocation",
      "position": 1,
      "name": "台北市匹克球場",
      "description": "台北市區內的匹克球場，包含室內外場地",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "台北市",
        "addressCountry": "TW"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "25.0330",
        "longitude": "121.5654"
      }
    },
    {
      "@type": "SportsActivityLocation",
      "position": 2,
      "name": "新北市匹克球場",
      "description": "新北市各區匹克球場資訊",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "新北市",
        "addressCountry": "TW"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "25.0169",
        "longitude": "121.4627"
      }
    },
    {
      "@type": "SportsActivityLocation",
      "position": 3,
      "name": "台中市匹克球場",
      "description": "台中市匹克球場完整資訊",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "台中市",
        "addressCountry": "TW"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "24.1477",
        "longitude": "120.6736"
      }
    }
  ]
};

// Learning 頁面 - 教學課程結構化資料
export const learningCourseData = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "匹克球完整學習課程",
  "description": "從新手到進階的系統化匹克球學習路徑，包含3D互動教學、技巧訓練、戰術指導",
  "provider": {
    "@type": "Organization",
    "name": "Picklemaster Taiwan",
    "url": "https://picklemastertw.site"
  },
  "educationalLevel": "初級到進階",
  "inLanguage": "zh-TW",
  "availableLanguage": "zh-TW",
  "coursePrerequisites": "無需先備知識，適合完全新手",
  "hasCourseInstance": [
    {
      "@type": "CourseInstance",
      "name": "新手入門課程",
      "description": "基礎規則、握拍技巧、發球練習",
      "courseMode": "online",
      "courseWorkload": "PT5H"
    },
    {
      "@type": "CourseInstance",
      "name": "中階進修課程",
      "description": "進階技巧、戰術運用、雙打配合",
      "courseMode": "online",
      "courseWorkload": "PT10H"
    },
    {
      "@type": "CourseInstance",
      "name": "高手養成課程",
      "description": "技術精進、心理素質、競技訓練",
      "courseMode": "online",
      "courseWorkload": "PT15H"
    }
  ],
  "teaches": [
    "匹克球基本規則",
    "發球技巧",
    "接發球技術",
    "正反手擊球",
    "網前截擊",
    "雙打戰術",
    "場上站位",
    "比賽策略"
  ]
};
