import type { BallState } from './ball';
import type { AIPlan } from './ai';
import type { Athlete, DiveState, GameEngine, HumanGuide, Phase, RallyState, SwingState } from './game';
import type { Team } from './rules';
import { type V3, v3 } from './vec';

/**
 * 精彩重播的錄影帶：記下最近幾秒「畫面需要的狀態」（球、選手位置、揮拍、撲接、AI 規劃），
 * 重播時把這些狀態套回引擎，畫面元件（選手姿勢、球、特效）照常讀引擎就會重演一次。
 * 記錄用固定的預先配置格子循環覆寫，比賽中不產生垃圾。
 */

/** 每幾個物理步記一格（240 Hz / 4 = 60 格／秒，畫面再內插） */
export const REPLAY_STRIDE = 4;
/** 最多保留幾格：60 格／秒 × 7 秒（一分打完到重播開始有 2 秒多的空檔） */
const CAPACITY = 420;

interface AthleteFrame {
  pos: V3;
  vel: V3;
  swing: SwingState;
  dive: DiveState;
  hasDive: boolean;
  plan: AIPlan | null;
  jumpUntil: number;
  knockedUntil: number;
  skillAt: number;
  skillArmed: boolean;
  armed: boolean;
  awakenHits: number;
  energy: number;
}

interface Frame {
  t: number;
  phase: Phase;
  ball: V3;
  ballVel: V3;
  spin: V3;
  special: BallState['special'];
  lastTeam: Team | null;
  lastHitTime: number;
  hits: number;
  guide: HumanGuide | null;
  skillShot: GameEngine['skillShot'];
  athletes: AthleteFrame[];
}

const blankSwing = (): SwingState => ({
  state: 'idle',
  button: 'soft',
  t0: 0,
  charge: 0,
  swingStart: -9,
  contactAt: -9,
  done: true,
  path: null,
  pathT0: 0,
  pathBounces0: 0,
  assistQ: null,
  aimX: 0,
  aimDepth: 0,
  forehand: 1,
});
const blankDive = (): DiveState => ({ t0: 0, dir: { x: 0, z: 0 }, hitAt: null, landAt: 0, upAt: 0, landed: false });

const newFrame = (n: number): Frame => ({
  t: 0,
  phase: 'rally',
  ball: v3(),
  ballVel: v3(),
  spin: v3(),
  special: null,
  lastTeam: null,
  lastHitTime: 0,
  hits: 0,
  guide: null,
  skillShot: null,
  athletes: Array.from({ length: n }, () => ({
    pos: v3(),
    vel: v3(),
    swing: blankSwing(),
    dive: blankDive(),
    hasDive: false,
    plan: null,
    jumpUntil: 0,
    knockedUntil: 0,
    skillAt: -9,
    skillArmed: false,
    armed: false,
    awakenHits: 0,
    energy: 0,
  })),
});

const set = (o: V3, s: V3) => {
  o.x = s.x;
  o.y = s.y;
  o.z = s.z;
};

/** 重播前的現場：物件參照原封不動收起來，重播時換上錄影帶自己的物件，播完再換回去 */
interface Live {
  time: number;
  phase: Phase;
  alpha: number;
  ball: BallState;
  prevBall: V3;
  rally: RallyState;
  guide: HumanGuide | null;
  skillShot: GameEngine['skillShot'];
  chance: GameEngine['chance'];
  landingMarker: V3 | null;
  athletes: {
    pos: V3;
    prevPos: V3;
    vel: V3;
    swing: SwingState;
    dive: DiveState | null;
    plan: AIPlan | null;
    jumpUntil: number;
    knockedUntil: number;
    skillAt: number;
    skillArmed: boolean;
    armed: boolean;
    awakenHits: number;
    energy: number;
  }[];
}

