// 2026 台灣匹克球賽事資料
// 資料來源：中華民國匹克球協會 (CTPF) 公開賽事行事曆
// 最後更新：2026-04-24

export type TournamentLevel = '國際' | '全國' | '區域' | '公益' | '分齡';
export type TournamentStatus = 'upcoming' | 'registration' | 'ongoing' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  nameEn?: string;
  date: string;              // ISO 格式 YYYY-MM-DD
  endDate?: string;
  dateLabel: string;         // 顯示用 e.g. "2026 年 1 月 30 日 - 2 月 1 日"
  venue: string;
  city: string;
  region: string;            // 北部/中部/南部/東部
  level: TournamentLevel;
  status: TournamentStatus;
  organizer: string;
  summary: string;
  categories: string[];      // 組別
  registrationUrl?: string;
  registrationDeadline?: string;
  prizeInfo?: string;
  officialUrl?: string;
  image?: string;
  featured?: boolean;        // 是否為重點賽事
}

export const TOURNAMENTS_2026: Tournament[] = [
  {
    id: 'taiwan-cup-2026',
    name: '2026 臺灣盃全國匹克球公開賽',
    nameEn: 'Taiwan Cup National Pickleball Open 2026',
    date: '2026-01-30',
    endDate: '2026-02-01',
    dateLabel: '2026 年 1 月 30 日 - 2 月 1 日',
    venue: '國立宜蘭大學體育館',
    city: '宜蘭縣',
    region: '東部',
    level: '全國',
    status: 'completed',
    organizer: '中華民國匹克球協會 (CTPF) / 運動部全民運動署補助',
    summary: '由運動部全民運動署補助，台灣最具規模的全國性錦標賽之一。分為國小、國中、高中、大專、教職員與教練公開組等多組別，吸引全台頂尖匹克球選手參與。',
    categories: ['國小組', '國中組', '高中組', '大專組', '教職員組', '教練公開組'],
    registrationDeadline: '2026-01-12',
    officialUrl: 'https://www.ctpf.org.tw/',
    featured: true,
  },
  {
    id: 'napa-cup-2026',
    name: '2026 NAPA 盃全國匹克球錦標賽',
    nameEn: '2026 NAPA Cup National Pickleball Championship',
    date: '2026-02-28',
    endDate: '2026-03-01',
    dateLabel: '2026 年 2 月 28 日 - 3 月 1 日',
    venue: '待公告',
    city: '台灣',
    region: '全國',
    level: '全國',
    status: 'completed',
    organizer: '中華民國匹克球協會 (CTPF)',
    summary: '由中華民國匹克球協會主辦的全國錦標賽，重要的年度積分賽之一，是選手累積排名積分的關鍵賽事。',
    categories: ['公開組', '分齡組', '雙打組'],
    officialUrl: 'https://pickleball.org.tw/activity_2/',
    featured: true,
  },
  {
    id: 'pingtung-invitational-2026',
    name: '2026 屏東縣匹克球邀請賽',
    nameEn: 'Pingtung County Pickleball Invitational Tournament 2026',
    date: '2026-03-15',
    dateLabel: '2026 年 3 月（日期待確認）',
    venue: '國立屏東大學',
    city: '屏東縣',
    region: '南部',
    level: '區域',
    status: 'upcoming',
    organizer: '屏東縣匹克球委員會 / 國立屏東大學',
    summary: '南台灣重要的區域邀請賽，適合各級選手交流切磋。場地位於國立屏東大學體育館，設備完善。',
    categories: ['公開組', '分齡組'],
    officialUrl: 'https://www.ctpf.org.tw/',
  },
  {
    id: 'gangdu-cup-2026',
    name: '2026 港都盃全國匹克球錦標賽',
    nameEn: 'Gangdu Cup National Pickleball Championships 2026',
    date: '2026-04-18',
    dateLabel: '2026 年 4 月（日期待確認）',
    venue: '樹德科技大學',
    city: '高雄市',
    region: '南部',
    level: '全國',
    status: 'upcoming',
    organizer: '高雄市匹克球委員會 / 樹德科技大學',
    summary: '南部最具代表性的全國錦標賽之一。賽事規模完整，包含單打、雙打與混雙項目，是南台灣選手必爭之賽。',
    categories: ['男子單打', '女子單打', '男子雙打', '女子雙打', '混合雙打', '分齡組'],
    officialUrl: 'https://www.ctpf.org.tw/',
    featured: true,
  },
  {
    id: 'zhongzheng-cup-2026',
    name: '2026 全國中正盃匹克球錦標賽',
    nameEn: 'National Zhongzheng Cup Pickleball Championships 2026',
    date: '2026-06-20',
    dateLabel: '2026 年 6 月（日期待確認）',
    venue: '台北市大安運動中心',
    city: '台北市',
    region: '北部',
    level: '全國',
    status: 'upcoming',
    organizer: '中華民國匹克球協會',
    summary: '歷史悠久的「中正盃」系列錦標賽首度納入匹克球項目，於大安運動中心舉辦。是北台灣最受矚目的夏季賽事。',
    categories: ['公開組', '長青組', '青少年組'],
    officialUrl: 'https://pickleball.org.tw/',
    featured: true,
  },
  {
    id: 'kavalan-cup-2026',
    name: '2026 噶瑪蘭盃匹克球錦標賽',
    nameEn: 'Kavalan Cup Pickleball Championships 2026',
    date: '2026-08-15',
    dateLabel: '2026 年 8 月（日期待確認）',
    venue: '宜蘭運動公園',
    city: '宜蘭縣',
    region: '東部',
    level: '全國',
    status: 'upcoming',
    organizer: '宜蘭縣政府 / 中華民國匹克球協會',
    summary: '位於宜蘭運動公園的夏季盛事，擁有 6 面專用戶外球場。宜蘭縣政府力推的體育觀光賽事，結合運動與地方旅遊。',
    categories: ['公開組', '業餘組', '親子組'],
    officialUrl: 'https://pickleball.org.tw/',
  },
  {
    id: 'taipei-open-2026',
    name: '2026 臺北匹克球公開賽',
    nameEn: 'Taipei Pickleball Open 2026',
    date: '2026-09-12',
    dateLabel: '2026 年 9 月（日期待確認）',
    venue: '臺北體育館 / 天母運動公園',
    city: '台北市',
    region: '北部',
    level: '國際',
    status: 'upcoming',
    organizer: '臺北市政府體育局 / 中華民國匹克球協會',
    summary: '2025 年使用 17 面天母新場地圓滿落幕，2026 年規劃升級為國際積分賽，爭取亞洲排名積分，讓台灣選手與國際接軌。',
    categories: ['國際公開組', '全國公開組', '分齡組', '混合雙打'],
    officialUrl: 'https://pickleball.org.tw/',
    featured: true,
  },
  {
    id: 'sports-day-2026',
    name: '2026 國民體育日匹克球推廣活動',
    nameEn: 'National Sports Day Pickleball Promotion 2026',
    date: '2026-09-09',
    dateLabel: '2026 年 9 月 9 日',
    venue: '國立屏東大學',
    city: '屏東縣',
    region: '南部',
    level: '公益',
    status: 'upcoming',
    organizer: '運動部全民運動署 / 屏東大學',
    summary: '國民體育日官方推廣活動，以免費體驗與表演賽形式，讓民眾認識匹克球。適合家庭與初學者參加。',
    categories: ['體驗活動', '表演賽', '親子組'],
  },
  {
    id: 'mr-brown-open-2026',
    name: '2026 伯朗盃匹克球公開賽',
    nameEn: 'Mr. Brown Pickleball Open 2026',
    date: '2026-11-07',
    dateLabel: '2026 年 11 月（日期待確認）',
    venue: '宜蘭縣羅東運動公園',
    city: '宜蘭縣',
    region: '東部',
    level: '全國',
    status: 'upcoming',
    organizer: '金車伯朗 / 中華民國匹克球協會',
    summary: '企業冠名贊助的年度指標賽事，獎金與規格皆具話題性。適合中高階選手爭取年度最佳賽事積分。',
    categories: ['公開組', '業餘組', '青少年組'],
  },
  {
    id: 'star-cup-2026',
    name: '2026 星動盃明星匹克球公益賽',
    nameEn: 'Star Cup Celebrity Pickleball Charity 2026',
    date: '2026-11-22',
    dateLabel: '2026 年 11 月（日期待確認）',
    venue: '待公告',
    city: '台北市',
    region: '北部',
    level: '公益',
    status: 'upcoming',
    organizer: '中華民國匹克球總會',
    summary: '2025 年首屆即獲廣泛迴響的公益賽事，多位藝人與球友同場競技，所得捐贈公益團體。2026 年規模擴大。',
    categories: ['明星組', '公益挑戰組', '媒體組'],
    featured: true,
  },
  {
    id: 'apg-2026',
    name: '2026 亞洲匹克球運動會 (APG)',
    nameEn: 'Asia Pickleball Games 2026',
    date: '2026-10-15',
    dateLabel: '2026 年 10 月（日期待確認）',
    venue: '待公告',
    city: '亞洲輪值',
    region: '國際',
    level: '國際',
    status: 'upcoming',
    organizer: 'Asia Federation of Pickleball (AFP)',
    summary: '亞洲匹克球聯合會主辦的區域最高等級賽事。2024 年於台中國際網球中心舉辦，2025 年日本，2026 年地點待公告。',
    categories: ['國家代表隊', '公開組', '職業組'],
    officialUrl: 'https://www.afpickleball.org/',
    featured: true,
  },
];

