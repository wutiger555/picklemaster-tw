// AEPL 亞洲菁英匹克球聯盟 — 專區資料
// 資料來源：中央社（2026-05-22、08-17）、自由體育、聯合新聞網、Newtalk（08-25）等公開報導
// 誠實原則:僅收錄可查證事實；未公布資訊以 confirmed: false 或 'TBA' 標示,不臆測
// 最後更新：2026-09-02（首站台中完賽，冠軍桃園永豐雲豹）

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
  season: '2026 創始賽季（8 - 11 月）・首站冠軍：桃園永豐雲豹',
  totalPrize: '新台幣 100 萬元',
  teamsCount: 6,
  stationsPlanned: 8,
  positioning: '台灣匹克球賽事的最高殿堂',
  roadmap: [
    { year: '2026', milestone: '創始賽季：全台 8 站 + 11 月總決賽' },
    { year: '2027', milestone: '啟動與東南亞國家的聯賽合作' },
    { year: '2028', milestone: '目標擴大為全亞洲巡迴賽' },
  ],
  lastUpdated: '2026-09-02',
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
      '🥈 首站台中站亞軍：4 強直落三勝新北蘆沐，冠軍戰纏鬥至第 5 回合 Dreambreaker 惜敗',
    ],
    analysis: '全聯盟企業資源最雄厚的隊伍之一：汽車集團的行銷與資金能量，加上領隊由集團執行長親征，投入誠意明確。吳睿弘直言目標「除了拚成績，更希望把匹克球推廣到每個角落」——旭日雷霆首站一路殺進冠軍戰、把雲豹逼進 Dreambreaker，已證明這支隊不只有資源、還有硬實力。',
    confirmed: true,
  },
  {
    id: 'taoyuan-leopards',
    name: '桃園永豐雲豹',
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
      '🏆 首站台中站冠軍：4 強 3:2 力退新竹 YANKEY ACE，冠軍戰 Dreambreaker 21:18 險勝旭日雷霆',
    ],
    analysis: '目前資訊最透明、故事性最強的隊伍。職業籃球的經營經驗直接移植——懂賽事包裝、懂球迷經營，還押注了硬體（建國廠國際標準場地）。陣容縱深橫跨 15 歲新星到當打之年的轉項主力——首站就用冠軍證明了紙面實力，兩場 3:2 硬仗也顯示他們扛得住關鍵分。',
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
    name: '新北蘆沐',
    nameEn: 'New Taipei Lumu',
    backer: '蘆沐',
    industry: '企業隊（產業背景待官方介紹）',
    homeBase: '新北',
    emoji: '🌿',
    gradient: 'from-lime-500 to-teal-600',
    knownPlayers: [],
    rosterConfirmed: false,
    facts: ['創始賽季五支首發公布球隊之一（2026-08-17 記者會）', '首站台中站 4 強（不敵旭日雷霆）', '首站戰報揭露正式隊名冠上「新北」地緣'],
    analysis: '目前公開資訊最少的隊伍之一，首站就打進 4 強，「未知數球隊」交出了第一個答案——這支隊有真材實料，值得繼續追蹤。',
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
    id: 'hsinchu-yankey-ace',
    name: '新竹 YANKEY ACE',
    nameEn: 'Hsinchu Yankey Ace',
    backer: '待官方介紹',
    industry: '企業隊（背景待官方介紹）',
    homeBase: '新竹',
    emoji: '♠️',
    gradient: 'from-slate-500 to-cyan-700',
    knownPlayers: [],
    rosterConfirmed: false,
    facts: [
      '隊名首見於首站台中站官方戰報（2026-08-30）',
      '首站台中站 4 強：與最終冠軍雲豹纏鬥到 3:2 才落敗',
      '註：8 月中執行長曾透露第六隊「來自台中」，與本隊的新竹地緣關係待官方釐清',
    ],
    analysis: '開季前最神祕的一隊，首站直接用成績自我介紹——4 強戰把最終冠軍雲豹逼到第 5 回合。企業背景與陣容尚未公開，但這支隊顯然不是來陪打的。',
    confirmed: true,
  },
];

// 分站賽程（已公布的據點；其餘依聯盟公布陸續補上）
export const AEPL_STATIONS: AeplStation[] = [
  { station: 1, city: '台中', venue: '台中火車站空中廊道（二樓平台）', dateLabel: '8 月 29 - 30 日', status: 'done', note: '🏆 冠軍：桃園永豐雲豹' },
  { station: 2, city: '高雄', venue: '高雄駁二特區', dateLabel: '9 月 19 - 20 日', status: 'scheduled', note: '賽季第 2 站' },
  { station: 3, city: '待公布', venue: '分站地區池：雙北、桃園、新竹、宜蘭、台南', dateLabel: '10 - 11 月', status: 'tba' },
];

// 首站戰報（2026-08-30 台中站，來源：Newtalk 戰報）
export const AEPL_STATION1_REPORT = {
  dateLabel: '2026 年 8 月 29 - 30 日・台中站',
  champion: '桃園永豐雲豹',
  runnerUp: '台南旭日雷霆',
  final: '冠軍戰前 4 回合雙方各取 2 勝，進入第 5 回合 Dreambreaker 決勝——雲豹以 21:18 過關，總回合數 3:2 收下創始賽季首站冠軍。',
  semis: [
    '4 強：桃園永豐雲豹 3:2 力退新竹 YANKEY ACE',
    '4 強：台南旭日雷霆 直落三勝新北蘆沐',
  ],
  quotes: [
    { who: '鍾振煒（雲豹隊長）', text: '沒有想過第 1 站就可以打到最後，整體賽事的氛圍很棒，現場都是熟悉的加油聲。' },
    { who: '蔡萱（雷霆隊長）', text: '整體氛圍感覺比預期還要更好，打起來很順。' },
  ],
};

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
    '首站台中站完賽：冠軍桃園永豐雲豹、亞軍台南旭日雷霆（8/30）',
    '決勝採 Dreambreaker 賽制（第 5 回合單點決勝，冠軍戰 21:18）',
    '第 2 站：9 月 19-20 日高雄駁二特區',
    '第六隊隊名揭露：新竹 YANKEY ACE（首站 4 強）',
    '總獎金 100 萬、8 站 + 11 月總決賽；每隊 6-10 人、每站登錄 4 人',
    '賽事大使：林志穎（開幕記者會親自下場）',
  ],
  pending: [
    '各隊完整選手名單（含 YANKEY ACE、Ahhh、富瑞特科技的首站表現細節）',
    '賽季積分排名的官方發布管道',
    '第 3 站之後的日期與場地',
    '總決賽晉級機制細節',
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
  { title: 'Newtalk：AEPL 創始賽季 5 回合鏖戰 桃園永豐雲豹奪首站冠軍（2026-08-30）', url: 'https://newtalk.tw/news/view/2026-08-30/1056680' },
];
