/**
 * 新手教學的關卡：每關教一招遊戲的重點玩法，教練餵球、畫面指示要按哪個鍵，做到一次就過關。
 * 進度判定只看引擎丟出來的事件（純函式），方便無頭模擬測試。
 */
import type { Practice, GameEvent } from './engine/game';
import type { TouchHighlight } from './TouchControls';

export type LessonId = 'hit' | 'smash' | 'dive' | 'special' | 'skill';

export interface Lesson {
  id: LessonId;
  title: string;
  /** 一句話講這招在比賽裡有什麼用 */
  why: string;
  setup: { practice: Practice; specials: boolean; assist: boolean };
  /** 手機與鍵盤各一套說明 */
  touch: string;
  keys: string;
  highlight: TouchHighlight;
}

/** 每關做到一次就過：重點是讓玩家親手放出遊戲的招牌玩法，不是磨基本功 */
export const LESSONS: Lesson[] = [
  {
    id: 'hit',
    title: '擊球',
    why: '球到身邊會自動跑位、自動揮拍，你只要決定打哪一種球',
    setup: { practice: { feed: 'mid' }, specials: false, assist: true },
    touch: '教練餵球過來時，按任一顆擊球鍵把球打回去（軟＝輕放、抽＝平抽、挑＝高吊）',
    keys: '教練餵球過來時，按 J、K 或 L 把球打回去（J 輕放、K 平抽、L 高吊）',
    highlight: 'shots',
  },
  {
    id: 'smash',
    title: '殺球',
    why: '對手吊高了就是你的機會，一拍殺下去通常直接得分',
    setup: { practice: { feed: 'popup' }, specials: false, assist: true },
    touch: '教練吊高球。地上的圈變成金色＝殺球機會，按「抽」用力殺下去！',
    keys: '教練吊高球。地上的圈變成金色＝殺球機會，按 K 用力殺下去！',
    highlight: 'drive',
  },
  {
    id: 'dive',
    title: '飛身撲救',
    why: '跑不到的球也別放棄，撲過去救回來最熱血',
    setup: { practice: { feed: 'wide' }, specials: false, assist: false },
    touch: '教練打你跑不到的大角度球。「撲」鍵亮起來時按下去，飛身把球救回來！',
    keys: '教練打你跑不到的大角度球。畫面提示撲救時按 Shift，飛身把球救回來！',
    highlight: 'dive',
  },
  {
    id: 'special',
    title: '必殺技',
    why: '擊球會累積能量，集滿就能放出球拍專屬的必殺技',
    setup: { practice: { feed: 'mid' }, specials: true, assist: true },
    touch: '能量已經幫你集滿了：先點「必殺」蓄勢，再照常按擊球鍵，下一拍就會放出必殺技',
    keys: '能量已經幫你集滿了：先按空白鍵蓄勢，再照常按 J／K／L，下一拍就會放出必殺技',
    highlight: 'special',
  },
  {
    id: 'skill',
    title: '角色絕招',
    why: '每位選手都有自己的招牌打法，用掉後打完 4 分再充好',
    setup: { practice: { feed: 'mid' }, specials: true, assist: true },
    touch: '點「絕招」準備好，再照常按擊球鍵，放出你選的選手的招牌打法！',
    keys: '按 U 準備好，再照常按 J／K／L，放出你選的選手的招牌打法！',
    highlight: 'skill',
  },
];

/** 正規版沒有必殺和絕招：只教前面幾招 */
export const lessonsFor = (specials: boolean) => LESSONS.filter((l) => specials || !l.setup.specials);

export interface LessonProgress {
  done: boolean;
  /** 玩家最近一拍（擊球關要等確定過網才算） */
  pending: boolean;
}

export const freshProgress = (): LessonProgress => ({ done: false, pending: false });

/**
 * 吃一批事件，回傳新的進度。殺球、撲救、必殺、絕招只要打出來就算（重點是學會怎麼放）；
 * 擊球關要球真的回到對面（玩家擊球後落在 z < 0）。
 */
export const applyEvents = (lesson: Lesson, prev: LessonProgress, events: GameEvent[]): LessonProgress => {
  if (prev.done) return prev;
  let pending = prev.pending;
  for (const e of events) {
    if (e.type === 'hit' && e.team === 0) {
      if (lesson.id === 'smash' && e.kind === 'smash') return { done: true, pending: false };
      if (lesson.id === 'dive' && e.dive) return { done: true, pending: false };
      if (lesson.id === 'special' && e.special) return { done: true, pending: false };
      if (lesson.id === 'skill' && e.skill) return { done: true, pending: false };
      pending = lesson.id === 'hit';
    } else if (e.type === 'hit' || e.type === 'point') pending = false;
    else if (e.type === 'bounce' && pending && e.pos.z < 0) return { done: true, pending: false };
  }
  return { done: false, pending };
};

const DONE_KEY = 'pm-game-tutorial-done';
export const tutorialDone = () => {
  try {
    return localStorage.getItem(DONE_KEY) === '1';
  } catch {
    return false;
  }
};
export const markTutorialDone = () => {
  try {
    localStorage.setItem(DONE_KEY, '1');
  } catch {
    /* 無痕模式存不了，下次再推薦一次也無妨 */
  }
};
