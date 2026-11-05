import * as THREE from 'three';
import type { Athlete, GameEngine } from '../engine/game';
import type { Grip } from '../engine/technique';
import { teamSide } from '../engine/rules';
import { NET_ZONE, SMASH_HEIGHT } from '../engine/shots';

/**
 * 選手姿勢解算（和 React 無關，可以在 Node 裡跑測試）。
 *
 * - 下半身：動作庫的待機／準備蹲姿／慢跑／衝刺依速度混合（腳步自然）
 * - 上半身：依匹克球技術定義的揮拍軌跡（準備姿勢、正反手抽球、吊小球、截擊、殺球、低手發球、挑高球），
 *   用「拍面甜區位置＋拍子方向」描述，再用有關節限制的 IK 解出手臂：
 *   手肘只往正常方向彎、前臂旋轉與手腕都有幅度上限、腰轉不超過約 50°，不會扭出人體做不到的角度。
 *
 * 座標：模型面向本地 +Z、右手在 -X。揮拍資料用「面向球網」的身體座標 [右, 上, 前]。
 */

type V = readonly [number, number, number];

interface Pose {
  /** 甜區位置：abs 姿勢是 [右, 相對肩高, 前]；rel 姿勢是相對擊球點的位移 */
  pos: V;
  /** 拍頭方向 */
  tip: V;
  /** 握拍手掌心朝向＝拍面朝向（反手時手背朝球，掌心朝後） */
  palm: V;
  /** 手肘往哪邊突出 */
  pole: V;
  /** 上半身朝向（正 = 往左轉） */
  yaw: number;
  /** 上半身前傾 */
  lean: number;
  /** 非持拍手 [右, 相對肩高, 前] */
  off: V;
}

interface Stroke {
  back: Pose;
  contact: Omit<Pose, 'pos'>;
  follow: Pose;
  /** back / follow 的 pos 是相對擊球點（小動作），否則是身體座標（大動作） */
  rel: boolean;
  crouch: number;
}

type Kind = 'fh' | 'bh' | 'fhLow' | 'bhLow' | 'fhHigh' | 'bhHigh' | 'lobF' | 'lobB' | 'smash' | 'serve';

/** 準備姿勢：拍子在胸前、拍頭朝上，手背朝網（反手握的準備） */
const READY: Pose = {
  pos: [0, -0.3, 0.42],
  tip: [-0.25, 0.85, 0.35],
  palm: [0.15, 0, -1],
  pole: [0.6, -1, -0.3],
  yaw: 0,
  lean: 0.12,
  off: [-0.08, -0.3, 0.33],
};

const STROKES: Record<Kind, Stroke> = {
  // 正手抽球：轉肩拉拍到右後方 → 低往高揮到身體前方 → 收拍到左肩
  fh: {
    rel: false,
    crouch: 0.45,
    back: { pos: [0.5, -0.45, -0.28], tip: [0.15, 0.05, -1], palm: [0.95, -0.15, 0.25], pole: [0.5, -0.9, -0.6], yaw: -0.75, lean: 0.2, off: [0.12, -0.25, 0.38] },
    contact: { tip: [0.85, -0.15, -0.2], palm: [0, 0.1, 1], pole: [0.55, -1, -0.4], yaw: 0.1, lean: 0.2, off: [-0.32, -0.3, 0.22] },
    follow: { pos: [-0.25, 0.12, 0.22], tip: [0.05, 0.8, -0.6], palm: [-0.95, 0.1, 0.25], pole: [0.2, -0.7, 0.7], yaw: 0.6, lean: 0.1, off: [-0.3, -0.35, -0.05] },
  },
  // 反手抽球：轉肩拉拍到左後方 → 揮到左前方擊球（手背朝網）→ 收拍到右邊
  bh: {
    rel: false,
    crouch: 0.45,
    back: { pos: [-0.3, -0.38, -0.08], tip: [-0.1, 0.1, -1], palm: [0.95, 0, -0.2], pole: [0.2, -1, 0.4], yaw: 0.7, lean: 0.2, off: [-0.25, -0.42, 0.05] },
    contact: { tip: [-0.85, -0.1, -0.2], palm: [0, -0.1, -1], pole: [0.35, -1, 0.45], yaw: -0.1, lean: 0.2, off: [-0.45, -0.35, -0.25] },
    follow: { pos: [0.42, 0.05, 0.28], tip: [0.5, 0.65, -0.45], palm: [-0.9, 0.1, -0.3], pole: [0.7, -0.4, 0.3], yaw: -0.5, lean: 0.1, off: [-0.45, -0.3, -0.3] },
  },
  // 吊小球（dink）：用腳不用手——膝蓋彎很低、肩膀幾乎不轉，小拉拍、拍面打開往前上推送
  fhLow: {
    rel: true,
    crouch: 0.78,
    back: { pos: [0.12, 0.05, -0.26], tip: [0.45, -0.75, 0.3], palm: [0, 0.35, 0.94], pole: [0.6, -0.6, -0.5], yaw: -0.12, lean: 0.25, off: [-0.25, -0.35, 0.3] },
    contact: { tip: [0.45, -0.75, 0.3], palm: [0, 0.45, 0.9], pole: [0.6, -0.7, -0.4], yaw: 0, lean: 0.25, off: [-0.3, -0.35, 0.25] },
    follow: { pos: [-0.06, 0.22, 0.3], tip: [0.35, -0.35, 0.85], palm: [0, 0.7, 0.7], pole: [0.5, -0.8, -0.1], yaw: 0.15, lean: 0.25, off: [-0.3, -0.35, 0.2] },
  },
  bhLow: {
    rel: true,
    crouch: 0.78,
    back: { pos: [-0.12, 0.05, -0.26], tip: [-0.45, -0.75, 0.3], palm: [0, -0.35, -0.94], pole: [0.3, -0.9, 0.3], yaw: 0.12, lean: 0.25, off: [-0.35, -0.38, 0.15] },
    contact: { tip: [-0.45, -0.75, 0.3], palm: [0, -0.45, -0.9], pole: [0.3, -0.9, 0.4], yaw: 0, lean: 0.25, off: [-0.4, -0.35, 0] },
    follow: { pos: [0.06, 0.22, 0.3], tip: [-0.35, -0.35, 0.85], palm: [0, -0.7, -0.7], pole: [0.4, -0.8, 0.4], yaw: -0.15, lean: 0.25, off: [-0.4, -0.35, 0] },
  },
  // 截擊（胸口以上的球）：拍頭朝上、短推，不大揮
  fhHigh: {
    rel: true,
    crouch: 0.25,
    back: { pos: [0.12, 0.05, -0.22], tip: [0.45, 0.8, 0.25], palm: [0, 0, 1], pole: [0.8, -0.6, -0.2], yaw: -0.35, lean: 0.05, off: [-0.25, -0.2, 0.35] },
    contact: { tip: [0.45, 0.8, 0.25], palm: [0, 0, 1], pole: [0.8, -0.6, -0.2], yaw: 0, lean: 0.05, off: [-0.3, -0.25, 0.25] },
    follow: { pos: [-0.05, -0.08, 0.22], tip: [0.35, 0.8, 0.45], palm: [0, -0.2, 1], pole: [0.7, -0.7, 0], yaw: 0.1, lean: 0.1, off: [-0.3, -0.3, 0.2] },
  },
  bhHigh: {
    rel: true,
    crouch: 0.25,
    back: { pos: [-0.15, 0.05, -0.22], tip: [-0.45, 0.8, 0.25], palm: [0, 0, -1], pole: [0.3, -0.8, 0.4], yaw: 0.4, lean: 0.05, off: [-0.35, -0.25, 0.2] },
    contact: { tip: [-0.45, 0.8, 0.25], palm: [0, 0, -1], pole: [0.3, -0.8, 0.45], yaw: 0, lean: 0.05, off: [-0.4, -0.3, 0] },
    follow: { pos: [0.05, -0.08, 0.22], tip: [-0.35, 0.8, 0.45], palm: [0, 0.2, -1], pole: [0.4, -0.8, 0.4], yaw: -0.1, lean: 0.1, off: [-0.4, -0.3, 0] },
  },
  // 挑高球：拍面打開，從低往高送得很高
  lobF: {
    rel: true,
    crouch: 0.5,
    back: { pos: [0.12, -0.05, -0.28], tip: [0.5, -0.7, 0.2], palm: [0, 0.4, 0.9], pole: [0.6, -0.7, -0.5], yaw: -0.35, lean: 0.3, off: [-0.25, -0.35, 0.3] },
    contact: { tip: [0.5, -0.6, 0.3], palm: [0, 0.65, 0.75], pole: [0.6, -0.7, -0.4], yaw: 0, lean: 0.25, off: [-0.3, -0.3, 0.25] },
    follow: { pos: [-0.05, 0.5, 0.3], tip: [0.3, 0.6, 0.75], palm: [0, 0.75, 0.6], pole: [0.5, -0.6, 0.4], yaw: 0.2, lean: 0.05, off: [-0.3, -0.3, 0.1] },
  },
  lobB: {
    rel: true,
    crouch: 0.5,
    back: { pos: [-0.12, -0.05, -0.28], tip: [-0.5, -0.7, 0.2], palm: [0, -0.4, -0.9], pole: [0.3, -0.9, 0.3], yaw: 0.35, lean: 0.3, off: [-0.35, -0.38, 0.15] },
    contact: { tip: [-0.5, -0.6, 0.3], palm: [0, -0.65, -0.75], pole: [0.3, -0.9, 0.4], yaw: 0, lean: 0.25, off: [-0.4, -0.35, 0] },
    follow: { pos: [0.05, 0.5, 0.3], tip: [-0.3, 0.6, 0.75], palm: [0, -0.75, -0.6], pole: [0.5, -0.6, 0.4], yaw: -0.2, lean: 0.05, off: [-0.4, -0.3, 0] },
  },
  // 殺球：側身、拍子落到頭後（獎盃姿勢）、左手指球 → 高點往前下方揮 → 收到左側腰
  smash: {
    rel: false,
    crouch: 0.15,
    back: { pos: [0.3, 0.05, -0.3], tip: [0.1, -0.5, -0.85], palm: [0.9, 0, 0.4], pole: [0.9, 0.4, -0.3], yaw: -0.7, lean: -0.12, off: [-0.15, 0.45, 0.3] },
    contact: { tip: [0.15, 0.95, 0.25], palm: [0, -0.25, 1], pole: [0.9, 0.1, -0.3], yaw: 0, lean: 0.1, off: [-0.3, -0.15, 0.2] },
    follow: { pos: [-0.2, -0.5, 0.32], tip: [-0.4, -0.7, 0.5], palm: [-0.6, -0.6, 0.5], pole: [0.3, -0.8, 0.3], yaw: 0.55, lean: 0.25, off: [-0.25, -0.45, 0.1] },
  },
  // 低手發球：拍子往右後下方拉 → 腰下方擊球 → 往前上方送
  serve: {
    rel: false,
    crouch: 0.35,
    back: { pos: [0.38, -0.7, -0.3], tip: [0.15, -0.75, -0.65], palm: [0.4, 0.2, 0.9], pole: [0.4, -1, -0.4], yaw: -0.4, lean: 0.25, off: [-0.05, -0.45, 0.42] },
    contact: { tip: [0.35, -0.85, 0.35], palm: [0, 0.35, 0.94], pole: [0.5, -1, -0.3], yaw: 0, lean: 0.2, off: [-0.3, -0.35, 0.25] },
    follow: { pos: [0.05, 0.05, 0.4], tip: [0.1, 0.9, 0.4], palm: [0, 0.3, 1], pole: [0.5, -0.8, 0.2], yaw: 0.3, lean: 0.05, off: [-0.3, -0.35, 0.15] },
  },
};

