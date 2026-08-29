// 匹克球拍完整資料庫 - 2026
// 20+ 品牌、35+ 款主流球拍規格完整對照
// 選拍重點：初學者以「容錯、控球、價格」為優先，進階再追求力量與旋轉

export type PaddleBrand =
  | 'JOOLA' | 'Selkirk' | 'SLK by Selkirk' | 'Paddletek' | 'Six Zero' | 'Engage'
  | 'Franklin' | 'CRBN' | 'Gearbox' | 'PROLITE' | 'Vatic Pro' | 'Electrum'
  | 'Onix' | 'HEAD' | 'Niupipo' | '11SIX24' | 'Ronbus' | 'Friday'
  | 'Bread & Butter' | 'Volair' | 'Honolulu' | 'ProKennex' | 'LUZZ';

export type PaddleShape = '寬型 Widebody' | '長型 Elongated' | '混合 Hybrid';
export type CoreType = 'Polymer 聚合物' | 'Carbon 碳芯' | 'Foam 發泡芯' | 'Nomex 紙蜂窩' | 'Thermoformed 熱壓' | 'Kinetic 動能避震';
export type FaceMaterial = 'T300 碳纖' | 'T700 碳纖' | '玻璃纖維' | 'FiberFlex 玻璃纖維' | '複合材質' | 'Raw Carbon Fiber' | 'Kevlar 編織' | '石墨 Graphite';
export type PaddleLevel = '新手' | '中階' | '進階' | '職業';
export type PaddleTag = '小紅書熱門' | 'CP值首選' | '新手友善' | '近期熱搜' | '護肘友善' | '高顏值' | '電商爆款' | '經典長青';

export interface Paddle {
  slug: string;
  brand: PaddleBrand;
  model: string;
  year: number;
  level: PaddleLevel;
  shape: PaddleShape;
  weight: string;        // e.g. "7.8 oz"
  thickness: string;     // e.g. "16mm"
  core: CoreType;
  face: FaceMaterial;
  gripLength: string;    // e.g. "5.25"
  gripSize: string;      // e.g. "4.25"
  priceUSD?: number;
  priceTWD: number;
  rating: {
    power: number;       // 1-100
    control: number;
    spin: number;
    forgiveness: number;
  };
  endorser?: string;     // 代言選手
  highlights: string[];  // 2-4 個產品特色
  bestFor: string;       // 適合族群
  cons?: string;         // 缺點
  usapApproved: boolean; // USAP 認證
  discontinued?: boolean;
  tags?: PaddleTag[];    // 熱門標籤（小紅書熱門 / CP值 / 新手友善…）
  colors: {              // 示意圖配色（拍面主色 / 點綴色）
    face: string;
    accent: string;
  };
}

