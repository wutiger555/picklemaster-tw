/** 3D 動作示範的設定與共用狀態（不引用 three，外層 UI 可以直接用） */

export type CameraView = 'side' | 'front' | 'back' | 'top';

export interface StrokeChapter {
  label: string;
  /** 這個階段的代表時間點（秒，相對擊球瞬間；負的是擊球前） */
  t: number;
  note: string;
}

export interface StrokeDemoConfig {
  /** 揮拍種類：drive 抽球、soft 吊小球／下切、lob 挑高球 */
  button: 'drive' | 'soft' | 'lob';
  grip: 'continental' | 'eastern' | 'semiwestern';
  /** 擊球點（相對站位：往右、離地高度、往前，公尺） */
  contact: [number, number, number];
  /** 一輪示範的起訖（相對擊球瞬間） */
  from: number;
  to: number;
  /** 揮拍軌跡畫哪一段（相對擊球瞬間）：只畫拉拍到收拍，不含準備與回位 */
  trail: [number, number];
  chapters: StrokeChapter[];
  /** 來球：擊球前多久落地、水平球速；出球：水平球速、仰角方向的初速 */
  ballIn: { bounceBefore: number; speed: number };
  ballOut: { speed: number; vy: number };
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
