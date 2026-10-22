import { BALL, COURT, PADDLE, PHYSICS_DT, netHeightAt } from './constants';
import { type BallState, createBall, stepBall } from './ball';
import { type V3, v3, clamp, gauss, lerp } from './vec';
import type { SpecialId } from './paddles';
import type { SkillId } from './skills';

export type ShotKind = 'serve' | 'dink' | 'drop' | 'drive' | 'smash' | 'lob' | 'punch' | 'block' | 'speedup';
/** 玩家的三顆擊球鍵：軟（dink/放小球）、抽（抽球/殺球）、挑（高吊） */
export type ShotButton = 'soft' | 'drive' | 'lob';

/** 發球力道 0..1 對應的落點深度（距網）：太輕會短進廚房、太重會出底線 */
export const SERVE_DEPTH = { min: 1.6, max: 7.4 } as const;

export const SHOT_LABEL: Record<ShotKind, string> = {
  serve: '發球',
  dink: 'Dink',
  drop: '放小球',
  drive: '抽球',
  smash: '殺球',
  lob: '高吊',
  punch: '推擋截擊',
  block: '卸力擋',
  speedup: '突擊',
};

/** 擊球點高過這個高度、又不在底線深處，按抽球就是殺球 */
export const SMASH_HEIGHT = 1.45;
/** 網前區：廚房線外 1.5 m 內，截擊與突擊在這裡發生 */
export const NET_ZONE = COURT.kitchen + 1.5;
/** 來球快過這個速度時按軟球鍵，就是卸力擋（把重球擋回廚房） */
export const BLOCK_SPEED = 12;

interface FlightResult {
  /** 落地點（找不到則 null） */
  land: V3 | null;
  apex: number;
  /** 穿越網線時的高度減網高（未穿越 = -Infinity） */
  netMargin: number;
  /** 飛到落地的時間 */
  time: number;
}

/** 不考慮撞網的純飛行模擬，求落點與過網高度 */
const simulateFlight = (pos: V3, vel: V3, spin: V3): FlightResult => {
  const b: BallState = createBall();
  b.pos = { ...pos };
  b.vel = { ...vel };
  b.spin = { ...spin };
  let apex = pos.y;
  let netMargin = -Infinity;
  const dt = PHYSICS_DT * 2;
  for (let i = 0; i < 2000; i++) {
    const prevZ = b.pos.z;
    const prevY = b.pos.y;
    const ev = stepBall(b, dt, true);
    if (b.pos.y > apex) apex = b.pos.y;
    if ((prevZ > 0) !== (b.pos.z > 0)) {
      const t = prevZ / (prevZ - b.pos.z);
      const y = prevY + (b.pos.y - prevY) * t;
      netMargin = y - BALL.radius - netHeightAt(b.pos.x);
    }
    if (ev?.type === 'bounce') return { land: ev.pos, apex, netMargin, time: (i + 1) * dt };
  }
  return { land: null, apex, netMargin, time: 2000 * dt };
};

/** 上旋向量：軸 = 上方向 × 水平飛行方向，正值為上旋、負值為下旋（切球） */
const spinVector = (dirX: number, dirZ: number, topspin: number): V3 => v3(dirZ * topspin, 0, -dirX * topspin);

/**
 * 依「最高點高度」求初速：用來打 dink、放小球、高吊、發球。
 * 先用真空公式起步，再以完整物理（阻力＋馬格努斯）反覆修正。
 */
export const solveByApex = (from: V3, target: V3, apex: number, topspin: number) => {
  const dx = target.x - from.x;
  const dz = target.z - from.z;
  const dist = Math.hypot(dx, dz);
  const ux = dx / dist;
  const uz = dz / dist;
  const spin = spinVector(ux, uz, topspin);
  const g = 9.81;
  const top = Math.max(apex, from.y + 0.03);
  let vy = Math.sqrt(2 * g * (top - from.y));
  let h = dist / (vy / g + Math.sqrt((2 * Math.max(0.05, top - BALL.radius)) / g));
  let result: FlightResult = { land: null, apex: top, netMargin: 0, time: 1 };
  for (let i = 0; i < 14; i++) {
    result = simulateFlight(from, v3(ux * h, vy, uz * h), spin);
    if (!result.land) break;
    const landed = (result.land.x - from.x) * ux + (result.land.z - from.z) * uz;
    h *= clamp(dist / Math.max(0.1, landed), 0.6, 1.6);
    const vy2 = vy * vy + 2 * g * (top - result.apex);
    vy = Math.sqrt(Math.max(0.04, vy2));
  }
  return { vel: v3(ux * h, vy, uz * h), spin, netMargin: result.netMargin, time: result.time };
};

