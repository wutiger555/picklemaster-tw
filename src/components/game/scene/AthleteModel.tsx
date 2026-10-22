import { useEffect, useMemo, useRef } from 'react';
import { createPortal, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { GameEngine } from '../engine/game';
import { PaddleModel } from './PaddleModel';
import { sweetSpotY } from './paddleGeometry';
import { type Look, paddleTips } from './characterData';
import { type AthleteAssets, type HairStyle, useAthleteAssets, useHair, useImage } from './athleteAssets';
import { AthletePoser, paddleMount } from './athletePoser';
import { type MixamoBody, useMixamoBody } from './mixamoBody';

/**
 * 真人比例的選手：外觀（照片臉、球衣、鞋、帽）在這裡，動作與揮拍姿勢由 AthletePoser 解算。
 * 兩種身體：hero（Quaternius CC0，球衣用著色器畫）與真實比例的 Mixamo 身體（sporty／hoodie）。
 * 兩者骨頭都用 Unreal 名稱、綁定姿勢都是面向 +Z 的 T-pose、右手在 -X。
 */

const HAIR: Record<Look['hairStyle'], HairStyle> = {
  short: 'simpleparted',
  buzz: 'buzzed',
  ponytail: 'buns',
};

// ───────────────────────────── 外觀 ─────────────────────────────

/** 照片臉在 256² 臉圖裡的雙眼中點與眼距（extract-character.swift 依臉框置中裁切） */
const PHOTO_EYES = { x: 126, y: 95, span: 72 };
/** 臉部在膚色貼圖上的位置（像素）：雙眼中點、眼距、眼睛到嘴巴的距離 */
interface FaceUV {
  x: number;
  y: number;
  span: number;
  mouth: number;
  /** 貼圖上臉的方向：選手左眼在右邊 = 1；嘴在眼睛下方 = 1（有的模型臉在貼圖上是顛倒的） */
  dirX: number;
  dirY: number;
}
/** hero 模型（1024² 貼圖，由網格 UV 量出） */
const HERO_FACE: FaceUV = { x: 191.5, y: 170, span: 85, mouth: 105, dirX: 1, dirY: 1 };

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
const skinTexture = (base: CanvasImageSource & { width: number }, skin: string, face: HTMLImageElement | null, uv: FaceUV) => {
  const S = base.width;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(base, 0, 0, S, S);
  const img = g.getImageData(0, 0, S, S);
  const d = img.data;
  // 參考膚色：眼睛下方到嘴巴之間的雙頰
  let r = 0;
  let gg = 0;
  let b = 0;
  let n = 0;
  const x0 = Math.round(uv.x - uv.span * 0.38);
  const x1 = Math.round(uv.x + uv.span * 0.38);
  const ya = uv.y + uv.mouth * 0.25 * uv.dirY;
  const yb = uv.y + uv.mouth * 0.7 * uv.dirY;
  const y0 = Math.round(Math.min(ya, yb));
  const y1 = Math.round(Math.max(ya, yb));
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * S + x) * 4;
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
    const kx = uv.span / PHOTO_EYES.span;
    const ky = uv.mouth / 83;
    g.save();
    g.translate(uv.x, uv.y);
    g.scale(uv.dirX, uv.dirY);
    g.drawImage(f, -PHOTO_EYES.x * kx, -PHOTO_EYES.y * ky, 256 * kx, 256 * ky);
    g.restore();
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
  bone: (name: string) => THREE.Bone;
  /** 綁定姿勢下，各骨頭在模型空間的旋轉 */
  bindQ: Map<THREE.Object3D, THREE.Quaternion>;
  /** 骨頭的世界縮放（Mixamo 身體是公分，0.01） */
  unit: number;
  /** 頭頂比頭骨高多少（公尺），帽子位置用 */
  headTop: number;
  /** 模型本身有鞋子 */
  hasShoes: boolean;
  dispose: () => void;
}

