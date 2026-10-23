import { COURT, PLAYER, netHeightAt } from './constants';
import { type PathSample, isInCourt } from './ball';
import { type ShotButton, SMASH_HEIGHT } from './shots';
import { teamSide } from './rules';
import { clamp, gauss, hypot2 } from './vec';
import type { Athlete, GameEngine } from './game';

export type Difficulty = 'rookie' | 'club' | 'pro';

export interface AIProfile {
  label: string;
  /** 對應的 DUPR 程度，讓玩家有感 */
  rating: string;
  reaction: number;
  maxSpeed: number;
  /** 擊球誤差倍率（玩家 = 1） */
  skill: number;
  /** 揮拍時機的標準差（秒） */
  timingSigma: number;
  /** 高球時加速進攻的機率 */
  aggression: number;
  /** 底線面對網前對手時打放小球的機率（而不是硬抽） */
  dropRate: number;
  lobRate: number;
  /** 判斷出界球、選擇不打的準確率 */
  outJudgement: number;
  /** 回合中往網前推進的意願 */
  netRush: number;
  serveSigma: number;
}

export const AI_PROFILES: Record<Difficulty, AIProfile> = {
  rookie: {
    label: '新手',
    rating: 'DUPR 2.5',
    reaction: 0.4,
    maxSpeed: 3.5,
    skill: 1.9,
    timingSigma: 0.055,
    aggression: 0.25,
    dropRate: 0.25,
    lobRate: 0.05,
    outJudgement: 0.5,
    netRush: 0.45,
    serveSigma: 0.06,
  },
  club: {
    label: '球友',
    rating: 'DUPR 3.5',
    reaction: 0.28,
    maxSpeed: 4.1,
    skill: 1.4,
    timingSigma: 0.035,
    aggression: 0.5,
    dropRate: 0.55,
    lobRate: 0.07,
    outJudgement: 0.78,
    netRush: 0.8,
    serveSigma: 0.04,
  },
  pro: {
    label: '高手',
    rating: 'DUPR 4.5',
    reaction: 0.18,
    maxSpeed: 4.6,
    skill: 1.2,
    timingSigma: 0.022,
    aggression: 0.85,
    dropRate: 0.8,
    lobRate: 0.08,
    outJudgement: 0.93,
    netRush: 1,
    serveSigma: 0.025,
  },
};

export interface AIPlan {
  contactT: number;
  stand: { x: number; z: number };
  path: PathSample[];
  pathT0: number;
  /** 預測軌跡時球已經落地幾次（軌跡裡的落地數從這裡起算） */
  pathBounces0: number;
  /** 判斷是出界球，選擇不打並閃開 */
  leave: boolean;
  /** 已經揮拍了 */
  swung: boolean;
  /** 預計的擊球點（出界球則為落地點） */
  contact: { x: number; y: number; z: number };
  timingError: number;
  /** 預計在落地前截擊 */
  volley: boolean;
  /** 依目前位置與跑速來得及跑到站位 */
  feasible: boolean;
}

export interface AIState {
  profile: AIProfile;
  plan: AIPlan | null;
  replanAt: number;
  home: { x: number; z: number };
  serveAt: number;
}

export const createAI = (difficulty: Difficulty): AIState => ({
  profile: AI_PROFILES[difficulty],
  plan: null,
  replanAt: 0,
  home: { x: 0, z: 0 },
  serveAt: 0,
});

/** 預測球第一次落地的位置（判斷出界用） */
const firstLanding = (path: PathSample[], side: number) => {
  for (let i = 1; i < path.length; i++) {
    if (path[i].bounces === 1 && path[i - 1].bounces === 0) {
      const p = path[i].pos;
      return Math.sign(p.z) === side ? p : null;
    }
  }
  return null;
};

