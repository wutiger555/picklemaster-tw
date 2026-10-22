import * as THREE from 'three';
import type { CharacterDef } from '../characters';

export interface Look {
  key: string;
  /** 身體模型：hero（Quaternius）或真實比例的 Mixamo 身體 */
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
  name: string;
  /** 照片臉部貼圖（有的話就取代程式畫的五官） */
  face: string | null;
}

/** 把選角的角色轉成 3D 外型 */
export const lookFromCharacter = (c: CharacterDef): Look => ({
  key: c.id,
  body: c.body,
  skin: c.skin,
  hair: c.hair,
  hairStyle: c.hairStyle,
  shirt: c.shirt,
  accent: c.accent,
  shorts: c.shorts,
  shoes: c.shoes,
  headwear: c.headwear,
  headwearColor: c.headwearColor,
  number: c.number,
  name: c.jersey,
  face: c.face,
});

/** 揮拍末端（甜區）在世界座標的位置，給揮拍軌跡特效讀取 */
export const paddleTips = new Map<number, THREE.Vector3>();