const collectBones = (scene: THREE.Object3D) => {
  scene.updateMatrixWorld(true);
  const bones = new Map<string, THREE.Bone>();
  const bindQ = new Map<THREE.Object3D, THREE.Quaternion>();
  scene.traverse((o) => {
    if ((o as THREE.Bone).isBone) {
      bones.set(o.name, o as THREE.Bone);
      bindQ.set(o, o.getWorldQuaternion(new THREE.Quaternion()));
    }
  });
  return { bones, bindQ, bone: (name: string) => bones.get(name)! };
};

/** 手指：動作檔沒有手指，右手握拍、左手半握（下一節手指可能隔著轉檔產生的輔助節點） */
const curlFingers = (bones: Map<string, THREE.Bone>, bindQ: Map<THREE.Object3D, THREE.Quaternion>) => {
  const down = new THREE.Vector3(0, -1, 0);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const q = new THREE.Quaternion();
  for (const side of ['r', 'l'] as const) {
    for (const f of ['index', 'middle', 'ring', 'pinky', 'thumb']) {
      for (let j = 1; j <= 3; j++) {
        const bn = bones.get(`${f}_0${j}_${side}`);
        if (!bn) continue;
        const next = bones.get(`${f}_0${j + 1}_${side}`) ?? bn.children.find((c) => (c as THREE.Bone).isBone);
        const prev = bones.get(`${f}_0${j - 1}_${side}`);
        bn.getWorldPosition(a);
        if (next) next.getWorldPosition(b).sub(a);
        else if (prev) b.copy(a).sub(prev.getWorldPosition(new THREE.Vector3()));
        else continue;
        const axis = b.normalize().cross(down).normalize();
        axis.applyQuaternion(q.copy(bindQ.get(bn)!).invert());
        const grip = side === 'r' ? 1 : 0.55;
        const ang = (f === 'thumb' ? [0.3, 0.35, 0.3] : [1.1, 1.35, 0.9])[j - 1] * grip;
        bn.quaternion.multiply(q.setFromAxisAngle(axis, ang));
      }
    }
  }
};

const buildRig = (assets: AthleteAssets, hair: THREE.Object3D, look: Look, face: HTMLImageElement | null): Rig => {
  const scene = SkeletonUtils.clone(assets.body.scene);
  const { bones, bindQ, bone } = collectBones(scene);

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
  const skin = skinTexture(baseMat.map!.image as CanvasImageSource & { width: number }, look.skin, face, HERO_FACE);
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

  curlFingers(bones, bindQ);

  return {
    scene,
    bone,
    bindQ,
    unit: 1,
    // 頭骨在 1.60、頭頂約 1.81
    headTop: 0.21,
    hasShoes: false,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
};

/** 在綁定姿勢的網格上量臉：眼睫毛左右兩團的中心＝雙眼，再往下找嘴巴，取最近頂點的 UV */
const measureFace = (body: THREE.SkinnedMesh, lashes: THREE.Mesh | null, size: number): FaceUV | null => {
  const pos = body.geometry.attributes.position;
  const uv = body.geometry.attributes.uv;
  if (!lashes || !uv) return null;
  const lp = lashes.geometry.attributes.position;
  const eye = [new THREE.Vector3(), new THREE.Vector3()];
  const cnt = [0, 0];
  for (let i = 0; i < lp.count; i++) {
    const k = lp.getX(i) > 0 ? 0 : 1;
    eye[k].x += lp.getX(i);
    eye[k].y += lp.getY(i);
    eye[k].z += lp.getZ(i);
    cnt[k]++;
  }
  if (!cnt[0] || !cnt[1]) return null;
  eye[0].divideScalar(cnt[0]);
  eye[1].divideScalar(cnt[1]);
  const span3 = eye[0].distanceTo(eye[1]);
  // 最靠前（+Z）、離目標點最近的頂點
  const nearest = (x: number, y: number, z: number) => {
    let best = -1;
    let bd = Infinity;
    for (let i = 0; i < pos.count; i++) {
      const dz = pos.getZ(i) - z;
      const d = (pos.getX(i) - x) ** 2 + (pos.getY(i) - y) ** 2 + (dz < 0 ? dz * dz * 4 : dz * dz);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return [uv.getX(best) * size, uv.getY(best) * size];
  };
  const ez = Math.max(eye[0].z, eye[1].z) + span3 * 0.25;
  const l = nearest(eye[0].x, eye[0].y, ez);
  const r = nearest(eye[1].x, eye[1].y, ez);
  const ey = (eye[0].y + eye[1].y) / 2;
  // 鼻頭（嘴唇在貼圖上常是另一塊，量不準）：照片上眼睛到鼻頭約 50 px、到嘴巴 83 px
  const n = nearest(0, ey - span3 * 0.55, ez + span3 * 0.3);
  const x = (l[0] + r[0]) / 2;
  const y = (l[1] + r[1]) / 2;
  return {
    x,
    y,
    span: Math.abs(l[0] - r[0]),
    mouth: (Math.abs(n[1] - y) * 83) / 50,
    dirX: Math.sign(l[0] - r[0]) || 1,
    dirY: Math.sign(n[1] - y) || 1,
  };
};

/** 平均顏色（0..255），換頭髮色用 */
const avgColor = (img: CanvasImageSource) => {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, 32, 32);
  const d = g.getImageData(0, 0, 32, 32).data;
  const sum = [0, 0, 0];
  for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) sum[k] += d[i + k];
  return sum.map((v) => v / (d.length / 4));
};

