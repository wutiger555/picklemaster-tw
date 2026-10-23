import { AIR, BALL, COURT, NET_TOTAL_HALF_WIDTH, netHeightAt } from './constants';
import { type V3, v3, clone, cross, len } from './vec';
import type { SpecialId } from './paddles';

/**
 * 必殺技附在球上的狀態。這些是遊戲化的「超物理」效果，
 * 只在必殺球上生效；一般擊球仍是純物理。
 */
export interface BallSpecial {
  id: SpecialId;
  /** 目標落點（天雷用來導向、幻影用來回正） */
  target: V3;
  /** 出手後經過的時間 */
  t: number;
  /** 幻影：預估飛行時間，蛇行剛好一個週期 */
  period: number;
  /** 幻影：蛇行的方向（+1 / -1） */
  sway: number;
  /** 幻影：出手當下的水平側向單位向量（固定，前進方向才不會被扭掉） */
  perp: { x: number; z: number };
  /** 已經落地過（效果轉換完畢） */
  spent: boolean;
}

/** 絕招「左右逢源大曲球」：側向位移 D·sin(ωt)，先往一邊、再往另一邊，落地時回到原本的落點 */
export interface BallCurve {
  t: number;
  /** 側向最大位移（公尺，正負決定先往哪邊） */
  amp: number;
  omega: number;
  perp: { x: number; z: number };
}

export interface BallState {
  pos: V3;
  vel: V3;
  /** 角速度向量（rad/s）。上旋對應的軸 = 上方向 × 飛行方向 */
  spin: V3;
  special: BallSpecial | null;
  curve?: BallCurve | null;
  /** 風速（m/s，水平）：空氣阻力改用相對風的速度算，球會被吹著走（颱風關） */
  wind?: { x: number; z: number } | null;
}

export type BallEvent =
  | { type: 'bounce'; pos: V3; speed: number }
  | { type: 'net'; pos: V3 }
  | { type: 'cord'; pos: V3 };

const AREA = Math.PI * BALL.radius * BALL.radius;
const DRAG_K = (0.5 * AIR.density * BALL.dragCoeff * AREA) / BALL.mass;
const LIFT_K = (0.5 * AIR.density * AREA) / BALL.mass;
/** 空心球轉動慣量 I = 2/3 m r² */
const INERTIA = (2 / 3) * BALL.mass * BALL.radius * BALL.radius;

export const createBall = (): BallState => ({ pos: v3(0, 1, 0), vel: v3(), spin: v3(), special: null });

export const cloneBall = (b: BallState): BallState => ({
  pos: clone(b.pos),
  vel: clone(b.vel),
  spin: clone(b.spin),
  special: b.special ? { ...b.special, target: clone(b.special.target), perp: { ...b.special.perp } } : null,
  curve: b.curve ? { ...b.curve, perp: { ...b.curve.perp } } : null,
  wind: b.wind ? { ...b.wind } : null,
});

/** 空氣中的加速度：重力＋二次阻力＋馬格努斯升力 */
const accelerate = (b: BallState, dt: number) => {
  const { vel, spin } = b;
  const speed = len(vel);
  let ax = 0;
  let ay = -AIR.gravity;
  let az = 0;
  // 有風時阻力用「球相對空氣」的速度：順風飛得遠、逆風掉得快、側風把球吹偏
  const wx = b.wind ? vel.x - b.wind.x : vel.x;
  const wz = b.wind ? vel.z - b.wind.z : vel.z;
  const rel = b.wind ? Math.hypot(wx, vel.y, wz) : speed;
  if (rel > 1e-4) {
    ax -= DRAG_K * rel * wx;
    ay -= DRAG_K * rel * vel.y;
    az -= DRAG_K * rel * wz;
  }
  if (speed > 1e-4) {
    const w = len(spin);
    if (w > 1e-3) {
      // 自旋參數 S = rω/v，升力係數與它近似成正比；洞洞球效果較弱
      const cl = Math.min(BALL.maxLiftCoeff, (BALL.liftScale * BALL.radius * w) / speed);
      const dir = cross(spin, vel); // 方向 ω × v
      const dl = len(dir);
      if (dl > 1e-6) {
        const mag = (LIFT_K * cl * speed * speed) / dl;
        ax += dir.x * mag;
        ay += dir.y * mag;
        az += dir.z * mag;
      }
    }
  }
  vel.x += ax * dt;
  vel.y += ay * dt;
  vel.z += az * dt;

  const decay = Math.exp(-BALL.spinDecay * dt);
  spin.x *= decay;
  spin.y *= decay;
  spin.z *= decay;
};

