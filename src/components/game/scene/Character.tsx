import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Athlete, GameEngine } from '../engine/game';
import { teamSide } from '../engine/rules';
import { PLAYER } from '../engine/constants';
import { PaddleModel } from './PaddleModel';
import { sweetSpotY } from './paddleGeometry';
import { jerseyTexture } from './textures';
import { type Look, paddleTips } from './characterData';



// ───────────────────────────── 姿勢 ─────────────────────────────

type V = [number, number, number];
interface Pose {
  hipY: number;
  lean: number;
  roll: number;
  chestYaw: number;
  chestPitch: number;
  rSh: V;
  rEl: number;
  rWr: V;
  lSh: V;
  lEl: number;
  lHip: [number, number];
  rHip: [number, number];
  lKnee: number;
  rKnee: number;
  headPitch: number;
}

const ready = (): Pose => ({
  hipY: -0.06,
  lean: -0.22,
  roll: 0,
  chestYaw: 0,
  chestPitch: 0,
  rSh: [0.75, 0.25, 0.35],
  rEl: 1.25,
  rWr: [-0.2, 0, 0],
  lSh: [0.6, -0.2, -0.3],
  lEl: 1.2,
  lHip: [0.32, -0.08],
  rHip: [0.32, 0.08],
  lKnee: -0.6,
  rKnee: -0.6,
  headPitch: 0.1,
});

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpV = (a: V, b: V, t: number): V => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const smooth = (t: number) => t * t * (3 - 2 * t);

/** 部分覆寫：關鍵影格只寫需要改變的關節 */
type Key = Partial<Pose>;

const blend = (base: Pose, key: Key, t: number): Pose => {
  const out = { ...base };
  for (const k of Object.keys(key) as (keyof Pose)[]) {
    const v = key[k]!;
    const b = base[k];
    (out as Record<string, unknown>)[k] = Array.isArray(v) ? lerpV(b as V, v as V, t) : lerp(b as number, v as number, t);
  }
  return out;
};

/** 依揮拍類型給出：[後拉, 觸球, 送拍] 三個關鍵姿勢 */
const swingKeys = (kind: string, fh: number): [Key, Key, Key] => {
  if (kind === 'serve') {
    return [
      { rSh: [-0.9, 0, 0.25], rEl: 0.2, chestYaw: -0.4, lSh: [0.9, -0.3, -0.2], lEl: 0.3 },
      { rSh: [0.35, 0.1, 0.2], rEl: 0.15, chestYaw: -0.1, lSh: [0.4, -0.3, -0.3] },
      { rSh: [1.7, 0.4, 0.1], rEl: 0.6, chestYaw: 0.35, lSh: [0.3, 0, -0.4] },
    ];
  }
  if (kind === 'smash' || kind === 'thunder') {
    return [
      { rSh: [2.6, -0.3, 0.45], rEl: 1.9, chestYaw: -0.75, lean: 0.1, lSh: [2.2, 0.2, -0.3], lEl: 0.4 },
      { rSh: [2.95, 0.1, 0.2], rEl: 0.15, chestYaw: -0.1, lean: -0.1, lSh: [1.2, 0, -0.5] },
      { rSh: [0.6, 0.7, -0.25], rEl: 0.4, chestYaw: 0.7, lean: -0.45, lSh: [0.2, 0, -0.4] },
    ];
  }
  if (kind === 'soft' || kind === 'dink') {
    const deep = { hipY: -0.17, lKnee: -1.15, rKnee: -1.15, lHip: [0.6, -0.12] as [number, number], rHip: [0.6, 0.12] as [number, number] };
    return fh > 0
      ? [
          { ...deep, rSh: [0.05, -0.35, 0.5], rEl: 0.5, rWr: [-0.6, 0, 0], chestYaw: -0.3 },
          { ...deep, rSh: [0.45, 0, 0.35], rEl: 0.25, rWr: [-0.5, 0, 0], chestYaw: -0.1 },
          { ...deep, rSh: [1.0, 0.25, 0.25], rEl: 0.35, rWr: [-0.4, 0, 0], chestYaw: 0.05 },
        ]
      : [
          { ...deep, rSh: [0.5, 0.5, -0.45], rEl: 0.9, rWr: [-0.6, 0, 0], chestYaw: 0.35 },
          { ...deep, rSh: [0.6, 0.1, -0.15], rEl: 0.45, rWr: [-0.5, 0, 0], chestYaw: 0.1 },
          { ...deep, rSh: [1.05, -0.3, 0.1], rEl: 0.35, rWr: [-0.4, 0, 0], chestYaw: -0.05 },
        ];
  }
  if (kind === 'lob') {
    return [
      { hipY: -0.14, rSh: [-0.3, -0.5, 0.6], rEl: 0.3, chestYaw: -0.4, lKnee: -1, rKnee: -1 },
      { rSh: [0.4, 0, 0.5], rEl: 0.2, chestYaw: -0.1 },
      { rSh: [2.3, 0.3, 0.2], rEl: 0.5, chestYaw: 0.3 },
    ];
  }
  const big = kind === 'inferno' ? 1.35 : 1;
  return fh > 0
    ? [
        { rSh: [0.1, -1.3 * big, 1.1], rEl: 0.35, chestYaw: -0.95 * big, lSh: [0.9, 0.6, -0.6], lEl: 0.6 },
        { rSh: [0.45, 0.1, 1.05], rEl: 0.15, chestYaw: -0.1, lSh: [0.5, 0.2, -0.5] },
        { rSh: [1.4, 1.3, 0.9], rEl: 1.4, chestYaw: 0.8 * big, lSh: [0.2, -0.2, -0.6], lEl: 0.9 },
      ]
    : [
        { rSh: [1.0, 0.6, -0.7], rEl: 1.2, chestYaw: 0.85, lSh: [0.6, 0.3, -0.2], lEl: 1.3 },
        { rSh: [0.9, -0.2, -0.1], rEl: 0.25, chestYaw: 0.1, lSh: [0.2, -0.3, -0.6] },
        { rSh: [1.4, -1.1, 0.9], rEl: 0.3, chestYaw: -0.55, lSh: [0, -0.3, -0.9], lEl: 0.4 },
      ];
};

