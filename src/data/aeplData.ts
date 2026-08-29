// AEPL 亞洲菁英匹克球聯盟 — 專區資料
// 資料來源：中央社（2026-05-22、08-17）、自由體育、聯合新聞網、Newtalk（08-25）等公開報導
// 誠實原則:僅收錄可查證事實；未公布資訊以 confirmed: false 或 'TBA' 標示,不臆測
// 最後更新：2026-08-29（開幕站進行中）

export interface AeplTeam {
  id: string;
  name: string;               // 官方隊名（未公布正式隊名者用企業名）
  nameEn?: string;
  backer: string;             // 出資／經營母體
  industry: string;           // 產業背景
  homeBase?: string;          // 地緣（依公開資訊）
  emoji: string;              // 本站視覺識別（非官方隊徽）
  gradient: string;           // 本站視覺識別配色 Tailwind gradient
  captain?: string;
  knownPlayers: { name: string; note: string }[];  // 已公開證實的成員
  rosterConfirmed: boolean;   // 完整陣容是否已官方公布
  facts: string[];            // 已查證的隊伍事實
  analysis: string;           // 本站編輯部賽前觀察（依公開資訊撰寫）
  confirmed: boolean;         // 隊伍本身是否已證實參賽
}

export interface AeplStation {
  station: number;
  city: string;
  venue: string;
  dateLabel: string;
  status: 'done' | 'live' | 'scheduled' | 'tba';
  note?: string;
}

export const AEPL_LEAGUE = {
  name: 'AEPL 亞洲菁英匹克球聯盟',
  nameEn: 'Asia Elite Pickleball League',
  founded: '2026-05-22',
  operator: '亞洲菁英匹克球股份有限公司',
  ceo: '張智維',
  ambassador: '林志穎',
  season: '2026 創始賽季（8 - 11 月）',
  totalPrize: '新台幣 100 萬元',
  teamsCount: 6,
  stationsPlanned: 8,
  positioning: '台灣匹克球賽事的最高殿堂',
  roadmap: [
    { year: '2026', milestone: '創始賽季：全台 8 站 + 11 月總決賽' },
    { year: '2027', milestone: '啟動與東南亞國家的聯賽合作' },
    { year: '2028', milestone: '目標擴大為全亞洲巡迴賽' },
  ],
  lastUpdated: '2026-08-29',
};

// 賽制規則（依公開報導整理）
export const AEPL_FORMAT = [
  { icon: '🏢', title: '企業隊際制', desc: '6 支企業球隊整季對抗，而非傳統個人報名錦標賽。企業冠名經營，球迷有明確支持對象。' },
  { icon: '👥', title: '每隊 6-10 人', desc: '球隊編制 6 至 10 名選手，每個分站可登錄 4 人出賽——陣容調度與輪換是隊伍策略的一環。' },
  { icon: '🗺️', title: '全台 8 站巡迴', desc: '分站遍及雙北、桃園、新竹、宜蘭、台中、台南、高雄，刻意選在人潮聚集的公共場域舉行。' },
  { icon: '🏆', title: '11 月總決賽', desc: '整季積分決定總決賽席次，全季總獎金新台幣 100 萬元。' },
];

