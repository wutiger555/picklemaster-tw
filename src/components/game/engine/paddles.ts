/**
 * 球拍與必殺技。
 * 規格照真實的熱門球拍（尺寸、厚度、重量、面材取自官方與大型零售商公布的數字），
 * 數值差異反映在球速、穩定度、旋轉與觸及範圍；每支拍再附一招動漫式必殺技。
 */

export type SpecialId = 'inferno' | 'thunder' | 'phantom' | 'frost' | 'cyclone' | 'quake';

export interface SpecialDef {
  id: SpecialId;
  /** 必殺技名稱（切入畫面用的大字） */
  name: string;
  /** 英文副標 */
  title: string;
  /** 一句話說明效果 */
  desc: string;
  /** 怎麼破解：每招的破解法都不一樣，選拍時就看得到 */
  counter: string;
  color: string;
  glow: string;
}

export const SPECIALS: Record<SpecialId, SpecialDef> = {
  inferno: {
    id: 'inferno',
    name: '烈焰爆裂抽擊',
    title: 'INFERNO DRIVE',
    desc: '時速破百的火球直線轟出。接不準會被震退、只能撈出高球。',
    counter: '抓準完美時機回擊就能破解，時機差會被震退。',
    color: '#ff5a1f',
    glow: '#ffb347',
  },
  thunder: {
    id: 'thunder',
    name: '天雷貫地',
    title: 'THUNDER STRIKE',
    desc: '把球擊上高空，落雷般垂直砸下，落地後暴衝彈跳。',
    counter: '地上會先出現落雷標記：提早跑到彈跳後的位置。',
    color: '#5b8cff',
    glow: '#d6e4ff',
  },
  phantom: {
    id: 'phantom',
    name: '幻影分身',
    title: 'PHANTOM DINK',
    desc: '球分裂成三顆幻影並大幅蛇行，只有一顆是真的。',
    counter: '盯住不透明的那顆，幻影快落地時會消失。',
    color: '#b05bff',
    glow: '#f0d6ff',
  },
  frost: {
    id: 'frost',
    name: '絕對零度',
    title: 'ABSOLUTE ZERO',
    desc: '極強下旋，落地瞬間凍結在地面，幾乎彈不起來。',
    counter: '落地前截擊就不會被凍住；落點會結冰，踩到會打滑。',
    color: '#4fd8ff',
    glow: '#e6fbff',
  },
  cyclone: {
    id: 'cyclone',
    name: '龍捲旋風',
    title: 'CYCLONE SLICE',
    desc: '螺旋鑽進場內，落地瞬間被旋風捲著往側邊竄開。',
    counter: '看旋風往哪邊吹，先站到那一側；截擊它就不會竄開。',
    color: '#2dd4bf',
    glow: '#ccfbf1',
  },
  quake: {
    id: 'quake',
    name: '震地重砲',
    title: 'TECTONIC CANNON',
    desc: '沉重的平抽砸進場內，落地掀起震波，附近的人站不穩、腳下打滑。',
    counter: '在它落地前截擊，或離落點遠一點再接。',
    color: '#f59e0b',
    glow: '#fde68a',
  },
};

export type PaddleShape = 'elongated' | 'standard' | 'widebody' | 'hybrid';

export interface PaddleLook {
  /** 拍面版型（照各拍原廠配色的樣式） */
  pattern: 'slash' | 'cap' | 'gloss' | 'diamonds' | 'wave' | 'raw';
  base: string;
  primary: string;
  accent: string;
  edge: string;
  grip: string;
}

export interface PaddleSpec {
  id: string;
  /** 型號簡稱（選拍畫面的大字） */
  name: string;
  brand: string;
  model: string;
  tagline: string;
  shape: PaddleShape;
  /** 長寬（公尺）、厚度（毫米）、重量（盎司） */
  length: number;
  width: number;
  thickness: number;
  weightOz: number;
  face: string;
  core: string;
  /** 給介面顯示的 0–10 評分 */
  rating: { power: number; control: number; spin: number; reach: number };
  /** 實際影響物理的倍率 */
  mods: { pace: number; error: number; spin: number; reach: number };
  special: SpecialId;
  look: PaddleLook;
}

const IN = 0.0254;

