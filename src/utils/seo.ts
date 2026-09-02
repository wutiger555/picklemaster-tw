import { TOURNAMENTS_2026 } from '../data/tournamentsData';

// SEO 元數據配置
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  structuredData?: any;
}

// 頁面 SEO 配置
export const pageSEO: Record<string, SEOConfig> = {
  home: {
    title: '匹克球台灣 Picklemaster | 全台首選教學平台 & 130+ 球場地圖導航',
    description: '想打匹克球？Picklemaster 提供 2026 最新全台球場地圖、3D 規則教學、裝備選購指南。新手入門必看，一站搞定所有匹克球資訊！立即探索。',
    keywords: '匹克球,台灣匹克球,匹克球台灣,pickleball taiwan,匹克球場地圖,匹克球教學,匹克球規則,匹克球裝備,台北匹克球,台中匹克球,高雄匹克球,台南匹克球,匹克球入門',
    ogImage: '/og-image.png'
  },
  courts: {
    title: '全台匹克球場地圖 2026 » GPS 一鍵找球場 130+ 免費/室內/24H 場地',
    description: '2026 全台最新匹克球場地圖！收錄 130+ 球場，17 縣市全覆蓋（含花博 MAJI、內湖 PicklePickle、板橋國運、台中 YIYI、雲林 PK Park、花蓮 PKing 等）。GPS 定位找最近球場，篩選室內冷氣、戶外免費、24 小時、風雨球場，桃園/新竹/彰化/嘉義新場全更新。',
    keywords: '匹克球場,匹克球場地,皮克球場地,台灣匹克球場,匹克球場地圖,匹克球場推薦,匹克球場預約,戶外匹克球場,免費匹克球場,室內匹克球場,附近匹克球場,最近匹克球場,24小時匹克球場,台北匹克球場,新北匹克球場,桃園匹克球場地,新竹匹克球場,台中匹克球場,彰化匹克球場,嘉義匹克球場,台南匹克球場,高雄匹克球場,屏東匹克球場,宜蘭匹克球場,花蓮匹克球場,南投匹克球場,天母公園匹克球場,大村匹克球,竹北星空匹克球場,北投匹克球場,信義匹克球場,士林匹克球場,內湖匹克球場,大安匹克球場,松山匹克球場,中和匹克球場,新莊匹克球場,板橋匹克球場,淡水匹克球場,龜山匹克球場,中壢匹克球場,平鎮匹克球場,西屯匹克球場,南屯匹克球場,東區匹克球場,鳳山匹克球場,左營匹克球場,前金匹克球場,埔里匹克球場,大村匹克球場,秀水匹克球場,公園匹克球場,河濱匹克球場,學校匹克球場,運動中心匹克球,網球中心匹克球場,PICKZONE,Pickle Day,Downstairs Pickleball,Social N Pickle,P.dang,Seattle Pickleball,pickleball court taiwan,pickleball court taipei,pickleball court kaohsiung,pickleball court taichung,pickleball court taoyuan,pickleball court hsinchu,pickleball near me'
  },
  rules: {
    title: '3分鐘學會匹克球！超簡單 3D 互動規則教學 (雙彈跳/廚房區)',
    description: '文字規則看不懂？全台獨家「3D 互動式教學」！點擊球場直接看解說。秒懂雙彈跳規則、廚房區禁區、發球順序。新手看完直接下場比賽！',
    keywords: '匹克球規則,pickleball rules,匹克球雙彈跳,匹克球廚房區,匹克球發球規則,匹克球計分,匹克球界線,匹克球教學,匹克球入門'
  },
  equipment: {
    title: '匹克球拍怎麼選？2026 新手裝備懶人包：職業選手也推薦',
    description: '買錯球拍最貴！完整匹克球拍材質分析（碳纖維 vs 玻璃纖維）、重量挑選指南。內含「球拍智能推薦系統」，30秒找出最適合你的命定球拍。',
    keywords: '匹克球拍,pickleball paddle,匹克球裝備,球拍推薦,匹克球拍推薦,碳纖維球拍,玻璃纖維球拍,匹克球用品,匹克球裝備購買'
  },
  'learning-paths': {
    title: '匹克球從 0 到 100：新手入門 → 高手進階完整學習地圖',
    description: '別在那裡亂打！系統化匹克球課程，從握拍發球到高階戰術（Third Shot Drop）。分級學習路徑，帶你一步步成為匹克球高手。免費開始學習！',
    keywords: '匹克球教學,匹克球課程,匹克球學習,匹克球訓練,匹克球入門,匹克球技巧,匹克球戰術,pickleball training,pickleball lesson'
  },
  learning: {
    title: '匹克球實戰技巧 | 3D 球路分析 & 360 度站位教學',
    description: '想變強必看！提供 3D 球場戰術板教學、職業選手球路分析。發球致勝技巧、第三球各種打法、網前截擊反應訓練。互動式內容讓你觀念大升級。',
    keywords: '匹克球技巧,匹克球教學,匹克球訓練,匹克球發球,匹克球截擊,匹克球戰術,匹克球策略,pickleball technique'
  },
  game: {
    title: '免費玩！Pickle Master 匹克球 3D 互動遊戲 - 邊玩邊學規則',
    description: '無聊嗎？來場線上匹克球對戰！真實物理引擎模擬，在遊戲中熟悉雙彈跳與截擊時機。免下載直接玩，挑戰最高分！',
    keywords: '匹克球遊戲,pickleball game,匹克球練習,匹克球模擬,線上匹克球,匹克球訓練遊戲'
  },
  scorer: {
    title: '專業匹克球計分器 (App 免下載) - 支援單雙打 & 語音報分',
    description: '打球不再忘記比分！最受好評的線上計分板。全螢幕大字體、支援語音報分、發球方提示。手機就是最好的裁判，完全免費使用。',
    keywords: '匹克球計分器,pickleball scorer,匹克球計分,比賽計分,匹克球裁判,匹克球比分'
  },
  resources: {
    title: '匹克球資源中心 | 台灣球隊、俱樂部、YouTube 頻道總整理',
    description: '找不到球友？這裡有全台匹克球社團與俱樂部名單。精選國內外優質 YouTube 教學頻道、必讀書籍推薦。加入台灣最熱情的匹克球社群！',
    keywords: '匹克球資源,匹克球影片,匹克球YouTube,台灣匹克球協會,匹克球社團,匹克球書籍,pickleball resources'
  },
  about: {
    title: '關於 Picklemaster Taiwan | 我們的使命與故事',
    description: 'Picklemaster Taiwan 是由一群熱愛匹克球的工程師與球友共同打造。我們致力於推廣台灣匹克球運動，透過科技讓學習更有趣、找球場更方便。',
    keywords: '匹克球台灣,台灣匹克球,picklemaster taiwan,匹克球推廣,匹克球社群,台灣運動'
  },
  faq: {
    title: '匹克球 FAQ 懶人包 | 新手最常問的 100 個問題',
    description: '什麼是雙彈跳？球拍要買哪一種？哪裡可以學球？匯整所有匹克球新手最想知道的問題，一次幫你解答。',
    keywords: '匹克球FAQ,匹克球問題,匹克球疑問,匹克球規則問題,匹克球新手問題'
  },
  pro_players: {
    title: '世界頂尖匹克球選手排名 & 裝備解密 | Picklemaster Taiwan',
    description: '認識世界排名前十的匹克球職業選手。Ben Johns 用什麼球拍？Anna Leigh Waters 的必殺技是什麼？完整戰力分析與裝備大公開。',
    keywords: '匹克球選手,匹克球排名,Ben Johns,Anna Leigh Waters,匹克球職業選手,PPA巡迴賽,APP巡迴賽,匹克球球星'
  },
  newcomer: {
    title: '第一次打匹克球就上手 - 台灣新手懶人包 | 費用試算 & 入門指南',
    description: '想打匹克球但不知道從何開始？專為台灣新手設計的懶人包。互動式預算試算（球拍/場地費）、羽球轉匹克球技巧分析、甚至幫你判斷適不適合這項運動。不用爬文，這一頁就夠！',
    keywords: '匹克球新手,匹克球入門,匹克球費用,匹克球拍價格,羽球轉匹克球,網球轉匹克球,匹克球教學,台灣匹克球'
  },
  'newcomer-guide': {
    title: '第一次打匹克球就上手 - 台灣新手懶人包 | 費用試算 & 入門指南',
    description: '想打匹克球但不知道從何開始？專為台灣新手設計的懶人包。互動式預算試算（球拍/場地費）、羽球轉匹克球技巧分析、甚至幫你判斷適不適合這項運動。',
    keywords: '匹克球新手,匹克球入門,匹克球費用,匹克球拍價格,羽球轉匹克球,網球轉匹克球,匹克球教學,台灣匹克球'
  },
  tournaments: {
    title: '2026 台灣匹克球賽事總覽 | CTPF 全年認證賽、國際積分賽',
    description: '完整掌握 2026 台灣匹克球 23 場賽事：AEPL 職業聯賽、TCI APP ASIA TOUR 台北站、金碧盃、新竹縣長盃、南華盃、女子公開賽、臺北公開賽、星動盃、共融盃、TMLP 積分巡迴賽。報名時間、場地、組別一次看。',
    keywords: '2026匹克球賽事,台灣匹克球比賽,CTPF賽事,AEPL,亞洲菁英匹克球聯盟,金碧盃,新竹縣長盃,TMLP,臺灣盃匹克球,NAPA盃,港都盃,中正盃,噶瑪蘭盃,臺北匹克球公開賽,星動盃,共融盃,南華盃,TCI APP ASIA TOUR,大專匹克球,匹克球錦標賽,匹克球報名,匹克球職業聯賽'
  },
  glossary: {
    title: '匹克球術語大全 | 中英對照字典 - Dink, Erne, ATP 全收錄',
    description: '全台最完整的匹克球中英文術語字典。雙彈跳、廚房區、第三球下切、Erne、ATP、疊站、DUPR...規則、技術、戰術、裝備、場地、賽制一次看懂。',
    keywords: '匹克球術語,pickleball glossary,dink,erne,ATP,third shot drop,雙彈跳,廚房區,疊站,DUPR,匹克球英文,匹克球中英對照'
  },
  ratings: {
    title: 'DUPR 評級指南 2026 | 全球通用匹克球動態評分系統完整解析',
    description: '2026 起 DUPR 成為全球匹克球賽事標準。1.0-8.0 評級意義、技術對照、典型球員、如何取得評分。台灣選手完整指南。',
    keywords: 'DUPR,DUPR評級,匹克球評分,匹克球等級,Dynamic Universal Pickleball Rating,匹克球 DUPR 台灣,pickleball rating'
  },
  techniques: {
    title: '匹克球技巧百科 | 12+ 深度教學：Dink、Drop、Erne、ATP 一次掌握',
    description: '從新手握拍到進階 ERNE/ATP，每個技巧都有完整步驟分解、常見錯誤修正、專屬練習菜單與職業選手心法。匹克球技術護城河內容。',
    keywords: '匹克球技巧,pickleball techniques,匹克球教學,dink 教學,third shot drop,erne 教學,ATP 匹克球,匹克球練習,匹克球訓練,匹克球戰術'
  },
  tools: {
    title: '匹克球工具箱 | DUPR 模擬器、輪轉排程、籤表、計分器',
    description: '球友與教練的純前端工具集：DUPR 評分模擬、雙打輪轉排程器、比賽籤表產生器、場地劃線指南、計分器。免下載、免註冊。',
    keywords: '匹克球工具,DUPR 模擬器,輪轉排程,籤表產生器,匹克球計分器,匹克球 App,pickleball tools'
  },
  'tool-dupr': {
    title: 'DUPR 評分模擬器 | 預估下一場比賽對你的評分影響',
    description: '輸入你與對手 DUPR 評分、比賽結果，即時預估你下一場的 DUPR 變動。純前端 Elo 簡化演算法，零後端、即時計算。',
    keywords: 'DUPR 模擬器,DUPR 計算,匹克球評分預估,DUPR simulator,DUPR calculator'
  },
  'tool-rotation': {
    title: '雙打輪轉排程器 | 5-16 人約球自動排輪次',
    description: '球友約球不再手忙腳亂！輸入人數、場次、場地數，自動產生避免重複配對的雙打輪轉表，支援列印帶到球場用。',
    keywords: '匹克球 輪轉,雙打輪轉,約球排程,pickleball rotation,匹克球 約球工具'
  },
  'tool-bracket': {
    title: '比賽籤表產生器 | 單淘汰、循環賽 PDF 列印',
    description: '辦球友聚會、社區小型賽事必備。自動生成單淘汰、循環賽籤表，支援列印。適合 4-32 人規模賽事。',
    keywords: '比賽籤表,pickleball bracket generator,匹克球賽事,循環賽,單淘汰,匹克球小比賽'
  },
  'tool-court-lines': {
    title: '匹克球場地劃線指南 | 標準尺寸 + 羽球場改造教學',
    description: '完整場地尺寸（20×44 英尺）、廚房區位置、網高規範、場地材質建議。教你如何把羽毛球場改造為匹克球場。',
    keywords: '匹克球 場地尺寸,pickleball court dimensions,羽球場 改 匹克球,匹克球 劃線,匹克球 場地建造'
  },
  articles: {
    title: '匹克球深度專欄 | 器材評測、運動科學、族群指南一次看',
    description: '每篇 2000-3000 字深度長文。十大球拍評測、匹克球 vs 網球完整比較、傷害預防、銀髮族入門、營養體能訓練。',
    keywords: '匹克球長文,匹克球評測,匹克球科學,匹克球指南,pickleball article,匹克球教學文章'
  },
  history: {
    title: '匹克球 60 年編年史 1965-2026 | 全球與台灣大事記、規則演變史',
    description: '從 1965 年華盛頓州一個後院發明的遊戲，到 2026 年全球千萬人的運動。30+ 個關鍵事件 × 11 次規則演變完整記錄。',
    keywords: '匹克球歷史,匹克球起源,Pickleball history,匹克球規則演變,CTPF 歷史,匹克球大事紀,匹克球編年史'
  },
  'paddle-database': {
    title: '匹克球拍完整資料庫 | 26 大品牌 45 款規格對照、並排比較',
    description: 'JOOLA、Selkirk、Paddletek、Vatic Pro、Ronbus、Niupipo、Facolos、ProKennex 等 26 大品牌 45 款球拍。小紅書熱門、高 CP 值新手拍完整收錄，附拍型定位與六軸專業篩選，支援 2-4 支規格並排比較。',
    keywords: '匹克球拍資料庫,球拍規格,匹克球拍比較,匹克球拍推薦,新手匹克球拍,JOOLA Perseus,Vatic Pro,Ronbus,Niupipo,高CP值球拍,pickleball paddle database,paddle comparison'
  },
  videos: {
    title: '匹克球教學影片中心 | 20+ 支精選 YouTube 國際名師',
    description: 'Briones、Pickleball University、Enhance Pickleball 等頂級頻道精選教學。從新手規則到進階 ERNE，每支附中文解說與推薦理由。',
    keywords: '匹克球影片,匹克球教學影片,pickleball tutorial,Briones Pickleball,Pickleball University,Enhance Pickleball,匹克球 YouTube'
  },
  'training-programs': {
    title: '匹克球系統訓練菜單 | 8 套週日進度，從新手 8 週到進階 Reset 大師',
    description: '8 套系統化匹克球訓練菜單：新手 8 週入門、Dink 4 週特訓、Third Shot Drop 4 週、銀髮族 12 週、雙打配合 6 週等。每套含逐週逐日具體練習。',
    keywords: '匹克球訓練菜單,匹克球練習,匹克球新手菜單,匹克球進階,pickleball training program,匹克球訓練計劃,匹克球練習表'
  },
  playbook: {
    title: '匹克球戰術劇本庫 | 30+ 情境戰術對照「對方做 X 我該怎麼辦」',
    description: '30+ 比賽情境戰術速查：對方深發球、被連續強攻、搭檔失誤、心理崩盤等。每個情境含為什麼發生、最佳回應、替代方案、職業案例。',
    keywords: '匹克球戰術,匹克球戰略,匹克球比賽戰術,雙打戰術,單打戰術,匹克球策略,pickleball tactics,匹克球比賽應對'
  },
  'hall-of-fame': {
    title: '匹克球名人堂 | 1965 創辦人、傳奇選手、台灣推廣者',
    description: '從 1965 三位後院父親 Joel Pritchard、Bill Bell、Barney McCallum，到 Ben Johns、Anna Leigh Waters 等當代傳奇。台灣 CTPF 陳朝鍵與推廣者也收錄。',
    keywords: '匹克球名人堂,匹克球發明人,Joel Pritchard,Bill Bell,Barney McCallum,USAPA Hall of Fame,匹克球創辦人,陳朝鍵 CTPF,pickleball hall of fame'
  }
};