// 六支球隊
export const AEPL_TEAMS: AeplTeam[] = [
  {
    id: 'tainan-sunrise-thunder',
    name: '台南旭日雷霆',
    nameEn: 'Tainan Sunrise Thunder',
    backer: '尚騰汽車集團 × 寶嘉聯合',
    industry: '汽車產業',
    homeBase: '台南',
    emoji: '⚡',
    gradient: 'from-amber-500 to-red-500',
    captain: '蔡萱',
    knownPlayers: [
      { name: '蔡萱', note: '隊長。小學三年級起打網球、超過 20 年網球底子，疫情期間轉項匹克球' },
    ],
    rosterConfirmed: false,
    facts: [
      '第一支繳交 AEPL 申請書的球隊',
      '由尚騰汽車集團與寶嘉聯合（Peugeot 總代理）於 8 月 11 日宣布共同成立',
      '集團執行長吳睿弘親自擔任領隊',
    ],
    analysis: '全聯盟企業資源最雄厚的隊伍之一：汽車集團的行銷與資金能量，加上領隊由集團執行長親征，投入誠意明確。吳睿弘直言目標「除了拚成績，更希望把匹克球推廣到每個角落」——旭日雷霆的表現，某種程度是企業體育模式能否在匹克球成立的第一個試金石。',
    confirmed: true,
  },
  {
    id: 'taoyuan-leopards',
    name: '桃園雲豹',
    nameEn: 'Taoyuan Leopards',
    backer: 'TPBL 台啤永豐雲豹體系',
    industry: '職業運動經營',
    homeBase: '桃園',
    emoji: '🐆',
    gradient: 'from-sky-600 to-indigo-600',
    captain: '鍾振煒',
    knownPlayers: [
      { name: '鍾振煒', note: '隊長。26 歲，14 年網球底子，2021 年轉項；過去每月自費出國比賽 2-3 站' },
      { name: '邱子恩', note: '15 歲、本季最年輕職業球員。6 年網球底子，網球／匹克球雙棲，暑假後升高一' },
    ],
    rosterConfirmed: false,
    facts: [
      '與 TPBL 職籃台啤永豐雲豹同體系，執行長張建偉原本個人就贊助匹克球選手',
      '計畫在台啤建國廠打造符合國際標準的匹克球場地，預計 2026 年底落成',
      '陣中擁有本季最年輕（15 歲邱子恩）與最具代表性的轉項選手（鍾振煒）',
    ],
    analysis: '目前資訊最透明、故事性最強的隊伍。職業籃球的經營經驗直接移植——懂賽事包裝、懂球迷經營，還押注了硬體（建國廠國際標準場地）。陣容縱深橫跨 15 歲新星到當打之年的轉項主力，是季前紙面上最完整的隊。',
    confirmed: true,
  },
  {
    id: 'ahhh',
    name: 'Ahhh',
    nameEn: 'Ahhh',
    backer: 'Ahhh Social Pickleball Hub（台北）',
    industry: '匹克球場館經營',
    homeBase: '台北',
    emoji: '🌀',
    gradient: 'from-teal-500 to-emerald-600',
    knownPlayers: [],
    rosterConfirmed: false,
    facts: [
      '由台北知名匹克球場館品牌 Ahhh Social Pickleball Hub 跨足職業球隊經營',
      '是六隊中唯一「本業就是匹克球」的隊伍',
    ],
    analysis: '六隊中唯一從球場文化裡長出來的隊伍：自有場館、自有教學體系與球友社群，選材池就在自家場上。企業隊比的是資源，Ahhh 比的是 DNA——如果場館派能贏過企業派，對台灣基層球館生態會是極大鼓舞。',
    confirmed: true,
  },
  {
    id: 'lumu',
    name: '蘆沐',
    nameEn: 'Lumu',
    backer: '蘆沐',
    industry: '企業隊（產業背景待官方介紹）',
    emoji: '🌿',
    gradient: 'from-lime-500 to-teal-600',
    knownPlayers: [],
    rosterConfirmed: false,
    facts: ['創始賽季五支首發公布球隊之一（2026-08-17 記者會）'],
    analysis: '目前公開資訊最少的隊伍之一，陣容與定位待開季後揭曉——創始賽季的樂趣之一，就是看這類「未知數球隊」在分站賽打出什麼答案。',
    confirmed: true,
  },
  {
    id: 'frt-tech',
    name: '富瑞特科技',
    nameEn: 'FRT Technology',
    backer: '富瑞特科技',
    industry: '科技產業',
    emoji: '🔷',
    gradient: 'from-blue-600 to-violet-600',
    knownPlayers: [],
    rosterConfirmed: false,
    facts: ['創始賽季五支首發公布球隊之一（2026-08-17 記者會）'],
    analysis: '科技業投入匹克球的代表隊。台灣匹克球的成長重鎮之一正是新竹科技聚落（竹科下班就開打的球友文化），科技企業隊的參與具有指標意義；陣容公布前先保留評價。',
    confirmed: true,
  },
  {
    id: 'taichung-sixth',
    name: '第六隊（台中，隊名待公布）',
    backer: '待官方公布',
    industry: '待官方公布',
    homeBase: '台中',
    emoji: '❓',
    gradient: 'from-neutral-400 to-neutral-600',
    knownPlayers: [],
    rosterConfirmed: false,
    facts: [
      '執行長張智維 8 月中透露「還有第 6 支球隊想要加入，來自於台中」',
      '8 月 25 日報導確認創始賽季將以 6 支球隊展開',
    ],
    analysis: '開幕站就在台中，第六隊又來自台中——若在主場亮相，會是開季最有戲劇性的一幕。隊名與陣容一公布，本站將第一時間更新。',
    confirmed: false,
  },
];