/** 為這一球規劃擊球點：何時、站在哪裡、截擊還是等落地 */
export const planContact = (
  eng: GameEngine,
  a: Athlete,
  rand: () => number,
  profile?: AIProfile,
  /** 偏好的擊球時間（絕對時間）：讓導引不要在截擊／落地球之間跳來跳去 */
  preferT?: number,
): AIPlan | null => {
  const prof = profile ?? a.ai!.profile;
  const side = teamSide(a.team);
  const now = eng.time;
  const path = eng.predict(2.4);
  const requireBounce = eng.rally.hits <= 2 || eng.mode === 'dink';
  // 預測開始前球可能已經在這邊落地過一次
  const b0 = eng.rally.bouncesSinceHit;

  // 會出界的球：看得出來就不打（被打到身上會失分，要閃開）
  const land = b0 === 0 ? firstLanding(path, side) : null;
  if (land && !isInCourt({ x: land.x * 0.97, y: 0, z: land.z * 0.98 }) && rand() < prof.outJudgement) {
    let dodgeX = a.pos.x;
    for (const s of path) {
      if (s.bounces === 0 && Math.abs(s.pos.z - a.pos.z) < 0.4 && s.pos.y < 1.9) {
        if (Math.abs(s.pos.x - a.pos.x) < 0.7) dodgeX = s.pos.x + (a.pos.x >= s.pos.x ? 0.9 : -0.9);
      }
    }
    return {
      contactT: Infinity,
      stand: { x: dodgeX, z: a.pos.z },
      path,
      pathT0: now,
      pathBounces0: b0,
      leave: true,
      swung: false,
      timingError: 0,
      volley: false,
      feasible: true,
      contact: { x: land.x, y: 0, z: land.z },
    };
  }

  const reactLeft = Math.max(0, eng.rally.lastHitTime + prof.reaction - now);
  const atNet = Math.abs(a.pos.z) < COURT.kitchen + 1.1;
  let best: { s: PathSample; stand: { x: number; z: number }; cost: number; feasible: boolean; volley: boolean } | null = null;

  for (const s of path) {
    if (b0 + s.bounces > 1) break;
    if (Math.sign(s.pos.z) !== side) continue;
    if (s.pos.y < 0.18 || s.pos.y > 2.25) continue;
    if (Math.abs(s.pos.x) > COURT.halfWidth + 2) continue;
    const volley = b0 + s.bounces === 0;
    if (volley && requireBounce) continue;

    // 身體站在球後方 0.3 m、側邊 0.55 m（正手或反手，取比較近的一邊）
    let standZ = s.pos.z + side * 0.3;
    if (volley && Math.abs(standZ) - 0.12 <= COURT.kitchen + 0.12) {
      // 截擊：腳停在廚房線後，往前伸手最多約 0.7 m 去攔高球
      standZ = side * (COURT.kitchen + 0.25);
      if (Math.abs(standZ) - Math.abs(s.pos.z) > 0.7) continue;
    }
    const fhX = s.pos.x - side * 0.55;
    const bhX = s.pos.x + side * 0.55;
    const standX = Math.abs(fhX - a.pos.x) <= Math.abs(bhX - a.pos.x) ? fhX : bhX;
    const travel = hypot2(standX - a.pos.x, standZ - a.pos.z);
    const needed = travel / prof.maxSpeed + 0.12 + reactLeft;
    const feasible = needed <= s.t;

    const idealY = volley ? 1.0 : 0.85;
    let cost = Math.abs(s.pos.y - idealY) * 0.8 + travel * 0.25;
    if (volley) cost += atNet && s.pos.y > 0.45 ? -0.35 : 0.5;
    // 搆得到的高球：在空中殺下去，不要等它掉下來
    if (s.pos.y > SMASH_HEIGHT && s.pos.y < 2.15 && Math.abs(s.pos.z) < 6) cost -= 0.9;
    // 網前彈起高過網的球：在高點出手突擊（打低了就只能 dink）
    else if (atNet && s.pos.y > netHeightAt(s.pos.x) + 0.08) cost -= 0.3 + (s.pos.y - netHeightAt(s.pos.x)) * 0.6;
    if (preferT !== undefined && Number.isFinite(preferT)) cost += Math.abs(now + s.t - preferT) * 3;
    if (!feasible) cost += 5 + (needed - s.t) * 4;
    if (!best || cost < best.cost) best = { s, stand: { x: standX, z: standZ }, cost, feasible, volley };
  }
  if (!best) return null;

  const timingError = gauss(rand) * prof.timingSigma;
  return {
    contactT: now + best.s.t,
    stand: best.stand,
    path,
    pathT0: now,
    pathBounces0: b0,
    leave: false,
    swung: false,
    timingError,
    contact: { x: best.s.pos.x, y: best.s.pos.y, z: best.s.pos.z },
    volley: best.volley,
    feasible: best.feasible,
  };
};

export interface AIShot {
  button: ShotButton;
  charge: number;
  aimX: number;
  aimDepth: number;
}

/**
 * 依真實戰術選球路：
 * 接發球打深、第三拍面對網前對手放小球、低於網的球 dink、高球才進攻。
 */
