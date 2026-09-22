// 名人堂入選人物 —— 由 src/pages/HallOfFame.tsx 搬出。
// 搬出的原因：建置時要用這份資料預渲染頁面（scripts/generate-static-pages.cjs），
// 而從頁面元件 export 非元件常數會讓該檔的 Fast Refresh 失效
// （react-refresh/only-export-components）。

export interface HoFMember {
  name: string;
  nameZh?: string;
  role: string;
  era: string;
  contribution: string;
  inducted?: string;
  emoji: string;
  category: '創辦人' | '先鋒推廣者' | '傳奇選手' | '台灣推廣者' | '組織建設者';
}

export const FOUNDERS: HoFMember[] = [
  {
    name: 'Joel Pritchard',
    role: '匹克球共同發明人 / 華盛頓州州長',
    era: '1965 - 1997',
    contribution: '1965 年夏天在 Bainbridge Island 自家後院與兩位朋友發明匹克球。後來成為華盛頓州副州長與美國國會議員，運用政治影響力推廣匹克球。',
    inducted: '2018 USAPA 名人堂',
    emoji: '👨‍⚖️',
    category: '創辦人',
  },
  {
    name: 'Bill Bell',
    role: '匹克球共同發明人',
    era: '1965 - 1989',
    contribution: '與 Pritchard 共同發明匹克球。他的兒子 Frank Bell 後來繼承父業，繼續推廣這項運動。',
    inducted: '2018 USAPA 名人堂',
    emoji: '🏓',
    category: '創辦人',
  },
  {
    name: 'Barney McCallum',
    role: '匹克球共同發明人 / Pickle-Ball Inc. 創辦人',
    era: '1965 - 2019',
    contribution: '完善了匹克球規則，並於 1972 年創辦 Pickle-Ball, Inc. 將運動商業化。直到 2019 年過世前都活躍於匹克球界。',
    inducted: '2018 USAPA 名人堂',
    emoji: '🎯',
    category: '創辦人',
  },
];

export const PIONEERS: HoFMember[] = [
  {
    name: 'David Lester',
    role: '首屆全美錦標賽冠軍',
    era: '1976',
    contribution: '1976 年於 Tukwila 贏得首屆全美匹克球錦標賽冠軍。被視為匹克球競技時代的開拓者。',
    inducted: '2017 USAPA 名人堂',
    emoji: '🏆',
    category: '先鋒推廣者',
  },
  {
    name: 'Sid Williams',
    role: 'USAPA 創辦人之一',
    era: '1984',
    contribution: '1984 年協助創辦 USAPA（美國匹克球協會），制定首版統一規則書，奠定現代匹克球規則基礎。',
    inducted: '2014 USAPA 名人堂',
    emoji: '📜',
    category: '組織建設者',
  },
  {
    name: 'Steve Wong',
    role: 'IFP 國際匹克球聯盟創辦人',
    era: '2010',
    contribution: '2010 年成立 IFP，開啟匹克球國際化進程。為日後 APG 亞洲運動會等國際賽事鋪路。',
    inducted: '2020 IFP 創會榮譽',
    emoji: '🌍',
    category: '組織建設者',
  },
];

export const LEGENDS: HoFMember[] = [
  {
    name: 'Simone Jardim',
    nameZh: '希蒙妮·賈丁',
    role: '4 年女單世界第一',
    era: '2016 - 2020',
    contribution: '巴西裔美籍傳奇，連續 4 年女單世界第一（2016-2020）。退役後成為教練、MLP Atlanta 隊長。被譽為「現代女子匹克球教母」。',
    inducted: '2022 USAPA 名人堂',
    emoji: '🌟',
    category: '傳奇選手',
  },
  {
    name: 'Tyson McGuffin',
    role: '匹克球魅力大使',
    era: '2017 - 至今',
    contribution: '前網球選手，匹克球職業化早期最具群眾魅力的選手。2018-2020 連三年 PPA 年度 MVP，現仍活躍於職業圈。',
    emoji: '🔥',
    category: '傳奇選手',
  },
  {
    name: 'Ben Johns',
    role: '當代 GOAT',
    era: '2019 - 至今',
    contribution: '連續 5+ 年世界第一，歷史上勝率最高的男子選手。改變了匹克球的戰術深度（Reset、第三球下切普及化），讓匹克球從休閒運動真正成為競技運動。',
    emoji: '👑',
    category: '傳奇選手',
  },
];

export const TAIWAN: HoFMember[] = [
  {
    name: '陳朝鍵',
    nameZh: 'Theory Chen',
    role: '中華民國匹克球協會 (CTPF) 首任理事長',
    era: '2017 - 至今',
    contribution: '2017 年創辦 CTPF，是台灣匹克球發展的核心推手。協助香港協會成立、爭取 2024 APG 亞洲運動會在台中舉辦。預估 2026 年帶領台灣匹克球人口突破 120 萬。',
    emoji: '🇹🇼',
    category: '台灣推廣者',
  },
  {
    name: 'CTPF 認證教練群',
    role: '1,400+ 位 C 級認證教練',
    era: '2018 - 至今',
    contribution: '截至 2026 年，CTPF 已培訓超過 1,400 位 C 級認證教練，遍佈全台。是台灣匹克球從 14 萬人口（2024）成長到 120 萬（2026）背後的力量。',
    emoji: '👥',
    category: '台灣推廣者',
  },
  {
    name: '林書豪',
    role: '名人推廣大使（非職業選手）',
    era: '2024 - 至今',
    contribution: '前 NBA 球星轉型匹克球推廣，多次公開站台，讓匹克球登上台灣主流媒體。「林來瘋」效應再現於匹克球。',
    emoji: '🌟',
    category: '台灣推廣者',
  },
];