// 生成頁面標題
export const getPageTitle = (page: string): string => {
  return pageSEO[page]?.title || '匹克球台灣 | Picklemaster Taiwan';
};

// 生成頁面描述
export const getPageDescription = (page: string): string => {
  return pageSEO[page]?.description || '台灣最完整的匹克球學習平台';
};

// 生成關鍵字
export const getPageKeywords = (page: string): string => {
  return pageSEO[page]?.keywords || '匹克球,台灣匹克球,pickleball taiwan';
};

// FAQ 結構化資料
export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "什麼是匹克球（Pickleball）？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "匹克球（Pickleball）是一項結合網球、羽毛球和乒乓球特點的球拍運動。使用類似乒乓球拍的實心球拍和有孔的塑膠球，在類似羽毛球大小的場地上進行。匹克球易學易玩，適合各年齡層，是美國成長最快的運動之一。"
      }
    },
    {
      "@type": "Question",
      "name": "台灣哪裡可以打匹克球？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "台灣目前有超過 130 個匹克球場，分佈於全台 17 個縣市（台北、新北、基隆、桃園、新竹、台中、彰化、南投、雲林、嘉義、台南、高雄、屏東、宜蘭、花蓮）。包括公園、河濱、運動中心、學校操場、24 小時室內專用館等。您可以使用我們的球場地圖功能，搜尋離您最近的匹克球場。"
      }
    },
    {
      "@type": "Question",
      "name": "哪裡有免費的匹克球場？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "全台有 40 座以上免費公共匹克球場，多為公園與河濱場地：台北青年公園、天母運動公園（17 面）、華中/景美/龍山河濱公園；新北大都會公園河濱匹克球中心（8 面）；竹北星空匹克球場、彰化秀水/延平公園、宜蘭運動公園等。免費場通常先到先打，熱門時段需排隊輪場。"
      }
    },
    {
      "@type": "Question",
      "name": "台灣有 24 小時匹克球場嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "有，目前至少 4 處 24 小時匹克球場：桃園 Social N Pickle（龜山）、台中 PICKZONE 凱旋館與朝馬館、台北內湖 PicklePickle 無人智慧場館、新竹寶山 PPClub。多採線上預約與智能門禁，適合夜間與輪班族球友。"
      }
    },
    {
      "@type": "Question",
      "name": "匹克球場地租金大概多少錢？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "公園與河濱戶外場免費；公立運動中心約每小時 NT$300-700；私人室內館約每小時 NT$800-1,500。以 4 人分攤計算，每人每次約 NT$100-300，是門檻相當低的運動。"
      }
    },
    {
      "@type": "Question",
      "name": "匹克球的基本規則是什麼？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "匹克球的核心規則包括：1) 雙彈跳規則 - 發球和接發球都必須讓球落地彈起後才能擊球；2) 廚房區（Non-Volley Zone）- 在網前7英尺區域內不能截擊；3) 對角發球 - 發球必須對角線發向對方場地；4) 計分制 - 只有發球方得分，通常打到11分（領先2分）獲勝。"
      }
    },
    {
      "@type": "Question",
      "name": "新手如何開始學習匹克球？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "新手入門建議：1) 先了解基本規則，可使用我們的互動式規則教學；2) 選擇適合的球拍，初學者建議選擇中等重量（7.5-8.5盎司）的球拍；3) 找離家近的球場練習；4) 加入本地匹克球社群，與球友交流學習；5) 觀看教學影片學習基本技巧。我們提供完整的新手學習路徑幫助您快速上手。"
      }
    },
    {
      "@type": "Question",
      "name": "匹克球拍如何選擇？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "選擇匹克球拍需考慮：1) 材質 - 碳纖維（高級、輕量）、玻璃纖維（中級、耐用）、複合材質（初學、經濟）；2) 重量 - 輕拍（<7.3盎司）靈活、中拍（7.3-8.4盎司）平衡、重拍（>8.5盎司）力量大；3) 握把尺寸 - 測量手掌到無名指尖距離選擇；4) 球拍形狀 - 寬型（甜區大）或長型（觸球範圍廣）。我們提供球拍對比工具和智能推薦系統幫您選擇。"
      }
    },
    {
      "@type": "Question",
      "name": "匹克球和網球有什麼不同？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "主要差異：1) 場地大小 - 匹克球場（13.4m x 6.1m）比網球場小很多；2) 球拍 - 匹克球使用實心球拍，網球使用有線球拍；3) 球 - 匹克球使用塑膠有孔球，網球使用橡膠球；4) 規則 - 匹克球有雙彈跳規則和廚房區限制；5) 運動量 - 匹克球較溫和，適合更廣泛年齡層。"
      }
    },
    {
      "@type": "Question",
      "name": "台灣有匹克球比賽嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "是的，台灣匹克球運動正在快速發展，由中華民國匹克球協會主辦各項賽事。包括全國性錦標賽、分齡賽、地區性聯賽等。賽事資訊可關注台灣匹克球協會官網或加入本地匹克球社群獲取最新消息。"
      }
    },
    {
      "@type": "Question",
      "name": "打匹克球需要什麼裝備？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "基本裝備包括：1) 匹克球拍 - 價格從數百到數千元不等；2) 匹克球 - 室內用球（較軟）或室外用球（較硬）；3) 運動鞋 - 建議穿著室內運動鞋，避免黑色鞋底；4) 運動服裝 - 舒適透氣的運動服；5) 其他 - 護腕、運動毛巾、水壺等。初學者可先到球場租借球拍體驗。"
      }
    },
    {
      "@type": "Question",
      "name": "2026 年台灣有哪些匹克球賽事？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "2026 年台灣主要匹克球賽事包括：1) 1 月 30 日至 2 月 1 日 臺灣盃全國公開賽（宜蘭大學）；2) 2 月底 NAPA 盃全國錦標賽；3) 4 月 港都盃（高雄樹德大學）；4) 6 月 全國中正盃（台北大安運動中心）；5) 8 月 噶瑪蘭盃（宜蘭運動公園）；6) 9 月 臺北匹克球公開賽（國際積分賽）；7) 10 月 亞洲匹克球運動會 APG；8) 11 月 伯朗盃（宜蘭）。完整賽程請見本站 /tournaments 頁面。"
      }
    },
    {
      "@type": "Question",
      "name": "什麼是 DUPR 評級？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DUPR (Dynamic Universal Pickleball Rating) 是全球通用的匹克球動態評級系統，範圍 1.0 到 8.0。2026 年起成為全球主要賽事的報名依據。初學者約 1.0-2.5，中階球員 3.0-4.0，進階玩家 4.0-5.0，職業選手 5.5+（Ben Johns 達 8.0）。台灣選手可透過參加 CTPF 認證賽事累積 DUPR 評分。"
      }
    },
    {
      "@type": "Question",
      "name": "什麼是「廚房區」(Kitchen / Non-Volley Zone)？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "廚房區是球網兩側各 7 英尺（約 2.13 公尺）的禁止截擊區域（正式名稱 Non-Volley Zone, NVZ）。球員站在此區域內或踩線時，不能在球未落地前擊球（稱為 volley）。即使球員起跳截擊後落地進入此區，也算犯規失分。這個規則是為了防止網前強攻，讓比賽更公平。"
      }
    },
    {
      "@type": "Question",
      "name": "什麼是第三球下切 (Third Shot Drop)？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "第三球下切是匹克球最重要的進階技術之一。當接發球方已站在網前時，發球方必須將第三球（回擊接發球回球的那球）打成高弧線並落入對方廚房區。這讓發球方有時間跟著上網，把雙方帶入廚房戰，扭轉開局劣勢。熟練第三球下切是從中階升級到進階的關鍵。"
      }
    },
    {
      "@type": "Question",
      "name": "台灣匹克球有多少人在玩？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "根據中華民國匹克球協會 (CTPF) 統計，台灣匹克球人口從 2024 年的 14 萬、2025 年的 50 萬，2026 年預估突破 120 萬人。全台已認證教練超過 1,400 人，球場數量已達 130+ 處。匹克球是目前台灣成長最快的新興運動。"
      }
    }
  ]
};

