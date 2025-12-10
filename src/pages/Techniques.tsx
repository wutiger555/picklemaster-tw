import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import VideoTutorials from '../components/learning/VideoTutorials';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';

// 技巧分類資料
const SKILL_CATEGORIES = [
    {
        id: 'serve',
        name: '發球',
        icon: '🎯',
        color: 'rose',
        description: '低手發球是匹克球的基本功，穩定的發球是得分的第一步',
        skills: ['低手發球基礎', '發球落點控制', '旋轉發球技巧'],
        tips: '發球時球拍接觸球的位置必須在腰部以下',
    },
    {
        id: 'return',
        name: '接發球',
        icon: '↩️',
        color: 'blue',
        description: '接發球決定了回合的開始，好的接發球能立刻取得優勢',
        skills: ['接發球位置選擇', '深球回擊技巧', '切球接發'],
        tips: '接發球儘量打深，讓對手沒有上網機會',
    },
    {
        id: 'dink',
        name: 'Dink',
        icon: '🏓',
        color: 'emerald',
        description: 'Dink 是匹克球最獨特的技術，廚房區前的小球對拉',
        skills: ['基礎 Dink 技術', 'Cross-court Dink', 'Dink 節奏控制'],
        tips: 'Dink 講求穩定和耐心，不要急於進攻',
    },
    {
        id: 'volley',
        name: '截擊',
        icon: '⚡',
        color: 'amber',
        description: '截擊是在球未落地前擊球，常用於網前攻防',
        skills: ['正手截擊', '反手截擊', '高壓球'],
        tips: '截擊時注意不能踩進廚房區',
    },
    {
        id: 'strategy',
        name: '戰術策略',
        icon: '🧠',
        color: 'violet',
        description: '了解戰術走位和配合，讓技術發揮最大效果',
        skills: ['第三拍落地球', '上網時機', '雙打配合'],
        tips: '第三拍落地球是發球方上網的關鍵',
    },
];