// 分站賽程（已公布的據點；其餘依聯盟公布陸續補上）
export const AEPL_STATIONS: AeplStation[] = [
  { station: 1, city: '台中', venue: '台中火車站空中廊道（二樓平台）', dateLabel: '8 月 29 - 30 日', status: 'live', note: '創始賽季開幕站' },
  { station: 2, city: '高雄', venue: '高雄駁二特區', dateLabel: '日期待公布', status: 'scheduled' },
  { station: 3, city: '待公布', venue: '分站地區池：雙北、桃園、新竹、宜蘭、台南', dateLabel: '9 - 11 月', status: 'tba' },
];

// 選手焦點（已公開證實的個人資訊）
export const AEPL_PLAYERS_SPOTLIGHT = [
  {
    name: '鍾振煒',
    team: '桃園雲豹',
    role: '隊長',
    emoji: '🎾',
    story: '26 歲，小三開始練網球、投入 14 年，2021 年疫情期間台灣網球場關閉時轉項。過去每月自費出國比賽 2 至 3 站、「每一站成本至少 3 萬起跳」——他是 AEPL 成立後說出「終於不用一直飛到國外參賽了」的那個人。',
  },
  {
    name: '蔡萱',
    team: '台南旭日雷霆',
    role: '隊長',
    emoji: '🌅',
    story: '小學三年級起打網球、超過 20 年底子，疫情期間接觸匹克球後轉項。她觀察：隨著更多教練投入，台灣「整體競爭力也提升不少」。',
  },
  {
    name: '邱子恩',
    team: '桃園雲豹',
    role: '本季最年輕職業球員',
    emoji: '🌟',
    story: '15 歲、暑假後才升上高中，有 6 年網球底子、網匹雙棲。8 月 2 日季前暖身賽拿下女單季軍——台灣第一批「不必等長大才轉項」的世代，從她開始。',
  },
];

// 季前暖身賽（2026-08-02）成績 — 目前唯一公開的賽場數據
export const AEPL_PRESEASON_RESULTS = {
  dateLabel: '2026 年 8 月 2 日・季前暖身賽',
  events: [
    { event: '男子單打', results: [{ place: '冠軍', name: '林洸賢' }, { place: '亞軍', name: '王駿澤' }, { place: '季軍', name: '洪右丞' }] },
    { event: '女子單打', results: [{ place: '冠軍', name: '鍾汶㚬' }, { place: '亞軍', name: '李紫芸' }, { place: '季軍', name: '邱子恩' }] },
  ],
};

// 情報看板：資料狀態誠實揭露
export const AEPL_INTEL = {
  confirmed: [
    '6 支球隊展開創始賽季（8/25 報導確認）',
    '開幕站：8/29-30 台中火車站空中廊道',
    '第二站：高雄駁二特區（日期待公布）',
    '總獎金 100 萬、8 站 + 11 月總決賽',
    '每隊 6-10 人、每站登錄 4 人',
    '賽事大使：林志穎（開幕記者會親自下場）',
  ],
  pending: [
    '第六隊（台中）正式隊名與陣容',
    '各隊完整選手名單',
    '第 3 站之後的日期與場地',
    '積分規則與總決賽晉級機制細節',
    '轉播／直播平台',
  ],
};

export const AEPL_SOURCES = [
  { title: '中央社：亞洲菁英匹克球聯盟成立 盼台灣選手接軌國際（2026-05-22）', url: 'https://www.cna.com.tw/news/aspt/202605220167.aspx' },
  { title: '中央社：亞洲菁英匹克球聯盟8/29開打 打造台灣職業舞台（2026-08-17）', url: 'https://www.cna.com.tw/news/aspt/202608170172.aspx' },
  { title: '自由體育：AEPL 8月底登場 林志穎擔任賽事大使', url: 'https://sports.ltn.com.tw/news/breakingnews/5542824' },
  { title: '聯合新聞網：林志穎任賽事大使 AEPL月底開戰', url: 'https://udn.com/news/story/7005/9696640' },
  { title: '聯合新聞網：台灣成立職業賽 鍾振煒開心不用出國拚戰', url: 'https://udn.com/news/story/7005/9519574' },
  { title: 'Newtalk：台南旭日雷霆成軍氣勢旺（2026-08-25）', url: 'https://newtalk.tw/news/view/2026-08-25/1055638' },
];
