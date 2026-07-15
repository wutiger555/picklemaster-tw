// 匹克球歷史時間軸 (1965 - 2026)
// 權威內容：涵蓋全球與台灣大事記

export interface HistoryEvent {
  year: string;        // 年份或年月
  date?: string;       // 精確日期（選填）
  title: string;
  description: string;
  category: '全球' | '台灣' | '規則' | '賽事' | '科技';
  icon: string;
  milestone?: boolean; // 里程碑事件
}

export const HISTORY_TIMELINE: HistoryEvent[] = [
  {
    year: '1965',
    date: '1965-06',
    title: '匹克球誕生於美國華盛頓州',
    description: '三位父親 Joel Pritchard（後成為華盛頓州州長）、Bill Bell、Barney McCallum 在 Bainbridge Island 島上，為了讓小孩有事可做，發明了這項運動。使用桌球拍、羽球場、有孔塑膠球。',
    category: '全球',
    icon: '🏓',
    milestone: true,
  },
  {
    year: '1967',
    title: '第一座專用匹克球場',
    description: 'Joel Pritchard 在 Bainbridge Island 建造世界首座永久性匹克球場。',
    category: '全球',
    icon: '🏟️',
  },
  {
    year: '1972',
    title: 'Pickle-Ball Inc. 成立',
    description: '創辦人將運動商業化，Pickle-Ball, Inc. 公司正式成立，開始銷售球拍與球。',
    category: '全球',
    icon: '🏢',
  },
  {
    year: '1975',
    title: '首次媒體報導',
    description: '華盛頓州報紙首次報導這項新興運動，吸引大量關注。',
    category: '全球',
    icon: '📰',
  },
  {
    year: '1976',
    title: '第一屆全美匹克球錦標賽',
    description: '4 月於 Tukwila, Washington 舉辦，標誌匹克球進入競技時代。',
    category: '賽事',
    icon: '🏆',
    milestone: true,
  },
  {
    year: '1984',
    title: 'USAPA 美國匹克球協會成立',
    description: 'United States Amateur Pickleball Association (USAPA) 正式成立，制定標準規則、認證球拍與球場。',
    category: '規則',
    icon: '📜',
    milestone: true,
  },
  {
    year: '1990',
    title: '全美 50 州都有匹克球場',
    description: '距離誕生 25 年後，匹克球正式遍佈美國全境。',
    category: '全球',
    icon: '🇺🇸',
  },
  {
    year: '2001',
    title: '亞利桑那州高齡運動會首次納入',
    description: '首次在大型高齡運動會出現，奠定「銀髮族運動」地位。',
    category: '賽事',
    icon: '👴',
  },
  {
    year: '2009',
    title: '首屆 USAPA 全國錦標賽',
    description: '11 月於亞利桑那州 Buckeye 舉辦，成為每年固定的全美最高賽事。',
    category: '賽事',
    icon: '🇺🇸',
  },
  {
    year: '2010',
    title: 'International Federation of Pickleball (IFP) 成立',
    description: '國際匹克球聯盟成立，推動全球化，為未來奧運鋪路。',
    category: '全球',
    icon: '🌍',
    milestone: true,
  },
  {
    year: '2016',
    title: '匹克球職業化開始',
    description: 'Professional Pickleball Association (PPA) 成立，職業巡迴賽元年。',
    category: '賽事',
    icon: '💼',
    milestone: true,
  },
  {
    year: '2017',
    title: '中華民國匹克球協會 (CTPF) 成立',
    description: '台灣匹克球官方組織正式成立，陳朝鍵先生擔任首任理事長。',
    category: '台灣',
    icon: '🇹🇼',
    milestone: true,
  },
  {
    year: '2018',
    title: 'CTPF 協助香港匹克球協會成立',
    description: 'CTPF 為香港提供第一批教練培訓，奠定台灣在亞洲匹克球發展的樞紐地位。',
    category: '台灣',
    icon: '🤝',
  },
  {
    year: '2019',
    title: 'Ben Johns 登頂世界第一',
    description: '20 歲的 Ben Johns 首次成為世界第一，開啟他長達 5 年以上的統治時代。',
    category: '賽事',
    icon: '👑',
    milestone: true,
  },
  {
    year: '2020',
    title: 'COVID-19 帶動匹克球爆炸性成長',
    description: '疫情期間因場地小、適合戶外、保持社交距離等特性，美國參與人口翻倍。',
    category: '全球',
    icon: '📈',
    milestone: true,
  },
  {
    year: '2021',
    title: 'Drop Serve 下拋發球合法化',
    description: 'USAPA 規則修訂：允許球員讓球自由下落後擊球（drop serve）。放寬對擊球高度限制。',
    category: '規則',
    icon: '⚖️',
    milestone: true,
  },
  {
    year: '2021',
    title: 'Major League Pickleball (MLP) 成立',
    description: 'Steve Kuhn 創辦團隊制職業聯賽 MLP，引入 Rally Scoring、Dreambreaker 等創新賽制。',
    category: '賽事',
    icon: '⚡',
    milestone: true,
  },
  {
    year: '2022',
    title: 'LeBron James、Tom Brady 投資 MLP',
    description: '巨星加入讓匹克球登上主流媒體，被譽為「美國成長最快運動」。',
    category: '全球',
    icon: '🌟',
  },
  {
    year: '2023',
    title: 'PPA 與 APP 合併為單一職業體系',
    description: '職業匹克球整合，PPA Tour 成為唯一頂級職業巡迴賽。',
    category: '賽事',
    icon: '🤝',
  },
  {
    year: '2023',
    title: 'DUPR 成為全球評級標準',
    description: 'Dynamic Universal Pickleball Rating 獲 MLP、PPA 採用，成為全球通用評分系統。',
    category: '規則',
    icon: '📊',
    milestone: true,
  },
  {
    year: '2024',
    title: '首屆亞洲匹克球運動會 (APG)',
    description: '2024 年 10 月於台中國際網球中心舉辦，11 國 780 位選手參與。台灣成功主辦亞洲最大賽事。',
    category: '台灣',
    icon: '🏅',
    milestone: true,
  },
  {
    year: '2024',
    title: 'Anna Leigh Waters 17 歲三冠王',
    description: '創下最年輕的匹克球年度最佳選手紀錄，改變女子匹克球面貌。',
    category: '賽事',
    icon: '💎',
  },
  {
    year: '2024',
    title: '台灣匹克球人口突破 14 萬',
    description: 'CTPF 公布 2024 年統計，台灣匹克球人口達 14 萬，較 2020 年成長 10 倍。',
    category: '台灣',
    icon: '📊',
  },
  {
    year: '2025',
    title: 'PPA Tour Asia 正式開跑',
    description: 'PPA 進軍亞洲，於越南、泰國、新加坡舉辦多站賽事，亞洲匹克球職業化正式開始。',
    category: '賽事',
    icon: '🌏',
    milestone: true,
  },
  {
    year: '2025',
    title: '熱壓成型球拍佔職業賽 85%',
    description: 'Thermoforming 技術普及，JOOLA Perseus Pro IV、Selkirk Labs Project 002 等成為主流。',
    category: '科技',
    icon: '🔬',
  },
  {
    year: '2025',
    title: '台灣匹克球人口達 50 萬',
    description: '較 2024 成長 3.5 倍，CTPF 認證教練突破 1,400 人。',
    category: '台灣',
    icon: '📈',
  },
  {
    year: '2025-12',
    title: '天母運動公園 17 面匹克球場啟用',
    description: '臺北市天母運動公園整修 17 面匹克球場，成為全台最大戶外匹克球場地。',
    category: '台灣',
    icon: '🏟️',
  },
  {
    year: '2026-01',
    title: '2026 臺灣盃於宜蘭大學開戰',
    description: '運動部全民運動署補助，首次將組別細分為國小至教練公開組共 6 類別。',
    category: '台灣',
    icon: '🏆',
  },
  {
    year: '2026',
    title: '台灣匹克球人口預估突破 120 萬',
    description: 'CTPF 預估 2026 年底將達 120 萬人，成為台灣參與人數成長最快的新興運動。',
    category: '台灣',
    icon: '🎯',
    milestone: true,
  },
  {
    year: '2026',
    title: 'Carbon Core 碳芯球拍時代',
    description: 'Selkirk Labs Project 002、Six Zero Ruby 等碳芯球拍普及，硬度更高、回饋更直接。',
    category: '科技',
    icon: '🔧',
  },
  {
    year: '2026-05',
    title: '華爾街資本進場：Apollo 投資 2.25 億美元',
    description: 'Apollo Sports Capital 領投 Pickleball Inc.（PPA Tour 與 MLP 母公司），估值達 7.5 億美元，匹克球邁向成熟職業運動。',
    category: '全球',
    icon: '💰',
  },
  {
    year: '2026-05',
    title: '台灣首個職業聯賽 AEPL 成立',
    description: '亞洲菁英匹克球聯盟（AEPL）宣布成立，首賽季 8 月開打：6 支球隊、全台 8 站分站賽、總獎金 100 萬元，台灣匹克球正式職業化。',
    category: '台灣',
    icon: '🏅',
    milestone: true,
  },
  {
    year: '2028 (預期)',
    title: '洛杉磯奧運評估',
    description: 'IFP 持續推動匹克球納入 2028 洛杉磯奧運表演項目。全球會員國已達 80+，接近奧運門檻。',
    category: '全球',
    icon: '🏅',
  },
];

