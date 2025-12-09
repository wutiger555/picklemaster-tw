import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import CourtSkeleton from '../components/hero/CourtSkeleton';

// Lazy load heavy sections
const HeroCourtPreview = lazy(() => import('../components/hero/HeroCourtPreview'));
const NewsSection = lazy(() => import('../components/news/NewsSection'));

const Home = () => {
  usePageTitle();

  return (
    <div className="min-h-screen">
      <SEOHead page="home" />

      {/* Hero Section - 更緊湊 */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white min-h-[60vh] flex items-center overflow-hidden">
        {/* 簡化背景 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-950/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* 左側：標題和 CTA */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                {/* 主標題 - H1 for SEO */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
                  <span className="block">台灣最完整的</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
                    匹克球學習平台
                  </span>
                </h1>

                <p className="text-base md:text-lg text-white/80 mb-6 max-w-md mx-auto lg:mx-0">
                  從零開始學匹克球！全台55+球場地圖、互動式規則教學、專業裝備推薦，30分鐘讓你愛上匹克球 🎾
                </p>

                {/* CTA 按鈕 */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                  <Link
                    to={ROUTES.RULES}
                    className="group inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    匹克球規則入門
                  </Link>
                  <Link
                    to={ROUTES.COURTS}
                    className="group inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold text-base border border-white/30 hover:bg-white/25 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    找附近球場
                  </Link>
                </div>

                {/* 快速統計 */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg">📍</span> 55+ 球場
                  </span>
                  <span className="w-px h-4 bg-white/30" />
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg">📚</span> 3D互動教學
                  </span>
                  <span className="w-px h-4 bg-white/30" />
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg">🏓</span> 裝備指南
                  </span>
                </div>
              </motion.div>

              {/* 右側：3D 球場預覽 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:block"
              >
                <Suspense fallback={<CourtSkeleton />}>
                  <HeroCourtPreview />
                </Suspense>
                <p className="text-center text-white/50 text-xs mt-2">
                  ↻ 360° 旋轉檢視球場配置
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 波浪裝飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto">
            <path
              fill="#ffffff"
              d="M0,40L60,44C120,48,240,56,360,52C480,48,600,32,720,28C840,24,960,32,1080,36C1200,40,1320,40,1380,40L1440,40L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
            />
          </svg>
        </div>
      </section>

      {/* Quick Navigation - 3個主要功能入口 */}
      <section className="py-10 md:py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {/* 規則教學入口 */}
            <Link to={ROUTES.RULES} className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shrink-0">
                    📖
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-neutral-900 mb-1">匹克球規則</h2>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      雙彈跳、廚房區、發球規則，互動式3D教學一次搞懂
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-emerald-600 text-sm font-semibold group-hover:gap-2 transition-all">
                      開始學習
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* 球場地圖入口 */}
            <Link to={ROUTES.COURTS} className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-2xl shrink-0">
                    🗺️
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-neutral-900 mb-1">球場地圖</h2>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      台北、台中、高雄、台南，全台55+球場資訊一覽
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all">
                      找球場
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* 裝備指南入口 */}
            <Link to={ROUTES.EQUIPMENT} className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shrink-0">
                    🏓
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-neutral-900 mb-1">裝備推薦</h2>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      球拍選購指南、材質分析、職業選手裝備解析
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-amber-600 text-sm font-semibold group-hover:gap-2 transition-all">
                      查看推薦
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* What is Pickleball - SEO 內容區塊 */}
      <section className="py-12 md:py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
                什麼是匹克球？
              </h2>
              <p className="text-neutral-600">
                結合網球、羽球、乒乓球精華的新興運動
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 特點列表 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {[
                  { icon: '🎯', title: '容易上手', desc: '30分鐘就能開始打，適合各年齡層' },
                  { icon: '💪', title: '運動量適中', desc: '比網球溫和，比乒乓球more活動' },
                  { icon: '👥', title: '社交性強', desc: '雙打為主，是認識朋友的好機會' },
                  { icon: '🌍', title: '全球熱潮', desc: '美國成長最快運動，台灣也正流行' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-neutral-100">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                      <p className="text-sm text-neutral-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* 常見問題預覽 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-neutral-100 p-6"
              >
                <h3 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
                  <span>❓</span> 常見問題
                </h3>
                <div className="space-y-4">
                  {[
                    { q: '匹克球和網球有什麼不同？', link: ROUTES.FAQ },
                    { q: '新手需要準備什麼裝備？', link: ROUTES.EQUIPMENT },
                    { q: '台灣哪裡可以打匹克球？', link: ROUTES.COURTS },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.link}
                      className="block p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors group"
                    >
                      <span className="text-sm text-neutral-700 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                        {item.q}
                        <svg className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  to={ROUTES.FAQ}
                  className="inline-flex items-center gap-1 mt-4 text-emerald-600 font-semibold text-sm hover:gap-2 transition-all"
                >
                  查看所有常見問題
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 新聞區塊 */}
      <Suspense fallback={<div className="w-full h-64 animate-pulse bg-neutral-100" />}>
        <NewsSection />
      </Suspense>

      {/* 學習路徑 - 精簡版 */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-neutral-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-neutral-900">
              學習路徑
            </h2>
            <p className="text-neutral-600">
              循序漸進，從零基礎到進階高手
            </p>
          </motion.div>

          {/* 簡化的三步驟 */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: 1, level: '新手入門', icon: '🌱', color: 'emerald', items: ['認識球場規則', '基礎握拍發球', '雙彈跳規則'] },
                { step: 2, level: '中階進修', icon: '⚡', color: 'blue', items: ['進階擊球技巧', '戰術運用', '雙打配合'] },
                { step: 3, level: '高手養成', icon: '🏆', color: 'purple', items: ['技術精進', '比賽策略', '心理素質'] },
              ].map((path, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={ROUTES.LEARNING_PATHS}
                    className={`block p-5 rounded-xl border-2 bg-white hover:shadow-md transition-all duration-300
                      ${path.color === 'emerald' ? 'border-emerald-200 hover:border-emerald-400' : ''}
                      ${path.color === 'blue' ? 'border-blue-200 hover:border-blue-400' : ''}
                      ${path.color === 'purple' ? 'border-purple-200 hover:border-purple-400' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{path.icon}</span>
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                          ${path.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${path.color === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
                          ${path.color === 'purple' ? 'bg-purple-100 text-purple-700' : ''}
                        `}>
                          STEP {path.step}
                        </span>
                        <h3 className="font-bold text-neutral-900 mt-1">{path.level}</h3>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {path.items.map((item, i) => (
                        <li key={i} className="text-sm text-neutral-600 flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full
                            ${path.color === 'emerald' ? 'bg-emerald-400' : ''}
                            ${path.color === 'blue' ? 'bg-blue-400' : ''}
                            ${path.color === 'purple' ? 'bg-purple-400' : ''}
                          `} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <Link
                to={ROUTES.LEARNING_PATHS}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                查看完整學習路徑
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 工具推薦區 */}
      <section className="py-10 md:py-14 bg-neutral-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  實用工具
                </h2>
                <p className="text-neutral-400 text-sm">
                  讓你的匹克球體驗更完整
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={ROUTES.SCORER}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-sm transition-colors"
                >
                  📊 計分器
                </Link>
                <Link
                  to={ROUTES.GAME}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold text-sm transition-colors"
                >
                  🎮 互動遊戲
                </Link>
                <Link
                  to={ROUTES.RESOURCES}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-sm transition-colors"
                >
                  📚 學習資源
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