// 取得即將到來的賽事（依照今天日期）
export const getUpcomingTournaments = (limit?: number): Tournament[] => {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = TOURNAMENTS_2026
    .filter(t => t.date >= today && t.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date));
  return limit ? upcoming.slice(0, limit) : upcoming;
};

// 取得重點賽事
export const getFeaturedTournaments = (): Tournament[] => {
  return TOURNAMENTS_2026.filter(t => t.featured);
};

// 依等級分組
export const getTournamentsByLevel = (level: TournamentLevel): Tournament[] => {
  return TOURNAMENTS_2026.filter(t => t.level === level);
};

// 2026 年台灣匹克球生態統計（來源：CTPF、遠見雜誌報導）
export const TAIWAN_PICKLEBALL_STATS_2026 = {
  estimatedPlayers: 1_200_000,    // 預估 2026 年球友人數（遠見：2024=14萬, 2025=50萬, 2026=120萬）
  certifiedCoaches: 1400,          // CTPF 已認證 C 級教練
  knownCourts: 60,                 // 全台已知球場（本站收錄 55+，持續新增）
  tournamentsYear: TOURNAMENTS_2026.length,
  governingBody: '中華民國匹克球協會 (CTPF)',
  chairman: '陳朝鍵',
  lastUpdated: '2026-04-24',
};