export const PADDLE_DATABASE: Paddle[] = [
  // ===== JOOLA =====
  {
    slug: 'joola-perseus-pro-v-16mm',
    brand: 'JOOLA',
    model: 'Perseus Pro V 16mm',
    year: 2026,
    level: '職業',
    shape: '混合 Hybrid',
    weight: '8.1 oz',
    thickness: '16mm',
    core: 'Thermoformed 熱壓',
    face: 'T700 碳纖',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceUSD: 300,
    priceTWD: 9500,
    rating: { power: 95, control: 96, spin: 94, forgiveness: 89 },
    endorser: 'Ben Johns',
    highlights: ['2026 最新第五代旗艦', 'Ben Johns 親用款', 'KineticFrame 喉部彈性框架', '觸球吸震、出球更集中'],
    bestFor: 'DUPR 4.0+ 追求全能與精準的進階球員',
    cons: '入門者難駕馭，價格高',
    usapApproved: true,
    tags: ['近期熱搜', '小紅書熱門'],
    colors: { face: '#1a1a2e', accent: '#c9a86a' },
  },
  {
    slug: 'joola-perseus-pro-v-14mm',
    brand: 'JOOLA',
    model: 'Perseus Pro V 14mm',
    year: 2026,
    level: '職業',
    shape: '混合 Hybrid',
    weight: '7.9 oz',
    thickness: '14mm',
    core: 'Thermoformed 熱壓',
    face: 'T700 碳纖',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceUSD: 300,
    priceTWD: 9500,
    rating: { power: 98, control: 92, spin: 94, forgiveness: 83 },
    endorser: 'Ben Johns',
    highlights: ['2026 第五代 14mm 版', '更薄更快、揮速優勢', 'KineticFrame 喉部彈性框架', '單打與強攻首選'],
    bestFor: '攻擊型選手、單打愛好者',
    usapApproved: true,
    colors: { face: '#1a1a2e', accent: '#c9a86a' },
  },
  {
    slug: 'joola-hyperion-cfs-16mm',
    brand: 'JOOLA',
    model: 'Hyperion CFS 16mm',
    year: 2022,
    level: '進階',
    shape: '長型 Elongated',
    weight: '8.0 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceUSD: 200,
    priceTWD: 6500,
    rating: { power: 91, control: 93, spin: 92, forgiveness: 85 },
    highlights: ['JOOLA 經典熱賣款', '均衡性能代名詞', 'CFS 碳摩擦面板旋轉佳', '二手市場流通量大'],
    bestFor: 'DUPR 3.5-4.5 中進階全能型',
    usapApproved: true,
    tags: ['經典長青'],
    colors: { face: '#16213e', accent: '#e94560' },
  },
  {
    slug: 'joola-scorpeus-pro-iv',
    brand: 'JOOLA',
    model: 'Scorpeus Pro IV',
    year: 2024,
    level: '進階',
    shape: '寬型 Widebody',
    weight: '7.9 oz',
    thickness: '16mm',
    core: 'Thermoformed 熱壓',
    face: 'T700 碳纖',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceTWD: 8800,
    rating: { power: 92, control: 95, spin: 93, forgiveness: 90 },
    endorser: 'Collin Johns',
    highlights: ['Collin Johns 使用', '寬型甜蜜點大', '控球型 Perseus 替代', '低震感手肘友善'],
    bestFor: '控球型進階選手',
    usapApproved: true,
    colors: { face: '#0f3460', accent: '#e2b04a' },
  },
  {
    slug: 'joola-magnus-3',
    brand: 'JOOLA',
    model: 'Magnus Pro IV',
    year: 2024,
    level: '進階',
    shape: '長型 Elongated',
    weight: '8.1 oz',
    thickness: '16mm',
    core: 'Thermoformed 熱壓',
    face: 'T700 碳纖',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceTWD: 8800,
    rating: { power: 96, control: 88, spin: 90, forgiveness: 82 },
    endorser: 'Tyson McGuffin',
    highlights: ['Tyson McGuffin 簽名', '強力底線抽球', '長型進攻'],
    bestFor: '進攻型選手、底線主攻',
    cons: '略重、軟球手感較硬',
    usapApproved: true,
    colors: { face: '#232323', accent: '#ff6b35' },
  },

  // ===== Selkirk =====
  {
    slug: 'selkirk-labs-boomstik',
    brand: 'Selkirk',
    model: 'LABS Project Boomstik',
    year: 2025,
    level: '職業',
    shape: '長型 Elongated',
    weight: '8.1 oz',
    thickness: '14mm',
    core: 'Thermoformed 熱壓',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceTWD: 9900,
    rating: { power: 97, control: 88, spin: 93, forgiveness: 80 },
    highlights: ['Selkirk LABS 實驗系列', '長型進攻火力頂級', '台灣有現貨通路（美版／亞版）'],
    bestFor: 'DUPR 4.5+ 純進攻流',
    cons: '容錯偏低，新手不易駕馭；美版與亞版規格略有差異',
    usapApproved: true,
    tags: ['近期熱搜'],
    colors: { face: '#1a1a1a', accent: '#ff4d00' },
  },
  {
    slug: 'selkirk-luxx-control-air-invikta',
    brand: 'Selkirk',
    model: 'LUXX Control Air Invikta',
    year: 2023,
    level: '進階',
    shape: '長型 Elongated',
    weight: '8.0 oz',
    thickness: '20mm',
    core: 'Foam 發泡芯',
    face: 'T700 碳纖',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceUSD: 250,
    priceTWD: 8500,
    rating: { power: 84, control: 99, spin: 92, forgiveness: 93 },
    highlights: ['20mm 超厚控球王', 'Float Foam 發泡邊框', 'Dink 對戰穩定度頂級', '手感極軟'],
    bestFor: '控球流、網前 Dink 戰術愛好者',
    cons: '力量偏弱，殺球需自帶揮速',
    usapApproved: true,
    tags: ['小紅書熱門'],
    colors: { face: '#2d132c', accent: '#f0a500' },
  },
  {
    slug: 'selkirk-vanguard-power-air',
    brand: 'Selkirk',
    model: 'Vanguard Power Air Invikta',
    year: 2023,
    level: '進階',
    shape: '長型 Elongated',
    weight: '8.1 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: 'T700 碳纖',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceTWD: 8200,
    rating: { power: 94, control: 89, spin: 91, forgiveness: 84 },
    highlights: ['空氣動力學開孔喉部', '揮拍速度快', '進攻火力充足'],
    bestFor: '進攻型中進階',
    usapApproved: true,
    colors: { face: '#101820', accent: '#ee2737' },
  },
  {
    slug: 'selkirk-amped-s2',
    brand: 'Selkirk',
    model: 'Amped Epic / S2',
    year: 2021,
    level: '中階',
    shape: '寬型 Widebody',
    weight: '7.9 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: 'FiberFlex 玻璃纖維',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceTWD: 4900,
    rating: { power: 85, control: 92, spin: 87, forgiveness: 93 },
    highlights: ['新手友善的 Selkirk', 'S2 甜蜜點極大', '玻纖容錯高', '長青經典款'],
    bestFor: 'DUPR 2.5-3.5 新手進階',
    usapApproved: true,
    tags: ['經典長青', '新手友善'],
    colors: { face: '#1b3b6f', accent: '#65c3ba' },
  },

  // ===== SLK by Selkirk（Selkirk 平價副牌）=====
  {
    slug: 'slk-halo-control-max',
    brand: 'SLK by Selkirk',
    model: 'Halo Control Max 16mm',
    year: 2024,
    level: '中階',
    shape: '長型 Elongated',
    weight: '8.0 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: 'Raw Carbon Fiber',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceUSD: 150,
    priceTWD: 4600,
    rating: { power: 85, control: 92, spin: 90, forgiveness: 90 },
    highlights: ['Selkirk 技術下放平價副牌', '原始碳纖面板', '半價體驗大廠品質'],
    bestFor: '想升級碳纖拍的新手/中階',
    usapApproved: true,
    tags: ['CP值首選'],
    colors: { face: '#0b2545', accent: '#8da9c4' },
  },
  {
    slug: 'slk-neo-2',
    brand: 'SLK by Selkirk',
    model: 'NEO 2.0',
    year: 2024,
    level: '新手',
    shape: '寬型 Widebody',
    weight: '7.6 oz',
    thickness: '13mm',
    core: 'Polymer 聚合物',
    face: '玻璃纖維',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceUSD: 60,
    priceTWD: 1990,
    rating: { power: 75, control: 86, spin: 78, forgiveness: 94 },
    highlights: ['兩千有找的大廠入門拍', '輕量好上手', '甜蜜點大'],
    bestFor: '第一支拍、預算有限的完全新手',
    cons: '進步到中階後會想換',
    usapApproved: true,
    tags: ['新手友善', 'CP值首選'],
    colors: { face: '#227c9d', accent: '#ffcb77' },
  },

  // ===== Paddletek =====
  {
    slug: 'paddletek-tempest-wave-pro',
    brand: 'Paddletek',
    model: 'Tempest Wave Pro',
    year: 2019,
    level: '中階',
    shape: '寬型 Widebody',
    weight: '7.8 oz',
    thickness: '13mm',
    core: 'Polymer 聚合物',
    face: '石墨 Graphite',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceUSD: 150,
    priceTWD: 4600,
    rating: { power: 82, control: 93, spin: 85, forgiveness: 91 },
    highlights: ['十年長青控球經典', '石墨面板手感細膩', '無數教練推薦的第二支拍'],
    bestFor: '重視手感與控球的新手升級',
    usapApproved: true,
    tags: ['經典長青'],
    colors: { face: '#22333b', accent: '#5bc0be' },
  },
  {
    slug: 'paddletek-bantam-ts-5',
    brand: 'Paddletek',
    model: 'Bantam TS-5 Pro',
    year: 2023,
    level: '中階',
    shape: '寬型 Widebody',
    weight: '7.8 oz',
    thickness: '14.3mm',
    core: 'Polymer 聚合物',
    face: '玻璃纖維',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceTWD: 5200,
    rating: { power: 88, control: 90, spin: 86, forgiveness: 92 },
    highlights: ['Bantam 系列彈性核心', '甜蜜點大', '攻守均衡'],
    bestFor: '想要多一點力量的中階球員',
    usapApproved: true,
    colors: { face: '#3d0000', accent: '#ffd23f' },
  },
  {
    slug: 'paddletek-bantam-alw-c',
    brand: 'Paddletek',
    model: 'Bantam TKO-C 14.3mm',
    year: 2024,
    level: '職業',
    shape: '混合 Hybrid',
    weight: '8.0 oz',
    thickness: '14.3mm',
    core: 'Polymer 聚合物',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.125"',
    priceTWD: 8500,
    rating: { power: 93, control: 94, spin: 93, forgiveness: 88 },
    endorser: 'Anna Leigh Waters',
    highlights: ['女子世界第一 ALW 親用款', '攻擊力與控球兼備', '細握把適合小手'],
    bestFor: '女性球員、全能型進階選手',
    usapApproved: true,
    tags: ['近期熱搜', '小紅書熱門'],
    colors: { face: '#4b0082', accent: '#ff7bac' },
  },

  // ===== Six Zero =====
  {
    slug: 'six-zero-double-black-diamond',
    brand: 'Six Zero',
    model: 'Double Black Diamond Control 14mm',
    year: 2023,
    level: '進階',
    shape: '混合 Hybrid',
    weight: '7.9 oz',
    thickness: '14mm',
    core: 'Thermoformed 熱壓',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceUSD: 160,
    priceTWD: 5300,
    rating: { power: 92, control: 93, spin: 95, forgiveness: 87 },
    highlights: ['海外論壇公認 CP 值神拍', '旋轉頂級', '性能接近旗艦、價格少 40%'],
    bestFor: '預算有限但要職業級性能',
    usapApproved: true,
    tags: ['CP值首選', '近期熱搜'],
    colors: { face: '#111111', accent: '#00b4d8' },
  },
  {
    slug: 'six-zero-ruby',
    brand: 'Six Zero',
    model: 'Ruby',
    year: 2025,
    level: '職業',
    shape: '長型 Elongated',
    weight: '8.0 oz',
    thickness: '14mm',
    core: 'Foam 發泡芯',
    face: 'Kevlar 編織',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceTWD: 7900,
    rating: { power: 95, control: 92, spin: 94, forgiveness: 84 },
    highlights: ['全發泡核心新世代', 'Kevlar 紅色編織面板', '力量與手感兼得'],
    bestFor: 'DUPR 4.0+ 想嘗鮮發泡芯科技',
    usapApproved: true,
    tags: ['近期熱搜', '高顏值'],
    colors: { face: '#7b1e1e', accent: '#f4d35e' },
  },

  // ===== Engage =====
  {
    slug: 'engage-pursuit-pro1',
    brand: 'Engage',
    model: 'Pursuit Pro EX 6.0',
    year: 2024,
    level: '進階',
    shape: '混合 Hybrid',
    weight: '8.0 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: 'Raw Carbon Fiber',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceTWD: 7500,
    rating: { power: 89, control: 94, spin: 91, forgiveness: 92 },
    highlights: ['美國老牌品質穩定', '甜蜜點大', '控球與容錯兼顧'],
    bestFor: 'DUPR 3.0-4.5 全能型',
    usapApproved: true,
    colors: { face: '#013a63', accent: '#61a5c2' },
  },

  // ===== Franklin =====
  {
    slug: 'franklin-signature-pro',
    brand: 'Franklin',
    model: 'Signature Pro Series 16mm',
    year: 2023,
    level: '中階',
    shape: '寬型 Widebody',
    weight: '7.9 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: '複合材質',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceUSD: 100,
    priceTWD: 3200,
    rating: { power: 84, control: 90, spin: 88, forgiveness: 92 },
    highlights: ['MaxGrit 高摩擦表面', '美國國民品牌', '新手升級首選之一'],
    bestFor: '新手進階到中階',
    usapApproved: true,
    tags: ['新手友善', 'CP值首選'],
    colors: { face: '#1d3557', accent: '#e63946' },
  },
  {
    slug: 'franklin-c45',
    brand: 'Franklin',
    model: 'C45 16mm',
    year: 2024,
    level: '進階',
    shape: '長型 Elongated',
    weight: '8.1 oz',
    thickness: '16mm',
    core: 'Thermoformed 熱壓',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceTWD: 7200,
    rating: { power: 93, control: 91, spin: 93, forgiveness: 85 },
    endorser: 'Christian Alshon',
    highlights: ['Christian Alshon 使用', 'Franklin 首款頂級熱壓拍', '45° 碳纖編織'],
    bestFor: '進攻型進階選手',
    usapApproved: true,
    colors: { face: '#212529', accent: '#4cc9f0' },
  },

  // ===== CRBN =====
  {
    slug: 'crbn-1x-power',
    brand: 'CRBN',
    model: '1X Power Series 14mm',
    year: 2023,
    level: '進階',
    shape: '長型 Elongated',
    weight: '8.1 oz',
    thickness: '14mm',
    core: 'Thermoformed 熱壓',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.125"',
    priceTWD: 7900,
    rating: { power: 96, control: 87, spin: 93, forgiveness: 81 },
    highlights: ['重量級進攻', '底線抽球威脅', '熱壓成型剛性強'],
    bestFor: '進攻型、手臂力量好',
    cons: '長時間打手肘易累',
    usapApproved: true,
    colors: { face: '#0d0d0d', accent: '#d90429' },
  },
  {
    slug: 'crbn-trufoam-genesis',
    brand: 'CRBN',
    model: 'TruFoam Genesis 16mm',
    year: 2025,
    level: '職業',
    shape: '混合 Hybrid',
    weight: '7.9 oz',
    thickness: '16mm',
    core: 'Foam 發泡芯',
    face: 'Raw Carbon Fiber',
    gripLength: '5.25"',
    gripSize: '4.125"',
    priceTWD: 9800,
    rating: { power: 94, control: 94, spin: 95, forgiveness: 86 },
    highlights: ['100% 發泡核心先驅', '甜蜜點均勻不衰減', '耐用度大幅提升'],
    bestFor: '追求最新科技的職業級選手',
    usapApproved: true,
    tags: ['近期熱搜'],
    colors: { face: '#001219', accent: '#94d2bd' },
  },

  // ===== Gearbox =====
  {
    slug: 'gearbox-pro-power-elongated',
    brand: 'Gearbox',
    model: 'Pro Power Elongated',
    year: 2023,
    level: '進階',
    shape: '長型 Elongated',
    weight: '8.0 oz',
    thickness: '14mm',
    core: 'Carbon 碳芯',
    face: 'T700 碳纖',
    gripLength: '5.625"',
    gripSize: '4.0"',
    priceTWD: 8900,
    rating: { power: 96, control: 86, spin: 90, forgiveness: 78 },
    highlights: ['SST 一體碳纖結構（無聚合物芯）', '力量怪獸', '獨家專利製程'],
    bestFor: '力量流、想要極致出球速度',
    cons: '握把偏細、手感獨特需適應',
    usapApproved: true,
    colors: { face: '#240046', accent: '#ff9e00' },
  },

  // ===== PROLITE =====
  {
    slug: 'prolite-titan-pro',
    brand: 'PROLITE',
    model: 'Titan Pro Black Diamond',
    year: 2021,
    level: '新手',
    shape: '寬型 Widebody',
    weight: '7.7 oz',
    thickness: '12.7mm',
    core: 'Polymer 聚合物',
    face: '玻璃纖維',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceTWD: 3400,
    rating: { power: 78, control: 89, spin: 80, forgiveness: 96 },
    highlights: ['美國最老匹克球品牌之一', '甜蜜點超大', '輕量手臂友善'],
    bestFor: 'DUPR 2.0-3.0 完全新手',
    cons: '力量較弱',
    usapApproved: true,
    tags: ['新手友善'],
    colors: { face: '#343a40', accent: '#74c69d' },
  },

  // ===== Vatic Pro =====
  {
    slug: 'vatic-pro-prism-flash',
    brand: 'Vatic Pro',
    model: 'Prism Flash 16mm',
    year: 2023,
    level: '中階',
    shape: '長型 Elongated',
    weight: '7.9 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.125"',
    priceUSD: 100,
    priceTWD: 3300,
    rating: { power: 86, control: 91, spin: 92, forgiveness: 88 },
    highlights: ['百元美金神拍', '海外新手社群推薦率極高', '控球與旋轉超越價位'],
    bestFor: '第一次換碳纖拍的預算型玩家',
    usapApproved: true,
    tags: ['CP值首選', '小紅書熱門', '新手友善'],
    colors: { face: '#1a1b41', accent: '#baff29' },
  },
  {
    slug: 'vatic-pro-flash',
    brand: 'Vatic Pro',
    model: 'Flash 14mm',
    year: 2023,
    level: '進階',
    shape: '長型 Elongated',
    weight: '7.9 oz',
    thickness: '14mm',
    core: 'Thermoformed 熱壓',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.125"',
    priceTWD: 4200,
    rating: { power: 91, control: 89, spin: 93, forgiveness: 85 },
    highlights: ['新興品牌高 CP', '熱壓成型力量足', '旋轉出色'],
    bestFor: '預算有限的進攻型玩家',
    usapApproved: true,
    tags: ['CP值首選'],
    colors: { face: '#231942', accent: '#e0aaff' },
  },

  // ===== Electrum =====
  {
    slug: 'electrum-model-e-pro',
    brand: 'Electrum',
    model: 'Model E Elite',
    year: 2023,
    level: '進階',
    shape: '長型 Elongated',
    weight: '8.0 oz',
    thickness: '13mm',
    core: 'Polymer 聚合物',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.125"',
    priceTWD: 7200,
    rating: { power: 94, control: 88, spin: 94, forgiveness: 82 },
    highlights: ['13mm 超薄手感直接', '旋轉頂級', '小眾高手品牌'],
    bestFor: '進階進攻型',
    usapApproved: true,
    colors: { face: '#2b2d42', accent: '#ffd60a' },
  },

  // ===== Onix =====
  {
    slug: 'onix-z5',
    brand: 'Onix',
    model: 'Z5 Graphite',
    year: 2016,
    level: '新手',
    shape: '寬型 Widebody',
    weight: '7.8 oz',
    thickness: '12.7mm',
    core: 'Nomex 紙蜂窩',
    face: '石墨 Graphite',
    gripLength: '5"',
    gripSize: '4.25"',
    priceUSD: 90,
    priceTWD: 2800,
    rating: { power: 84, control: 85, spin: 78, forgiveness: 90 },
    highlights: ['史上最暢銷入門拍之一', 'Nomex 核心出球脆彈', '網球轉項玩家最愛'],
    bestFor: '喜歡直接手感的新手、網球轉匹克球',
    cons: 'Nomex 核心聲音大、震手感明顯',
    usapApproved: true,
    tags: ['經典長青', '電商爆款'],
    colors: { face: '#1f7a8c', accent: '#ffbf00' },
  },
  {
    slug: 'onix-evoke-premier',
    brand: 'Onix',
    model: 'Evoke Premier',
    year: 2021,
    level: '中階',
    shape: '寬型 Widebody',
    weight: '8.0 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: '複合材質',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceTWD: 4900,
    rating: { power: 88, control: 90, spin: 86, forgiveness: 89 },
    endorser: 'Matt Wright & Lucy Kovalova（曾用）',
    highlights: ['職業雙打冠軍曾用款', '平衡全面', '耐用度佳'],
    bestFor: '中階全能型',
    usapApproved: true,
    colors: { face: '#264653', accent: '#e76f51' },
  },

  // ===== HEAD（實體通路好買）=====
  {
    slug: 'head-radical-elite',
    brand: 'HEAD',
    model: 'Radical Elite',
    year: 2022,
    level: '新手',
    shape: '寬型 Widebody',
    weight: '8.1 oz',
    thickness: '13mm',
    core: 'Polymer 聚合物',
    face: '玻璃纖維',
    gripLength: '5"',
    gripSize: '4.25"',
    priceUSD: 50,
    priceTWD: 1690,
    rating: { power: 78, control: 85, spin: 77, forgiveness: 93 },
    highlights: ['大廠背書的千元級入門拍', '台灣體育用品店好買', '耐操抗撞'],
    bestFor: '想先花小錢試試匹克球的人',
    cons: '性能天花板低',
    usapApproved: true,
    tags: ['新手友善', 'CP值首選'],
    colors: { face: '#f77f00', accent: '#003049' },
  },
  {
    slug: 'head-radical-tour',
    brand: 'HEAD',
    model: 'Radical Tour Co',
    year: 2023,
    level: '中階',
    shape: '寬型 Widebody',
    weight: '8.0 oz',
    thickness: '14mm',
    core: 'Polymer 聚合物',
    face: '石墨 Graphite',
    gripLength: '5"',
    gripSize: '4.25"',
    priceUSD: 130,
    priceTWD: 3900,
    rating: { power: 85, control: 89, spin: 84, forgiveness: 90 },
    highlights: ['網球大廠工藝', '控制取向', '品質穩定保固完善'],
    bestFor: '網球/壁球轉項的中階玩家',
    usapApproved: true,
    colors: { face: '#d62828', accent: '#fcbf49' },
  },

  // ===== Niupipo（電商爆款）=====
  {
    slug: 'niupipo-mx07',
    brand: 'Niupipo',
    model: 'MX-07',
    year: 2021,
    level: '新手',
    shape: '寬型 Widebody',
    weight: '8.0 oz',
    thickness: '13mm',
    core: 'Polymer 聚合物',
    face: '玻璃纖維',
    gripLength: '4.75"',
    gripSize: '4.25"',
    priceUSD: 45,
    priceTWD: 1290,
    rating: { power: 75, control: 84, spin: 76, forgiveness: 95 },
    highlights: ['Amazon / 蝦皮銷量王', 'USAPA 認證千元拍', '常見兩支組合裝更划算'],
    bestFor: '完全新手、想買一組全家一起玩',
    cons: '進階後必換，轉賣殘值低',
    usapApproved: true,
    tags: ['電商爆款', '小紅書熱門', '新手友善'],
    colors: { face: '#023e8a', accent: '#48cae4' },
  },

  // ===== 11SIX24 =====
  {
    slug: 'elevensix24-jelly-bean',
    brand: '11SIX24',
    model: 'Jelly Bean',
    year: 2024,
    level: '新手',
    shape: '寬型 Widebody',
    weight: '7.7 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: '玻璃纖維',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceUSD: 100,
    priceTWD: 3300,
    rating: { power: 80, control: 88, spin: 82, forgiveness: 94 },
    highlights: ['馬卡龍配色高顏值', '社群曬拍熱門款', '軟彈手感新手不震手'],
    bestFor: '重視顏值與手感的新手',
    usapApproved: true,
    tags: ['高顏值', '小紅書熱門', '新手友善'],
    colors: { face: '#ffafcc', accent: '#a2d2ff' },
  },
  {
    slug: 'elevensix24-hurache-x',
    brand: '11SIX24',
    model: 'Hurache-X Control 16mm',
    year: 2024,
    level: '進階',
    shape: '混合 Hybrid',
    weight: '8.0 oz',
    thickness: '16mm',
    core: 'Thermoformed 熱壓',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceUSD: 160,
    priceTWD: 5300,
    rating: { power: 88, control: 94, spin: 92, forgiveness: 90 },
    highlights: ['海外評測網高分常客', '控球容錯雙高', '中價位打旗艦性能'],
    bestFor: 'DUPR 3.5+ 控球流',
    usapApproved: true,
    tags: ['CP值首選', '近期熱搜'],
    colors: { face: '#283618', accent: '#dda15e' },
  },

  // ===== Ronbus =====
  {
    slug: 'ronbus-r1-16',
    brand: 'Ronbus',
    model: 'R1.16',
    year: 2023,
    level: '中階',
    shape: '長型 Elongated',
    weight: '7.9 oz',
    thickness: '16mm',
    core: 'Polymer 聚合物',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.125"',
    priceUSD: 80,
    priceTWD: 2690,
    rating: { power: 84, control: 91, spin: 90, forgiveness: 88 },
    highlights: ['80 美金碳纖拍天花板', '論壇 CP 值討論常勝軍', '控球旋轉遠超價位'],
    bestFor: '學生黨、預算 3 千內想要碳纖拍',
    usapApproved: true,
    tags: ['CP值首選', '小紅書熱門'],
    colors: { face: '#10002b', accent: '#c77dff' },
  },

  // ===== Friday =====
  {
    slug: 'friday-original-2',
    brand: 'Friday',
    model: 'Original 2.0 16mm',
    year: 2024,
    level: '中階',
    shape: '長型 Elongated',
    weight: '8.0 oz',
    thickness: '16mm',
    core: 'Thermoformed 熱壓',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceUSD: 110,
    priceTWD: 3600,
    rating: { power: 89, control: 89, spin: 91, forgiveness: 86 },
    highlights: ['百元價位少見的熱壓工藝', '性能均衡無明顯短板', '新銳品牌口碑快速累積'],
    bestFor: '想一步到位買熱壓拍的預算玩家',
    usapApproved: true,
    tags: ['CP值首選'],
    colors: { face: '#003566', accent: '#ffc300' },
  },

  // ===== Bread & Butter =====
  {
    slug: 'bread-butter-filth',
    brand: 'Bread & Butter',
    model: 'Filth 16mm',
    year: 2023,
    level: '進階',
    shape: '混合 Hybrid',
    weight: '8.0 oz',
    thickness: '16mm',
    core: 'Thermoformed 熱壓',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceUSD: 180,
    priceTWD: 5900,
    rating: { power: 93, control: 88, spin: 93, forgiveness: 85 },
    highlights: ['塗鴉街頭風設計辨識度極高', '出球彈度大（Pop 強）', '社群話題度高'],
    bestFor: '進攻型、喜歡張揚設計的玩家',
    cons: '彈性大，細膩小球需適應',
    usapApproved: true,
    tags: ['高顏值', '小紅書熱門'],
    colors: { face: '#e07be0', accent: '#231123' },
  },

  // ===== Volair =====
  {
    slug: 'volair-mach-1-forza',
    brand: 'Volair',
    model: 'Mach 1 Forza 16mm',
    year: 2023,
    level: '進階',
    shape: '混合 Hybrid',
    weight: '8.1 oz',
    thickness: '16mm',
    core: 'Thermoformed 熱壓',
    face: 'Raw Carbon Fiber',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceUSD: 170,
    priceTWD: 5600,
    rating: { power: 90, control: 90, spin: 91, forgiveness: 88 },
    highlights: ['甜蜜點大的熱壓拍', '攻守轉換順', '新銳品牌評測高分'],
    bestFor: '中階升進階的全能型',
    usapApproved: true,
    colors: { face: '#03045e', accent: '#00f5d4' },
  },

  // ===== Honolulu =====
  {
    slug: 'honolulu-j2k',
    brand: 'Honolulu',
    model: 'J2K 16mm',
    year: 2024,
    level: '進階',
    shape: '混合 Hybrid',
    weight: '8.0 oz',
    thickness: '16mm',
    core: 'Thermoformed 熱壓',
    face: 'Kevlar 編織',
    gripLength: '5.5"',
    gripSize: '4.25"',
    priceUSD: 180,
    priceTWD: 5900,
    rating: { power: 91, control: 92, spin: 94, forgiveness: 87 },
    highlights: ['Kevlar 編織面板話題款', '2024-25 海外爆紅', '旋轉與手感兼得'],
    bestFor: '想嘗鮮 Kevlar 面板的中進階玩家',
    usapApproved: true,
    tags: ['近期熱搜', '小紅書熱門'],
    colors: { face: '#8338ec', accent: '#ffbe0b' },
  },

  // ===== ProKennex（護肘）=====
  {
    slug: 'prokennex-black-ace-pro',
    brand: 'ProKennex',
    model: 'Black Ace Pro',
    year: 2023,
    level: '進階',
    shape: '寬型 Widebody',
    weight: '7.9 oz',
    thickness: '14mm',
    core: 'Kinetic 動能避震',
    face: 'T700 碳纖',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceUSD: 250,
    priceTWD: 8300,
    rating: { power: 91, control: 92, spin: 89, forgiveness: 88 },
    highlights: ['獨家 Kinetic 動能避震艙', '網球肘/手腕傷球友救星', '台灣品牌代工淵源深'],
    bestFor: '有手肘手腕舊傷、重視健康打球的人',
    cons: '價格高、手感獨特需適應',
    usapApproved: true,
    tags: ['護肘友善'],
    colors: { face: '#000000', accent: '#c0c0c0' },
  },

  // ===== LUZZ（台灣通路能見度最高的匹克球拍品牌之一）=====
  {
    slug: 'luzz-pro-4',
    brand: 'LUZZ',
    model: 'Pro 4（龍捲風／地獄火）',
    year: 2025,
    level: '中階',
    shape: '寬型 Widebody',
    weight: '7.9 oz',
    thickness: '16mm',
    core: 'Foam 發泡芯',
    face: 'T700 碳纖',
    gripLength: '5.25"',
    gripSize: '4.25"',
    priceTWD: 5280,
    rating: { power: 89, control: 91, spin: 90, forgiveness: 92 },
    highlights: ['UPA-A + USAP PBCoR .43 雙認證', 'PEBAZ 核心 + MPP 微孔泡棉吸震', '3D 凹槽碳纖拍面增旋轉', '台灣 momo／PChome／實體店都買得到'],
    bestFor: '想要台灣現貨、售後方便的中階球員',
    usapApproved: true,
    tags: ['新手友善'],
    colors: { face: '#8b0000', accent: '#ffb703' },
  },
];

