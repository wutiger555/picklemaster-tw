import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LearningPathTimeline from '../components/learning/LearningPathTimeline';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';

const Learning = () => {
  usePageTitle('匹克球學習中心');

  return (
    <div className="min-h-screen">
      <SEOHead page="learning" />

      {/* ═══════════════════════════════════════════════════════════════
          HERO - 學習中心
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700">
        {/* 背景裝飾 - 書本/學習元素 */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-96 h-96 opacity-10"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full text-white">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-800/30 to-transparent" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 py-20">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link to={ROUTES.HOME} className="hover:text-white transition-colors">首頁</Link>
            <span>/</span>
            <span className="text-white">學習中心</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-purple-200 font-bold text-sm mb-4">
              <span className="w-8 h-0.5 bg-purple-300" />
              LEARNING HUB
            </span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-6">
              學習中心
            </h1>

            <p className="text-xl text-purple-100 leading-relaxed max-w-xl">
              從規則到技巧，從理論到實戰——
              <br />
              完整的匹克球學習資源，全在這裡
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          學習資源入口 - 大膽橫向設計
      ═══════════════════════════════════════════════════════════════ */}
      <section>
        {/* 技巧教學 */}
        <Link to={ROUTES.TECHNIQUES} className="group block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500" />
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute right-[10%] top-1/2 -translate-y-1/2 text-[150px] opacity-20"
          >
            🎯
          </motion.div>
          <div className="container mx-auto px-6 md:px-12 py-16 md:py-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-rose-200 text-sm font-bold tracking-wider mb-2 block">TECHNIQUES</span>
                <h2 className="text-4xl md:text-5xl font-black text-white">
                  技巧教學
                </h2>
              </div>
              <div className="md:text-right max-w-md">
                <p className="text-rose-100 text-lg mb-4">
                  發球、Dink、截擊——五大核心技巧分類詳解，含專業影片示範
                </p>
                <span className="inline-flex items-center gap-2 text-yellow-300 font-bold">
                  觀看影片教學
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* 球場解說 */}
        <Link to={ROUTES.COURT_GUIDE} className="group block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors duration-500" />

          {/* 球場線條 */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 group-hover:opacity-20 transition-opacity">
            <svg viewBox="0 0 200 300" className="h-full w-full" preserveAspectRatio="xMaxYMid slice">
              <rect x="10" y="10" width="180" height="280" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600" />
              <line x1="100" y1="10" x2="100" y2="290" stroke="currentColor" strokeWidth="2" className="text-emerald-600" />
            </svg>
          </div>

          <div className="container mx-auto px-6 md:px-12 py-16 md:py-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-emerald-500 group-hover:text-emerald-200 text-sm font-bold tracking-wider mb-2 block transition-colors">COURT GUIDE</span>
                <h2 className="text-4xl md:text-5xl font-black text-neutral-900 group-hover:text-white transition-colors">
                  球場解說
                </h2>
              </div>
              <div className="md:text-right max-w-md">
                <p className="text-neutral-500 group-hover:text-emerald-100 text-lg mb-4 transition-colors">
                  3D 互動球場、區域規則詳解、球路軌跡動畫
                </p>
                <span className="inline-flex items-center gap-2 text-emerald-600 group-hover:text-yellow-300 font-bold transition-colors">
                  互動體驗
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* 規則教學 */}
        <Link to={ROUTES.RULES} className="group block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
              <rect x="20" y="20" width="360" height="160" fill="none" stroke="white" strokeWidth="2" />
              <line x1="200" y1="20" x2="200" y2="180" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <div className="container mx-auto px-6 md:px-12 py-16 md:py-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-blue-200 text-sm font-bold tracking-wider mb-2 block">RULES</span>
                <h2 className="text-4xl md:text-5xl font-black text-white">
                  規則教學
                </h2>
              </div>
              <div className="md:text-right max-w-md">
                <p className="text-blue-100 text-lg mb-4">
                  雙彈跳、廚房區、發球計分——完整規則說明
                </p>
                <span className="inline-flex items-center gap-2 text-yellow-300 font-bold">
                  學習規則
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecas="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* 知識測驗 */}
        <Link to={ROUTES.QUIZ} className="group block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-neutral-50 group-hover:bg-transparent transition-colors duration-500" />
          <div className="container mx-auto px-6 md:px-12 py-16 md:py-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-violet-500 group-hover:text-violet-200 text-sm font-bold tracking-wider mb-2 block transition-colors">QUIZ</span>
                <h2 className="text-4xl md:text-5xl font-black text-neutral-900 group-hover:text-white transition-colors">
                  知識測驗
                </h2>
              </div>
              <div className="md:text-right max-w-md">
                <p className="text-neutral-500 group-hover:text-violet-100 text-lg mb-4 transition-colors">
                  快問快答檢驗你的學習成果，每題都有詳細解說
                </p>
                <span className="inline-flex items-center gap-2 text-violet-600 group-hover:text-yellow-300 font-bold transition-colors">
                  開始測驗
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          建議學習順序
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-neutral-900">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm mb-4">
              <span className="w-8 h-0.5 bg-emerald-400" />
              RECOMMENDED PATH
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              建議學習順序
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-8">
            {[
              { step: 1, title: '規則入門', desc: '了解基本規則', link: ROUTES.RULES, color: 'blue' },
              { step: 2, title: '認識球場', desc: '熟悉場地配置', link: ROUTES.COURT_GUIDE, color: 'emerald' },
              { step: 3, title: '技巧學習', desc: '掌握核心技術', link: ROUTES.TECHNIQUES, color: 'rose' },
              { step: 4, title: '測驗檢驗', desc: '確認學習成果', link: ROUTES.QUIZ, color: 'violet' },
              { step: 5, title: '實戰練習', desc: '找球場開打', link: ROUTES.COURTS, color: 'amber' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={item.link} className="block group">
                  <span className={`text-7xl font-black block mb-4 transition-colors ${item.color === 'blue' ? 'text-blue-500/30 group-hover:text-blue-400' :
                      item.color === 'emerald' ? 'text-emerald-500/30 group-hover:text-emerald-400' :
                        item.color === 'rose' ? 'text-rose-500/30 group-hover:text-rose-400' :
                          item.color === 'violet' ? 'text-violet-500/30 group-hover:text-violet-400' :
                            'text-amber-500/30 group-hover:text-amber-400'
                    }`}>
                    {String(item.step).padStart(2, '0')}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 text-sm">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          學習路徑時間軸
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              完整學習路徑
            </h2>
            <p className="text-xl text-neutral-500">
              從新手到高手的進階之路
            </p>
          </motion.div>

          <LearningPathTimeline />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          其他資源
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-3xl font-black text-neutral-900 mb-2">其他資源</h2>
              <p className="text-neutral-500">探索更多匹克球相關內容</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to={ROUTES.EQUIPMENT}
                className="inline-flex items-center gap-3 px-6 py-3 bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
              >
                🏓 裝備指南
              </Link>
              <Link
                to={ROUTES.LEARNING_PATHS}
                className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition-colors"
              >
                📊 視覺化學習
              </Link>
              <Link
                to={ROUTES.COURTS}
                className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
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

export default Learning;