export class ReplayTape {
  private frames: Frame[];
  private head = 0;
  private count = 0;
  private live: Live | null = null;
  /** 重播時給引擎用的物件（預先配置） */
  private ball: BallState = { pos: v3(), vel: v3(), spin: v3(), special: null, curve: null };
  private prevBall = v3();
  private rally: RallyState;
  private props: { pos: V3; prevPos: V3; vel: V3; swing: SwingState; dive: DiveState }[];

  constructor(athletes: number, rally: RallyState) {
    this.frames = Array.from({ length: CAPACITY }, () => newFrame(athletes));
    this.rally = { ...rally, lastKindByTeam: [null, null], diveSaved: [false, false] };
    this.props = Array.from({ length: athletes }, () => ({ pos: v3(), prevPos: v3(), vel: v3(), swing: blankSwing(), dive: blankDive() }));
  }

  clear() {
    this.count = 0;
    this.head = 0;
  }

  private at(i: number) {
    return this.frames[(this.head - this.count + i + CAPACITY) % CAPACITY];
  }

  record(eng: GameEngine) {
    const f = this.frames[this.head];
    this.head = (this.head + 1) % CAPACITY;
    this.count = Math.min(CAPACITY, this.count + 1);
    f.t = eng.time;
    f.phase = eng.phase;
    set(f.ball, eng.ball.pos);
    set(f.ballVel, eng.ball.vel);
    set(f.spin, eng.ball.spin);
    // 必殺球的狀態（飛行時間、是否已落地）會一路變：記當下的副本，重播時特效和落點預警才對得上
    f.special = eng.ball.special ? { ...eng.ball.special } : null;
    f.lastTeam = eng.rally.lastTeam;
    f.lastHitTime = eng.rally.lastHitTime;
    f.hits = eng.rally.hits;
    f.guide = eng.guide;
    f.skillShot = eng.skillShot;
    eng.athletes.forEach((a, i) => {
      const s = f.athletes[i];
      set(s.pos, a.pos);
      set(s.vel, a.vel);
      Object.assign(s.swing, a.swing);
      s.hasDive = !!a.dive;
      if (a.dive) {
        Object.assign(s.dive, a.dive);
        s.dive.dir = a.dive.dir;
      }
      s.plan = a.ai?.plan ?? null;
      s.jumpUntil = a.jumpUntil;
      s.knockedUntil = a.knockedUntil;
      s.skillAt = a.skillAt;
      s.skillArmed = a.skillArmed;
      s.armed = a.armed;
      s.awakenHits = a.awakenHits;
      s.energy = a.energy;
    });
  }

  /** 一段時間內的球路（重播時畫軌跡用） */
  ballPath(from: number, to: number): V3[] {
    const out: V3[] = [];
    for (let i = 0; i < this.count; i++) {
      const f = this.at(i);
      if (f.t >= from && f.t <= to) out.push(v3(f.ball.x, f.ball.y, f.ball.z));
    }
    return out;
  }

  /** 某個時間點：選手位置與當時的建議站位（失分重播講「你站這、應該站這」用） */
  snapshot(t: number, athlete: number): { pos: V3; stand: { x: number; z: number } | null } | null {
    let best: Frame | null = null;
    for (let i = 0; i < this.count; i++) {
      const f = this.at(i);
      if (!best || Math.abs(f.t - t) < Math.abs(best.t - t)) best = f;
    }
    if (!best) return null;
    const a = best.athletes[athlete];
    return { pos: v3(a.pos.x, 0, a.pos.z), stand: best.guide && !best.guide.leave ? { x: best.guide.stand.x, z: best.guide.stand.z } : null };
  }

  /** 錄到的時間範圍 */
  span(): [number, number] | null {
    return this.count >= 2 ? [this.at(0).t, this.at(this.count - 1).t] : null;
  }

