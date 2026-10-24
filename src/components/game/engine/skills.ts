/**
 * 角色絕招：每位選手自己的招牌打法，和球拍的必殺技分開。
 * 必殺技靠能量條（球拍決定招式），絕招靠「次數」：每局開始有一次，用掉後打完 4 分再充好。
 * 兩者不能同一拍一起放。
 */

export type SkillId = 'squatSmash' | 'spinSmash' | 'splash' | 'dualCurve' | 'cheer';

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
    name: '夜行巴士・關燈',
    title: 'LIGHTS OUT',
    desc: '秒蹲一記貼網重砲，順手把球場燈關掉 6 秒：對手看不到站位圈和落點提示，只剩你的球拖著車燈光軌。',
    color: '#f97316',
    glow: '#fed7aa',
  },
  spinSmash: {
    id: 'spinSmash',
    name: '幹他！城主嗆聲',
    title: 'TAUNT SMASH',
    desc: '起跳轉體扣殺，落地對著對手大吼一聲：8 秒內對手手抖，失誤變多。',
    color: '#ef4444',
    glow: '#fecaca',
  },
  splash: {
    id: 'splash',
    name: '爆噴一波・淹水',
    title: 'FLOOD ZONE',
    desc: '一拍噴出大水，對手後半場淹水 6 秒：踩在水裡跑不快，球落在水上會像打水漂一樣彈很低。站到網前就沒有水。',
    color: '#38bdf8',
    glow: '#e0f2fe',
  },
  dualCurve: {
    id: 'dualCurve',
    name: '左右逢源・分身',
    title: 'TWIN SHADOW',
    desc: '打出左右飄的大曲球，同時召喚分身站在網前 2 分：搆得到的球會自動幫你截擊回去。吊高球可以越過分身。',
    color: '#a3e635',
    glow: '#ecfccb',
  },
  cheer: {
    id: 'cheer',
    name: '全民應援',
    title: 'TEAM TAIWAN',
    desc: '全場觀眾起立大喊「台灣隊加油！」：能量立刻 +50，10 秒內能量累積兩倍，必殺技馬上就能放。',
    color: '#facc15',
    glow: '#fef9c3',
  },
};

/** 用掉絕招後，再打幾分才充好 */
export const SKILL_RECHARGE_POINTS = 4;
