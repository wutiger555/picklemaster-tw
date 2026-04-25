// 戰術劇本庫 - 比賽情境 × 最佳回應
// 每則為「對方做 X 時 我該怎麼辦」式情境戰術

export type PlaybookCategory = '開局戰術' | '網前對戰' | '防守反擊' | '心理戰' | '雙打配合' | '單打應變';

export interface PlaybookScenario {
  id: string;
  category: PlaybookCategory;
  scenario: string;        // 情境描述
  whyHappens: string;      // 為什麼會發生
  bestResponse: string;    // 最佳回應
  alternativeResponses?: string[]; // 替代方案
  proExample?: string;     // 職業選手案例
  level: '新手必備' | '中階關鍵' | '進階武器';
}

export const PLAYBOOK: PlaybookScenario[] = [
  // ===== 開局戰術 =====
  {
    id: 'p1',
    category: '開局戰術',
    scenario: '對方發球深而強，把我壓在底線後方',
    whyHappens: '進階對手知道發球是唯一掌控節奏的時機，會故意打深迫使你退後',
    bestResponse: '回深球！把回球打到對方底線前 1 公尺，讓對方來不及上廚房線。然後你立刻向前跑到廚房線。',
    alternativeResponses: [
      '若深球壓力太大，可暫時退後 1 公尺處接球',
      '不要試圖一球攻死，穩定回深就贏一半',
    ],
    proExample: 'Ben Johns 的接發球永遠是「高弧深球」，從不冒險強攻。',
    level: '新手必備',
  },
  {
    id: 'p2',
    category: '開局戰術',
    scenario: '我在發球，第三球被對方接得很好打回我腳邊',
    whyHappens: '對方有經驗，知道你會 drop 或 drive，所以站在廚房線等',
    bestResponse: '改打 Third Shot Drop（高弧軟球）落入對方廚房，給自己時間上廚房線。',
    alternativeResponses: [
      '若球反彈過高，可改 Drive 強攻穿越',
      '混搭 drive 與 drop 不讓對方預判',
    ],
    proExample: '頂尖男雙 70% 第三球選 drop 而非 drive。',
    level: '中階關鍵',
  },
  {
    id: 'p3',
    category: '開局戰術',
    scenario: '對方總是把第三球打到我的反手',
    whyHappens: '反手是大多球員的弱點，對方持續攻擊',
    bestResponse: '練好雙手反手，讓對方知道攻你反手沒便宜可佔。短期可閃身用正手（但不可常用）。',
    alternativeResponses: [
      '與搭檔疊站，讓搭檔擋反手邊',
      '把球拍頭預備姿勢往反手側準備',
    ],
    level: '中階關鍵',
  },

  // ===== 網前對戰 =====
  {
    id: 'p4',
    category: '網前對戰',
    scenario: '對方一直打 Dink 到我的中間，我和搭檔猶豫該誰打',
    whyHappens: '中間球得分率最高的雙打戰術，對手刻意製造你們的溝通失誤',
    bestResponse: '事先約定：「中間正手優先」（兩人中誰用正手能接到該球，由他打）。比賽中可用「我的！」喊話。',
    alternativeResponses: [
      '較強或較積極的搭檔負責所有中間球',
      '看球路角度，靠近對方哪一邊就由那邊處理',
    ],
    proExample: '職業雙打場上每球都會喊「mine」或手勢溝通。',
    level: '新手必備',
  },
  {
    id: 'p5',
    category: '網前對戰',
    scenario: '對方 Dink 越打越深，我感覺站位被擠後',
    whyHappens: '對方在用「深 Dink」推我們離開廚房線',
    bestResponse: '抗拒退後！步伐微調但維持站在廚房線後 10 公分內。深 Dink 落在你腳邊就用 reset 軟球回對方廚房。',
    alternativeResponses: [
      '蹲低身體用拍面接球',
      '若已被推到底線，立刻打 drop 回廚房重新建立',
    ],
    level: '中階關鍵',
  },
  {
    id: 'p6',
    category: '網前對戰',
    scenario: '對方在 Dink Rally 中突然加速進攻 (Speed-up)',
    whyHappens: '對方判斷你的軟球太高，趁機進攻',
    bestResponse: '不要硬反擊！握拍鬆、拍面開放，做 reset 把球軟回對方廚房。心態：「不丟分就贏一半」。',
    alternativeResponses: [
      '若反應夠快、來球高，可 punch volley 反攻',
      '深蹲降低身體吸收球速',
    ],
    proExample: 'Riley Newman 的 reset 成功率 85%+，這是他贏球秘訣。',
    level: '進階武器',
  },
  {
    id: 'p7',
    category: '網前對戰',
    scenario: '我發現對方的反手 Dink 不穩定',
    whyHappens: '大多球員反手 Dink 比正手弱',
    bestResponse: '持續對角線打到對方反手側！不停同樣戰術，直到對方失誤。',
    alternativeResponses: [
      '混搭直線球避免對方猜出',
      '在對方失誤前持續壓制',
    ],
    level: '中階關鍵',
  },
  {
    id: 'p8',
    category: '網前對戰',
    scenario: '對方一直打邊線球，我接得很勉強',
    whyHappens: '對方在拉開角度，把你逼到場外',
    bestResponse: '回深對角斜線球，迫使對方也跑邊線。或打中間直接化解（中間距離最短最穩）。',
    alternativeResponses: [
      '若有機會，可嘗試 ATP（繞網柱）反擊',
      '與搭檔協調好誰負責邊線',
    ],
    level: '中階關鍵',
  },

  // ===== 防守反擊 =====
  {
    id: 'p9',
    category: '防守反擊',
    scenario: '對方扣殺到我的腳邊，我跌跌撞撞勉強回',
    whyHappens: '網前強攻是匹克球最致命武器',
    bestResponse: '降低重心、放鬆握拍 (2-3 分力)、拍面 40 度開放，吸收球速軟回對方廚房 (reset)。',
    alternativeResponses: [
      '若距離夠遠，可用 block volley 阻擋',
      '退一步重置重心',
    ],
    proExample: 'Ben Johns 在被連續扣殺後仍能 reset 成軟球，扭轉節奏。',
    level: '進階武器',
  },
  {
    id: 'p10',
    category: '防守反擊',
    scenario: '對方一直用 Lob 過我頭頂',
    whyHappens: '對方看到你站太靠廚房線，沒留意空中防線',
    bestResponse: '搭檔負責回 Lob！你的搭檔退後接 lob 反擊，你保持廚房線位置。比賽中改變站位深度，避免被持續 lob。',
    alternativeResponses: [
      '判斷 lob 軌跡，提前退兩步用 overhead 反擊',
      '若預判錯誤，乾脆讓球落地後從底線重新建立',
    ],
    level: '中階關鍵',
  },
  {
    id: 'p11',
    category: '防守反擊',
    scenario: '我從廚房被連續強攻打到底線',
    whyHappens: '對方節奏佔上風，連續壓迫',
    bestResponse: '從底線打 reset 高弧球（類似 third shot drop）回對方廚房，給自己時間重新上網。不要從底線硬抽，那是送禮物。',
    alternativeResponses: [
      '搭檔上網，你獨自處理直到能上網為止',
      '冷靜呼吸 1 秒再擊球',
    ],
    level: '進階武器',
  },

  // ===== 心理戰 =====
  {
    id: 'p12',
    category: '心理戰',
    scenario: '我連失 4 球，覺得整場節奏崩了',
    whyHappens: '失敗螺旋（負面思考引發更多失誤）',
    bestResponse: '叫暫停！喝水、深呼吸 3 次、跟搭檔擊掌。重置心情比改變戰術重要。',
    alternativeResponses: [
      '故意打簡單一點，重新找手感',
      '把目標縮小到「下一球只要進」',
    ],
    proExample: 'Federico Staksrud 在落後 0-7 時仍能逆轉，因為他從不放棄重置心情。',
    level: '中階關鍵',
  },
  {
    id: 'p13',
    category: '心理戰',
    scenario: '對方領先 9-2 我已經想放棄',
    whyHappens: '心理放棄比技術差距更早輸球',
    bestResponse: '把目標改為「下一球得分」，不去想 11 分。一球一球贏回來。匹克球從 1-9 翻盤的故事每天都在發生。',
    alternativeResponses: [
      '改變戰術製造變化（如改打中間或對手較弱邊）',
      '提醒自己這只是練習，享受過程',
    ],
    level: '進階武器',
  },
  {
    id: 'p14',
    category: '心理戰',
    scenario: '對手是熟人但球技高我許多，我感到壓力',
    whyHappens: '熟人前的失敗讓人更敏感',
    bestResponse: '把對方視為「教練」而非「對手」。每球都當作學習機會。心態從「我要贏」改為「我能學到什麼」。',
    level: '新手必備',
  },

  // ===== 雙打配合 =====
  {
    id: 'p15',
    category: '雙打配合',
    scenario: '我和搭檔常常撞到（搶同一顆球）',
    whyHappens: '溝通系統未建立',
    bestResponse: '建立 3 個關鍵手勢/喊話：「我的！」「你的！」「Switch！」（換邊）。賽前演練 5 分鐘。',
    alternativeResponses: [
      '事先分工：誰負責正手邊、誰負責反手邊',
      '較強選手負責中間球與機會球',
    ],
    proExample: 'Ben Johns 與 JW Johnson 雙打時 90% 球路都有手勢溝通。',
    level: '新手必備',
  },
  {
    id: 'p16',
    category: '雙打配合',
    scenario: '搭檔失誤後我感到沮喪',
    whyHappens: '雙打的勝負取決於兩人狀態，搭檔失誤直接影響我',
    bestResponse: '永遠正面回應！「沒關係」「下一球」「打得好嘗試」。沮喪會讓搭檔更緊張、失誤更多。',
    alternativeResponses: [
      '主動擊掌、給予肯定',
      '討論時改用「我們」而非「你」',
    ],
    level: '新手必備',
  },
  {
    id: 'p17',
    category: '雙打配合',
    scenario: '我和搭檔一強一弱，對方一直攻搭檔',
    whyHappens: '對方識別出較弱的選手',
    bestResponse: '使用疊站！讓較強選手永遠在中間或對手要打的方向。較弱選手負責簡單球路。',
    alternativeResponses: [
      '較強選手主動 poach（搶球）保護搭檔',
      '較弱選手提升站位至廚房線，減少被攻機會',
    ],
    level: '中階關鍵',
  },
  {
    id: 'p18',
    category: '雙打配合',
    scenario: '我們搭檔程度差不多但常輸給較強對手',
    whyHappens: '可能是戰術不夠成熟、或缺乏專注',
    bestResponse: '比賽前 5 分鐘討論戰術主軸：「今天主攻對方反手」或「全程只打對角」。專注一個主題勝過亂打。',
    level: '中階關鍵',
  },

  // ===== 單打應變 =====
  {
    id: 'p19',
    category: '單打應變',
    scenario: '對方比我體能好，把我跑到喘不過氣',
    whyHappens: '單打靠跑動，體能差距明顯',
    bestResponse: '改打深底線球 + Lob 拉開時間，讓對方也跑遠。或多打中間球，雙方都不用跑太遠。',
    alternativeResponses: [
      '中場休息盡量補水',
      '降低自己球速，把節奏放慢',
    ],
    level: '中階關鍵',
  },
  {
    id: 'p20',
    category: '單打應變',
    scenario: '對方發球後立刻上網，我每球都被截',
    whyHappens: '單打中對方有侵略性',
    bestResponse: '回深球 + 用 lob！打出對方頭頂的 lob 讓他退後，破壞他上網節奏。',
    alternativeResponses: [
      '回低弧線快速球擦網落腳',
      '改打對方「無人地帶」（網與底線中間）',
    ],
    level: '中階關鍵',
  },
  {
    id: 'p21',
    category: '單打應變',
    scenario: '單打中我發現對方反手很弱',
    whyHappens: '反手對單打選手特別致命（無搭檔支援）',
    bestResponse: '所有球都打對方反手側！持續到對方失誤或調整。單打就是要利用對方弱點到極致。',
    level: '中階關鍵',
  },

  // ===== 進階情境 =====
  {
    id: 'p22',
    category: '網前對戰',
    scenario: '對方總用同樣模式攻我（如連續 3 球打反手）',
    whyHappens: '對方發現有效戰術會不斷重複',
    bestResponse: '反向利用！既然知道對方會打反手，提前準備 → 用反手主動進攻反擊。',
    alternativeResponses: [
      '用 ERNE 跳擊截斷對方節奏',
      '與搭檔疊站讓對方無法繼續攻反手',
    ],
    level: '進階武器',
  },
  {
    id: 'p23',
    category: '雙打配合',
    scenario: '我們有人左手有人右手，對方專攻雙手中間',
    whyHappens: '一左一右搭檔的中間是雙反手（弱邊）',
    bestResponse: '使用 Stacking！讓雙正手都對網中央，左手在左、右手在右的「假右站位」。',
    proExample: '世界女雙 Anna Leigh Waters (右) 與 Catherine Parenteau (左) 全場用 stacking。',
    level: '進階武器',
  },
  {
    id: 'p24',
    category: '防守反擊',
    scenario: '對方持續打 Body shot（直接打我身體）',
    whyHappens: '中階以上球員會故意打 body 製造尷尬擊球',
    bestResponse: '快速側移讓出身體！用反手 punch 短促擊回對方廚房。Body shot 最佳防守是「不在身體前」。',
    level: '進階武器',
  },
  {
    id: 'p25',
    category: '心理戰',
    scenario: '對方話多／挑釁，影響我的專注',
    whyHappens: '心理戰術，故意干擾你',
    bestResponse: '不要回應！戴耳機、與搭檔說笑、專注呼吸。心理素質強的選手不受影響。',
    proExample: 'Ben Johns 即使被挑釁仍保持微笑，這是他的招牌。',
    level: '中階關鍵',
  },
  {
    id: 'p26',
    category: '網前對戰',
    scenario: '我打出機會球，但只是把球擊回沒得分',
    whyHappens: '不敢進攻或瞄準不準',
    bestResponse: '機會球（過頭高、彈起腰部以上）必須瞄準對方腳邊或兩人中間，不打對手身體前方。',
    alternativeResponses: [
      '進攻時用 punch volley 而非全力扣殺',
      '練習瞄準特定區域',
    ],
    level: '中階關鍵',
  },
  {
    id: 'p27',
    category: '單打應變',
    scenario: '比賽 2-2 平手，第三局決勝',
    whyHappens: '心理壓力最大時刻',
    bestResponse: '回到基本款。發穩、回深、打對手弱邊、不冒險。決勝局靠的是少失誤而非多得分。',
    level: '中階關鍵',
  },
  {
    id: 'p28',
    category: '雙打配合',
    scenario: '搭檔上網後留下大空檔，被對方打中間',
    whyHappens: '搭檔上網時你沒同步移動補位',
    bestResponse: '搭檔移動，你也要同步移動！如搭檔向左 poach，你立刻補到中間填空。',
    level: '中階關鍵',
  },
  {
    id: 'p29',
    category: '開局戰術',
    scenario: '我發球老是發到對方廚房（短球）',
    whyHappens: '發球緊張、用力過頭或拍面角度錯',
    bestResponse: '改慢、改穩。發球目標是「進對方發球區後半」，不是發出 winner。每場前先練 10 顆穩定發球。',
    alternativeResponses: [
      '改用下拋發球更穩',
      '降低引拍幅度',
    ],
    level: '新手必備',
  },
  {
    id: 'p30',
    category: '心理戰',
    scenario: '我的球友裡某人總讓我心情不好',
    whyHappens: '個性、打球風格或言行不合',
    bestResponse: '匹克球是社交運動，找對球友比技術更重要。不適合的人就減少對戰，找尊重彼此的搭檔。',
    level: '新手必備',
  },
];

export const PLAYBOOK_CATEGORIES: PlaybookCategory[] = [
  '開局戰術', '網前對戰', '防守反擊', '心理戰', '雙打配合', '單打應變'
];
