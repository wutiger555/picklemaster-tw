import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { type AthleteAssets, loadGltf, suspend } from './athleteAssets';
import { retarget } from './mixamoBody';

/**
 * VRM 角色（100Avatars 系列，CC0；由 scripts/build-vrm-characters.mjs 轉檔）。
 * 檔案裡的 VRM humanoid 骨架對應告訴我們哪個節點是哪根骨頭：改名成選手動作庫用的 Unreal 名稱，
 * 動作在載入時從選手骨架重定向過來，姿勢解算（AthletePoser）就和其他身體共用。
 * VRM 0.x 的模型面向 -Z，外面包一層轉 180°，變成和其他身體一樣面向 +Z、右手在 -X。
 */

const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/game/vrm`;

/** VRM humanoid 骨頭 → Unreal 骨頭 */
const BONES: Record<string, string> = {
  hips: 'pelvis',
  spine: 'spine_01',
  chest: 'spine_02',
  upperChest: 'spine_03',
  neck: 'neck_01',
  head: 'Head',
};
for (const [v, u] of [
  ['left', 'l'],
  ['right', 'r'],
] as const) {
  Object.assign(BONES, {
    [`${v}Shoulder`]: `clavicle_${u}`,
    [`${v}UpperArm`]: `upperarm_${u}`,
    [`${v}LowerArm`]: `lowerarm_${u}`,
    [`${v}Hand`]: `hand_${u}`,
    [`${v}UpperLeg`]: `thigh_${u}`,
    [`${v}LowerLeg`]: `calf_${u}`,
    [`${v}Foot`]: `foot_${u}`,
    [`${v}Toes`]: `ball_${u}`,
  });
  for (const [f, name] of [
    ['Thumb', 'thumb'],
    ['Index', 'index'],
    ['Middle', 'middle'],
    ['Ring', 'ring'],
    ['Little', 'pinky'],
  ] as const) {
    ['Proximal', 'Intermediate', 'Distal'].forEach((seg, j) => (BONES[`${v}${f}${seg}`] = `${name}_0${j + 1}_${u}`));
  }
}

export interface VrmBody {
  /** 已轉成面向 +Z 的根節點（綁定姿勢） */
  root: THREE.Object3D;
  clips: Map<string, THREE.AnimationClip>;
}

interface VrmHumanoid {
  humanBones: { bone: string; node: number }[];
}

export const useVrmBody = (id: string | null, assets: AthleteAssets): VrmBody | null =>
  id === null
    ? null
    : suspend(`vrm-${id}`, async () => {
        const gltf = await loadGltf(`${base}/${id}.glb`);
        const humanoid = (gltf.parser.json.extensions?.VRM as { humanoid?: VrmHumanoid } | undefined)?.humanoid;
        if (!humanoid) throw new Error(`${id}: no VRM humanoid`);
        const byNode = new Map(humanoid.humanBones.map((b) => [b.node, BONES[b.bone]]));
        gltf.scene.traverse((o) => {
          const idx = gltf.parser.associations.get(o)?.nodes;
          const name = idx === undefined ? undefined : byNode.get(idx);
          if (name) o.name = name;
          // 沒有對應的節點（頭髮、衣角的搖晃骨）改名，免得撞名
          else if (Object.values(BONES).includes(o.name)) o.name = `${o.name}_vrm`;
        });
        const root = new THREE.Group();
        root.rotation.y = Math.PI;
        root.add(gltf.scene);
        root.updateMatrixWorld(true);
        const src = SkeletonUtils.clone(assets.body.scene);
        return { root, clips: retarget(src, assets.clips, root, 1) };
      });
