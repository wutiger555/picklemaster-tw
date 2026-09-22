// DUPR 評級級距 —— 由 src/pages/Ratings.tsx 搬出。
// 搬出的原因：建置時要用這份資料預渲染頁面（scripts/generate-static-pages.cjs），
// 而從頁面元件 export 非元件常數會讓該檔的 Fast Refresh 失效
// （react-refresh/only-export-components）。

export interface RatingTier {
  range: string;
  level: string;
  levelEn: string;
  color: string;
  gradient: string;
  description: string;
  skills: string[];
  typicalPlayer: string;
}

export const RATING_TIERS: RatingTier[] = [
  {
    range: '1.0 - 2.0',
    level: '初學者',
    levelEn: 'Beginner',
    color: 'bg-slate-100 text-slate-700',
    gradient: 'from-slate-400 to-slate-600',
    description: '剛接觸匹克球，還在熟悉基本規則與握拍方式。',
    skills: ['認識基本規則', '學習握拍與發球', '能打出基本回擊'],
    typicalPlayer: '剛上過 1-2 堂體驗課的新手',
  },
  {
    range: '2.5',
    level: '入門',
    levelEn: 'Novice',
    color: 'bg-emerald-100 text-emerald-700',
    gradient: 'from-emerald-400 to-emerald-600',
    description: '能持續完成基本對打，但深度、擺位、節奏仍不穩定。',
    skills: ['穩定發球過網', '能完成短對打', '開始理解廚房區規則'],
    typicalPlayer: '每週練習 1-2 次，打球 2-3 個月',
  },
  {
    range: '3.0',
    level: '初階',
    levelEn: 'Intermediate Low',
    color: 'bg-teal-100 text-teal-700',
    gradient: 'from-teal-400 to-teal-600',
    description: '掌握基礎擊球，開始學習軟球與第三球策略。',
    skills: ['正反手基本穩定', '能打出基本軟球', '雙打能做簡單配合'],
    typicalPlayer: '打球 6-12 個月，每週 2-3 次',
  },
  {
    range: '3.5',
    level: '中階',
    levelEn: 'Intermediate',
    color: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-400 to-blue-600',
    description: '技術漸趨完整，開始有主動戰術意識。',
    skills: ['第三球下切有一定成功率', '能執行軟球對戰', '開始使用疊站戰術'],
    typicalPlayer: '長期業餘愛好者，地區賽分齡組選手',
  },
  {
    range: '4.0',
    level: '進階',
    levelEn: 'Advanced',
    color: 'bg-indigo-100 text-indigo-700',
    gradient: 'from-indigo-500 to-indigo-700',
    description: '擁有多樣戰術與穩定心理素質，為業餘賽事常勝軍。',
    skills: ['所有擊球穩定', '能執行 ERNE 與 ATP', '理解對手弱點並針對性進攻'],
    typicalPlayer: '全國錦標賽業餘組常客',
  },
  {
    range: '4.5 - 5.0',
    level: '高手',
    levelEn: 'Expert',
    color: 'bg-purple-100 text-purple-700',
    gradient: 'from-purple-500 to-purple-700',
    description: '接近職業門檻，擊球、戰術、體能全面出色。',
    skills: ['高壓下仍能精準控球', '閱讀比賽能力強', '能與職業選手對抗'],
    typicalPlayer: '全國公開組常勝軍、地區頂尖選手',
  },
  {
    range: '5.5+',
    level: '職業',
    levelEn: 'Pro',
    color: 'bg-rose-100 text-rose-700',
    gradient: 'from-rose-500 to-rose-700',
    description: 'PPA、MLP 等國際職業巡迴賽級別。',
    skills: ['世界級技術與戰術', '頂級體能與心理素質', '可設計比賽節奏'],
    typicalPlayer: 'Ben Johns (8.0)、Anna Leigh Waters (7.5+)',
  },
];