// 規則演變史
export interface RuleChange {
  year: string;
  ruleTitle: string;
  change: string;
  impact: string;
}

export const RULE_EVOLUTION: RuleChange[] = [
  {
    year: '1965',
    ruleTitle: '原始規則制定',
    change: '創辦人定義基本規則：下手發球、雙彈跳、廚房區禁止截擊、11 分制。',
    impact: '奠定匹克球至今不變的核心規則。',
  },
  {
    year: '1984',
    ruleTitle: 'USAPA 官方規則書發行',
    change: '首部統一規則書公布，包含場地尺寸（20×44 英尺）、網高（34 吋中央/36 吋兩側）。',
    impact: '終結各地規則差異，成為全球標準。',
  },
  {
    year: '2010',
    ruleTitle: 'IFP 國際規則統一',
    change: '國際匹克球聯盟統一各國規則，為國際賽事鋪路。',
    impact: '匹克球從美國運動真正走向全球。',
  },
  {
    year: '2018',
    ruleTitle: '球拍材質認證標準',
    change: 'USAPA 開始認證球拍面板材質與厚度，防止過度發展。',
    impact: '保護比賽公平性，球拍技術不再無限進化。',
  },
  {
    year: '2021',
    ruleTitle: 'Drop Serve 下拋發球合法化',
    change: '允許球員讓球自由下落後擊球。此時可擊球點高於腰部、拍頭可高於手腕。',
    impact: '讓上肢活動受限的球員也能發球，降低入門門檻。',
  },
  {
    year: '2021',
    ruleTitle: 'Let Serve（擦網發球）取消重發',
    change: '發球擦網仍落入有效區直接視為有效球，不需重發。',
    impact: '加快比賽節奏，減少中斷，更適合電視轉播。',
  },
  {
    year: '2022',
    ruleTitle: 'Rally Scoring 實驗',
    change: 'MLP 職業聯賽開始使用「每球得分制」，取代傳統只有發球方得分。',
    impact: '比賽時間縮短 20-30%，提升觀賽娛樂性。業餘賽暫未採用。',
  },
  {
    year: '2023',
    ruleTitle: '熱壓成型球拍規範',
    change: '針對熱壓成型（Thermoformed）球拍彈性過高，USAP 加嚴「paddle pop test」測試。',
    impact: '多款熱門球拍被禁用或調整，例如 JOOLA 某些型號需修改。',
  },
  {
    year: '2024',
    ruleTitle: 'DUPR 成為官方評級',
    change: 'PPA、MLP、USAPA 全國賽事均採用 DUPR 為報名依據，取代傳統俱樂部評級。',
    impact: '全球評級統一，選手進度可跨國比較。',
  },
  {
    year: '2025',
    ruleTitle: '全國賽年齡分組細化',
    change: 'USAPA 將年齡組從 5 年間隔改為 5 年間隔細分到 75+（增加 75+、80+、85+ 組）。',
    impact: '為持續成長的高齡族群提供更公平競賽。',
  },
  {
    year: '2026 (擬定中)',
    ruleTitle: 'Rally Scoring 可能推廣',
    change: 'USAP 正評估業餘賽採用 Rally Scoring 的可能性。',
    impact: '若通過將是 60 年來最大規則改變。',
  },
];