/* ===== 正版購買管道 =====
 * 查證日期：2026-08-29。每筆均逐頁查證品牌官網／通路網站原文，連結皆實測可開啟。
 *
 * 判定原則（寧可保守，不誇大授權層級）：
 *   tw-official 品牌在台灣的官方單位或其指定通路。目前僅 JOOLA 台灣（2022 年
 *               設立台灣辦公室，官網 joola.tw 指定蝦皮商城為購買管道）符合此標準。
 *   tw-store    台灣實體／網路匹克球通路，確認有販售該品牌，但站上未出現
 *               「總代理／原廠授權」等正式字樣，故不宣稱其為代理商。
 *   global      台灣查無販售管道，列品牌官網作為正版來源（多數美國新銳品牌
 *               不直郵台灣，需透過集運或代購）。
 *
 * 註：台灣目前絕大多數匹克球拍品牌並無正式總代理，蝦皮上的多為水貨／代購。
 */
export type PurchaseChannelType = 'tw-official' | 'tw-store' | 'global';

export interface PurchaseChannel {
  type: PurchaseChannelType;
  label: string;   // 顯示名稱
  url: string;
  note?: string;   // 補充說明（會顯示為 tooltip）
}

export const CHANNEL_TYPE_META: Record<PurchaseChannelType, { icon: string; badge: string }> = {
  'tw-official': { icon: '✅', badge: '台灣官方' },
  'tw-store': { icon: '🛒', badge: '台灣通路' },
  'global': { icon: '🌐', badge: '品牌官網' },
};

