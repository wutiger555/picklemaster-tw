import { BALL, COURT, NET_TOTAL_HALF_WIDTH, PHYSICS_DT, PLAYER, netHeightAt } from './constants';
import { type BallState, type PathSample, createBall, isInCourt, predictPath, stepBall } from './ball';
import {
  type Perturb,
  type ShotButton,
  type ShotKind,
  type ShotPlan,
  type ShotRequest,
  type AttackKind,
  ATTACK_SLACK,
  SERVE_DEPTH,
  SHOT_LABEL,
  attackKind,
  classifyShot,
  planShot,
  planSkill,
  planSpecial,
  previewTarget,
  sampleShotError,
  solveByApex,
} from './shots';
import { type PaddleSpec, type SpecialId, ENERGY, PADDLES, SPECIALS, paddleById } from './paddles';
import { type SkillId, SKILLS, SKILL_RECHARGE_POINTS } from './skills';
import {
  type CourtLine,
  type FaultReason,
  type MatchScore,
  type Team,
  FAULT_INFO,
  awardRally,
  feetInKitchen,
  judgeServe,
  lineMargin,
  newMatch,
  other,
  scoreCall,
  servePositions,
  serveFromRight,
  teamSide,
} from './rules';
import { type AIProfile, type AIState, type Difficulty, AI_PROFILES, chooseShot, createAI, homePosition, planContact, steer } from './ai';
import { type V3, v3, clamp, clone, gauss, len } from './vec';

export type GameMode = 'match' | 'dink';
/**
 * 擊球操作：
 * - auto：瑪利歐網球式，提早按下擊球鍵就定案，球到最佳擊球點自動揮拍，越早按蓄力越飽（預設）
 * - timing：按住蓄力、自己抓時機放開（進階）
 */
export type Controls = 'auto' | 'timing';
export type Phase = 'serve' | 'rally' | 'dead' | 'over';

/** 每一幀從鍵盤或觸控收集的輸入。moveY 正值 = 往網前 */
export interface InputState {
  moveX: number;
  moveY: number;
  held: ShotButton | null;
  /** 必殺鍵（按下的那一幀觸發「蓄勢」） */
  special?: boolean;
  /** 絕招鍵（同上） */
  skill?: boolean;
}

export interface SwingState {
  state: 'idle' | 'charging' | 'swinging';
  button: ShotButton | 'serve';
  t0: number;
  charge: number;
  swingStart: number;
  contactAt: number;
  done: boolean;
  /** 揮拍當下預測的軌跡，用來判定時機早晚 */
  path: PathSample[] | null;
  pathT0: number;
  pathBounces0: number;
  /** 新手輔助：自動對準時機時的固定品質 */
  assistQ: number | null;
  aimX: number;
  aimDepth: number;
  forehand: number;
  /** 反射擋球（球快打到身上時自動擋） */
  reflex?: boolean;
  /** 自動揮拍（auto 操作）：品質由蓄力時間決定 */
  auto?: boolean;
}

export interface Athlete {
  id: number;
  team: Team;
  pos: V3;
  vel: V3;
  swing: SwingState;
  kitchenLockUntil: number;
  ai: AIState | null;
  paddle: PaddleSpec;
  /** 必殺能量 0..100 */
  energy: number;
  /** 已蓄勢：下一拍放出必殺 */
  armed: boolean;
  /** 被必殺球震退，期間不能控制 */
  knockedUntil: number;
  /** 天雷跳殺的騰空時間（給動畫用） */
  jumpUntil: number;
  /** 最近一次得分慶祝／懊惱（給動畫用） */
  mood: { won: boolean; at: number } | null;
  /** 角色絕招（沒有就是 null） */
  skill: SkillId | null;
  /** 絕招可以用了 */
  skillReady: boolean;
  /** 絕招已就緒：下一拍放出 */
  skillArmed: boolean;
  /** 用掉絕招時是第幾分（充能用） */
  skillUsedAt: number;
  /** 最近一次放絕招的時間（給動畫與特效用） */
  skillAt: number;
  /** 被噴水：腳下打滑，跑不快 */
  slipUntil: number;
  /** 上一個物理步的位置（畫面內插用） */
  prevPos: V3;
}

/**
 * 給玩家看的擊球導引：該站哪裡、球會在哪裡、什麼時候打。
 * 用和 AI 同一套規劃算出來（Virtua Tennis／Mario Tennis 的站位提示）。
 */
export interface HumanGuide {
  stand: { x: number; z: number };
  contact: V3;
  contactT: number;
  /** 這球會出界：讓它過、別被打到 */
  leave: boolean;
  /** 球從擊出到最佳擊球點的總時間（計時圈用） */
  span: number;
  /**
   * 依玩家「目前位置」算出的最佳擊球時間：和時機判定用的是同一個值，
   * 計時圈照它縮，變金色時放開才一定是完美。
   */
  hitT: number;
  /** 目前位置打得到這球（打不到時計時圈變紅：先跑過去） */
  reachable: boolean;
}

export interface RallyState {
  hits: number;
  lastTeam: Team | null;
  lastHitTime: number;
  bouncesSinceHit: number;
  serveTargetSign: number;
  lastKindByTeam: [ShotKind | null, ShotKind | null];
  /** 這一拍是從球柱外側繞過去的（ATP） */
  atp: boolean;
  /** 連續互 dink 的拍數（越長越考驗耐心：AI 會越來越急、越容易把球吊高） */
  dinkChain: number;
}

export interface TeamStats {
  winners: number;
  errors: number;
  aces: number;
  kitchenFaults: number;
  perfect: number;
  shots: number;
}

export type PointReason = FaultReason | 'winner' | 'ace' | 'notInKitchen';

export type GameEvent =
  | {
      type: 'hit';
      team: Team;
      kind: ShotKind;
      label: string;
      quality: number | null;
      speed: number;
      pos: V3;
      special: SpecialId | null;
      skill: SkillId | null;
      /** 連續完美擊球數（玩家） */
      streak: number;
    }
  | { type: 'special'; team: Team; id: SpecialId }
  | { type: 'skill'; team: Team; id: SkillId }
  | { type: 'skillReady'; team: Team }
  | { type: 'closeCall'; challenger: Team; calledIn: boolean }
  | { type: 'reviewStart'; team: Team }
  | { type: 'reviewVerdict'; team: Team; overturned: boolean }
  | { type: 'counter'; team: Team; id: SpecialId }
  | { type: 'blown'; team: Team; id: SpecialId }
  | { type: 'energyFull'; team: Team }
  | { type: 'whiff'; team: Team }
  | { type: 'swing'; team: Team; button: ShotButton | 'serve' }
  | { type: 'bounce'; pos: V3; speed: number; special: SpecialId | null }
  | { type: 'net'; pos: V3 }
  | { type: 'cord'; pos: V3 }
  | {
      type: 'point';
      winner: Team;
      reason: PointReason;
      faultTeam: Team | null;
      title: string;
      lesson: string | null;
      call: string;
      sideOut: boolean;
      rallyHits: number;
    }
  | { type: 'highlight'; text: string }
  /** 機會球出現（每顆來球只發一次，給音效與震動） */
  | { type: 'chance'; kind: AttackKind }
  | { type: 'serveReady'; serving: Team; call: string; fromRight: boolean }
  | { type: 'dinkCount'; n: number }
  | { type: 'gameOver'; winner: Team | null };

export interface HudState {
  phase: Phase;
  mode: GameMode;
  score: [number, number];
  serving: Team;
  call: string;
  fromRight: boolean;
  servePower: number | null;
  charge: number | null;
  specials: boolean;
  /** 雙方能量（0..100） */
  energy: [number, number];
  armed: boolean;
  special: SpecialId;
  oppSpecial: SpecialId;
  /** 玩家的角色絕招 */
  skill: SkillId | null;
  skillReady: boolean;
  skillArmed: boolean;
  rallyHits: number;
  dinkStreak: number;
  inKitchen: boolean;
  kitchenLocked: boolean;
  winner: Team | null;
  /** 蓄力中這一拍會打出的球路 */
  aimKind: ShotKind | null;
  /** 機會球：這一球按抽球鍵會打出的進攻球路 */
  chance: AttackKind | null;
  /** 雙方剩下的電視輔助判決次數 */
  challenges: [number, number];
  /** 電視輔助判決進行中 */
  review: {
    state: 'offer' | 'reviewing';
    angle: ReviewAngle;
    mine: boolean;
    /** 申請方剩幾次 */
    left: number;
    /** offer 剩幾秒 */
    countdown: number;
    calledIn: boolean;
    line: CourtLine;
    /** 揭曉判決後才有 */
    verdict: { overturned: boolean; truthIn: boolean; marginCm: number } | null;
  } | null;
}

/** 壓線球的現場判決（司線員可能誤判，可以申請電視輔助判決） */
export interface LineCall {
  pos: V3;
  /** 球心離判定邊界多遠（公尺，正 = 界內） */
  margin: number;
  line: CourtLine;
  truthIn: boolean;
  calledIn: boolean;
  hitter: Team;
  serve: boolean;
  /** 落地時間（重播定位用） */
  t: number;
  /** 落地當下的總拍數：之後有人回擊，這個判決就不影響得分了 */
  hits: number;
  /** 實際出界時的犯規原因 */
  truthReason: PointReason | null;
}

export interface ReviewState {
  /** offer：問要不要申請（背景播落地慢動作）；reviewing：多角度重播 */
  state: 'offer' | 'reviewing';
  challenger: Team;
  call: LineCall;
  /** 原判決的結果，判決確定後才計分 */
  pending: { winner: Team; reason: PointReason; faultTeam: Team | null };
  start: number;
  deadline: number;
  samples: { t: number; pos: V3 }[];
  overturned: boolean;
  revealed: boolean;
}

export type ReviewAngle = 'mini' | 'broadcast' | 'line' | 'hawk';

