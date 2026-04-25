// 系統化訓練菜單庫
// 每個菜單為週/日結構，球友可逐步跟隨

export type ProgramLevel = '新手' | '初階' | '中階' | '進階';
export type ProgramFocus = '全面入門' | '技術專修' | '雙打配合' | '單打體能' | '銀髮族' | '青少年';

export interface DailyDrill {
  name: string;
  duration: string;        // e.g. "10 分鐘"
  description: string;
  reps?: string;           // e.g. "30 球 × 3 組"
}

export interface WeekPlan {
  week: number;
  theme: string;            // 該週主題
  goals: string[];          // 該週目標
  days: {
    day: string;            // e.g. "週一" 或 "Day 1"
    sessionType: string;    // e.g. "技術日 / 對戰日 / 休息日"
    drills: DailyDrill[];
    totalTime: string;
  }[];
  weeklyCheckpoint: string; // 週末自評重點
}

export interface TrainingProgram {
  slug: string;
  title: string;
  subtitle: string;
  level: ProgramLevel;
  focus: ProgramFocus;
  duration: string;          // e.g. "8 週"
  weeklyHours: string;       // e.g. "3 小時/週"
  prerequisite: string;
  outcome: string;           // 完成後可達成的程度
  equipment: string[];
  weeks: WeekPlan[];
  emoji: string;
  accentGradient: string;
  featured?: boolean;
}

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  // ===== 1. 新手 8 週入門 =====
  {
    slug: 'beginner-8-week',
    title: '新手 8 週入門完整菜單',
    subtitle: '從 0 開始，8 週後能輕鬆下場打雙打',
    level: '新手',
    focus: '全面入門',
    duration: '8 週',
    weeklyHours: '3-4 小時',
    prerequisite: '無基礎，能跑能動即可',
    outcome: '掌握握拍、發球、接發、基本擊球；DUPR 估計達 2.5-3.0',
    equipment: ['1 支入門球拍（NT$ 3,000-4,500）', '室內或戶外鞋', '運動服 + 水壺'],
    emoji: '🌱',
    accentGradient: 'from-emerald-400 to-teal-500',
    featured: true,
    weeks: [
      {
        week: 1,
        theme: '握拍與發球',
        goals: ['熟悉大陸式握拍', '能穩定下手發球', '了解雙彈跳規則'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '熱身 + 握拍練習', duration: '10 分鐘', description: '對鏡子練習握拍位置與握力' },
              { name: '空揮練習', duration: '15 分鐘', description: '正反手空揮各 50 下' },
              { name: '對牆顛球', duration: '20 分鐘', description: '正反面交替顛球，連續不斷', reps: '50 下 × 3 組' },
              { name: '基礎發球練習', duration: '15 分鐘', description: '對牆練發球，穩定為主', reps: '30 球' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '10 分鐘', description: '動態熱身 + 揮拍' },
              { name: '發球練習', duration: '20 分鐘', description: '練習對角發球進有效區', reps: '50 球' },
              { name: '接發球練習', duration: '20 分鐘', description: '請球友餵發球，練習接發回深球', reps: '30 球' },
              { name: '簡單對打', duration: '40 分鐘', description: '雙打慢節奏對打，重點是規則熟悉' },
            ],
          },
        ],
        weeklyCheckpoint: '能穩定發 8/10 球進對方有效區',
      },
      {
        week: 2,
        theme: '正反手基本擊球',
        goals: ['正手能持續對打 10 球', '反手不慌張', '理解廚房區規則'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '正手對牆連擊', duration: '20 分鐘', description: '對牆只用正手連擊', reps: '20 下 × 5 組' },
              { name: '反手對牆連擊', duration: '20 分鐘', description: '對牆只用反手連擊', reps: '15 下 × 5 組' },
              { name: '正反手交替', duration: '20 分鐘', description: '球友餵球，左右交替擊回', reps: '30 球' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '10 分鐘', description: '動態熱身' },
              { name: '底線對抽', duration: '30 分鐘', description: '兩人站底線連續對抽，不求快只求穩' },
              { name: '雙打對戰', duration: '50 分鐘', description: '應用本週所學' },
            ],
          },
        ],
        weeklyCheckpoint: '正手連擊能達 10 球以上；理解何時不能截擊',
      },
      {
        week: 3,
        theme: '截擊基本功',
        goals: ['網前截擊穩定', '不踩廚房線', '能完成基本網前對戰'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '對牆截擊', duration: '20 分鐘', description: '距牆 2 公尺，持續截擊', reps: '30 下 × 3 組' },
              { name: '網前餵球截擊', duration: '20 分鐘', description: '搭檔餵球到網前，練習穩定截擊', reps: '40 球' },
              { name: '不踩線練習', duration: '20 分鐘', description: '專注站位，所有截擊都不踩廚房線' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身 + 暖身對打', duration: '20 分鐘', description: '輕度對打找手感' },
              { name: '網前對戰', duration: '30 分鐘', description: '雙方都在廚房線練網前截擊' },
              { name: '完整雙打', duration: '40 分鐘', description: '應用截擊技巧' },
            ],
          },
        ],
        weeklyCheckpoint: '網前能對戰 5+ 球不失誤',
      },
      {
        week: 4,
        theme: '軟球（Dink）入門',
        goals: ['理解 Dink 概念', '能打出基本軟球', '球弧線越過網'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '對牆軟球', duration: '20 分鐘', description: '距牆 3 公尺，低弧度擊球', reps: '20 下 × 5 組' },
              { name: '軟球對打', duration: '30 分鐘', description: '兩人站廚房線，互打軟球，目標連續 10 球' },
              { name: '重心放低練習', duration: '10 分鐘', description: '半蹲姿勢練習，培養軟球必備腿力' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '動態熱身 + 暖身軟球' },
              { name: 'Dink 對戰練習', duration: '30 分鐘', description: '兩人對角打軟球' },
              { name: '雙打應用', duration: '45 分鐘', description: '雙打中嘗試使用 dink' },
            ],
          },
        ],
        weeklyCheckpoint: 'Dink 能連續對打 5 球以上',
      },
      {
        week: 5,
        theme: '雙打站位與配合',
        goals: ['理解雙打基本站位', '與搭檔有基本默契', '能上廚房線'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '雙打站位演練', duration: '20 分鐘', description: '與搭檔練習標準雙打站位' },
              { name: '上網練習', duration: '20 分鐘', description: '從底線跑到廚房線，計時' },
              { name: '搭檔配合', duration: '20 分鐘', description: '左右搭檔分工練習' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身 + 對牆', duration: '15 分鐘', description: '個人暖身' },
              { name: '雙打配合對戰', duration: '75 分鐘', description: '專注於站位、上網、配合' },
            ],
          },
        ],
        weeklyCheckpoint: '能與搭檔自然配合，不會搶到對方位置',
      },
      {
        week: 6,
        theme: '第三球策略入門',
        goals: ['認識第三球的重要性', '能嘗試 drop 或 drive', '上網意識建立'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '第三球 drive', duration: '20 分鐘', description: '簡化版第三球，快攻過網', reps: '30 球' },
              { name: '第三球 drop', duration: '20 分鐘', description: '高弧線軟球落入對方廚房', reps: '30 球' },
              { name: 'drive vs drop 抉擇', duration: '20 分鐘', description: '依球高度決定 drive 或 drop' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '熱身 + 暖身對打' },
              { name: '第三球專練', duration: '30 分鐘', description: '反覆練習發球後第三球' },
              { name: '完整雙打', duration: '45 分鐘', description: '實戰應用' },
            ],
          },
        ],
        weeklyCheckpoint: '第三球至少 30% 進對方廚房',
      },
      {
        week: 7,
        theme: '比賽節奏與心理',
        goals: ['能完成完整 11 分制比賽', '失誤後能快速重置心情', '理解計分'],
        days: [
          {
            day: '週一', sessionType: '輕度技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '弱點補強', duration: '60 分鐘', description: '針對自己最弱的技術專練' },
            ],
          },
          {
            day: '週三', sessionType: '比賽日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '充分熱身備戰' },
              { name: '正式比賽', duration: '60 分鐘', description: '11 分制三戰兩勝' },
              { name: '檢討', duration: '15 分鐘', description: '與搭檔討論本場優缺點' },
            ],
          },
          {
            day: '週六', sessionType: '比賽日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '動態熱身' },
              { name: '對不同搭檔比賽', duration: '60 分鐘', description: '與不同球友配對' },
              { name: '冷靜與檢討', duration: '15 分鐘', description: '紀錄今日學習' },
            ],
          },
        ],
        weeklyCheckpoint: '能完成 3 場比賽不放棄、失誤後仍維持專注',
      },
      {
        week: 8,
        theme: '綜合應用與檢驗',
        goals: ['應用 8 週所學', '與球友比賽不再緊張', '為下一階段做準備'],
        days: [
          {
            day: '週一', sessionType: '個人複習',
            totalTime: '60 分鐘',
            drills: [
              { name: '8 週技術回顧', duration: '60 分鐘', description: '所有學過的技術各練習 5 分鐘' },
            ],
          },
          {
            day: '週四', sessionType: '挑戰日',
            totalTime: '120 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '完整熱身' },
              { name: '與比自己強的球友打', duration: '60 分鐘', description: '挑戰更高 DUPR 球友' },
              { name: '與同程度球友打', duration: '40 分鐘', description: '驗證 8 週成果' },
              { name: '冷靜', duration: '5 分鐘', description: '記錄突破與待加強' },
            ],
          },
        ],
        weeklyCheckpoint: '完成 8 週菜單後評估自己 DUPR 等級，準備進階課程',
      },
    ],
  },

  // ===== 2. Dink 大師 4 週特訓 =====
  {
    slug: 'dink-master-4-week',
    title: 'Dink 軟球 4 週特訓菜單',
    subtitle: '從不敢打軟球到 Dink 對戰王者',
    level: '中階',
    focus: '技術專修',
    duration: '4 週',
    weeklyHours: '4-5 小時',
    prerequisite: '已熟悉基本擊球，DUPR 3.0+',
    outcome: 'Dink 能連續對戰 30+ 球；廚房戰主導',
    equipment: ['控球型球拍（如 Bantam TS-5）', '搭檔（建議同程度或略強）'],
    emoji: '🪶',
    accentGradient: 'from-blue-400 to-cyan-500',
    featured: true,
    weeks: [
      {
        week: 1,
        theme: '基礎 Dink 動作',
        goals: ['正確 Dink 姿勢', '球能落入對方廚房', '握力放鬆'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '對牆 Dink', duration: '20 分鐘', description: '距牆 3 公尺，低弧度連擊', reps: '30 下 × 5 組' },
              { name: '搭檔對角 Dink', duration: '40 分鐘', description: '兩人站廚房線對角，連續軟球', reps: '50 球 × 3 組' },
            ],
          },
          {
            day: '週三', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '直線 Dink', duration: '30 分鐘', description: '練習正前方直線軟球（較難）', reps: '40 球 × 3 組' },
              { name: '握力放鬆練習', duration: '30 分鐘', description: '專注 2-3 分握力，避免掐拍' },
            ],
          },
          {
            day: '週六', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身 Dink', duration: '20 分鐘', description: '輕度暖身對打' },
              { name: '專練 Dink Rally', duration: '40 分鐘', description: '只打軟球，禁止強攻' },
              { name: '雙打應用', duration: '30 分鐘', description: '在實戰中嘗試' },
            ],
          },
        ],
        weeklyCheckpoint: 'Dink 能連續對戰 15+ 球',
      },
      {
        week: 2,
        theme: '對角 Dink 戰術',
        goals: ['對角 Dink 80% 成功率', '製造對手反手壓力', '辨識對手弱邊'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '對角 Dink 訓練', duration: '40 分鐘', description: '只打對角，連續 50 球不失誤', reps: '50 球 × 5 組' },
              { name: '雙手反手 Dink', duration: '20 分鐘', description: '練習雙手反手 Dink 增加穩定性' },
            ],
          },
          {
            day: '週三', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '反手變正手 Dink', duration: '30 分鐘', description: '練習在 Dink Rally 中切換' },
              { name: '深度 Dink', duration: '30 分鐘', description: '球落點在對方廚房內最深處' },
            ],
          },
          {
            day: '週六', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '對角 Dink 暖身' },
              { name: '雙打應用對角戰術', duration: '75 分鐘', description: '比賽中刻意打對角 Dink' },
            ],
          },
        ],
        weeklyCheckpoint: '對角 Dink 連續 25+ 球，能辨識對手弱邊',
      },
      {
        week: 3,
        theme: 'Dink 進攻轉換',
        goals: ['判斷何時可進攻', '高彈 Dink 能反擊', '不錯失機會球'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '機會球識別', duration: '20 分鐘', description: '搭檔餵不同高度，學會識別可進攻的球' },
              { name: 'Speed-up Drill', duration: '40 分鐘', description: 'Dink 中突然加速進攻練習', reps: '20 球 × 5 組' },
            ],
          },
          {
            day: '週三', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '反應截擊', duration: '30 分鐘', description: '對方加速時的快速回擊' },
              { name: 'Dink + Roll Volley', duration: '30 分鐘', description: '結合上旋滾動截擊' },
            ],
          },
          {
            day: '週六', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '基礎暖身' },
              { name: '進攻轉換實戰', duration: '75 分鐘', description: '比賽中應用機會判斷' },
            ],
          },
        ],
        weeklyCheckpoint: '能在 Dink 中製造 1 個進攻機會/局',
      },
      {
        week: 4,
        theme: '心理與耐心',
        goals: ['Dink Rally 不主動失誤', '比對方更耐心', '心態穩定'],
        days: [
          {
            day: '週一', sessionType: '心理訓練',
            totalTime: '60 分鐘',
            drills: [
              { name: '極限 Dink Rally', duration: '60 分鐘', description: '與搭檔挑戰 100 球連續軟球' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '充分準備' },
              { name: '挑戰賽', duration: '75 分鐘', description: '與比自己強的球友比賽' },
            ],
          },
        ],
        weeklyCheckpoint: 'Dink Rally 達 50+ 球；情緒穩定不易受激怒',
      },
    ],
  },

  // ===== 3. Third Shot Drop 大師 4 週 =====
  {
    slug: 'drop-master-4-week',
    title: 'Third Shot Drop 4 週特訓',
    subtitle: '從中階升進階的關鍵技術',
    level: '中階',
    focus: '技術專修',
    duration: '4 週',
    weeklyHours: '4 小時',
    prerequisite: 'DUPR 3.0+，能穩定發球與接發球',
    outcome: '第三球下切成功率 50%+',
    equipment: ['控球型球拍', '搭檔'],
    emoji: '🎯',
    accentGradient: 'from-purple-400 to-pink-500',
    weeks: [
      {
        week: 1,
        theme: '基本動作建立',
        goals: ['正確 Drop 姿勢', '理解弧線軌跡', '不慌張'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '空揮 Drop', duration: '15 分鐘', description: '無球練習揮拍動作' },
              { name: '搭檔餵球 Drop', duration: '45 分鐘', description: '從底線練習弧線', reps: '50 球 × 3 組' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '動態熱身' },
              { name: 'Drop 連續嘗試', duration: '45 分鐘', description: '雙打中發球後刻意 Drop' },
              { name: '檢討錄影', duration: '30 分鐘', description: '錄影自己分析' },
            ],
          },
        ],
        weeklyCheckpoint: 'Drop 過網率 70%+',
      },
      {
        week: 2,
        theme: '落點精確度',
        goals: ['Drop 落點在對方廚房', '不再太高被扣殺', '高度可控'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: '目標 Drop', duration: '40 分鐘', description: '在對方廚房放浴巾當目標', reps: '50 球 × 3 組' },
              { name: '高度控制', duration: '20 分鐘', description: '球弧最高點應低於頭高' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '基礎暖身' },
              { name: '比賽應用', duration: '75 分鐘', description: '所有第三球都嘗試 Drop' },
            ],
          },
        ],
        weeklyCheckpoint: 'Drop 落入廚房成功率 40%+',
      },
      {
        week: 3,
        theme: '上網跟進',
        goals: ['Drop 後立刻上網', '到位速度', '不錯過廚房戰'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: 'Drop + 跑', duration: '40 分鐘', description: '練習擊球後立刻向前跑', reps: '30 次 × 3 組' },
              { name: '計時跑位', duration: '20 分鐘', description: '從底線到廚房線目標 4 秒內' },
            ],
          },
          {
            day: '週四', sessionType: '上場日',
            totalTime: '90 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '腿部強化' },
              { name: '完整 Drop + 上網', duration: '75 分鐘', description: '雙打中執行完整動作' },
            ],
          },
        ],
        weeklyCheckpoint: 'Drop 後 80% 能成功上網到廚房線',
      },
      {
        week: 4,
        theme: '實戰應用',
        goals: ['Drop 成功率 50%+', 'Drop vs Drive 抉擇', '完整轉換'],
        days: [
          {
            day: '週一', sessionType: '技術日',
            totalTime: '60 分鐘',
            drills: [
              { name: 'Drive vs Drop', duration: '60 分鐘', description: '依來球高度做 30 次決策' },
            ],
          },
          {
            day: '週四', sessionType: '比賽日',
            totalTime: '120 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '完整熱身' },
              { name: '實戰比賽', duration: '90 分鐘', description: '應用本月所學' },
              { name: '檢討', duration: '15 分鐘', description: '紀錄成功率與待加強' },
            ],
          },
        ],
        weeklyCheckpoint: 'Drop 成功率穩定 50%+；DUPR 估計提升 0.3-0.5',
      },
    ],
  },

  // ===== 4. 銀髮族 12 週溫和入門 =====
  {
    slug: 'senior-12-week',
    title: '50+ 銀髮族 12 週入門菜單',
    subtitle: '安全溫和、循序漸進',
    level: '新手',
    focus: '銀髮族',
    duration: '12 週',
    weeklyHours: '2-3 小時',
    prerequisite: '50+ 歲、無嚴重心血管或關節疾病（建議先諮詢醫師）',
    outcome: '能與球友享受雙打、規律運動養成',
    equipment: ['輕量球拍（7.0-7.5 oz）', '舒適球鞋', '護膝（建議）', '水壺'],
    emoji: '👴',
    accentGradient: 'from-amber-400 to-orange-500',
    featured: true,
    weeks: [
      {
        week: 1,
        theme: '溫和起步',
        goals: ['熟悉場地', '基本握拍', '避免一開始受傷'],
        days: [
          {
            day: '週一', sessionType: '技術日（輕度）',
            totalTime: '45 分鐘',
            drills: [
              { name: '充分熱身', duration: '15 分鐘', description: '關節活動 + 動態伸展' },
              { name: '握拍練習', duration: '15 分鐘', description: '對著鏡子確認握拍' },
              { name: '空揮練習', duration: '15 分鐘', description: '輕度揮拍熟悉動作' },
            ],
          },
          {
            day: '週四', sessionType: '輕度上場',
            totalTime: '60 分鐘',
            drills: [
              { name: '熱身', duration: '15 分鐘', description: '徹底熱身保護關節' },
              { name: '低強度對打', duration: '30 分鐘', description: '與球友練習擊球，不求快' },
              { name: '收身放鬆', duration: '15 分鐘', description: '緩和運動 + 伸展' },
            ],
          },
        ],
        weeklyCheckpoint: '無受傷、能舒適完成兩次練習',
      },
      // 第 2-12 週簡化版
      {
        week: 2,
        theme: '發球與接發',
        goals: ['能下手發球進對方區', '接發球不慌'],
        days: [
          { day: '週一', sessionType: '技術日', totalTime: '45 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '動態熱身' },
            { name: '對牆發球', duration: '30 分鐘', description: '輕鬆練習發球' },
          ]},
          { day: '週四', sessionType: '上場日', totalTime: '60 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '輕度對打', duration: '30 分鐘', description: '雙打慢節奏' },
            { name: '伸展', duration: '15 分鐘', description: '放鬆' },
          ]},
        ],
        weeklyCheckpoint: '發球 7/10 進對方區',
      },
      {
        week: 4,
        theme: '網前截擊',
        goals: ['網前不害怕', '基本截擊'],
        days: [
          { day: '週一', sessionType: '技術日', totalTime: '50 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '網前截擊', duration: '35 分鐘', description: '搭檔餵球' },
          ]},
          { day: '週四', sessionType: '上場日', totalTime: '70 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '雙打對戰', duration: '40 分鐘', description: '應用截擊' },
            { name: '伸展', duration: '15 分鐘', description: '放鬆' },
          ]},
        ],
        weeklyCheckpoint: '網前能完成 5 球對戰',
      },
      {
        week: 8,
        theme: 'Dink 入門',
        goals: ['理解軟球概念', '基本軟球'],
        days: [
          { day: '週一', sessionType: '技術日', totalTime: '60 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '徹底暖身' },
            { name: 'Dink 練習', duration: '45 分鐘', description: '與搭檔輕鬆練習' },
          ]},
          { day: '週四', sessionType: '上場日', totalTime: '75 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '雙打應用', duration: '45 分鐘', description: '嘗試 dink' },
            { name: '伸展', duration: '15 分鐘', description: '放鬆' },
          ]},
        ],
        weeklyCheckpoint: 'Dink 能對打 5+ 球',
      },
      {
        week: 12,
        theme: '加入球友會',
        goals: ['加入當地球友會', '養成終身運動習慣'],
        days: [
          { day: '週一', sessionType: '技術日', totalTime: '60 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '弱項補強', duration: '45 分鐘', description: '針對個人弱點' },
          ]},
          { day: '週四', sessionType: '社交日', totalTime: '90 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '與不同球友打', duration: '60 分鐘', description: '社交與對戰' },
            { name: '放鬆與聊天', duration: '15 分鐘', description: '建立友誼' },
          ]},
        ],
        weeklyCheckpoint: '加入至少一個固定球友會；建立每週 2-3 次運動習慣',
      },
    ],
  },

  // ===== 5. 雙打配合 6 週 =====
  {
    slug: 'doubles-partnership-6-week',
    title: '雙打配合 6 週默契養成',
    subtitle: '與固定搭檔的進階配合菜單',
    level: '中階',
    focus: '雙打配合',
    duration: '6 週',
    weeklyHours: '4 小時',
    prerequisite: '雙方 DUPR 3.5+ 且願意長期搭檔',
    outcome: '默契無縫、戰術一致、勝率提升 30%',
    equipment: ['各自的球拍', '固定搭檔'],
    emoji: '🤝',
    accentGradient: 'from-rose-400 to-pink-500',
    weeks: [
      {
        week: 1,
        theme: '溝通系統建立',
        goals: ['建立手勢語言', '中間球分工'],
        days: [
          { day: '週一', sessionType: '溝通日', totalTime: '60 分鐘', drills: [
            { name: '手勢練習', duration: '20 分鐘', description: '討論並練習比賽中的手勢' },
            { name: '中間球分工演練', duration: '40 分鐘', description: '搭檔在網前對打，誰打中間球' },
          ]},
          { day: '週四', sessionType: '上場日', totalTime: '90 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '雙打實戰', duration: '75 分鐘', description: '使用新建立的溝通' },
          ]},
        ],
        weeklyCheckpoint: '能在比賽中使用 3 個手勢；不再撞拍',
      },
      {
        week: 3,
        theme: '疊站戰術',
        goals: ['理解 Stacking', '能執行基本疊站'],
        days: [
          { day: '週一', sessionType: '技術日', totalTime: '60 分鐘', drills: [
            { name: '疊站站位演練', duration: '60 分鐘', description: '反覆練習換位' },
          ]},
          { day: '週四', sessionType: '上場日', totalTime: '90 分鐘', drills: [
            { name: '疊站實戰', duration: '90 分鐘', description: '比賽中應用疊站' },
          ]},
        ],
        weeklyCheckpoint: '疊站換位 90% 順暢',
      },
      {
        week: 6,
        theme: '高強度比賽',
        goals: ['對抗較強對手', '默契接受考驗'],
        days: [
          { day: '週六', sessionType: '挑戰賽', totalTime: '120 分鐘', drills: [
            { name: '熱身', duration: '20 分鐘', description: '充分熱身' },
            { name: '與較強對手比賽', duration: '90 分鐘', description: '挑戰更高 DUPR 對手' },
            { name: '檢討', duration: '10 分鐘', description: '討論進步空間' },
          ]},
        ],
        weeklyCheckpoint: '與更高 DUPR 對手能拉鋸 5 分以上',
      },
    ],
  },

  // ===== 6. 單打體能 6 週 =====
  {
    slug: 'singles-fitness-6-week',
    title: '單打體能 6 週菜單',
    subtitle: '提升心肺、爆發力、橫向移動',
    level: '中階',
    focus: '單打體能',
    duration: '6 週',
    weeklyHours: '5-6 小時',
    prerequisite: 'DUPR 3.0+，已有基本單打能力',
    outcome: '單打體能可撐 3 局；橫向移動更靈活',
    equipment: ['球拍', '跳繩', '彈力帶'],
    emoji: '⚡',
    accentGradient: 'from-yellow-400 to-red-500',
    weeks: [
      {
        week: 1,
        theme: '基礎心肺',
        goals: ['建立有氧基礎'],
        days: [
          { day: '週一', sessionType: '心肺日', totalTime: '60 分鐘', drills: [
            { name: '慢跑', duration: '30 分鐘', description: '心率 130-140 bpm' },
            { name: '跳繩', duration: '15 分鐘', description: '間歇 1 分跳 30 秒休息' },
            { name: '伸展', duration: '15 分鐘', description: '完整伸展' },
          ]},
          { day: '週三', sessionType: '單打日', totalTime: '90 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '充分熱身' },
            { name: '單打對戰', duration: '60 分鐘', description: '與球友單打' },
            { name: '緩和', duration: '15 分鐘', description: '放鬆' },
          ]},
          { day: '週五', sessionType: '心肺日', totalTime: '60 分鐘', drills: [
            { name: '間歇衝刺', duration: '30 分鐘', description: '30 秒衝 + 90 秒慢' },
            { name: '伸展', duration: '30 分鐘', description: '深層伸展' },
          ]},
        ],
        weeklyCheckpoint: '能完成 30 分慢跑不費力',
      },
      {
        week: 6,
        theme: '比賽強度測試',
        goals: ['完成 3 局單打不力竭'],
        days: [
          { day: '週三', sessionType: '單打挑戰', totalTime: '120 分鐘', drills: [
            { name: '熱身', duration: '20 分鐘', description: '完整熱身' },
            { name: '3 局單打', duration: '90 分鐘', description: '與球友連打 3 局' },
            { name: '冷靜伸展', duration: '10 分鐘', description: '放鬆' },
          ]},
        ],
        weeklyCheckpoint: '3 局單打能維持表現',
      },
    ],
  },

  // ===== 7. 反手強化 4 週 =====
  {
    slug: 'backhand-master-4-week',
    title: '反手強化 4 週特訓',
    subtitle: '消除最大弱點 — 雙手反手養成',
    level: '初階',
    focus: '技術專修',
    duration: '4 週',
    weeklyHours: '4 小時',
    prerequisite: 'DUPR 2.5+，正手已穩定',
    outcome: '反手不再是弱點；雙手反手抽球穩定',
    equipment: ['球拍', '搭檔'],
    emoji: '🤛',
    accentGradient: 'from-indigo-400 to-purple-500',
    weeks: [
      {
        week: 1,
        theme: '雙手握拍與動作',
        goals: ['理解雙手反手姿勢', '能完成基本擊球'],
        days: [
          { day: '週一', sessionType: '技術日', totalTime: '60 分鐘', drills: [
            { name: '對牆反手', duration: '30 分鐘', description: '只用反手對牆' },
            { name: '空揮練習', duration: '30 分鐘', description: '雙手反手揮拍 50 次' },
          ]},
          { day: '週四', sessionType: '上場日', totalTime: '90 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '專練反手', duration: '75 分鐘', description: '雙打中所有來球都用反手' },
          ]},
        ],
        weeklyCheckpoint: '反手連擊 10 球',
      },
      {
        week: 4,
        theme: '反手實戰',
        goals: ['不再閃身用正手', '反手主動出擊'],
        days: [
          { day: '週四', sessionType: '比賽日', totalTime: '120 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '比賽應用', duration: '90 分鐘', description: '不再閃身' },
            { name: '檢討', duration: '15 分鐘', description: '紀錄成功次數' },
          ]},
        ],
        weeklyCheckpoint: '反手主動使用率達 40%+',
      },
    ],
  },

  // ===== 8. Reset 防守大師 4 週 =====
  {
    slug: 'reset-master-4-week',
    title: 'Reset 防守大師 4 週特訓',
    subtitle: '從業餘升職業的最後一哩路',
    level: '進階',
    focus: '技術專修',
    duration: '4 週',
    weeklyHours: '4 小時',
    prerequisite: 'DUPR 3.5+，dink 與第三球已掌握',
    outcome: 'Reset 成功率 70%+；難以被擊敗',
    equipment: ['控球型球拍', '較強搭檔（願意對你連續強攻）'],
    emoji: '🛡️',
    accentGradient: 'from-slate-400 to-gray-600',
    weeks: [
      {
        week: 1,
        theme: '鬆握 + 吸收',
        goals: ['握拍 2-3 分力', '不硬擋對方強攻'],
        days: [
          { day: '週一', sessionType: '技術日', totalTime: '60 分鐘', drills: [
            { name: '對牆鬆握練習', duration: '30 分鐘', description: '握拍如海綿，球不會反彈強烈' },
            { name: '搭檔強攻 reset', duration: '30 分鐘', description: '搭檔強攻，你只練 reset', reps: '50 球' },
          ]},
          { day: '週四', sessionType: '上場日', totalTime: '90 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '被攻 reset 訓練', duration: '75 分鐘', description: '請對方連續強攻你' },
          ]},
        ],
        weeklyCheckpoint: 'Reset 過網率 60%+',
      },
      {
        week: 4,
        theme: '實戰應用',
        goals: ['Reset 成功率 70%+', '反擊對方節奏'],
        days: [
          { day: '週四', sessionType: '挑戰賽', totalTime: '120 分鐘', drills: [
            { name: '熱身', duration: '15 分鐘', description: '熱身' },
            { name: '與更高 DUPR 對手比賽', duration: '90 分鐘', description: 'Reset 為主要防守' },
            { name: '檢討', duration: '15 分鐘', description: '紀錄成功率' },
          ]},
        ],
        weeklyCheckpoint: 'Reset 落入對方廚房 70%+',
      },
    ],
  },
];

export const PROGRAM_LEVELS: ProgramLevel[] = ['新手', '初階', '中階', '進階'];
export const PROGRAM_FOCUSES: ProgramFocus[] = ['全面入門', '技術專修', '雙打配合', '單打體能', '銀髮族', '青少年'];

export const getProgramBySlug = (slug: string) =>
  TRAINING_PROGRAMS.find(p => p.slug === slug);
