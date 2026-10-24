import type { SkillId } from './engine/skills';

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
  /** 3D 身體：hero = 原創動畫風身材；sporty = 運動球衣；hoodie = 帽 T 休閒；vrm = 現成的 VRM 角色 */
  body: 'hero' | 'sporty' | 'hoodie' | 'vrm';
  /** VRM 角色的模型 id（body 為 vrm 時） */
  vrm?: string;
  /** 角色絕招（和球拍的必殺技分開） */
  skill: SkillId | null;
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

/** VRM 角色：模型本身就是完整造型，配色欄位用不到給預設值；半身像由 scripts/render-vrm-portraits.mjs 算繪 */
function vrmChar(c: { id: string; name: string; title: string; skill: SkillId; shirt: string; accent: string }): CharacterDef {
  return {
    ...c,
    body: 'vrm',
    vrm: c.id,
    portrait: img(`${c.id}-portrait.webp`),
    face: null,
    skin: '#e2b48c',
    hair: '#1c1612',
    hairStyle: 'short',
    shorts: '#0f172a',
    shoes: '#f8fafc',
    headwear: 'none',
    headwearColor: '#ffffff',
    number: '',
    jersey: c.id.toUpperCase(),
  };
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'default',
    skill: 'cheer',
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
    skill: 'squatSmash',
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
    skill: 'spinSmash',
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
    id: 'p4',
    skill: 'splash',
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
    skill: 'dualCurve',
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
  ...[
    // VRM 角色（100Avatars 系列，CC0）：造型都在模型裡，顏色欄位只給選角卡與畫面點綴用
    vrmChar({ id: 'cucumber', name: '酸黃瓜', title: '匹克球吉祥物', skill: 'pickle', shirt: '#4ade80', accent: '#bbf7d0' }),
    vrmChar({ id: 'bao', name: '包子武士', title: '一口一個', skill: 'feast', shirt: '#f5e6c8', accent: '#dc2626' }),
    vrmChar({ id: 'tiger', name: '虎爺', title: '廟口守護神', skill: 'roar', shirt: '#f97316', accent: '#fde68a' }),
    vrmChar({ id: 'beachking', name: '海灘王', title: '颱風天照打', skill: 'wave', shirt: '#38bdf8', accent: '#f472b6' }),
    vrmChar({ id: 'mecha', name: '運動機甲', title: '全自動揮拍', skill: 'overclock', shirt: '#f59e0b', accent: '#7c3aed' }),
    vrmChar({ id: 'anna', name: '狐面', title: '月下狐影', skill: 'foxfire', shirt: '#1f1f2e', accent: '#f9a8d4' }),
  ],
];

export const characterById = (id: string) => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];

/** 對手：從玩家以外的照片角色與 VRM 角色中隨機挑一位（都沒有就用預設） */
export const pickOpponent = (mine: string, rand: () => number = Math.random) => {
  const pool = CHARACTERS.filter((c) => c.id !== mine && (c.face || c.vrm));
  return pool.length ? pool[Math.floor(rand() * pool.length)] : CHARACTERS[0];
};