/** 前揮時間、收拍時間、回到準備姿勢的時間 */
const FWD = 0.16;
const FOL = 0.2;
const REC = 0.4;
/** 關節限制 */
const MAX_TWIST = 0.9;
const MAX_PRONATION = 1.6;
const MAX_WRIST = 1.0;

const LOCO = ['Idle_Loop', 'Crouch_Idle_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop', 'Mx_SideStep_R', 'Mx_SideStep_L'] as const;
const OVERLAYS = [
  'Hit_Knockback',
  'Jump_Loop',
  'Yes',
  'Idle_No_Loop',
  'Mx_HipHop',
  'Mx_Shuffle',
  'Mx_KneeCombo',
  'Mx_BigSlash',
  'Mx_Downward',
  'Mx_ShieldStrike',
  'Mx_PowerIdle',
] as const;
type Overlay = (typeof OVERLAYS)[number];

/** 得分慶祝（隨機挑一種）：[動作, 從第幾秒開始播, 機率權重] */
type Celebration = [Overlay, number, number];
/** 漂亮得分（致勝球、殺球、長連擊、覺醒中）：跳舞、飛膝 */
const CELEBRATIONS: Celebration[] = [
  ['Mx_HipHop', 1.5, 2.5],
  ['Mx_Shuffle', 1.0, 2.5],
  ['Mx_KneeCombo', 0.25, 1.5],
  ['Yes', 0.1, 1],
];
/** 撿到對手失誤：握拳、扛拍耍帥挑釁，偶爾跳一段曳步舞 */
const TAUNTS: Celebration[] = [
  ['Yes', 0.1, 3],
  ['Mx_PowerIdle', 0, 2.5],
  ['Mx_Shuffle', 1.0, 1],
];
const pick = (list: Celebration[]) => {
  let r = Math.random() * list.reduce((n, c) => n + c[2], 0);
  return list.find((c) => (r -= c[2]) < 0) ?? list[0];
};
/** 必殺技出手後的身段：[動作, 高潮時間點] */
const SPECIAL_MOVES: Record<string, [Overlay, number]> = {
  inferno: ['Mx_BigSlash', 1.67],
  thunder: ['Mx_KneeCombo', 1.0],
  phantom: ['Mx_ShieldStrike', 0.6],
  frost: ['Mx_Downward', 0.83],
};
/** 側併步一步（0.5 秒）跨多遠 */
const SIDESTEP_LEN = 1.5;

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const clamp01 = (x: number) => clamp(x, 0, 1);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const approach = (cur: number, target: number, rate: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-rate * dt));
const lerpV = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export interface PaddleMount {
  /** 球拍相對手骨的旋轉 */
  q: THREE.Quaternion;
  /** 球拍相對手骨的位置（公尺，手骨的軸向） */
  p: THREE.Vector3;
  /** 掌心方向（手骨座標） */
  palm: THREE.Vector3;
}

/**
 * 握拍位置：握手式握拍，握把斜穿過拳頭、拍頭朝拇指方向前伸，拍面和掌心平行。
 * 用綁定姿勢（T-pose：手指朝外、掌心朝下、拇指朝前）的模型座標定義，再換到手骨座標，任何 T-pose 骨架都適用。
 */
export const paddleMount = (handModelQ: THREE.Quaternion, side: 'r' | 'l' = 'r'): PaddleMount => {
  // 右手手指朝模型 -X、左手朝 +X
  const out = side === 'r' ? -1 : 1;
  const tip = new THREE.Vector3(0.55 * out, 0, 0.84).normalize();
  const palm = new THREE.Vector3(0, -1, 0);
  const x = new THREE.Vector3().crossVectors(tip, palm);
  const model = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, tip, palm));
  const inv = handModelQ.clone().invert();
  return {
    q: inv.clone().multiply(model),
    p: new THREE.Vector3(0.085 * out, -0.035, 0).applyQuaternion(inv),
    palm: palm.applyQuaternion(inv),
  };
};

/** 解算出來的目標（世界座標） */
interface Target {
  sweet: THREE.Vector3;
  paddle: THREE.Quaternion;
  pole: THREE.Vector3;
  off: THREE.Vector3;
  yaw: number;
  lean: number;
  /** 拍面要多貼近指定方向（0 = 照手的自然角度，1 = 完全照指定）；擊球瞬間最高 */
  faceK: number;
}

interface ArmBones {
  upper: THREE.Bone;
  fore: THREE.Bone;
  hand: THREE.Bone;
  clav: THREE.Bone;
  l1: number;
  l2: number;
  /** 綁定姿勢（模型空間）：骨頭方向、手肘轉軸、旋轉 */
  axisU: THREE.Vector3;
  axisF: THREE.Vector3;
  hinge: THREE.Vector3;
  bindU: THREE.Quaternion;
  bindF: THREE.Quaternion;
  /** 綁定姿勢下手相對前臂的旋轉 */
  rel0: THREE.Quaternion;
}

// 模組層級的暫存（避免每幀配置）
const _v = Array.from({ length: 10 }, () => new THREE.Vector3());
const _q = Array.from({ length: 8 }, () => new THREE.Quaternion());
const _m = [new THREE.Matrix4(), new THREE.Matrix4()];

/** 把一組正交基 (a0, s0) 轉到 (a, s) 的旋轉 */
const _ay = [new THREE.Vector3(), new THREE.Vector3()];
const _az = [new THREE.Vector3(), new THREE.Vector3()];
const alignQ = (a0: THREE.Vector3, s0: THREE.Vector3, a: THREE.Vector3, s: THREE.Vector3, out: THREE.Quaternion) => {
  const basis = (ax: THREE.Vector3, sx: THREE.Vector3, m: THREE.Matrix4, i: number) => {
    const y = _ay[i].copy(sx).addScaledVector(ax, -ax.dot(sx)).normalize();
    const z = _az[i].crossVectors(ax, y);
    m.makeBasis(ax, y, z);
  };
  basis(a0, s0, _m[0], 0);
  basis(a, s, _m[1], 1);
  _m[1].multiply(_m[0].transpose());
  return out.setFromRotationMatrix(_m[1]);
};

