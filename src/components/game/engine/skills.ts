/**
 * 角色絕招：每位選手自己的招牌打法，和球拍的必殺技分開。
 * 必殺技靠能量條（球拍決定招式），絕招靠「次數」：每局開始有一次，用掉後打完 4 分再充好。
 * 兩者不能同一拍一起放。
 */

export type SkillId = 'squatSmash' | 'spinSmash' | 'splash' | 'dualCurve' | 'cheer' | 'pickle' | 'feast' | 'roar' | 'wave' | 'overclock' | 'foxfire';

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
  // ── VRM 角色（100Avatars）的絕招 ──
  pickle: {
    id: 'pickle',
    name: '醃漬大法・酸到軟腳',
    title: 'SOUR PICKLE',
    desc: '一拍把對手醃進酸黃瓜罐：9 秒內對手手軟腳軟，出球變慢、跑不快。',
    color: '#4ade80',
    glow: '#dcfce7',
  },
  feast: {
    id: 'feast',
    name: '大胃王・吃光光',
    title: 'BIG EATER',
    desc: '一口吞掉對手 25 點能量變成自己的；之後 8 秒對手賺到的能量也全進你的肚子。',
    color: '#fbbf24',
    glow: '#fef3c7',
  },
  roar: {
    id: 'roar',
    name: '虎爺・虎嘯山林',
    title: 'TIGER ROAR',
    desc: '擊球同時一聲虎嘯：對手嚇到愣住，下一拍手軟只能撈出高球，等你殺。',
    color: '#f97316',
    glow: '#ffedd5',
  },
  wave: {
    id: 'wave',
    name: '大浪來了',
    title: 'BIG WAVE',
    desc: '一拍掀起大浪橫掃對手半場：對手被捲向邊線、腳下打滑，中間空出一大片。',
    color: '#22d3ee',
    glow: '#cffafe',
  },
  overclock: {
    id: 'overclock',
    name: '超頻模式',
    title: 'OVERCLOCK',
    desc: '機體超頻 8 秒：跑速提升三成以上、手臂伸長，打得到平常救不到的球。',
    color: '#a855f7',
    glow: '#f3e8ff',
  },
  foxfire: {
    id: 'foxfire',
    name: '狐火・幻影球',
    title: 'FOXFIRE',
    desc: '球纏上狐火 8 秒：你打出去的球飛到一半就隱形，只剩一點藍色火光，到對手面前才現身。',
    color: '#60a5fa',
    glow: '#dbeafe',
  },
};

/** 用掉絕招後，再打幾分才充好 */
export const SKILL_RECHARGE_POINTS = 4;
