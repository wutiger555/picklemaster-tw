import { BALL, COURT } from './constants';
import { solveByApex, solveBySpeed, type ShotKind } from './shots';
import { type AIProfile, AI_PROFILES } from './ai';
import { type V3, v3, clamp, clone } from './vec';
import type { Team } from './rules';
import type { SpecialId } from './paddles';
import type { SkillId } from './skills';
import type { Athlete, GameEngine, PointReason } from './game';

/**
 * 冒險模式（踢館之旅）的關卡規則。引擎在固定的幾個點呼叫這裡：
 * 每個物理步（step）、每一分開始（setup）、球落地（bounce）、擊球（hit）、一分結束（rallyEnd）。
 * 計分、限時、勝利條件、三星門檻都由關卡自己決定；引擎只提供發球機、風、積水這些場地機制。
 */

export type LevelId = 'cups' | 'pearls' | 'typhoon';

/** 關卡事件（畫面用來播特效、音效、橫幅） */
export type LevelFx =
  | 'feed'
  | 'cup'
  | 'row'
  | 'combo'
  | 'dunk'
  | 'pearl'
  | 'gold'
  | 'goldSpawn'
  | 'drop'
  | 'returned'
  | 'damage'
  | 'tired'
  | 'windWarn'
  | 'wind'
  | 'thunder'
  | 'ko'
  | 'timeUp'
  | 'hurry';

export interface LevelHud {
  id: LevelId;
  /** 剩下幾秒（無條件進位，HUD 不用每幀重繪） */
  timeLeft: number;
  score: number;
  /** 三星門檻（颱風關是「剩餘秒數」） */
  thresholds: [number, number, number];
  /** 現在結束的話拿幾顆星 */
  stars: number;
  /** Boss 血量 0..100 */
  hp?: number;
  /** 風（m/s，取到 0.5，HUD 才不會一直重繪）；警告時附上下一個風向 */
  wind?: { x: number; z: number; warn: boolean; next: { x: number; z: number } | null };
}

export interface LevelHitInfo {
  kind: ShotKind;
  special: SpecialId | null;
  skill: SkillId | null;
  quality: number;
}

export interface Puddle {
  x: number;
  z: number;
  r: number;
  /** 暫時的積水（黑框爆噴出來的），下一分清掉 */
  temp?: boolean;
}

const L = COURT.halfLength;
const W = COURT.halfWidth;
const R = BALL.radius;

export abstract class Level {
  abstract readonly id: LevelId;
  abstract readonly timeLimit: number;
  abstract readonly thresholds: [number, number, number];
  /** 經過的比賽時間（慢動作時也跟著變慢） */
  elapsed = 0;
  score = 0;
  done = false;
  /** 有沒有過關（至少一星） */
  cleared = false;
  /** 一分結束到下一球的停頓；null = 照一般比賽 */
  pause: number | null = 0.45;
  /** 發球機出球口（沒有發球機的關卡是 null） */
  feedFrom: V3 | null = null;
  /** 關掉站位導引與自動跑位（要自己跑） */
  noGuide = false;
  /** 關掉反射擋球（被球打到就是被打到） */
  noReflex = false;
  /** 隨時都能飛撲（不用有球可救） */
  freeDive = false;
  private hurried = false;
  protected rand: () => number;

  constructor(rand: () => number = Math.random) {
    this.rand = rand;
  }

  get timeLeft() {
    return Math.max(0, this.timeLimit - this.elapsed);
  }

  /** 引擎建好、第一分開始前 */
  init?(eng: GameEngine): void;
  /** 每一分（每一顆餵球）開始 */
  setup?(eng: GameEngine): void;
  /** 球落地：回傳 true 表示關卡自己處理，引擎不判這一分 */
  bounce?(eng: GameEngine, pos: V3): boolean;
  hit?(eng: GameEngine, a: Athlete, info: LevelHitInfo): void;
  rallyEnd?(eng: GameEngine, winner: Team, reason: PointReason, faultTeam: Team | null, hits: number): void;

