/**
 * 角色絕招：每位選手自己的招牌打法，和球拍的必殺技分開。
 * 必殺技靠能量條（球拍決定招式），絕招靠「次數」：每局開始有一次，用掉後打完 4 分再充好。
 * 兩者不能同一拍一起放。
 */

export type SkillId = 'squatSmash' | 'spinSmash' | 'splash' | 'dualCurve';

export interface SkillDef {
  id: SkillId;
  name: string;
  title: string;
  /** 一句話說明效果 */
  desc: string;
  color: string;
  glow: string;
}

export const SKILLS: Record<SkillId, SkillDef> = {
  squatSmash: {
    id: 'squatSmash',
    name: '秒蹲大力一揮',
    title: 'SQUAT BLAST',
    desc: '瞬間深蹲蓄力，打出貼網暴衝的平抽重砲。',
    color: '#f97316',
    glow: '#fed7aa',
  },
  spinSmash: {
    id: 'spinSmash',
    name: '幹他！',
    title: 'TORNADO SMASH',
    desc: '原地起跳、空中轉體一圈，居高臨下高速扣殺。',
    color: '#ef4444',
    glow: '#fecaca',
  },
  splash: {
    id: 'splash',
    name: '爆噴一波',
    title: 'SPLASH ZONE',
    desc: '擊球時噴出一大片水花，對手嚇一跳、腳下打滑，跑不快。',
    color: '#38bdf8',
    glow: '#e0f2fe',
  },
  dualCurve: {
    id: 'dualCurve',
    name: '左右逢源大曲球',
    title: 'DUAL CURVE',
    desc: '左右手各拿一支拍，打出先往左、再往右大幅飄移的曲球。',
    color: '#a3e635',
    glow: '#ecfccb',
  },
};

/** 用掉絕招後，再打幾分才充好 */
export const SKILL_RECHARGE_POINTS = 4;
