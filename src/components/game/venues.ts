import { COURT } from './engine/constants';
import type { Venue } from './GameScreens';

export type MenuVenue = Exclude<Venue, 'beach'>;

/** 選單裡選得到的場地（海邊是踢館之旅颱風站專用） */
export const VENUES: { id: MenuVenue; title: string; short: string; desc: string }[] = [
  { id: 'arena', title: '夜間體育館', short: '夜間體育館', desc: '滿場觀眾、LED 看板與大螢幕' },
  { id: 'rosegarden', title: '新生公園羽毛球場', short: '新生公園', desc: '台北玫瑰園旁的白天戶外硬地' },
  { id: 'xinyi', title: '信義運動中心頂樓', short: '信義頂樓', desc: '防護網籠裡的屋頂球場，正對台北 101' },
  { id: 'riverside', title: '新北大都會公園河濱', short: '大都會河濱', desc: '全台最大的河濱匹克球中心，8 面專用場' },
];

export const venueById = (id: Venue | undefined) => VENUES.find((v) => v.id === id) ?? VENUES[0];

/** 信義頂樓的防護網籠（半寬、半長、高）：場景和鏡頭共用，鏡頭不能跑到籠子外面被網擋住 */
export const XINYI_CAGE = { x: COURT.halfWidth + 3, z: COURT.halfLength + 4.2, h: 9.2 };

/** 最新的場地：沒自己選過場地的玩家每次進來輪流用這幾個 */
export const NEWEST_VENUES: MenuVenue[] = ['xinyi', 'riverside'];