const GLOBAL_ONLY = (label: string, url: string, note = '台灣查無販售管道，需自品牌官網海外購買（多數不直郵台灣，需集運或代購）'): PurchaseChannel[] =>
  [{ type: 'global', label, url, note }];

export const BRAND_PURCHASE: Partial<Record<PaddleBrand, PurchaseChannel[]>> = {
  // 唯一查證到在台設有官方單位的品牌
  JOOLA: [
    { type: 'tw-official', label: 'JOOLA 台灣官方', url: 'https://joola.tw/', note: 'JOOLA 於 2022 年設立台灣辦公室，官網為繁中官方站' },
    { type: 'tw-store', label: '官方蝦皮商城', url: 'https://shopee.tw/joolataiwanofficial', note: 'JOOLA 台灣官網指定的購買管道' },
  ],

  // 台灣有實際販售通路（未宣稱代理層級）
  HEAD: [
    { type: 'tw-store', label: 'HEAD 台灣運動網', url: 'https://www.headsports.com.tw/categories/head-pickleball', note: '由 INFIN SPORT TECHNOLOGY 經營的 HEAD 台灣銷售網站，設有匹克球專區' },
    { type: 'global', label: 'HEAD 全球官網', url: 'https://www.head.com/', note: '品牌全球官網' },
  ],
  Selkirk: [
    { type: 'tw-store', label: '匹克窩 Pickle Nest', url: 'https://picklenest.tw/collections/selkirk-sports', note: '台灣匹克球通路，設有 Selkirk 專區（非原廠授權標示）' },
    { type: 'global', label: 'Selkirk 官網', url: 'https://www.selkirk.com/' },
  ],
  'SLK by Selkirk': [
    { type: 'tw-store', label: '匹克窩 Pickle Nest', url: 'https://picklenest.tw/collections/selkirk-sports', note: 'SLK 為 Selkirk 副牌，可於此通路的 Selkirk 專區查詢' },
    { type: 'global', label: 'Selkirk 官網', url: 'https://www.selkirk.com/' },
  ],
  Paddletek: [
    { type: 'tw-store', label: '匹克窩 Pickle Nest', url: 'https://picklenest.tw/', note: '台灣匹克球通路，有販售 Paddletek（非原廠授權標示）' },
    { type: 'global', label: 'Paddletek 官網', url: 'https://www.paddletek.com/' },
  ],
  ProKennex: [
    { type: 'tw-store', label: '匹克窩 Pickle Nest', url: 'https://picklenest.tw/', note: 'ProKennex 母公司為台灣光男企業，台灣可於此通路購得匹克球拍' },
    { type: 'global', label: 'ProKennex 官網', url: 'https://prokennex.com/collections/pickleball' },
  ],
  Honolulu: [
    { type: 'tw-store', label: 'PicklePickle 台北', url: 'https://www.picklepickle.tw/', note: '台北內湖匹克球專賣店，自述為「美國專業匹克球拍品牌代理」（未見原廠授權字樣）' },
    { type: 'global', label: 'Honolulu 官網', url: 'https://808pickle.com/', note: '官網幣別選單含 Taiwan (TWD)，直郵可能性高但無明文' },
  ],
  Friday: [
    { type: 'tw-store', label: 'PicklePickle 台北', url: 'https://www.picklepickle.tw/', note: '台北內湖匹克球專賣店，販售 Friday 全系列（AURA/Fever/Original）' },
    { type: 'global', label: 'Friday 官網', url: 'https://fridaypickle.com/', note: '官網 FAQ 明示僅寄送美國與加拿大，不直郵台灣' },
  ],

  // 台灣查無販售管道，僅列品牌官網
  'Six Zero': GLOBAL_ONLY('Six Zero 官網', 'https://www.sixzeropickleball.com/'),
  Engage: GLOBAL_ONLY('Engage 官網', 'https://engagepickleball.com/'),
  Franklin: GLOBAL_ONLY('Franklin 官網', 'https://franklinsports.com/', '台灣曾有嘖嘖官方集資首賣，但無常態官方通路；蝦皮多為平行輸入'),
  CRBN: GLOBAL_ONLY('CRBN 官網', 'https://crbnpickleball.com/'),
  Gearbox: GLOBAL_ONLY('Gearbox 官網', 'https://gearboxsports.com/'),
  PROLITE: GLOBAL_ONLY('PROLITE 官網', 'https://proliteusa.com/'),
  'Vatic Pro': GLOBAL_ONLY('Vatic Pro 官網', 'https://vaticpro.com/'),
  Electrum: GLOBAL_ONLY('Electrum 官網', 'https://www.electrumpickleball.com/'),
  Onix: GLOBAL_ONLY('Onix 官網', 'https://www.onixpickleball.com/'),
  Niupipo: GLOBAL_ONLY('Niupipo 官網', 'https://niupipo.com/', '官網運送政策僅限美國；台灣蝦皮所見多為第三方水貨／代購'),
  '11SIX24': GLOBAL_ONLY('11SIX24 官網', 'https://11six24.com/'),
  Ronbus: GLOBAL_ONLY('Ronbus 官網', 'https://ronbus.com/', '官網保固僅限美國境內出貨，海外需洽當地經銷（台灣查無）'),
  'Bread & Butter': GLOBAL_ONLY('Bread & Butter 官網', 'https://www.bnbpickleball.com/', '品牌設有亞洲站，經銷集中於馬來西亞、新加坡'),
  Volair: GLOBAL_ONLY('Volair 官網', 'https://volair.com/', '官網支援國際運送，運費於結帳時計算'),
};