/**
 * 依「球速」求仰角：用來打抽球、殺球。取低彈道解（二分法）。
 * 從網子以下的高度硬抽，仰角被迫拉高、過網餘裕變小 —— 這就是為什麼低球不該硬打。
 */
export const solveBySpeed = (from: V3, target: V3, speed: number, topspin: number) => {
  const dx = target.x - from.x;
  const dz = target.z - from.z;
  const dist = Math.hypot(dx, dz);
  const ux = dx / dist;
  const uz = dz / dist;
  const spin = spinVector(ux, uz, topspin);
  const velAt = (a: number) => v3(ux * speed * Math.cos(a), speed * Math.sin(a), uz * speed * Math.cos(a));
  const distAt = (a: number) => {
    const r = simulateFlight(from, velAt(a), spin);
    if (!r.land) return { d: 99, r };
    return { d: (r.land.x - from.x) * ux + (r.land.z - from.z) * uz, r };
  };
  let lo = -0.7;
  let hi = 0.6;
  let best = distAt(hi);
  if (best.d < dist) return { vel: velAt(hi), spin, netMargin: best.r.netMargin, time: best.r.time };
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    const m = distAt(mid);
    if (m.d < dist) lo = mid;
    else {
      hi = mid;
      best = m;
    }
  }
  return { vel: velAt(hi), spin, netMargin: best.r.netMargin, time: best.r.time };
};

/**
 * 依球速求解，但保證過得了網：低點出手的快球若會撞網，就逐步降速、拉高弧線。
 * 沒有這一步，從網下硬抽就算時機完美也會「自動」掛網，玩家只會覺得遊戲壞了。
 */
export const solveClearing = (from: V3, target: V3, speed: number, topspin: number, minMargin: number) => {
  let v = speed;
  let sol = solveBySpeed(from, target, v, topspin);
  for (let i = 0; i < 10 && sol.netMargin < minMargin && v > 6; i++) {
    v *= 0.88;
    sol = solveBySpeed(from, target, v, topspin);
  }
  return sol;
};

/**
 * 球拍能打出的最大球速：v_out ≈ e·v_in + (1+e)·v_拍頭，e 取 PBCoR 上限 0.43。
 * 換算下來業餘選手抽球約 20 m/s（45 mph），接快球回擊可再快一點。
 */
export const maxPace = (incomingSpeed: number, swingFactor = 1) =>
  PADDLE.pbcor * incomingSpeed * 0.6 + (1 + PADDLE.pbcor) * PADDLE.maxSwingSpeed * 0.95 * swingFactor;

export interface ShotRequest {
  button: ShotButton | 'serve';
  /** 0..1：蓄力程度（發球時為力道條位置） */
  charge: number;
  /** 以擊球者自己為準：aimX 右正左負、aimDepth 深正淺負，範圍 -1..1 */
  aimX: number;
  aimDepth: number;
  contact: V3;
  incomingSpeed: number;
  /** 對手位置，用來決定「打腳下」的深度 */
  opponent: V3;
  /** 發球時的目標半場 x 正負號 */
  serveSide?: number;
  /** 球拍特性：球速與旋轉倍率 */
  paddle?: { pace: number; spin: number };
  /** 球還沒落地就打（截擊） */
  volley?: boolean;
}

/**
 * 擊球誤差：加在「結果」上（公尺），再用物理反解初速。
 * 這樣掛網、出界仍是物理算出來的，但失誤率可以對照真實程度來調。
 */
export interface Perturb {
  /** 落點深度偏差（+ 更深） */
  depth: number;
  /** 落點左右偏差（擊球者右手邊為 +） */
  lateral: number;
  /** 過網高度 / 最高點偏差 */
  arc: number;
  /** 球速比例偏差 */
  speed: number;
}

