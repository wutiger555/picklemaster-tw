// 匹克球術語表 (Pickleball Glossary)
// 權威內容：最完整的中英文匹克球術語對照表

export interface GlossaryTerm {
  id: string;
  term: string;
  termEn: string;
  category: '規則' | '技術' | '戰術' | '裝備' | '場地' | '賽制';
  definition: string;
  example?: string;
  relatedTerms?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  // 規則術語
  {
    id: 'double-bounce',
    term: '雙彈跳規則',
    termEn: 'Double Bounce Rule / Two-Bounce Rule',
    category: '規則',
    definition: '匹克球最核心的規則之一：發球方發球後，接發球方必須讓球落地彈起一次再擊球；接發球方回擊後，發球方也必須讓球落地彈起一次才能擊球。在這兩次彈跳完成後，雙方才可以進行截擊（volley）。',
    example: 'A 發球 → 球彈地一次 → B 回擊 → 球彈地一次 → A 擊球（此後雙方皆可截擊）',
    relatedTerms: ['截擊', '廚房區'],
  },
  {
    id: 'kitchen',
    term: '廚房區（非截擊區）',
    termEn: 'Kitchen / Non-Volley Zone (NVZ)',
    category: '規則',
    definition: '球網兩側各 7 英尺（約 2.13 公尺）的區域。球員站在此區域內或踩線時不得截擊（volley）。即使球員起跳截擊後落地進入此區，亦判失分。',
    example: '球員在廚房區外截擊後因慣性衝入廚房，仍屬犯規。',
    relatedTerms: ['雙彈跳規則', '截擊'],
  },
  {
    id: 'serve-rules',
    term: '發球規則',
    termEn: 'Serve Rules',
    category: '規則',
    definition: '必須下手發球（球拍接觸球時需低於手腕與腰部），且發球動作須由下往上。2021 年後新增「下拋發球」(drop serve)，允許讓球自然落下後擊球。發球必須落在對方對角發球區內，不可觸網或落在廚房區。',
    relatedTerms: ['下拋發球'],
  },
  {
    id: 'rally-scoring',
    term: '連續得分制',
    termEn: 'Rally Scoring',
    category: '規則',
    definition: '2024 年起 MLP（Major League Pickleball）與部分職業賽開始採用的計分制度：每一球都得分，無論是否為發球方。傳統規則僅發球方得分。業餘賽仍以傳統制為主。',
    relatedTerms: ['計分'],
  },

  // 技術術語
  {
    id: 'dink',
    term: '軟球／丁克球',
    termEn: 'Dink',
    category: '技術',
    definition: '從廚房區邊緣打出的輕柔高弧線球，目的讓球剛好越過網並落在對方廚房區內，迫使對方無法用力進攻。是匹克球最核心的戰術技巧。',
    example: '廚房戰（Dink Rally）是雙方選手在網前互打軟球的經典場景。',
    relatedTerms: ['廚房區', '第三球下切'],
  },
  {
    id: 'third-shot-drop',
    term: '第三球下切',
    termEn: 'Third Shot Drop',
    category: '技術',
    definition: '發球方接下來的第三球（即回擊接發球方回球的那一球）打出高弧線並落入對方廚房區。這個技術讓發球方有時間上網，扭轉開局劣勢。是進階球員必備技術。',
    relatedTerms: ['軟球', '上網'],
  },
  {
    id: 'erne',
    term: 'ERNE',
    termEn: 'Erne',
    category: '技術',
    definition: '以球員 Erne Perry 命名的進階技術。球員在廚房區外側（邊線外）跳起截擊對方的軟球，達到快速進攻的效果。需要精準判斷與腳步。',
    relatedTerms: ['截擊', 'ATP'],
  },
  {
    id: 'atp',
    term: 'ATP 繞網球',
    termEn: 'Around the Post (ATP)',
    category: '技術',
    definition: '將球從網柱「外側」繞過而非越過網面的合法球路。常見於對方將球打到邊線外側時。難度高但觀賞性極佳。',
    relatedTerms: ['ERNE'],
  },
  {
    id: 'reset',
    term: '重置球',
    termEn: 'Reset',
    category: '技術',
    definition: '將高速進攻球以軟球方式擋回對方廚房區，中止對方的進攻節奏，讓自己重新建立陣型。是防守端最重要的技術。',
    relatedTerms: ['軟球', '防守'],
  },
  {
    id: 'volley',
    term: '截擊',
    termEn: 'Volley',
    category: '技術',
    definition: '在球落地之前擊球。廚房區內禁止截擊，廚房區外雙方完成雙彈跳後皆可進行截擊。',
    relatedTerms: ['廚房區', '雙彈跳規則'],
  },