export const getPurchaseChannels = (brand: PaddleBrand): PurchaseChannel[] =>
  BRAND_PURCHASE[brand] ?? [];

/* ===== 蝦皮分潤連結 =====
 * 這些是站方的蝦皮分潤（聯盟行銷）連結，透過它們下單站方會獲得回饋，
 * 售價與你自己搜尋進去完全相同。頁面上會明確揭露此事。
 *
 * 收錄原則（重要）：
 *   1. 只收「本站資料庫實際推薦的型號」，不放無品牌雜牌拍衝分潤——
 *      那會讓整個資料庫的可信度歸零。
 *   2. 每筆都標明賣場與是否為水貨／平行輸入，讓使用者自行判斷。
 *   3. 官方管道（BRAND_PURCHASE）永遠優先顯示於分潤連結之上。
 */
export interface AffiliateOffer {
  shop: string;          // 賣場名稱
  url: string;           // 蝦皮分潤短連結
  variant?: string;      // 版本／規格說明（如「美版」「14/16mm」）
  parallelImport?: boolean; // 是否為水貨／平行輸入（無原廠保固）
}

// 商品層級：直接對應到某一支球拍
export const PADDLE_AFFILIATES: Record<string, AffiliateOffer[]> = {
  'joola-perseus-pro-v-16mm': [
    { shop: '力揚體育', url: 'https://s.shopee.tw/1qbcGNhaEh', variant: '600558 / 600555' },
    { shop: '丘林體育 Chilling', url: 'https://s.shopee.tw/6q0IDb6ch9', variant: '14 / 16mm 可選' },
  ],
  'joola-perseus-pro-v-14mm': [
    { shop: '丘林體育 Chilling', url: 'https://s.shopee.tw/6q0IDb6ch9', variant: '14 / 16mm 可選' },
    { shop: '力揚體育', url: 'https://s.shopee.tw/1qbcGNhaEh', variant: '600558 / 600555' },
  ],
  'selkirk-labs-boomstik': [
    { shop: '匹克魂', url: 'https://s.shopee.tw/5LBUQs4249', variant: '美版（長／寬版）', parallelImport: true },
    { shop: '古大體育 匹克魂', url: 'https://s.shopee.tw/7VFz10Toy1', variant: '亞版 Raw Carbon', parallelImport: true },
  ],
  'luzz-pro-4': [
    { shop: '美國 LUZZ 官方賣場', url: 'https://s.shopee.tw/1LfLfaoqem', variant: '龍捲風／地獄火' },
    { shop: '庫鎷尹戶外', url: 'https://s.shopee.tw/3LQQ3JkyLa', variant: 'Inferno 地獄火 極光藍套餐' },
  ],
};

