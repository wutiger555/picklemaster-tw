/**
 * 可選角色。照片角色的臉與去背半身像由 macOS Vision 從原始照片偵測、轉正、裁切
 * （只取主角，背景路人一律排除），已取得照片中每位當事人同意公開。
 * 顏色取樣自照片後人工校正（逆光照片膚色偏暗會提亮）。
 * 名字／稱號是暫定的，直接改這裡就好。
 */

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  /** 選角卡的去背半身像；null = 程式生成的預設選手 */
  portrait: string | null;
  /** 貼在 3D 頭部正面的臉（方形、柔邊橢圓遮罩） */
  face: string | null;
  /** 3D 身體：hero = 原創動畫風身材；sporty = 運動球衣；hoodie = 帽 T 休閒 */
  body: 'hero' | 'sporty' | 'hoodie';
  skin: string;
  hair: string;
  hairStyle: 'short' | 'ponytail' | 'buzz';
  shirt: string;
  accent: string;
  shorts: string;
  shoes: string;
  headwear: 'visor' | 'cap' | 'headband' | 'none';
  headwearColor: string;
  number: string;
  jersey: string;
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const img = (file: string) => `${base}/game/characters/${file}`;

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'default',
    body: 'hero',
    name: '台灣隊',
    title: '原創選手',
    portrait: null,
    face: null,
    skin: '#e2b48c',
    hair: '#1c1612',
    hairStyle: 'short',
    shirt: '#0f9f74',
    accent: '#d9fbe9',
    shorts: '#0f172a',
    shoes: '#f8fafc',
    headwear: 'visor',
    headwearColor: '#f8fafc',
    number: '7',
    jersey: 'TAIWAN',
  },
  {
    id: 'p1',
    body: 'hoodie',
    name: '阿灰',
    title: '夜行巴士',
    portrait: img('p1-portrait.webp'),
    face: img('p1-face.webp'),
    skin: '#dcb3a3',
    hair: '#1f1915',
    hairStyle: 'short',
    shirt: '#4b4a5c',
    accent: '#c7c9d9',
    shorts: '#1f2937',
    shoes: '#f1f5f9',
    headwear: 'none',
    headwearColor: '#ffffff',
    number: '1',
    jersey: 'HUI',
  },
  {
    id: 'p2',
    body: 'hoodie',
    name: '城主',
    title: '大阪城下',
    portrait: img('p2-portrait.webp'),
    face: img('p2-face.webp'),
    skin: '#cf9f86',
    hair: '#15110f',
    hairStyle: 'short',
    shirt: '#16181f',
    accent: '#94a3b8',
    shorts: '#111827',
    shoes: '#e5e7eb',
    headwear: 'none',
    headwearColor: '#ffffff',
    number: '11',
    jersey: 'CASTLE',
  },
  {
    id: 'p3',
    body: 'sporty',
    name: '銀框',
    title: '笑容殺手',
    portrait: img('p3-portrait.webp'),
    face: img('p3-face.webp'),
    skin: '#d8a28d',
    hair: '#2b221d',
    hairStyle: 'short',
    shirt: '#ece6da',
    accent: '#64748b',
    shorts: '#1f2937',
    shoes: '#f8fafc',
    headwear: 'none',
    headwearColor: '#ffffff',
    number: '23',
    jersey: 'SMILE',
  },
  {
    id: 'p4',
    body: 'sporty',
    name: '黑框',
    title: '近網壓迫',
    portrait: img('p4-portrait.webp'),
    face: img('p4-face.webp'),
    skin: '#d6a08a',
    hair: '#3a2a20',
    hairStyle: 'short',
    shirt: '#151515',
    accent: '#facc15',
    shorts: '#0f172a',
    shoes: '#111827',
    headwear: 'none',
    headwearColor: '#ffffff',
    number: '3',
    jersey: 'FRAME',
  },
  {
    id: 'p5',
    body: 'sporty',
    name: '帽哥',
    title: '夜場常客',
    portrait: img('p5-portrait.webp'),
    face: img('p5-face.webp'),
    skin: '#d9a98f',
    hair: '#121212',
    hairStyle: 'buzz',
    shirt: '#f3f3f6',
    accent: '#a3a3a3',
    shorts: '#e7d58f',
    shoes: '#9ca3af',
    headwear: 'cap',
    headwearColor: '#bfae8a',
    number: '9',
    jersey: 'CAP',
  },
];

export const characterById = (id: string) => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];

/** 對手：從玩家以外的照片角色中隨機挑一位（沒有照片角色就用預設） */
export const pickOpponent = (mine: string, rand: () => number = Math.random) => {
  const pool = CHARACTERS.filter((c) => c.id !== mine && c.face);
  return pool.length ? pool[Math.floor(rand() * pool.length)] : CHARACTERS[0];
};