  // 戰術術語
  {
    id: 'stacking',
    term: '疊站',
    termEn: 'Stacking',
    category: '戰術',
    definition: '雙打時透過站位配合，讓慣用手（通常是正手）的兩人站在對角位置，形成「兩把正手拍對網」的陣型。常見於一右一左手的搭檔。',
    relatedTerms: ['雙打戰術'],
  },
  {
    id: 'poaching',
    term: '搶球／偷球',
    termEn: 'Poaching',
    category: '戰術',
    definition: '雙打時，非接球方球員主動橫移到搭檔前方截擊球，通常用於威脅型進攻。需與搭檔事先默契或手勢溝通。',
    relatedTerms: ['疊站'],
  },
  {
    id: 'shake-and-bake',
    term: 'Shake & Bake',
    termEn: 'Shake and Bake',
    category: '戰術',
    definition: '發球方採用的快速進攻組合：球員 A 打出強力第三球，搭檔 B 立刻上網準備扣殺。2024-2025 年職業賽場上最熱門的進攻戰術之一。',
  },

  // 裝備
  {
    id: 'paddle',
    term: '球拍',
    termEn: 'Paddle',
    category: '裝備',
    definition: '實心球拍，通常由碳纖維、玻璃纖維或複合材料製成。重量範圍 7.0-8.5 盎司（約 198-240 克），標準厚度 13-16mm。',
  },
  {
    id: 'thermoformed',
    term: '熱壓成型球拍',
    termEn: 'Thermoformed Paddle',
    category: '裝備',
    definition: '2023 年後主流製程：球拍核心、面板與邊框一體熱壓而成，提供更大甜蜜點與更穩定的球感。代表產品：JOOLA Perseus、Paddletek Bantam。',
  },
  {
    id: 'core',
    term: '球拍核心',
    termEn: 'Paddle Core',
    category: '裝備',
    definition: '常見有 Polymer（聚合物，最常見）、Nomex（紙蜂窩，較硬）、Aluminum（鋁芯，已少見）。2025 年起碳芯（Carbon Core）開始出現於高階產品。',
  },

  // 場地
  {
    id: 'court-dimensions',
    term: '標準場地尺寸',
    termEn: 'Court Dimensions',
    category: '場地',
    definition: '標準場地：20 英尺 × 44 英尺（6.1m × 13.4m），與雙打羽毛球場地相同大小。廚房區 7 英尺深、發球區 15 英尺深、中線分割左右發球區。',
  },

  // 賽制
  {
    id: 'dupr',
    term: 'DUPR 評級',
    termEn: 'Dynamic Universal Pickleball Rating',
    category: '賽制',
    definition: '全球通用匹克球技術評級系統（1.0 - 8.0）。由 MLP 創辦人 Steve Kuhn 推動，職業球員約 6.0+，業餘中階 3.5-4.5。2026 年起成為全球主要賽事報名依據。',
    example: 'Ben Johns = 8.0, 業餘週末愛好者 = 3.5',
  },
  {
    id: 'ppa-tour',
    term: 'PPA 巡迴賽',
    termEn: 'Professional Pickleball Association Tour',
    category: '賽制',
    definition: '全球最大匹克球職業巡迴賽，2023 年與 APP 合併後成為唯一職業賽事體系。2025 年進軍亞洲（PPA Tour Asia），2026 年於越南、泰國、新加坡舉辦多站。',
  },
  {
    id: 'mlp',
    term: 'MLP 職業聯賽',
    termEn: 'Major League Pickleball',
    category: '賽制',
    definition: '團隊制職業聯賽，採用 Rally Scoring、Dreambreaker 決勝制等創新規則。由 Tom Brady、LeBron James 等名人投資，是匹克球最具娛樂價值的職業賽事。',
  },
];

export const GLOSSARY_CATEGORIES = ['規則', '技術', '戰術', '裝備', '場地', '賽制'] as const;
