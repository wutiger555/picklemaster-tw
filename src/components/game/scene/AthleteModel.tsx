import { useEffect, useMemo, useRef } from 'react';
import { createPortal, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { Athlete, GameEngine } from '../engine/game';
import { teamSide } from '../engine/rules';
import { PLAYER } from '../engine/constants';
import { PaddleModel } from './PaddleModel';
import { sweetSpotY } from './paddleGeometry';
import { type Look, paddleTips } from './characterData';
import { type AthleteAssets, type HairStyle, upperBody, useAthleteAssets, useHair, useImage } from './athleteAssets';

/**
 * 真人比例的選手（Quaternius CC0 模型＋動作庫）。
 * 底層是動作混合：待機／準備蹲姿／慢跑／衝刺依移動速度混合，
 * 揮拍用上半身動作疊上去（跑動中揮拍腳不會滑），擊球瞬間再用 IK 把拍面拉到球的位置。
 * 模型面向本地 +Z、右手在 -X。
 */

// ───────────────────────────── 揮拍動作 ─────────────────────────────

type SwingKind = 'fh' | 'bh' | 'smash';
/** 每種揮拍在動作檔裡的三個時間點：拉拍到底、擊球、收拍 */
const SWINGS: Record<SwingKind, { clip: string; back: number; impact: number; end: number }> = {
  // 由右後下方往前上方揮：正手、低手發球、挑高球
  fh: { clip: 'Sword_Regular_A', back: 0.15, impact: 0.22, end: 0.3 },
  // 由左往右：反手
  bh: { clip: 'Sword_Regular_B', back: 0.12, impact: 0.21, end: 0.32 },
  // 過頂往前下方：殺球
  smash: { clip: 'OverhandThrow', back: 0.27, impact: 0.335, end: 0.46 },
};
const KINDS = Object.keys(SWINGS) as SwingKind[];

const LOCO = ['Idle_Loop', 'Crouch_Idle_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop'] as const;
const OVERLAYS = ['Hit_Knockback', 'Jump_Loop', 'Yes', 'Idle_No_Loop'] as const;
type Overlay = (typeof OVERLAYS)[number];

const HAIR: Record<Look['hairStyle'], HairStyle> = {
  short: 'simpleparted',
  buzz: 'buzzed',
  ponytail: 'buns',
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const approach = (cur: number, target: number, rate: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

// ───────────────────────────── 外觀 ─────────────────────────────

/** 照片臉在 256² 臉圖裡的雙眼中點與眼距（extract-character.swift 依臉框置中裁切） */
const PHOTO_EYES = { x: 126, y: 95, span: 72 };
/** 模型膚色貼圖（1024²）上的雙眼中點與眼距、眼睛到嘴巴的距離（由網格 UV 量出） */
const UV_EYES = { x: 191.5, y: 170, span: 85, mouth: 105 };

/** 照片臉中央（雙頰、鼻樑）的平均顏色，0..255 */
const photoSkin = (face: HTMLImageElement) => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(face, 0, 0, 256, 256);
  const d = g.getImageData(70, 105, 116, 60).data;
  const sum = [0, 0, 0];
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 250) continue;
    sum[0] += d[i];
    sum[1] += d[i + 1];
    sum[2] += d[i + 2];
    n++;
  }
  return n ? sum.map((v) => v / n) : [210, 170, 150];
};