export interface ShotPlan {
  kind: ShotKind;
  target: V3;
  vel: V3;
  spin: V3;
  speed: number;
  /** 預估飛行時間（到第一次落地） */
  flightTime: number;
}

/**
 * 依按鍵與情境判斷球路（同一顆鍵，看球的高度、位置、快慢自動變化）：
 * - 軟球鍵：一般是 dink／放小球；來球很重時變成卸力擋
 * - 抽球鍵：高球是殺球；網前沒落地的球是推擋截擊；網前彈起高過網的球是突擊；其餘是抽球
 */
export const classifyShot = (req: ShotRequest): ShotKind => {
  if (req.button === 'serve') return 'serve';
  if (req.button === 'lob') return 'lob';
  const depthFromNet = Math.abs(req.contact.z);
  if (req.button === 'soft') {
    if (req.incomingSpeed > BLOCK_SPEED) return 'block';
    return depthFromNet > COURT.kitchen + 1.7 ? 'drop' : 'dink';
  }
  if (req.contact.y > SMASH_HEIGHT && depthFromNet < 6) return 'smash';
  if (depthFromNet < NET_ZONE) {
    const netTop = netHeightAt(req.contact.x);
    if (req.volley && req.contact.y > netTop - 0.05) return 'punch';
    if (!req.volley && req.contact.y > netTop + 0.05) return 'speedup';
  }
  return 'drive';
};

const NO_ERROR: Perturb = { depth: 0, lateral: 0, arc: 0, speed: 0 };

interface ShotDesign {
  kind: ShotKind;
  /** 落點：離網深度與世界座標 x */
  d: number;
  tx: number;
  apex: number;
  speed: number;
  topspin: number;
  /** 想要的過網餘裕（只有軟球用） */
  margin: number | null;
}

/** 依按鍵、擊球點與場上情況，決定這一拍的球路與目標（還沒算初速） */
const designShot = (req: ShotRequest): ShotDesign => {
  const kind = classifyShot(req);
  const s = Math.sign(req.contact.z) || 1; // 擊球者所在半場
  const depthFromNet = Math.abs(req.contact.z);
  const netTop = netHeightAt(req.contact.x);
  const xMax = COURT.halfWidth - 0.4;
  // 擊球者的右手邊在世界座標的 x 正負號就是 s
  const aimWorldX = (k: number) => clamp(req.aimX * s * k, -xMax, xMax);
  const oppDepth = Math.abs(req.opponent.z);

  let tx: number;
  let d: number;
  let apex = 0;
  let speed = 0;
  let topspin: number;
  let margin: number | null = null;

  switch (kind) {
    case 'serve': {
      d = lerp(SERVE_DEPTH.min, SERVE_DEPTH.max, req.charge);
      const sideX = (req.serveSide ?? 1) * (COURT.halfWidth / 2);
      tx = clamp(sideX + req.aimX * s * 0.9, -xMax, xMax);
      apex = 1.55 + 0.25 * req.charge;
      topspin = 40;
      break;
    }
    case 'lob':
      d = clamp(COURT.halfLength - 0.9 + req.aimDepth * 0.5, 4.5, COURT.halfLength - 0.25);
      tx = aimWorldX(2.3);
      apex = lerp(3.7, 5.3, req.charge);
      topspin = 70;
      break;
    case 'drop':
      d = lerp(1.1, 1.9, req.charge) + req.aimDepth * 0.4;
      tx = aimWorldX(2.3);
      apex = netTop + 0.5 + 0.25 * clamp((depthFromNet - 4) / 2.7, 0, 1);
      margin = 0.2;
      topspin = 25;
      break;
    case 'dink':
      // 蓄力只微調深度（落在廚房中段）；要打深打淺用方向鍵前後控制
      d = lerp(1.0, 1.55, req.charge) + req.aimDepth * 0.4;
      tx = aimWorldX(2.3);
      apex = netTop + 0.16 + 0.08 * req.charge;
      margin = 0.14;
      topspin = -20;
      break;
    case 'smash':
      // 由上往下重扣：落點偏短、球速最快
      d = clamp(lerp(2.8, 5.2, 0.5 + req.aimDepth * 0.5), 2.4, COURT.halfLength - 0.4);
      tx = aimWorldX(2.6);
      speed = lerp(19, maxPace(req.incomingSpeed, 1.25), req.charge);
      topspin = 60;
      break;
    case 'punch':
      // 推擋截擊：短揮、又快又平，打對手腳下
      d = clamp(oppDepth + 0.1 + req.aimDepth * 0.8, 1.6, COURT.halfLength - 0.5);
      tx = aimWorldX(2.5);
      speed = lerp(11, 15.5, req.charge);
      topspin = 40;
      break;
    case 'speedup':
      // 突擊：沒有方向就直接打對手身上（最難回）
      d = clamp(oppDepth - 0.2 + req.aimDepth * 0.6, 1.4, COURT.halfLength - 0.8);
      tx = Math.abs(req.aimX) < 0.2 ? clamp(req.opponent.x, -xMax, xMax) : aimWorldX(2.5);
      speed = lerp(14, 18.5, req.charge);
      topspin = 90;
      break;
    case 'block':
      // 卸力擋：吃掉來球的速度，輕輕擋回廚房；離網越遠弧線要越高
      d = lerp(1.2, 2.0, req.charge) + req.aimDepth * 0.4;
      tx = aimWorldX(2.0);
      apex = netTop + 0.22 + 0.35 * clamp((depthFromNet - 2) / 4.7, 0, 1);
      margin = 0.16;
      topspin = -30;
      break;
    default: {
      // 抽球：對手在網前就打他腳下，在底線就打深
      const base = oppDepth < COURT.kitchen + 1.2 ? oppDepth + 0.3 : COURT.halfLength - 1.1;
      d = clamp(base + req.aimDepth * 0.8, 2.5, COURT.halfLength - 0.3);
      tx = aimWorldX(2.5);
      speed = lerp(11, maxPace(req.incomingSpeed), req.charge);
      topspin = 110;
    }
  }

  const pm = req.paddle ?? { pace: 1, spin: 1 };
  return { kind, d, tx, apex, speed: speed * pm.pace, topspin: topspin * pm.spin, margin };
};

