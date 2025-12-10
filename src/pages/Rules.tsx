import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import InteractiveCourt from '../components/court/InteractiveCourt';
import BallAnimation from '../components/court/BallAnimation';
import CourtViewer3D from '../components/learning/CourtViewer3D';
import SportComparison from '../components/rules/SportComparison';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';

// 核心規則
const CORE_RULES = [
  {
    id: 'two-bounce',
    title: '雙彈跳規則',
    subtitle: 'Two-Bounce Rule',
    description: '發球後接發球方必須讓球彈地一次才能擊球，發球方的第一次回擊也必須讓球彈地一次。',
    details: [
      '發球後，接發球方必須等球彈地才能回擊',
      '接發球回擊後，發球方也必須等球彈地才能回擊',
      '完成兩次彈跳後，雙方可以選擇截擊或彈地擊球',
      '此規則防止發球方和接發球方過早搶網'
    ],
    color: 'blue'
  },
  {
    id: 'kitchen',
    title: '廚房區規則',
    subtitle: 'Non-Volley Zone (NVZ)',
    description: '廚房區是距離網子 7 英尺的區域。在此區域內不能進行截擊。',
    details: [
      '廚房線高 7 英尺，包含線本身',
      '不能在廚房內截擊（球未落地就打）',
      '擊球動量帶入廚房也算犯規',
      '球彈地後可以進入廚房擊球'
    ],
    color: 'rose'
  },
  {
    id: 'serve',
    title: '發球規則',
    subtitle: 'Serving Rules',
    description: '發球必須是低手發球，球拍接觸球時必須在腰部以下。',
    details: [
      '必須為低手發球（Underhand）',
      '球拍接觸球時需在腰部以下',
      '發球時雙腳必須在底線後',
      '發球須落在對角發球區內'
    ],
    color: 'amber'
  },
  {
    id: 'scoring',
    title: '計分規則',
    subtitle: 'Scoring System',
    description: '只有發球方可以得分。雙打報分時需報出三個數字。',
    details: [
      '只有發球方可以得分',
      '雙打報分格式：己方分-對方分-發球員號',
      '一般比賽打到 11 分，須贏 2 分',
      '開局時只有一位發球員'
    ],
    color: 'emerald'
  }
];