// 賣場層級：該賣場確認有經營此品牌，作為找不到單品連結時的入口
export const BRAND_SHOP_AFFILIATES: Partial<Record<PaddleBrand, AffiliateOffer[]>> = {
  JOOLA: [{ shop: '力揚體育 蝦皮賣場', url: 'https://s.shopee.tw/gPesTfl8M' }],
  Selkirk: [{ shop: '力揚體育 蝦皮賣場', url: 'https://s.shopee.tw/gPesTfl8M' }],
  LUZZ: [{ shop: '力揚體育 蝦皮賣場', url: 'https://s.shopee.tw/gPesTfl8M' }],
};

export const getAffiliateOffers = (paddle: Paddle): AffiliateOffer[] => {
  const direct = PADDLE_AFFILIATES[paddle.slug];
  if (direct?.length) return direct;
  return BRAND_SHOP_AFFILIATES[paddle.brand] ?? [];
};

export const hasAffiliate = (paddle: Paddle): boolean => getAffiliateOffers(paddle).length > 0;

// 依品牌取得
export const getPaddlesByBrand = (brand: PaddleBrand) =>
  PADDLE_DATABASE.filter(p => p.brand === brand);

// 依等級取得
export const getPaddlesByLevel = (level: PaddleLevel) =>
  PADDLE_DATABASE.filter(p => p.level === level);

// 依 slug 取得
export const getPaddleBySlug = (slug: string) =>
  PADDLE_DATABASE.find(p => p.slug === slug);

// 品牌列表（依資料庫實際出現順序去重）
export const PADDLE_BRANDS: PaddleBrand[] = Array.from(
  new Set(PADDLE_DATABASE.map(p => p.brand))
);

export const PADDLE_LEVELS: PaddleLevel[] = ['新手', '中階', '進階', '職業'];

export const PADDLE_TAGS: PaddleTag[] = [
  '新手友善', 'CP值首選', '小紅書熱門', '近期熱搜', '電商爆款', '高顏值', '護肘友善', '經典長青',
];

// 比較功能上限
export const MAX_COMPARE = 4;