/** 把骨頭設成指定的世界旋轉 */
const setWorldQ = (bone: THREE.Object3D, q: THREE.Quaternion) => {
  bone.parent!.getWorldQuaternion(_q[7]);
  bone.quaternion.copy(_q[7].invert().multiply(q));
  bone.updateMatrixWorld(true);
};

/** 以世界座標的旋轉疊加到骨頭上 */
const rotateWorld = (bone: THREE.Object3D, q: THREE.Quaternion) => {
  bone.getWorldQuaternion(_q[6]);
  _q[6].premultiply(q);
  setWorldQ(bone, _q[6]);
};

/** 四元數繞某軸的扭轉角（swing-twist 分解） */
const twistAngle = (q: THREE.Quaternion, axis: THREE.Vector3) => {
  const sgn = q.w < 0 ? -1 : 1;
  const p = (q.x * axis.x + q.y * axis.y + q.z * axis.z) * sgn;
  return 2 * Math.atan2(p, q.w * sgn);
};

export interface PoserStats {
  /** 手肘彎曲角（0 = 打直） */
  maxElbow: number;
  maxTwist: number;
  maxWrist: number;
  /** 擊球瞬間拍面甜區離擊球點多遠（公尺） */
  contactMiss: number[];
  /** 擊球點超出手臂＋球拍長度多少（要靠跨步／傾身才搆得到） */
  overReach: number[];
  nan: number;
}

export class AthletePoser {
  readonly mixer: THREE.AnimationMixer;
  private loco: Record<(typeof LOCO)[number], THREE.AnimationAction>;
  private overlay: Record<Overlay, THREE.AnimationAction>;
  private bones = new Map<string, THREE.Bone>();
  private bindQ = new Map<THREE.Object3D, THREE.Quaternion>();
  private arms: { r: ArmBones; l: ArmBones };
  private offset = new THREE.Vector3();
  /** 握拍位置（給畫面上的球拍用） */
  readonly mount: PaddleMount;
  stats: PoserStats = { maxElbow: 0, maxTwist: 0, maxWrist: 0, contactMiss: [], overReach: [], nan: 0 };

  // 狀態
  private phase = 0;
  private idleT = 0;
  private yaw = 0;
  private crouch = 0.3;
  private over = Object.fromEntries(OVERLAYS.map((k) => [k, 0])) as Record<Overlay, number>;
  private celebrateAt = -1;
  private sidePhase = 0;
  /** 「幹他！」起跳的開始時間 */
  private spinFrom = -99;
  /** 絕招動作額外的前傾 */
  private extraLean = 0;
  /** 動力鏈：前揮時髖部比肩膀先轉（0＝平均分配，1＝下背帶頭） */
  private chainLead = 0;
  /** 重心轉移：抽球時從後腳移到前腳（沿面向球網的方向，公尺） */
  private weight = 0;
  /** 這位選手的握拍（每幀從引擎讀）：決定抽球時拍面開合 */
  private grip: Grip | undefined;
  private celebration: Celebration = CELEBRATIONS[0];
  /** 失分的反應：true = 先被打到踉蹌再搖頭，false = 直接搖頭 */
  private stagger = false;
  private knockAt = -1;
  private knockUntil = 0;
  private jumpAt = 0;
  private jumpH = 0;
  /** 目前鎖定的這一拍 */
  private cur: { tC: number; c: THREE.Vector3; kind: Kind; fwdStart: number; swung: boolean } | null = null;
  private pathKey = -1;
  private pathContact = new THREE.Vector3();
  private sm: Target | null = null;
  private lastContactCheck = -1;
  private reach = new THREE.Vector3();
  private debugging = false;
  /** 會被程序化疊加修改的骨頭，以及它們這一幀的動畫值 */
  private animQ = new Map<THREE.Object3D, THREE.Quaternion>();
  /** 站直時骨盆離地多高（飛撲時繞骨盆把整個人放倒） */
  private pelvisH = 0.95;
  /** 飛撲把身體放倒的旋轉（世界座標） */
  private diveQ = new THREE.Quaternion();
  private diveTgt: Target = {
    sweet: new THREE.Vector3(),
    paddle: new THREE.Quaternion(),
    pole: new THREE.Vector3(),
    off: new THREE.Vector3(),
    yaw: 0,
    lean: 0,
    faceK: 0.5,
  };

  private group: THREE.Object3D;
  private scene: THREE.Object3D;
  private clips: Map<string, THREE.AnimationClip>;
  /** 拍面甜區（測試用：記錄擊球瞬間離球多遠） */
  tip?: THREE.Object3D;