export const chooseShot = (eng: GameEngine, a: Athlete, rand: () => number): AIShot => {
  const prof = a.ai!.profile;
  const side = teamSide(a.team);
  const ball = eng.ball.pos;
  const opp = eng.opponentOf(a).pos;
  const depth = Math.abs(ball.z);
  const oppDepth = Math.abs(opp.z);
  const h = ball.y;
  const netTop = netHeightAt(ball.x);
  // 把世界座標 x 換算成擊球者自己的瞄準值（aimX × side × 2.3 = 世界 x）
  const aimAt = (worldX: number) => clamp(worldX / (side * 2.3), -1, 1);
  // 被逼著跑、伸手救球時打保守：往中間瞄；程度越高越敢瞄邊線
  const ownDx = eng.ball.pos.x - a.pos.x;
  const ownDz = eng.ball.pos.z - a.pos.z;
  const pressure = clamp(Math.hypot(a.vel.x, a.vel.z) / prof.maxSpeed + Math.max(0, Math.hypot(ownDx, ownDz) - 0.75) * 2, 0, 1);
  const wide = (0.9 + 0.9 * prof.aggression) * (1 - 0.55 * pressure);
  const awayFromOpp = () => aimAt(-Math.sign(opp.x || (rand() - 0.5)) * wide * (0.7 + rand() * 0.3));

  if (eng.mode === 'dink') {
    const spread = Math.min(1, 0.3 + eng.dinkStreak * 0.05);
    return { button: 'soft', charge: 0.2 + rand() * 0.4, aimX: (rand() * 2 - 1) * spread, aimDepth: 0 };
  }

  if (eng.rally.hits === 1) {
    // 接發球：打深、打穩，然後上網
    return { button: 'drive', charge: 0.15 + rand() * 0.25, aimX: awayFromOpp() * 0.6, aimDepth: 0.7 };
  }
  if (h > SMASH_HEIGHT && depth < 6) {
    // 可殺的高球：一律重扣
    return { button: 'drive', charge: 0.75 + rand() * 0.25, aimX: awayFromOpp(), aimDepth: rand() - 0.3 };
  }
  const deep = depth > COURT.kitchen + 1.7;
  const oppAtNet = oppDepth < COURT.kitchen + 1.5;
  if (deep) {
    if (oppAtNet && rand() < prof.dropRate) {
      return { button: 'soft', charge: 0.2 + rand() * 0.4, aimX: awayFromOpp() * 0.7, aimDepth: 0 };
    }
    if (oppAtNet && rand() < prof.lobRate) {
      return { button: 'lob', charge: 0.3 + rand() * 0.5, aimX: awayFromOpp(), aimDepth: 0 };
    }
    return { button: 'drive', charge: 0.4 + rand() * 0.4, aimX: awayFromOpp() * 0.8, aimDepth: rand() * 0.6 - 0.2 };
  }
  // 網前
  const above = h - netTop;
  // 高於網的球積極進攻；在網高附近偶爾冒險加速（speed-up），從網下硬打失誤率很高
  const attack = above > 0.1 ? prof.aggression * clamp(above / 0.4, 0.3, 1) : above > -0.12 ? prof.aggression * 0.22 : 0;
  if (rand() < attack) {
    // 高於網的球才加速：打對手腳下或身體
    return { button: 'drive', charge: 0.55 + rand() * 0.4, aimX: aimAt(opp.x + (rand() - 0.5)), aimDepth: 0 };
  }
  if (oppAtNet && rand() < prof.lobRate * 0.6) {
    return { button: 'lob', charge: 0.4 + rand() * 0.4, aimX: awayFromOpp(), aimDepth: 0 };
  }
  if (!oppAtNet) {
    // 對手還在後場：打到他腳邊逼他從低點擊球
    return { button: 'soft', charge: 0.6 + rand() * 0.4, aimX: awayFromOpp() * 0.6, aimDepth: 0.5 };
  }
  return { button: 'soft', charge: 0.15 + rand() * 0.5, aimX: awayFromOpp(), aimDepth: 0 };
};

/** 沒輪到自己擊球時的站位：發球方第三拍前留在底線，其餘時候往廚房線推進 */
export const homePosition = (eng: GameEngine, a: Athlete) => {
  const ai = a.ai!;
  const side = teamSide(a.team);
  const prof = ai.profile;
  const ballX = eng.ball.pos.x;
  if (eng.mode === 'dink') return { x: ballX * 0.4, z: side * (COURT.kitchen + 0.3) };
  const isServingTeam = eng.match.serving === a.team;
  let z: number;
  if (isServingTeam && eng.rally.hits <= 2) z = side * (COURT.halfLength - 0.1);
  else {
    const lastKind = eng.rally.lastKindByTeam[a.team];
    const ownDepth = Math.abs(a.pos.z);
    const rush = prof.netRush;
    if (lastKind === 'drive' && ownDepth > 4.5) z = side * (4.6 - 1.4 * rush);
    else z = side * (COURT.kitchen + 0.3 + (1 - rush) * 2.5);
  }
  return { x: clamp(ballX * 0.45, -2, 2), z };
};

/** AI 的移動：朝目標加速、接近時減速，和玩家同一套速度上限 */
export const steer = (a: Athlete, tx: number, tz: number, maxSpeed: number, dt: number) => {
  const dx = tx - a.pos.x;
  const dz = tz - a.pos.z;
  const dist = Math.hypot(dx, dz);
  const slow = a.swing.state === 'swinging' ? PLAYER.swingMoveFactor : 1;
  // 用「剩餘距離能煞住」的速度當期望速度，自然減速
  const want = Math.min(maxSpeed * slow, Math.sqrt(2 * PLAYER.decel * 0.7 * dist));
  const wx = dist > 1e-3 ? (dx / dist) * want : 0;
  const wz = dist > 1e-3 ? (dz / dist) * want : 0;
  const ax = clamp((wx - a.vel.x) / dt, -PLAYER.accel * 1.4, PLAYER.accel * 1.4);
  const az = clamp((wz - a.vel.z) / dt, -PLAYER.accel * 1.4, PLAYER.accel * 1.4);
  a.vel.x += ax * dt;
  a.vel.z += az * dt;
};