export const PADDLES: PaddleSpec[] = [
  {
    id: 'blaze',
    name: 'Perseus',
    brand: 'JOOLA',
    model: 'JOOLA Ben Johns Perseus 3S 14mm',
    tagline: '世界球王 Ben Johns 的長拍：薄芯出球快，進攻首選',
    shape: 'elongated',
    length: 16.5 * IN,
    width: 7.5 * IN,
    thickness: 14,
    weightOz: 7.8,
    face: 'Charged Carbon 碳纖維',
    core: '14 mm Propulsion 發泡蜂巢芯',
    rating: { power: 9.5, control: 6.5, spin: 8, reach: 9 },
    mods: { pace: 1.1, error: 0.99, spin: 1.05, reach: 0.06 },
    special: 'inferno',
    look: { pattern: 'slash', base: '#111214', primary: '#e11d2e', accent: '#ff8a1f', edge: '#1a1a1a', grip: '#111111' },
  },
  {
    id: 'storm',
    name: 'Vanguard Invikta',
    brand: 'Selkirk',
    model: 'Selkirk VANGUARD Power Air Invikta',
    tagline: 'Selkirk 招牌長拍：氣動拍框揮得快，攻守都穩',
    shape: 'elongated',
    length: 16.5 * IN,
    width: 7.375 * IN,
    thickness: 13,
    weightOz: 7.9,
    face: '碳纖維',
    core: '13 mm（1/2 吋）聚合物蜂巢',
    rating: { power: 8, control: 8, spin: 8, reach: 7.5 },
    mods: { pace: 1.04, error: 0.99, spin: 1.05, reach: 0.02 },
    special: 'thunder',
    look: { pattern: 'cap', base: '#16181b', primary: '#7a8088', accent: '#a3e635', edge: '#202226', grip: '#1b1b1b' },
  },
  {
    id: 'mirage',
    name: 'Signature',
    brand: 'Franklin',
    model: 'Franklin Ben Johns Signature Pro 16mm',
    tagline: '玻纖面手感軟、好控，球館最常見的經典款',
    shape: 'elongated',
    length: 16.5 * IN,
    width: 7.5 * IN,
    thickness: 16,
    weightOz: 8.1,
    face: '玻璃纖維',
    core: '16 mm 聚丙烯蜂巢',
    rating: { power: 6.5, control: 9.5, spin: 7, reach: 6.5 },
    mods: { pace: 0.97, error: 0.97, spin: 0.95, reach: -0.03 },
    special: 'phantom',
    look: { pattern: 'gloss', base: '#14254f', primary: '#1e3a8a', accent: '#f8fafc', edge: '#0f1d40', grip: '#0f172a' },
  },
  {
    id: 'glacier',
    name: 'Double Black Diamond',
    brand: 'Six Zero',
    model: 'Six Zero Double Black Diamond Control 16mm',
    tagline: '生碳面旋轉強、控球細，網前 dink 一把好手',
    shape: 'hybrid',
    length: 16.3 * IN,
    width: 7.7 * IN,
    thickness: 16,
    weightOz: 8.1,
    face: '生碳纖維 Raw Carbon',
    core: '16 mm 聚合物蜂巢',
    rating: { power: 7.5, control: 8.5, spin: 10, reach: 8 },
    mods: { pace: 1.0, error: 1.0, spin: 1.3, reach: 0.04 },
    special: 'frost',
    look: { pattern: 'diamonds', base: '#0d0e10', primary: '#d4d4d8', accent: '#f4f4f5', edge: '#18181b', grip: '#0b0b0c' },
  },
  {
    id: 'gale',
    name: 'Tempest Wave Pro',
    brand: 'Paddletek',
    model: 'Paddletek Tempest Wave Pro-C 14.3mm',
    tagline: '標準拍型、8 吋寬拍面，甜區大反應快',
    shape: 'standard',
    length: 15.875 * IN,
    width: 8 * IN,
    thickness: 14.3,
    weightOz: 8.0,
    face: 'PT-700 生碳纖維',
    core: '14.3 mm 聚合物蜂巢',
    rating: { power: 7, control: 8.5, spin: 8.5, reach: 7 },
    mods: { pace: 0.99, error: 0.97, spin: 1.12, reach: 0 },
    special: 'cyclone',
    look: { pattern: 'wave', base: '#141414', primary: '#dc2626', accent: '#f5f5f5', edge: '#991b1b', grip: '#171717' },
  },
  {
    id: 'titan',
    name: 'Pursuit Pro EX',
    brand: 'Engage',
    model: 'Engage Pursuit Pro EX 6.0',
    tagline: '寬拍面加重款，擊球紮實沉重',
    shape: 'widebody',
    length: 16 * IN,
    width: 8 * IN,
    thickness: 16,
    weightOz: 8.25,
    face: 'Toray T700 生碳纖維',
    core: '16 mm（5/8 吋）聚合物蜂巢',
    rating: { power: 9, control: 7.5, spin: 6.5, reach: 7 },
    mods: { pace: 1.08, error: 0.99, spin: 1, reach: 0 },
    special: 'quake',
    look: { pattern: 'raw', base: '#121212', primary: '#facc15', accent: '#ffffff', edge: '#1c1c1c', grip: '#111111' },
  },
];

export const paddleById = (id: string) => PADDLES.find((p) => p.id === id) ?? PADDLES[0];

/** 能量：完美擊球、致勝球與長來回會累積，滿了才能放必殺 */
export const ENERGY = {
  max: 100,
  perfect: 16,
  good: 7,
  winner: 18,
  counter: 30,
  longRally: 2,
} as const;
