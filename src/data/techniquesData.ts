// 匹克球技巧百科 - 深度內容
// 每則技巧為獨立教學頁，SEO + AI Search 主要護城河內容

export type TechniqueLevel = '新手' | '初階' | '中階' | '進階' | '高手';
export type TechniqueCategory = '擊球' | '發球' | '網前' | '防守' | '戰術' | '步法';

export interface Technique {
  slug: string;                      // URL 用，必須英數小寫
  name: string;                      // 中文技巧名
  nameEn: string;                    // 英文名
  tagline: string;                   // 一句話描述
  level: TechniqueLevel;
  category: TechniqueCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;     // 難度 1-5
  timeToLearn: string;               // 預估學習時間 e.g. "2-4 週"
  whenToUse: string;                 // 什麼時候該用
  keyPoints: string[];               // 3-6 個關鍵動作要點
  steps: {
    title: string;
    description: string;
  }[];
  commonMistakes: {
    mistake: string;
    fix: string;
  }[];
  drills: {
    name: string;
    description: string;
    reps: string;                    // e.g. "30 下 × 3 組"
  }[];
  proTip: string;                    // 進階小撇步
  relatedTechniques: string[];       // 相關技巧 slug
  videoKeywords: string[];           // YouTube 搜尋關鍵字建議
}