const Techniques = () => {
    usePageTitle('匹克球技巧教學');
    const [activeSkill, setActiveSkill] = useState(SKILL_CATEGORIES[0]);

    return (
        <div className="min-h-screen">
            <SEOHead
                page="learning"
                customTitle="技巧教學 - 匹克球核心技巧影片示範"
                customDescription="學習匹克球五大核心技巧：發球、接發球、Dink、截擊、戰術策略。專業影片示範，從基礎到進階完整教學。"
            />

            {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500">
                {/* 動態球拍裝飾 */}
                <motion.div
                    animate={{ rotate: [0, 15, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute right-[5%] top-1/2 -translate-y-1/2 text-[200px] opacity-20"
                >
                    🏓
                </motion.div>

                <div className="container mx-auto px-6 md:px-12 relative z-10 py-16">
                    <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
                        <Link to={ROUTES.HOME} className="hover:text-white transition-colors">首頁</Link>
                        <span>/</span>
                        <Link to={ROUTES.LEARNING} className="hover:text-white transition-colors">學習中心</Link>
                        <span>/</span>
                        <span className="text-white">技巧教學</span>
                    </nav>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <span className="inline-flex items-center gap-2 text-rose-100 font-bold text-sm mb-4">
                            <span className="w-8 h-0.5 bg-yellow-400" />
                            TECHNIQUES
                        </span>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-6">
                            技巧教學
                        </h1>

                        <p className="text-xl text-rose-100 leading-relaxed max-w-xl">
                            五大核心技巧分類詳解，含專業影片示範
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
          影片教學
      ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-neutral-900">
                <div className="container mx-auto px-6 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <span className="inline-flex items-center gap-2 text-rose-400 font-bold text-sm mb-4">
                            <span className="w-6 h-0.5 bg-rose-400" />
                            VIDEO TUTORIALS
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-white">
                            影片教學
                        </h2>
                    </motion.div>

                    <VideoTutorials />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
          五大技巧 - 互動選擇
      ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-white">
                <div className="container mx-auto px-6 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <span className="inline-flex items-center gap-2 text-neutral-400 font-bold text-sm mb-4">
                            <span className="w-6 h-0.5 bg-neutral-400" />
                            CORE SKILLS
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
                            五大核心技巧
                        </h2>
                    </motion.div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* 左側：技巧選擇 */}
                        <div className="lg:col-span-4 space-y-2">
                            {SKILL_CATEGORIES.map((skill) => (
                                <button
                                    key={skill.id}
                                    onClick={() => setActiveSkill(skill)}
                                    className={`w-full text-left p-4 transition-all ${activeSkill.id === skill.id
                                            ? `bg-gradient-to-r text-white ${skill.color === 'rose' ? 'from-rose-500 to-orange-500' :
                                                skill.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                                                    skill.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
                                                        skill.color === 'amber' ? 'from-amber-500 to-orange-500' :
                                                            'from-violet-500 to-purple-500'
                                            }`
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{skill.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-lg">{skill.name}</h3>
                                            <p className={`text-sm ${activeSkill.id === skill.id ? 'text-white/70' : 'text-neutral-400'}`}>
                                                {skill.skills.length} 個技巧
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* 右側：技巧詳情 */}
                        <div className="lg:col-span-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSkill.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`h-full bg-gradient-to-br p-8 md:p-12 ${activeSkill.color === 'rose' ? 'from-rose-50 to-orange-50' :
                                            activeSkill.color === 'blue' ? 'from-blue-50 to-indigo-50' :
                                                activeSkill.color === 'emerald' ? 'from-emerald-50 to-teal-50' :
                                                    activeSkill.color === 'amber' ? 'from-amber-50 to-orange-50' :
                                                        'from-violet-50 to-purple-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-4 mb-8">
                                        <span className="text-6xl">{activeSkill.icon}</span>
                                        <div>
                                            <h3 className="text-3xl font-black text-neutral-900 mb-2">
                                                {activeSkill.name}
                                            </h3>
                                            <p className="text-neutral-600 text-lg">
                                                {activeSkill.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h4 className="font-bold text-neutral-700 mb-4">包含技巧：</h4>
                                        <div className="space-y-3">
                                            {activeSkill.skills.map((skill, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 flex items-center justify-center font-bold text-white text-sm ${activeSkill.color === 'rose' ? 'bg-rose-500' :
                                                            activeSkill.color === 'blue' ? 'bg-blue-500' :
                                                                activeSkill.color === 'emerald' ? 'bg-emerald-500' :
                                                                    activeSkill.color === 'amber' ? 'bg-amber-500' :
                                                                        'bg-violet-500'
                                                        }`}>
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-neutral-700 font-medium">{skill}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={`p-4 border-l-4 ${activeSkill.color === 'rose' ? 'bg-rose-100 border-rose-500' :
                                            activeSkill.color === 'blue' ? 'bg-blue-100 border-blue-500' :
                                                activeSkill.color === 'emerald' ? 'bg-emerald-100 border-emerald-500' :
                                                    activeSkill.color === 'amber' ? 'bg-amber-100 border-amber-500' :
                                                        'bg-violet-100 border-violet-500'
                                        }`}>
                                        <p className="font-bold text-neutral-700 mb-1">💡 關鍵提示</p>
                                        <p className="text-neutral-600">{activeSkill.tips}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
          相關連結
      ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 bg-neutral-100">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div>
                            <h2 className="text-2xl font-black text-neutral-900 mb-2">繼續探索</h2>
                            <p className="text-neutral-500">深入學習更多內容</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to={ROUTES.RULES}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                            >
                                📖 規則教學
                            </Link>
                            <Link
                                to={ROUTES.COURT_GUIDE}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                            >
                                🏟️ 球場解說
                            </Link>
                            <Link
                                to={ROUTES.QUIZ}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors"
                            >
                                ✏️ 知識測驗
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Techniques;
