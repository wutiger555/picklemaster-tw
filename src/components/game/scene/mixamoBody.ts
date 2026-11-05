import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { type AthleteAssets, loadGltf, suspend } from './athleteAssets';

/**
 * 真實比例的身體（Mixamo 角色，由 scripts/build-mixamo-bodies.mjs 轉檔）。
 * 骨頭改名成選手動作庫用的 Unreal 名稱，動作在載入時從選手骨架重定向過來，
 * 這樣姿勢解算（AthletePoser）兩種身體都能共用。
 */

export type BodyId = 'sporty' | 'hoodie';

const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/game/bodies`;

/** Mixamo 骨頭 → Unreal 骨頭 */
const BONES: Record<string, string> = {
  Hips: 'pelvis',
  Spine: 'spine_01',
  Spine1: 'spine_02',
  Spine2: 'spine_03',
  Neck: 'neck_01',
  Head: 'Head',
};
for (const [m, u] of [
  ['Left', 'l'],
  ['Right', 'r'],
] as const) {
  Object.assign(BONES, {
    [`${m}Shoulder`]: `clavicle_${u}`,
    [`${m}Arm`]: `upperarm_${u}`,
    [`${m}ForeArm`]: `lowerarm_${u}`,
    [`${m}Hand`]: `hand_${u}`,
    [`${m}UpLeg`]: `thigh_${u}`,
    [`${m}Leg`]: `calf_${u}`,
    [`${m}Foot`]: `foot_${u}`,
    [`${m}ToeBase`]: `ball_${u}`,
  });
  for (const f of ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']) {
    for (let j = 1; j <= 3; j++) BONES[`${m}Hand${f}${j}`] = `${f.toLowerCase()}_0${j}_${u}`;
  }
}

/** 動作要搬的骨頭（手指不搬：握拍姿勢另外設） */
export const ANIMATED = Object.values(BONES).filter((n) => !/^(thumb|index|middle|ring|pinky|ball)_/.test(n));

export interface MixamoBody {
  gltf: GLTF;
  clips: Map<string, THREE.AnimationClip>;
}

/**
 * 動作重定向：在世界座標裡把「相對 T-pose 的旋轉」照搬過去（兩邊綁定姿勢都是面向 +Z 的 T-pose）。
 * unit：目標模型的單位換算（Mixamo 是公分 = 0.01）。
 */
export const retarget = (src: THREE.Object3D, clips: Map<string, THREE.AnimationClip>, dstScene: THREE.Object3D, unit = 0.01) => {
  const dst = new THREE.Group();
  dst.scale.setScalar(unit);
  dst.add(dstScene);
  src.updateMatrixWorld(true);
  dst.updateMatrixWorld(true);
  const restQ = (root: THREE.Object3D) => {
    const m = new Map<string, THREE.Quaternion>();
    root.traverse((o) => ANIMATED.includes(o.name) && !m.has(o.name) && m.set(o.name, o.getWorldQuaternion(new THREE.Quaternion())));
    return m;
  };
  const srcRest = restQ(src);
  const dstRest = restQ(dst);
  const dstBone = new Map<string, THREE.Object3D>();
  dst.traverse((o) => ANIMATED.includes(o.name) && dstBone.set(o.name, o));
  const order: string[] = [];
  dstBone.get('pelvis')!.traverse((o) => ANIMATED.includes(o.name) && order.push(o.name));
  const srcPelvis = src.getObjectByName('pelvis')!;
  const dstPelvis = dstBone.get('pelvis')!;
  const ratio = dstPelvis.getWorldPosition(new THREE.Vector3()).y / srcPelvis.getWorldPosition(new THREE.Vector3()).y;
  const restLocal = new Map(order.map((n) => [n, dstBone.get(n)!.quaternion.clone()]));
  const restPos = dstPelvis.position.clone();

  const mixer = new THREE.AnimationMixer(src);
  const out = new Map<string, THREE.AnimationClip>();
  const q = new THREE.Quaternion();
  const pq = new THREE.Quaternion();
  const p = new THREE.Vector3();
  for (const clip of clips.values()) {
    const action = mixer.clipAction(clip);
    action.play();
    const n = Math.max(2, Math.round(clip.duration * 30) + 1);
    const times = new Float32Array(n);
    const quats = new Map(order.map((b) => [b, new Float32Array(n * 4)]));
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = Math.min(clip.duration, i / 30);
      times[i] = t;
      action.time = t;
      mixer.update(0);
      src.updateMatrixWorld(true);
      for (const name of order) {
        const bone = dstBone.get(name)!;
        const s = src.getObjectByName(name);
        if (!s) continue;
        s.getWorldQuaternion(q).multiply(pq.copy(srcRest.get(name)!).invert()).multiply(dstRest.get(name)!);
        bone.parent!.getWorldQuaternion(pq);
        bone.quaternion.copy(pq.invert().multiply(q));
        bone.updateMatrixWorld(true);
        bone.quaternion.toArray(quats.get(name)!, i * 4);
      }
      srcPelvis.getWorldPosition(p).multiplyScalar(ratio);
      dstPelvis.parent!.worldToLocal(p);
      p.toArray(pos, i * 3);
    }
    action.stop();
    mixer.uncacheAction(clip);
    const tracks: THREE.KeyframeTrack[] = order.map((name) => new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times, quats.get(name)!));
    tracks.push(new THREE.VectorKeyframeTrack('pelvis.position', times, pos));
    out.set(clip.name, new THREE.AnimationClip(clip.name, clip.duration, tracks));
  }
  // 還原成綁定姿勢（之後 SkeletonUtils.clone 才會是 T-pose）
  for (const name of order) dstBone.get(name)!.quaternion.copy(restLocal.get(name)!);
  dstPelvis.position.copy(restPos);
  dst.remove(dstScene);
  return out;
};

export const useMixamoBody = (id: BodyId | null, assets: AthleteAssets): MixamoBody | null =>
  id === null
    ? null
    : suspend(`body-${id}`, async () => {
        const gltf = await loadGltf(`${base}/${id}/body.gltf`);
        gltf.scene.traverse((o) => {
          if (o.name.includes('$AssimpFbx$')) return;
          const k = o.name.replace(/^mixamorig\d*:?/, '');
          if (BONES[k]) o.name = BONES[k];
        });
        const src = SkeletonUtils.clone(assets.body.scene);
        return { gltf, clips: retarget(src, assets.clips, gltf.scene) };
      });