// SportsEvent Schema for 2026 tournaments (AI Search Overview 優化)
// 由 TOURNAMENTS_2026 動態產生，賽事資料更新時自動同步
export const tournamentsEventData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      "name": "2026 台灣匹克球賽事總覽",
      "description": "中華民國匹克球總會 (CTPF) 2026 年度認證賽事、職業聯賽與國際賽事完整列表",
      "numberOfItems": TOURNAMENTS_2026.length,
      "itemListElement": TOURNAMENTS_2026.map((t, i) => ({
        "@type": "SportsEvent",
        "position": i + 1,
        "name": t.name,
        ...(t.nameEn ? { "alternateName": t.nameEn } : {}),
        "sport": "Pickleball",
        "startDate": t.date,
        ...(t.endDate ? { "endDate": t.endDate } : {}),
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": t.venue,
          "address": { "@type": "PostalAddress", "addressLocality": t.city, "addressCountry": "TW" }
        },
        "organizer": { "@type": "SportsOrganization", "name": t.organizer },
        ...(t.officialUrl ? { "url": t.officialUrl } : {}),
      })),
    }
  ]
};

// DUPR Ratings DefinedTerm Set
export const ratingsDefinedTermSet = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "name": "DUPR 匹克球評級系統",
  "description": "Dynamic Universal Pickleball Rating - 全球通用匹克球動態評分系統，範圍 1.0-8.0，2026 年起成為全球主要賽事報名依據",
  "hasDefinedTerm": [
    { "@type": "DefinedTerm", "name": "1.0-2.0 初學者 Beginner", "description": "剛接觸匹克球，熟悉基本規則與握拍" },
    { "@type": "DefinedTerm", "name": "2.5 入門 Novice", "description": "能完成基本對打，深度節奏仍不穩定" },
    { "@type": "DefinedTerm", "name": "3.0 初階 Intermediate Low", "description": "掌握基礎擊球，學習軟球策略" },
    { "@type": "DefinedTerm", "name": "3.5 中階 Intermediate", "description": "技術完整，有主動戰術意識" },
    { "@type": "DefinedTerm", "name": "4.0 進階 Advanced", "description": "業餘賽事常勝軍，多樣戰術穩定" },
    { "@type": "DefinedTerm", "name": "4.5-5.0 高手 Expert", "description": "接近職業門檻，全面出色" },
    { "@type": "DefinedTerm", "name": "5.5+ 職業 Pro", "description": "PPA、MLP 國際職業巡迴賽級別" }
  ]
};

