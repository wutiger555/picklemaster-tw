/** 3D 動作示範的設定與共用狀態（不引用 three，外層 UI 可以直接用） */

export type CameraView = 'side' | 'front' | 'back' | 'top';

export interface StrokeChapter {
  label: string;
  /** 這個階段的代表時間點（秒，相對擊球瞬間；負的是擊球前） */
  t: number;
  note: string;
}

export interface StrokeDemoConfig {
  /** 揮拍種類：drive 抽球、soft 吊小球／下切、lob 挑高球、serve 低手發球 */
  button: 'drive' | 'soft' | 'lob' | 'serve';
  grip: 'continental' | 'eastern' | 'semiwestern';
  /** 站位：往右偏離中線、離網距離（公尺）；預設 [0, 6] 是底線附近 */
  stand?: [number, number];
  /** 擊球點（相對站位：往右、離地高度、往前，公尺） */
  contact: [number, number, number];
  /** 一輪示範的起訖（相對擊球瞬間） */
  from: number;
  to: number;
  /** 揮拍軌跡畫哪一段（相對擊球瞬間）：只畫拉拍到收拍，不含準備與回位 */
  trail: [number, number];
  chapters: StrokeChapter[];
  /**
   * 來球：擊球前多久落地（0 = 不落地直接截擊，這時 vy 是擊球瞬間的垂直速度）、水平球速；
   * hold = 發球：球先拿在左手，擊球前 0.32 秒放手落下。
   * 出球：水平球速、垂直初速、橫向速度（往右為正）
   */
  ballIn: { bounceBefore: number; speed: number; vy?: number; hold?: boolean };
  ballOut: { speed: number; vy: number; dx?: number };
  /** 對手出手時做分腿墊步（發球不需要） */
  split?: boolean;
  view: CameraView;
}

/** 畫面與控制列共用的時鐘：每幀由 3D 場景推進，控制列直接讀寫 */
export interface DemoClock {
  u: number;
  playing: boolean;
  speed: number;
  view: CameraView;
  /** 每次切換視角 +1，場景看到變化就移動鏡頭 */
  viewNonce: number;
  /** 每播完一輪 +1（重畫揮拍軌跡用） */
  loop: number;
}

export const FOREHAND_DRIVE: StrokeDemoConfig = {
  button: 'drive',
  grip: 'eastern',
  contact: [0.78, 0.8, 0.55],
  from: -1.45,
  to: 0.95,
  trail: [-0.34, 0.24],
  chapters: [
    { label: '側身準備', t: -0.6, note: '對手一出手就分腿墊步；判斷是正手，立刻轉肩側身。' },
    { label: '短引拍', t: -0.2, note: '拍頭只拉到腰部後方，不超過身體線。' },
    { label: '重心轉移', t: -0.07, note: '重心從後腳壓到前腳，髖部先轉、肩膀跟上。' },
    { label: '接觸球', t: 0, note: '在身體斜前方、大腿高度擊球，拍面接近垂直。' },
    { label: '跟進', t: 0.2, note: '拍頭由低往高收到左肩前方，身體轉回面向球網。' },
  ],
  ballIn: { bounceBefore: 0.3, speed: 11 },
  ballOut: { speed: 17, vy: 1.6 },
  view: 'side',
};

export const BACKHAND_DRIVE: StrokeDemoConfig = {
  button: 'drive',
  grip: 'continental',
  contact: [-0.62, 0.8, 0.5],
  from: -1.45,
  to: 0.95,
  trail: [-0.34, 0.24],
  chapters: [
    { label: '轉體側身', t: -0.6, note: '判斷是反手，左腳往後、右肩轉向球網，背對對手一點點。' },
    { label: '雙手握拍', t: -0.3, note: '左手扶上拍柄，雙手一起把拍子帶到左腰後方。' },
    { label: '短引拍', t: -0.12, note: '拍頭低於來球，引拍不超過身體線。' },
    { label: '從低到高', t: 0, note: '在身體左前方擊球，髖部帶動、拍面垂直往上掃。' },
    { label: '跟進到右肩', t: 0.2, note: '收拍到右肩上方，身體轉回面網。' },
  ],
  ballIn: { bounceBefore: 0.3, speed: 11 },
  ballOut: { speed: 16, vy: 1.6, dx: 0.3 },
  view: 'back',
};