  step(eng: GameEngine, dt: number) {
    if (this.done) return;
    this.elapsed += dt;
    if (!this.hurried && this.timeLeft <= 10) {
      this.hurried = true;
      eng.emit({ type: 'level', fx: 'hurry' });
    }
    if (this.elapsed >= this.timeLimit) {
      this.done = true;
      this.cleared = this.stars() >= 1;
      eng.emit({ type: 'level', fx: 'timeUp' });
    }
  }

  stars() {
    return this.thresholds.filter((t) => this.score >= t).length;
  }

  hud(): LevelHud {
    return { id: this.id, timeLeft: Math.ceil(this.timeLeft), score: Math.round(this.score), thresholds: this.thresholds, stars: this.stars() };
  }
}

// ───────────────────────────── 小遊戲一：夜市打手搖杯 ─────────────────────────────

export interface Cup {
  x: number;
  z: number;
  r: number;
  h: number;
  big: boolean;
  row: number;
  down: boolean;
  downAt: number;
  /** 倒下的方向（球打過來的方向） */
  dir: { x: number; z: number };
  /** 重新擺好的時間（單杯倒了一陣子、或整排倒光） */
  upAt: number;
}

export const CUP_SCORE = { small: 100, big: 300, row: 500, combo: 200, dunk: 1000 } as const;
const SMALL_CUP = { r: 0.17, h: 0.38 };
const BIG_CUP = { r: 0.26, h: 0.58 };
/** 後場右角的「霸王杯」：杯口朝上，高吊球掉進去才算（灌籃）；不在正中央，要瞄準才進得去 */
export const GIANT_CUP = { x: 1.8, z: -(L - 0.85), r: 0.38, h: 0.95 };
const ROW_RESET = 1.8;
/** 單一杯子倒了多久之後老闆會扶起來（整排倒光的話馬上重擺） */
const CUP_RESET = 9;

/**
 * 對面場地擺三排珍奶杯：廚房裡一排小杯（只有軟球打得到，抽球會飛過頭）、
 * 中場一排小杯、底線兩個大杯（抽球掃過去），右後角的霸王杯要用高吊球灌進去。
 */
export class CupsLevel extends Level {
  readonly id = 'cups';
  readonly timeLimit = 60;
  readonly thresholds: [number, number, number] = [900, 2500, 4400];
  cups: Cup[] = [];
  /** 這一拍打倒幾個（連鎖） */
  shotCups = 0;
  /** 灌進霸王杯的時間（畫面播特效） */
  dunkAt = -9;
  private feedAt = 0;
  private landedAt = -1;
  private feeds = 0;
  private dunked = false;

  constructor(rand?: () => number) {
    super(rand);
    this.feedFrom = v3(0, 0.95, -(L + 0.9));
    const row = (row: number, z: number, xs: number[], big: boolean) => {
      for (const x of xs) {
        const s = big ? BIG_CUP : SMALL_CUP;
        this.cups.push({ x, z, r: s.r, h: s.h, big, row, down: false, downAt: -9, dir: { x: 0, z: -1 }, upAt: Infinity });
      }
    };
    row(0, -1.15, [-2.2, -1.1, 0, 1.1, 2.2], false);
    row(1, -3.9, [-2.0, -1.0, 0, 1.0, 2.0], false);
    row(2, -5.5, [-1.7, 0], true);
  }

  init(eng: GameEngine) {
    eng.human.pos = v3(0.4, 0, L - 1.6);
    // 發球機旁的老闆（站在場外，不擋球）
    eng.athletes[1].pos = v3(W + 1.4, 0, -(L + 1.2));
  }

  setup(eng: GameEngine) {
    this.feedAt = eng.time + (this.feeds === 0 ? 1.4 : 0.15);
    this.landedAt = -1;
    this.shotCups = 0;
    this.dunked = false;
    eng.athletes[1].pos = v3(W + 1.4, 0, -(L + 1.2));
  }