// Glossary DefinedTermSet (AI search friendly)
export const glossaryDefinedTermSet = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "name": "匹克球術語大全",
  "description": "Picklemaster Taiwan 編纂的中英對照匹克球術語權威字典，涵蓋規則、技術、戰術、裝備、場地、賽制",
  "inDefinedTermSet": "https://picklemastertw.com/glossary"
};

// 麵包屑結構化資料生成器
export const generateBreadcrumbStructuredData = (items: Array<{ name: string, url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

// 本地商家結構化資料（針對台灣市場）
export const localBusinessStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://picklemastertw.com/#localbusiness",
  "name": "Picklemaster Taiwan",
  "alternateName": "匹克大師台灣",
  "description": "台灣最完整的匹克球學習平台與社群",
  "url": "https://picklemastertw.com/",
  "telephone": "",
  "priceRange": "免費",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "TW",
    "addressRegion": "台灣"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "23.5",
    "longitude": "121.0"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "台北市"
    },
    {
      "@type": "City",
      "name": "新北市"
    },
    {
      "@type": "City",
      "name": "台中市"
    },
    {
      "@type": "City",
      "name": "高雄市"
    },
    {
      "@type": "City",
      "name": "台南市"
    }
  ],
  "serviceType": [
    "匹克球教學",
    "匹克球場地圖",
    "匹克球裝備推薦",
    "匹克球規則教學",
    "匹克球社群"
  ]
};

