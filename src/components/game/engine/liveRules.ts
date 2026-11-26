/**
 * 本週規則賽的規則：由週次決定，建好之後自動輪換，不用人維護。
 * 每條規則都只動引擎裡現成的一個開關，雙方都受影響。
 */
export type WeeklyRule = 'wind' | 'noKitchen' | 'turbo' | 'blackout' | 'race15' | 'doubleEnergy';

export interface WeeklyRuleDef {
  id: WeeklyRule;
  name: string;
  icon: string;
  desc: string;
  /** 只有熱血版才有意義 */
  specialsOnly?: boolean;
  /** 幾分獲勝（預設 11） */
  target?: number;
}

export const WEEKLY_RULES: WeeklyRuleDef[] = [
  { id: 'wind', name: '強風週', icon: '🌬️', desc: '整場固定一陣側風，瞄準要先看風向' },
  { id: 'noKitchen', name: '無廚房週', icon: '🚫', desc: '廚房規則取消：站在網前截擊也可以' },
  { id: 'turbo', name: '超速週', icon: '⚡', desc: '所有人的球都快 15%，反應要更快' },
  { id: 'blackout', name: '停電週', icon: '🌑', desc: '整場像被關燈：沒有站位圈和落點提示' },
  { id: 'race15', name: '15 分週', icon: '🏁', desc: '先到 15 分、贏 2 分才算，耐力戰', target: 15 },
  { id: 'doubleEnergy', name: '雙倍能量週', icon: '🔥', desc: '能量累積兩倍，必殺技放不完', specialsOnly: true },
];