/**
 * 落地反彈：垂直方向用恢復係數，水平方向用庫倫摩擦處理旋轉。
 * 上旋球打滑少、落地後往前竄；下旋球被地面「煞住」、彈得較短。
 */
const bounce = (b: BallState) => {
  const { vel, spin } = b;
  const r = BALL.radius;
  const vyIn = -vel.y;
  // 球速越快，恢復係數略降（材料遲滯損耗）
  const e = Math.max(0.5, BALL.restitution - 0.004 * vyIn);
  vel.y = vyIn * e;

  // 接觸點滑動速度 u = v + ω × (0, -r, 0)
  const ux = vel.x + spin.z * r;
  const uz = vel.z - spin.x * r;
  const u = Math.hypot(ux, uz);
  if (u > 1e-5) {
    const jStop = (u * BALL.mass) / (1 + (BALL.mass * r * r) / INERTIA);
    const jMax = BALL.friction * BALL.mass * (1 + e) * vyIn;
    const j = Math.min(jStop, jMax);
    const fx = (-j * ux) / u;
    const fz = (-j * uz) / u;
    vel.x += fx / BALL.mass;
    vel.z += fz / BALL.mass;
    // Δω = (d × F) / I，d = (0, -r, 0)
    spin.x += (-r * fz) / INERTIA;
    spin.z += (r * fx) / INERTIA;
  }
  b.pos.y = r;
};

/**
 * 球網：網帶（頂端白帶）當作圓柱處理，可能擦網後滾過或掉回；
 * 網面本身很軟，撞到後幾乎失去所有前進速度。
 * 用前一步與這一步的連線求穿越 z=0 的點，快速抽球才不會一步跨過網。
 */
const collideNet = (b: BallState, prev: V3): BallEvent | null => {
  const { pos, vel } = b;
  const r = BALL.radius;
  if ((prev.z > 0) === (pos.z > 0)) return null;
  const t = prev.z / (prev.z - pos.z);
  const xAt = prev.x + (pos.x - prev.x) * t;
  const yAt = prev.y + (pos.y - prev.y) * t;
  if (Math.abs(xAt) > NET_TOTAL_HALF_WIDTH) return null; // 繞柱球（ATP）不會碰網
  const top = netHeightAt(xAt);
  if (yAt > top + r) return null;
  const side = Math.sign(prev.z) || -1;

  if (yAt > top - r * 0.6) {
    // 擦到網帶：越高越容易滾過去，越低越容易掉回來
    const over = (yAt - (top - r * 0.6)) / (r * 1.6); // 0..1
    const keep = 0.12 + 0.5 * over;
    vel.z *= keep;
    vel.x *= 0.7;
    vel.y = Math.abs(vel.y) * 0.25 + 0.6 + 1.4 * (1 - over);
    b.spin.x *= 0.3;
    b.spin.z *= 0.3;
    pos.x = xAt;
    pos.y = top + r;
    pos.z = vel.z >= 0 ? r * 0.2 : -r * 0.2;
    return { type: 'cord', pos: clone(pos) };
  }

  vel.z = -vel.z * 0.08;
  vel.x *= 0.35;
  vel.y = Math.min(vel.y, 0) * 0.5;
  b.spin.x = 0;
  b.spin.z = 0;
  pos.x = xAt;
  pos.y = Math.max(r, yAt);
  pos.z = side * r * 1.05;
  return { type: 'net', pos: clone(pos) };
};

/** 必殺球在空中的額外效果 */
const specialFlight = (b: BallState, dt: number) => {
  const sp = b.special;
  if (!sp || sp.spent) return;
  sp.t += dt;
  const { pos, vel } = b;
  if (sp.id === 'thunder' && vel.y < 0) {
    // 過了最高點：像落雷一樣加速垂直砸向目標
    vel.y -= 30 * dt;
    const g = 9.81 + 30;
    const h = Math.max(0.01, pos.y - BALL.radius);
    const tf = (vel.y + Math.sqrt(vel.y * vel.y + 2 * g * h)) / g;
    const k = Math.min(1, dt * 12);
    vel.x += ((sp.target.x - pos.x) / Math.max(0.05, tf) - vel.x) * k;
    vel.z += ((sp.target.z - pos.z) / Math.max(0.05, tf) - vel.z) * k;
  } else if (sp.id === 'phantom') {
    // 側向蛇行：a = A·cos(2πt/T) → 位移 = A/ω²·(1−cos ωt)，一個週期後歸零，仍落在目標附近
    const a = sp.sway * 16 * Math.cos((2 * Math.PI * sp.t) / sp.period);
    vel.x += sp.perp.x * a * dt;
    vel.z += sp.perp.z * a * dt;
  }
};