/** 依目標色調整材質顏色（材質顏色會乘上貼圖） */
const tintToward = (mat: THREE.MeshStandardMaterial, target: string, current: number[]) => {
  const h = parseInt(target.slice(1), 16);
  const t = [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  mat.color.setRGB(...(t.map((v, i) => Math.min(2.5, v / Math.max(8, current[i]))) as [number, number, number]), THREE.SRGBColorSpace);
};

/**
 * 真實比例的 Mixamo 身體：球衣、短褲換成角色配色（原本是白色，直接乘色），
 * 照片臉畫進臉部 UV、全身膚色調成照片膚色，頭髮換成角色髮色。
 */
const buildMixamoRig = (body: MixamoBody, look: Look, face: HTMLImageElement | null): Rig => {
  const inner = SkeletonUtils.clone(body.gltf.scene);
  inner.scale.setScalar(0.01);
  const scene = new THREE.Group();
  scene.add(inner);
  const { bones, bindQ, bone } = collectBones(scene);
  const disposables: { dispose: () => void }[] = [];
  const meshes: THREE.SkinnedMesh[] = [];
  inner.traverse((o) => (o as THREE.SkinnedMesh).isSkinnedMesh && meshes.push(o as THREE.SkinnedMesh));
  const find = (re: RegExp) => meshes.find((m) => re.test(m.name)) ?? null;
  const bodyMesh = find(/_Body$/);
  const lashes = find(/Eyelashes/);
  let top = 0;
  for (const m of meshes) {
    m.castShadow = true;
    m.frustumCulled = false;
    const mat = (m.material as THREE.MeshStandardMaterial).clone();
    m.material = mat;
    disposables.push(mat);
    // 球衣、短褲原本是白色，直接乘色；帽 T、長褲原本是灰色，乘色前先提亮
    if (/Shirt/.test(m.name)) mat.color.set(look.shirt);
    else if (/Shorts/.test(m.name)) mat.color.set(look.shorts);
    else if (/Hoodie/.test(m.name)) mat.color.set(look.shirt).multiplyScalar(1.8);
    else if (/Pants/.test(m.name)) mat.color.set(look.shorts).multiplyScalar(1.8);
    else if (/Hair/.test(m.name) && mat.map) tintToward(mat, look.hair, avgColor(mat.map.image as CanvasImageSource));
    if (face && /Beard|Eyelashes/.test(m.name)) m.visible = false;
    if (/Hair|_Body$/.test(m.name)) {
      m.geometry.computeBoundingBox();
      top = Math.max(top, m.geometry.boundingBox!.max.y * 0.01);
    }
  }
  if (bodyMesh) {
    const mat = bodyMesh.material as THREE.MeshStandardMaterial;
    const img = mat.map!.image as CanvasImageSource & { width: number };
    const uv = measureFace(bodyMesh, lashes, img.width);
    if (uv) {
      const tex = skinTexture(img, look.skin, face, uv);
      mat.map = tex;
      disposables.push(tex);
    }
  }
  curlFingers(bones, bindQ);
  const headY = bone('Head').getWorldPosition(new THREE.Vector3()).y;
  return {
    scene,
    bone,
    bindQ,
    unit: 0.01,
    headTop: top - headY,
    hasShoes: true,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
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

export const AthleteModel = ({ engine, index, look, trackTip = true }: Props) => {
  const assets = useAthleteAssets();
  const hair = useHair(look.body === 'hero' ? HAIR[look.hairStyle] : null);
  const body = useMixamoBody(look.body === 'hero' ? null : look.body, assets);
  const face = useImage(look.face);
  const rig = useMemo(
    () => (body ? buildMixamoRig(body, look, face) : buildRig(assets, hair!.scene, look, face)),
    [assets, hair, body, look, face],
  );
  const spec = engine.athletes[index].paddle;
  const { group, poser } = useMemo(() => {
    const g = new THREE.Group();
    g.add(rig.scene);
    return { group: g, poser: new AthletePoser(g, rig.scene, body ? body.clips : assets.clips, sweetSpotY(spec)) };
  }, [rig, assets, body, spec]);
  useEffect(
    () => () => {
      poser.dispose();
      rig.dispose();
    },
    [rig, poser],
  );

  const paddleGrp = useRef<THREE.Group>(null);
  const leftPaddle = useRef<THREE.Group>(null);
  // 帽哥的絕招：左手也拿一支拍
  const mountL = useMemo(() => paddleMount(rig.bindQ.get(rig.bone('hand_l'))!, 'l'), [rig]);
  const tip = useRef<THREE.Object3D>(null);
  const wob = useRef({ amp: 0, last: -1, t: 0 });

  // 頭飾、鞋子掛在骨頭上：用綁定姿勢的反旋轉，讓子物件可以直接用模型座標擺放
  const inv = useMemo(() => {
    const q = (n: string) => rig.bindQ.get(rig.bone(n))!.clone().invert();
    return { head: q('Head'), footL: q('foot_l'), footR: q('foot_r') };
  }, [rig]);

  useFrame((_, raw) => {
    poser.tip = tip.current ?? undefined;
    poser.update(engine, index, raw);
    const a = engine.athletes[index];
    if (leftPaddle.current) leftPaddle.current.visible = a.skill === 'dualCurve' && (a.skillArmed || engine.time - a.skillAt < 1.2);
    const rdt = Math.min(0.05, raw);

    // 擊中後球拍震動：球越快震越大
    const wb = wob.current;
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

  return (
    <>
      <primitive object={group} />
      {createPortal(
        // 骨頭是公分的身體要反向縮放，球拍才會是正常大小
        <group position={poser.mount.p.clone().divideScalar(rig.unit)} quaternion={poser.mount.q} scale={1 / rig.unit}>
          <group ref={paddleGrp}>
            <PaddleModel spec={spec} glow={0} />
            <object3D ref={tip} position={[0, sweetSpotY(spec), 0]} />
          </group>
        </group>,
        rig.bone('hand_r'),
      )}
      {createPortal(
        <group ref={leftPaddle} visible={false} position={mountL.p.clone().divideScalar(rig.unit)} quaternion={mountL.q} scale={1 / rig.unit}>
          <PaddleModel spec={spec} glow={0} />
        </group>,
        rig.bone('hand_l'),
      )}
      {look.headwear !== 'none' &&
        createPortal(
          <group quaternion={inv.head} scale={1 / rig.unit}>
            {/* 帽子的位置以「頭頂比頭骨高 0.21 m」的 hero 模型為準 */}
            <group position={[0, rig.headTop - 0.21, 0]}>
              <Headwear look={look} />
            </group>
          </group>,
          rig.bone('Head'),
        )}
      {!rig.hasShoes &&
        createPortal(
          <group quaternion={inv.footL}>
            <Shoe look={look} />
          </group>,
          rig.bone('foot_l'),
        )}
      {!rig.hasShoes &&
        createPortal(
          <group quaternion={inv.footR}>
            <Shoe look={look} />
          </group>,
          rig.bone('foot_r'),
        )}
    </>
  );
};
