import { COURT } from './constants';
import type { V3 } from './vec';

export type Team = 0 | 1;
/** 0 = 玩家隊（近端 z > 0）、1 = 對手隊（遠端 z < 0） */
export const teamSide = (team: Team) => (team === 0 ? 1 : -1);
export const other = (team: Team): Team => (team === 0 ? 1 : 0);

export type FaultReason =
  | 'out'
  | 'net'
  | 'serveShort'
  | 'serveWide'
  | 'serveLong'
  | 'twoBounce'
  | 'kitchenVolley'
  | 'kitchenMomentum'
  | 'bodyHit'
  | 'notReturned'
  | 'netTouch';

/** 每一種失分都對應一條真實規則，結束時給玩家看「為什麼」 */
export const FAULT_INFO: Record<FaultReason, { title: string; lesson: string }> = {
  out: { title: '出界', lesson: '球的落點完全在線外才算出界；壓到線都算界內。' },
  net: { title: '掛網', lesson: '球沒有越過球網。從網子以下的高度硬抽，過網餘裕會很小。' },
  serveShort: {
    title: '發球進廚房',
    lesson: '發球必須越過非截擊區（廚房），落在廚房線上也算失誤。',
  },
  serveWide: { title: '發球區錯誤', lesson: '發球要落在對角的發球區，打到另一邊的發球區就是失誤。' },
  serveLong: { title: '發球出界', lesson: '發球落在底線或邊線之外。' },
  twoBounce: {
    title: '雙彈跳規則',
    lesson: '發球與接發球都必須先落地一次才能擊球。第三拍之後才可以截擊（空中擊球）。',
  },
  kitchenVolley: {
    title: '廚房截擊違例',
    lesson: '截擊時腳不能踩在廚房內或廚房線上。退到線後再截擊，或讓球落地後再進廚房打。',
  },
  kitchenMomentum: {
    title: '慣性進廚房',
    lesson: '截擊後因為衝勢踩進廚房也算違例，即使球已經打出去了。',
  },
  bodyHit: { title: '被球打到', lesson: '球在落地前打到身體就失分，就算那顆球本來會出界。看到出界球要閃開。' },
  notReturned: { title: '沒接到', lesson: '球在同一邊落地兩次，這一分就結束了。' },
  netTouch: { title: '碰網', lesson: '比賽進行中，身體、衣服或球拍碰到球網（或網柱）就失分。衝上網截擊完要煞得住。' },
};

export interface MatchScore {
  score: [number, number];
  serving: Team;
  /** 單打：不需要 2 號發球員；雙打預留 */
  serverNumber: 1 | 2;
  winner: Team | null;
  /** 目標分數（11 分、須領先 2 分） */
  target: number;
}

export const newMatch = (target = 11): MatchScore => ({
  score: [0, 0],
  serving: 0,
  serverNumber: 1,
  winner: null,
  target,
});

/** 傳統換發球制：只有發球方能得分，接發方贏球則換發 */
export const awardRally = (m: MatchScore, rallyWinner: Team): { scored: boolean; sideOut: boolean } => {
  if (rallyWinner === m.serving) {
    m.score[rallyWinner] += 1;
    const [a, b] = m.score;
    const lead = Math.abs(a - b);
    if (Math.max(a, b) >= m.target && lead >= 2) m.winner = a > b ? 0 : 1;
    return { scored: true, sideOut: false };
  }
  m.serving = rallyWinner;
  return { scored: false, sideOut: true };
};

/** 報分：發球方分數 - 接發方分數（雙打再加第幾位發球員，例如 5-3-1） */
export const scoreCall = (m: MatchScore, doubles = false) =>
  `${m.score[m.serving]} - ${m.score[other(m.serving)]}${doubles ? ` - ${m.serverNumber}` : ''}`;

/** 單打發球位置：發球方分數為偶數從右區發、奇數從左區 */
export const serveFromRight = (m: MatchScore) => m.score[m.serving] % 2 === 0;

/** 各隊在發球時站的 x（以世界座標表示）。選手面向網子時的右手邊 = x 的正負號為 side */
export const servePositions = (m: MatchScore) => {
  const right = serveFromRight(m) ? 1 : -1;
  const sSide = teamSide(m.serving);
  const rSide = -sSide;
  return {
    server: { x: sSide * right * 1.1, z: sSide * (COURT.halfLength + 0.35) },
    receiver: { x: rSide * right * 1.5, z: rSide * (COURT.halfLength - 0.1) },
    /** 發球必須落在對角：x 的正負號 */
    targetSign: -sSide * right,
  };
};

/** 發球落點判定：越過廚房、落在對角發球區內（線上算界內，廚房線算短） */
export const judgeServe = (land: V3, servingTeam: Team, targetSign: number): FaultReason | null => {
  const recvSide = -teamSide(servingTeam);
  if (Math.sign(land.z) !== recvSide) return 'net';
  const depth = Math.abs(land.z);
  if (depth <= COURT.kitchen + COURT.lineWidth / 2) return 'serveShort';
  if (depth > COURT.halfLength + 0.01 || Math.abs(land.x) > COURT.halfWidth + 0.01) return 'serveLong';
  if (land.x * targetSign < -0.01) return 'serveWide';
  return null;
};

export type CourtLine = 'side' | 'base' | 'kitchen' | 'center';

/**
 * 落點離判定邊界多遠（公尺，正 = 界內），以及最近的是哪條線。
 * 和 isInCourt／judgeServe 用同一套邊界：壓線算界內，發球落在廚房線上算短。
 */
export const lineMargin = (p: V3, serveTargetSign: number | null): { margin: number; line: CourtLine } => {
  const cands: [number, CourtLine][] = [
    [COURT.halfWidth + 0.01 - Math.abs(p.x), 'side'],
    [COURT.halfLength + 0.01 - Math.abs(p.z), 'base'],
  ];
  if (serveTargetSign !== null) {
    cands.push([Math.abs(p.z) - (COURT.kitchen + COURT.lineWidth / 2), 'kitchen']);
    cands.push([p.x * serveTargetSign + 0.01, 'center']);
  }
  let best = cands[0];
  for (const c of cands) if (c[0] < best[0]) best = c;
  return { margin: best[0], line: best[1] };
};

/** 腳是否在廚房內（含廚房線）。以身體中心往前 12 cm 當腳尖 */
/** 腳在廚房裡：廚房只到邊線（線本身算廚房），站在邊線外、網柱旁不算——Erne 就是靠這條規則 */
export const feetInKitchen = (pos: V3) => Math.abs(pos.z) - 0.12 <= COURT.kitchen && Math.abs(pos.x) - 0.12 <= COURT.halfWidth;
