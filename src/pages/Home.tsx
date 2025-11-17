import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { ROUTES, BRAND } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';

const HeroCourtPreview = lazy(() => import('../components/hero/HeroCourtPreview'));

const Home = () => {
  usePageTitle();
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
      {/* 英雄區塊 - 3D + Glassmorphism 設計 */}
      <section className="relative bg-gradient-to-br from-pickleball-500 via-sport-500 to-court-500 text-white py-20 md:py-32 overflow-hidden">
        {/* 背景動畫圓圈 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pickleball-300/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-sport-400/10 rounded-full blur-3xl animate-bounce-slow"></div>
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

            {/* 右側：Glassmorphism 文字卡片 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="backdrop-blur-md bg-white/10 rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-pickleball-100 to-white">
                      {BRAND.NAME_ZH}
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl mb-4 font-bold text-white/90">
                    {BRAND.TAGLINE}
                  </p>

                  <p className="text-base md:text-lg mb-8 text-white/80">
                    {BRAND.DESCRIPTION}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={ROUTES.RULES}
                        className="bg-white text-pickleball-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/50 transition-all duration-300 flex items-center justify-center"
                      >
                        <span>開始學習</span>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={ROUTES.COURTS}
                        className="backdrop-blur-sm bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/50 hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                      >
                        <span>找球場</span>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
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

      {/* 統計數據 - 專業視覺化 */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                  <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pickleball-500 to-sport-500 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-700 font-bold text-lg">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 - 專業資源平台設計 */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-800">
              台灣匹克球資源中心
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              從規則學習、球場查詢到裝備指南，一站式平台滿足初學者到進階玩家的所有需求
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative"
              >
                <Link to={feature.link} className="block h-full group">
                  <div className={`${feature.color} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full relative border border-gray-200`}>
                    {feature.highlight && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        NEW
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`${feature.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-3xl">{feature.icon}</span>
                    </div>

                    {/* Content */}
                    <h3 className={`text-xl font-bold mb-3 ${feature.textColor}`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Arrow */}
                    <div className={`flex items-center ${feature.textColor} font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300`}>
                      <span>了解更多</span>
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 學習路徑 - 專業分級系統 */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-800">
              系統化學習路徑
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              無論新手或進階玩家，都能找到適合的學習內容與訓練方法
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                level: '新手入門',
                icon: '🌱',
                bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
                iconBg: 'bg-emerald-500',
                textColor: 'text-emerald-600',
                borderColor: 'hover:border-emerald-400',
                description: '從零開始，建立紮實基礎',
                features: ['認識球場配置', '基本規則理解', '握拍姿勢矯正', '發球動作練習'],
              },
              {
                level: '中階進修',
                icon: '⚡',
                bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
                iconBg: 'bg-blue-500',
                textColor: 'text-blue-600',
                borderColor: 'hover:border-blue-400',
                description: '提升技術，掌握戰術策略',
                features: ['進階技巧訓練', '戰術策略運用', '雙打默契配合', '比賽節奏掌控'],
              },
              {
                level: '高手養成',
                icon: '🏆',
                bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
                iconBg: 'bg-amber-500',
                textColor: 'text-amber-600',
                borderColor: 'hover:border-amber-400',
                description: '精進專業，追求卓越表現',
                features: ['專業技術精進', '比賽心理建設', '體能強化訓練', '教練認證課程'],
              },
            ].map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className={`${path.bgColor} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full border-2 border-gray-200 ${path.borderColor}`}>
                  {/* Icon Badge */}
                  <div className={`${path.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-4xl">{path.icon}</span>
                  </div>

                  <h3 className={`text-2xl font-bold mb-3 ${path.textColor}`}>
                    {path.level}
                  </h3>
                  <p className="text-gray-700 font-medium mb-6">{path.description}</p>

                  <ul className="space-y-3 mb-8">
                    {path.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-gray-700">
                        <svg className={`w-5 h-5 ${path.textColor} mr-2 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={ROUTES.LEARNING_PATHS}
                    className={`block text-center ${path.iconBg} text-white py-3 px-6 rounded-xl font-bold hover:shadow-lg transition-all duration-300 group-hover:translate-x-1`}
                  >
                    <span className="flex items-center justify-center">
                      開始學習
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
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