// HowTo 結構化資料（如何開始打匹克球）
export const howToStructuredData = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "如何開始學習匹克球",
  "description": "完整的匹克球新手入門指南，從了解規則到實戰練習",
  "image": "https://picklemastertw.com/og-image.png",
  "totalTime": "PT2H",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "TWD",
    "value": "1000-3000"
  },
  "tool": [
    {
      "@type": "HowToTool",
      "name": "匹克球拍"
    },
    {
      "@type": "HowToTool",
      "name": "匹克球"
    },
    {
      "@type": "HowToTool",
      "name": "運動鞋"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "了解基本規則",
      "text": "學習匹克球的基本規則，包括雙彈跳、廚房區、發球規則等。使用我們的互動式規則教學快速掌握。",
      "url": "https://picklemastertw.com/rules"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "選擇適合的裝備",
      "text": "根據您的程度和預算選擇球拍。初學者建議選擇中等重量、複合材質的球拍，價格約1000-2000元。",
      "url": "https://picklemastertw.com/equipment"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "尋找附近球場",
      "text": "使用我們的球場地圖功能，找到離您最近的匹克球場。台灣目前有 130+ 個球場可供選擇。",
      "url": "https://picklemastertw.com/courts"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "學習基本技巧",
      "text": "觀看教學影片學習發球、接發球、正反手等基本技巧。使用我們的3D互動教學理解站位和球路。",
      "url": "https://picklemastertw.com/learning"
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "加入社群練習",
      "text": "加入本地匹克球社群，與球友交流學習。參加初學者友善的練習活動，累積實戰經驗。",
      "url": "https://picklemastertw.com/resources"
    }
  ]
};

