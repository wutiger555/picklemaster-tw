// 球場區域類型
export interface CourtZone {
  id: string;
  name: string;
  description: string;
  rules: string[];
  coordinates: string; // SVG path coordinates
  color: string;
}

// 球場資訊
export const COURT_ZONES: CourtZone[] = [
  {
    id: 'non-volley-left',
    name: '左側非截擊區 (廚房區)',
    description: '靠近球網的 7 英尺區域，不能在此區進行截擊',
    rules: [
      '不能站在此區內截擊球（volley）',
      '球彈地後可以進入並擊球',
      '雙腳都不能碰觸此區域線',
      '球拍也不能進入此區域進行截擊',
    ],
    coordinates: '', // 待填入
    color: '#fbbf24',
  },
  {
    id: 'non-volley-right',
    name: '右側非截擊區 (廚房區)',
    description: '靠近球網的 7 英尺區域，不能在此區進行截擊',
    rules: [
      '不能站在此區內截擊球（volley）',
      '球彈地後可以進入並擊球',
      '雙腳都不能碰觸此區域線',
      '球拍也不能進入此區域進行截擊',
    ],
    coordinates: '',
    color: '#fbbf24',
  },
  {
    id: 'service-left-even',
    name: '左側偶數發球區',
    description: '分數為偶數時的發球區域',
    rules: [
      '分數為偶數（0, 2, 4...）時發球',
      '發球必須對角線發到對方偶數區',
      '發球時雙腳至少有一隻在發球區後',
    ],
    coordinates: '',
    color: '#60a5fa',
  },
  {
    id: 'service-left-odd',
    name: '左側奇數發球區',
    description: '分數為奇數時的發球區域',
    rules: [
      '分數為奇數（1, 3, 5...）時發球',
      '發球必須對角線發到對方奇數區',
    ],
    coordinates: '',
    color: '#60a5fa',
  },
  {
    id: 'service-right-even',
    name: '右側偶數發球區',
    description: '分數為偶數時的發球區域',
    rules: [
      '分數為偶數（0, 2, 4...）時發球',
      '發球必須對角線發到對方偶數區',
    ],
    coordinates: '',
    color: '#4ade80',
  },
  {
    id: 'service-right-odd',
    name: '右側奇數發球區',
    description: '分數為奇數時的發球區域',
    rules: [
      '分數為奇數（1, 3, 5...）時發球',
      '發球必須對角線發到對方奇數區',
    ],
    coordinates: '',
    color: '#4ade80',
  },
];
