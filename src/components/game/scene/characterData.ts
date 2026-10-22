import * as THREE from 'three';

export interface Look {
  key: string;
  skin: string;
  hair: string;
  hairStyle: 'short' | 'ponytail' | 'buzz';
  shirt: string;
  accent: string;
  shorts: string;
  shoes: string;
  headwear: 'visor' | 'cap' | 'headband';
  headwearColor: string;
  number: string;
  name: string;
}

/** 揮拍末端（甜區）在世界座標的位置，給揮拍軌跡特效讀取 */
export const paddleTips = new Map<number, THREE.Vector3>();

/** 依隊伍與球拍給出外型 */
export const lookFor = (team: 0 | 1, paddleId: string): Look => {
  if (team === 0) {
    return {
      key: `p-${paddleId}`,
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
      name: 'TAIWAN',
    };
  }
  const variants: Record<string, Partial<Look>> = {
    blaze: { shirt: '#c2410c', accent: '#fde68a', headwear: 'headband', hairStyle: 'short', hair: '#3b2416' },
    storm: { shirt: '#1d4ed8', accent: '#fde047', headwear: 'cap', headwearColor: '#0f172a', hairStyle: 'buzz' },
    mirage: { shirt: '#7e22ce', accent: '#99f6e4', headwear: 'visor', headwearColor: '#f5f3ff', hairStyle: 'ponytail', hair: '#5b3a1e' },
    glacier: { shirt: '#e0f2fe', accent: '#0284c7', shorts: '#0c4a6e', headwear: 'cap', headwearColor: '#0ea5e9', hairStyle: 'ponytail', hair: '#e5e7eb' },
  };
  return {
    key: `o-${paddleId}`,
    skin: '#c99a74',
    hair: '#111111',
    hairStyle: 'short',
    shirt: '#c2410c',
    accent: '#fde68a',
    shorts: '#111827',
    shoes: '#111827',
    headwear: 'visor',
    headwearColor: '#ffffff',
    number: '23',
    name: 'RIVAL',
    ...variants[paddleId],
  };
};