  step(eng: GameEngine, dt: number) {
    super.step(eng, dt);
    if (this.done) return;
    const t = eng.time;
    for (const c of this.cups) {
      if (c.down && t >= c.upAt) {
        c.down = false;
        c.upAt = Infinity;
      }
    }
    if (eng.phase === 'serve' && t >= this.feedAt) this.feed(eng);
    if (eng.phase !== 'rally' || eng.rally.lastTeam !== 0) return;
    const b = eng.ball;
    if (!this.dunked) this.collide(eng);
    // 落地後再滾一下（還可能撞倒後排），就換下一球
    const gone = Math.abs(b.pos.z) > L + 2.5 || Math.abs(b.pos.x) > W + 2.5;
    if (t - eng.rally.lastHitTime > 2.4 || (this.landedAt >= 0 && t - this.landedAt > 0.55) || gone || this.dunked) eng.levelEndRally(0, 'winner', null);
  }

  private collide(eng: GameEngine) {
    const b = eng.ball;
    if (b.pos.z > 0) return;
    // 霸王杯：從上面掉進去＝灌籃；撞到杯身就彈開
    const g = GIANT_CUP;
    const gd = Math.hypot(b.pos.x - g.x, b.pos.z - g.z);
    if (gd < g.r - R * 0.5 && b.pos.y < g.h && b.pos.y > g.h - 0.25 && b.vel.y < 0) {
      this.dunked = true;
      this.dunkAt = eng.time;
      this.score += CUP_SCORE.dunk;
      b.vel = v3(0, -0.5, 0);
      eng.emit({ type: 'level', fx: 'dunk', pos: v3(g.x, g.h, g.z), n: CUP_SCORE.dunk });
      return;
    }
    if (gd < g.r + R && b.pos.y < g.h - 0.05) {
      const nx = (b.pos.x - g.x) / (gd || 1);
      const nz = (b.pos.z - g.z) / (gd || 1);
      const vn = b.vel.x * nx + b.vel.z * nz;
      if (vn < 0) {
        b.vel.x -= 1.6 * vn * nx;
        b.vel.z -= 1.6 * vn * nz;
      }
      b.pos.x = g.x + nx * (g.r + R);
      b.pos.z = g.z + nz * (g.r + R);
    }
    for (const c of this.cups) {
      if (c.down) continue;
      if (b.pos.y > c.h + R) continue;
      if (Math.hypot(b.pos.x - c.x, b.pos.z - c.z) > c.r + R) continue;
      this.topple(eng, c);
    }
  }

  private topple(eng: GameEngine, c: Cup) {
    const b = eng.ball;
    const hs = Math.hypot(b.vel.x, b.vel.z) || 1;
    c.down = true;
    c.downAt = eng.time;
    c.upAt = eng.time + CUP_RESET;
    c.dir = { x: b.vel.x / hs, z: b.vel.z / hs };
    // 杯子吃掉一些球速，球還會繼續滾、可能再撞倒下一個
    b.vel.x *= 0.62;
    b.vel.z *= 0.62;
    b.vel.y = Math.max(b.vel.y * 0.4, 0.6);
    this.shotCups += 1;
    const pts = c.big ? CUP_SCORE.big : CUP_SCORE.small;
    this.score += pts;
    eng.emit({ type: 'level', fx: 'cup', pos: v3(c.x, c.h * 0.6, c.z), n: pts });
    const row = this.cups.filter((x) => x.row === c.row);
    if (row.every((x) => x.down)) {
      this.score += CUP_SCORE.row;
      for (const x of row) x.upAt = eng.time + ROW_RESET;
      eng.emit({ type: 'level', fx: 'row', pos: v3(0, 0.5, c.z), n: CUP_SCORE.row });
    }
  }