/** 蓄力時給畫面預覽的瞄準落點（不含誤差） */
export const previewTarget = (req: ShotRequest) => {
  const ds = designShot(req);
  return { kind: ds.kind, target: v3(ds.tx, 0, -(Math.sign(req.contact.z) || 1) * ds.d) };
};

/** 依按鍵、擊球點與場上情況，決定這一拍的球路並求出初速 */
export const planShot = (req: ShotRequest, err: Perturb = NO_ERROR): ShotPlan => {
  const ds = designShot(req);
  const { kind, topspin, margin, speed } = ds;
  let { apex } = ds;
  const s = Math.sign(req.contact.z) || 1;
  const toward = -s;
  // 加上誤差（誤差可以把球打出界，但落點至少要在網的另一側，掛網交給過網高度決定）
  const d = Math.max(0.15, ds.d + err.depth);
  const tx = ds.tx + err.lateral * s;
  const target = v3(tx, 0, toward * d);

  let sol;
  if (speed > 0) {
    sol = solveClearing(req.contact, target, speed * (1 + err.speed), topspin, 0.06);
  } else if (margin !== null) {
    // 軟球的關鍵是過網高度：反覆調整最高點，讓過網餘裕 = 目標 + 誤差
    const want = margin + err.arc;
    apex = Math.max(apex, req.contact.y + 0.04);
    sol = solveByApex(req.contact, target, apex, topspin);
    for (let i = 0; i < 6 && Math.abs(sol.netMargin - want) > 0.015; i++) {
      apex = Math.max(req.contact.y + 0.02, apex + (want - sol.netMargin) * 1.3);
      sol = solveByApex(req.contact, target, apex, topspin);
    }
  } else {
    sol = solveByApex(req.contact, target, Math.max(apex + err.arc, req.contact.y + 0.1), topspin);
  }
  return {
    kind,
    target,
    vel: sol.vel,
    spin: sol.spin,
    speed: Math.hypot(sol.vel.x, sol.vel.y, sol.vel.z),
    flightTime: sol.time,
  };
};

