import { createBall, predictPath } from '../game/engine/ball';
import { COURT, PHYSICS_DT } from '../game/engine/constants';
import { solveByApex, solveBySpeed } from '../game/engine/shots';
import { v3 } from '../game/engine/vec';

/**
 * 球路側視圖用的軌跡：直接用 /game 的球體物理（空氣阻力、旋轉、落地反彈）算，不是手畫的弧線。
 * 座標沿用引擎：擊球者在 z > 0 的底線附近往 −z 打，球網在 z = 0。
 */

export const HITTER_Z = 6.2;
/** 對手站在廚房線上（稍微往後一點的擊球位置） */
export const OPP_LINE_Z = -COURT.kitchen;
/** 球高過這個高度經過對手面前，對手就能居高臨下直接攻擊（約網高加一顆拍子的餘裕） */
export const ATTACK_HEIGHT = 0.95;

export interface TracePoint {
  z: number;
  y: number;
  t: number;
}

export interface ShotTrace {
  pts: TracePoint[];
  /** 過網時離網頂多高（公尺，負的就是掛網） */
  netMargin: number;
  /** 第一次落地（null = 沒過網或飛出場外很遠） */
  land: TracePoint | null;
  /** 落地後彈起的最高點 */
  bounceApex: number;
  /** 球在空中經過對手廚房線時的高度（球先落在廚房裡就是 null） */
  atOppLine: number | null;
  apex: number;
}

const trace = (fromY: number, vel: { x: number; y: number; z: number }, spin: { x: number; y: number; z: number }): ShotTrace => {
  const b = createBall();
  b.pos = v3(0, fromY, HITTER_Z);
  b.vel = { ...vel };
  b.spin = { ...spin };
  const path = predictPath(b, 3.2, PHYSICS_DT);
  const pts: TracePoint[] = [{ z: HITTER_Z, y: fromY, t: 0 }];
  let netMargin = -Infinity;
  let land: TracePoint | null = null;
  let bounceApex = 0;
  let atOppLine: number | null = null;
  let apex = fromY;
  let prev = pts[0];
  for (const s of path) {
    const p = { z: s.pos.z, y: s.pos.y, t: s.t };
    if (prev.z > 0 && p.z <= 0) {
      const k = prev.z / (prev.z - p.z);
      netMargin = prev.y + (p.y - prev.y) * k - COURT.netCenterHeight;
    }
    if (s.bounces === 0) {
      apex = Math.max(apex, p.y);
      if (prev.z > OPP_LINE_Z && p.z <= OPP_LINE_Z) atOppLine = prev.y + (p.y - prev.y) * ((prev.z - OPP_LINE_Z) / (prev.z - p.z));
    }
    if (s.bounces >= 1 && !land) land = p;
    if (s.bounces === 1) bounceApex = Math.max(bounceApex, p.y);
    pts.push(p);
    prev = p;
    // 落地後再畫一小段彈跳就停
    if (land && s.t - land.t > 0.45) break;
    if (s.bounces >= 2) break;
  }
  // 掛網：引擎會讓球停在網前落下，球路就畫到那裡
  return { pts, netMargin, land, bounceApex, atOppLine, apex };
};

/** 第三球下切：給「弧線最高點」與「落在對方網前多深」，用引擎的求解器反推出手速度 */
export const traceDrop = (apex: number, depth: number, fromY = 0.45): ShotTrace => {
  const sol = solveByApex(v3(0, fromY, HITTER_Z), v3(0, 0, -depth), apex, 0);
  return trace(fromY, sol.vel, sol.spin);
};

/** 抽球：給球速（m/s），上旋，打向對方底線前 */
export const traceDrive = (speed = 17, depth = 5.6, fromY = 0.75): ShotTrace => {
  const sol = solveBySpeed(v3(0, fromY, HITTER_Z), v3(0, 0, -depth), speed, 30);
  return trace(fromY, sol.vel, sol.spin);
};
