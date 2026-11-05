import type { ShotKind } from './shots';

/**
 * 握拍與反手：角色的技術風格。
 * 大陸式＝正反手不用換握、網前最快最穩；東方式＝正手好發力；半西方式＝正手重上旋、低球難控。
 * 單反＝反手觸及遠、切削與小球細膩；雙反＝反手抽球紮實有力，但反手那側搆得短一點。
 * 每項只有幾個百分點的差別：改的是手感與打法取向，不是誰比較強。
 */
export type Grip = 'continental' | 'eastern' | 'semiwestern';
export type Backhand = 'one' | 'two';

export const GRIP_LABEL: Record<Grip, string> = { continental: '大陸式', eastern: '東方式', semiwestern: '半西方式' };
export const BACKHAND_LABEL: Record<Backhand, string> = { one: '單手反拍', two: '雙手反拍' };

/** 一句話講打起來的感覺（選角卡用） */
export const GRIP_HINT: Record<Grip, string> = {
  continental: '不用換握，網前對打最快、小球最穩',
  eastern: '正手好發力，快速換邊時慢一點',
  semiwestern: '正手重上旋，低球和小球比較難控',
};
export const BACKHAND_HINT: Record<Backhand, string> = {
  one: '反手搆得遠，切削與小球細膩',
  two: '反手對抽紮實有力，伸長手時較勉強',
};

export interface TechniqueCtx {
  forehand: boolean;
  kind: ShotKind;
  volley: boolean;
  contactHeight: number;
  /** 伸手程度（距離 ÷ 觸及範圍） */
  stretch: number;
  /** 網前快速對打中正反手換邊（上一拍在另一側、相隔不到 0.9 秒） */
  quickSwitch: boolean;
}

export interface TechniqueMods {
  pace: number;
  spin: number;
  error: number;
}

const SOFT: ShotKind[] = ['dink', 'drop', 'block', 'punch'];
const POWER: ShotKind[] = ['drive', 'smash', 'speedup'];

export const techniqueMods = (grip: Grip | undefined, backhand: Backhand | undefined, c: TechniqueCtx): TechniqueMods => {
  const m: TechniqueMods = { pace: 1, spin: 1, error: 1 };
  const soft = SOFT.includes(c.kind);
  const power = POWER.includes(c.kind);
  if (grip === 'continental') {
    // 不用換握：小球、截擊最穩；抽球上旋少一點
    if (soft || c.volley) m.error *= 0.965;
    if (power) {
      m.spin *= 0.9;
      m.pace *= 0.98;
    }
  } else if (grip === 'eastern') {
    if (c.forehand && power) {
      m.pace *= 1.04;
      m.spin *= 1.06;
    }
    if (!c.forehand && c.volley) m.error *= 1.05;
    if (c.quickSwitch) m.error *= 1.06;
  } else if (grip === 'semiwestern') {
    if (power) m.spin *= 1.2;
    if (c.forehand && power) m.pace *= 1.05;
    if (soft && c.contactHeight < 0.45) m.error *= 1.06;
    if (c.quickSwitch) m.error *= 1.06;
  }
  if (!c.forehand && backhand === 'one') {
    // 單反：切削、小球細膩；硬碰硬的反手抽球吃虧
    if (power) {
      m.pace *= 0.96;
      m.error *= 1.04;
    } else m.error *= 0.97;
  } else if (!c.forehand && backhand === 'two') {
    // 雙反：反手對抽紮實；伸長手搆的球比較勉強
    if (power) {
      m.pace *= 1.05;
      m.error *= 0.93;
    }
    if (c.stretch > 0.85) m.error *= 1.03;
  }
  return m;
};

/** 反手那側的觸及加減（公尺）：單反一隻手伸得比較遠 */
export const backhandReach = (backhand: Backhand | undefined) => (backhand === 'one' ? 0.03 : backhand === 'two' ? -0.04 : 0);

/** 專業球路名稱：握拍與反手打得出的招牌球路；沒有特別的就回 null（用一般名稱） */
export const techniqueLabel = (grip: Grip | undefined, backhand: Backhand | undefined, forehand: boolean, kind: ShotKind): string | null => {
  if (kind === 'drive' && forehand && (grip === 'semiwestern' || grip === 'eastern')) return '上旋抽球';
  if (kind === 'drive' && !forehand && backhand) return backhand === 'two' ? '雙反抽球' : '單反抽球';
  if ((kind === 'dink' || kind === 'drop') && !forehand && backhand === 'one') return '切削反手';
  if (kind === 'punch' && forehand && (grip === 'semiwestern' || grip === 'eastern')) return '滾動截擊';
  return null;
};