/** 各球路在「標準狀態」下的誤差標準差（公尺 / 比例） */
const BASE_ERROR: Record<ShotKind, Perturb> = {
  serve: { depth: 0.32, lateral: 0.3, arc: 0.1, speed: 0 },
  // 技術倍率 1（約 DUPR 3.5）時：dink 掛網約 5%、放小球約 8%、抽球出界約 5%
  dink: { depth: 0.3, lateral: 0.3, arc: 0.11, speed: 0 },
  drop: { depth: 0.5, lateral: 0.4, arc: 0.16, speed: 0 },
  drive: { depth: 0.45, lateral: 0.38, arc: 0, speed: 0.02 },
  smash: { depth: 0.5, lateral: 0.45, arc: 0, speed: 0.02 },
  lob: { depth: 0.6, lateral: 0.5, arc: 0.3, speed: 0 },
  punch: { depth: 0.35, lateral: 0.33, arc: 0, speed: 0.02 },
  block: { depth: 0.4, lateral: 0.35, arc: 0.13, speed: 0 },
  speedup: { depth: 0.4, lateral: 0.35, arc: 0, speed: 0.02 },
};

export interface ErrorContext {
  /** 擊球時機品質 0..1 */
  quality: number;
  /** 早打為負、晚打為正（秒） */
  timingOffset: number;
  incomingSpeed: number;
  contactHeight: number;
  /** 0..1：球離身體多遠（1 = 剛好碰得到） */
  stretch: number;
  /** 擊球當下的移動速度 m/s */
  moveSpeed: number;
  /** 技術倍率：玩家 1，AI 依難度調整 */
  skill: number;
  /** 進入「手感火燙」狀態 */
  zone: boolean;
  /** 正手 +1、反手 -1：早打/晚打的拉偏方向相反 */
  forehand: number;
}

/**
 * 依真實因素產生這一拍的誤差：
 * 時機差、接快球要卸力、從網下硬抽、跑不到位勉強伸手、邊跑邊打。
 */
export const sampleShotError = (kind: ShotKind, ctx: ErrorContext, rand: () => number = Math.random): Perturb => {
  const base = BASE_ERROR[kind];
  let m = ctx.skill;
  m *= 1 + 2.2 * (1 - ctx.quality) ** 2;
  const soft = kind === 'dink' || kind === 'drop';
  // 接快球打軟球（reset）最難：來球越快越難卸力
  if (soft) m *= 1 + Math.max(0, ctx.incomingSpeed - 8) * 0.09;
  // 卸力擋就是用來接重球的：比硬打 dink 好控制得多
  else if (kind === 'block') m *= 1 + Math.max(0, ctx.incomingSpeed - BLOCK_SPEED) * 0.04;
  else m *= 1 + Math.max(0, ctx.incomingSpeed - 14) * 0.035;
  if (ctx.stretch > 0.75) m *= 1 + (ctx.stretch - 0.75) * 2.4;
  m *= 1 + Math.min(1, ctx.moveSpeed / 4.6) * 0.4;
  if (ctx.zone) m *= 0.35;

  // 從網下硬抽：控制深度變難，容易掛網或飛出底線
  let depthMul = 1;
  const netTop = COURT.netCenterHeight;
  if ((kind === 'drive' || kind === 'smash' || kind === 'punch' || kind === 'speedup') && ctx.contactHeight < netTop) {
    depthMul += (netTop - ctx.contactHeight) * 1.6;
  }
  // 早打：正手把球拉向左邊；晚打推向右邊；反手相反
  const bias = clamp(ctx.timingOffset / 0.15, -1, 1) * (1 - ctx.quality) * 0.8 * ctx.forehand;
  // 軟球用力過頭會同時「太高又太深」，落到廚房線附近剛好給對手截擊；太輕則掛網
  const arc = gauss(rand) * base.arc * m;
  return {
    depth: gauss(rand) * base.depth * m * depthMul + (soft || kind === 'block' ? arc * 2.5 : 0),
    lateral: gauss(rand) * base.lateral * m + bias,
    arc,
    speed: gauss(rand) * base.speed * m,
  };
};

/**
 * 必殺技的出球設計。這些球路超出真實球拍能打出的範圍（遊戲化），
 * 但落點仍由同一套物理求解，誤差也照樣存在，所以必殺球一樣可能出界或掛網。
 */
