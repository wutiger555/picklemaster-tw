import { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import { ROUTES, COURT_DIMENSIONS } from '../utils/constants';

// Lazy load heavy 3D components
const CourtViewer3D = lazy(() => import('../components/learning/CourtViewer3D'));
const InteractiveCourt = lazy(() => import('../components/court/InteractiveCourt'));
const BallAnimation = lazy(() => import('../components/court/BallAnimation'));

// 球場區域
const COURT_ZONES = [
    {
        id: 'kitchen',
        name: '廚房區',
        english: 'Non-Volley Zone',
        color: 'rose',
        description: '距離網子 7 英尺（2.13 公尺）的區域，也稱為 NVZ。在此區域內不能進行截擊。',
        rules: [
            '不能在廚房內截擊（球未落地就打）',
            '擊球動量帶入廚房也算犯規',
            '球彈地後可以進入廚房擊球',
            '站在廚房線上也算在廚房內'
        ],
    },
    {
        id: 'service',
        name: '發球區',
        english: 'Service Area',
        color: 'blue',
        description: '網子後方至底線的區域，分為左右兩個發球區。發球必須對角發到對方發球區。',
        rules: [
            '發球必須發向對角發球區',
            '發球時雙腳必須在底線後方',
            '發球須落在對角發球區內（含線）',
            '發球碰網落入正確區域仍有效'
        ],
    },
    {
        id: 'baseline',
        name: '底線區',
        english: 'Baseline Area',
        color: 'amber',
        description: '球場最後方的邊界線區域。發球時必須站在底線後方，底線也是判斷界內外的重要標準。',
        rules: [
            '發球時雙腳不能踩底線',
            '球落在底線上算界內',
            '接發球者通常站在底線附近'
        ],
    },
    {
        id: 'transition',
        name: '過渡區',
        english: 'Transition Zone',
        color: 'emerald',
        description: '廚房線與底線之間的區域。這是攻防轉換的關鍵區域，需要靈活移動。',
        rules: [
            '從底線上網時會經過此區域',
            '打第三拍落地球時常站在此處',
            '需要準備隨時上網或後退'
        ],
    },
];

const CourtGuide = () => {
    usePageTitle('匹克球球場解說');
    const [activeZone, setActiveZone] = useState(COURT_ZONES[0]);
    const [activeTool, setActiveTool] = useState('3d');

    return (
        <div className="min-h-screen">
            <SEOHead
                page="learning"
                customTitle="球場解說 - 3D 互動球場與區域規則"
                customDescription="透過 3D 互動球場了解匹克球場地配置，包含廚房區、發球區等區域詳細規則說明。"
            />

            {/* ═══════════════════════════════════════════════════════════════
          HERO - 球場線條風格
      ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
                {/* 球場線條背景 */}
                <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
                        <rect x="50" y="25" width="700" height="350" fill="none" stroke="white" strokeWidth="3" />
                        <line x1="400" y1="25" x2="400" y2="375" stroke="white" strokeWidth="3" />
                        {/* 廚房區 */}
                        <rect x="50" y="25" width="110" height="350" fill="white" fillOpacity="0.2" />
                        <rect x="640" y="25" width="110" height="350" fill="white" fillOpacity="0.2" />
                        <line x1="160" y1="25" x2="160" y2="375" stroke="white" strokeWidth="2" />
                        <line x1="640" y1="25" x2="640" y2="375" stroke="white" strokeWidth="2" />
                    </svg>
                </div>

                <div className="container mx-auto px-6 md:px-12 relative z-10 py-16">
                    <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
                        <Link to={ROUTES.HOME} className="hover:text-white transition-colors">首頁</Link>
                        <span>/</span>
                        <Link to={ROUTES.LEARNING} className="hover:text-white transition-colors">學習中心</Link>
                        <span>/</span>
                        <span className="text-white">球場解說</span>
                    </nav>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <span className="inline-flex items-center gap-2 text-emerald-100 font-bold text-sm mb-4">
                            <span className="w-8 h-0.5 bg-yellow-400" />
                            COURT GUIDE
                        </span>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-6">
                            球場解說
                        </h1>

                        <p className="text-xl text-emerald-100 leading-relaxed max-w-xl">
                            3D 互動球場、區域規則詳解、球路軌跡動畫
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
          互動工具
      ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-20 bg-neutral-900">
                <div className="container mx-auto px-6 md:px-12">
                    {/* 工具切換 */}
                    <div className="flex flex-wrap gap-4 mb-10">
                        {[
                            { id: '3d', name: '3D 球場', icon: '🏟️' },
                            { id: 'interactive', name: '互動球場', icon: '📍' },
                            { id: 'trajectory', name: '球路軌跡', icon: '🎾' },
                        ].map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={`px-6 py-3 font-bold text-lg transition-colors ${activeTool === tool.id
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                                    }`}
                            >
                                {tool.icon} {tool.name}
                            </button>
                        ))}
                    </div>

                    {/* 工具展示 */}
                    <AnimatePresence mode="wait">
                        {activeTool === '3d' && (
                            <motion.div
                                key="3d"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="text-center mb-6">
                                    <p className="text-neutral-400">拖曳滑鼠旋轉視角，了解球場立體結構</p>
                                </div>
                                <Suspense fallback={<div className="h-96 bg-neutral-800 animate-pulse" />}>
                                    <CourtViewer3D />
                                </Suspense>
                            </motion.div>
                        )}

                        {activeTool === 'interactive' && (
                            <motion.div
                                key="interactive"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="text-center mb-6">
                                    <p className="text-neutral-400">點擊各區域了解詳細規則</p>
                                </div>
                                <Suspense fallback={<div className="h-96 bg-neutral-800 animate-pulse" />}>
                                    <InteractiveCourt />
                                </Suspense>
                            </motion.div>
                        )}

                        {activeTool === 'trajectory' && (
                            <motion.div
                                key="trajectory"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="text-center mb-6">
                                    <p className="text-neutral-400">觀察不同擊球的球路軌跡</p>
                                </div>
                                <Suspense fallback={<div className="h-96 bg-neutral-800 animate-pulse" />}>
                                    <BallAnimation />
                                </Suspense>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
          球場區域
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
                            COURT ZONES
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
                            球場區域詳解
                        </h2>
                    </motion.div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* 區域選擇 */}
                        <div className="lg:col-span-4 space-y-2">
                            {COURT_ZONES.map((zone) => (
                                <button
                                    key={zone.id}
                                    onClick={() => setActiveZone(zone)}
                                    className={`w-full text-left p-5 transition-all border-l-4 ${activeZone.id === zone.id
                                            ? `bg-neutral-100 ${zone.color === 'rose' ? 'border-rose-500' :
                                                zone.color === 'blue' ? 'border-blue-500' :
                                                    zone.color === 'amber' ? 'border-amber-500' :
                                                        'border-emerald-500'
                                            }`
                                            : 'border-transparent hover:bg-neutral-50'
                                        }`}
                                >
                                    <h3 className="font-bold text-lg text-neutral-900">{zone.name}</h3>
                                    <p className="text-sm text-neutral-500">{zone.english}</p>
                                </button>
                            ))}
                        </div>

                        {/* 區域詳情 */}
                        <div className="lg:col-span-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeZone.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`p-8 md:p-10 ${activeZone.color === 'rose' ? 'bg-rose-50' :
                                            activeZone.color === 'blue' ? 'bg-blue-50' :
                                                activeZone.color === 'amber' ? 'bg-amber-50' :
                                                    'bg-emerald-50'
                                        }`}
                                >
                                    <h3 className={`text-3xl font-black mb-2 ${activeZone.color === 'rose' ? 'text-rose-600' :
                                            activeZone.color === 'blue' ? 'text-blue-600' :
                                                activeZone.color === 'amber' ? 'text-amber-600' :
                                                    'text-emerald-600'
                                        }`}>
                                        {activeZone.name}
                                    </h3>
                                    <p className="text-neutral-500 mb-6">{activeZone.english}</p>

                                    <p className="text-neutral-700 text-lg mb-8 leading-relaxed">
                                        {activeZone.description}
                                    </p>

                                    <h4 className="font-bold text-neutral-700 mb-4">規則要點：</h4>
                                    <ul className="space-y-3">
                                        {activeZone.rules.map((rule, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className={`w-6 h-6 flex items-center justify-center text-white text-sm font-bold shrink-0 ${activeZone.color === 'rose' ? 'bg-rose-500' :
                                                        activeZone.color === 'blue' ? 'bg-blue-500' :
                                                            activeZone.color === 'amber' ? 'bg-amber-500' :
                                                                'bg-emerald-500'
                                                    }`}>
                                                    {i + 1}
                                                </span>
                                                <span className="text-neutral-600">{rule}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
          球場尺寸
      ═══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-700">
                <div className="container mx-auto px-6 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <span className="inline-flex items-center gap-2 text-emerald-200 font-bold text-sm mb-4">
                            <span className="w-6 h-0.5 bg-yellow-400" />
                            COURT DIMENSIONS
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-white">
                            球場尺寸規格
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: '球場長度', value: COURT_DIMENSIONS.LENGTH, unit: '英尺' },
                            { label: '球場寬度', value: COURT_DIMENSIONS.WIDTH, unit: '英尺' },
                            { label: '廚房區深度', value: COURT_DIMENSIONS.NVZ_DEPTH, unit: '英尺' },
                            { label: '網高（中央）', value: COURT_DIMENSIONS.NET_HEIGHT_CENTER, unit: '英寸' },
                        ].map((dim, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-5xl md:text-6xl font-black text-white mb-2">
                                    {dim.value}
                                </div>
                                <div className="text-emerald-200 text-sm uppercase tracking-wider mb-1">
                                    {dim.unit}
                                </div>
                                <div className="text-white font-medium">{dim.label}</div>
                            </motion.div>
                        ))}
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
                            <h2 className="text-2xl font-black text-neutral-900 mb-2">繼續學習</h2>
                            <p className="text-neutral-500">深入了解規則和技巧</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to={ROUTES.RULES}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                            >
                                📖 規則教學
                            </Link>
                            <Link
                                to={ROUTES.TECHNIQUES}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors"
                            >
                                🎯 技巧教學
                            </Link>
                            <Link
                                to={ROUTES.COURTS}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                            >
                                📍 找球場
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CourtGuide;
