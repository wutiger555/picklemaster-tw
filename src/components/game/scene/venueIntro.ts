import type { Venue } from '../GameScreens';

/**
 * 開賽前的場地介紹運鏡（像瑪利歐賽車）：每個場地幾段鏡頭，鏡頭從 p0 移到 p1、視線從 l0 移到 l1。
 * 最後一段固定收回比賽視角，接上比賽鏡頭不會跳。座標同比賽（鏡頭預設在 +z 往 −z 看）。
 */
export interface Shot {
  p0: [number, number, number];
  p1: [number, number, number];
  l0: [number, number, number];
  l1: [number, number, number];
  dur: number;
}

const SETTLE: Shot = { p0: [0, 11, 19], p1: [0, 5.2, 11], l0: [0, 0, -1], l1: [0, 0.3, -2.4], dur: 1.2 };

export const VENUE_SHOTS: Record<Exclude<Venue, 'beach'>, Shot[]> = {
  arena: [
    { p0: [9, 1.2, 12], p1: [-9, 1.6, 12], l0: [0, 1, 0], l1: [0, 1.2, 0], dur: 1.6 },
    { p0: [0, 2, 4], p1: [0, 3.6, -1], l0: [0, 6, -16], l1: [0, 7.5, -18], dur: 1.6 },
    SETTLE,
  ],
  rosegarden: [
    // 玫瑰花圃與噴水池
    { p0: [17, 1.3, 6], p1: [11, 1.8, -5], l0: [13, 0.8, -2], l1: [13, 1.2, -2], dur: 1.6 },
    // 蘑菇柱
    { p0: [10, 1.8, -8], p1: [7, 2.4, -13], l0: [5.5, 3, -20], l1: [5.5, 3.4, -20], dur: 1.6 },
    SETTLE,
  ],
  xinyi: [
    // 籠子裡抬頭看台北 101
    { p0: [1, 1.5, 7], p1: [2, 1.8, 2], l0: [7, 18, -112], l1: [7, 62, -112], dur: 1.8 },
    // 沿著頂網的鋼管
    { p0: [-5, 4.6, 9], p1: [5, 5, -6], l0: [0, 3.5, -12], l1: [0, 2, -4], dur: 1.5 },
    SETTLE,
  ],
  riverside: [
    // 空拍掠過 8 面球場
    { p0: [-26, 22, 30], p1: [26, 17, 18], l0: [5, 0, -9], l1: [5, 0, -9], dur: 1.8 },
    // 貼著鐵絲網低空穿過
    { p0: [-14, 1.2, -3], p1: [-7, 1.3, -14], l0: [10, 0.6, -9], l1: [16, 0.6, -20], dur: 1.5 },
    SETTLE,
  ],
};

export const introDuration = (venue: Venue) => (venue === 'beach' ? 0 : VENUE_SHOTS[venue].reduce((s, x) => s + x.dur, 0));

/** 介紹卡的文字 */
export const VENUE_INFO: Record<Exclude<Venue, 'beach'>, { name: string; where: string; line: string }> = {
  arena: { name: '夜間體育館', where: '匹克硬邦幫主場', line: '滿場觀眾、LED 看板與大螢幕' },
  rosegarden: { name: '新生公園羽毛球場', where: '台北市中山區・玫瑰園旁', line: '花圃、噴水池和蘑菇柱，新生高架就在旁邊' },
  xinyi: { name: '信義運動中心頂樓', where: '台北市信義區', line: '防護網籠裡的屋頂球場，抬頭就是台北 101' },
  riverside: { name: '新北大都會公園河濱', where: '新北市三重區', line: '全台最大的河濱匹克球中心，8 面專用場' },
};