export const planSpecial = (id: SpecialId, req: ShotRequest, err: Perturb): ShotPlan => {
  const s = Math.sign(req.contact.z) || 1;
  const toward = -s;
  const xMax = COURT.halfWidth - 0.45;
  const pm = req.paddle ?? { pace: 1, spin: 1 };
  const aimX = (k: number) => clamp(req.aimX * s * k + err.lateral * s, -xMax - 0.3, xMax + 0.3);
  const depthFromNet = Math.abs(req.contact.z);
  let kind: ShotKind;
  let target: V3;
  let sol;
  if (id === 'inferno') {
    kind = 'drive';
    const d = clamp(COURT.halfLength - 1 + req.aimDepth * 0.6 + err.depth, 2.4, COURT.halfLength + 0.6);
    target = v3(aimX(2.4), 0, toward * d);
    sol = solveClearing(req.contact, target, maxPace(req.incomingSpeed) * 1.38 * pm.pace, 170, 0.1);
  } else if (id === 'thunder') {
    kind = 'smash';
    const d = clamp(3.8 + req.aimDepth * 1.3 + err.depth, 2.5, COURT.halfLength + 0.4);
    target = v3(aimX(2.4), 0, toward * d);
    sol = solveByApex(req.contact, target, Math.max(5.6, req.contact.y + 2), 0);
  } else if (id === 'phantom') {
    const deep = depthFromNet > COURT.kitchen + 1.7;
    kind = deep ? 'drop' : 'dink';
    const d = clamp(1.4 + req.aimDepth * 0.4 + err.depth * 0.6, 0.5, 2.6);
    target = v3(aimX(2.2), 0, toward * d);
    sol = solveByApex(req.contact, target, netHeightAt(req.contact.x) + (deep ? 0.75 : 0.3), -30);
  } else {
    kind = 'drive';
    const d = clamp(3.4 + req.aimDepth * 1.1 + err.depth, 2.4, COURT.halfLength);
    target = v3(aimX(2.4), 0, toward * d);
    sol = solveClearing(req.contact, target, 15.5 * pm.pace, -260, 0.1);
  }
  return {
    kind,
    target,
    vel: sol.vel,
    spin: sol.spin,
    speed: Math.hypot(sol.vel.x, sol.vel.y, sol.vel.z),
    flightTime: sol.time,
  };
};

/**
 * 角色絕招的擊球。噴水與曲球用一般擊球（效果另外加），這裡只處理兩種重砲：
 * 秒蹲＝深蹲後貼網平抽打到底線；幹他＝跳起來大上旋往中場重扣。
 */
export const planSkill = (id: SkillId, req: ShotRequest, err: Perturb): ShotPlan | null => {
  if (id !== 'squatSmash' && id !== 'spinSmash') return null;
  const s = Math.sign(req.contact.z) || 1;
  const toward = -s;
  const xMax = COURT.halfWidth - 0.45;
  const pm = req.paddle ?? { pace: 1, spin: 1 };
  const x = clamp(req.aimX * s * 2.4 + err.lateral * s, -xMax - 0.3, xMax + 0.3);
  let target: V3;
  let sol;
  if (id === 'squatSmash') {
    const d = clamp(COURT.halfLength - 1.2 + req.aimDepth * 0.6 + err.depth, 3, COURT.halfLength + 0.4);
    target = v3(x, 0, toward * d);
    sol = solveClearing(req.contact, target, maxPace(req.incomingSpeed) * 1.3 * pm.pace, 140, 0.04);
  } else {
    const d = clamp(3.4 + req.aimDepth * 1.1 + err.depth, 2.4, COURT.halfLength - 0.5);
    target = v3(x, 0, toward * d);
    sol = solveClearing(req.contact, target, maxPace(req.incomingSpeed) * 1.32 * pm.pace, 300, 0.12);
  }
  return {
    kind: id === 'squatSmash' ? 'drive' : 'smash',
    target,
    vel: sol.vel,
    spin: sol.spin,
    speed: Math.hypot(sol.vel.x, sol.vel.y, sol.vel.z),
    flightTime: sol.time,
  };
};