/** 揮拍進度 p（0..1，觸球約在 0.28）→ 疊加在基本姿勢上 */
const swingPose = (base: Pose, kind: string, fh: number, p: number): Pose => {
  const [back, hit, follow] = swingKeys(kind, fh);
  // 觸球點在揮拍進度的哪裡（揮拍啟動時間／整段揮拍時間）
  const c = PLAYER.swingWindup / (PLAYER.swingWindup + PLAYER.swingFollow);
  if (p < c * 0.55) return blend(base, back, smooth(p / (c * 0.55)));
  if (p < c) return blend(blend(base, back, 1), hit, smooth((p - c * 0.55) / (c * 0.45)));
  if (p < 0.62) return blend(blend(base, hit, 1), follow, smooth((p - c) / (0.62 - c)));
  return blend(base, follow, 1 - smooth((p - 0.62) / 0.38));
};

// ───────────────────────────── 模型 ─────────────────────────────

const useGeos = () =>
  useMemo(
    () => ({
      thigh: new THREE.CylinderGeometry(0.078, 0.06, 0.43, 14).translate(0, -0.215, 0),
      shortsLeg: new THREE.CylinderGeometry(0.098, 0.088, 0.2, 14).translate(0, -0.09, 0),
      knee: new THREE.SphereGeometry(0.058, 14, 10),
      shin: new THREE.CylinderGeometry(0.056, 0.04, 0.42, 14).translate(0, -0.21, 0),
      calf: new THREE.SphereGeometry(0.062, 14, 10),
      sock: new THREE.CylinderGeometry(0.044, 0.042, 0.1, 14).translate(0, -0.37, 0),
      shoe: new THREE.CapsuleGeometry(0.055, 0.17, 6, 12).rotateX(Math.PI / 2),
      sole: new THREE.BoxGeometry(0.105, 0.025, 0.28),
      pelvis: new THREE.CylinderGeometry(0.17, 0.16, 0.22, 20),
      abdomen: new THREE.CylinderGeometry(0.15, 0.165, 0.24, 20),
      chest: new THREE.CapsuleGeometry(0.16, 0.2, 8, 24),
      neck: new THREE.CylinderGeometry(0.052, 0.06, 0.12, 12),
      head: new THREE.SphereGeometry(0.105, 28, 22),
      hair: new THREE.SphereGeometry(0.112, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
      ponytail: new THREE.CapsuleGeometry(0.035, 0.16, 6, 10),
      eye: new THREE.SphereGeometry(0.012, 10, 8),
      brow: new THREE.BoxGeometry(0.035, 0.008, 0.01),
      nose: new THREE.ConeGeometry(0.013, 0.04, 8).rotateX(-Math.PI / 2),
      ear: new THREE.SphereGeometry(0.022, 10, 8),
      visorBand: new THREE.TorusGeometry(0.11, 0.012, 8, 32),
      brim: new THREE.CylinderGeometry(0.1, 0.1, 0.008, 24, 1, false, -Math.PI / 2, Math.PI),
      capDome: new THREE.SphereGeometry(0.116, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      // 臉面：頭部正面（-Z）的一塊球面，貼照片臉。u 沿水平角、v 沿垂直角，左右與選手一致不會鏡像
      faceCap: new THREE.SphereGeometry(0.1072, 36, 28, Math.PI * 1.5 - 1.05, 2.1, 0.42, 1.9),
      // 有照片臉時的頭髮：頭頂整圈＋後腦一片（正面留給臉），後腦才不會露出光頭
      hairTop: new THREE.SphereGeometry(0.112, 32, 8, 0, Math.PI * 2, 0, 0.62),
      hairBack: new THREE.SphereGeometry(0.112, 32, 20, Math.PI * 1.5 + 0.92, Math.PI * 2 - 1.84, 0, 2.15),
      hairBackShort: new THREE.SphereGeometry(0.11, 32, 16, Math.PI * 1.5 + 0.92, Math.PI * 2 - 1.84, 0, 1.75),
      upperArm: new THREE.CylinderGeometry(0.05, 0.043, 0.28, 12).translate(0, -0.14, 0),
      sleeve: new THREE.CylinderGeometry(0.068, 0.062, 0.13, 14).translate(0, -0.05, 0),
      shoulder: new THREE.SphereGeometry(0.068, 14, 10),
      elbow: new THREE.SphereGeometry(0.044, 12, 8),
      forearm: new THREE.CylinderGeometry(0.043, 0.034, 0.26, 12).translate(0, -0.13, 0),
      wristband: new THREE.CylinderGeometry(0.039, 0.039, 0.05, 12).translate(0, -0.22, 0),
      hand: new THREE.SphereGeometry(0.045, 12, 10),
    }),
    [],
  );

interface Props {
  engine: GameEngine;
  index: number;
  look: Look;
}

/**
 * 程式生成的人形選手：關節層級＋程序化動畫（不需要外部模型與動作檔）。
 * 模型面向本地 -Z，右手 +X。
 */
export const Character = ({ engine, index, look }: Props) => {
  const g = useGeos();
  const R = useRef<Record<string, THREE.Object3D | null>>({});
  const set = (k: string) => (o: THREE.Object3D | null) => {
    R.current[k] = o;
  };
  const pose = useRef<Pose>(ready());
  const phase = useRef(0);
  const tip = useRef<THREE.Object3D>(null);
  const paddleGrp = useRef<THREE.Group>(null);
  const wobble = useRef({ amp: 0, last: -1, t: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const spec = engine.athletes[index].paddle;
  const jersey = jerseyTexture(look.key, look.shirt, look.accent, look.number, look.name);

  const faceTex = useMemo(() => {
    if (!look.face) return null;
    const t = new THREE.TextureLoader().load(look.face);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [look.face]);

  const mat = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: look.skin, roughness: 0.55 }),
      shirt: new THREE.MeshStandardMaterial({ map: jersey, roughness: 0.8 }),
      shirtPlain: new THREE.MeshStandardMaterial({ color: look.shirt, roughness: 0.8 }),
      shorts: new THREE.MeshStandardMaterial({ color: look.shorts, roughness: 0.85 }),
      sock: new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.9 }),
      shoe: new THREE.MeshStandardMaterial({ color: look.shoes, roughness: 0.45 }),
      sole: new THREE.MeshStandardMaterial({ color: '#f1f1f1', roughness: 0.6 }),
      hair: new THREE.MeshStandardMaterial({ color: look.hair, roughness: 0.7 }),
      dark: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.3 }),
      head: new THREE.MeshStandardMaterial({ color: look.headwearColor, roughness: 0.6 }),
      accent: new THREE.MeshStandardMaterial({ color: look.accent, roughness: 0.6 }),
      // 照片臉：透明柔邊；加一點自發光，夜間球場也看得清楚
      face: faceTex
        ? new THREE.MeshStandardMaterial({
            map: faceTex,
            emissiveMap: faceTex,
            emissive: new THREE.Color('#ffffff'),
            emissiveIntensity: 0.12,
            transparent: true,
            alphaTest: 0.03,
            roughness: 0.65,
            polygonOffset: true,
            polygonOffsetFactor: -2,
          })
        : null,
    }),
    [look, jersey, faceTex],
  );

  useFrame((_, rdt) => {
    const a: Athlete = engine.athletes[index];
    const J = R.current;
    const root = J.root;
    if (!root) return;
    const dt = Math.min(0.05, rdt) * engine.timeScale;
    const s = teamSide(a.team);
    // 物理步之間內插，移動才平順
    const al = engine.alpha;
    root.position.set(a.prevPos.x + (a.pos.x - a.prevPos.x) * al, 0, a.prevPos.z + (a.pos.z - a.prevPos.z) * al);
    // 擊中後球拍震動：球越快震越大，用真實時間衰減
    const wb = wobble.current;
    if (engine.rally.lastTeam === a.team && engine.rally.lastHitTime !== wb.last) {
      wb.last = engine.rally.lastHitTime;
      const sp = Math.hypot(engine.ball.vel.x, engine.ball.vel.y, engine.ball.vel.z);
      wb.amp = 0.08 + Math.min(0.22, sp / 100);
      wb.t = 0;
    }
    wb.t += Math.min(0.05, rdt);
    wb.amp *= Math.exp(-Math.min(0.05, rdt) * 9);
    if (paddleGrp.current) paddleGrp.current.rotation.z = Math.sin(wb.t * 70) * wb.amp;
    root.rotation.y = s > 0 ? 0 : Math.PI;

    // 本地速度：forward = 往網、lateral = 往右
    const vf = -a.vel.z * s;
    const vl = a.vel.x * s;
    const speed = Math.hypot(vf, vl);
    const k = Math.min(1, speed / 3.5);
    phase.current += dt * (5 + speed * 2.4);
    const ph = phase.current;

    let P = ready();
    const t = engine.time;
    // 移動：前後跑步、左右側併步
    if (speed > 0.15) {
      if (Math.abs(vl) > Math.abs(vf) * 1.2) {
        const spread = 0.12 + 0.2 * (0.5 + 0.5 * Math.sin(ph * 1.6)) * k;
        P.lHip = [0.3, -spread];
        P.rHip = [0.3, spread];
        P.hipY += Math.abs(Math.sin(ph * 1.6)) * 0.035 * k;
        P.roll = -Math.sign(vl) * 0.12 * k;
      } else {
        const dir = Math.sign(vf) || 1;
        const sw = Math.sin(ph) * 0.75 * k * dir;
        P.lHip = [0.2 + sw, -0.05];
        P.rHip = [0.2 - sw, 0.05];
        P.lKnee = -0.35 - Math.max(0, Math.sin(ph + 1.2)) * 1.1 * k;
        P.rKnee = -0.35 - Math.max(0, Math.sin(ph + 1.2 + Math.PI)) * 1.1 * k;
        P.lSh = [0.5 - sw * 0.7, -0.1, -0.25];
        P.lean = -0.22 - 0.2 * k * dir;
        P.hipY += Math.abs(Math.cos(ph)) * 0.04 * k;
      }
    }
    // 對手出手瞬間的分腿墊步
    const opp = engine.opponentOf(a);
    const since = t - opp.swing.contactAt;
    if (engine.phase === 'rally' && since > 0 && since < 0.22) P.hipY += Math.sin((since / 0.22) * Math.PI) * 0.05;

    // 蓄力：往後拉拍；揮拍：三段關鍵姿勢
    const sp = engine.swingProgress(a);
    const sw = a.swing;
    const ballSide = (engine.ball.pos.x - a.pos.x) * s >= 0 ? 1 : -1;
    const special = engine.cinematic && engine.cinematic.team === a.team ? engine.cinematic.id : null;
    if (sp >= 0) {
      let kind: string = sw.button;
      if (sw.button === 'drive' && engine.ball.pos.y > 1.45) kind = 'smash';
      if (special === 'thunder') kind = 'thunder';
      if (special === 'inferno') kind = 'inferno';
      P = swingPose(P, kind, sw.forehand, sp);
    } else if (sw.state === 'charging') {
      const kind = sw.button === 'serve' ? 'serve' : sw.button;
      P = blend(P, swingKeys(kind, ballSide)[0], Math.min(1, 0.35 + sw.charge * 0.65));
    } else if (a.armed) {
      // 蓄勢：沉肩握拍、拍子立起
      P = blend(P, { rSh: [1.6, 0.4, 0.5], rEl: 1.6, hipY: -0.1, lSh: [0.3, -0.4, -0.7] }, 0.8);
    }

    // 天雷：騰空
    if (t < a.jumpUntil) {
      const j = 1 - (a.jumpUntil - t) / 0.55;
      P.hipY += Math.sin(Math.min(1, j) * Math.PI) * 0.75;
      P.lKnee = -1.3;
      P.rKnee = -0.6;
    }
    // 被震退
    if (t < a.knockedUntil) P = blend(P, { lean: 0.35, rSh: [2.1, 0.3, 0.8], lSh: [2.0, -0.3, -0.8], rEl: 0.3, lEl: 0.3 }, 0.85);
    // 得失分反應
    if (engine.phase === 'dead' && a.mood && t - a.mood.at < 1.9) {
      const m = Math.min(1, (t - a.mood.at) / 0.25);
      if (a.mood.won) {
        const pump = Math.sin((t - a.mood.at) * 10) * 0.2;
        P = blend(P, { lSh: [2.5 + pump, 0, -0.35], lEl: 1.7, rSh: [1.4, 0.2, 0.4], rEl: 0.8, lean: 0.05, headPitch: -0.2 }, m);
      } else {
        P = blend(P, { lean: -0.05, headPitch: 0.5, rSh: [0.1, 0, 0.2], rEl: 0.3, lSh: [0.1, 0, -0.2], lEl: 0.2, hipY: 0 }, m);
      }
    }

    // 平滑過渡到目標姿勢（揮拍時跟得比較緊）
    const follow = 1 - Math.exp(-dt * (sp >= 0 ? 30 : 12));
    const cur = pose.current;
    for (const key of Object.keys(P) as (keyof Pose)[]) {
      const v = P[key];
      (cur as unknown as Record<string, unknown>)[key] = Array.isArray(v)
        ? lerpV(cur[key] as V, v as V, follow)
        : lerp(cur[key] as number, v as number, follow);
    }

    // 腳掌貼地：依兩腿彎曲角度算出骨盆高度，較低的那隻腳剛好踩在地上
    const legExt = (hip: [number, number], knee: number) =>
      (0.05 + 0.43 * Math.cos(hip[0]) + 0.42 * Math.cos(hip[0] + knee)) * Math.cos(hip[1]) + 0.088;
    J.hips!.position.y = Math.max(legExt(cur.lHip, cur.lKnee), legExt(cur.rHip, cur.rKnee)) + Math.max(0, cur.hipY);
    J.hips!.rotation.set(cur.lean * 0.4, 0, cur.roll);
    J.chest!.rotation.set(cur.lean * 0.6 + cur.chestPitch, cur.chestYaw, 0);
    J.rSh!.rotation.set(cur.rSh[0], cur.rSh[1], cur.rSh[2]);
    J.rEl!.rotation.x = cur.rEl;
    J.rWr!.rotation.set(cur.rWr[0], cur.rWr[1], cur.rWr[2]);
    J.lSh!.rotation.set(cur.lSh[0], cur.lSh[1], cur.lSh[2]);
    J.lEl!.rotation.x = cur.lEl;
    J.lHip!.rotation.set(cur.lHip[0] - cur.lean * 0.4, 0, cur.lHip[1]);
    J.rHip!.rotation.set(cur.rHip[0] - cur.lean * 0.4, 0, cur.rHip[1]);
    J.lKnee!.rotation.x = cur.lKnee;
    J.rKnee!.rotation.x = cur.rKnee;
    // 腳掌保持貼地
    J.lAnk!.rotation.x = -(cur.lHip[0] + cur.lKnee);
    J.rAnk!.rotation.x = -(cur.rHip[0] + cur.rKnee);

    // 頭部看球
    const head = J.head!;
    head.getWorldPosition(tmp);
    const b = engine.ball.pos;
    const dx = (b.x - tmp.x) * s;
    const dz = -(b.z - tmp.z) * s;
    const dy = b.y - tmp.y;
    const yaw = THREE.MathUtils.clamp(Math.atan2(-dx, Math.max(0.2, dz)) - cur.chestYaw, -1.1, 1.1);
    // 抬頭為正；headPitch 是「低頭」的量
    const pitch = THREE.MathUtils.clamp(Math.atan2(dy, Math.hypot(dx, dz)), -0.6, 0.8) - cur.headPitch;
    head.rotation.y += (yaw - head.rotation.y) * 0.25;
    head.rotation.x += (pitch * 0.7 - cur.lean - head.rotation.x) * 0.25;

    if (tip.current) {
      const v = paddleTips.get(a.id) ?? new THREE.Vector3();
      tip.current.getWorldPosition(v);
      paddleTips.set(a.id, v);
    }
  });

  const photo = !!mat.face;
  const hairCap = photo ? (
    // 照片臉：瀏海由照片本身呈現，3D 頭髮只蓋頭頂與後腦
    <group scale={[0.97, 1.1, 1.02]}>
      <mesh geometry={g.hairTop} material={mat.hair} />
      <mesh geometry={look.hairStyle === 'buzz' ? g.hairBackShort : g.hairBack} material={mat.hair} />
    </group>
  ) : look.hairStyle === 'buzz' ? (
      <mesh geometry={g.hair} material={mat.hair} scale={[0.97, 0.9, 0.97]} position={[0, 0.005, 0.004]} />
    ) : (
      <mesh geometry={g.hair} material={mat.hair} scale={[1.02, 1.05, 1.04]} position={[0, 0.01, 0.006]} />
    );

  return (
    <group ref={set('root')}>
      <group ref={set('hips')} position={[0, 0.93, 0]}>
        <mesh geometry={g.pelvis} material={mat.shorts} castShadow />
        {/* 腿 */}
        {([-1, 1] as const).map((side) => (
          <group key={side} ref={set(side < 0 ? 'lHip' : 'rHip')} position={[side * 0.095, -0.05, 0]}>
            <mesh geometry={g.shortsLeg} material={mat.shorts} castShadow />
            <mesh geometry={g.thigh} material={mat.skin} castShadow />
            <group ref={set(side < 0 ? 'lKnee' : 'rKnee')} position={[0, -0.43, 0]}>
              <mesh geometry={g.knee} material={mat.skin} />
              <mesh geometry={g.calf} material={mat.skin} position={[0, -0.12, 0.018]} scale={[0.9, 1.6, 0.9]} castShadow />
              <mesh geometry={g.shin} material={mat.skin} castShadow />
              <mesh geometry={g.sock} material={mat.sock} />
              <group ref={set(side < 0 ? 'lAnk' : 'rAnk')} position={[0, -0.42, 0]}>
                <mesh geometry={g.shoe} material={mat.shoe} position={[0, -0.04, -0.045]} scale={[0.95, 0.75, 1]} castShadow />
                <mesh geometry={g.sole} material={mat.sole} position={[0, -0.075, -0.045]} />
              </group>
            </group>
          </group>
        ))}
        {/* 上半身 */}
        <mesh geometry={g.abdomen} material={mat.shirtPlain} position={[0, 0.19, 0]} castShadow />
        <group ref={set('chest')} position={[0, 0.2, 0]}>
          <mesh geometry={g.chest} material={mat.shirt} position={[0, 0.2, 0]} scale={[1.2, 1, 0.78]} castShadow />
          <mesh geometry={g.neck} material={mat.skin} position={[0, 0.44, 0]} />
          <group ref={set('head')} position={[0, 0.55, 0]}>
            <mesh geometry={g.head} material={mat.skin} scale={[0.95, 1.12, 1]} castShadow />
            {hairCap}
            {look.hairStyle === 'ponytail' && (
              <mesh geometry={g.ponytail} material={mat.hair} position={[0, -0.02, 0.13]} rotation={[0.5, 0, 0]} />
            )}
            {[-1, 1].map((x) => (
              <group key={x}>
                {!photo && <mesh geometry={g.eye} material={mat.dark} position={[x * 0.036, 0.012, -0.095]} />}
                {!photo && (
                  <mesh geometry={g.brow} material={mat.hair} position={[x * 0.036, 0.038, -0.098]} rotation={[0, 0, x * -0.12]} />
                )}
                <mesh geometry={g.ear} material={mat.skin} position={[x * 0.1, 0, 0.005]} scale={[0.5, 1, 0.8]} />
              </group>
            ))}
            {photo ? (
              <mesh geometry={g.faceCap} material={mat.face!} scale={[0.95, 1.12, 1]} renderOrder={1} />
            ) : (
              <mesh geometry={g.nose} material={mat.skin} position={[0, -0.012, -0.108]} />
            )}
            {look.headwear === 'visor' && (
              <group position={[0, 0.045, 0]}>
                <mesh geometry={g.visorBand} material={mat.head} rotation={[Math.PI / 2, 0, 0]} />
                <mesh geometry={g.brim} material={mat.head} position={[0, 0, -0.085]} rotation={[0.12, 0, 0]} />
              </group>
            )}
            {look.headwear === 'cap' && (
              <group position={[0, 0.03, 0]}>
                <mesh geometry={g.capDome} material={mat.head} />
                <mesh geometry={g.brim} material={mat.head} position={[0, 0.005, -0.09]} rotation={[0.1, 0, 0]} />
              </group>
            )}
            {look.headwear === 'headband' && (
              <mesh geometry={g.visorBand} material={mat.accent} position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} />
            )}
          </group>
          {/* 左右手臂：肩膀的旋轉順序 YXZ（先外展、再前舉、最後水平掃） */}
          {([-1, 1] as const).map((side) => (
            <group
              key={side}
              ref={set(side < 0 ? 'lSh' : 'rSh')}
              position={[side * 0.2, 0.35, 0]}
              rotation={[0, 0, 0, 'YXZ']}
            >
              <mesh geometry={g.shoulder} material={mat.shirtPlain} />
              <mesh geometry={g.sleeve} material={mat.shirtPlain} castShadow />
              <mesh geometry={g.upperArm} material={mat.skin} castShadow />
              <group ref={set(side < 0 ? 'lEl' : 'rEl')} position={[0, -0.28, 0]}>
                <mesh geometry={g.elbow} material={mat.skin} />
                <mesh geometry={g.forearm} material={mat.skin} castShadow />
                <mesh geometry={g.wristband} material={mat.accent} />
                <group ref={side > 0 ? set('rWr') : undefined} position={[0, -0.27, 0]}>
                  <mesh geometry={g.hand} material={mat.skin} scale={[0.85, 1.1, 0.7]} />
                  {side > 0 && (
                    // 球拍延伸前臂方向；拍面法線朝前
                    <group ref={paddleGrp} position={[0, -0.03, 0]} rotation={[Math.PI, 0, 0]}>
                      <PaddleModel spec={spec} glow={0} />
                      <object3D ref={tip} position={[0, sweetSpotY(spec), 0]} />
                    </group>
                  )}
                </group>
              </group>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};