/** 每位選手一張膚色貼圖：整體調成照片膚色，再把照片臉畫到臉部 UV 區 */
const skinTexture = (base: CanvasImageSource, skin: string, face: HTMLImageElement | null) => {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(base, 0, 0, 1024, 1024);
  const img = g.getImageData(0, 0, 1024, 1024);
  const d = img.data;
  // 參考膚色：額頭到臉頰一塊
  let r = 0;
  let gg = 0;
  let b = 0;
  let n = 0;
  for (let y = 120; y < 240; y += 2) {
    for (let x = 160; x < 224; x += 2) {
      const i = (y * 1024 + x) * 4;
      r += d[i];
      gg += d[i + 1];
      b += d[i + 2];
      n++;
    }
  }
  // 有照片就取照片臉頰的平均膚色，身體和臉才接得起來
  const hex = parseInt(skin.slice(1), 16);
  const target = face ? photoSkin(face) : [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  const k = [(target[0] * n) / r, (target[1] * n) / gg, (target[2] * n) / b];
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, d[i] * k[0]);
    d[i + 1] = Math.min(255, d[i + 1] * k[1]);
    d[i + 2] = Math.min(255, d[i + 2] * k[2]);
  }
  g.putImageData(img, 0, 0);
  if (face) {
    // 只取臉的橢圓（柔邊），照片背景不要畫進去
    const f = document.createElement('canvas');
    f.width = f.height = 256;
    const fg = f.getContext('2d')!;
    fg.drawImage(face, 0, 0, 256, 256);
    fg.globalCompositeOperation = 'destination-in';
    fg.translate(128, 124);
    fg.scale(1, 1.38);
    const grad = fg.createRadialGradient(0, 0, 0, 0, 0, 72);
    grad.addColorStop(0.72, '#000');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    fg.fillStyle = grad;
    fg.fillRect(-128, -128, 256, 256);
    const kx = UV_EYES.span / PHOTO_EYES.span;
    const ky = UV_EYES.mouth / 83;
    g.drawImage(f, UV_EYES.x - PHOTO_EYES.x * kx, UV_EYES.y - PHOTO_EYES.y * ky, 256 * kx, 256 * ky);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

/** 背號：名字＋號碼，透明底 */
const numberTexture = (name: string, number: string, color: string) => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = color;
  g.textAlign = 'center';
  g.font = '800 40px "Arial Black", Arial, sans-serif';
  g.fillText(name.slice(0, 8), 128, 52, 236);
  g.font = '900 170px "Arial Black", Arial, sans-serif';
  g.fillText(number, 128, 222, 240);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/**
 * 衣服：在綁定姿勢（T-pose）的座標上切區塊上色——鞋、襪、短褲、球衣、護腕，
 * 球衣背後印背號。這樣同一個模型就能換任何配色，不需要另外的衣服模型。
 */
const dressBody = (mat: THREE.MeshStandardMaterial, look: Look, numTex: THREE.Texture) => {
  const u = {
    uShirt: { value: new THREE.Color(look.shirt) },
    uShorts: { value: new THREE.Color(look.shorts) },
    uShoes: { value: new THREE.Color(look.shoes) },
    uAccent: { value: new THREE.Color(look.accent) },
    uNumber: { value: numTex },
  };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBind;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBind = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vBind;
uniform vec3 uShirt; uniform vec3 uShorts; uniform vec3 uShoes; uniform vec3 uAccent;
uniform sampler2D uNumber;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
float cloth = 0.0;
vec3 clothCol = vec3(0.0);
{
  vec3 p = vBind;
  float ax = abs(p.x);
  if (p.y < 0.115) { cloth = 1.0; clothCol = p.y < 0.03 ? vec3(0.92) : uShoes; }
  else if (p.y < 0.21) { cloth = 1.0; clothCol = vec3(0.93); }
  else if (p.y > 0.6 && p.y < 1.0 && ax < 0.3) { cloth = 1.0; clothCol = uShorts; }
  else if (p.y >= 1.0 && p.y < 1.555 && ax < 0.355) {
    // 圓領：前面低、後面高
    bool neck = p.y > (p.z > 0.0 ? 1.425 + 6.0 * p.x * p.x : 1.49 + 3.0 * p.x * p.x);
    if (!neck) {
      cloth = 1.0;
      clothCol = uShirt;
      // 背號
      if (p.z < 0.0 && ax < 0.13 && p.y > 1.12 && p.y < 1.4) {
        vec4 n = texture2D(uNumber, vec2((0.13 - p.x) / 0.26, (p.y - 1.12) / 0.28));
        clothCol = mix(clothCol, n.rgb, n.a);
      }
      // 胸前小號碼
      if (p.z > 0.0 && p.x > 0.03 && p.x < 0.13 && p.y > 1.28 && p.y < 1.38) {
        vec4 n = texture2D(uNumber, vec2((p.x - 0.03) / 0.1, (p.y - 1.28) / 0.1));
        clothCol = mix(clothCol, n.rgb, n.a);
      }
    }
  }
  else if (ax > 0.6 && ax < 0.645 && p.y > 1.38) { cloth = 1.0; clothCol = uAccent; }
}
diffuseColor.rgb = mix(diffuseColor.rgb, clothCol, cloth);`,
      )
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.82, cloth);')
      .replace(
        '#include <normal_fragment_maps>',
        '#include <normal_fragment_maps>\nnormal = normalize(mix(normal, nonPerturbedNormal, cloth * 0.55));',
      );
  };
  mat.customProgramCacheKey = () => 'athlete-dress';
};

// ───────────────────────────── 骨架 ─────────────────────────────

interface Rig {
  scene: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  bone: (name: string) => THREE.Bone;
  /** 綁定姿勢下，各骨頭在模型空間的旋轉 */
  bindQ: Map<THREE.Object3D, THREE.Quaternion>;
  loco: Record<(typeof LOCO)[number], THREE.AnimationAction>;
  overlay: Record<Overlay, THREE.AnimationAction>;
  swingFull: Record<SwingKind, THREE.AnimationAction>;
  swingUpper: Record<SwingKind, THREE.AnimationAction>;
  all: THREE.AnimationAction[];
  dispose: () => void;
}

const buildRig = (assets: AthleteAssets, hair: THREE.Object3D, look: Look, face: HTMLImageElement | null): Rig => {
  const scene = SkeletonUtils.clone(assets.body.scene);
  scene.updateMatrixWorld(true);
  const bones = new Map<string, THREE.Bone>();
  const bindQ = new Map<THREE.Object3D, THREE.Quaternion>();
  scene.traverse((o) => {
    if ((o as THREE.Bone).isBone) {
      bones.set(o.name, o as THREE.Bone);
      bindQ.set(o, o.getWorldQuaternion(new THREE.Quaternion()));
    }
  });
  const bone = (name: string) => bones.get(name)!;

  const disposables: { dispose: () => void }[] = [];
  let body: THREE.SkinnedMesh | null = null;
  scene.traverse((o) => {
    const m = o as THREE.SkinnedMesh;
    if (!m.isSkinnedMesh) return;
    m.castShadow = true;
    m.frustumCulled = false;
    if (o.name === 'SuperHero_Male') body = m;
    // 照片臉自帶眉毛，模型的就藏起來（眼球留著：眼窩是空的）
    if (face && o.name === 'Eyebrows') o.visible = false;
    if (o.name === 'Eyebrows') {
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      mat.color.set(look.hair);
      m.material = mat;
      disposables.push(mat);
    }
  });
  const bodyMesh = body as THREE.SkinnedMesh | null;
  if (!bodyMesh) throw new Error('athlete body mesh missing');

  const baseMat = bodyMesh.material as THREE.MeshStandardMaterial;
  const mat = baseMat.clone();
  mat.side = THREE.FrontSide;
  const skin = skinTexture(baseMat.map!.image as CanvasImageSource, look.skin, face);
  const num = numberTexture(look.name, look.number, look.accent);
  mat.map = skin;
  dressBody(mat, look, num);
  bodyMesh.material = mat;
  disposables.push(mat, skin, num);

  // 頭髮：和身體同一套骨架，直接綁到身體的骨頭上
  hair.traverse((o) => {
    const src = o as THREE.SkinnedMesh;
    if (!src.isSkinnedMesh) return;
    const m = src.clone();
    const hm = (src.material as THREE.MeshStandardMaterial).clone();
    hm.map = null;
    hm.color.set(look.hair);
    hm.roughness = 0.6;
    m.material = hm;
    m.castShadow = true;
    m.frustumCulled = false;
    m.bind(bodyMesh.skeleton, src.bindMatrix);
    bodyMesh.parent!.add(m);
    disposables.push(hm);
  });

  // 手指：動作檔沒有手指（省檔案），右手握拍、左手半握
  const down = new THREE.Vector3(0, -1, 0);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const q = new THREE.Quaternion();
  for (const side of ['r', 'l'] as const) {
    for (const f of ['index', 'middle', 'ring', 'pinky', 'thumb']) {
      for (let j = 1; j <= 3; j++) {
        const bn = bones.get(`${f}_0${j}_${side}`);
        const child = bn?.children.find((c) => (c as THREE.Bone).isBone);
        if (!bn || !child) continue;
        bn.getWorldPosition(a);
        child.getWorldPosition(b);
        const axis = b.sub(a).normalize().cross(down).normalize();
        axis.applyQuaternion(q.copy(bindQ.get(bn)!).invert());
        const grip = side === 'r' ? 1 : 0.55;
        const ang = (f === 'thumb' ? [0.3, 0.35, 0.3] : [1.1, 1.35, 0.9])[j - 1] * grip;
        bn.quaternion.multiply(q.setFromAxisAngle(axis, ang));
      }
    }
  }

  const mixer = new THREE.AnimationMixer(scene);
  const all: THREE.AnimationAction[] = [];
  const act = (name: string, upper = false) => {
    const clip = assets.clips.get(name);
    if (!clip) throw new Error(`clip ${name} missing`);
    const action = mixer.clipAction(upper ? upperBody(clip) : clip);
    action.play();
    action.setEffectiveWeight(0);
    all.push(action);
    return action;
  };
  const rec = <K extends string>(keys: readonly K[], f: (k: K) => THREE.AnimationAction) =>
    Object.fromEntries(keys.map((k) => [k, f(k)])) as Record<K, THREE.AnimationAction>;

  return {
    scene,
    mixer,
    bone,
    bindQ,
    loco: rec(LOCO, (k) => act(k)),
    overlay: rec(OVERLAYS, (k) => act(k)),
    swingFull: rec(KINDS, (k) => act(SWINGS[k].clip)),
    swingUpper: rec(KINDS, (k) => act(SWINGS[k].clip, true)),
    all,
    dispose: () => {
      mixer.stopAllAction();
      disposables.forEach((d) => d.dispose());
    },
  };
};

/** 以世界座標的軸旋轉一根骨頭（疊在動作之上） */
const _qw = new THREE.Quaternion();
const _qp = new THREE.Quaternion();
const rotateWorld = (bone: THREE.Object3D, q: THREE.Quaternion) => {
  bone.getWorldQuaternion(_qw);
  bone.parent!.getWorldQuaternion(_qp);
  _qw.premultiply(q);
  bone.quaternion.copy(_qp.invert().multiply(_qw));
  bone.updateMatrixWorld(true);
};

/**
 * 頭飾（帽子／遮陽帽／頭帶）：座標以頭骨為原點、軸向和模型一致（+Z 朝前）。
 * 頭骨在模型的 (0, 1.60, -0.017)，頭頂約 1.81。
 */
const Headwear = ({ look }: { look: Look }) => {
  const color = look.headwear === 'headband' ? look.accent : look.headwearColor;
  const mat = <meshStandardMaterial color={color} roughness={0.65} />;
  if (look.headwear === 'cap') {
    return (
      <group position={[0, 0.125, 0.0]}>
        <mesh castShadow scale={[1, 0.82, 1.08]}>
          <sphereGeometry args={[0.118, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {mat}
        </mesh>
        <mesh position={[0, 0.004, 0.115]} rotation={[0.12, 0, 0]} scale={[1, 1, 1.15]}>
          <cylinderGeometry args={[0.1, 0.1, 0.008, 24, 1, false, -Math.PI / 2, Math.PI]} />
          {mat}
        </mesh>
      </group>
    );
  }
  return (
    <group position={[0, 0.115, 0.005]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.12, 1]}>
        <torusGeometry args={[0.104, 0.012, 8, 32]} />
        {mat}
      </mesh>
      {look.headwear === 'visor' && (
        <mesh position={[0, -0.005, 0.11]} rotation={[0.15, 0, 0]} scale={[1, 1, 1.1]}>
          <cylinderGeometry args={[0.1, 0.1, 0.008, 24, 1, false, -Math.PI / 2, Math.PI]} />
          {mat}
        </mesh>
      )}
    </group>
  );
};

/** 球鞋：模型是赤腳，鞋子掛在腳掌骨上（座標同頭飾，用模型軸向） */
const Shoe = ({ look }: { look: Look }) => (
  <group position={[0, -0.042, 0.07]}>
    <mesh castShadow rotation={[Math.PI / 2, 0, 0]} scale={[1.08, 1, 0.78]}>
      <capsuleGeometry args={[0.052, 0.17, 6, 14]} />
      <meshStandardMaterial color={look.shoes} roughness={0.5} />
    </mesh>
    <mesh position={[0, -0.036, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.14, 1.03, 0.25]}>
      <capsuleGeometry args={[0.052, 0.17, 4, 14]} />
      <meshStandardMaterial color="#f4f4f5" roughness={0.75} />
    </mesh>
  </group>
);

// ───────────────────────────── 元件 ─────────────────────────────

interface Props {
  engine: GameEngine;
  index: number;
  look: Look;
  /** 回報拍面位置給揮拍殘影特效（選角預覽不需要） */
  trackTip?: boolean;
}

/** 開發用：在 console 設 window.__athletePose = { clip, t } 可以把選手定格在某個動作 */
declare global {
  interface Window {
    __athletePose?: { clip: string; t: number } | null;
  }
}

export const AthleteModel = ({ engine, index, look, trackTip = true }: Props) => {
  const assets = useAthleteAssets();
  const hair = useHair(HAIR[look.hairStyle]);
  const face = useImage(look.face);
  const rig = useMemo(() => buildRig(assets, hair.scene, look, face), [assets, hair, look, face]);
  useEffect(() => () => rig.dispose(), [rig]);

  const root = useRef<THREE.Group>(null);
  const paddleGrp = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Object3D>(null);
  const spec = engine.athletes[index].paddle;

  // 球拍座標：握把斜穿過拳頭，拍頭朝拇指方向前伸。
  // 揮拍動作來自劍術（刀刃領先），拍面要垂直於掌心，揮出去才是拍面迎球
  const mount = useMemo(() => {
    const d = new THREE.Vector3(0, 0.55, 0.84).normalize();
    const n = new THREE.Vector3().crossVectors(d, new THREE.Vector3(-1, 0, 0)).normalize();
    const x = new THREE.Vector3().crossVectors(d, n);
    const m = new THREE.Matrix4().makeBasis(x, d, n);
    return {
      q: new THREE.Quaternion().setFromRotationMatrix(m),
      p: new THREE.Vector3(-0.035, 0.085, 0.0),
    };
  }, []);

  // 頭飾掛在頭骨上：用綁定姿勢的反旋轉，讓子物件可以直接用模型座標擺放
  const inv = useMemo(() => {
    const q = (n: string) => rig.bindQ.get(rig.bone(n))!.clone().invert();
    return { head: q('Head'), footL: q('foot_l'), footR: q('foot_r') };
  }, [rig]);

  const st = useRef({
    phase: 0,
    idleT: 0,
    yaw: 0,
    crouch: 0.3,
    w: { fh: 0, bh: 0, smash: 0 } as Record<SwingKind, number>,
    swing: 0,
    legK: 0.5,
    over: { Hit_Knockback: 0, Jump_Loop: 0, Yes: 0, Idle_No_Loop: 0 } as Record<Overlay, number>,
    knockAt: -1,
    knockUntil: 0,
    wob: { amp: 0, last: -1, t: 0 },
    contactKey: -1,
    jumpAt: 0,
    jumpH: 0,
    contact: new THREE.Vector3(),
  });
  const tmp = useMemo(
    () => ({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      c: new THREE.Vector3(),
      e: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      up: new THREE.Vector3(0, 1, 0),
      saved: [0, 1, 2, 3].map(() => new THREE.Quaternion()),
      solved: [0, 1, 2, 3].map(() => new THREE.Quaternion()),
    }),
    [],
  );

  useFrame((_, raw) => {
    const g = root.current;
    if (!g) return;
    const a: Athlete = engine.athletes[index];
    const S = st.current;
    const rdt = Math.min(0.05, raw);
    const dt = rdt * engine.timeScale;
    const s = teamSide(a.team);
    const t = engine.time;
    const al = engine.alpha;
    g.position.set(a.prevPos.x + (a.pos.x - a.prevPos.x) * al, 0, a.prevPos.z + (a.pos.z - a.prevPos.z) * al);

    // 開發用定格
    const dbg = import.meta.env.DEV ? window.__athletePose : null;
    if (dbg) {
      g.rotation.y = s > 0 ? Math.PI : 0;
      for (const ac of rig.all) ac.setEffectiveWeight(0);
      const clip = rig.all.find((ac) => ac.getClip().name === dbg.clip) ?? null;
      if (clip) {
        clip.setEffectiveWeight(1);
        clip.time = Math.min(dbg.t, clip.getClip().duration);
      }
      rig.mixer.update(0);
      return;
    }

    // ── 移動：模型座標的速度（+Z 朝網）
    const vx = -s * a.vel.x;
    const vz = -s * a.vel.z;
    const speed = Math.hypot(vx, vz);
    const sw = a.swing;
    const busy = sw.state !== 'idle';
    let back = false;
    let yawT = 0;
    if (speed > 0.5) {
      const psi = Math.atan2(vx, vz);
      if (Math.abs(psi) <= 1.95) yawT = psi * 0.8;
      else {
        yawT = (psi - Math.PI * Math.sign(psi)) * 0.8;
        back = true;
      }
      if (busy) yawT *= 0.35;
    }
    S.yaw = approach(S.yaw, yawT, 10, dt);
    g.rotation.y = (s > 0 ? Math.PI : 0) + S.yaw;

    // ── 準備蹲姿：球朝自己來時壓低，輕吊球更低
    const incoming = engine.phase === 'rally' && engine.rally.lastTeam !== a.team;
    let crouchT = incoming ? 0.45 : 0.28;
    if (busy && sw.button === 'soft') crouchT = 0.7;
    S.crouch = approach(S.crouch, crouchT, 6, dt);

    const run = smoothstep(0, 0.6, speed);
    const spr = smoothstep(3.0, 4.2, speed);
    const L = 2.2 + 0.9 * spr;
    S.phase = (S.phase + dt * Math.max(speed / L, run > 0.05 ? 1 : 0) * (back ? -1 : 1) + 10) % 1;
    S.idleT += rdt;

    // ── 揮拍
    const ball = engine.ball.pos;
    let kind: SwingKind | null = null;
    let clipT = 0;
    let swingT = 0;
    if (busy) {
      // 擊球點：揮拍中用揮拍當下預測的軌跡，蓄力中用導引或球的位置
      let ch = ball.y;
      let side = (ball.x - a.pos.x) * s >= 0 ? 1 : -1;
      const guide = !a.ai && engine.guide ? engine.guide.contact : null;
      if (guide) {
        ch = guide.y;
        side = (guide.x - a.pos.x) * s >= 0 ? 1 : -1;
      }
      if (sw.state === 'swinging') {
        side = sw.forehand;
        if (sw.path && S.contactKey !== sw.contactAt) {
          S.contactKey = sw.contactAt;
          const want = sw.contactAt - sw.pathT0;
          let best = sw.path[0];
          for (const p of sw.path) if (Math.abs(p.t - want) < Math.abs(best.t - want)) best = p;
          if (best) S.contact.set(best.pos.x, best.pos.y, best.pos.z);
        }
        if (sw.path) ch = S.contact.y;
      }
      const special = engine.cinematic && engine.cinematic.team === a.team ? engine.cinematic.id : null;
      kind = sw.button === 'serve' ? 'fh' : (sw.button === 'drive' && ch > 1.4) || special === 'thunder' ? 'smash' : side > 0 ? 'fh' : 'bh';
      const def = SWINGS[kind];
      const tau = t - sw.contactAt;
      const W = PLAYER.swingWindup;
      if (sw.state === 'charging' || tau < -W) {
        clipT = def.back;
        swingT = 1;
      } else if (tau <= 0) {
        clipT = def.back + (def.impact - def.back) * (1 + tau / W);
        swingT = 1;
      } else {
        const F = PLAYER.swingFollow;
        clipT = def.impact + (def.end - def.impact) * clamp01(tau / (F * 0.45));
        swingT = 1 - smoothstep(F * 0.45, F * 1.1, tau);
      }
      // 高球跳殺：起跳時間抓在擊球點前後，球越高跳越高
      const hitAt = sw.state === 'swinging' ? sw.contactAt : !a.ai && engine.guide ? engine.guide.hitT : null;
      if (kind === 'smash' && hitAt !== null && ch > 1.9) {
        S.jumpAt = hitAt;
        S.jumpH = Math.min(0.42, (ch - 1.75) * 0.9);
      }
      // 原地揮拍時腳也跟著弓步；跑動中只動上半身
      S.legK = approach(S.legK, speed > 1 ? 0.1 : 0.55, 8, dt);
    }
    S.swing = approach(S.swing, swingT, swingT > S.swing ? 30 : 9, rdt);
    for (const k of KINDS) S.w[k] = approach(S.w[k], k === kind ? 1 : 0, 22, rdt);
    if (kind) {
      rig.swingFull[kind].time = clipT;
      rig.swingUpper[kind].time = clipT;
    }

    // ── 全身覆蓋：被震退、騰空、得失分反應
    if (a.knockedUntil !== S.knockUntil) {
      S.knockUntil = a.knockedUntil;
      if (a.knockedUntil > t) S.knockAt = t;
    }
    const oT: Record<Overlay, number> = {
      Hit_Knockback: 0,
      Jump_Loop: 0,
      Yes: 0,
      Idle_No_Loop: 0,
    };
    if (t < a.knockedUntil) {
      oT.Hit_Knockback = 0.95;
      rig.overlay.Hit_Knockback.time = Math.min(0.42, t - S.knockAt);
    }
    let lift = 0;
    if (S.jumpH > 0) {
      const u = (t - S.jumpAt) / 0.3;
      if (u >= 1) S.jumpH = 0;
      else if (u > -1) {
        lift = S.jumpH * (1 - u * u);
        oT.Jump_Loop = 0.4 * (1 - u * u);
        rig.overlay.Jump_Loop.time = 0.6;
      }
    }
    if (t < a.jumpUntil) {
      const j = clamp01(1 - (a.jumpUntil - t) / 0.55);
      lift = Math.sin(j * Math.PI) * 0.75;
      oT.Jump_Loop = 0.5;
      rig.overlay.Jump_Loop.time = 0.6;
    }
    if (engine.phase === 'dead' && a.mood && t - a.mood.at < 1.9) {
      const since = t - a.mood.at;
      if (a.mood.won) {
        oT.Yes = 0.9;
        rig.overlay.Yes.time = Math.min(rig.overlay.Yes.getClip().duration, since + 0.1);
      } else {
        oT.Idle_No_Loop = 0.85;
        rig.overlay.Idle_No_Loop.time = Math.min(rig.overlay.Idle_No_Loop.getClip().duration, since + 0.4);
      }
    }
    let ov = 0;
    for (const k of OVERLAYS) {
      S.over[k] = approach(S.over[k], oT[k], 12, rdt);
      ov = Math.max(ov, S.over[k]);
    }

    // ── 權重：混合器會把同一根骨頭上的權重正規化，這裡換算成「佔比」
    const sw1 = Math.min(0.97, S.swing);
    const F = (1 - ov) * sw1 * S.legK;
    const B = (1 - ov) * (1 - sw1 * S.legK);
    const U = ((1 - ov) * sw1 * (1 - S.legK)) / Math.max(0.03, 1 - (1 - ov) * sw1);
    const L0 = rig.loco;
    L0.Idle_Loop.setEffectiveWeight(B * (1 - run) * (1 - S.crouch));
    L0.Crouch_Idle_Loop.setEffectiveWeight(B * (1 - run) * S.crouch);
    L0.Jog_Fwd_Loop.setEffectiveWeight(B * run * (1 - spr));
    L0.Sprint_Loop.setEffectiveWeight(B * run * spr);
    L0.Idle_Loop.time = S.idleT % L0.Idle_Loop.getClip().duration;
    L0.Crouch_Idle_Loop.time = S.idleT % L0.Crouch_Idle_Loop.getClip().duration;
    L0.Jog_Fwd_Loop.time = S.phase * L0.Jog_Fwd_Loop.getClip().duration;
    L0.Sprint_Loop.time = S.phase * L0.Sprint_Loop.getClip().duration;
    const wsum = S.w.fh + S.w.bh + S.w.smash || 1;
    for (const k of KINDS) {
      rig.swingFull[k].setEffectiveWeight((F * S.w[k]) / wsum);
      rig.swingUpper[k].setEffectiveWeight((U * S.w[k]) / wsum);
    }
    const osum = OVERLAYS.reduce((n, k) => n + S.over[k], 0) || 1;
    for (const k of OVERLAYS) rig.overlay[k].setEffectiveWeight((ov * S.over[k]) / osum);
    rig.mixer.update(0);

    // ── 程序化疊加
    // 分腿墊步：對手出手瞬間小跳一下
    const opp = engine.opponentOf(a);
    const since = t - opp.swing.contactAt;
    if (engine.phase === 'rally' && since > 0 && since < 0.22) lift += Math.sin((since / 0.22) * Math.PI) * 0.05;
    g.position.y = lift;

    // 側跑時上半身扭回來面向球網
    const twist = -S.yaw * 0.55 * (1 - S.swing) * (1 - ov);
    if (Math.abs(twist) > 0.01) {
      tmp.q.setFromAxisAngle(tmp.up, twist / 3);
      for (const n of ['spine_01', 'spine_02', 'spine_03']) rotateWorld(rig.bone(n), tmp.q);
    }

    // 準備姿勢：拍子舉在胸前（動作檔的待機是手垂著）
    const ready = (1 - S.swing) * (1 - run * 0.7) * (1 - ov);
    if (ready > 0.01) {
      tmp.c.set(1, 0, 0).applyQuaternion(g.quaternion);
      const raise = (bn: string, ang: number) => rotateWorld(rig.bone(bn), tmp.q.setFromAxisAngle(tmp.c, -ang * ready));
      raise('upperarm_r', 0.45);
      raise('lowerarm_r', 0.95);
      raise('upperarm_l', 0.35);
      raise('lowerarm_l', 0.9);
    }

    // 頭看球
    const head = rig.bone('Head');
    head.getWorldPosition(tmp.a);
    tmp.b.set(ball.x, ball.y, ball.z).sub(tmp.a);
    head.getWorldQuaternion(tmp.q);
    tmp.e.set(0, 0, 1).applyQuaternion(tmp.q.multiply(_qp.copy(rig.bindQ.get(head)!).invert()));
    const yawNow = Math.atan2(tmp.e.x, tmp.e.z);
    const yawTo = Math.atan2(tmp.b.x, tmp.b.z);
    let dy = yawTo - yawNow;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const lookW = 0.7 * (1 - ov);
    const dyaw = THREE.MathUtils.clamp(dy, -1, 1) * lookW;
    const pitchNow = Math.asin(THREE.MathUtils.clamp(tmp.e.y, -1, 1));
    const pitchTo = Math.atan2(tmp.b.y, Math.hypot(tmp.b.x, tmp.b.z));
    const dp = THREE.MathUtils.clamp(pitchTo - pitchNow, -0.6, 0.6) * lookW;
    tmp.q.setFromAxisAngle(tmp.up, dyaw);
    rotateWorld(head, tmp.q);
    tmp.c.crossVectors(tmp.e, tmp.up).normalize();
    tmp.q.setFromAxisAngle(tmp.c, -dp);
    rotateWorld(head, tmp.q);

    // 擊球瞬間的 IK：把拍面甜區拉到擊球點
    if (sw.state === 'swinging' && sw.path && tip.current) {
      const tau = t - sw.contactAt;
      const wik = 1 - smoothstep(0.03, 0.16, Math.abs(tau));
      if (wik > 0.01) {
        const chain = [rig.bone('hand_r'), rig.bone('lowerarm_r'), rig.bone('upperarm_r'), rig.bone('spine_03')];
        const gain = [0.5, 1, 1, 0.3];
        chain.forEach((bn, i) => tmp.saved[i].copy(bn.quaternion));
        for (let it = 0; it < 5; it++) {
          chain.forEach((bn, i) => {
            bn.getWorldPosition(tmp.a);
            tip.current!.getWorldPosition(tmp.e);
            tmp.b.subVectors(tmp.e, tmp.a).normalize();
            tmp.c.subVectors(S.contact, tmp.a).normalize();
            tmp.q.setFromUnitVectors(tmp.b, tmp.c);
            tmp.q.slerp(_qw.identity(), 1 - gain[i]);
            rotateWorld(bn, tmp.q);
          });
        }
        chain.forEach((bn, i) => {
          tmp.solved[i].copy(bn.quaternion);
          bn.quaternion.copy(tmp.saved[i]).slerp(tmp.solved[i], wik);
        });
      }
    }

    // 擊中後球拍震動
    const wb = S.wob;
    if (engine.rally.lastTeam === a.team && engine.rally.lastHitTime !== wb.last) {
      wb.last = engine.rally.lastHitTime;
      const sp = Math.hypot(engine.ball.vel.x, engine.ball.vel.y, engine.ball.vel.z);
      wb.amp = 0.08 + Math.min(0.22, sp / 100);
      wb.t = 0;
    }
    wb.t += rdt;
    wb.amp *= Math.exp(-rdt * 9);
    if (paddleGrp.current) paddleGrp.current.rotation.x = Math.sin(wb.t * 70) * wb.amp;

    if (trackTip && tip.current) {
      const v = paddleTips.get(a.id) ?? new THREE.Vector3();
      tip.current.getWorldPosition(v);
      paddleTips.set(a.id, v);
    }
  });

  const handR = rig.bone('hand_r');
  const head = rig.bone('Head');
  return (
    <group ref={root}>
      <primitive object={rig.scene} />
      {createPortal(
        <group position={mount.p} quaternion={mount.q}>
          <group ref={paddleGrp}>
            <PaddleModel spec={spec} glow={0} />
            <object3D ref={tip} position={[0, sweetSpotY(spec), 0]} />
          </group>
        </group>,
        handR,
      )}
      {look.headwear !== 'none' &&
        createPortal(
          <group quaternion={inv.head}>
            <Headwear look={look} />
          </group>,
          head,
        )}
      {createPortal(
        <group quaternion={inv.footL}>
          <Shoe look={look} />
        </group>,
        rig.bone('foot_l'),
      )}
      {createPortal(
        <group quaternion={inv.footR}>
          <Shoe look={look} />
        </group>,
        rig.bone('foot_r'),
      )}
    </group>
  );
};