/** 每人每局可申請的電視輔助判決次數（判決推翻就不扣，MLB 規則） */
export const CHALLENGES = 2;
/** 離線多近算壓線球（公尺），越近司線員越容易看錯 */
const CLOSE_CALL = 0.15;
const MISCALL_MAX = 0.38;
/** 玩家考慮要不要申請的時間（秒） */
const REVIEW_OFFER = 7;
/** 多角度重播各段的時間點（秒） */
const REVIEW_ANGLE2 = 2.4;
const REVIEW_HAWK = 4.8;
const REVIEW_REVEAL = 6.4;
const REVIEW_END = 8.6;
/** 判決結束後球停在落點 */
const BALL_REST_Y = BALL.radius;
/** 發球被（誤）判出界時，依最近的線決定犯規種類 */
const SERVE_FAULT_BY_LINE: Record<CourtLine, FaultReason> = {
  kitchen: 'serveShort',
  center: 'serveWide',
  side: 'serveLong',
  base: 'serveLong',
};

const SWING_TOTAL = PLAYER.swingWindup + PLAYER.swingFollow;
/** 理想擊球點：身體前方 0.3 m、側邊 0.55 m */
const IDEAL_FWD = 0.3;
const IDEAL_LAT = 0.55;
const POINT_PAUSE = 2.1;
/** 擊球輔助自動抓時機的品質：「漂亮」等級，關掉輔助自己抓到「完美」才打得更穩 */
const ASSIST_QUALITY = 0.78;
/** auto 操作：按下到擊球超過這麼久就是「蓄滿」 */
export const AUTO_CHARGE = 0.75;
/** 被噴水打滑時的移動速度倍率 */
const SLIP_MOVE = 0.6;
/** auto 操作：擊球前多久開始揮拍（揮拍動作要有前揮的時間） */
const AUTO_LEAD = 0.14;
/** 發球：放開按鍵後前揮多久才擊球 */
const SERVE_LEAD = 0.14;
/** auto 操作：蓄力中移動稍慢（提早按的代價） */
const AUTO_CHARGE_MOVE = 0.88;
/** 完美破解必殺球需要的時機品質 */
const COUNTER_QUALITY = 0.86;
/** AI 累積能量的速度（依程度） */
const AI_ENERGY_RATE: Record<Difficulty, number> = { rookie: 0.4, club: 0.55, pro: 0.75 };
/** 擊球判定的寬容度（遊戲常見的「放大打擊區」）：手動 +10 cm、輔助 +22 cm */
const REACH_BONUS = { manual: 0.1, assist: 0.22 };
const ACTIVE_EARLY = 0.05;
const ACTIVE_LATE = 0.07;
/** 按抽球鍵時，擊球點每高 1 m 的偏好（換算成「站位偏差」公尺） */
const ATTACK_HIGH = 0.4;
/** 用來算玩家導引的規劃參數：零反應、完全判斷得出出界球 */
const GUIDE_PROFILE: AIProfile = {
  label: 'guide',
  rating: '',
  reaction: 0,
  maxSpeed: PLAYER.maxSpeed,
  skill: 1,
  timingSigma: 0,
  aggression: 0,
  dropRate: 0,
  lobRate: 0,
  outJudgement: 1,
  netRush: 1,
  serveSigma: 0,
};

const idleSwing = (): SwingState => ({
  state: 'idle',
  button: 'drive',
  t0: 0,
  charge: 0,
  swingStart: -10,
  contactAt: 0,
  done: true,
  path: null,
  pathT0: 0,
  pathBounces0: 0,
  assistQ: null,
  aimX: 0,
  aimDepth: 0,
  forehand: 1,
});

/** 發球力道條：0→1→0 來回擺盪，時機抓準才發得深又不出界 */
const powerAt = (t: number) => {
  const p = (t * 0.85) % 2;
  return p < 1 ? p : 2 - p;
};

export class GameEngine {
  time = 0;
  readonly mode: GameMode;
  readonly difficulty: Difficulty;
  readonly controls: Controls;
  assist: boolean;
  ball: BallState = createBall();
  athletes: Athlete[];
  match: MatchScore = newMatch();
  rally: RallyState = this.freshRally();
  phase: Phase = 'serve';
  phaseUntil = 0;
  dinkStreak = 0;
  /** 是否啟用必殺技（寫實模式關閉） */
  readonly specials: boolean;
  /** 真實時間（秒），慢動作與頓幀都用它計時 */
  real = 0;
  /** 目前的時間倍率（給畫面做演出用） */
  timeScale = 1;
  /** 正在播放的必殺切入演出 */
  cinematic: { team: Team; id: SpecialId; start: number } | null = null;
  /** 電視輔助判決 */
  review: ReviewState | null = null;
  challenges: [number, number] = [CHALLENGES, CHALLENGES];
  private lastCall: LineCall | null = null;
  /** 最近 3.5 秒的球路（重播用） */
  private ballHistory: { t: number; pos: V3 }[] = [];
  /** 目前在飛的是絕招球（球的軌跡特效用），下一拍或下一分清掉 */
  skillShot: { team: Team; id: SkillId } | null = null;
  /** 玩家的擊球導引（球朝玩家飛來時才有） */
  guide: HumanGuide | null = null;
  /** 機會球提示：這一球按抽球鍵會打出殺球／推擋截擊／突擊 */
  chance: AttackKind | null = null;
  /** 已經為哪一顆來球（對手擊球時間）發過機會球事件 */
  private chanceCalled = -1;
  /** 玩家連續完美擊球 */
  perfectStreak = 0;
  /** 畫面內插：上一個物理步的球位置與內插比例 */
  prevBall: V3 = v3();
  alpha = 1;
  private freezeUntil = 0;
  private slowUntil = 0;
  private hitStopUntil = 0;
  stats: [TeamStats, TeamStats] = [this.freshStats(), this.freshStats()];
  longestRally = 0;
  /** 新手輔助：預測的落地點 */
  landingMarker: V3 | null = null;

  private events: GameEvent[] = [];
  private acc = 0;
  private prevHeld: ShotButton | null = null;
  private pendingServe: { power: number; aimX: number } | null = null;
  private prevSpecial = false;
  private prevSkill = false;
  /** AI 對哪一顆來球擲過絕招骰子（athlete id → 對手擊球時間） */
  private skillRolled = new Map<number, number>();
  /** 已經開打幾分（絕招充能用） */
  private pointsPlayed = 0;
  private input: InputState = { moveX: 0, moveY: 0, held: null };
  private humanPath: PathSample[] = [];
  private humanPathT0 = 0;
  private humanPathBounces0 = 0;
  private humanPathAt = -1;
  private rand: () => number;

  constructor(opts: {
    mode: GameMode;
    difficulty: Difficulty;
    assist: boolean;
    controls?: Controls;
    specials?: boolean;
    /** [玩家, 對手] 的球拍 id；對手沒指定就隨機挑一支不同的 */
    paddles?: [string, string?];
    rand?: () => number;
  }) {
    this.mode = opts.mode;
    this.difficulty = opts.difficulty;
    this.assist = opts.assist;
    this.controls = opts.controls ?? 'auto';
    this.specials = opts.specials ?? true;
    this.rand = opts.rand ?? Math.random;
    const mine = paddleById(opts.paddles?.[0] ?? PADDLES[0].id);
    const others = PADDLES.filter((p) => p.id !== mine.id);
    const theirs = opts.paddles?.[1] ? paddleById(opts.paddles[1]) : others[Math.floor(this.rand() * others.length)];
    const athlete = (id: number, team: Team, z: number, paddle: PaddleSpec, ai: AIState | null): Athlete => ({
      id,
      team,
      pos: v3(0, 0, z),
      vel: v3(),
      swing: idleSwing(),
      kitchenLockUntil: 0,
      ai,
      paddle,
      energy: 0,
      armed: false,
      knockedUntil: 0,
      jumpUntil: 0,
      mood: null,
      skill: null,
      skillReady: true,
      skillArmed: false,
      skillUsedAt: 0,
      skillAt: -99,
      slipUntil: 0,
      prevPos: v3(0, 0, z),
    });
    // 預留雙打：athletes 陣列可以放四人，規則與 AI 都以 team 為單位
    this.athletes = [athlete(0, 0, 6, mine, null), athlete(1, 1, -6, theirs, createAI(opts.difficulty))];
    this.setupPoint();
  }

  get human() {
    return this.athletes[0];
  }

  opponentOf(a: Athlete) {
    return this.athletes.find((o) => o.team !== a.team)!;
  }

  drainEvents() {
    const e = this.events;
    this.events = [];
    return e;
  }

  private freshRally(): RallyState {
    return {
      hits: 0,
      lastTeam: null,
      lastHitTime: 0,
      bouncesSinceHit: 0,
      serveTargetSign: 1,
      lastKindByTeam: [null, null],
      atp: false,
      dinkChain: 0,
    };
  }

  private freshStats(): TeamStats {
    return { winners: 0, errors: 0, aces: 0, kitchenFaults: 0, perfect: 0, shots: 0 };
  }

  private emit(e: GameEvent) {
    this.events.push(e);
  }

  // ───────────────────────────── 每一分的開始 ─────────────────────────────