  bounce(eng: GameEngine, pos: V3) {
    // 玩家打過去、落在對面：不判分，讓球繼續滾去撞杯子
    if (eng.rally.lastTeam !== 0 || pos.z > 0) return false;
    if (this.landedAt < 0) this.landedAt = eng.time;
    return true;
  }

  rallyEnd(eng: GameEngine) {
    if (this.shotCups >= 2) {
      const bonus = CUP_SCORE.combo * (this.shotCups - 1);
      this.score += bonus;
      eng.emit({ type: 'level', fx: 'combo', n: this.shotCups, pos: clone(eng.ball.pos) });
    }
  }

  /** 發球機：餵到玩家附近、好打的高度 */
  private feed(eng: GameEngine) {
    const h = eng.human;
    const r = this.rand;
    this.feeds += 1;
    const target = v3(clamp(h.pos.x + (r() - 0.5) * 2.6, -W + 0.5, W - 0.5), 0, 3.4 + r() * 1.8);
    const sol = solveByApex(this.feedFrom!, target, 1.6 + r() * 0.45, 0);
    eng.feed(this.feedFrom!, sol.vel, sol.spin);
  }
}

// ───────────────────────────── 小遊戲二：波霸大收集 ─────────────────────────────

export interface Pearl {
  x: number;
  z: number;
  gold: boolean;
  alive: boolean;
  bornAt: number;
  /** 金珍珠的消失時間 */
  until: number;
  /** 空位：什麼時候可以長新的 */
  respawnAt: number;
}

export const PEARL_SLOTS = 26;
const PEARLS_ON_FIELD = 3;
/** 被砲彈打中的判定半徑（背著一大袋珍珠，目標比較大） */
const BAG_RADIUS = 0.42;
const GOLD_VALUE = 8;
const GOLD_LIFE = 0.95;
/** 被打中掉幾顆、其中幾顆散在旁邊撿得回來 */
const DROP = 6;
const DROP_BACK = 2;

/**
 * 場上撒滿珍珠，跑過去就撿起來。對面的發球機會瞄準你開砲：
 * 被打到會掉 3 顆珍珠（散在旁邊，可以再撿回來）；拿拍子打回去有獎勵。
 * 偶爾冒出一顆金珍珠，一下就消失，用跑的來不及，要飛撲過去。
 */
export class PearlsLevel extends Level {
  readonly id = 'pearls';
  readonly timeLimit = 50;
  readonly thresholds: [number, number, number] = [50, 85, 108];
  pearls: Pearl[] = [];
  /** 被打中的時間（畫面閃紅） */
  hitAt = -9;
  private feedAt = 0;
  private nextGold = 0;
  private feeds = 0;
  private bouncedAt = -1;

  constructor(rand?: () => number) {
    super(rand);
    this.feedFrom = v3(0, 1.0, -(L + 0.9));
    this.noGuide = true;
    this.noReflex = true;
    this.freeDive = true;
    this.pause = 0.25;
    for (let i = 0; i < PEARL_SLOTS; i++) this.pearls.push({ x: 0, z: 0, gold: false, alive: false, bornAt: -9, until: Infinity, respawnAt: 0 });
  }

  init(eng: GameEngine) {
    eng.human.pos = v3(0, 0, L - 2.2);
    eng.athletes[1].pos = v3(W + 1.4, 0, -(L + 1.2));
    for (let i = 0; i < PEARLS_ON_FIELD; i++) this.spawn(eng, this.pearls[i], false);
    this.nextGold = 4.5;
  }

  setup(eng: GameEngine) {
    // 開砲越來越密
    const gap = 0.7 - 0.45 * clamp(this.elapsed / this.timeLimit, 0, 1);
    this.feedAt = eng.time + (this.feeds === 0 ? 1.6 : gap);
    this.bouncedAt = -1;
    eng.athletes[1].pos = v3(W + 1.4, 0, -(L + 1.2));
  }