// Equipment 頁面 - 球拍產品結構化資料
export const equipmentProductData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "匹克球拍選購指南",
  "description": "專業匹克球拍推薦與選購指南，包含材質分析、重量選擇、價格範圍",
  "numberOfItems": 3,
  "itemListElement": [
    {
      "@type": "Product",
      "position": 1,
      "name": "入門級匹克球拍",
      "description": "適合新手的複合材質匹克球拍，重量適中，價格實惠",
      "category": "匹克球拍",
      "brand": { "@type": "Brand", "name": "Picklemaster Taiwan 推薦" },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "TWD",
        "lowPrice": "2000",
        "highPrice": "4000",
        "offerCount": "8",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.3",
        "reviewCount": "50",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [{
        "@type": "Review",
        "author": { "@type": "Organization", "name": "Picklemaster Taiwan" },
        "datePublished": "2026-01-15",
        "reviewBody": "入門級球拍價位親民、容錯率高，是初學者建立基本擊球感的最佳選擇。建議優先選擇複合材質、重量 7.6-8.0oz 的款式。",
        "reviewRating": { "@type": "Rating", "ratingValue": "4.3", "bestRating": "5", "worstRating": "1" }
      }]
    },
    {
      "@type": "Product",
      "position": 2,
      "name": "中階級匹克球拍",
      "description": "玻璃纖維材質，適合中級球員，提供良好的控球性和力量",
      "category": "匹克球拍",
      "brand": { "@type": "Brand", "name": "Picklemaster Taiwan 推薦" },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "TWD",
        "lowPrice": "4000",
        "highPrice": "8000",
        "offerCount": "12",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.6",
        "reviewCount": "120",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [{
        "@type": "Review",
        "author": { "@type": "Organization", "name": "Picklemaster Taiwan" },
        "datePublished": "2026-02-08",
        "reviewBody": "中階拍兼顧控制與力量，玻纖或混碳面板手感佳，DUPR 3.0-3.5 球員首選價位帶。實測 Selkirk、Joola、Engage 等品牌在此區間表現穩定。",
        "reviewRating": { "@type": "Rating", "ratingValue": "4.6", "bestRating": "5", "worstRating": "1" }
      }]
    },
    {
      "@type": "Product",
      "position": 3,
      "name": "高階級碳纖維匹克球拍",
      "description": "職業級碳纖維材質，輕量化設計，提供最佳性能表現",
      "category": "匹克球拍",
      "brand": { "@type": "Brand", "name": "Picklemaster Taiwan 推薦" },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "TWD",
        "lowPrice": "8000",
        "highPrice": "15000",
        "offerCount": "18",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "80",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [{
        "@type": "Review",
        "author": { "@type": "Organization", "name": "Picklemaster Taiwan" },
        "datePublished": "2026-03-20",
        "reviewBody": "頂級碳纖維拍的旋轉量與甜蜜點都遠勝中階拍，職業選手主流選擇。Joola Pro IV、Six Zero Black Diamond、CRBN1X 都在此價格區間，DUPR 4.0+ 推薦升級。",
        "reviewRating": { "@type": "Rating", "ratingValue": "4.8", "bestRating": "5", "worstRating": "1" }
      }]
    }
  ]
};