  private setupPoint() {
    this.rally = this.freshRally();
    this.phase = 'serve';
    this.landingMarker = null;
    this.pendingServe = null;
    this.pointsPlayed += 1;
    this.lastCall = null;
    this.ballHistory = [];
    this.skillShot = null;
    for (const a of this.athletes) {
      a.vel = v3();
      a.swing = idleSwing();
      a.kitchenLockUntil = 0;
      a.knockedUntil = 0;
      a.slipUntil = 0;
      if (a.skill && !a.skillReady && this.pointsPlayed - a.skillUsedAt >= SKILL_RECHARGE_POINTS) {
        a.skillReady = true;
        this.emit({ type: 'skillReady', team: a.team });
      }
      if (a.ai) {
        a.ai.plan = null;
        a.ai.serveAt = this.time + (this.mode === 'dink' ? 0.9 : 1.4);
      }
    }
    if (this.mode === 'dink') {
      this.human.pos = v3(0.5, 0, COURT.kitchen + 0.35);
      this.athletes[1].pos = v3(0, 0, -(COURT.kitchen + 0.35));
      this.match.serving = 1;
    } else {
      const sp = servePositions(this.match);
      this.rally.serveTargetSign = sp.targetSign;
      for (const a of this.athletes) {
        const p = a.team === this.match.serving ? sp.server : sp.receiver;
        a.pos = v3(p.x, 0, p.z);
      }
      this.emit({
        type: 'serveReady',
        serving: this.match.serving,
        call: scoreCall(this.match),
        fromRight: serveFromRight(this.match),
      });
    }
    this.holdBall();
    for (const a of this.athletes) a.prevPos = clone(a.pos);
    this.prevBall = clone(this.ball.pos);
    this.guide = null;
    this.chance = null;
  }

  /** 發球前球拿在發球者手上（腰部以下） */
  private holdBall() {
    const server = this.athletes.find((a) => a.team === this.match.serving)!;
    const s = teamSide(server.team);
    this.ball.pos = v3(server.pos.x + s * 0.3, 0.55, server.pos.z - s * 0.4);
    this.ball.vel = v3();
    this.ball.spin = v3();
    this.ball.special = null;
    this.ball.curve = null;
  }

  private serve(a: Athlete, power: number, aimX: number) {
    const feed = this.mode === 'dink';
    this.holdBall();
    const req: ShotRequest = {
      button: feed ? 'soft' : 'serve',
      charge: feed ? 0.3 : power,
      aimX,
      aimDepth: 0,
      contact: clone(this.ball.pos),
      incomingSpeed: 0,
      opponent: this.opponentOf(a).pos,
      serveSide: this.rally.serveTargetSign,
      paddle: { pace: 1, spin: a.paddle.mods.spin },
    };
    const skill = (a.ai ? a.ai.profile.skill * (feed ? 0.5 : 1) : 1) * a.paddle.mods.error;
    const err = sampleShotError(
      classifyShot(req),
      {
        quality: 1,
        timingOffset: 0,
        incomingSpeed: 0,
        contactHeight: this.ball.pos.y,
        stretch: 0.5,
        moveSpeed: 0,
        skill,
        zone: false,
        forehand: 1,
      },
      this.rand,
    );
    const plan = planShot(req, err);
    this.ball.vel = plan.vel;
    this.ball.spin = plan.spin;
    this.rally.hits = feed ? 3 : 1;
    this.rally.lastTeam = a.team;
    this.rally.lastHitTime = this.time;
    this.rally.bouncesSinceHit = 0;
    this.rally.lastKindByTeam[a.team] = plan.kind;
    this.phase = 'rally';
    a.swing = {
      ...idleSwing(),
      state: 'swinging',
      button: 'serve',
      swingStart: this.time - PLAYER.swingWindup,
      contactAt: this.time,
      done: true,
      forehand: 1,
    };
    this.emit({ type: 'swing', team: a.team, button: 'serve' });
    this.emit({
      type: 'hit',
      team: a.team,
      kind: plan.kind,
      label: SHOT_LABEL[plan.kind],
      quality: null,
      speed: plan.speed,
      pos: clone(this.ball.pos),
      special: null,
      skill: null,
      streak: 0,
    });
  }

  // ───────────────────────────── 主迴圈 ─────────────────────────────

  update(frameDt: number, input: InputState) {
    // 第一幀或分頁切回時 delta 可能是 0，AI 轉向會除以 0 產生 NaN
    if (!(frameDt > 0)) return;
    const realDt = Math.min(frameDt, 0.05);
    this.real += realDt;
    this.timeScale = this.computeTimeScale();
    const dt = realDt * this.timeScale;
    if (this.cinematic && this.real > this.slowUntil) this.cinematic = null;
    this.input = input;
    // 電視輔助判決中：比賽暫停，只跑重播
    if (this.review) {
      this.updateReview();
      return;
    }
    if (input.special && !this.prevSpecial) this.tryArm(this.human);
    this.prevSpecial = !!input.special;
    if (input.skill && !this.prevSkill) this.tryArmSkill(this.human);
    this.prevSkill = !!input.skill;
    for (const a of this.athletes) {
      if (a.swing.state === 'swinging' && this.time - a.swing.swingStart >= SWING_TOTAL) {
        a.swing = { ...idleSwing(), forehand: a.swing.forehand };
      }
    }
    this.handleHumanInput();
    for (const a of this.athletes) if (a.ai) this.thinkAI(a, dt);
    this.refreshHumanPath();

    this.acc += dt;
    while (this.acc >= PHYSICS_DT) {
      this.acc -= PHYSICS_DT;
      this.fixedStep(PHYSICS_DT);
    }
    this.alpha = this.acc / PHYSICS_DT;
  }

  private fixedStep(dt: number) {
    this.time += dt;
    this.prevBall.x = this.ball.pos.x;
    this.prevBall.y = this.ball.pos.y;
    this.prevBall.z = this.ball.pos.z;
    for (const a of this.athletes) {
      a.prevPos.x = a.pos.x;
      a.prevPos.z = a.pos.z;
    }
    this.moveAthletes(dt);

    if (this.phase === 'serve') {
      this.holdBall();
    } else {
      const prev = clone(this.ball.pos);
      const ev = stepBall(this.ball, dt);
      if (this.phase === 'rally') {
        const hist = this.ballHistory;
        hist.push({ t: this.time, pos: clone(this.ball.pos) });
        while (hist.length && hist[0].t < this.time - 3.5) hist.shift();
        if ((prev.z > 0) !== (this.ball.pos.z > 0) && Math.abs(this.ball.pos.x) > NET_TOTAL_HALF_WIDTH) {
          if (this.ball.pos.y < netHeightAt(NET_TOTAL_HALF_WIDTH) + 0.15) this.rally.atp = true;
        }
        if (ev) this.onBallEvent(ev.type, ev.pos, ev.type === 'bounce' ? ev.speed : 0);
        this.checkContacts();
        if (this.phase === 'rally') this.reflexBlock();
        this.checkBodyAndKitchen();
        this.checkRunaway();
      } else if (ev?.type === 'bounce' && ev.speed > 1.2) {
        this.emit({ type: 'bounce', pos: ev.pos, speed: ev.speed, special: null });
      }
    }

    if (this.phase === 'dead' && this.time >= this.phaseUntil) this.nextPoint();
  }

  // ───────────────────────────── 時間與必殺 ─────────────────────────────

  /**
   * 時間倍率：必殺切入時幾乎凍結 → 慢動作 → 正常；重擊時頓幀；
   * 必殺球飛向玩家時進入子彈時間，給玩家抓「完美破解」的機會。
   */
  private computeTimeScale() {
    if (this.real < this.freezeUntil) return 0.03;
    if (this.real < this.hitStopUntil) return 0.05;
    if (this.real < this.slowUntil) return 0.35;
    const b = this.ball;
    const h = this.human;
    if (
      this.phase === 'rally' &&
      b.special &&
      !h.ai &&
      this.rally.lastTeam !== h.team &&
      Math.sign(b.pos.z) === teamSide(h.team) &&
      Math.hypot(b.pos.x - h.pos.x, b.pos.z - h.pos.z) < 3.2
    ) {
      return 0.45;
    }
    return 1;
  }

  /** 能量滿了按必殺鍵：進入蓄勢，下一拍放出必殺 */
  tryArm(a: Athlete) {
    if (!this.specials || a.armed || a.energy < ENERGY.max) return false;
    a.armed = true;
    // 必殺和絕招不能同一拍一起放：後按的取代先按的
    a.skillArmed = false;
    return true;
  }

  /** 絕招就緒：下一拍放出（熱血模式才有） */
  tryArmSkill(a: Athlete) {
    if (!this.specials || !a.skill || !a.skillReady || a.skillArmed) return false;
    a.skillArmed = true;
    a.armed = false;
    return true;
  }

  /** 設定雙方的角色絕招（選角之後由畫面層告訴引擎） */
  setSkills(skills: [SkillId | null, SkillId | null]) {
    this.athletes.forEach((a, i) => {
      a.skill = skills[i] ?? null;
      a.skillReady = !!a.skill;
      a.skillArmed = false;
    });
  }

  private gainEnergy(a: Athlete, amount: number) {
    if (!this.specials) return;
    const rate = a.ai ? AI_ENERGY_RATE[this.difficulty] : 1;
    const before = a.energy;
    a.energy = Math.min(ENERGY.max, a.energy + amount * rate);
    if (before < ENERGY.max && a.energy >= ENERGY.max) this.emit({ type: 'energyFull', team: a.team });
  }

  // ───────────────────────────── 移動 ─────────────────────────────