  /** 開始重播：收起現場，換上錄影帶的物件 */
  begin(eng: GameEngine) {
    this.live = {
      time: eng.time,
      phase: eng.phase,
      alpha: eng.alpha,
      ball: eng.ball,
      prevBall: eng.prevBall,
      rally: eng.rally,
      guide: eng.guide,
      skillShot: eng.skillShot,
      chance: eng.chance,
      landingMarker: eng.landingMarker,
      athletes: eng.athletes.map((a) => ({
        pos: a.pos,
        prevPos: a.prevPos,
        vel: a.vel,
        swing: a.swing,
        dive: a.dive,
        plan: a.ai?.plan ?? null,
        jumpUntil: a.jumpUntil,
        knockedUntil: a.knockedUntil,
        skillAt: a.skillAt,
        skillArmed: a.skillArmed,
        armed: a.armed,
        awakenHits: a.awakenHits,
        energy: a.energy,
      })),
    };
    eng.ball = this.ball;
    eng.prevBall = this.prevBall;
    Object.assign(this.rally, eng.rally);
    eng.rally = this.rally;
    eng.chance = null;
    eng.landingMarker = null;
    eng.athletes.forEach((a, i) => {
      const p = this.props[i];
      a.pos = p.pos;
      a.prevPos = p.prevPos;
      a.vel = p.vel;
      a.swing = p.swing;
    });
  }

  /** 把錄影帶上 t 時刻的狀態套到引擎（相鄰兩格之間用 alpha 內插） */
  show(eng: GameEngine, t: number) {
    let i = 0;
    while (i < this.count - 2 && this.at(i + 1).t <= t) i++;
    const f = this.at(i);
    const g = this.at(Math.min(i + 1, this.count - 1));
    eng.time = t;
    eng.phase = f.phase;
    eng.alpha = g.t > f.t ? Math.min(1, Math.max(0, (t - f.t) / (g.t - f.t))) : 1;
    set(eng.prevBall, f.ball);
    set(eng.ball.pos, g.ball);
    set(eng.ball.vel, f.ballVel);
    set(eng.ball.spin, f.spin);
    eng.ball.special = f.special;
    eng.rally.lastTeam = f.lastTeam;
    eng.rally.lastHitTime = f.lastHitTime;
    eng.rally.hits = f.hits;
    eng.guide = f.guide;
    eng.skillShot = f.skillShot;
    eng.athletes.forEach((a: Athlete, k) => {
      const s = f.athletes[k];
      const p = this.props[k];
      set(p.prevPos, s.pos);
      set(p.pos, g.athletes[k].pos);
      set(p.vel, s.vel);
      Object.assign(p.swing, s.swing);
      if (s.hasDive) Object.assign(p.dive, s.dive);
      a.dive = s.hasDive ? p.dive : null;
      if (a.ai) a.ai.plan = s.plan;
      a.jumpUntil = s.jumpUntil;
      a.knockedUntil = s.knockedUntil;
      a.skillAt = s.skillAt;
      a.skillArmed = s.skillArmed;
      a.armed = s.armed;
      a.awakenHits = s.awakenHits;
      a.energy = s.energy;
    });
  }

  /** 重播結束：把現場原封不動換回來 */
  end(eng: GameEngine) {
    const l = this.live;
    if (!l) return;
    this.live = null;
    eng.time = l.time;
    eng.phase = l.phase;
    eng.alpha = l.alpha;
    eng.ball = l.ball;
    eng.prevBall = l.prevBall;
    eng.rally = l.rally;
    eng.guide = l.guide;
    eng.skillShot = l.skillShot;
    eng.chance = l.chance;
    eng.landingMarker = l.landingMarker;
    eng.athletes.forEach((a, i) => {
      const s = l.athletes[i];
      a.pos = s.pos;
      a.prevPos = s.prevPos;
      a.vel = s.vel;
      a.swing = s.swing;
      a.dive = s.dive;
      if (a.ai) a.ai.plan = s.plan;
      a.jumpUntil = s.jumpUntil;
      a.knockedUntil = s.knockedUntil;
      a.skillAt = s.skillAt;
      a.skillArmed = s.skillArmed;
      a.armed = s.armed;
      a.awakenHits = s.awakenHits;
      a.energy = s.energy;
    });
  }
}
