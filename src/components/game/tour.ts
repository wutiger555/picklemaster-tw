import type { LevelId } from './engine/levels';

/**
 * 冒險模式「匹克硬邦幫 全台踢館之旅」的站別、關卡、劇情與存檔。
 * 結構照瑪利歐網球 Aces 的冒險模式：每站 1–2 個小遊戲＋一場 Boss 戰；
 * 小遊戲照 Virtua Tennis 的搞笑訓練，每個順便教一個操作。第一次過關必修，之後可以重玩刷星。
 */

export interface StoryPanel {
  /** 誰在講話：角色 id（有半身像就顯示），或 null = 旁白 */
  who: string | null;
  text: string;
  /** 漫畫格的背景場景 */
  scene: 'storm' | 'stall' | 'beach' | 'ko';
  /** 擬聲字 */
  sfx?: string;
}

export interface LevelDef {
  id: LevelId;
  name: string;
  kind: 'mini' | 'boss';
  /** 這關教什麼 */
  teaches: string;
  /** 開打前的一行目標說明 */
  goal: string;
  /** 三星門檻的說明（顯示在結算與關卡卡片） */
  starText: [string, string, string];
  story: StoryPanel[];
}

export interface StageDef {
  id: string;
  name: string;
  place: string;
  boss: string;
  /** 對手角色 id */
  bossChar: string;
  open: boolean;
  /** 地圖上的位置（SVG viewBox 0 0 190 305，經緯度線性換算） */
  map: { x: number; y: number };
  levels: LevelDef[];
}

export const STAGES: StageDef[] = [
  {
    id: 'typhoon',
    name: '海邊・颱風天',
    place: '宜蘭外澳',
    boss: '颱風黑框',
    bossChar: 'p4',
    open: true,
    map: { x: 162, y: 50 },
    levels: [
      {
        id: 'cups',
        name: '夜市打手搖杯',
        kind: 'mini',
        teaches: '瞄準＋球種',
        goal: '軟球打廚房小杯、抽球掃後排、高吊灌進霸王杯',
        starText: ['900 分', '2500 分', '4400 分'],
        story: [
          { who: null, scene: 'stall', text: '颱風前夕，海邊的手搖飲攤照常營業。', sfx: '咻～' },
          { who: 'p5', scene: 'stall', text: '少年欸，想去踢館？先把我這排珍奶打翻再說！' },
          { who: null, scene: 'stall', text: '廚房小杯用軟球、後排用抽球，霸王杯要用高吊灌進去！', sfx: '啪！' },
        ],
      },
      {
        id: 'pearls',
        name: '波霸大收集',
        kind: 'mini',
        teaches: '跑位＋閃球＋撲接',
        goal: '跑去撿珍珠、閃開發球機的砲彈，金珍珠用撲的',
        starText: ['50 顆', '85 顆', '108 顆'],
        story: [
          { who: null, scene: 'stall', text: '一陣強風，整桶波霸灑滿整個球場！', sfx: '嘩啦' },
          { who: 'p5', scene: 'stall', text: '快撿！發球機被風吹壞了，一直朝人開砲！' },
          { who: null, scene: 'stall', text: '看落點閃開砲彈。金珍珠一下就不見，按撲接飛過去！', sfx: '碰！' },
        ],
      },
      {
        id: 'typhoon',
        name: 'Boss：颱風黑框',
        kind: 'boss',
        teaches: '看風打球',
        goal: '限時打倒黑框：來回越長他越累，殺球、必殺扣更多血',
        starText: ['打倒黑框', '剩 45 秒以上', '剩 80 秒以上'],
        story: [
          { who: null, scene: 'storm', text: '十七級強陣風。海邊只剩一個人還在打球。', sfx: '轟隆' },
          { who: 'p4', scene: 'storm', text: '颱風天打球？風越大，我的「爆噴一波」越猛啦！' },
          { who: null, scene: 'beach', text: '看清楚風向箭頭、避開積水，把他打到喊停！', sfx: '幹！' },
        ],
      },
    ],
  },
  { id: 'park', name: '新生公園', place: '台北', boss: '阿灰', bossChar: 'p1', open: false, map: { x: 137, y: 30 }, levels: [] },
  { id: 'market', name: '夜市', place: '台中逢甲', boss: '帽哥', bossChar: 'p5', open: false, map: { x: 66, y: 104 }, levels: [] },
  { id: 'temple', name: '廟口', place: '台南', boss: '城主', bossChar: 'p2', open: false, map: { x: 32, y: 198 }, levels: [] },
  { id: 'final', name: '終站', place: '高雄', boss: '台灣隊', bossChar: 'default', open: false, map: { x: 44, y: 230 }, levels: [] },
];

export const levelById = (id: LevelId) => {
  for (const s of STAGES) {
    const l = s.levels.find((x) => x.id === id);
    if (l) return { stage: s, level: l };
  }
  return { stage: STAGES[0], level: STAGES[0].levels[0] };
};

export interface TourProgress {
  /** 每關最高星數 */
  stars: Partial<Record<LevelId, number>>;
  /** 每關最高分（颱風關是打倒時剩餘秒數） */
  best: Partial<Record<LevelId, number>>;
  /** 看過劇情的關卡 */
  seen: Partial<Record<LevelId, boolean>>;
}

export const TOUR_KEY = 'pm-game-tour';
export const emptyTour = (): TourProgress => ({ stars: {}, best: {}, seen: {} });

/** 第一次要照順序過關（前一關至少一星才開下一關），過了之後可以任意重玩 */
export const levelUnlocked = (p: TourProgress, stage: StageDef, i: number) => i === 0 || (p.stars[stage.levels[i - 1].id] ?? 0) > 0;

export const stageStars = (p: TourProgress, stage: StageDef) => stage.levels.reduce((n, l) => n + (p.stars[l.id] ?? 0), 0);