  private spawn(eng: GameEngine, p: Pearl, gold: boolean) {
    const h = eng.human.pos;
    const r = this.rand;
    let x = 0;
    let z = 0;
    for (let k = 0; k < 12; k++) {
      if (gold) {
        // 金珍珠：在身邊 2.5–3.0 m，跑過去來不及、撲過去剛好
        const a = r() * Math.PI * 2;
        const d = 2.5 + r() * 0.5;
        x = h.x + Math.cos(a) * d;
        z = h.z + Math.sin(a) * d;
      } else {
        x = (r() * 2 - 1) * (W - 0.3);
        z = 0.7 + r() * (L - 0.4);
      }
      if (Math.abs(x) < W - 0.2 && z > 0.6 && z < L - 0.1 && (gold || Math.hypot(x - h.x, z - h.z) > 1.8)) break;
    }
    p.x = clamp(x, -W + 0.2, W - 0.2);
    p.z = clamp(z, 0.6, L - 0.1);
    p.gold = gold;
    p.alive = true;
    p.bornAt = eng.time;
    p.until = gold ? eng.time + GOLD_LIFE : Infinity;
  }

  step(eng: GameEngine, dt: number) {
    super.step(eng, dt);
    if (this.done) return;
    const t = eng.time;
    const h = eng.human;
    const diving = !!h.dive && !h.dive.landed;
    const reach = diving ? 0.95 : 0.55;
    let normals = 0;
    for (const p of this.pearls) {
      if (!p.alive) continue;
      if (p.gold && t > p.until) {
        p.alive = false;
        p.respawnAt = Infinity;
        continue;
      }
      if (Math.hypot(p.x - h.pos.x, p.z - h.pos.z) < reach) {
        p.alive = false;
        p.respawnAt = p.gold ? Infinity : t + 1.1;
        this.score += p.gold ? GOLD_VALUE : 1;
        eng.emit({ type: 'level', fx: p.gold ? 'gold' : 'pearl', pos: v3(p.x, 0.1, p.z), n: p.gold ? GOLD_VALUE : 1 });
        continue;
      }
      if (!p.gold) normals++;
    }
    for (const p of this.pearls) {
      if (normals >= PEARLS_ON_FIELD) break;
      if (!p.alive && t >= p.respawnAt) {
        this.spawn(eng, p, false);
        normals++;
      }
    }
    if (this.elapsed >= this.nextGold) {
      const slot = this.pearls.find((p) => !p.alive);
      if (slot) {
        this.spawn(eng, slot, true);
        eng.emit({ type: 'level', fx: 'goldSpawn', pos: v3(slot.x, 0.1, slot.z) });
      }
      this.nextGold = this.elapsed + 4 + this.rand() * 2.5;
    }
    if (eng.phase === 'serve' && t >= this.feedAt) this.fire(eng);
    // 砲彈打到人（或背上那袋珍珠）：拍子擋到的不算
    const b = eng.ball.pos;
    if (eng.phase === 'rally' && eng.rally.lastTeam === 1) {
      if (b.y < 1.9 && !(h.dive && !h.dive.landed) && Math.hypot(b.x - h.pos.x, b.z - h.pos.z) < BAG_RADIUS) eng.levelEndRally(1, 'bodyHit', 0);
      // 落地後彈過去了：閃掉了，下一發
      else if (this.bouncedAt >= 0 && t - this.bouncedAt > 0.4) eng.levelEndRally(1, 'winner', null);
    }
  }

