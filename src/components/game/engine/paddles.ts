/**
 * 球拍與必殺技。
 * 規格依真實球拍分類（長拍／標準／寬拍／混合，14–16 mm 蜂巢芯，碳纖維或玻纖面），
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
  /** 拍面花紋 */
  pattern: 'flame' | 'bolt' | 'holo' | 'rawcarbon' | 'wind' | 'stone';
  base: string;
  primary: string;
  accent: string;
  edge: string;
  grip: string;
}

export interface PaddleSpec {
  id: string;
  name: string;
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
    name: '赤焰',
    model: 'BLAZE 14 Elongated',
    tagline: '長拍身、薄芯，出球最快的進攻拍',
    shape: 'elongated',
    length: 16.5 * IN,
    width: 7.5 * IN,
    thickness: 14,
    weightOz: 8.2,
    face: 'T700 碳纖維',
    core: '14 mm 聚合物蜂巢',
    rating: { power: 9.5, control: 6.5, spin: 8, reach: 9 },
    mods: { pace: 1.1, error: 0.99, spin: 1.05, reach: 0.06 },
    special: 'inferno',
    look: { pattern: 'flame', base: '#141414', primary: '#ff4d1a', accent: '#ffc233', edge: '#2a2a2a', grip: '#1c1c1c' },
  },
  {
    id: 'storm',
    name: '蒼雷',
    model: 'STORM 16 Standard',
    tagline: '標準拍型，攻守平衡的全能拍',
    shape: 'standard',
    length: 16 * IN,
    width: 7.9 * IN,
    thickness: 16,
    weightOz: 8.0,
    face: 'Toray 碳纖維',
    core: '16 mm 聚合物蜂巢',
    rating: { power: 8, control: 8, spin: 8, reach: 7.5 },
    mods: { pace: 1.04, error: 0.99, spin: 1.05, reach: 0.02 },
    special: 'thunder',
    look: { pattern: 'bolt', base: '#0d1b3d', primary: '#3d7bff', accent: '#ffe14d', edge: '#0a0f1f', grip: '#f2f2f2' },
  },
  {
    id: 'mirage',
    name: '幻月',
    model: 'MIRAGE 16 Widebody',
    tagline: '寬拍面、甜區大，dink 最穩的控球拍',
    shape: 'widebody',
    length: 15.5 * IN,
    width: 8.25 * IN,
    thickness: 16,
    weightOz: 7.8,
    face: '玻璃纖維',
    core: '16 mm 聚合物蜂巢',
    rating: { power: 6.5, control: 9.5, spin: 7, reach: 6.5 },
    mods: { pace: 0.97, error: 0.97, spin: 0.95, reach: -0.03 },
    special: 'phantom',
    look: { pattern: 'holo', base: '#1b1030', primary: '#b05bff', accent: '#40e0d0', edge: '#e8e8f0', grip: '#5b2a86' },
  },
  {
    id: 'glacier',
    name: '霜鋒',
    model: 'GLACIER 16 Hybrid',
    tagline: '生碳纖維粗糙拍面，旋轉量最強',
    shape: 'hybrid',
    length: 16.25 * IN,
    width: 7.75 * IN,
    thickness: 16,
    weightOz: 8.1,
    face: '生碳纖維 Raw Carbon',
    core: '16 mm 聚合物蜂巢',
    rating: { power: 7.5, control: 8.5, spin: 10, reach: 8 },
    mods: { pace: 1.0, error: 1.0, spin: 1.3, reach: 0.04 },
    special: 'frost',
    look: { pattern: 'rawcarbon', base: '#1a1d22', primary: '#4fd8ff', accent: '#ffffff', edge: '#cfd8e3', grip: '#e9f4ff' },
  },
  {
    id: 'gale',
    name: '疾風',
    model: 'GALE 13 Featherlite',
    tagline: '輕量薄拍，手快、截擊反應最快',
    shape: 'standard',
    length: 15.75 * IN,
    width: 8 * IN,
    thickness: 13,
    weightOz: 7.4,
    face: '3K 碳纖維',
    core: '13 mm 聚合物蜂巢',
    rating: { power: 7, control: 8.5, spin: 8.5, reach: 7 },
    mods: { pace: 0.99, error: 0.97, spin: 1.12, reach: 0 },
    special: 'cyclone',
    look: { pattern: 'wind', base: '#062a26', primary: '#2dd4bf', accent: '#f0fdfa', edge: '#99f6e4', grip: '#134e4a' },
  },
  {
    id: 'titan',
    name: '鎮岳',
    model: 'TITAN 16 Heavyweight',
    tagline: '加重拍頭、手感紮實，重球最穩的力量拍',
    shape: 'widebody',
    length: 16 * IN,
    width: 8.1 * IN,
    thickness: 16,
    weightOz: 8.8,
    face: '玄武岩纖維',
    core: '16 mm 高密度蜂巢',
    rating: { power: 9, control: 7.5, spin: 6.5, reach: 7 },
    mods: { pace: 1.08, error: 0.99, spin: 1, reach: 0 },
    special: 'quake',
    look: { pattern: 'stone', base: '#1c1917', primary: '#f59e0b', accent: '#fde68a', edge: '#44403c', grip: '#292524' },
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
