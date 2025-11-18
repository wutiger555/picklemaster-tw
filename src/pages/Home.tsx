import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Suspense, lazy, useState } from 'react';
import { ROUTES, BRAND } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { staggerContainer, staggerItem } from '../utils/animations';
import GlassCard from '../components/common/GlassCard';
import SEOHead from '../components/common/SEOHead';

const HeroCourtPreview = lazy(() => import('../components/hero/HeroCourtPreview'));

const Home = () => {
  usePageTitle();
  const [expandedPath, setExpandedPath] = useState<number | null>(null);

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

  const stats = [
    { number: '50+', label: '球場資訊' },
    { number: '100+', label: '技巧教學' },
    { number: '1000+', label: '活躍玩家' },
  ];

  return (
    <div className="min-h-screen">
      <SEOHead page="home" />
      {/* 英雄區塊 - Above the Fold 黃金區優化 */}
      <section className="relative bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 text-white min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
        {/* 視差背景動畫圓圈 */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            style={{ y: parallaxY1 }}
            className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"
          />
          <motion.div
            style={{ y: parallaxY2 }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-float"
          />
          <motion.div
            style={{ y: parallaxY3 }}
            className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary-400/10 rounded-full blur-3xl animate-bounce-slow"
          />
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

      {/* 統計數據 - 視覺層次優化 */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-display-sm md:text-display-md font-black mb-4 text-neutral-900">
              台灣最完整的匹克球平台
            </h2>
            <p className="text-body-lg text-neutral-600">持續成長的社群與資源</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={staggerItem}>
                <GlassCard
                  variant="light"
                  size="xl"
                  hoverable
                  magnetic
                  className="text-center py-8"
                >
                  <div className="font-display text-6xl md:text-7xl font-black bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-4">
                    {stat.number}
                  </div>
                  <div className="text-neutral-700 font-bold text-heading-lg">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 核心功能 - Bento Grid 不對稱佈局 */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-neutral-50 relative overflow-hidden">
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
            className="text-center mb-16"
          >
            <h2 className="font-display text-display-md md:text-display-lg font-black mb-4 text-neutral-900">
              台灣匹克球資源中心
            </h2>
            <p className="text-body-lg md:text-body-xl text-neutral-600 max-w-3xl mx-auto">
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
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-elevated-sm">
                    <span className="text-4xl">{features[0].icon}</span>
                  </div>
                  <h3 className="font-display text-heading-xl font-bold mb-4 text-neutral-900">
                    {features[0].title}
                  </h3>
                  <p className="text-body-lg text-neutral-700 leading-relaxed mb-6">
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
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-elevated-sm">
                    <span className="text-4xl">{features[1].icon}</span>
                  </div>
                  <h3 className="font-display text-heading-xl font-bold mb-4 text-neutral-900">
                    {features[1].title}
                  </h3>
                  <p className="text-body-lg text-neutral-700 leading-relaxed mb-6">
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
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-elevated-sm">
                    <span className="text-4xl">{features[3].icon}</span>
                  </div>
                  <h3 className="font-display text-heading-xl font-bold mb-4 text-neutral-900">
                    {features[3].title}
                  </h3>
                  <p className="text-body-lg text-neutral-700 leading-relaxed mb-6">
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

      {/* 學習路徑 - 互動式 Accordion 設計 */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-neutral-50 to-white relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-10 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-display-md md:text-display-lg font-black mb-4 text-neutral-900">
              系統化學習路徑
            </h2>
            <p className="text-body-lg md:text-body-xl text-neutral-600 max-w-3xl mx-auto">
              無論新手或進階玩家，都能找到適合的學習內容與訓練方法
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-5xl mx-auto space-y-6"
          >
            {[
              {
                level: '新手入門',
                icon: '🌱',
                variant: 'primary' as const,
                description: '從零開始，建立紮實基礎',
                features: ['認識球場配置', '基本規則理解', '握拍姿勢矯正', '發球動作練習'],
                details: [
                  { title: '球場認識', content: '了解標準球場尺寸、禁區規則與場地標線意義' },
                  { title: '規則入門', content: '掌握計分方式、發球規則、雙跳規則等基本規範' },
                  { title: '握拍技巧', content: '學習正確握拍方式，避免運動傷害' },
                  { title: '發球練習', content: '從基礎發球動作開始，逐步提升穩定度' },
                ],
              },
              {
                level: '中階進修',
                icon: '⚡',
                variant: 'secondary' as const,
                description: '提升技術，掌握戰術策略',
                features: ['進階技巧訓練', '戰術策略運用', '雙打默契配合', '比賽節奏掌控'],
                details: [
                  { title: '進階技巧', content: '學習截擊、高吊球、切球等進階技術' },
                  { title: '戰術運用', content: '理解攻防轉換、位置移動與戰術選擇' },
                  { title: '雙打配合', content: '培養與隊友的默契，掌握雙打站位' },
                  { title: '節奏掌控', content: '學會控制比賽節奏，適時調整策略' },
                ],
              },
              {
                level: '高手養成',
                icon: '🏆',
                variant: 'accent' as const,
                description: '精進專業，追求卓越表現',
                features: ['專業技術精進', '比賽心理建設', '體能強化訓練', '教練認證課程'],
                details: [
                  { title: '技術精進', content: '深入研究專業技術細節，追求完美表現' },
                  { title: '心理素質', content: '建立強大心理素質，應對比賽壓力' },
                  { title: '體能訓練', content: '針對性體能訓練，提升爆發力與耐力' },
                  { title: '教練認證', content: '學習教學方法，取得專業教練資格' },
                ],
              },
            ].map((path, index) => (
              <motion.div key={index} variants={staggerItem}>
                <GlassCard
                  variant={path.variant}
                  size="lg"
                  hoverable
                  magnetic
                  className="cursor-pointer"
                  onClick={() => setExpandedPath(expandedPath === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      {/* Icon Badge */}
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-elevated-sm flex-shrink-0">
                        <span className="text-4xl md:text-5xl">{path.icon}</span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-display text-heading-xl md:text-display-sm font-black mb-2 text-neutral-900">
                          {path.level}
                        </h3>
                        <p className="text-body-md md:text-body-lg text-neutral-700 font-medium">{path.description}</p>
                      </div>
                    </div>

                    {/* 展開圖示 */}
                    <motion.div
                      animate={{ rotate: expandedPath === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 ml-4"
                    >
                      <svg className="w-6 h-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Accordion 內容 */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedPath === index ? 'auto' : 0,
                      opacity: expandedPath === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 mt-6 border-t border-neutral-300/50">
                      {/* 快速功能列表 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                        {path.features.map((feature, i) => (
                          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/80 hover:scale-105 transition-transform">
                            <div className="text-neutral-900 text-body-sm font-semibold">{feature}</div>
                          </div>
                        ))}
                      </div>

                      {/* 詳細內容 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {path.details.map((detail, i) => (
                          <div key={i} className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center mr-3 flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-bold text-neutral-900 mb-1 text-body-md">{detail.title}</h4>
                                <p className="text-neutral-700 text-body-sm">{detail.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA 按鈕 */}
                      <Link
                        to={ROUTES.LEARNING_PATHS}
                        className="block text-center bg-neutral-900 text-white py-4 px-8 rounded-xl font-bold hover:shadow-elevated-lg transition-all duration-300 group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="flex items-center justify-center">
                          開始 {path.level}
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </motion.div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA 區塊 - 資源導向 */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-pickleball-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-sport-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              立即探索台灣匹克球資源
            </h2>
            <p className="text-lg md:text-xl mb-12 text-gray-300 leading-relaxed">
              全台 55+ 球場地圖、完整規則教學、裝備選購指南、互動學習工具<br />
              一個平台滿足你所有匹克球需求
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={ROUTES.COURTS}
                  className="block bg-white text-gray-900 px-6 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="text-3xl mb-2">📍</div>
                  <div>找球場</div>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={ROUTES.RULES}
                  className="block bg-pickleball-500 text-white px-6 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="text-3xl mb-2">🎯</div>
                  <div>學規則</div>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={ROUTES.EQUIPMENT}
                  className="block bg-sport-500 text-white px-6 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="text-3xl mb-2">🎾</div>
                  <div>看裝備</div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