  /**
   * 發球機開砲：多半瞄準你正要去撿的那顆珍珠（看落點、抓時機再衝過去），
   * 不然就瞄準你「等一下會在的地方」。
   */
  private fire(eng: GameEngine) {
    const h = eng.human;
    const r = this.rand;
    const from = this.feedFrom!;
    this.feeds += 1;
    const lob = r() < 0.4;
    const flight = lob ? 1.5 : 0.8;
    const lead = (lob ? 0.85 : 1) * flight;
    const sp = Math.hypot(h.vel.x, h.vel.z);
    let goal: Pearl | null = null;
    if (sp > 1 && r() < 0.75) {
      let bd = 3.2;
      for (const p of this.pearls) {
        if (!p.alive) continue;
        const dx = p.x - h.pos.x;
        const dz = p.z - h.pos.z;
        const d = Math.hypot(dx, dz);
        if (d < bd && (dx * h.vel.x + dz * h.vel.z) / (d * sp + 1e-6) > 0.6) {
          bd = d;
          goal = p;
        }
      }
    }
    const noise = (k: number) => (r() - 0.5) * k;
    const aim = goal
      ? v3(goal.x + noise(0.3), 0, goal.z + noise(0.3))
      : v3(clamp(h.pos.x + h.vel.x * lead + noise(0.45), -W - 0.5, W + 0.5), 0, clamp(h.pos.z + h.vel.z * lead + noise(0.45), 0.8, L + 1.5));
    if (lob) {
      // 砲彈：高高落下，落點就是你（身體擋到就算被打中）
      const sol = solveByApex(from, aim, 3.4 + r() * 0.9, 0);
      eng.feed(from, sol.vel, sol.spin);
    } else {
      // 平射：瞄準身後一點的地面，經過你身邊時大約在腰的高度
      const dx = aim.x - from.x;
      const dz = aim.z - from.z;
      const d = Math.hypot(dx, dz);
      const ground = v3(aim.x + (dx / d) * 1.6, 0, aim.z + (dz / d) * 1.6);
      const sol = solveBySpeed(from, ground, 15 + r() * 3, 30);
      eng.feed(from, sol.vel, sol.spin);
    }
  }

  bounce(eng: GameEngine, pos: V3) {
    if (eng.rally.lastTeam === 1 && pos.z > 0 && this.bouncedAt < 0) this.bouncedAt = eng.time;
    // 打回去了：落在對面就算成功，不用等第二次落地
    if (eng.rally.lastTeam !== 0 || pos.z > 0) return false;
    this.score += 2;
    eng.emit({ type: 'level', fx: 'returned', pos: clone(pos), n: 2 });
    eng.levelEndRally(0, 'winner', null);
    return true;
  }

  rallyEnd(eng: GameEngine, _winner: Team, reason: PointReason, faultTeam: Team | null) {
    if (reason !== 'bodyHit' || faultTeam !== 0) return;
    const h = eng.human;
    this.hitAt = eng.time;
    h.knockedUntil = eng.time + 0.9;
    const lose = Math.min(DROP, this.score);
    this.score -= lose;
    // 掉出來的珍珠有幾顆散在旁邊，可以撿回來
    let k = 0;
    for (const p of this.pearls) {
      if (k >= Math.min(lose, DROP_BACK)) break;
      if (p.alive) continue;
      const a = this.rand() * Math.PI * 2;
      const d = 0.9 + this.rand() * 0.8;
      p.x = clamp(h.pos.x + Math.cos(a) * d, -W + 0.2, W - 0.2);
      p.z = clamp(h.pos.z + Math.sin(a) * d, 0.6, L - 0.1);
      p.gold = false;
      p.alive = true;
      p.bornAt = eng.time;
      p.until = Infinity;
      k++;
    }
    eng.emit({ type: 'level', fx: 'drop', pos: clone(h.pos), n: lose });
  }
}

// ───────────────────────────── Boss：颱風黑框 ─────────────────────────────

/** 黑框的程度：介於新手和球友之間，靠爆噴和天氣取勝 */
export const TYPHOON_BOSS: AIProfile = {
  ...AI_PROFILES.rookie,
  label: '颱風黑框',
  rating: 'BOSS',
  reaction: 0.3,
  maxSpeed: 4.0,
  skill: 1.55,
  timingSigma: 0.04,
  aggression: 0.5,
  outJudgement: 0.6,
  netRush: 0.7,
};

