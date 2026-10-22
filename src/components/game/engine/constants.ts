/**
 * 真實世界的尺寸與物理參數（SI 單位：公尺、秒、公斤）
 *
 * 座標系：x 橫跨球場、y 向上、z 沿球場長邊。
 * 球網在 z = 0；玩家（近端）在 z > 0 面向 −z，此時畫面右方就是 +x；
 * 對手（遠端）在 z < 0。「side」= 該選手所在半場的 z 正負號。
 */

const FT = 0.3048;
const IN = 0.0254;

export const COURT = {
  /** 20 ft × 44 ft，單雙打同一個場 */
  halfWidth: (20 * FT) / 2, // 3.048
  halfLength: (44 * FT) / 2, // 6.706
  /** 非截擊區（廚房）距網 7 ft */
  kitchen: 7 * FT, // 2.134
  /** 球柱在邊線外 12 in */
  postOffset: 12 * IN,
  /** 網高：兩端 36 in、中央 34 in */
  netPostHeight: 36 * IN, // 0.914
  netCenterHeight: 34 * IN, // 0.864
  lineWidth: 2 * IN,
} as const;

export const BALL = {
  /** 戶外球 26 g、直徑 74 mm（USAP 規範 22.1–26.5 g、73–75.5 mm） */
  mass: 0.026,
  radius: 0.037,
  /**
   * 球與硬地的恢復係數。USAP 規範：78 in 落下反彈 30–34 in，
   * 換算 √(32/78) ≈ 0.64；扣掉空氣阻力與高速損耗後，
   * 落點速度約 6 m/s 時實際 e ≈ 0.68，模擬反彈約 32 in（見 drop test）。
   */
  restitution: 0.7,
  /** 地面與球的摩擦（決定上旋/下旋落地後的「吃地」與「煞車」） */
  friction: 0.42,
  /** 有洞的球比網球阻力大，這也是匹克球飛不遠的原因 */
  dragCoeff: 0.42,
  /** 馬格努斯升力：塑膠洞洞球產生的旋轉效果約只有網球的一半 */
  liftScale: 0.55,
  maxLiftCoeff: 0.22,
  /** 旋轉在空中的衰減（1/s） */
  spinDecay: 0.18,
} as const;

export const AIR = {
  density: 1.2,
  gravity: 9.81,
} as const;

export const PADDLE = {
  /**
   * 球拍反彈係數（PBCoR）。USA Pickleball 自 2025-11-01 起上限 0.43，
   * 用來把各種擊球的最大球速限制在真實範圍內。
   */
  pbcor: 0.43,
  /** 一般業餘選手揮拍頭速上限（m/s）。殺球再加腰力 */
  maxSwingSpeed: 15,
} as const;

export const PLAYER = {
  /** 業餘選手側併步/衝刺：最高約 4.6 m/s、加速度約 11 m/s² */
  maxSpeed: 4.6,
  accel: 12,
  decel: 18,
  /** 揮拍時移動會變慢 */
  swingMoveFactor: 0.35,
  /** 從身體中心算起的有效擊球範圍（手臂＋球拍） */
  reach: 1.05,
  /** 可擊球的高度範圍 */
  minContactHeight: 0.06,
  maxContactHeight: 2.35,
  /** 揮拍從啟動到觸球的時間 */
  swingWindup: 0.11,
  swingFollow: 0.28,
  bodyRadius: 0.28,
} as const;

/** 物理子步長：240 Hz，打網帶與快速抽球時才不會穿網 */
export const PHYSICS_DT = 1 / 240;

export const NET_TOTAL_HALF_WIDTH = COURT.halfWidth + COURT.postOffset;

/** 球網在 x 位置的上緣高度（中央因網帶下壓而略低，近似拋物線） */
export const netHeightAt = (x: number) => {
  const t = Math.min(1, Math.abs(x) / NET_TOTAL_HALF_WIDTH);
  return COURT.netCenterHeight + (COURT.netPostHeight - COURT.netCenterHeight) * t * t;
};
