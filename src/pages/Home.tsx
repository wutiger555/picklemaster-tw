import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { ROUTES, BRAND } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { staggerContainer, staggerItem } from '../utils/animations';
import GlassCard from '../components/common/GlassCard';

const HeroCourtPreview = lazy(() => import('../components/hero/HeroCourtPreview'));

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

  const stats = [
    { number: '50+', label: '球場資訊' },
    { number: '100+', label: '技巧教學' },
    { number: '1000+', label: '活躍玩家' },
  ];

  return (
    <div className="min-h-screen">
      {/* 英雄區塊 - 3D + Glassmorphism + 視差滾動設計 */}
      <section className="relative bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 text-white py-20 md:py-32 overflow-hidden">
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

      {/* 統計數據 - Glassmorphism 設計 */}
      <section className="py-16 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={staggerItem}>
                <GlassCard
                  variant="light"
                  size="lg"
                  hoverable
                  magnetic
                  className="text-center"
                >
                  <div className="font-display text-display-lg font-black bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-3">
                    {stat.number}
                  </div>
                  <div className="text-neutral-700 font-bold text-heading-md">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 核心功能 - Glassmorphism 卡片設計 */}
      <section className="py-20 bg-gradient-to-b from-white to-neutral-50 relative overflow-hidden">
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

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Link to={feature.link} className="block h-full">
                  <GlassCard
                    variant={index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'accent' : 'light'}
                    size="md"
                    hoverable
                    magnetic
                    clickable
                    className="h-full relative"
                  >
                    {feature.highlight && (
                      <div className="absolute top-4 right-4 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-neon-accent animate-pulse">
                        NEW
                      </div>
                    )}

                    {/* Icon */}
                    <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center mb-5 shadow-elevated-sm">
                      <span className="text-3xl">{feature.icon}</span>
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-heading-lg font-bold mb-3 text-neutral-900">
                      {feature.title}
                    </h3>
                    <p className="text-body-md text-neutral-700 leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center text-neutral-900 font-semibold text-body-sm group-hover:translate-x-1 transition-transform duration-300">
                      <span>了解更多</span>
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 學習路徑 - Glassmorphism 分級系統 */}
      <section className="py-20 bg-gradient-to-b from-neutral-50 to-white relative overflow-hidden">
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
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                level: '新手入門',
                icon: '🌱',
                variant: 'primary' as const,
                description: '從零開始，建立紮實基礎',
                features: ['認識球場配置', '基本規則理解', '握拍姿勢矯正', '發球動作練習'],
              },
              {
                level: '中階進修',
                icon: '⚡',
                variant: 'secondary' as const,
                description: '提升技術，掌握戰術策略',
                features: ['進階技巧訓練', '戰術策略運用', '雙打默契配合', '比賽節奏掌控'],
              },
              {
                level: '高手養成',
                icon: '🏆',
                variant: 'accent' as const,
                description: '精進專業，追求卓越表現',
                features: ['專業技術精進', '比賽心理建設', '體能強化訓練', '教練認證課程'],
              },
            ].map((path, index) => (
              <motion.div key={index} variants={staggerItem}>
                <GlassCard
                  variant={path.variant}
                  size="lg"
                  hoverable
                  magnetic
                  className="h-full"
                >
                  {/* Icon Badge */}
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 shadow-elevated-sm">
                    <span className="text-4xl">{path.icon}</span>
                  </div>

                  <h3 className="font-display text-heading-xl font-black mb-3 text-neutral-900">
                    {path.level}
                  </h3>
                  <p className="text-body-md text-neutral-700 font-medium mb-6">{path.description}</p>

                  <ul className="space-y-3 mb-8">
                    {path.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-body-md text-neutral-700">
                        <svg className="w-5 h-5 text-neutral-900 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={ROUTES.LEARNING_PATHS}
                    className="block text-center bg-neutral-900 text-white py-3 px-6 rounded-xl font-bold hover:shadow-elevated-lg transition-all duration-300"
                  >
                    <span className="flex items-center justify-center">
                      開始學習
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA 區塊 - 資源導向 */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
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