export const TYPHOON = {
  hp: 100,
  /** 贏一分的基本傷害＋每一拍來回加成（來回越長黑框越累） */
  base: 5,
  perHit: 1.1,
  maxHits: 12,
  /** 殺球、突擊、推擋得分的倍率 */
  attackMul: 1.5,
  /** 必殺、絕招、殺球命中就先扣一點 */
  specialChip: 10,
  skillChip: 6,
  smashChip: 3,
  /** 來回幾拍以上黑框開始喘 */
  tiredAt: 8,
  /** 風速（m/s）與換風向的間隔 */
  windMin: 3,
  windMax: 6.5,
  shiftEvery: [9, 13] as [number, number],
  warn: 2.6,
  ramp: 1.6,
} as const;

const PUDDLES: Puddle[] = [
  { x: -1.7, z: 3.4, r: 0.8 },
  { x: 2.0, z: 5.4, r: 0.65 },
  { x: 1.6, z: -3.1, r: 0.8 },
  { x: -1.9, z: -5.3, r: 0.65 },
];

/**
 * 海邊颱風天的 Boss 戰：強風把球吹偏（風向會變，換之前先警告）、場上有積水會打滑，
 * 黑框的爆噴一波充得特別快，噴完腳下還會多一灘水。Boss 血條制：贏一分扣血，
 * 來回越長扣越多，殺球、必殺命中額外扣；限時內打倒就過關，剩越多時間星越多。
 */
export class TyphoonLevel extends Level {
  readonly id = 'typhoon';
  readonly timeLimit = 165;
  /** 打倒時剩餘秒數的門檻 */
  readonly thresholds: [number, number, number] = [0, 45, 80];
  hp: number = TYPHOON.hp;
  wind = { x: 0, z: 0 };
  /** 目前風向的基準（不含陣風） */
  private from = { x: 0, z: 0 };
  private to = { x: 0, z: 0 };
  private shiftAt = 0;
  private rampStart = -99;
  private base = { x: 0, z: 0 };
  private warned = false;
  /** 下一個風向（警告時就決定，畫面可以先預告） */
  next = { x: 0, z: 0 };
  warnUntil = -1;
  koAt = -1;
  /** 剛被扣血（畫面閃一下） */
  hurtAt = -9;
  /** 最近一次打雷（畫面閃電） */
  thunderAt = -9;
  private nextThunder = 6;

  constructor(rand?: () => number) {
    super(rand);
    this.pause = null;
  }

  init(eng: GameEngine) {
    eng.puddles = PUDDLES.map((p) => ({ ...p }));
    eng.skillRecharge = 2;
    eng.aiSkillChance = 0.7;
    const boss = eng.athletes[1];
    if (boss.ai) boss.ai.profile = TYPHOON_BOSS;
    this.to = this.pickWind();
    this.from = { ...this.to };
    this.base = { ...this.to };
    this.wind = { ...this.to };
    this.shiftAt = this.nextShift();
    eng.ball.wind = this.wind;
  }

  setup(eng: GameEngine) {
    eng.puddles = eng.puddles.filter((p) => !p.temp);
    eng.ball.wind = this.wind;
  }

  private pickWind() {
    // 颱風天的風多半橫著吹（側風最難打）；偶爾順風、逆風
    const a = this.rand() < 0.65 ? (this.rand() < 0.5 ? 0 : Math.PI) + (this.rand() - 0.5) * 0.9 : this.rand() * Math.PI * 2;
    const m = TYPHOON.windMin + this.rand() * (TYPHOON.windMax - TYPHOON.windMin);
    return { x: Math.cos(a) * m, z: Math.sin(a) * m };
  }

  private nextShift() {
    const [a, b] = TYPHOON.shiftEvery;
    return this.elapsed + a + this.rand() * (b - a);
  }