export const SERVE: StrokeDemoConfig = {
  button: 'serve',
  grip: 'continental',
  stand: [0.9, 7.05],
  contact: [0.5, 0.55, 0.45],
  from: -1.6,
  to: 1.0,
  trail: [-0.45, 0.3],
  split: false,
  chapters: [
    { label: '站位', t: -1.2, note: '雙腳站在底線後方、中線與邊線之間，斜對角瞄準對方發球區。' },
    { label: '持球放球', t: -0.32, note: '左手在腰前把球放開（或輕拋），讓球自然落下。' },
    { label: '引拍', t: -0.15, note: '拍子往右後下方拉，鐘擺一樣，不要往上舉。' },
    { label: '腰下擊球', t: 0, note: '擊球點低於肚臍、拍頭低於手腕，拍子由下往上走。' },
    { label: '往上跟進', t: 0.25, note: '拍頭朝目標往前上方送，收拍到肩膀高度。' },
  ],
  ballIn: { bounceBefore: 0, speed: 0, hold: true },
  ballOut: { speed: 10.5, vy: 3.4, dx: -2.2 },
  view: 'side',
};

export const DINK: StrokeDemoConfig = {
  button: 'soft',
  grip: 'continental',
  stand: [0, 2.45],
  contact: [0.5, 0.42, 0.45],
  from: -1.3,
  to: 1.0,
  trail: [-0.3, 0.25],
  chapters: [
    { label: '站位準備', t: -0.75, note: '站在廚房線後，雙腳與肩同寬、膝蓋彎、拍頭在腰前。' },
    { label: '極小引拍', t: -0.18, note: '靠肩膀往後帶一點點，拍頭只退約 30 公分。' },
    { label: '身前觸球', t: 0, note: '在身體前方、膝蓋到腰的高度觸球，拍面朝上打開。' },
    { label: '推送', t: 0.12, note: '手腕鎖住，肩膀把球往前上方「舉」過網。' },
    { label: '跟進停住', t: 0.35, note: '拍頭停在前方、拍面仍朝上，馬上回到準備姿勢。' },
  ],
  ballIn: { bounceBefore: 0.3, speed: 3.6 },
  ballOut: { speed: 3.65, vy: 3.7, dx: -0.6 },
  view: 'side',
};

export const VOLLEY: StrokeDemoConfig = {
  button: 'drive',
  grip: 'continental',
  stand: [0, 2.45],
  contact: [0.55, 1.05, 0.45],
  from: -1.2,
  to: 0.9,
  trail: [-0.22, 0.2],
  chapters: [
    { label: '預備姿勢', t: -0.7, note: '拍頭朝上放在胸前，手肘在身體前方，膝蓋微彎。' },
    { label: '讀球判斷', t: -0.3, note: '看對手拍面就決定正反手，不等球過網。' },
    { label: '拍面對準', t: -0.1, note: '幾乎不引拍，拍面提早擺到來球路線上。' },
    { label: '短促阻擋', t: 0, note: '在身體前方擊球，像「推一下」而不是揮。' },
    { label: '回復預備', t: 0.3, note: '拍子立刻收回胸前，準備下一球。' },
  ],
  ballIn: { bounceBefore: 0, speed: 11, vy: -1.2 },
  ballOut: { speed: 9, vy: -0.4, dx: -0.4 },
  view: 'side',
};

export const RESET: StrokeDemoConfig = {
  button: 'soft',
  grip: 'continental',
  stand: [0, 4.6],
  contact: [0.5, 0.45, 0.4],
  from: -1.2,
  to: 1.1,
  trail: [-0.28, 0.25],
  chapters: [
    { label: '降低重心', t: -0.6, note: '對手要抽球了：雙膝彎低、拍頭放在身前，不要往後退。' },
    { label: '鬆握拍', t: -0.25, note: '握力放到 3～4 分，手像海綿，不要硬擋。' },
    { label: '開放拍面', t: -0.08, note: '拍面稍微朝上，迎在身體前方。' },
    { label: '吸收＋推送', t: 0, note: '觸球時拍子微微後縮卸力，再輕推，讓球落進對方廚房。' },
    { label: '恢復站位', t: 0.35, note: '球一離拍就往前移，回到預備姿勢。' },
  ],
  ballIn: { bounceBefore: 0.22, speed: 14 },
  ballOut: { speed: 5.3, vy: 4.65, dx: 0.3 },
  view: 'side',
};