  /** 玩家：加速度模型，不是瞬間移動 */
  private steerHuman(h: Athlete, dt: number) {
    if (this.time < h.knockedUntil) {
      // 被震退：只會被慣性帶著滑
      h.vel.x *= Math.exp(-3 * dt);
      h.vel.z *= Math.exp(-3 * dt);
      return;
    }
    let wx = this.input.moveX;
    let wz = -this.input.moveY * teamSide(h.team);
    // 磁吸跑位：輔助模式自動跑到導引站位（推搖桿可以蓋過）；手動模式按住擊球鍵時輕推一把
    const user = Math.hypot(wx, wz);
    const target = this.autoTarget(h);
    if (target) {
      const dx = target.x - h.pos.x;
      const dz = target.z - h.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.05) {
        const want = Math.min(1, d / 0.55);
        const ax = (dx / d) * want;
        const az = (dz / d) * want;
        if (this.assist) {
          const k = user < 0.15 ? 1 : 0.35;
          wx = wx * (1 - k) + ax * k;
          wz = wz * (1 - k) + az * k;
        } else if ((this.input.held || h.swing.state === 'charging') && this.guide) {
          wx += ax * 0.45;
          wz += az * 0.45;
        }
      }
    }
    const m = Math.hypot(wx, wz);
    if (m > 1) {
      wx /= m;
      wz /= m;
    }
    const slow =
      (h.swing.state === 'swinging' && this.time - h.swing.swingStart < SWING_TOTAL
        ? PLAYER.swingMoveFactor
        : this.controls === 'auto' && h.swing.state === 'charging'
          ? AUTO_CHARGE_MOVE
          : 1) * (this.time < h.slipUntil ? SLIP_MOVE : 1);
    const maxV = PLAYER.maxSpeed * slow;
    const tx = wx * maxV;
    const tz = wz * maxV;
    const rate = m > 0.05 ? PLAYER.accel : PLAYER.decel;
    const dvx = tx - h.vel.x;
    const dvz = tz - h.vel.z;
    const dv = Math.hypot(dvx, dvz);
    const step = rate * dt;
    if (dv <= step) {
      h.vel.x = tx;
      h.vel.z = tz;
    } else {
      h.vel.x += (dvx / dv) * step;
      h.vel.z += (dvz / dv) * step;
    }
  }

  private moveAthletes(dt: number) {
    if (!this.human.ai) this.steerHuman(this.human, dt);
    for (const a of this.athletes) {
      a.pos.x += a.vel.x * dt;
      a.pos.z += a.vel.z * dt;
      const s = teamSide(a.team);
      const serving = this.phase === 'serve' && this.mode === 'match' && a.team === this.match.serving;
      if (serving) {
        // 發球時雙腳要在底線後、中線與邊線延伸線之間
        const dir = s * (serveFromRight(this.match) ? 1 : -1);
        const x1 = 0.15 * dir;
        const x2 = (COURT.halfWidth - 0.2) * dir;
        a.pos.x = clamp(a.pos.x, Math.min(x1, x2), Math.max(x1, x2));
        a.pos.z = s * (COURT.halfLength + 0.35);
        a.vel.z = 0;
      }
      const zMin = 0.32;
      const zMax = COURT.halfLength + 3;
      const sz = clamp(a.pos.z * s, zMin, zMax);
      if (sz !== a.pos.z * s) a.vel.z = 0;
      a.pos.z = sz * s;
      const xm = COURT.halfWidth + 2.4;
      if (Math.abs(a.pos.x) > xm) {
        a.pos.x = Math.sign(a.pos.x) * xm;
        a.vel.x = 0;
      }
    }
  }

  // ───────────────────────────── 玩家輸入 ─────────────────────────────

  private handleHumanInput() {
    const h = this.human;
    if (h.ai) return;
    const held = this.input.held;
    const pressed = held && held !== this.prevHeld;
    const released = this.prevHeld && held !== this.prevHeld;
    const sw = h.swing;

    if (this.phase === 'serve' && this.match.serving === h.team && this.mode === 'match') {
      if (pressed && sw.state === 'idle') {
        h.swing = { ...idleSwing(), state: 'charging', button: 'serve', t0: this.time };
      } else if (released && sw.state === 'charging' && sw.button === 'serve') {
        // 放開後先前揮，SERVE_LEAD 秒後才擊球（力道與方向在放開那一刻決定）
        this.pendingServe = { power: powerAt(this.time - sw.t0), aimX: this.input.moveX };
        const at = this.time + SERVE_LEAD;
        h.swing = { ...idleSwing(), state: 'swinging', button: 'serve', swingStart: at - PLAYER.swingWindup, contactAt: at, forehand: 1 };
      } else if (this.pendingServe && sw.state === 'swinging' && this.time >= sw.contactAt) {
        this.serve(h, this.pendingServe.power, this.pendingServe.aimX);
        this.pendingServe = null;
      }
      this.prevHeld = held;
      return;
    }

    if (this.phase === 'rally' && this.controls === 'auto') {
      // 提早按下就定案（再按別的鍵可以換球路），球到最佳擊球點時自動揮拍
      if (pressed && h.swing.state === 'idle') h.swing = { ...idleSwing(), state: 'charging', button: held!, t0: this.time };
      else if (pressed && h.swing.state === 'charging') h.swing.button = held!;
      const c = h.swing;
      if (c.state === 'charging') {
        c.charge = Math.min(1, (this.time - c.t0) / AUTO_CHARGE);
        const best = this.bestContact(h, this.humanPath, this.humanPathT0, this.humanPathBounces0, this.time, this.time + 0.5, undefined, this.attacking(h));
        if (best && best.t - this.time <= AUTO_LEAD) {
          this.startSwing(h, best.t, 0.6 + 0.4 * Math.min(1, (best.t - c.t0) / AUTO_CHARGE));
          h.swing.auto = true;
        }
      }
    } else if (this.phase === 'rally') {
      const cur = h.swing;
      if (pressed && cur.state === 'idle') {
        h.swing = { ...idleSwing(), state: 'charging', button: held!, t0: this.time };
      } else if (cur.state === 'charging') {
        cur.charge = Math.min(1, (this.time - cur.t0) / 0.6);
        if (released) {
          const best = this.assist
            ? this.bestContact(h, this.humanPath, this.humanPathT0, this.humanPathBounces0, this.time + PLAYER.swingWindup, this.time + 0.7, undefined, this.attacking(h))
            : null;
          this.startSwing(h, best ? best.t : this.time + PLAYER.swingWindup, best ? ASSIST_QUALITY : null);
        } else if (this.assist) {
          // 新手輔助：按住不放，球到最佳擊球點時自動揮拍
          const best = this.bestContact(h, this.humanPath, this.humanPathT0, this.humanPathBounces0, this.time, this.time + 0.5, undefined, this.attacking(h));
          if (best && best.t - this.time <= PLAYER.swingWindup) this.startSwing(h, best.t, ASSIST_QUALITY);
        }
      }
    } else if (h.swing.state === 'charging') {
      h.swing = idleSwing();
    }
    this.prevHeld = held;
  }

  private startSwing(
    a: Athlete,
    contactAt: number,
    assistQ: number | null,
    pre?: { path: PathSample[]; pathT0: number; pathBounces0: number },
  ) {
    const sw = a.swing;
    const p = pre?.path ?? predictPath(this.ball, 1.4, PHYSICS_DT);
    a.swing = {
      ...sw,
      state: 'swinging',
      swingStart: contactAt - PLAYER.swingWindup,
      contactAt,
      done: false,
      path: p,
      pathT0: pre?.pathT0 ?? this.time,
      pathBounces0: pre?.pathBounces0 ?? this.rally.bouncesSinceHit,
      assistQ,
      aimX: a.ai ? 0 : this.input.moveX,
      aimDepth: a.ai ? 0 : this.input.moveY,
      forehand: (this.ball.pos.x - a.pos.x) * teamSide(a.team) >= 0 ? 1 : -1,
    };
    this.emit({ type: 'swing', team: a.team, button: sw.button });
  }

  private refreshHumanPath() {
    if (this.phase !== 'rally') {
      this.landingMarker = null;
      this.guide = null;
      this.chance = null;
      return;
    }
    if (this.time - this.humanPathAt < 0.05) return;
    this.humanPathAt = this.time;
    this.humanPathT0 = this.time;
    this.humanPathBounces0 = this.rally.bouncesSinceHit;
    this.humanPath = predictPath(this.ball, 2.0, PHYSICS_DT);
    this.refreshGuide();
    this.landingMarker = null;
    if (this.rally.lastTeam !== this.human.team && this.rally.bouncesSinceHit === 0) {
      for (const s of this.humanPath) {
        if (s.bounces >= 1) {
          if (Math.sign(s.pos.z) === teamSide(this.human.team)) this.landingMarker = v3(s.pos.x, 0, s.pos.z);
          break;
        }
      }
    }
  }

  /** 磁吸跑位的目標：有導引就去導引站位；輔助模式下球飛走時自動回到好位置 */
  private autoTarget(h: Athlete): { x: number; z: number } | null {
    if (this.phase !== 'rally') return null;
    if (this.guide) return this.guide.stand;
    if (!this.assist || this.rally.lastTeam !== h.team) return null;
    const s = teamSide(h.team);
    const servingBack = this.match.serving === h.team && this.rally.hits <= 2 && this.mode === 'match';
    return {
      x: clamp(this.ball.pos.x * 0.4, -2, 2),
      z: s * (servingBack ? COURT.halfLength - 0.1 : COURT.kitchen + 0.4),
    };
  }

  /** 更新玩家導引：用 AI 的規劃算站位與擊球點 */
  private refreshGuide() {
    const h = this.human;
    if (h.ai || this.phase !== 'rally' || this.rally.lastTeam === h.team) {
      this.guide = null;
      this.chance = null;
      return;
    }
    const prev = this.guide && this.guide.contactT > this.time ? this.guide.contactT : undefined;
    const plan = planContact(this, h, () => 0, GUIDE_PROFILE, prev);
    if (!plan) {
      this.guide = null;
      this.chance = null;
      return;
    }
    // 截擊得站在廚房外，雙彈跳規則期間也不能截擊
    const canVolley = !(this.rally.hits <= 2 && this.mode === 'match');
    this.chance = !plan.leave && plan.feasible && (!plan.volley || canVolley) ? attackKind(v3(plan.contact.x, plan.contact.y, plan.contact.z), plan.volley) : null;
    if (this.chance && this.chanceCalled !== this.rally.lastHitTime) {
      this.chanceCalled = this.rally.lastHitTime;
      this.emit({ type: 'chance', kind: this.chance });
    }
    const span = this.guide && this.guide.contactT > this.time ? this.guide.span : Math.max(0.3, plan.contactT - this.rally.lastHitTime);
    const near = plan.leave
      ? null
      : this.bestContact(h, this.humanPath, this.humanPathT0, this.humanPathBounces0, plan.contactT - 0.35, plan.contactT + 0.35, undefined, this.attacking(h));
    this.guide = {
      stand: plan.stand,
      contact: v3(plan.contact.x, plan.contact.y, plan.contact.z),
      contactT: plan.contactT,
      leave: plan.leave,
      span,
      hitT: near ? near.t : plan.contactT,
      reachable: !!near,
    };
  }

  /** 玩家按的是抽球鍵（想進攻）：自動揮拍選高的擊球點 */
  private attacking(a: Athlete) {
    if (a.ai) return false;
    return (a.swing.state === 'idle' ? this.input.held : a.swing.button) === 'drive';
  }

  /** 球相對選手的位置：forward = 往網方向、lateral = 選手右手邊為正 */
  private relative(a: Athlete, p: V3) {
    const s = teamSide(a.team);
    return { f: (a.pos.z - p.z) * s, l: (p.x - a.pos.x) * s };
  }

  private reachOf(a: Athlete) {
    const bonus = a.ai ? 0 : this.assist ? REACH_BONUS.assist : REACH_BONUS.manual;
    return PLAYER.reach + a.paddle.mods.reach + bonus;
  }

  private contactCost(a: Athlete, p: V3, attack = false) {
    const { f, l } = this.relative(a, p);
    const reach = Math.hypot(f, l);
    if (reach > this.reachOf(a) || p.y < PLAYER.minContactHeight || p.y > PLAYER.maxContactHeight) return Infinity;
    const hPen = p.y < 0.25 ? (0.25 - p.y) * 1.5 : p.y > 1.7 ? (p.y - 1.7) * 0.6 : 0;
    // 按抽球鍵＝想進攻：寧可在高點出手（殺高球、截擊、彈到最高點時突擊），不要等球掉下來
    const high = attack ? clamp(p.y - 0.5, 0, 1.4) * ATTACK_HIGH : 0;
    return Math.hypot(f - IDEAL_FWD, Math.abs(l) - IDEAL_LAT) + hPen - high;
  }

  /**
   * 在預測軌跡中找出最佳擊球時間（同一個落地段內）。
   * b0 = 建立軌跡當下球已落地幾次；軌跡裡的落地數從那時起算。
   */
  private bestContact(
    a: Athlete,
    path: PathSample[],
    t0: number,
    b0: number,
    tMin: number,
    tMax: number,
    bounceSeg?: number,
    attack = false,
  ) {
    if (this.rally.lastTeam === a.team) return null;
    const s = teamSide(a.team);
    let best: { t: number; cost: number; pos: V3; volley: boolean } | null = null;
    for (const smp of path) {
      const t = t0 + smp.t;
      if (t < tMin || t > tMax) continue;
      if (b0 + smp.bounces > 1) break;
      if (bounceSeg !== undefined && smp.bounces !== bounceSeg) continue;
      if (Math.sign(smp.pos.z) !== s) continue;
      const c = this.contactCost(a, smp.pos, attack);
      if (c < (best?.cost ?? Infinity)) best = { t, cost: c, pos: smp.pos, volley: b0 + smp.bounces === 0 };
    }
    return best;
  }

  // ───────────────────────────── 擊球 ─────────────────────────────

  /**
   * 揮拍的「有效判定幀」：觸球點前 0.05 秒到後 0.07 秒內，球一進入打擊範圍就算打到
   * （格鬥與運動遊戲的 active frames）。時機好壞仍照偏差計算品質，只是不會差一點就整個揮空。
   */
  private checkContacts() {
    for (const a of this.athletes) {
      const sw = a.swing;
      if (sw.state !== 'swinging' || sw.done || this.time < sw.contactAt - ACTIVE_EARLY) continue;
      const now = this.hittable(a);
      if (this.time < sw.contactAt) {
        // 還沒到預定觸球時間：只有「現在打得到、等一下就跑出範圍」才提早救球
        if (!now || this.hittableAt(a, sw.contactAt - this.time)) continue;
      } else if (!now && this.time < sw.contactAt + ACTIVE_LATE) continue;
      sw.done = true;
      this.resolveContact(a);
      if (this.phase !== 'rally') return;
    }
  }

  /** 用目前速度線性外插 dt 秒後的球，看那時還打不打得到（判定幀只有幾十毫秒，外插夠準） */
  private hittableAt(a: Athlete, dt: number) {
    const b = this.ball;
    const p = v3(b.pos.x + b.vel.x * dt, b.pos.y + b.vel.y * dt, b.pos.z + b.vel.z * dt);
    if (Math.sign(p.z) !== teamSide(a.team)) return false;
    const { f, l } = this.relative(a, p);
    return Math.hypot(f, l) <= this.reachOf(a) && p.y >= PLAYER.minContactHeight && p.y <= PLAYER.maxContactHeight;
  }

  private hittable(a: Athlete) {
    const b = this.ball.pos;
    if (this.rally.lastTeam === a.team || Math.sign(b.z) !== teamSide(a.team)) return false;
    const { f, l } = this.relative(a, b);
    return Math.hypot(f, l) <= this.reachOf(a) && b.y >= PLAYER.minContactHeight && b.y <= PLAYER.maxContactHeight;
  }

  /**
   * 反射擋球：快球已經到身邊、玩家卻沒有揮拍時，自動把拍子擋上去。
   * 擋回去的是軟弱的高球（容易被攻擊），只是避免「莫名其妙被打到」的挫折。
   * 出界球、雙彈跳規則要求等落地的球、站在廚房裡截擊都不會觸發。
   */
  private reflexBlock() {
    const h = this.human;
    if (h.ai || this.rally.lastTeam === h.team) return;
    if (h.swing.state === 'swinging' && !h.swing.done) return;
    const b = this.ball;
    const s = teamSide(h.team);
    if (Math.sign(b.pos.z) !== s || b.vel.z * s <= 0) return;
    if (this.guide?.leave) return;
    const volley = this.rally.bouncesSinceHit === 0;
    if (volley && ((this.rally.hits <= 2 && this.mode === 'match') || feetInKitchen(h.pos))) return;
    const { f, l } = this.relative(h, b.pos);
    if (f > 0.12 || Math.hypot(f, l) > this.reachOf(h)) return;
    if (b.pos.y < PLAYER.minContactHeight || b.pos.y > 1.9) return;
    h.swing = {
      ...idleSwing(),
      state: 'swinging',
      button: 'soft',
      charge: 0.2,
      swingStart: this.time - PLAYER.swingWindup,
      contactAt: this.time,
      done: true,
      assistQ: 0.45,
      forehand: l >= 0 ? 1 : -1,
      reflex: true,
    };
    this.resolveContact(h);
  }

  private resolveContact(a: Athlete) {
    const b = this.ball;
    const s = teamSide(a.team);
    const sw = a.swing;
    if (this.rally.lastTeam === a.team || Math.sign(b.pos.z) !== s) {
      this.emit({ type: 'whiff', team: a.team });
      return;
    }
    const { f, l } = this.relative(a, b.pos);
    const dist = Math.hypot(f, l);
    if (dist > this.reachOf(a) || b.pos.y < PLAYER.minContactHeight || b.pos.y > PLAYER.maxContactHeight) {
      this.emit({ type: 'whiff', team: a.team });
      return;
    }

    // 時機判定：和「這個落地段內最佳擊球時間」比較
    let quality: number;
    let offset = 0;
    if (sw.assistQ !== null) quality = sw.assistQ;
    else {
      const seg = this.rally.bouncesSinceHit - sw.pathBounces0;
      const best = sw.path
        ? this.bestContact(a, sw.path, sw.pathT0, sw.pathBounces0, sw.pathT0, sw.pathT0 + 2.4, seg, this.attacking(a))
        : null;
      offset = best ? this.time - best.t : PLAYER.swingWindup;
      quality = clamp(1 - (Math.abs(offset) - 0.02) / 0.13, 0, 1);
    }

    const volley = this.rally.bouncesSinceHit === 0;
    if (volley && this.rally.hits <= 2 && this.mode === 'match') {
      this.endRally(other(a.team), 'twoBounce', a.team);
      return;
    }
    if (volley && feetInKitchen(a.pos)) {
      this.endRally(other(a.team), 'kitchenVolley', a.team);
      return;
    }

    const shot = a.ai
      ? chooseShot(this, a, this.rand)
      : { button: sw.button as ShotButton, charge: sw.charge, aimX: sw.aimX, aimDepth: sw.aimDepth };
    const incoming = len(b.vel);
    const incomingSpecial = b.special ? b.special.id : null;
    const req: ShotRequest = {
      button: shot.button,
      charge: shot.charge,
      aimX: shot.aimX,
      aimDepth: shot.aimDepth,
      contact: clone(b.pos),
      incomingSpeed: incoming,
      opponent: this.opponentOf(a).pos,
      paddle: { pace: a.paddle.mods.pace, spin: a.paddle.mods.spin },
      volley,
      slack: a.ai ? 0 : ATTACK_SLACK,
    };
    const kind0 = classifyShot(req);
    // 接殺球／突擊：球又快又往下壓，防守方很難回得穩
    const incomingKind = this.rally.lastKindByTeam[other(a.team)];
    const underAttack = incomingKind === 'smash' ? 1 : incomingKind === 'speedup' ? 0.6 : 0;

    // AI 決定要不要放必殺（能量滿、時機合適）
    if (a.ai && this.specials && !a.armed && a.energy >= ENERGY.max && this.aiWantsSpecial(a)) a.armed = true;
    const fire: SpecialId | null = a.armed && this.specials ? a.paddle.special : null;
    // 角色絕招（和必殺不同時放；AI 在規劃擊球時已經決定）
    const skill: SkillId | null = !fire && a.skillArmed && this.specials ? a.skill : null;
    this.skillShot = null;

    // 接必殺球：時機完美就破解，否則被震退、只能撈出高球
    let countered = false;
    let blown = false;
    let pressure = 1;
    let popUp = 0;
    if (incomingSpecial) {
      if (quality >= COUNTER_QUALITY) countered = true;
      else {
        pressure = 2.2;
        popUp = 0.35 + (1 - quality) * 0.5;
        blown = (incomingSpecial === 'inferno' || incomingSpecial === 'thunder') && quality < 0.45;
      }
    }

    const errKind = fire ? (fire === 'phantom' ? 'dink' : 'drive') : skill === 'squatSmash' || skill === 'spinSmash' ? 'drive' : classifyShot(req);
    // 旋轉強的拍子打抽球、高吊、殺球時更容易把球壓進場內（上旋的作用）
    const spinControl = errKind === 'drive' || errKind === 'smash' || errKind === 'lob' ? 1 / (1 + (a.paddle.mods.spin - 1) * 0.6) : 1;
    const err: Perturb = sampleShotError(
      errKind,
      {
        quality,
        timingOffset: offset,
        incomingSpeed: incomingSpecial ? Math.min(incoming, 14) : incoming,
        contactHeight: b.pos.y,
        stretch: dist / this.reachOf(a),
        moveSpeed: Math.hypot(a.vel.x, a.vel.z),
        skill:
          (a.ai ? a.ai.profile.skill : 1) *
          a.paddle.mods.error *
          spinControl *
          pressure *
          (1 + underAttack * 1.4) *
          // 互 dink 太久，AI 開始沉不住氣：dink 越來越不穩、容易吊高給人突擊
          (a.ai && kind0 === 'dink' ? 1 + Math.max(0, this.rally.dinkChain - 3) * 0.07 : 1),
        zone: !!fire || !!skill,
        forehand: l >= 0 ? 1 : -1,
      },
      this.rand,
    );
    err.arc += popUp;
    err.depth += popUp * 1.2;
    let plan: ShotPlan = fire ? planSpecial(fire, req, err) : ((skill && planSkill(skill, req, err)) ?? planShot(req, err));
    // 被逼急的軟球／截擊會被打飛：時機差、伸長手勉強碰到、硬接重球時，球軟軟地飄高到中場 → 對方的殺球機會
    let popped = false;
    if (!fire && !incomingSpecial && (kind0 === 'dink' || kind0 === 'drop' || kind0 === 'block' || kind0 === 'punch' || underAttack > 0)) {
      const stretch = dist / this.reachOf(a);
      let p = Math.max(0, 0.6 - quality) * 0.9 + Math.max(0, stretch - 0.85) * 1.5 + underAttack * 0.25;
      if (kind0 !== 'block') p += Math.max(0, incoming - 13) * 0.03;
      if (a.ai && kind0 === 'dink') p += Math.max(0, this.rally.dinkChain - 4) * 0.015;
      p *= a.ai ? a.ai.profile.skill / 1.4 : 0.8;
      if (this.rand() < Math.min(0.45, p)) {
        popped = true;
        const target = v3(b.pos.x + (this.rand() - 0.5) * 2, 0, -s * (2.4 + this.rand() * 1.8));
        const sol = solveByApex(b.pos, target, Math.max(2.3, b.pos.y + 0.9) + this.rand() * 0.7, 0);
        plan = { kind: plan.kind, target, vel: sol.vel, spin: sol.spin, speed: len(sol.vel), flightTime: sol.time };
      }
    }
    if (blown) {
      // 拍子被震飛：球軟軟地彈起，多半過不了網
      const toward = -s;
      plan = { ...plan, vel: v3((this.rand() - 0.5) * 2, 3 + this.rand() * 2.5, toward * (1.5 + this.rand() * 2)), spin: v3() };
      plan.speed = len(plan.vel);
    }
    b.vel = plan.vel;
    b.spin = plan.spin;
    b.special = fire
      ? {
          id: fire,
          target: clone(plan.target),
          t: 0,
          period: Math.max(0.4, plan.flightTime),
          sway: this.rand() < 0.5 ? 1 : -1,
          perp: (() => {
            const hs = Math.hypot(plan.vel.x, plan.vel.z) || 1;
            return { x: -plan.vel.z / hs, z: plan.vel.x / hs };
          })(),
          spent: false,
        }
      : null;
    b.curve = null;
    if (skill === 'dualCurve') {
      // 曲球：側向先往一邊飄、再往另一邊，落地時回到原本的落點
      const hs = Math.hypot(plan.vel.x, plan.vel.z) || 1;
      const perp = { x: -plan.vel.z / hs, z: plan.vel.x / hs };
      const omega = (2 * Math.PI) / Math.max(0.5, plan.flightTime);
      const amp = (this.rand() < 0.5 ? 1 : -1) * 1.1;
      b.vel.x += perp.x * amp * omega;
      b.vel.z += perp.z * amp * omega;
      b.curve = { t: 0, amp, omega, perp };
    }

    const r = this.rally;
    r.hits += 1;
    r.lastTeam = a.team;
    r.lastHitTime = this.time;
    r.bouncesSinceHit = 0;
    r.lastKindByTeam[a.team] = plan.kind;
    r.atp = false;
    r.dinkChain = plan.kind === 'dink' && !popped ? r.dinkChain + 1 : 0;
    if (this.mode === 'match' && (r.dinkChain === 6 || r.dinkChain === 10)) {
      this.emit({ type: 'highlight', text: r.dinkChain === 6 ? `Dink 對決 ×${r.dinkChain}：比耐心！` : `Dink ×${r.dinkChain}！誰先沉不住氣？` });
    }
    if (volley) a.kitchenLockUntil = this.time + 0.6;
    if (a.ai) a.ai.plan = null;

    const st = this.stats[a.team];
    st.shots += 1;
    if (quality >= 0.9) st.perfect += 1;

    // 能量：完美、漂亮擊球與長來回累積；放必殺會清空
    if (fire) {
      a.energy = 0;
      a.armed = false;
      if (fire === 'thunder') a.jumpUntil = this.time + 0.55;
      this.cinematic = { team: a.team, id: fire, start: this.real };
      this.freezeUntil = this.real + 0.85;
      this.slowUntil = this.real + 1.45;
      this.emit({ type: 'special', team: a.team, id: fire });
    } else if (skill) {
      a.skillArmed = false;
      a.skillReady = false;
      a.skillUsedAt = this.pointsPlayed;
      a.skillAt = this.time;
      if (skill === 'splash') {
        // 水花噴到對手腳下：嚇一跳愣住一下，接著打滑跑不快
        const opp = this.opponentOf(a);
        opp.knockedUntil = this.time + 0.3;
        opp.slipUntil = this.time + 1.1;
      }
      this.freezeUntil = this.real + 0.45;
      this.slowUntil = this.real + 0.9;
      this.emit({ type: 'skill', team: a.team, id: skill });
      this.skillShot = { team: a.team, id: skill };
    } else {
      this.gainEnergy(a, quality >= 0.9 ? ENERGY.perfect : quality >= 0.65 ? ENERGY.good : 0);
      if (r.hits > 8) this.gainEnergy(a, ENERGY.longRally);
    }
    if (incomingSpecial) {
      if (countered) {
        this.gainEnergy(a, ENERGY.counter);
        this.hitStopUntil = this.real + 0.18;
        this.emit({ type: 'counter', team: a.team, id: incomingSpecial });
        this.emit({ type: 'highlight', text: '完美破解！' });
      } else {
        // 被震退：往後滑一段
        a.vel.z += s * (blown ? 5 : 3.2);
        a.knockedUntil = this.time + (blown ? 0.8 : 0.45);
        if (blown) this.emit({ type: 'blown', team: a.team, id: incomingSpecial });
      }
    }
    // 頓幀：每一拍都停一下，球越快、擊球越完美停越久（打擊感的核心）
    if (!fire) {
      const power = clamp(plan.speed / 24, 0, 1);
      const stop = 0.03 + power * 0.045 + (quality >= 0.9 ? 0.035 : 0) + (plan.kind === 'smash' ? 0.05 : plan.kind === 'speedup' ? 0.025 : 0);
      this.hitStopUntil = Math.max(this.hitStopUntil, this.real + stop);
    }
    if (!a.ai) {
      if (quality >= 0.9 && (sw.assistQ === null || sw.auto)) {
        this.perfectStreak += 1;
        if (this.perfectStreak >= 2) this.gainEnergy(a, Math.min(12, this.perfectStreak * 3));
      } else this.perfectStreak = 0;
    }

    let label: string = fire ? SPECIALS[fire].name : skill ? SKILLS[skill].name : SHOT_LABEL[plan.kind];
    if (sw.reflex) label = '反射擋球';
    else if (!a.ai && !fire && !skill) {
      if (sw.auto) label = quality >= 0.9 ? `蓄滿 ${label}` : quality >= 0.75 ? label : `倉促 ${label}`;
      else if (sw.assistQ === null) {
        label =
          quality >= 0.9 ? `完美 ${label}` : quality >= 0.65 ? `漂亮 ${label}` : offset < 0 ? `太早 ${label}` : `太晚 ${label}`;
      }
    }
    if (popped) {
      label = '被打飛';
      this.emit({ type: 'highlight', text: a.ai ? '機會球！跳起來殺' : '球被打飛了！小心對方殺球' });
    }
    if (volley && Math.abs(a.pos.x) > COURT.halfWidth + 0.05 && Math.abs(a.pos.z) < COURT.kitchen + 0.6) {
      this.emit({ type: 'highlight', text: 'ERNE！繞過廚房的截擊' });
    }
    this.emit({
      type: 'hit',
      team: a.team,
      kind: plan.kind,
      label,
      quality,
      speed: plan.speed,
      pos: clone(b.pos),
      special: fire,
      skill,
      streak: a.ai ? 0 : this.perfectStreak,
    });
  }

  /** AI 判斷這一拍適不適合放絕招 */
  private aiWantsSkill(a: Athlete, h: number) {
    const chance = { rookie: 0.25, club: 0.35, pro: 0.45 }[this.difficulty];
    if (this.rand() > chance) return false;
    if (a.skill === 'squatSmash') return h < 1.2;
    if (a.skill === 'spinSmash') return h > 0.7;
    if (a.skill === 'dualCurve') return Math.abs(this.ball.pos.z) > COURT.kitchen + 0.5;
    return true;
  }

  /** AI 判斷這一拍適不適合放必殺 */
  private aiWantsSpecial(a: Athlete) {
    const id = a.paddle.special;
    const h = this.ball.pos.y;
    const depth = Math.abs(this.ball.pos.z);
    const chance = { rookie: 0.35, club: 0.55, pro: 0.75 }[this.difficulty];
    if (this.rand() > chance) return false;
    if (id === 'inferno') return h > 0.55;
    if (id === 'phantom') return depth < COURT.kitchen + 2;
    return true;
  }

  // ───────────────────────────── 判定 ─────────────────────────────

  private onBallEvent(type: 'bounce' | 'net' | 'cord', pos: V3, speed: number) {
    if (type !== 'bounce') {
      this.emit({ type, pos });
      return;
    }
    this.emit({ type: 'bounce', pos, speed, special: this.ball.special?.id ?? null });
    const r = this.rally;
    const hitter = r.lastTeam!;
    const side = Math.sign(pos.z);
    if (r.bouncesSinceHit === 0) {
      if (side === teamSide(hitter)) {
        this.endRally(other(hitter), 'net', hitter);
        return;
      }
      if (r.hits === 1 && this.mode === 'match') {
        const truth = judgeServe(pos, hitter, r.serveTargetSign);
        const call = this.lineCall(pos, hitter, r.serveTargetSign, truth);
        const fault = call && call.calledIn !== call.truthIn ? (call.calledIn ? null : SERVE_FAULT_BY_LINE[call.line]) : truth;
        if (fault) {
          this.endRally(other(hitter), fault, hitter);
          return;
        }
      } else {
        const truthIn = isInCourt(pos);
        const call = this.lineCall(pos, hitter, null, truthIn ? null : 'out');
        if (!(call ? call.calledIn : truthIn)) {
          this.endRally(other(hitter), 'out', hitter);
          return;
        }
      }
      r.bouncesSinceHit = 1;
      if (r.atp) this.emit({ type: 'highlight', text: 'ATP！繞柱球' });
      if (this.mode === 'dink' && hitter === this.human.team) {
        if (Math.abs(pos.z) <= COURT.kitchen) {
          this.dinkStreak += 1;
          this.emit({ type: 'dinkCount', n: this.dinkStreak });
        } else {
          this.endRally(other(hitter), 'notInKitchen', hitter);
        }
      }
      return;
    }
    // 第二次落地：接球方沒接到
    this.endRally(hitter, r.hits === 1 ? 'ace' : 'winner', null);
  }

  private checkBodyAndKitchen() {
    const b = this.ball.pos;
    for (const a of this.athletes) {
      const own = a.team === this.rally.lastTeam && this.time - this.rally.lastHitTime < 0.3;
      if (!own && b.y < 1.75 && Math.hypot(b.x - a.pos.x, b.z - a.pos.z) < PLAYER.bodyRadius - 0.06) {
        this.endRally(other(a.team), 'bodyHit', a.team);
        return;
      }
      if (this.time < a.kitchenLockUntil && feetInKitchen(a.pos)) {
        this.endRally(other(a.team), 'kitchenMomentum', a.team);
        return;
      }
    }
  }

  private checkRunaway() {
    const b = this.ball.pos;
    const r = this.rally;
    if (Math.abs(b.z) < 16 && Math.abs(b.x) < 11 && this.time - r.lastHitTime < 7) return;
    if (r.bouncesSinceHit === 0) this.endRally(other(r.lastTeam!), 'out', r.lastTeam!);
    else this.endRally(r.lastTeam!, 'winner', null);
  }

  /** 壓線落點的現場判決：離線很近時司線員可能看錯（越近越容易錯） */
  private lineCall(pos: V3, hitter: Team, serveTargetSign: number | null, truthReason: PointReason | null): LineCall | null {
    this.lastCall = null;
    if (this.mode !== 'match') return null;
    const { margin, line } = lineMargin(pos, serveTargetSign);
    if (Math.abs(margin) >= CLOSE_CALL) return null;
    const truthIn = truthReason === null;
    const wrong = this.rand() < MISCALL_MAX * (1 - Math.abs(margin) / CLOSE_CALL);
    this.lastCall = {
      pos: clone(pos),
      margin,
      line,
      truthIn,
      calledIn: wrong ? !truthIn : truthIn,
      hitter,
      serve: serveTargetSign !== null,
      t: this.time,
      hits: this.rally.hits,
      truthReason,
    };
    return this.lastCall;
  }

  /** 結束這一分：如果是被壓線判決決定的，先開放電視輔助判決，確定後才計分 */
  private endRally(winner: Team, reason: PointReason, faultTeam: Team | null) {
    if (this.phase !== 'rally') return;
    const c = this.lastCall;
    this.lastCall = null;
    const decided =
      c !== null &&
      c.hits === this.rally.hits &&
      (c.calledIn ? faultTeam === null && winner === c.hitter && (reason === 'winner' || reason === 'ace') : faultTeam === c.hitter);
    if (c && decided) {
      this.openReview(c, { winner, reason, faultTeam });
      return;
    }
    this.finishRally(winner, reason, faultTeam);
  }

  private openReview(call: LineCall, pending: ReviewState['pending']) {
    this.phase = 'dead';
    this.phaseUntil = Infinity;
    const challenger = call.calledIn ? other(call.hitter) : call.hitter;
    this.review = {
      state: 'offer',
      challenger,
      call,
      pending,
      start: this.real,
      deadline: this.real + REVIEW_OFFER,
      samples: this.ballHistory.map((s) => ({ t: s.t, pos: clone(s.pos) })),
      overturned: call.calledIn !== call.truthIn,
      revealed: false,
    };
    this.emit({ type: 'closeCall', challenger, calledIn: call.calledIn });
  }

  /** 玩家申請電視輔助判決 */
  requestReview() {
    const rv = this.review;
    if (!rv || rv.state !== 'offer' || this.athletes[rv.challenger].ai || this.challenges[rv.challenger] <= 0) return false;
    this.startReviewing();
    return true;
  }

  /** 玩家接受原判決 */
  declineReview() {
    const rv = this.review;
    if (!rv || rv.state !== 'offer' || this.athletes[rv.challenger].ai) return;
    this.closeReview(false);
  }

  private startReviewing() {
    const rv = this.review!;
    rv.state = 'reviewing';
    rv.start = this.real;
    this.emit({ type: 'reviewStart', team: rv.challenger });
  }

  private updateReview() {
    const rv = this.review!;
    const u = this.real - rv.start;
    const bt = rv.call.t;
    if (rv.state === 'offer') {
      // 背景循環播落地前後的慢動作
      this.showReplayBall(bt - 0.45 + ((u * 0.35) % 0.75));
      const ch = rv.challenger;
      if (this.challenges[ch] <= 0) {
        if (u > 2.2) this.closeReview(false);
      } else if (this.athletes[ch].ai) {
        if (u > 1.8) {
          // AI：看錯的球多半會申請；判對但很近的偶爾賭一把
          const wants = rv.overturned ? this.rand() < 0.75 : Math.abs(rv.call.margin) < 0.025 && this.rand() < 0.25;
          if (wants) this.startReviewing();
          else this.closeReview(false);
        }
      } else if (this.real > rv.deadline) this.closeReview(false);
      return;
    }
    if (u < REVIEW_ANGLE2) this.showReplayBall(bt - 1.5 + u * 0.65);
    else if (u < REVIEW_HAWK) this.showReplayBall(bt - 0.3 + (u - REVIEW_ANGLE2) * 0.22);
    // 鷹眼：球落下、彈走，留下球印（揭曉前就已經飛出畫面）
    else this.showReplayBall(bt - 0.3 + Math.min(0.55, (u - REVIEW_HAWK) * 0.35));
    if (!rv.revealed && u > REVIEW_REVEAL) {
      rv.revealed = true;
      this.emit({ type: 'reviewVerdict', team: rv.challenger, overturned: rv.overturned });
    }
    if (u > REVIEW_END) this.closeReview(true);
  }

  /** 重播：把球放到歷史軌跡上的某個時間點 */
  private showReplayBall(t: number) {
    const s = this.review!.samples;
    if (!s.length) return;
    let i = s.findIndex((x) => x.t >= t);
    if (i < 0) i = s.length - 1;
    const b = s[Math.max(0, i - 1)];
    const c = s[i];
    const k = c.t > b.t ? clamp((t - b.t) / (c.t - b.t), 0, 1) : 0;
    this.ball.pos = v3(b.pos.x + (c.pos.x - b.pos.x) * k, b.pos.y + (c.pos.y - b.pos.y) * k, b.pos.z + (c.pos.z - b.pos.z) * k);
    this.ball.vel = v3(c.pos.x - b.pos.x, c.pos.y - b.pos.y, c.pos.z - b.pos.z);
    this.prevBall.x = this.ball.pos.x;
    this.prevBall.y = this.ball.pos.y;
    this.prevBall.z = this.ball.pos.z;
    this.alpha = 1;
  }

  private closeReview(reviewed: boolean) {
    const rv = this.review!;
    this.review = null;
    this.ball.pos = v3(rv.call.pos.x, BALL_REST_Y, rv.call.pos.z);
    this.ball.vel = v3();
    let { winner, reason, faultTeam } = rv.pending;
    if (reviewed) {
      if (rv.overturned) {
        // 判決推翻：申請方保留次數
        if (rv.call.calledIn) {
          winner = other(rv.call.hitter);
          reason = rv.call.truthReason ?? 'out';
          faultTeam = rv.call.hitter;
        } else {
          winner = rv.call.hitter;
          reason = 'winner';
          faultTeam = null;
        }
      } else this.challenges[rv.challenger] -= 1;
    }
    this.phase = 'rally';
    this.finishRally(winner, reason, faultTeam);
  }

  /** 目前重播要用哪個鏡頭（給場景） */
  reviewView(): { angle: ReviewAngle; pos: V3; line: CourtLine; truthIn: boolean; revealed: boolean } | null {
    const rv = this.review;
    if (!rv) return null;
    const u = this.real - rv.start;
    const angle: ReviewAngle =
      rv.state === 'offer' ? 'mini' : u < REVIEW_ANGLE2 ? 'broadcast' : u < REVIEW_HAWK ? 'line' : 'hawk';
    return { angle, pos: rv.call.pos, line: rv.call.line, truthIn: rv.call.truthIn, revealed: rv.revealed };
  }

  private finishRally(winner: Team, reason: PointReason, faultTeam: Team | null) {
    if (this.phase !== 'rally') return;
    this.phase = 'dead';
    this.phaseUntil = this.time + POINT_PAUSE;
    const r = this.rally;
    this.longestRally = Math.max(this.longestRally, r.hits);

    if (faultTeam !== null) {
      this.stats[faultTeam].errors += 1;
      if (reason === 'kitchenVolley' || reason === 'kitchenMomentum') this.stats[faultTeam].kitchenFaults += 1;
    } else {
      this.stats[winner].winners += 1;
      if (reason === 'ace') this.stats[winner].aces += 1;
    }
    for (const a of this.athletes) {
      a.mood = { won: a.team === winner, at: this.time };
      if (a.team === winner && faultTeam === null) this.gainEnergy(a, ENERGY.winner);
    }

    let title: string;
    let lesson: string | null = null;
    if (reason === 'winner') title = '致勝球';
    else if (reason === 'ace') title = '發球得分 ACE';
    else if (reason === 'notInKitchen') {
      title = '沒落在廚房';
      lesson = 'Dink 要落在對方的非截擊區（廚房）裡，對方才只能從低點回擊。';
    } else {
      title = FAULT_INFO[reason].title;
      lesson = FAULT_INFO[reason].lesson;
    }

    let sideOut = false;
    if (this.mode === 'match') {
      sideOut = awardRally(this.match, winner).sideOut;
    } else if (faultTeam === this.human.team || winner !== this.human.team) {
      this.match.winner = 1;
    }
    if (r.hits >= 12) this.emit({ type: 'highlight', text: `${r.hits} 拍來回！` });
    this.emit({
      type: 'point',
      winner,
      reason,
      faultTeam,
      title,
      lesson,
      call: this.mode === 'match' ? scoreCall(this.match) : String(this.dinkStreak),
      sideOut,
      rallyHits: r.hits,
    });
  }

  private nextPoint() {
    if (this.match.winner !== null) {
      this.phase = 'over';
      this.emit({ type: 'gameOver', winner: this.match.winner });
      return;
    }
    this.setupPoint();
  }

  // ───────────────────────────── AI ─────────────────────────────

  private thinkAI(a: Athlete, dt: number) {
    const ai = a.ai!;
    if (this.phase === 'serve') {
      if (this.match.serving === a.team && this.time >= ai.serveAt) {
        const prof = ai.profile;
        // 目標深發（力道約 0.66，落點離網約 5.4 m），依程度加入誤差
        const power = clamp(0.66 + gauss(this.rand) * prof.serveSigma * 1.5, 0.05, 1);
        this.serve(a, power, (this.rand() - 0.5) * 1.2);
      }
      a.vel.x *= 0.8;
      a.vel.z *= 0.8;
      return;
    }
    if (this.phase !== 'rally') {
      steer(a, a.pos.x * 0.9, a.pos.z, 1.5, dt);
      return;
    }
    const coming = this.rally.lastTeam !== a.team;
    if (!coming) {
      ai.plan = null;
      const home = homePosition(this, a);
      steer(a, home.x, home.z, ai.profile.maxSpeed * 0.85, dt);
      return;
    }
    if (this.time < a.knockedUntil) {
      a.vel.x *= Math.exp(-3 * dt);
      a.vel.z *= Math.exp(-3 * dt);
      return;
    }
    // 幻影球看不出哪顆是真的：反應變慢；任何必殺球都比較難抓時機
    const sp = this.ball.special;
    const reaction = ai.profile.reaction + (sp?.id === 'phantom' ? 0.42 : 0);
    const reacted = this.time >= this.rally.lastHitTime + reaction;
    const plan = ai.plan;
    if (reacted && (!plan || (!plan.swung && this.time >= ai.replanAt && plan.contactT - this.time > 0.25))) {
      ai.plan = planContact(this, a, this.rand);
      if (ai.plan && sp) ai.plan.timingError *= 1.8;
      // 絕招：每一顆來球只考慮一次，提早決定（蹲下、起跳的動作才來得及）
      const p0 = ai.plan;
      if (p0 && !p0.leave && this.skillRolled.get(a.id) !== this.rally.lastHitTime) {
        this.skillRolled.set(a.id, this.rally.lastHitTime);
        if (this.specials && a.skill && a.skillReady && !a.skillArmed && !a.armed && this.aiWantsSkill(a, p0.contact.y)) a.skillArmed = true;
      }
      ai.replanAt = this.time + 0.15;
    }
    const p = ai.plan;
    if (!p) {
      if (!reacted) steer(a, a.pos.x, a.pos.z, 1, dt);
      return;
    }
    steer(a, p.stand.x, p.stand.z, ai.profile.maxSpeed * (this.time < a.slipUntil ? SLIP_MOVE : 1), dt);
    if (!p.leave && !p.swung && this.time >= p.contactT + p.timingError - PLAYER.swingWindup) {
      p.swung = true;
      this.startSwing(a, this.time + PLAYER.swingWindup, null, p);
    }
  }

  // ───────────────────────────── 給畫面用 ─────────────────────────────

  hud(): HudState {
    const h = this.human;
    const sw = h.swing;
    return {
      phase: this.phase,
      mode: this.mode,
      score: [this.match.score[0], this.match.score[1]],
      serving: this.match.serving,
      call: this.mode === 'match' ? scoreCall(this.match) : String(this.dinkStreak),
      fromRight: serveFromRight(this.match),
      servePower: sw.state === 'charging' && sw.button === 'serve' ? powerAt(this.time - sw.t0) : null,
      charge: sw.state === 'charging' && sw.button !== 'serve' ? sw.charge : null,
      specials: this.specials,
      energy: [this.athletes[0].energy, this.athletes[1].energy],
      armed: h.armed,
      special: h.paddle.special,
      oppSpecial: this.athletes[1].paddle.special,
      skill: h.skill,
      skillReady: h.skillReady,
      skillArmed: h.skillArmed,
      rallyHits: this.rally.hits,
      dinkStreak: this.dinkStreak,
      inKitchen: feetInKitchen(h.pos),
      kitchenLocked: this.time < h.kitchenLockUntil,
      winner: this.match.winner,
      aimKind: this.aimPreview()?.kind ?? null,
      chance: this.chance,
      challenges: [this.challenges[0], this.challenges[1]],
      review: this.reviewHud(),
    };
  }

  private reviewHud(): HudState['review'] {
    const rv = this.review;
    if (!rv) return null;
    const v = this.reviewView()!;
    return {
      state: rv.state,
      angle: v.angle,
      mine: rv.challenger === this.human.team,
      left: this.challenges[rv.challenger],
      countdown: Math.max(0, rv.deadline - this.real),
      calledIn: rv.call.calledIn,
      line: rv.call.line,
      verdict: rv.revealed ? { overturned: rv.overturned, truthIn: rv.call.truthIn, marginCm: Math.abs(rv.call.margin) * 100 } : null,
    };
  }

  /** 蓄力中：預覽這一拍會瞄向哪裡（不含誤差），讓玩家學會控制落點 */
  aimPreview(): { target: V3; kind: ShotKind } | null {
    const h = this.human;
    const sw = h.swing;
    if (sw.state !== 'charging') return null;
    const opponent = this.opponentOf(h).pos;
    if (sw.button === 'serve') {
      return previewTarget({
        button: 'serve',
        charge: powerAt(this.time - sw.t0),
        aimX: this.input.moveX,
        aimDepth: 0,
        contact: clone(this.ball.pos),
        incomingSpeed: 0,
        opponent,
        serveSide: this.rally.serveTargetSign,
      });
    }
    if (this.phase !== 'rally') return null;
    const s = teamSide(h.team);
    const best = this.bestContact(h, this.humanPath, this.humanPathT0, this.humanPathBounces0, this.time, this.time + 1.5, undefined, this.attacking(h));
    const contact = best ? best.pos : v3(h.pos.x + 0.5 * s, 0.8, h.pos.z - 0.3 * s);
    return previewTarget({
      button: sw.button,
      charge: sw.charge,
      aimX: this.input.moveX,
      aimDepth: this.input.moveY,
      contact,
      incomingSpeed: len(this.ball.vel),
      opponent,
      volley: !!best?.volley,
      slack: ATTACK_SLACK,
    });
  }

  /** 揮拍動畫進度 0..1（未揮拍為 -1） */
  swingProgress(a: Athlete) {
    if (a.swing.state !== 'swinging') return -1;
    const t = (this.time - a.swing.swingStart) / SWING_TOTAL;
    return t > 1 ? -1 : Math.max(0, t);
  }

  get aiProfile() {
    return AI_PROFILES[this.difficulty];
  }

  /** 發球力道條上「會進」的範圍，畫在 HUD 上 */
  static serveWindow() {
    const span = SERVE_DEPTH.max - SERVE_DEPTH.min;
    const lo = (COURT.kitchen + 0.1 - SERVE_DEPTH.min) / span;
    const hi = (COURT.halfLength - 0.1 - SERVE_DEPTH.min) / span;
    return { lo: clamp(lo, 0, 1), hi: clamp(hi, 0, 1) };
  }
}