/** 必殺球落地瞬間的變化 */
const specialBounce = (b: BallState) => {
  const sp = b.special;
  if (!sp || sp.spent) return;
  sp.spent = true;
  const { vel } = b;
  if (sp.id === 'frost') {
    // 凍結：幾乎彈不起來、速度被吸掉
    vel.y *= 0.22;
    vel.x *= 0.4;
    vel.z *= 0.4;
    b.spin = v3();
  } else if (sp.id === 'inferno') {
    // 火球貼地竄出
    vel.y *= 0.7;
    vel.x *= 1.05;
    vel.z *= 1.05;
  } else if (sp.id === 'thunder') {
    // 雷擊後暴衝彈跳
    vel.y = Math.max(vel.y * 1.15, 6.5);
    vel.x *= 1.25;
    vel.z *= 1.25;
  }
};

/** 推進一個物理子步，回傳期間發生的事件（落地、掛網）。ignoreNet 給擊球求解器用 */
export const stepBall = (b: BallState, dt: number, ignoreNet = false): BallEvent | null => {
  accelerate(b, dt);
  specialFlight(b, dt);
  const cv = b.curve;
  if (cv) {
    // 側向加速度 = 位移 D·sin(ωt) 的二次微分
    cv.t += dt;
    const a = -cv.amp * cv.omega * cv.omega * Math.sin(cv.omega * cv.t);
    b.vel.x += cv.perp.x * a * dt;
    b.vel.z += cv.perp.z * a * dt;
  }
  const prev = clone(b.pos);
  b.pos.x += b.vel.x * dt;
  b.pos.y += b.vel.y * dt;
  b.pos.z += b.vel.z * dt;

  if (!ignoreNet) {
    const netEv = collideNet(b, prev);
    if (netEv) return netEv;
  }

  if (b.pos.y <= BALL.radius && b.vel.y < 0) {
    // 幾乎沒有垂直速度：球已經在地上滾，不再算一次反彈
    if (b.vel.y > -0.35) {
      b.pos.y = BALL.radius;
      b.vel.y = 0;
      const roll = Math.exp(-1.2 * dt);
      b.vel.x *= roll;
      b.vel.z *= roll;
      return null;
    }
    const speed = len(b.vel);
    const at = v3(b.pos.x, 0, b.pos.z);
    bounce(b);
    specialBounce(b);
    b.curve = null;
    return { type: 'bounce', pos: at, speed };
  }
  return null;
};

/** 是否落在整個球場界內（線上算界內） */
export const isInCourt = (p: V3) =>
  Math.abs(p.x) <= COURT.halfWidth + 0.01 && Math.abs(p.z) <= COURT.halfLength + 0.01;

export interface PathSample {
  t: number;
  pos: V3;
  vel: V3;
  /** 到這個取樣點為止，球已經落地幾次 */
  bounces: number;
}

/**
 * 往前預測軌跡（含掛網、落地），AI 跑位、擊球時機與新手落點提示都靠它。
 * 每 2 個物理子步取一次樣（120 Hz）。slow < 1：球的時間流速變慢（覺醒），取樣時間照比例拉長。
 */
export const predictPath = (b: BallState, duration: number, dt: number, slow = 1): PathSample[] => {
  const sim = cloneBall(b);
  const out: PathSample[] = [];
  let bounces = 0;
  const steps = Math.ceil((duration * slow) / dt);
  for (let i = 1; i <= steps; i++) {
    const ev = stepBall(sim, dt);
    if (ev?.type === 'bounce') {
      bounces++;
      if (bounces > 2) break;
    }
    if (i % 2 === 0) out.push({ t: (i * dt) / slow, pos: clone(sim.pos), vel: clone(sim.vel), bounces });
  }
  return out;
};