const Rules = () => {
  usePageTitle('匹克球規則教學');
  const [activeRule, setActiveRule] = useState(CORE_RULES[0]);
  const [activeTool, setActiveTool] = useState('3d');

  return (
    <div className="min-h-screen">
      <SEOHead page="rules" />

      {/* ═══════════════════════════════════════════════════════════════
          HERO - 球場風格
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600">
        {/* 球場線條 */}
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
            <rect x="50" y="25" width="700" height="350" fill="none" stroke="white" strokeWidth="3" />
            <line x1="400" y1="25" x2="400" y2="375" stroke="white" strokeWidth="3" />
            <rect x="50" y="25" width="110" height="350" fill="white" fillOpacity="0.2" />
            <rect x="640" y="25" width="110" height="350" fill="white" fillOpacity="0.2" />
          </svg>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 py-16">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link to={ROUTES.HOME} className="hover:text-white transition-colors">首頁</Link>
            <span>/</span>
            <Link to={ROUTES.LEARNING} className="hover:text-white transition-colors">學習中心</Link>
            <span>/</span>
            <span className="text-white">規則教學</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-blue-200 font-bold text-sm mb-4">
              <span className="w-8 h-0.5 bg-yellow-400" />
              RULES
            </span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-6">
              規則教學
            </h1>

            <p className="text-xl text-blue-100 leading-relaxed max-w-xl">
              雙彈跳、廚房區、發球計分——完整規則說明與互動教學
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          四大核心規則
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
              CORE RULES
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
              四大核心規則
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* 規則選擇 */}
            <div className="lg:col-span-4 space-y-2">
              {CORE_RULES.map((rule, index) => (
                <button
                  key={rule.id}
                  onClick={() => setActiveRule(rule)}
                  className={`w-full text-left p-5 transition-all ${activeRule.id === rule.id
                      ? `${rule.color === 'blue' ? 'bg-blue-600' :
                        rule.color === 'rose' ? 'bg-rose-500' :
                          rule.color === 'amber' ? 'bg-amber-500' :
                            'bg-emerald-600'
                      } text-white`
                      : 'bg-neutral-100 hover:bg-neutral-200'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-4xl font-black ${activeRule.id === rule.id ? 'text-white/30' : 'text-neutral-300'
                      }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg">{rule.title}</h3>
                      <p className={`text-sm ${activeRule.id === rule.id ? 'text-white/70' : 'text-neutral-500'}`}>
                        {rule.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 規則詳情 */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRule.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`h-full p-8 md:p-12 ${activeRule.color === 'blue' ? 'bg-blue-50' :
                      activeRule.color === 'rose' ? 'bg-rose-50' :
                        activeRule.color === 'amber' ? 'bg-amber-50' :
                          'bg-emerald-50'
                    }`}
                >
                  <h3 className={`text-3xl font-black mb-2 ${activeRule.color === 'blue' ? 'text-blue-600' :
                      activeRule.color === 'rose' ? 'text-rose-600' :
                        activeRule.color === 'amber' ? 'text-amber-600' :
                          'text-emerald-600'
                    }`}>
                    {activeRule.title}
                  </h3>
                  <p className="text-neutral-500 mb-6">{activeRule.subtitle}</p>

                  <p className="text-neutral-700 text-lg mb-8 leading-relaxed">
                    {activeRule.description}
                  </p>

                  <h4 className="font-bold text-neutral-700 mb-4">詳細說明：</h4>
                  <ul className="space-y-3">
                    {activeRule.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center text-white text-sm font-bold shrink-0 ${activeRule.color === 'blue' ? 'bg-blue-500' :
                            activeRule.color === 'rose' ? 'bg-rose-500' :
                              activeRule.color === 'amber' ? 'bg-amber-500' :
                                'bg-emerald-500'
                          }`}>
                          {i + 1}
                        </span>
                        <span className="text-neutral-600">{detail}</span>
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
          互動工具
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-24 bg-neutral-900">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm mb-4">
              <span className="w-6 h-0.5 bg-blue-400" />
              INTERACTIVE TOOLS
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              視覺化互動工具
            </h2>
          </motion.div>

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
                    ? 'bg-blue-500 text-white'
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
                <p className="text-neutral-400 mb-6">拖曳滑鼠旋轉視角，了解球場立體結構</p>
                <CourtViewer3D />
              </motion.div>
            )}

            {activeTool === 'interactive' && (
              <motion.div
                key="interactive"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-neutral-400 mb-6">點擊各區域了解詳細規則</p>
                <InteractiveCourt />
              </motion.div>
            )}

            {activeTool === 'trajectory' && (
              <motion.div
                key="trajectory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-neutral-400 mb-6">觀察不同擊球的球路軌跡</p>
                <BallAnimation />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          運動對比
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="inline-flex items-center gap-2 text-amber-600 font-bold text-sm mb-4">
              <span className="w-6 h-0.5 bg-amber-500" />
              COMPARISON
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
              匹克球 vs 網球 vs 羽球
            </h2>
          </motion.div>

          <SportComparison />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          相關連結
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">規則學會了？</h2>
              <p className="text-blue-100">繼續學習技巧或開始實戰！</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to={ROUTES.TECHNIQUES}
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors"
              >
                🎯 技巧教學
              </Link>
              <Link
                to={ROUTES.QUIZ}
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors"
              >
                ✏️ 知識測驗
              </Link>
              <Link
                to={ROUTES.COURTS}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors"
              >
                📍 找球場開打
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rules;
