/**
 * 無頭模擬：讓引擎自己跟自己打（雙方都是 AI），不碰瀏覽器。
 * 亂數全部走有種子的 PRNG，同種子同結果，這是參考包能「對答案」的前提。
 */
import { GameEngine, type InputState, type GameEvent, type PointReason } from '../../src/components/game/engine/game';
import { AI_PROFILES, createAI, type Difficulty } from '../../src/components/game/engine/ai';
import { scoreCall, type Team } from '../../src/components/game/engine/rules';
import type { ShotKind } from '../../src/components/game/engine/shots';
import { CHARACTERS, characterById, traitsOf } from '../../src/components/game/characters';
import { NEUTRAL_TRAITS } from '../../src/components/game/engine/game';

/** mulberry32：32 位元種子的小型 PRNG，夠均勻、可重現 */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export interface SimOptions {
  seed: number;
  /** [玩家隊, 對手隊] 的 AI 程度 */
  difficulty: [Difficulty, Difficulty];
  doubles?: boolean;
  /** 熱血版（必殺＋絕招）或正規版 */
  specials?: boolean;
  /** athletes 順序的角色 id（單打 2 位、雙打 4 位）；沒給就是中性素質 */
  characters?: string[];
  paddles?: [string, string?, string?, string?];
  target?: number;
  /** 模擬的真實時間上限（秒），防呆 */
  maxSeconds?: number;
}

export interface PointRecord {
  i: number;
  winner: Team;
  reason: PointReason;
  faultTeam: Team | null;
  sideOut: boolean;
  rallyHits: number;
  /** 這一分裡每一拍的球路 */
  kinds: ShotKind[];
  /** 分數結算後的規則狀態 */
  after: { score: [number, number]; serving: Team; serverNumber: 1 | 2; rightPlayer: [number, number]; serverIdx: number; call: string };
}

export interface MatchResult {
  points: PointRecord[];
  winner: Team;
  score: [number, number];
  /** 模擬的比賽時間（秒） */
  seconds: number;
  longestRally: number;
}

const IDLE: InputState = { moveX: 0, moveY: 0, held: null };

export const simulateMatch = (o: SimOptions): MatchResult => {
  const rand = mulberry32(o.seed);
  const orig = Math.random;
  // 引擎內部都走 opts.rand，但 vec.gauss／shots 的預設參數是 Math.random，一併換掉才保險
  Math.random = rand;
  try {
    const e = new GameEngine({
      mode: 'match',
      difficulty: o.difficulty[1],
      assist: false,
      specials: o.specials ?? false,
      doubles: o.doubles,
      paddles: o.paddles ?? ['blaze', 'storm', 'mirage', 'glacier'],
      rand,
    });
    if (o.target) e.match.target = o.target;
    // 玩家那一隊也交給 AI
    e.athletes[0].ai = createAI(o.difficulty[0]);
    if (o.doubles) e.athletes[2].ai!.profile = AI_PROFILES[o.difficulty[0]];
    const chars = (o.characters ?? []).map((id) => characterById(id));
    e.setTraits(e.athletes.map((_, i) => (chars[i] ? traitsOf(chars[i]) : NEUTRAL_TRAITS)));
    if (o.specials) e.setSkills(e.athletes.map((_, i) => chars[i]?.skill ?? null));

    const points: PointRecord[] = [];
    let kinds: ShotKind[] = [];
    const maxSeconds = o.maxSeconds ?? 3600;
    const dt = 1 / 60;
    let real = 0;
    while (e.phase !== 'over' && real < maxSeconds) {
      e.update(dt, IDLE);
      real += dt;
      if (e.replay) e.skipReplay();
      for (const ev of e.drainEvents() as GameEvent[]) {
        if (ev.type === 'hit') kinds.push(ev.kind);
        else if (ev.type === 'point') {
          points.push({
            i: points.length,
            winner: ev.winner,
            reason: ev.reason,
            faultTeam: ev.faultTeam,
            sideOut: ev.sideOut,
            rallyHits: ev.rallyHits,
            kinds,
            after: {
              score: [e.match.score[0], e.match.score[1]],
              serving: e.match.serving,
              serverNumber: e.match.serverNumber,
              rightPlayer: [e.rightPlayer[0], e.rightPlayer[1]],
              serverIdx: e.serverIdx,
              call: scoreCall(e.match, e.doubles),
            },
          });
          kinds = [];
        }
      }
    }
    if (e.phase !== 'over') throw new Error(`seed ${o.seed}: 模擬 ${maxSeconds}s 還沒打完（${e.match.score.join('-')}）`);
    return { points, winner: e.match.winner!, score: [e.match.score[0], e.match.score[1]], seconds: e.time, longestRally: e.longestRally };
  } finally {
    Math.random = orig;
  }
};

export const CHARACTER_IDS = CHARACTERS.map((c) => c.id);
