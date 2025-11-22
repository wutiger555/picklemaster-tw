import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { ROUTES, BRAND } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { staggerContainer, staggerItem } from '../utils/animations';
import GlassCard from '../components/common/GlassCard';
import SEOHead from '../components/common/SEOHead';

const HeroCourtPreview = lazy(() => import('../components/hero/HeroCourtPreview'));
import NewsSection from '../components/news/NewsSection';

const Home = () => {
  usePageTitle();


  // 視差滾動效果
  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 500], [0, -50]);
  const parallaxY2 = useTransform(scrollY, [0, 500], [0, -100]);
  const parallaxY3 = useTransform(scrollY, [0, 500], [0, -150]);

  const features = [
    {
      title: '互動式規則教學',
      description: '點擊球場區域即時學習規則，動畫演示讓學習更直觀',
      icon: '🎯',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600',
      link: ROUTES.RULES,
    },
    {
      title: '3D 球場配置',
      description: '360° 旋轉檢視球場結構，深入理解站位與戰術',
      icon: '🏟️',
      color: 'bg-gradient-to-br from-green-50 to-green-100',
      iconBg: 'bg-green-500',
      textColor: 'text-green-600',
      link: ROUTES.LEARNING_PATHS,
    },
    {
      title: '專業計分器',
      description: '手機適配、支援橫豎屏、螢幕常亮，比賽計分必備工具',
      icon: '📊',
      color: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
      textColor: 'text-orange-600',
      link: ROUTES.SCORER,
      highlight: true,
    },
    {
      title: '全台球場地圖',
      description: '55+ 球場詳細資訊，快速找到離你最近的球場',
      icon: '📍',
      color: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      textColor: 'text-purple-600',
      link: ROUTES.COURTS,
    },
  ];



  return (
    <div className="min-h-screen">
      <SEOHead page="home" />
      {/* 英雄區塊 - Above the Fold 黃金區優化 */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
        {/* 球場主題背景 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 球場紋理底層 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }} />
          </div>

          {/* 球場線條裝飾 */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 800">
            {/* 水平線 */}
            <line x1="0" y1="200" x2="1000" y2="200" stroke="white" strokeWidth="3" strokeDasharray="20,15" />
            <line x1="0" y1="400" x2="1000" y2="400" stroke="white" strokeWidth="4" />
            <line x1="0" y1="600" x2="1000" y2="600" stroke="white" strokeWidth="3" strokeDasharray="20,15" />

            {/* 垂直線 */}
            <line x1="250" y1="0" x2="250" y2="800" stroke="white" strokeWidth="2" opacity="0.5" />
            <line x1="500" y1="0" x2="500" y2="800" stroke="white" strokeWidth="3" strokeDasharray="15,10" />
            <line x1="750" y1="0" x2="750" y2="800" stroke="white" strokeWidth="2" opacity="0.5" />

            {/* 廚房區域矩形 */}
            <rect x="100" y="250" width="300" height="140" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
            <rect x="600" y="410" width="300" height="140" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
          </svg>

          {/* 匹克球裝飾元素（帶洞的球） */}
          <motion.div
            style={{ y: parallaxY1 }}
            className="absolute top-20 right-20 w-32 h-32 opacity-20"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full animate-float">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(251, 191, 36, 0.8)" strokeWidth="3" />
              <circle cx="50" cy="50" r="40" fill="rgba(251, 191, 36, 0.3)" />
              {/* 球上的洞 */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const x = 50 + 25 * Math.cos((angle * Math.PI) / 180);
                const y = 50 + 25 * Math.sin((angle * Math.PI) / 180);
                return <circle key={i} cx={x} cy={y} r="4" fill="rgba(0,0,0,0.6)" />;
              })}
              <circle cx="50" cy="50" r="4" fill="rgba(0,0,0,0.6)" />
            </svg>
          </motion.div>

          <motion.div
            style={{ y: parallaxY2 }}
            className="absolute bottom-32 left-16 w-24 h-24 opacity-15"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce-slow">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(251, 191, 36, 0.9)" strokeWidth="3" />
              <circle cx="50" cy="50" r="40" fill="rgba(251, 191, 36, 0.4)" />
              {[30, 90, 150, 210, 270, 330].map((angle, i) => {
                const x = 50 + 25 * Math.cos((angle * Math.PI) / 180);
                const y = 50 + 25 * Math.sin((angle * Math.PI) / 180);
                return <circle key={i} cx={x} cy={y} r="4" fill="rgba(0,0,0,0.6)" />;
              })}
              <circle cx="50" cy="50" r="4" fill="rgba(0,0,0,0.6)" />
            </svg>
          </motion.div>

          <motion.div
            style={{ y: parallaxY3 }}
            className="absolute top-1/3 left-1/4 w-20 h-20 opacity-10"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse-slow">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(251, 191, 36, 1)" strokeWidth="3" />
              <circle cx="50" cy="50" r="40" fill="rgba(251, 191, 36, 0.5)" />
              {[0, 72, 144, 216, 288].map((angle, i) => {
                const x = 50 + 20 * Math.cos((angle * Math.PI) / 180);
                const y = 50 + 20 * Math.sin((angle * Math.PI) / 180);
                return <circle key={i} cx={x} cy={y} r="3" fill="rgba(0,0,0,0.7)" />;
              })}
            </svg>
          </motion.div>

          {/* 球拍輪廓裝飾 */}
          <motion.div
            animate={{
              rotate: [0, 5, 0, -5, 0],
              opacity: [0.05, 0.08, 0.05]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-1/4 w-40 h-52"
          >
            <svg viewBox="0 0 100 140" className="w-full h-full">
              {/* 球拍拍面 */}
              <ellipse cx="50" cy="40" rx="35" ry="38" fill="none" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="3" />
              <ellipse cx="50" cy="40" rx="30" ry="33" fill="rgba(251, 191, 36, 0.1)" />
              {/* 網格 */}
              {[...Array(6)].map((_, i) => (
                <line key={`h${i}`} x1="20" y1={10 + i * 10} x2="80" y2={10 + i * 10} stroke="rgba(251, 191, 36, 0.3)" strokeWidth="1" />
              ))}
              {[...Array(6)].map((_, i) => (
                <line key={`v${i}`} x1={25 + i * 10} y1="10" x2={25 + i * 10} y2="70" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="1" />
              ))}
              {/* 握把 */}
              <rect x="43" y="78" width="14" height="50" rx="7" fill="rgba(251, 191, 36, 0.4)" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="2" />
            </svg>
          </motion.div>

          {/* 光暈效果 */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-green-950/40" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 左側：3D 球場預覽 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <Suspense fallback={
                <div className="w-full h-64 md:h-80 flex items-center justify-center bg-white/10 rounded-2xl">
                  <div className="text-lg animate-pulse text-white">載入中...</div>
                </div>
              }>
                <HeroCourtPreview />
              </Suspense>
              <p className="text-center text-white/80 text-sm mt-4">
                ↻ 360° 旋轉檢視真實球場配置
              </p>
            </motion.div>

            {/* 右側：專業品牌呈現 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-8"
              >
                {/* 品牌標識區 */}
                <div className="relative">
                  <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight text-white drop-shadow-2xl">
                    {BRAND.NAME_ZH}
                  </h1>

                  {/* 英文副標 */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-1 w-12 bg-white/60 rounded-full"></div>
                    <p className="text-lg md:text-xl font-semibold text-white/90 tracking-wide">
                      {BRAND.NAME}
                    </p>
                  </div>
                </div>

                {/* 主要描述卡片 */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/50">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-pickleball-500 to-sport-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                        {BRAND.TAGLINE}
                      </h2>
                      <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                        {BRAND.DESCRIPTION}
                      </p>
                    </div>
                  </div>

                  {/* 特色標籤 */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-200">
                      📍 55+ 球場
                    </span>
                    <span className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold border border-green-200">
                      🎓 互動教學
                    </span>
                    <span className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold border border-purple-200">
                      🎾 裝備指南
                    </span>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6"></div>

                  {/* CTA 按鈕組 - 霓虹發光效果 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={ROUTES.RULES}
                        className="group relative bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4 rounded-xl font-extrabold text-base shadow-neon-primary hover:shadow-[0_0_30px_rgba(16,185,129,0.6),0_0_50px_rgba(16,185,129,0.4)] transition-all duration-300 flex items-center justify-center overflow-hidden animate-glow-pulse"
                      >
                        <span className="absolute inset-0 bg-shimmer-gradient animate-shimmer"></span>
                        <span className="relative flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          開始學習
                        </span>
                      </Link>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={ROUTES.COURTS}
                        className="group bg-white/95 backdrop-blur-sm text-gray-900 px-6 py-4 rounded-xl font-bold text-base border-2 border-neutral-200 hover:border-primary-500 hover:text-primary-600 hover:shadow-elevated-md transition-all duration-300 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        找球場
                      </Link>
                    </motion.div>
                  </div>
                </div>

                {/* 底部統計快速預覽 */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: '🏟️', number: '55+', label: '球場' },
                    { icon: '📚', number: '100+', label: '教學' },
                    { icon: '👥', number: '1000+', label: '玩家' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50 hover:scale-105 transition-transform duration-300"
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xl font-black text-gray-800">{item.number}</div>
                      <div className="text-xs text-gray-600 font-semibold">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* 波浪裝飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#ffffff"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>



      {/* 核心功能 - Bento Grid 不對稱佈局 */}
      <section className="py-28 md:py-36 bg-gradient-to-b from-white via-neutral-50/30 to-neutral-50 relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 text-neutral-900 tracking-tight">
              台灣匹克球資源中心
            </h2>
            <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              從規則學習、球場查詢到裝備指南，一站式平台滿足初學者到進階玩家的所有需求
            </p>
          </motion.div>

          {/* Bento Grid 不對稱佈局 */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {/* 1. 互動式規則教學 - 中等卡片 */}
            <motion.div variants={staggerItem} className="lg:col-span-2">
              <Link to={features[0].link} className="block h-full">
                <GlassCard
                  variant="primary"
                  size="lg"
                  hoverable
                  magnetic
                  clickable
                  className="h-full relative min-h-[280px]"
                >
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <span className="text-4xl">{features[0].icon}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4 text-neutral-900">
                    {features[0].title}
                  </h3>
                  <p className="text-base text-neutral-600 leading-relaxed mb-6">
                    {features[0].description}
                  </p>
                  <div className="flex items-center text-neutral-900 font-semibold text-body-md group-hover:translate-x-1 transition-transform duration-300">
                    <span>立即體驗</span>
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>

            {/* 2. 3D 球場配置 - 中等卡片 */}
            <motion.div variants={staggerItem} className="lg:col-span-2">
              <Link to={features[1].link} className="block h-full">
                <GlassCard
                  variant="secondary"
                  size="lg"
                  hoverable
                  magnetic
                  clickable
                  className="h-full relative min-h-[280px]"
                >
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <span className="text-4xl">{features[1].icon}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4 text-neutral-900">
                    {features[1].title}
                  </h3>
                  <p className="text-base text-neutral-600 leading-relaxed mb-6">
                    {features[1].description}
                  </p>
                  <div className="flex items-center text-neutral-900 font-semibold text-body-md group-hover:translate-x-1 transition-transform duration-300">
                    <span>開始探索</span>
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>

            {/* 3. 專業計分器 - 超大強調卡片（2x2） */}
            <motion.div variants={staggerItem} className="lg:col-span-2 lg:row-span-2">
              <Link to={features[2].link} className="block h-full">
                <GlassCard
                  variant="accent"
                  size="xl"
                  hoverable
                  magnetic
                  clickable
                  className="h-full relative min-h-[400px] lg:min-h-[580px]"
                >
                  <div className="absolute top-6 right-6 bg-accent-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-neon-accent animate-pulse">
                    🔥 熱門工具
                  </div>

                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <div className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 shadow-elevated-md">
                        <span className="text-5xl">{features[2].icon}</span>
                      </div>
                      <h3 className="font-display text-display-sm md:text-display-md font-black mb-6 text-neutral-900 leading-tight">
                        {features[2].title}
                      </h3>
                      <p className="text-body-xl text-neutral-700 leading-relaxed mb-8">
                        {features[2].description}
                      </p>

                      {/* 特色亮點 */}
                      <div className="space-y-4 mb-8">
                        {['支援橫豎屏切換', '螢幕常亮不熄滅', '音效與震動提示', '比賽記錄追蹤'].map((point, i) => (
                          <div key={i} className="flex items-center text-neutral-800">
                            <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                              <svg className="w-4 h-4 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-body-md font-medium">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-accent-500 to-accent-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-elevated-lg hover:shadow-elevated-xl transition-all duration-300 text-center"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        立即使用計分器
                      </span>
                    </motion.div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>

            {/* 4. 全台球場地圖 - 大卡片 */}
            <motion.div variants={staggerItem} className="lg:col-span-2">
              <Link to={features[3].link} className="block h-full">
                <GlassCard
                  variant="light"
                  size="lg"
                  hoverable
                  magnetic
                  clickable
                  className="h-full relative min-h-[280px]"
                >
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <span className="text-4xl">{features[3].icon}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4 text-neutral-900">
                    {features[3].title}
                  </h3>
                  <p className="text-base text-neutral-600 leading-relaxed mb-6">
                    {features[3].description}
                  </p>

                  {/* 快速統計 */}
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 bg-white/80 rounded-xl p-3 text-center border border-neutral-200">
                      <div className="text-2xl font-black text-primary-600">55+</div>
                      <div className="text-xs text-neutral-600 font-medium">球場數</div>
                    </div>
                    <div className="flex-1 bg-white/80 rounded-xl p-3 text-center border border-neutral-200">
                      <div className="text-2xl font-black text-secondary-600">22</div>
                      <div className="text-xs text-neutral-600 font-medium">縣市</div>
                    </div>
                  </div>

                  <div className="flex items-center text-neutral-900 font-semibold text-body-md group-hover:translate-x-1 transition-transform duration-300">
                    <span>查看地圖</span>
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection />

      {/* 系統化學習路徑 - Grid Layout */}
      <section className="py-28 md:py-32 bg-gradient-to-b from-neutral-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 text-neutral-900 tracking-tight">
              系統化學習路徑
            </h2>
            <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              無論新手或進階玩家，都能找到適合的學習內容
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                level: '新手入門',
                icon: '🌱',
                description: '從零開始，建立紮實基礎',
                features: ['球場認識', '規則入門', '握拍技巧', '發球練習'],
                color: 'from-emerald-500 to-teal-500',
                bg: 'bg-emerald-50'
              },
              {
                level: '中階進修',
                icon: '⚡',
                description: '提升技術，掌握戰術策略',
                features: ['進階技巧', '戰術運用', '雙打配合', '節奏掌控'],
                color: 'from-blue-500 to-indigo-500',
                bg: 'bg-blue-50'
              },
              {
                level: '高手養成',
                icon: '🏆',
                description: '精進專業，追求卓越表現',
                features: ['技術精進', '心理素質', '體能訓練', '教練認證'],
                color: 'from-purple-500 to-pink-500',
                bg: 'bg-purple-50'
              },
            ].map((path, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${path.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-700`} />
                <div className="relative h-full bg-white rounded-3xl p-10 shadow-md hover:shadow-2xl border border-neutral-200/50 flex flex-col items-center text-center overflow-hidden transition-all duration-500">
                  {/* Step Indicator */}
                  <div className="absolute top-4 right-6 text-6xl font-black text-neutral-100 select-none pointer-events-none group-hover:text-neutral-50 transition-colors duration-300">
                    0{index + 1}
                  </div>

                  <div className={`w-20 h-20 ${path.bg} rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500 ease-out`}>
                    {path.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4 relative z-10">{path.level}</h3>
                  <p className="text-base text-neutral-600 mb-10 relative z-10 leading-relaxed px-2">{path.description}</p>

                  <div className="space-y-3 w-full mb-8 relative z-10">
                    {path.features.map((feature, i) => (
                      <div key={i} className="flex items-center justify-center text-sm text-neutral-600 font-medium bg-neutral-50/80 py-2.5 rounded-lg border border-neutral-100">
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Link
                    to={ROUTES.LEARNING_PATHS}
                    className={`mt-auto w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${path.color} shadow-md hover:shadow-lg transition-all active:scale-95 relative z-10`}
                  >
                    開始學習
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 區塊 - 視覺優化 */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-900">
          <div className="absolute inset-0 bg-[url('/court-texture.png')] opacity-5 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 to-neutral-950/90" />
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-emerald-500/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-teal-500/5 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              準備好開始了嗎？
            </h2>
            <p className="text-lg md:text-xl text-neutral-300/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              加入台灣成長最快的運動社群，一起享受匹克球的樂趣
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={ROUTES.COURTS}
                className="w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/30"
              >
                尋找附近球場
              </Link>
              <Link
                to={ROUTES.RULES}
                className="w-full sm:w-auto px-10 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-xl font-bold text-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-1"
              >
                學習基礎規則
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div >
  );
};

export default Home;