  constructor(group: THREE.Object3D, scene: THREE.Object3D, clips: Map<string, THREE.AnimationClip>, sweetY: number, tip?: THREE.Object3D) {
    this.group = group;
    this.scene = scene;
    this.clips = clips;
    this.tip = tip;
    scene.updateMatrixWorld(true);
    const sceneQ = scene.getWorldQuaternion(new THREE.Quaternion()).invert();
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone) {
        this.bones.set(o.name, o as THREE.Bone);
        this.bindQ.set(o, sceneQ.clone().multiply(o.getWorldQuaternion(new THREE.Quaternion())));
      }
    });
    const pos = (n: string) => this.scene.worldToLocal(this.bone(n).getWorldPosition(new THREE.Vector3()));
    const arm = (side: 'r' | 'l'): ArmBones => {
      const u = pos(`upperarm_${side}`);
      const f = pos(`lowerarm_${side}`);
      const h = pos(`hand_${side}`);
      const bindF = this.bindQ.get(this.bone(`lowerarm_${side}`))!;
      return {
        upper: this.bone(`upperarm_${side}`),
        fore: this.bone(`lowerarm_${side}`),
        hand: this.bone(`hand_${side}`),
        clav: this.bone(`clavicle_${side}`),
        l1: u.distanceTo(f),
        l2: f.distanceTo(h),
        axisU: f.clone().sub(u).normalize(),
        axisF: h.clone().sub(f).normalize(),
        // T-pose 手掌朝下：手肘彎向前（+Z）→ 轉軸右手 +Y、左手 -Y
        hinge: new THREE.Vector3(0, side === 'r' ? 1 : -1, 0),
        bindU: this.bindQ.get(this.bone(`upperarm_${side}`))!.clone(),
        bindF: bindF.clone(),
        rel0: bindF.clone().invert().multiply(this.bindQ.get(this.bone(`hand_${side}`))!),
      };
    };
    this.arms = { r: arm('r'), l: arm('l') };
    this.pelvisH = pos('pelvis').y || 0.95;
    this.mount = paddleMount(this.bindQ.get(this.bone('hand_r'))!);
    this.offset.copy(this.mount.p).add(new THREE.Vector3(0, sweetY, 0).applyQuaternion(this.mount.q));

    this.mixer = new THREE.AnimationMixer(scene);
    const act = (name: string) => {
      const clip = clips.get(name);
      if (!clip) throw new Error(`clip ${name} missing`);
      const a = this.mixer.clipAction(clip);
      a.play();
      a.setEffectiveWeight(0);
      return a;
    };
    const rec = <K extends string>(keys: readonly K[]) => Object.fromEntries(keys.map((k) => [k, act(k)])) as Record<K, THREE.AnimationAction>;
    this.loco = rec(LOCO);
    this.overlay = rec(OVERLAYS);
    for (const n of ['spine_01', 'spine_02', 'spine_03', 'neck_01', 'Head', 'upperarm_r', 'lowerarm_r', 'hand_r', 'upperarm_l', 'lowerarm_l', 'hand_l']) {
      const b = this.bone(n);
      this.animQ.set(b, b.quaternion.clone());
    }
  }

  private bone(name: string) {
    return this.bones.get(name)!;
  }

  dispose() {
    this.mixer.stopAllAction();
  }

  // ───────────────────────────── 每幀 ─────────────────────────────

  update(engine: GameEngine, index: number, raw: number) {
    const a: Athlete = engine.athletes[index];
    const g = this.group;
    const rdt = Math.min(0.05, raw);
    const dt = rdt * engine.timeScale;
    const s = teamSide(a.team);
    const t = engine.time;
    const al = engine.alpha;
    const baseYaw = s > 0 ? Math.PI : 0;
    g.position.set(a.prevPos.x + (a.pos.x - a.prevPos.x) * al, 0, a.prevPos.z + (a.pos.z - a.prevPos.z) * al);
    if (this.debugPose(baseYaw)) return;

    // ── 這一拍（下一個擊球點）
    const up = this.upcoming(engine, a);
    this.trackStroke(engine, a, up);
    const st = this.cur;
    const tau = st ? t - st.tC : 99;
    this.grip = a.traits.grip;
    const strokeOn = st !== null && tau < FOL + REC;
    // 飛身撲接：放倒的角度、骨盆高度、爬起來的進度（0 = 還趴著，1 = 站好）
    const dive = a.dive ? this.divePose(a.dive, t) : null;

    // 跨步搆球：擊球點超出手臂＋球拍的長度時，擊球前後身體往球的方向跨過去（最多 50 cm）
    const reachT = _v[9].set(0, 0, 0);
    if (!dive && st && st.swung && tau > -0.3 && tau < 0.35) {
      const sh = _v[0].set(g.position.x, 0, g.position.z).addScaledVector(_v[1].set(s > 0 ? 1 : -1, 0, 0), 0.2);
      const dx = st.c.x - sh.x;
      const dz = st.c.z - sh.z;
      const dh = Math.hypot(dx, dz);
      const vert = Math.max(0, 1.35 - st.c.y - 0.3);
      const need = Math.sqrt(dh * dh + vert * vert) - (this.arms.r.l1 + this.arms.r.l2 + this.offset.length()) * 0.85;
      if (need > 0 && dh > 0.01) {
        const k = Math.min(0.5, need) * smoothstep(-0.3, -0.08, tau) * (1 - smoothstep(0.08, 0.35, tau));
        reachT.set((dx / dh) * k, 0, (dz / dh) * k);
      }
    }
    this.reach.lerp(reachT, 1 - Math.exp(-18 * rdt));
    g.position.add(this.reach);

    // 重心轉移與動力鏈：大揮拍（抽球、殺球、發球）拉拍時重心落在後腳，前揮時往前腳壓過去，
    // 髖部先轉、肩膀跟上；dink、截擊這種小動作只用手腳，不做
    const big = st !== null && (st.kind === 'fh' || st.kind === 'bh' || st.kind === 'smash' || st.kind === 'serve');
    let weightT = 0;
    let leadT = 0;
    if (big && st && !dive) {
      const prepK = this.prepWeight(a, st, t);
      if (tau < 0 && st.swung && t >= st.fwdStart) {
        const u = clamp01((t - st.fwdStart) / Math.max(0.04, st.tC - st.fwdStart));
        weightT = -0.07 + 0.16 * smoothstep(0, 1, u);
        leadT = Math.sin(Math.PI * Math.min(1, u * 1.15));
      } else if (tau < 0) weightT = -0.07 * prepK;
      else weightT = 0.09 * (1 - smoothstep(0, FOL + REC, tau));
    }
    this.weight = approach(this.weight, weightT, 16, dt);
    this.chainLead = approach(this.chainLead, leadT, 20, dt);
    g.position.x += Math.sin(baseYaw) * this.weight;
    g.position.z += Math.cos(baseYaw) * this.weight;

    // ── 移動：模型座標的速度（+Z 朝網）
    // 飛撲時腳不跑步：照撲出去的姿勢
    const vx = dive ? 0 : -s * a.vel.x;
    const vz = dive ? 0 : -s * a.vel.z;
    const speed = Math.hypot(vx, vz);
    // 主要往左右移動：用側併步，身體一直面向球網（不再整個人轉過去跑）
    // 跑得很快的大角度球改用交叉步：髖部轉向跑動方向、跨步過去（側併步跟不上速度時腳會像在滑）
    const cross = smoothstep(2.3, 3.3, speed);
    const side = smoothstep(0.3, 0.8, speed) * smoothstep(0.6, 0.85, speed > 0.01 ? Math.abs(vx) / speed : 0) * (1 - cross);
    let back = false;
    let yawT = 0;
    if (speed > 0.5) {
      const psi = Math.atan2(vx, vz);
      if (Math.abs(psi) <= 1.95) yawT = psi * 0.75;
      else {
        yawT = (psi - Math.PI * Math.sign(psi)) * 0.75;
        back = true;
      }
      // 揮拍準備中身體不要轉太開
      if (strokeOn) yawT *= 0.4;
      yawT *= 1 - side;
    }
    this.yaw = approach(this.yaw, yawT, 9, dt);
    // 絕招動作：「幹他！」擊球前起跳、空中轉體一圈（轉完才擊球，面向球網扣殺）
    let spinYaw = 0;
    let skillLift = 0;
    if (a.skill === 'spinSmash') {
      if (a.skillArmed && st && st.swung) this.spinFrom = st.tC - 0.4;
      const u = (t - this.spinFrom) / 0.8;
      if (u > 0 && u < 1) {
        skillLift = Math.sin(Math.PI * u) * 0.55;
        spinYaw = Math.PI * 2 * smoothstep(0.06, 0.45, u);
      }
    }
    // 「秒蹲大力一揮」：就緒後一路深蹲到擊球
    const squat = a.skill === 'squatSmash' && ((a.skillArmed && st !== null) || t - a.skillAt < 0.3);
    this.extraLean = approach(this.extraLean, squat ? 0.3 : 0, 10, dt);
    g.rotation.set(0, baseYaw + this.yaw + spinYaw, 0);

    const incoming = engine.phase === 'rally' && engine.rally.lastTeam !== a.team;
    const strokeDef = st ? STROKES[st.kind] : null;
    const prep = st ? this.prepWeight(a, st, t) : 0;
    // 網前接球蹲得更低（真實選手在廚房線前幾乎是半蹲）
    const atNet = Math.abs(a.pos.z) < 2.13 + 0.9;
    let crouchT = incoming ? (atNet ? 0.6 : 0.42) : 0.3;
    // 分腿墊步：對手出手後 0.28 秒內，落地那一下多蹲一點
    const oppHit = t - engine.opponentOf(a).swing.contactAt;
    const splitU = engine.phase === 'rally' && !a.dive ? oppHit / 0.28 : -1;
    if (splitU > 0.45 && splitU < 1) crouchT = Math.max(crouchT, 0.75);
    if (strokeDef && strokeOn) crouchT = crouchT + (strokeDef.crouch - crouchT) * Math.max(prep, tau > -FWD ? 1 : 0);
    if (squat) crouchT = 1;
    // 撲出去身體伸直（腳打直）；爬起來時先蹲著再站起來
    if (dive) crouchT = dive.up > 0 ? 1 - dive.up * 0.6 : 0;
    this.crouch = approach(this.crouch, crouchT, squat || dive ? 14 : 6, dt);

    const run = smoothstep(0, 0.6, speed);
    const spr = smoothstep(3.0, 4.2, speed);
    const L = 2.2 + 0.9 * spr;
    this.phase = (this.phase + dt * Math.max(speed / L, run > 0.05 ? 1 : 0) * (back ? -1 : 1) + 10) % 1;
    this.sidePhase = (this.sidePhase + dt * Math.max(speed / SIDESTEP_LEN, 0.8)) % 1;
    this.idleT += rdt;

    // ── 全身覆蓋：被震退、騰空、得失分反應
    const ov = this.overlays(engine, a, t, rdt, st);

    // ── 動作混合（下半身與整體基底）
    const B = 1 - ov;
    const Lc = this.loco;
    Lc.Idle_Loop.setEffectiveWeight(B * (1 - run) * (1 - this.crouch));
    Lc.Crouch_Idle_Loop.setEffectiveWeight(B * (1 - run) * this.crouch);
    Lc.Jog_Fwd_Loop.setEffectiveWeight(B * run * (1 - spr) * (1 - side));
    Lc.Sprint_Loop.setEffectiveWeight(B * run * spr * (1 - side));
    // 模型 +X 是選手的左邊
    Lc.Mx_SideStep_L.setEffectiveWeight(B * run * side * (vx > 0 ? 1 : 0));
    Lc.Mx_SideStep_R.setEffectiveWeight(B * run * side * (vx > 0 ? 0 : 1));
    Lc.Mx_SideStep_L.time = this.sidePhase * Lc.Mx_SideStep_L.getClip().duration;
    Lc.Mx_SideStep_R.time = this.sidePhase * Lc.Mx_SideStep_R.getClip().duration;
    Lc.Idle_Loop.time = this.idleT % Lc.Idle_Loop.getClip().duration;
    Lc.Crouch_Idle_Loop.time = this.idleT % Lc.Crouch_Idle_Loop.getClip().duration;
    Lc.Jog_Fwd_Loop.time = this.phase * Lc.Jog_Fwd_Loop.getClip().duration;
    Lc.Sprint_Loop.time = this.phase * Lc.Sprint_Loop.getClip().duration;
    const osum = OVERLAYS.reduce((n, k) => n + this.over[k], 0) || 1;
    for (const k of OVERLAYS) this.overlay[k].setEffectiveWeight((ov * this.over[k]) / osum);
    // 混合器只在動畫值「和上一幀不同」時才寫回骨頭；值沒變的骨頭會留著上一幀疊加的轉角，
    // 一幀一幀累加就會扭成怪物。所以先還原成上一幀的動畫值，再更新、再存一次。
    for (const [b, q] of this.animQ) b.quaternion.copy(q);
    this.mixer.update(0);
    for (const [b, q] of this.animQ) q.copy(b.quaternion);

    // 跳躍高度、分腿墊步
    let lift = 0;
    if (this.jumpH > 0) {
      const u = (t - this.jumpAt) / 0.3;
      if (u >= 1) this.jumpH = 0;
      else if (u > -1) lift = this.jumpH * (1 - u * u);
    }
    // 天雷的騰空改由飛膝動作本身處理
    if (t < a.jumpUntil && this.over.Mx_KneeCombo < 0.3) lift = Math.sin(clamp01(1 - (a.jumpUntil - t) / 0.55) * Math.PI) * 0.75;
    // 分腿墊步（split step）：對手擊球瞬間雙腳小跳一下，落地蹲低蓄力再起步（crouch 在上面已經加了落地的下沉）
    if (splitU > 0 && splitU < 1) lift += Math.sin(Math.min(1, splitU / 0.55) * Math.PI) * 0.1;
    g.position.y = lift + skillLift;
    if (dive) {
      // 繞骨盆把整個人往撲的方向放倒（頭先過去），骨盆照飛撲的弧線走
      const ax = _v[0].set(a.dive!.dir.z, 0, -a.dive!.dir.x);
      this.diveQ.setFromAxisAngle(ax, dive.angle);
      g.quaternion.premultiply(this.diveQ);
      const piv = _v[1].set(0, this.pelvisH, 0).applyQuaternion(this.diveQ);
      g.position.y = dive.pelvisY - piv.y;
      g.position.x -= piv.x;
      g.position.z -= piv.z;
    }
    g.updateMatrixWorld(true);

    // ── 上半身：揮拍目標 → 腰 → 手臂 IK → 頭
    const w = 1 - ov;
    if (w < 0.02) return;
    let tgt = this.evaluate(engine, baseYaw, st, tau, prep, run);
    if (!tgt) return;
    if (dive) tgt = this.diveTarget(engine, a, st, tgt, dive.up);
    this.smooth(tgt, rdt, Math.abs(tau) < 0.12 ? 90 : 30);
    let sm = this.sm!;
    if (spinYaw !== 0) {
      // 空中轉體時，手臂目標跟著身體一起轉，才不會反手往背後硬搆
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spinYaw);
      const c = g.position;
      const turn = (v: THREE.Vector3) => v.clone().sub(c).applyQuaternion(q).add(c);
      sm = { ...sm, sweet: turn(sm.sweet), off: turn(sm.off), pole: sm.pole.clone().applyQuaternion(q), paddle: q.clone().multiply(sm.paddle) };
    }
    this.applyTorso(sm, baseYaw, w);
    // 跑步時非持拍手跟著擺動（動作檔），揮拍時才用 IK
    const offW = w * (strokeOn ? 1 : 1 - run * 0.75);
    this.solveRight(sm, w);
    // 雙手反拍：反手拉拍到擊球、收拍前段，非持拍手握到拍柄上（疊在持拍手下方）
    const bhStroke = st !== null && (st.kind === 'bh' || st.kind === 'bhLow' || st.kind === 'bhHigh' || st.kind === 'lobB');
    if (a.traits.backhand === 'two' && bhStroke && strokeOn && !dive) {
      const k = Math.max(prep, tau > -FWD ? 1 : 0) * (1 - smoothstep(FOL * 0.6, FOL + 0.12, tau));
      if (k > 0.02) {
        const handle = this.arms.r.hand.getWorldPosition(_v[0]).addScaledVector(_v[1].set(0, 1, 0).applyQuaternion(sm.paddle), -0.08);
        sm = { ...sm, off: sm.off.clone().lerp(handle, k) };
      }
    }
    if (offW > 0.02) this.solveLeft(sm, offW);
    this.lookAt(engine.ball.pos, w * 0.85);

    // 擊球前後記錄拍面離球最近多遠（測試用）
    if (st && st.swung && this.tip && Math.abs(tau) < 0.05) {
      const d = this.tip.getWorldPosition(_v[0]).distanceTo(st.c);
      if (this.lastContactCheck !== st.tC) {
        this.lastContactCheck = st.tC;
        this.stats.contactMiss.push(d);
        const sh = this.bone('upperarm_r').getWorldPosition(_v[0]);
        this.stats.overReach.push(Math.max(0, sh.distanceTo(st.c) - (this.arms.r.l1 + this.arms.r.l2 + this.offset.length())));
      } else {
        const m = this.stats.contactMiss;
        m[m.length - 1] = Math.min(m[m.length - 1], d);
      }
    }
    this.checkStats(sm);
  }

  /** 開發用：console 設 window.__athletePose = { clip, t } 把選手定格在某個動作（t 省略就照時間播） */
  private debugPose(yaw: number) {
    const dbg = import.meta.env?.DEV && typeof window !== 'undefined' ? (window as { __athletePose?: { clip: string; t?: number } }).__athletePose : null;
    const clip = dbg ? this.clips.get(dbg.clip) : null;
    if (!dbg || !clip) {
      if (this.debugging) {
        this.debugging = false;
        this.mixer.stopAllAction();
        for (const ac of [...Object.values(this.loco), ...Object.values(this.overlay)]) ac.play();
      }
      return false;
    }
    this.debugging = true;
    this.mixer.stopAllAction();
    const ac = this.mixer.clipAction(clip);
    ac.play();
    ac.setEffectiveWeight(1);
    ac.time = dbg.t ?? (performance.now() / 1000) % clip.duration;
    for (const [b, q] of this.animQ) b.quaternion.copy(q);
    this.mixer.update(0);
    this.group.rotation.set(0, yaw, 0);
    return true;
  }

  // ───────────────────────────── 這一拍 ─────────────────────────────

  /** 下一個擊球點：揮拍中用揮拍時預測的軌跡，否則 AI 用規劃、玩家用導引 */
  private upcoming(engine: GameEngine, a: Athlete): { t: number; c: THREE.Vector3; button: string; certain: boolean } | null {
    const sw = a.swing;
    if (sw.state === 'swinging' && sw.button === 'serve') {
      return { t: sw.contactAt, c: _v[0].set(engine.ball.pos.x, engine.ball.pos.y, engine.ball.pos.z), button: 'serve', certain: true };
    }
    if (sw.state === 'swinging' && !sw.done && sw.path) {
      if (this.pathKey !== sw.contactAt) {
        this.pathKey = sw.contactAt;
        const want = sw.contactAt - sw.pathT0;
        let best = sw.path[0];
        for (const p of sw.path) if (Math.abs(p.t - want) < Math.abs(best.t - want)) best = p;
        this.pathContact.set(best.pos.x, best.pos.y, best.pos.z);
      }
      return { t: sw.contactAt, c: this.pathContact, button: sw.button, certain: true };
    }
    if (engine.phase === 'serve' && engine.match.serving === a.team) {
      const b = engine.ball.pos;
      if (a.ai) return { t: a.ai.serveAt, c: _v[0].set(b.x, b.y, b.z), button: 'serve', certain: true };
      if (sw.state === 'charging') return { t: engine.time + 0.6, c: _v[0].set(b.x, b.y, b.z), button: 'serve', certain: false };
      return null;
    }
    if (engine.phase !== 'rally' || engine.rally.lastTeam === a.team) return null;
    if (a.ai) {
      const p = a.ai.plan;
      if (!p || p.leave) return null;
      return { t: p.contactT + p.timingError, c: _v[0].set(p.contact.x, p.contact.y, p.contact.z), button: sw.button, certain: true };
    }
    const g = engine.guide;
    if (!g || g.leave) return null;
    return { t: g.hitT, c: _v[0].set(g.contact.x, g.contact.y, g.contact.z), button: sw.state === 'idle' ? 'drive' : sw.button, certain: false };
  }

  private trackStroke(engine: GameEngine, a: Athlete, up: ReturnType<AthletePoser['upcoming']>) {
    const t = engine.time;
    const cur = this.cur;
    // 這一拍已經打出去：鎖住，直到收拍結束
    if (cur && cur.swung && t >= cur.tC) {
      if (t - cur.tC > FOL + REC || (up && up.t > cur.tC + 0.3)) this.cur = null;
      else return;
    }
    if (!up) {
      // 球沒來（出界球、對手失誤）：慢慢回準備姿勢
      if (cur && !cur.swung) this.cur = null;
      return;
    }
    // 面向 -z（s > 0）時右手在 +x
    const lateral = (up.c.x - a.pos.x) * teamSide(a.team);
    const sw = a.swing;
    const side = sw.state === 'swinging' && up.button !== 'serve' ? sw.forehand : lateral >= -0.05 ? 1 : -1;
    const special = engine.cinematic && engine.cinematic.team === a.team ? engine.cinematic.id : null;
    const h = up.c.y;
    let kind: Kind;
    if (up.button === 'serve') kind = 'serve';
    else if ((up.button === 'drive' && h > SMASH_HEIGHT && Math.abs(up.c.z) < 6) || special === 'thunder') kind = 'smash';
    else if (up.button === 'lob') kind = side > 0 ? 'lobF' : 'lobB';
    // 網前的推擋、突擊、卸力擋都是短揮：用截擊的小動作
    else if (h > 1.2 || (Math.abs(up.c.z) < NET_ZONE && h > 0.8)) kind = side > 0 ? 'fhHigh' : 'bhHigh';
    else if (h < 0.6 || (up.button === 'soft' && h < 0.9)) kind = side > 0 ? 'fhLow' : 'bhLow';
    else kind = side > 0 ? 'fh' : 'bh';

    const swung = sw.state === 'swinging' || (up.certain && !!a.ai) || (up.button === 'serve' && up.certain);
    if (!cur || Math.abs(cur.tC - up.t) > 0.25) {
      this.cur = { tC: up.t, c: new THREE.Vector3().copy(up.c), kind, fwdStart: up.t - FWD, swung };
    } else {
      cur.tC = up.t;
      cur.c.copy(up.c);
      cur.kind = kind;
      // 玩家晚一點才開始揮：前揮從開始揮的那一刻算
      if (!cur.swung && swung) cur.fwdStart = Math.max(up.t - FWD, t);
      cur.swung = swung;
    }
    // 高球跳殺
    if (kind === 'smash' && h > 1.9) {
      this.jumpAt = up.t;
      this.jumpH = Math.min(0.42, (h - 1.75) * 0.9);
    }
  }

  /** 拉拍準備的程度：玩家按住（蓄力）就拉到底；否則球越近拉越多 */
  private prepWeight(a: Athlete, st: NonNullable<AthletePoser['cur']>, t: number) {
    if (a.swing.state !== 'idle') return 1;
    // 提早轉肩（unit turn）：對手一出手、判斷得出正反手就先側身拉拍，不等球到才拉
    return smoothstep(1.05, 0.32, st.tC - t);
  }

  // ───────────────────────────── 飛身撲接 ─────────────────────────────

  /** 撲接各階段：起跳很快放倒 → 空中 → 落地趴著滑 → 最後半秒爬起來 */
  private divePose(d: NonNullable<Athlete['dive']>, t: number) {
    const GETUP = 0.5;
    const air = clamp01((t - d.t0) / Math.max(0.05, d.landAt - d.t0));
    const up = smoothstep(d.upAt - GETUP, d.upAt, t);
    const flat = 1.5;
    const angle = (air < 1 ? flat * smoothstep(0, 0.5, air) : flat) * (1 - up);
    const ground = 0.17;
    const pelvisY =
      air < 1 ? this.pelvisH + (ground - this.pelvisH) * air ** 1.6 + Math.sin(Math.PI * air) * 0.12 : ground + (this.pelvisH * 0.8 - ground) * up;
    return { angle, pelvisY, up, landed: air >= 1 };
  }

  /** 撲接的手：觸球前整隻手往球伸直，之後拍子順勢甩到前方地上；非持拍手撐地 */
  private diveTarget(engine: GameEngine, a: Athlete, st: AthletePoser['cur'], normal: Target, up: number): Target {
    const d = a.dive!;
    const t = engine.time;
    const D = _v[2].set(d.dir.x, 0, d.dir.z);
    const S = this.bone('upperarm_r').getWorldPosition(_v[3]);
    const chest = this.bone('spine_03').getWorldPosition(_v[4]);
    const m = this.diveTgt;
    const reaching = st !== null && st.swung && d.hitAt !== null && t < st.tC + 0.06;
    if (reaching) m.sweet.copy(st!.c);
    else if (t < d.landAt) m.sweet.copy(S).addScaledVector(D, 0.85).setY(Math.max(0.15, S.y - 0.15));
    else m.sweet.copy(S).addScaledVector(D, 0.8).setY(0.12);
    // 拍頭朝撲的方向、拍面朝對手場地往上撈
    const s = teamSide(a.team);
    const tip = _v[5].copy(D).setY(reaching ? 0.35 : 0.1).normalize();
    const palm = _v[6].set(0, 0.6, -s);
    palm.addScaledVector(tip, -palm.dot(tip)).normalize();
    const x = _v[7].crossVectors(tip, palm);
    m.paddle.setFromRotationMatrix(_m[0].makeBasis(x, tip, palm));
    m.pole.set(0, 1, 0).addScaledVector(D, -0.4).normalize();
    m.off.copy(chest).addScaledVector(D, 0.45).setY(Math.max(0.06, chest.y - 0.55));
    m.yaw = this.yaw;
    m.lean = 0;
    m.faceK = 0.55;
    if (up <= 0) return m;
    // 爬起來：手慢慢回到平常的準備姿勢
    m.sweet.lerp(normal.sweet, up);
    m.off.lerp(normal.off, up);
    m.paddle.slerp(normal.paddle, up);
    m.pole.lerp(normal.pole, up).normalize();
    m.yaw += (normal.yaw - m.yaw) * up;
    m.lean = normal.lean * up;
    return m;
  }

  // ───────────────────────────── 揮拍軌跡 ─────────────────────────────

  private evaluate(engine: GameEngine, baseYaw: number, st: AthletePoser['cur'], tau: number, prep: number, run: number): Target | null {
    const R = _v[1].set(-Math.cos(baseYaw), 0, Math.sin(baseYaw));
    const F = _v[2].set(Math.sin(baseYaw), 0, Math.cos(baseYaw));
    const U = _v[3].set(0, 1, 0);
    const O = this.group.position;
    const shoulder = this.bone('upperarm_r').getWorldPosition(_v[4]).y;
    const chest = this.bone('spine_03').getWorldPosition(new THREE.Vector3());

    const toWorld = (v: V, base: THREE.Vector3 | null, out: THREE.Vector3) => {
      if (base) return out.copy(base).addScaledVector(R, v[0]).addScaledVector(U, v[1]).addScaledVector(F, v[2]);
      return out.set(O.x, shoulder + v[1], O.z).addScaledVector(R, v[0]).addScaledVector(F, v[2]);
    };
    const dir = (v: V, out: THREE.Vector3) => out.set(0, 0, 0).addScaledVector(R, v[0]).addScaledVector(U, v[1]).addScaledVector(F, v[2]).normalize();
    const paddleQ = (tip: V, palm: V, out: THREE.Quaternion) => {
      const y = dir(tip, new THREE.Vector3());
      const p = dir(palm, new THREE.Vector3());
      p.addScaledVector(y, -p.dot(y));
      if (p.lengthSq() < 1e-6) p.set(0, 1, 0).cross(y);
      p.normalize();
      // 拍面法線（paddle +Z）就是掌心方向
      const z = p;
      const x = new THREE.Vector3().crossVectors(y, z);
      return out.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    };
    const pose = (p: Pose, c: THREE.Vector3 | null, rel: boolean): Target => ({
      sweet: toWorld(p.pos, rel ? c : null, new THREE.Vector3()),
      paddle: paddleQ(p.tip, p.palm, new THREE.Quaternion()),
      pole: dir(p.pole, new THREE.Vector3()),
      off: toWorld(p.off, null, new THREE.Vector3()),
      yaw: p.yaw,
      lean: p.lean,
      faceK: 0.45,
    });

    // 準備姿勢：跑動時拍子放低一點
    const ready = pose(run > 0.3 ? { ...READY, pos: lerpV(READY.pos, [0.05, -0.45, 0.35], run) } : READY, null, false);
    if (!st) return ready;
    const S = STROKES[st.kind];
    const back = pose(S.back, st.c, S.rel);
    const contact: Target = {
      ...pose({ ...S.contact, pos: [0, 0, 0] }, st.c, true),
      sweet: st.c.clone(),
      faceK: 0.9,
    };
    // 擊球點太低：上半身多彎一點
    contact.lean += clamp((shoulder - 0.5 - st.c.y) * 0.25, 0, 0.15);
    const follow = pose(S.follow, st.c, S.rel);
    // 握拍決定抽球的拍面：半西方式拍面關很多（刷上旋）、東方式稍關、大陸式略開（平擊、切削）
    if (st.kind === 'fh' || st.kind === 'bh') {
      const close = this.grip === 'semiwestern' ? 0.32 : this.grip === 'eastern' ? 0.16 : this.grip === 'continental' ? -0.08 : 0;
      if (close !== 0) {
        const tilt = _q[6].setFromAxisAngle(R, close * (st.kind === 'fh' ? 1 : 0.6));
        back.paddle.premultiply(tilt);
        contact.paddle.premultiply(tilt);
      }
    }

    const t = engine.time;
    if (tau < 0 && (t < st.fwdStart || !st.swung)) return this.blend(ready, back, prep, chest, R, F);
    if (tau < 0) {
      const u = clamp01((t - st.fwdStart) / Math.max(0.04, st.tC - st.fwdStart));
      // 前揮加速：越接近擊球越快
      return this.blend(back, contact, u * u * (2 - u) * 0.35 + u * u * 0.65, chest, R, F);
    }
    if (!st.swung) return ready;
    if (tau < FOL) {
      const v = tau / FOL;
      return this.blend(contact, follow, 1 - (1 - v) * (1 - v), chest, R, F);
    }
    return this.blend(follow, ready, smoothstep(0, 1, (tau - FOL) / REC), chest, R, F);
  }

  /** 兩個姿勢之間內插：甜區沿著胸口為圓心的弧線走（揮拍是繞身體轉的） */
  private blend(A: Target, Bt: Target, k: number, center: THREE.Vector3, R: THREE.Vector3, F: THREE.Vector3): Target {
    const arc = (pa: THREE.Vector3, pb: THREE.Vector3) => {
      const ax = pa.x - center.x;
      const az = pa.z - center.z;
      const bx = pb.x - center.x;
      const bz = pb.z - center.z;
      const aA = Math.atan2(ax * R.x + az * R.z, ax * F.x + az * F.z);
      const aB = Math.atan2(bx * R.x + bz * R.z, bx * F.x + bz * F.z);
      const rA = Math.hypot(ax, az);
      const rB = Math.hypot(bx, bz);
      const d = Math.atan2(Math.sin(aB - aA), Math.cos(aB - aA));
      const ang = aA + d * k;
      const r = rA + (rB - rA) * k;
      return new THREE.Vector3(center.x, pa.y + (pb.y - pa.y) * k, center.z)
        .addScaledVector(R, Math.sin(ang) * r)
        .addScaledVector(F, Math.cos(ang) * r);
    };
    return {
      sweet: arc(A.sweet, Bt.sweet),
      paddle: A.paddle.clone().slerp(Bt.paddle, k),
      pole: A.pole.clone().lerp(Bt.pole, k).normalize(),
      off: A.off.clone().lerp(Bt.off, k),
      yaw: A.yaw + (Bt.yaw - A.yaw) * k,
      lean: A.lean + (Bt.lean - A.lean) * k,
      faceK: A.faceK + (Bt.faceK - A.faceK) * k,
    };
  }

  private smooth(tgt: Target, dt: number, rate: number) {
    if (!this.sm) {
      this.sm = tgt;
      return;
    }
    const k = 1 - Math.exp(-rate * dt);
    const m = this.sm;
    m.sweet.lerp(tgt.sweet, k);
    m.paddle.slerp(tgt.paddle, k);
    m.pole.lerp(tgt.pole, k).normalize();
    m.off.lerp(tgt.off, 1 - Math.exp(-14 * dt));
    m.yaw += (tgt.yaw - m.yaw) * k;
    m.lean += (tgt.lean - m.lean) * k;
    m.faceK += (tgt.faceK - m.faceK) * k;
  }

  // ───────────────────────────── 關節 ─────────────────────────────

  /** 腰轉＋前傾：分三節脊椎，總轉角有上限；下半身往哪跑，上半身都轉回來面向球網 */
  private applyTorso(m: Target, baseYaw: number, w: number) {
    const twist = clamp(m.yaw - this.yaw, -MAX_TWIST, MAX_TWIST) * w;
    const R = _v[1].set(-Math.cos(baseYaw), 0, Math.sin(baseYaw));
    // 平常三節脊椎平均分；前揮時下背先轉（髖部帶動肩膀），收拍時再平均回來
    const k = this.chainLead;
    const share = [0.3 + 0.25 * k, 0.35 - 0.05 * k, 0.35 - 0.2 * k];
    ['spine_01', 'spine_02', 'spine_03'].forEach((n, i) => {
      _q[0].setFromAxisAngle(_v[3].set(0, 1, 0), twist * share[i]);
      _q[1].setFromAxisAngle(R, -(m.lean + this.extraLean) * w * share[i]);
      rotateWorld(this.bone(n), _q[0].multiply(_q[1]));
    });
    this.stats.maxTwist = Math.max(this.stats.maxTwist, Math.abs(twist));
  }

  /** 兩節手臂 IK（手肘只往 pole 那側突出），回傳是否構得到 */
  private solveArm(arm: ArmBones, wrist: THREE.Vector3, pole: THREE.Vector3) {
    const sceneQ = this.scene.getWorldQuaternion(_q[0]);
    const S = arm.upper.getWorldPosition(_v[4]);
    const d = _v[5].subVectors(wrist, S);
    const max = (arm.l1 + arm.l2) * 0.995;
    // 最短距離限制手肘最多彎約 130°
    const dist = clamp(d.length(), 0.2, max);
    d.normalize();
    const pp = _v[6].copy(pole).addScaledVector(d, -pole.dot(d));
    if (pp.lengthSq() < 1e-6) pp.set(0, -1, 0).addScaledVector(d, d.y);
    pp.normalize();
    const cosA = clamp((arm.l1 * arm.l1 + dist * dist - arm.l2 * arm.l2) / (2 * arm.l1 * dist), -1, 1);
    const sinA = Math.sqrt(1 - cosA * cosA);
    const E = _v[7].copy(S).addScaledVector(d, arm.l1 * cosA).addScaledVector(pp, arm.l1 * sinA);
    const W = new THREE.Vector3().copy(S).addScaledVector(d, dist);
    const hinge = new THREE.Vector3().crossVectors(pp, d).normalize();

    // 綁定姿勢的軸轉到世界
    const aU = new THREE.Vector3().copy(arm.axisU).applyQuaternion(sceneQ);
    const aF = new THREE.Vector3().copy(arm.axisF).applyQuaternion(sceneQ);
    const h0 = new THREE.Vector3().copy(arm.hinge).applyQuaternion(sceneQ);
    const upperDir = new THREE.Vector3().subVectors(E, S).normalize();
    const foreDir = new THREE.Vector3().subVectors(W, E).normalize();
    const bindUW = _q[1].copy(sceneQ).multiply(arm.bindU);
    alignQ(aU, h0, upperDir, hinge, _q[2]);
    setWorldQ(arm.upper, _q[2].multiply(bindUW));
    const bindFW = _q[3].copy(sceneQ).multiply(arm.bindF);
    alignQ(aF, h0, foreDir, hinge, _q[4]);
    setWorldQ(arm.fore, _q[4].multiply(bindFW));
    const bend = Math.acos(clamp(upperDir.dot(foreDir), -1, 1));
    this.stats.maxElbow = Math.max(this.stats.maxElbow, bend);
    return foreDir;
  }

  /** 持拍手：手臂 IK＋前臂旋轉＋手腕（都有上限），算兩輪讓甜區對準目標 */
  private solveRight(m: Target, w: number) {
    const arm = this.arms.r;
    const saved = [arm.upper.quaternion.clone(), arm.fore.quaternion.clone(), arm.hand.quaternion.clone()];
    // 拍面朝向（= 掌心）優先；拍頭方向只是偏好
    const palmD = new THREE.Vector3(0, 0, 1).applyQuaternion(m.paddle);
    const tipD = new THREE.Vector3(0, 1, 0).applyQuaternion(m.paddle);
    const tipLocal = new THREE.Vector3(0, 1, 0).applyQuaternion(this.mount.q);
    let hq = new THREE.Quaternion().copy(m.paddle).multiply(_q[5].copy(this.mount.q).invert());
    for (let pass = 0; pass < 3; pass++) {
      const wrist = new THREE.Vector3().copy(this.offset).applyQuaternion(hq).negate().add(m.sweet);
      const foreDir = this.solveArm(arm, wrist, m.pole);
      // 從「手腕不彎、前臂不轉」的自然手勢出發，只轉最少的角度讓掌心對準
      const F = arm.fore.getWorldQuaternion(new THREE.Quaternion());
      const axisL = foreDir.clone().applyQuaternion(F.clone().invert()).normalize();
      // 自然手勢：T-pose 的掌心朝下其實是前臂旋前 90°，放鬆時是拇指朝上，所以先旋後 90°
      const natural = F.clone().multiply(new THREE.Quaternion().setFromAxisAngle(axisL, Math.PI / 2)).multiply(arm.rel0);
      const palmN = this.mount.palm.clone().applyQuaternion(natural);
      // 拍面（＝掌心）往指定方向轉；手臂姿勢擺不出來的部分保留自然角度，不硬扭手腕
      const want = natural.clone().slerp(new THREE.Quaternion().setFromUnitVectors(palmN, palmD).multiply(natural), m.faceK);
      // 拍頭方向：繞掌心軸最多再轉 50°
      const tipN = tipLocal.clone().applyQuaternion(want);
      const tp = tipD.clone().addScaledVector(palmD, -tipD.dot(palmD));
      if (tp.lengthSq() > 1e-6) {
        const ang = Math.atan2(new THREE.Vector3().crossVectors(tipN, tp).dot(palmD), tipN.dot(tp));
        want.premultiply(_q[5].setFromAxisAngle(palmD, clamp(ang, -0.9, 0.9)));
      }
      // 前臂旋轉（旋前／旋後）分擔大部分
      const delta = F.clone().invert().multiply(want).multiply(arm.rel0.clone().invert());
      const beta = clamp(twistAngle(delta, axisL) * 0.8, -MAX_PRONATION, MAX_PRONATION);
      arm.fore.quaternion.multiply(_q[5].setFromAxisAngle(axisL, beta));
      arm.fore.updateMatrixWorld(true);
      // 剩下的交給手腕，超過上限就停在上限
      const F2 = arm.fore.getWorldQuaternion(new THREE.Quaternion());
      const d2 = F2.clone().invert().multiply(want).multiply(arm.rel0.clone().invert());
      if (d2.w < 0) d2.set(-d2.x, -d2.y, -d2.z, -d2.w);
      const ang = 2 * Math.acos(clamp(d2.w, -1, 1));
      this.stats.maxWrist = Math.max(this.stats.maxWrist, Math.min(ang, MAX_WRIST));
      if (ang > MAX_WRIST) d2.copy(_q[5].identity().slerp(d2, MAX_WRIST / ang));
      arm.hand.quaternion.copy(d2.multiply(arm.rel0));
      arm.hand.updateMatrixWorld(true);
      hq = arm.hand.getWorldQuaternion(new THREE.Quaternion());
    }
    if (w < 0.999) {
      arm.upper.quaternion.copy(saved[0].slerp(arm.upper.quaternion, w));
      arm.fore.quaternion.copy(saved[1].slerp(arm.fore.quaternion, w));
      arm.hand.quaternion.copy(saved[2].slerp(arm.hand.quaternion, w));
      arm.upper.updateMatrixWorld(true);
    }
  }

  private solveLeft(m: Target, w: number) {
    const arm = this.arms.l;
    const saved = [arm.upper.quaternion.clone(), arm.fore.quaternion.clone()];
    // 左手肘往左下後方
    const R = new THREE.Vector3(1, 0, 0).applyQuaternion(this.group.quaternion);
    const pole = new THREE.Vector3(0, -1, 0).addScaledVector(R, 0.5).add(new THREE.Vector3(0, 0, -0.2).applyQuaternion(this.group.quaternion)).normalize();
    this.solveArm(arm, m.off, pole);
    if (w < 0.999) {
      arm.upper.quaternion.copy(saved[0].slerp(arm.upper.quaternion, w));
      arm.fore.quaternion.copy(saved[1].slerp(arm.fore.quaternion, w));
      arm.upper.updateMatrixWorld(true);
    }
  }

  /** 頭看球：相對胸口最多左右轉 65°、上下 40° */
  private lookAt(ball: { x: number; y: number; z: number }, w: number) {
    const head = this.bone('Head');
    const chest = this.bone('spine_03');
    const sceneQ = this.scene.getWorldQuaternion(new THREE.Quaternion());
    const fwdOf = (b: THREE.Object3D) => {
      const q = b.getWorldQuaternion(new THREE.Quaternion()).multiply(sceneQ.clone().multiply(this.bindQ.get(b)!).invert());
      return new THREE.Vector3(0, 0, 1).applyQuaternion(sceneQ).applyQuaternion(q);
    };
    const hp = head.getWorldPosition(new THREE.Vector3());
    const to = new THREE.Vector3(ball.x, ball.y, ball.z).sub(hp).normalize();
    const cf = fwdOf(chest);
    const yawOf = (v: THREE.Vector3) => Math.atan2(v.x, v.z);
    const dyaw = clamp(Math.atan2(Math.sin(yawOf(to) - yawOf(cf)), Math.cos(yawOf(to) - yawOf(cf))), -1.15, 1.15);
    const pitch = clamp(Math.asin(clamp(to.y, -1, 1)), -0.7, 0.45);
    const want = new THREE.Vector3(Math.sin(yawOf(cf) + dyaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yawOf(cf) + dyaw) * Math.cos(pitch));
    const hf = fwdOf(head);
    const rot = new THREE.Quaternion().setFromUnitVectors(hf, want);
    rotateWorld(head, new THREE.Quaternion().slerp(rot, w));
  }

  // ───────────────────────────── 全身覆蓋 ─────────────────────────────

  private overlays(engine: GameEngine, a: Athlete, t: number, rdt: number, st: AthletePoser['cur']) {
    if (a.knockedUntil !== this.knockUntil) {
      this.knockUntil = a.knockedUntil;
      if (a.knockedUntil > t) this.knockAt = t;
    }
    const oT = Object.fromEntries(OVERLAYS.map((k) => [k, 0])) as Record<Overlay, number>;
    if (t < a.knockedUntil) {
      oT.Hit_Knockback = 0.95;
      this.overlay.Hit_Knockback.time = Math.min(0.42, t - this.knockAt);
    }
    if (this.jumpH > 0 && st && Math.abs(t - this.jumpAt) < 0.3) {
      const u = (t - this.jumpAt) / 0.3;
      oT.Jump_Loop = 0.35 * (1 - u * u);
      this.overlay.Jump_Loop.time = 0.6;
    }
    if (t < a.jumpUntil) {
      oT.Jump_Loop = 0.5;
      this.overlay.Jump_Loop.time = 0.6;
    }
    if (engine.phase === 'dead' && a.mood && !a.dive && t - a.mood.at < 1.9) {
      const since = t - a.mood.at;
      if (this.celebrateAt !== a.mood.at) {
        this.celebrateAt = a.mood.at;
        // 每一分隨機挑一種：漂亮得分跳舞，撿到失誤就挑釁；被打穿的一方偶爾誇張地踉蹌
        this.celebration = pick(a.mood.big ? CELEBRATIONS : TAUNTS);
        this.stagger = !a.mood.error && Math.random() < 0.55;
      }
      if (a.mood.won) {
        const [clip, start] = this.celebration;
        oT[clip] = 0.92;
        this.overlay[clip].time = Math.min(this.overlay[clip].getClip().duration, start + since);
      } else if (this.stagger && since < 0.75) {
        // 被打穿：往後踉蹌（慢放擊退動作），再接搖頭
        oT.Hit_Knockback = 0.9;
        this.overlay.Hit_Knockback.time = Math.min(0.6, since * 0.8);
      } else {
        // 自己失誤：懊惱搖頭
        oT.Idle_No_Loop = 0.88;
        this.overlay.Idle_No_Loop.time = Math.min(this.overlay.Idle_No_Loop.getClip().duration, since + (this.stagger ? -0.35 : 0.4));
      }
    }
    // 必殺技出手後：誇張的身段（用真實時間，頓幀慢動作時照樣播）
    const cine = engine.cinematic;
    if (cine && cine.team === a.team && SPECIAL_MOVES[cine.id]) {
      const [clip, peak] = SPECIAL_MOVES[cine.id];
      const s = engine.real - cine.start;
      oT[clip] = 0.9 * (1 - smoothstep(1.1, 1.45, s));
      this.overlay[clip].time = clamp(peak - 0.3 + s * 0.8, 0, this.overlay[clip].getClip().duration);
    }
    // 覺醒發動：雙手持拍的架勢，氣場爆開（真實時間）
    const awk = engine.awakening;
    if (awk && awk.team === a.team && engine.real - awk.start < 1.8) {
      oT.Mx_PowerIdle = 0.95;
      this.overlay.Mx_PowerIdle.time = Math.min(this.overlay.Mx_PowerIdle.getClip().duration, (engine.real - awk.start) * 0.9);
    }
    // 蓄勢（下一拍放必殺）：雙手持拍的架勢
    if (a.armed && !a.dive && engine.phase !== 'dead' && !st && Math.hypot(a.vel.x, a.vel.z) < 0.6) {
      oT.Mx_PowerIdle = 0.85;
      this.overlay.Mx_PowerIdle.time = this.idleT % this.overlay.Mx_PowerIdle.getClip().duration;
    }
    let ov = 0;
    for (const k of OVERLAYS) {
      this.over[k] = approach(this.over[k], oT[k], 12, rdt);
      // 騰空只影響腳，上半身照樣揮拍
      if (k !== 'Jump_Loop') ov = Math.max(ov, this.over[k]);
    }
    return ov;
  }

  private checkStats(m: Target) {
    const bad = (v: THREE.Vector3) => !Number.isFinite(v.x + v.y + v.z);
    if (bad(m.sweet) || bad(m.off) || !Number.isFinite(m.paddle.w)) this.stats.nan++;
    for (const n of ['upperarm_r', 'lowerarm_r', 'hand_r', 'spine_03', 'Head']) {
      const q = this.bone(n).quaternion;
      if (!Number.isFinite(q.x + q.y + q.z + q.w)) this.stats.nan++;
    }
  }
}