export const TECHNIQUES: Technique[] = [
  {
    slug: 'continental-grip',
    name: '大陸式握拍',
    nameEn: 'Continental Grip',
    tagline: '匹克球最通用的握拍法，一種握法應付所有球路',
    level: '新手',
    category: '擊球',
    difficulty: 1,
    timeToLearn: '1-2 天',
    whenToUse: '所有擊球場合都可以用，是新手最該優先掌握的唯一握拍',
    keyPoints: [
      '像握鐵鎚一樣自然抓住球拍',
      '虎口對齊拍柄頂端的斜邊',
      '食指微微下壓拍柄，形似扣板機',
      '握力放鬆（5-6 分力），進攻瞬間再加力',
      '無需頻繁切換握法',
    ],
    steps: [
      {
        title: '1. 握拍定位',
        description: '讓拍面朝前，拍柄水平放在地上或桌上。虎口（拇指與食指之間）對準拍柄上方的斜邊（第 2 號切面）。',
      },
      {
        title: '2. 自然握住',
        description: '像握鐵鎚或打招呼（握手）那樣自然抓住拍柄。食指微微前伸扣住拍柄，像扣板機一樣。',
      },
      {
        title: '3. 檢查虎口',
        description: '從拍頭向下看，手掌背面中線應與拍面垂直。拍面正視前方時，虎口形成的 V 字要剛好壓在拍柄中線。',
      },
      {
        title: '4. 放鬆握力',
        description: '平時保持 5-6 分力（手腕可以輕鬆扭動）。僅在觸球瞬間短暫加到 8 分力。握太緊會失去手感與爆發。',
      },
    ],
    commonMistakes: [
      {
        mistake: '握太緊（Death Grip）',
        fix: '打球時應該像握小鳥，不能讓牠飛走、也不能捏死牠。太緊會失去軟球手感。',
      },
      {
        mistake: '拇指貼在拍柄側面（像握鍋鏟）',
        fix: '拇指應放在握把上側與食指對稱，提供中線支撐而非側推力。',
      },
      {
        mistake: '不同球路換不同握法（如網球思維）',
        fix: '匹克球場地小、反應時間短（約 0.3 秒），無暇換握。統一用大陸式應付所有情境。',
      },
    ],
    drills: [
      {
        name: '鏡前握拍檢查',
        description: '對著鏡子做握拍動作，確認虎口位置與食指角度。',
        reps: '每次練習前 30 秒',
      },
      {
        name: '單手顛球',
        description: '用拍面正反兩面交替顛球，訓練握拍的細微調整能力。',
        reps: '連續 50 下 × 3 組',
      },
    ],
    proTip: '職業選手如 Ben Johns 也都全程用大陸式握拍。不要被網球教練的「東方式正手、西方式反手」誤導——匹克球是完全不同的運動。',
    relatedTechniques: ['forehand-drive', 'backhand-drive', 'dink'],
    videoKeywords: ['pickleball continental grip', '匹克球 握拍', 'Ben Johns grip tutorial'],
  },
  {
    slug: 'dink',
    name: '軟球（Dink）',
    nameEn: 'Dink',
    tagline: '匹克球靈魂技巧 — 廚房戰的核心武器',
    level: '初階',
    category: '網前',
    difficulty: 2,
    timeToLearn: '2-4 週穩定',
    whenToUse: '雙方都在網前（廚房線後）時，透過低弧、短距離的軟球讓對手無法進攻',
    keyPoints: [
      '從廚房線外側打出',
      '球路呈低弧線，剛好過網',
      '落點在對方廚房區（Non-Volley Zone）',
      '用肩膀帶動，而非手腕',
      '拍面向上開放約 20-30 度',
      '保持下半身微蹲、重心低',
    ],
    steps: [
      {
        title: '1. 站位準備',
        description: '雙腳與肩同寬，膝蓋微彎，站在廚房線後一步（約 30 公分），拍頭保持在腰部高度向前。',
      },
      {
        title: '2. 引拍（極小）',
        description: '以肩膀為軸做極短的後引，拍頭只後拉約 30 公分。不要像網球那樣大揮。',
      },
      {
        title: '3. 接觸球的位置',
        description: '在身體前方約 30-60 公分、腰部高度接觸球。拍面略向上開放（20-30°）。',
      },
      {
        title: '4. 送球',
        description: '用肩膀帶動手臂向前上方推送，手腕鎖定。想像把球「舉起來」越過網。',
      },
      {
        title: '5. 跟進',
        description: '拍頭停在肩膀高度，保持開放拍面。立刻回到預備姿勢等下一球。',
      },
    ],
    commonMistakes: [
      {
        mistake: '用手腕發力，造成球彈跳太高',
        fix: '鎖死手腕，改由肩膀推動。想像拍柄是直尺，整條直尺平移，而非甩動。',
      },
      {
        mistake: '站太後面，只能抽球',
        fix: '積極站上廚房線。軟球距離越短，對手越難反擊。',
      },
      {
        mistake: '球過高變成進攻機會',
        fix: '目標是球越網後只比網高 10-20 公分。寧可掛網重來，也不要送肉包子。',
      },
    ],
    drills: [
      {
        name: '雙人 Dink 對打',
        description: '兩人站在廚房線兩側，只打軟球，目標連續 30 下不失誤。',
        reps: '15 分鐘 × 2 回合',
      },
      {
        name: '對牆 Dink',
        description: '距牆 3 公尺站定，對牆低弧擊球，球彈地後輕推回牆，連續不斷。',
        reps: '連續 20 下 × 5 組',
      },
      {
        name: '交叉對角 Dink',
        description: '與搭檔各站自己一側廚房線外，只打對角線軟球。',
        reps: '每方向 50 球',
      },
    ],
    proTip: '頂尖選手的 dink 80% 是「交叉 dink」（cross-court dink），因為過網距離較長、對角網較低，成功率最高。新手先練對角，再練直線。',
    relatedTechniques: ['third-shot-drop', 'reset', 'volley'],
    videoKeywords: ['pickleball dink tutorial', '匹克球 軟球', 'how to dink better'],
  },
  {
    slug: 'third-shot-drop',
    name: '第三球下切',
    nameEn: 'Third Shot Drop',
    tagline: '從中階升級到進階的關鍵一球',
    level: '中階',
    category: '擊球',
    difficulty: 4,
    timeToLearn: '2-3 個月穩定',
    whenToUse: '你是發球方、已發完球並接到對方回擊（即第三球），對方已站上網前。用第三球下切扭轉開局劣勢，跟上網前。',
    keyPoints: [
      '目標落點：對方廚房區（NVZ）',
      '弧線高、速度慢（像高拋物線）',
      '從底線打到網前約 12 公尺',
      '成功後要立刻跟上到網前',
      '不求得分，只求過渡',
      '失敗率接受 30-40%，重點是「大多時候能進」',
    ],
    steps: [
      {
        title: '1. 判斷時機',
        description: '對方回球落在你半場後半時優先選 drop；若球短、彈起太高，可改打 drive（強攻球）。',
      },
      {
        title: '2. 下蹲取球',
        description: '膝蓋大幅彎曲，讓拍面從低位取球。身體重心降到球以下。',
      },
      {
        title: '3. 開放拍面',
        description: '拍面向上打開約 30-45 度，像用勺子把球「舀」起來。',
      },
      {
        title: '4. 慢速推送',
        description: '從後到前緩慢推送，完全不發力。想像在「放下」一顆球，而非「打」。',
      },
      {
        title: '5. 立刻上網',
        description: '擊球後不要停留看結果，立刻小步快跑到廚房線。跟上的速度決定這一分的勝負。',
      },
    ],
    commonMistakes: [
      {
        mistake: '球太高、變成對手的扣殺禮物',
        fix: '降低拍面角度、減慢速度。弧線最高點應在球網前 1-2 公尺。',
      },
      {
        mistake: '球不夠深，自己還在底線',
        fix: '目標落點是對方廚房區內最深處（最靠網面但還在廚房內）。',
      },
      {
        mistake: '打完停在原地',
        fix: '打完就跑，跑得比球慢沒關係，重點是你有移動。',
      },
      {
        mistake: '用力揮、當抽球打',
        fix: 'Drop 是「托、放」而不是「打」。用腿和肩膀的重心轉移，手臂幾乎不動。',
      },
    ],
    drills: [
      {
        name: '底線 drop 到網前',
        description: '一人站底線打 drop，另一人站廚房線回軟球。專注讓每球都落在廚房內。',
        reps: '50 顆 × 3 組',
      },
      {
        name: '移動式 drop',
        description: '打完 drop 後立刻跑到網前，搭檔會繼續回球，雙方形成廚房對戰。',
        reps: '連續 20 回合',
      },
      {
        name: '弧線目標練習',
        description: '在對方廚房內放置大浴巾當目標，專門瞄準落點。',
        reps: '100 顆 / 天',
      },
    ],
    proTip: '頂尖選手（DUPR 5.5+）的第三球成功率約 70-75%。中階球員能達到 50% 就已經是非常好的水準。不要對自己太嚴格，重點是願意嘗試、而非只會 drive（強攻）。',
    relatedTechniques: ['dink', 'drive', 'reset'],
    videoKeywords: ['third shot drop tutorial', '第三球下切', 'pickleball third shot drop'],
  },
  {
    slug: 'forehand-drive',
    name: '正手抽球',
    nameEn: 'Forehand Drive',
    tagline: '進攻基石 — 快速、低平、有穿透力',
    level: '初階',
    category: '擊球',
    difficulty: 2,
    timeToLearn: '2-3 週',
    whenToUse: '對方回球偏高或短，位於自己正手方時；或第三球選擇強攻路線時',
    keyPoints: [
      '側身站位，非正面對網',
      '短距離引拍（比網球小 60%）',
      '從低到高的擊球軌跡',
      '擊球點在身體前方',
      '跟進指向目標方向',
    ],
    steps: [
      {
        title: '1. 側身準備',
        description: '左腳（右撇子）向前踏出半步，身體轉向右側。非持拍手指向來球方向。',
      },
      {
        title: '2. 短引拍',
        description: '拍頭往後拉到大約腰部後方，別超過身體線。匹克球場小、反應時間短，大揮容易來不及。',
      },
      {
        title: '3. 重心轉移',
        description: '從右腳蹬地、重心轉到左腳，帶動腰部與肩膀旋轉。',
      },
      {
        title: '4. 接觸球',
        description: '在左腳斜前方、大腿高度接觸球。拍面稍微向下關閉（製造平球路）或垂直（標準）。',
      },
      {
        title: '5. 跟進',
        description: '拍頭跟進到左肩前方，指向目標方向。身體完全轉向網前。',
      },
    ],
    commonMistakes: [
      {
        mistake: '像網球一樣大揮，球出界或失控',
        fix: '引拍幅度減半。匹克球塑膠球慢、輕，不需要大動作。',
      },
      {
        mistake: '用手臂發力，肩膀沒跟上',
        fix: '發力順序：腿 → 腰 → 肩 → 手。手只是最後傳遞力量。',
      },
      {
        mistake: '擊球點在身體側面或後方',
        fix: '應該在前方。讓球「追著你的拍子」，而不是等球過來再打。',
      },
    ],
    drills: [
      {
        name: '底線對打',
        description: '兩人站底線連續正手抽球，要求 20 下不失誤。',
        reps: '3 組，每組 3 分鐘',
      },
      {
        name: '餵球穩定性',
        description: '搭檔在網前餵高球，打 30 顆正手，要求每球都能落在深區（底線前 1 公尺內）。',
        reps: '50 球 × 2 組',
      },
    ],
    proTip: '第三球選 drive 還是 drop？簡易判斷：球彈起後低於你的大腿高度，選 drop；高於腰部，選 drive；介於中間看戰術（要速攻選 drive、想上網選 drop）。',
    relatedTechniques: ['backhand-drive', 'third-shot-drop', 'continental-grip'],
    videoKeywords: ['pickleball forehand drive', '匹克球 正手', 'forehand technique'],
  },
  {
    slug: 'backhand-drive',
    name: '反手抽球',
    nameEn: 'Backhand Drive',
    tagline: '業餘選手常輸的關鍵 — 練好反手勝率立漲',
    level: '初階',
    category: '擊球',
    difficulty: 3,
    timeToLearn: '3-4 週',
    whenToUse: '球來到左側（右撇子）時；無法閃身用正手時的必備武器',
    keyPoints: [
      '雙手或單手都可，新手建議雙手反手更穩',
      '側身角度要夠（背對部分球網）',
      '擊球點在前方、髖關節高度',
      '重心從後腳轉到前腳',
      '拍面垂直、不要過度關閉',
    ],
    steps: [
      {
        title: '1. 轉體側身',
        description: '左腳（右撇子）往左前方踏出，身體左轉 60-90 度。右肩略下沉。',
      },
      {
        title: '2. 雙手握拍',
        description: '右手大陸式握拍不變，左手輔助握在右手上方（像棒球打擊）。新手強烈建議雙手版本。',
      },
      {
        title: '3. 短引拍',
        description: '拍頭拉到左側腰後方，拍面保持垂直地面。',
      },
      {
        title: '4. 從低到高掃擊',
        description: '像「剖西瓜」的動作，由下往上揮出，重心從左腳推到右腳。',
      },
      {
        title: '5. 跟進到右肩',
        description: '拍頭掃過身體，最終停在右肩前方。左手自然放開或跟到胸前。',
      },
    ],
    commonMistakes: [
      {
        mistake: '沒轉體，變成「推球」',
        fix: '反手最大挑戰是轉體意識。球來就想「轉」，不是「推」。',
      },
      {
        mistake: '單手反手無力又出界',
        fix: '改為雙手反手。中階以下 90% 球員雙手反手比單手穩定。',
      },
      {
        mistake: '拍面過度關閉造成下網',
        fix: '拍面保持垂直到微開放，信任擊球軌跡的向上角度會把球帶過網。',
      },
    ],
    drills: [
      {
        name: '牆面反手連擊',
        description: '對牆只用反手，球彈一次後繼續擊牆。',
        reps: '連續 30 下 × 5 組',
      },
      {
        name: '交叉反手對打',
        description: '兩人站對角，只用反手對打，訓練穩定性與方向控制。',
        reps: '15 分鐘',
      },
    ],
    proTip: '世界排名前 10 的女單選手 Anna Leigh Waters 的雙手反手是她最強武器之一，連男子職業選手都會避免攻她反手。證明雙手反手在匹克球比網球更有效。',
    relatedTechniques: ['forehand-drive', 'two-handed-backhand', 'backhand-dink'],
    videoKeywords: ['pickleball backhand drive', 'two handed backhand pickleball', '匹克球 反手'],
  },
  {
    slug: 'serve',
    name: '發球',
    nameEn: 'Serve',
    tagline: '比賽唯一自己掌握節奏的一球',
    level: '新手',
    category: '發球',
    difficulty: 2,
    timeToLearn: '1-2 週',
    whenToUse: '每一局、每一回合的第一球。目標不是得分，是確保發球「必進」且具備一定威脅性。',
    keyPoints: [
      '必須下手擊球（接觸點低於腰部、拍頭低於手腕）',
      '對角發向對方發球區',
      '球不能落在廚房內（包含線）',
      '2021 年起可用「下拋發球」（Drop Serve）',
      '追求 100% 進球率，不追求高風險 ace',
    ],
    steps: [
      {
        title: '1. 站位',
        description: '站在底線後方，腳不能碰到底線。雙腳與肩同寬，半側身面向對角發球區。',
      },
      {
        title: '2. 持球與拋球',
        description: '左手（右撇子）持球在身體前方腰部高度。輕輕放下球讓它自由下落，或者不放手直接擊球。',
      },
      {
        title: '3. 引拍',
        description: '拍頭從後下方向前上方掃出，像鐘擺一樣。引拍不要過肩。',
      },
      {
        title: '4. 接觸球',
        description: '在腰部以下、身體前方 30 公分接觸球。拍頭必須低於手腕。',
      },
      {
        title: '5. 跟進',
        description: '拍頭繼續向前上方送出，最終指向目標方向。',
      },
    ],
    commonMistakes: [
      {
        mistake: '過網但落在廚房內 = 失誤',
        fix: '目標落點要深（對方發球區後半），不要追求剛好過網。',
      },
      {
        mistake: '想發 ace 結果球出界',
        fix: '發球失誤對手直接得發球權，是最虧的失誤。穩 > 狠。',
      },
      {
        mistake: '接觸點過高被判違規',
        fix: '腰部高度上限。可請裁判或搭檔側拍錄影檢查自己動作。',
      },
    ],
    drills: [
      {
        name: '目標發球',
        description: '在對方發球區放 4 個目標區（左深、左淺、右深、右淺），每區連中 5 球。',
        reps: '20 球 × 4 區',
      },
      {
        name: '下拋發球練習',
        description: '讓球自由下落後再擊，適應新規則的節奏。',
        reps: '50 球 / 天',
      },
    ],
    proTip: '進階技巧：以「短球深球混搭」威脅對手。深球迫使對方退底線、短球迫使對方前撲，打亂對手站位節奏。但前提是自己發球 100% 進。',
    relatedTechniques: ['drop-serve', 'return-of-serve', 'continental-grip'],
    videoKeywords: ['pickleball serve tutorial', '匹克球 發球', 'pickleball drop serve'],
  },
  {
    slug: 'return-of-serve',
    name: '接發球',
    nameEn: 'Return of Serve',
    tagline: '被忽略但決定性的一球 — 打得深、跑得快',
    level: '初階',
    category: '擊球',
    difficulty: 2,
    timeToLearn: '1 週',
    whenToUse: '每次對方發球時。你的目標有兩個：把球回得夠深（讓對方不能輕鬆上網）+ 自己跟著上廚房線。',
    keyPoints: [
      '站位深（底線後方 30 公分）',
      '讓球落地彈起（雙彈跳規則）',
      '目標落點：對方底線前 1 公尺',
      '弧線高一點沒關係，深最重要',
      '打完立刻跟上廚房線',
    ],
    steps: [
      {
        title: '1. 預備站位',
        description: '站在底線後 30 公分，略微側身朝正手邊。膝蓋微彎、拍頭向前。',
      },
      {
        title: '2. 判讀來球',
        description: '看發球員拍面方向預判落點。一邊觀察一邊小碎步移動。',
      },
      {
        title: '3. 讓球落地',
        description: '規則要求雙彈跳，不能直接截擊發球。等球彈起到上升段再擊球。',
      },
      {
        title: '4. 深度擊球',
        description: '用 70% 力道打出又高又深的球。目標讓球落在對方底線前 1 公尺內。',
      },
      {
        title: '5. 立刻上網',
        description: '擊球完就跑！在對方回擊前到達廚房線。這是贏球的關鍵動作。',
      },
    ],
    commonMistakes: [
      {
        mistake: '回球短、讓對方輕鬆上網',
        fix: '寧可打到底線外 10 公分（丟分 1 球），也不要回在半場中間。',
      },
      {
        mistake: '打完原地觀察結果',
        fix: '回球後立刻向前衝，跑的同時看球飛向對方。',
      },
      {
        mistake: '想一球打死，結果自己失誤',
        fix: '接發球不是進攻機會。穩定、深、跟上網前即為勝。',
      },
    ],
    drills: [
      {
        name: '深度接發球',
        description: '搭檔連續發球，每次接發球目標落在底線前 1 公尺的貼線區。',
        reps: '30 球 × 3 組',
      },
      {
        name: '接發球 + 跟進',
        description: '回球後立刻跑到廚房線，計時。目標 4 秒內到位。',
        reps: '20 次',
      },
    ],
    proTip: '職業選手的接發球 90% 都是「高弧深球」而非強攻。因為匹克球場小，深球時間換空間才是王道。學會耐心，不要每球都想 winner。',
    relatedTechniques: ['serve', 'third-shot-drop'],
    videoKeywords: ['pickleball return of serve', '匹克球 接發球'],
  },
  {
    slug: 'volley',
    name: '截擊',
    nameEn: 'Volley',
    tagline: '網前致勝武器 — 但千萬別踩到廚房線',
    level: '初階',
    category: '網前',
    difficulty: 3,
    timeToLearn: '2-4 週',
    whenToUse: '你站在廚房線外、對方球過網而你能在球落地前擊中（不能在廚房內截擊！）',
    keyPoints: [
      '絕對不能站在廚房內截擊',
      '拍面頂上、擋住來球',
      '不需要引拍，純粹阻擋',
      '用肩膀鎖定，手腕不動',
      '判斷來球高度決定攻守',
    ],
    steps: [
      {
        title: '1. 預備姿勢',
        description: '站在廚房線後 10 公分，雙腳與肩同寬。拍頭豎直、保持在眼睛前方。',
      },
      {
        title: '2. 讀球判斷',
        description: '來球高過網（攻擊機會）或低於網（只能防守推回）？',
      },
      {
        title: '3. 拍面對準',
        description: '拍面像牆一樣正對來球，不需要後引。',
      },
      {
        title: '4. 短促阻擋',
        description: '肩膀微推（像給球一個小耳光），整個動作只有 15 公分左右的範圍。',
      },
      {
        title: '5. 回復預備',
        description: '擊球後立刻回到預備姿勢，準備下一球。絕對不能因為截擊後的慣性踩進廚房。',
      },
    ],
    commonMistakes: [
      {
        mistake: '踩線截擊被判失分',
        fix: '截擊時腳不能碰廚房線（包含線本身）。習慣站廚房線後 10 公分。',
      },
      {
        mistake: '大揮像網球截擊',
        fix: '匹克球截擊距離短、球速慢，不需要大動作，純擋即可。',
      },
      {
        mistake: '軟球被我用截擊推回造成機會球',
        fix: '對方故意打軟球時，讓它先落地再軟球回擊（dink），不要硬截擊。',
      },
    ],
    drills: [
      {
        name: '牆上截擊',
        description: '距牆 2 公尺，連續截擊彈回的球。',
        reps: '50 次 × 3 組',
      },
      {
        name: '廚房邊線站位',
        description: '只站廚房線後 10 公分練截擊，培養不踩線的肌肉記憶。',
        reps: '15 分鐘',
      },
    ],
    proTip: '截擊進階版是「punch volley」（拳擊式截擊）— 當對方球高出網 30 公分以上時，用肩膀短促推擊製造得分機會。但風險高，中階以上再練。',
    relatedTechniques: ['dink', 'erne', 'punch-volley'],
    videoKeywords: ['pickleball volley technique', '匹克球 截擊'],
  },
  {
    slug: 'reset',
    name: '重置球',
    nameEn: 'Reset',
    tagline: '被打到招架不住？用一顆軟球穩住戰局',
    level: '中階',
    category: '防守',
    difficulty: 4,
    timeToLearn: '1-2 個月',
    whenToUse: '對方連續強攻、你被打到後退或蹲下時。用軟球中止對方節奏，重新建立對戰。',
    keyPoints: [
      '目的是「中止對方進攻」，不是得分',
      '球路低、軟、落在對方廚房',
      '蹲得越低越容易成功',
      '拍面向上開放 30-45 度',
      '不要硬擋，要「吸收」球速',
    ],
    steps: [
      {
        title: '1. 降低重心',
        description: '被快速球壓制時，膝蓋大幅彎曲，身體蹲低到球以下。',
      },
      {
        title: '2. 鬆握拍',
        description: '把握力減到最鬆（2-3 分力）。想像用海綿接球而非鋼板。',
      },
      {
        title: '3. 拍面開放迎球',
        description: '拍面向上開約 40 度，像用勺子接球。',
      },
      {
        title: '4. 吸收 + 推送',
        description: '球碰到拍面時手臂略微後退吸收動能，然後輕輕往前推送回對方廚房。',
      },
      {
        title: '5. 恢復站位',
        description: 'reset 成功後立刻上網，重新進入廚房對戰節奏。',
      },
    ],
    commonMistakes: [
      {
        mistake: '硬擋造成機會球彈回',
        fix: '鬆握、吸收是關鍵。心態從「對抗」切換到「讓步」。',
      },
      {
        mistake: '球太高 → 對方再扣殺',
        fix: '降低身體，拍面從下往上送，而非平擋。',
      },
      {
        mistake: '只想攻、不想 reset',
        fix: '心理建設：reset 不是認輸，是高手必備的第五檔。',
      },
    ],
    drills: [
      {
        name: '被打 reset 訓練',
        description: '搭檔從網前快速下壓球，你專門練 reset 回軟球。',
        reps: '50 球 × 3 組',
      },
      {
        name: '蹲姿強化',
        description: '保持半蹲姿勢 30 秒，訓練下肢耐力（reset 很靠下肢）。',
        reps: '10 組',
      },
    ],
    proTip: 'Reset 是從中階（DUPR 3.5）升到進階（4.0+）最大的門檻。世界頂尖選手 Riley Newman、Ben Johns 等人的 reset 成功率超過 85%，是他們難以擊敗的核心原因。',
    relatedTechniques: ['dink', 'soft-hands', 'defensive-stance'],
    videoKeywords: ['pickleball reset technique', '匹克球 重置球', 'how to reset pickleball'],
  },
  {
    slug: 'erne',
    name: 'ERNE 繞邊跳擊',
    nameEn: 'Erne',
    tagline: '匹克球最帥的進階技巧 — 以球員 Erne Perry 命名',
    level: '進階',
    category: '網前',
    difficulty: 5,
    timeToLearn: '3-6 個月',
    whenToUse: '對方準備打邊線軟球時，你快速繞到廚房區外側（邊線外）跳起截擊。合法且極具威脅。',
    keyPoints: [
      '必須跳離廚房區（落地點在廚房外側）',
      '判斷對方軟球傾向是關鍵',
      '時機比動作更重要',
      '失敗率高，只在高機率時機使用',
      '常搭配搭檔的偷球喊話',
    ],
    steps: [
      {
        title: '1. 預判對方路線',
        description: '當對方引拍時判斷是否會打直線邊線軟球。這是 Erne 的前提。',
      },
      {
        title: '2. 快速橫移',
        description: '從廚房線位置向邊線外側橫移 2-3 步，完全離開廚房區範圍。',
      },
      {
        title: '3. 跳起截擊',
        description: '在邊線外側的廚房邊區跳起，空中截擊對方來球。',
      },
      {
        title: '4. 落地避開廚房',
        description: '這是最難的部分！落地時必須在廚房區外，否則違規失分。',
      },
      {
        title: '5. 擊球方向',
        description: '通常打向對方兩位球員中間的空隙（最難回擊的位置）。',
      },
    ],
    commonMistakes: [
      {
        mistake: '落地踩進廚房',
        fix: '跳起前就確保起跳點和落地點都在廚房區外。',
      },
      {
        mistake: '時機不對被反擊',
        fix: 'Erne 成功率低時不要硬做。高成功率時機：對方重複打同一路線的軟球。',
      },
      {
        mistake: '擊球方向被防守到',
        fix: '練習瞄準「兩人中間」或「非截擊方的弱邊」，而非打到空場。',
      },
    ],
    drills: [
      {
        name: 'Erne 機會識別',
        description: '觀看職業比賽錄影，記錄每次 Erne 嘗試的時機與結果。',
        reps: '每週 1 場',
      },
      {
        name: '邊線橫移爆發力',
        description: '從廚房線快速橫移到邊線外，計時。目標 1.5 秒內到位。',
        reps: '20 次 × 3 組',
      },
    ],
    proTip: 'Erne 的「替代版」是 Bert — 從網的另一側跳起截擊對方球。Erne 打直線邊線球、Bert 打交叉球。兩者都是炫技但實用的進階武器。',
    relatedTechniques: ['volley', 'atp', 'poaching'],
    videoKeywords: ['pickleball erne tutorial', 'how to erne', 'Erne shot pickleball'],
  },
  {
    slug: 'atp',
    name: 'ATP 繞網柱球',
    nameEn: 'Around The Post',
    tagline: '不過網、繞柱而擊 — 完全合法且超解氣',
    level: '進階',
    category: '擊球',
    difficulty: 5,
    timeToLearn: '需要機會 + 技術，非「每天可練」',
    whenToUse: '對方把球打到你的邊線外側時，你不用越網，而從球柱的「外側」水平擊球繞過網柱回擊。',
    keyPoints: [
      '球必須從網柱外側繞過（合法）',
      '擊球時不能碰網柱',
      '軌跡呈水平弧線而非拋物線',
      '機會罕見但一旦出現就是 winner',
      '對方送邊線球時最常出現',
    ],
    steps: [
      {
        title: '1. 識別機會',
        description: '對方球路偏向你的邊線外、且落地時已低於網高度時。這是唯一的 ATP 時機。',
      },
      {
        title: '2. 跑向球柱外側',
        description: '快速橫移到球柱外側下方，身體完全在球柱外。',
      },
      {
        title: '3. 低位側擊',
        description: '拍面水平、從側面掃擊球。球軌跡平行於地面，繞過網柱飛向對方場地。',
      },
      {
        title: '4. 瞄準空場',
        description: '由於球不越網，對方完全無法防守網前。目標是對方場地的空檔處。',
      },
    ],
    commonMistakes: [
      {
        mistake: '球碰到網柱 = 失分',
        fix: '練習時留意球柱高度，確保球路低於柱頂。',
      },
      {
        mistake: '球跨回網上方（違規）',
        fix: 'ATP 必須是「水平繞過」，只要球的任何部分跨越網頂就算違規。',
      },
      {
        mistake: '想打 ATP 但時機不對',
        fix: '只有對方球明顯打到邊線外、且低於網高度時才有機會。強求只會失誤。',
      },
    ],
    drills: [
      {
        name: 'ATP 機會識別',
        description: '觀看比賽時專注記錄 ATP 嘗試，理解其時機。',
        reps: '每週 2 場',
      },
      {
        name: '餵球 ATP',
        description: '搭檔故意將球餵到邊線外且低矮，專門練習 ATP。',
        reps: '20 球 / 天',
      },
    ],
    proTip: 'ATP 規則常見誤解：許多人以為球要從網柱外側飛回時「不能超過網高度」，這是錯的。規則只要求球不從「網上方越過」，球柱外側繞行時可以比網還高。',
    relatedTechniques: ['volley', 'erne'],
    videoKeywords: ['pickleball ATP shot', 'around the post tutorial', 'ATP pickleball'],
  },
  {
    slug: 'stacking',
    name: '疊站戰術',
    nameEn: 'Stacking',
    tagline: '雙打隱形武器 — 讓兩個正手拍都對網',
    level: '中階',
    category: '戰術',
    difficulty: 3,
    timeToLearn: '1-2 週理解 + 1 個月實戰',
    whenToUse: '雙打時，當搭檔中有左手/右手搭檔、或希望某位球員永遠在特定位置時。',
    keyPoints: [
      '透過站位讓兩個正手拍都朝向網中央',
      '適合一右一左手的搭檔',
      '也可用於「讓強者永遠在右邊」',
      '發球後要快速換位',
      '對方無法輕易利用你的反手邊',
    ],
    steps: [
      {
        title: '1. 理解基本站位',
        description: '一般雙打：球員 A 在右、球員 B 在左，各守一邊。疊站則讓兩人在同一側（如都在右），發完球再換位。',
      },
      {
        title: '2. 發球方疊站',
        description: 'A 在右邊發球，B 站在 A 旁邊（同側）。A 發完球後，B 往左邊跑、A 留在右邊。最終 A 守右、B 守左。',
      },
      {
        title: '3. 接發球方疊站',
        description: 'A 接球時 B 站在 A 旁邊。A 接完球上網時，B 跑到另一邊，形成最終站位。',
      },
      {
        title: '4. 換位時機',
        description: '發球方：發球擊球的瞬間開始移動。接發球方：回球擊球的瞬間開始移動。',
      },
      {
        title: '5. 用手勢溝通',
        description: '背後搭檔以手勢告訴前方搭檔會往左還右跑（避免兩人撞在一起）。',
      },
    ],
    commonMistakes: [
      {
        mistake: '換位時撞到搭檔',
        fix: '賽前說好固定路徑、用手勢確認。實戰前多練 20 次固定路徑。',
      },
      {
        mistake: '忘了換位，被對方抓到空檔',
        fix: '疊站失敗比不用疊站更慘。新手先把 standard 站位打穩再學疊站。',
      },
      {
        mistake: '全場都疊站，變得混亂',
        fix: '只在「想讓某人在特定位置」時才用疊站，例如強者對到對方發球。',
      },
    ],
    drills: [
      {
        name: '固定路徑疊站練習',
        description: '不對打、只練站位與換位。設定 20 次重複，養成肌肉記憶。',
        reps: '20 次 × 5 組',
      },
      {
        name: '實戰有條件疊站',
        description: '打一整局，只在對方發球到某球員時疊站。',
        reps: '3 局 / 訓練',
      },
    ],
    proTip: '職業雙打有 70% 的時間在用 stacking。頂尖女雙 Anna Leigh Waters (右手) 與 Catherine Parenteau (左手) 的 stacking 讓對手永遠面對「雙正手夾殺」。',
    relatedTechniques: ['poaching', 'shake-and-bake'],
    videoKeywords: ['pickleball stacking strategy', '匹克球 疊站', 'doubles stacking'],
  },
];

// 取得分類
export const TECHNIQUE_CATEGORIES = ['擊球', '發球', '網前', '防守', '戰術', '步法'] as const;
export const TECHNIQUE_LEVELS = ['新手', '初階', '中階', '進階', '高手'] as const;

// 依 slug 取得技巧
export const getTechniqueBySlug = (slug: string): Technique | undefined =>
  TECHNIQUES.find(t => t.slug === slug);

// 依分類取得
export const getTechniquesByCategory = (cat: TechniqueCategory): Technique[] =>
  TECHNIQUES.filter(t => t.category === cat);

// 依等級取得
export const getTechniquesByLevel = (level: TechniqueLevel): Technique[] =>
  TECHNIQUES.filter(t => t.level === level);