// Courts 頁面 - 球場地圖結構化資料 (增強版)
export const courtsLocationData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://picklemastertw.com/courts#webpage",
      "url": "https://picklemastertw.com/courts",
      "name": "台灣匹克球場地圖 2026 | 全台 130+ 球場完整資訊",
      "description": "2026 年台灣最完整的匹克球場地圖！GPS 定位找最近球場、篩選室內/戶外/免費/24 小時/公園/河濱場地。",
      "isPartOf": {
        "@id": "https://picklemastertw.com/#website"
      },
      "about": {
        "@type": "Thing",
        "name": "匹克球場",
        "description": "Pickleball Courts in Taiwan"
      },
      "inLanguage": "zh-TW",
      "datePublished": "2024-01-01",
      "dateModified": "2026-07-14"
    },
    {
      "@type": "ItemList",
      "@id": "https://picklemastertw.com/courts#courtlist",
      "name": "台灣匹克球場完整列表",
      "description": "收錄台北、新北、基隆、桃園、新竹、台中、彰化、南投、雲林、嘉義、台南、高雄、屏東、宜蘭、花蓮等 17 縣市全台 130+ 個匹克球場的完整資訊",
      "numberOfItems": 130,
      "itemListElement": [
        {
          "@type": "SportsActivityLocation",
          "position": 1,
          "name": "台北大安森林公園匹克球場",
          "description": "台北市中心知名免費戶外匹克球場，環境優美，4面標準球場",
          "sport": "Pickleball",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "新生南路二段1號",
            "addressLocality": "大安區",
            "addressRegion": "台北市",
            "addressCountry": "TW"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "25.0330",
            "longitude": "121.5354"
          },
          "openingHours": "Mo-Su 06:00-21:00",
          "isAccessibleForFree": true,
          "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "飲水機", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "廁所", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "遮陽棚", "value": true }
          ]
        },
        {
          "@type": "SportsActivityLocation",
          "position": 2,
          "name": "Pickle Day Social Club 信義店",
          "description": "台灣首間匹克球主題社交俱樂部，位於信義區A11百貨",
          "sport": "Pickleball",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "松壽路11號7樓",
            "addressLocality": "信義區",
            "addressRegion": "台北市",
            "addressCountry": "TW"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "25.0362",
            "longitude": "121.5678"
          },
          "openingHours": "Mo-Su 10:00-22:00",
          "isAccessibleForFree": false,
          "priceRange": "$$$"
        },
        {
          "@type": "SportsActivityLocation",
          "position": 3,
          "name": "新北大都會公園河濱匹克球中心",
          "description": "新北市最大匹克球場，8面標準球場，2025年9月啟用",
          "sport": "Pickleball",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "三重區",
            "addressRegion": "新北市",
            "addressCountry": "TW"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "25.0650",
            "longitude": "121.4850"
          },
          "isAccessibleForFree": true
        },
        {
          "@type": "SportsActivityLocation",
          "position": 4,
          "name": "勤美誠品 PiCKLE & CHiLL 高空匹克球場",
          "description": "台中市15樓天台球場，邊打球邊俯瞰台中市景",
          "sport": "Pickleball",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "公益路68號15樓",
            "addressLocality": "西區",
            "addressRegion": "台中市",
            "addressCountry": "TW"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "24.1510",
            "longitude": "120.6648"
          },
          "isAccessibleForFree": false
        },
        {
          "@type": "SportsActivityLocation",
          "position": 5,
          "name": "高雄市立社會教育館匹克球場",
          "description": "高雄市區室內匹克球場，設施完善",
          "sport": "Pickleball",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "小港區",
            "addressRegion": "高雄市",
            "addressCountry": "TW"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "22.5726",
            "longitude": "120.3580"
          }
        }
      ]
    },
    {
      "@type": "WebApplication",
      "@id": "https://picklemastertw.com/courts#webapp",
      "name": "台灣匹克球場地圖",
      "description": "GPS 定位找最近球場、篩選室內/戶外/免費/民營場地的互動式地圖工具",
      "applicationCategory": "SportsApplication",
      "operatingSystem": "Any",
      "browserRequirements": "Requires JavaScript",
      "featureList": [
        "GPS 定位找最近球場",
        "依城市篩選球場",
        "依類型篩選（室內/戶外/風雨球場）",
        "依經營類型篩選（公營/民營/社區）",
        "依收費篩選（免費/付費）",
        "只顯示新開放球場",
        "互動式地圖瀏覽",
        "球場詳細資訊查看"
      ],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TWD"
      }
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://picklemastertw.com/courts#service",
      "name": "台灣匹克球場資訊服務",
      "description": "提供全台匹克球場的完整資訊查詢服務",
      "areaServed": [
        { "@type": "City", "name": "台北市" },
        { "@type": "City", "name": "新北市" },
        { "@type": "City", "name": "桃園市" },
        { "@type": "City", "name": "台中市" },
        { "@type": "City", "name": "台南市" },
        { "@type": "City", "name": "高雄市" },
        { "@type": "City", "name": "新竹市" },
        { "@type": "City", "name": "新竹縣" },
        { "@type": "City", "name": "嘉義市" }
      ],
      "serviceType": "Sports Facility Finder",
      "availableLanguage": "zh-TW"
    }
  ]
};