  step(eng: GameEngine, dt: number) {
    super.step(eng, dt);
    if (this.done) return;
    const e = this.elapsed;
    if (!this.warned && e >= this.shiftAt - TYPHOON.warn) {
      this.warned = true;
      this.next = this.pickWind();
      this.warnUntil = e + TYPHOON.warn;
      eng.emit({ type: 'level', fx: 'windWarn' });
    }
    if (this.warned && e >= this.shiftAt) {
      this.warned = false;
      this.from = { ...this.base };
      this.to = this.next;
      this.rampStart = e;
      this.shiftAt = this.nextShift();
      eng.emit({ type: 'level', fx: 'wind' });
    }
    if (e >= this.nextThunder) {
      this.thunderAt = eng.time;
      this.nextThunder = e + 8 + this.rand() * 9;
      eng.emit({ type: 'level', fx: 'thunder' });
    }
    // 換風向是平滑轉過去的（預測軌跡才不會突然全錯），再疊上陣風
    const k = clamp((e - this.rampStart) / TYPHOON.ramp, 0, 1);
    const gust = 1 + 0.15 * Math.sin(e * 1.7) + 0.08 * Math.sin(e * 4.3 + 1);
    this.base.x = this.from.x + (this.to.x - this.from.x) * k;
    this.base.z = this.from.z + (this.to.z - this.from.z) * k;
    this.wind.x = this.base.x * gust;
    this.wind.z = this.base.z * gust;
  }

  stars() {
    if (!this.cleared) return 0;
    const left = this.timeLeft;
    return this.thresholds.filter((t) => left >= t).length;
  }

  private damage(eng: GameEngine, n: number) {
    if (this.done || n <= 0) return;
    this.hp = Math.max(0, this.hp - n);
    this.hurtAt = eng.time;
    eng.emit({ type: 'level', fx: 'damage', n: Math.round(n), pos: clone(eng.athletes[1].pos) });
    if (this.hp <= 0) {
      this.done = true;
      this.cleared = true;
      this.koAt = eng.time;
      this.score = Math.ceil(this.timeLeft);
      eng.slowMo(1.6);
      eng.emit({ type: 'level', fx: 'ko', pos: clone(eng.athletes[1].pos) });
    }
  }

  hit(eng: GameEngine, a: Athlete, info: LevelHitInfo) {
    if (a.team === 0) {
      if (info.special) this.damage(eng, TYPHOON.specialChip);
      else if (info.skill) this.damage(eng, TYPHOON.skillChip);
      else if (info.kind === 'smash') this.damage(eng, TYPHOON.smashChip);
    } else if (info.skill === 'splash') {
      // 爆噴一波：你腳下多一灘水（這一分結束才乾）
      const h = eng.human;
      eng.puddles.push({ x: h.pos.x, z: h.pos.z, r: 0.85, temp: true });
    }
  }

  rallyEnd(eng: GameEngine, winner: Team, _reason: PointReason, _faultTeam: Team | null, hits: number) {
    if (winner !== 0) return;
    const last = eng.rally.lastKindByTeam[0];
    const attack = last === 'smash' || last === 'speedup' || last === 'punch';
    const n = (TYPHOON.base + TYPHOON.perHit * Math.min(TYPHOON.maxHits, hits)) * (attack ? TYPHOON.attackMul : 1);
    if (hits >= TYPHOON.tiredAt) eng.emit({ type: 'level', fx: 'tired', n: hits });
    this.damage(eng, n);
  }

  hud(): LevelHud {
    const base = super.hud();
    const warn = this.elapsed < this.warnUntil;
    const r1 = (n: number) => Math.round(n * 2) / 2;
    return {
      ...base,
      score: Math.ceil(this.timeLeft),
      stars: this.cleared ? this.stars() : 0,
      hp: Math.ceil(this.hp),
      wind: { x: r1(this.wind.x), z: r1(this.wind.z), warn, next: warn ? { x: r1(this.next.x), z: r1(this.next.z) } : null },
    };
  }
}

export const createLevel = (id: LevelId, rand?: () => number): Level =>
  id === 'cups' ? new CupsLevel(rand) : id === 'pearls' ? new PearlsLevel(rand) : new TyphoonLevel(rand);
