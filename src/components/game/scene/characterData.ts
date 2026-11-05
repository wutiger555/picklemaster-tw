import * as THREE from 'three';
import type { CharacterDef } from '../characters';

export interface Look {
  key: string;
  /** 身體模型：hero（Quaternius）、真實比例的 Mixamo 身體、或 VRM 角色 */
  body: 'hero' | 'sporty' | 'hoodie' | 'vrm';
  /** VRM 角色的模型 id（public/game/vrm/<id>.glb） */
  vrm: string | null;
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
  vrm: c.vrm ?? null,
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

/** 各角色頭骨的高度（公尺，綁定姿勢），給選角預覽取景：VRM 角色從 1.2 m 的包子到 1.8 m 的老虎都有 */
export const headHeights = new Map<string, number>();

/** 揮拍末端（甜區）在世界座標的位置，給揮拍軌跡特效讀取 */
export const paddleTips = new Map<number, THREE.Vector3>();