// Learning 頁面 - 教學課程結構化資料
export const learningCourseData = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "匹克球完整學習課程",
  "description": "從新手到進階的系統化匹克球學習路徑，包含3D互動教學、技巧訓練、戰術指導",
  "provider": {
    "@type": "Organization",
    "name": "Picklemaster Taiwan",
    "url": "https://picklemastertw.com"
  },
  "educationalLevel": "初級到進階",
  "inLanguage": "zh-TW",
  "availableLanguage": "zh-TW",
  "coursePrerequisites": "無需先備知識，適合完全新手",
  "hasCourseInstance": [
    {
      "@type": "CourseInstance",
      "name": "新手入門課程",
      "description": "基礎規則、握拍技巧、發球練習",
      "courseMode": "online",
      "courseWorkload": "PT5H"
    },
    {
      "@type": "CourseInstance",
      "name": "中階進修課程",
      "description": "進階技巧、戰術運用、雙打配合",
      "courseMode": "online",
      "courseWorkload": "PT10H"
    },
    {
      "@type": "CourseInstance",
      "name": "高手養成課程",
      "description": "技術精進、心理素質、競技訓練",
      "courseMode": "online",
      "courseWorkload": "PT15H"
    }
  ],
  "teaches": [
    "匹克球基本規則",
    "發球技巧",
    "接發球技術",
    "正反手擊球",
    "網前截擊",
    "雙打戰術",
    "場上站位",
    "比賽策略"
  ]
};
