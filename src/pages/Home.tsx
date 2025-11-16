import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { ROUTES, BRAND } from '../utils/constants';

const HeroCourtPreview = lazy(() => import('../components/hero/HeroCourtPreview'));

const Home = () => {
  const features = [
    {
      icon: '🎾',
      title: '互動式球場',
      description: '點擊球場區域即時學習規則，看動畫了解球路徑',
      color: 'from-pickleball-400 to-pickleball-600',
      emoji: '✨',
    },
    {
      icon: '🎮',
      title: '3D 球場配置',
      description: '360 度檢視球場結構，學習站位與規則',
      color: 'from-sport-400 to-sport-600',
      emoji: '🚀',
    },
    {
      icon: '🗺️',
      title: '全台球場地圖',
      description: '快速找到附近球場，約球友一起打球',
      color: 'from-court-400 to-court-600',
      emoji: '⚡',
    },
  ];

  const stats = [
    { number: '50+', label: '球場資訊', icon: '📍' },
    { number: '100+', label: '技巧教學', icon: '📚' },
    { number: '1000+', label: '活躍玩家', icon: '👥' },
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
                  <div className="text-6xl animate-pulse">🏓</div>
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
                        className="bg-white text-pickleball-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/50 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <span>開始學習</span>
                        <span className="text-2xl">🚀</span>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={ROUTES.COURTS}
                        className="backdrop-blur-sm bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/50 hover:bg-white/30 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <span>找球場</span>
                        <span className="text-2xl">📍</span>
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

      {/* 統計數據 */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-black text-pickleball-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 - 更有活力的卡片設計 */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-center mb-16 text-gray-800"
          >
            為什麼選擇我們？
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative"
              >
                <div className={`bg-gradient-to-br ${feature.color} p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 text-white h-full`}>
                  <div className="absolute -top-6 -right-6 text-6xl opacity-20">
                    {feature.emoji}
                  </div>
                  <div className="text-6xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 學習路徑 - 更有互動感的設計 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-center mb-4 text-gray-800"
          >
            開始你的匹克球之旅
          </motion.h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            不管你是完全新手還是想精進技巧，我們都有適合你的學習路徑
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                level: '新手入門',
                icon: '🌱',
                color: 'court',
                description: '從零開始，學習基本規則、握拍方式、發球技巧',
                features: ['認識球場', '基本規則', '握拍姿勢', '發球練習'],
              },
              {
                level: '中階進修',
                icon: '⚡',
                color: 'sport',
                description: '進階技巧、戰術策略、雙打配合',
                features: ['進階技巧', '戰術運用', '雙打配合', '比賽策略'],
              },
              {
                level: '高手養成',
                icon: '🏆',
                color: 'pickleball',
                description: '專業技術、比賽心理、高階訓練',
                features: ['專業技術', '心理訓練', '體能強化', '教練培訓'],
              },
            ].map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full border-2 border-transparent hover:border-${path.color}-400">
                  <div className="text-6xl mb-4 group-hover:animate-bounce-slow">
                    {path.icon}
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 text-${path.color}-600`}>
                    {path.level}
                  </h3>
                  <p className="text-gray-600 mb-6">{path.description}</p>

                  <ul className="space-y-2 mb-6">
                    {path.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <span className={`text-${path.color}-500 mr-2`}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={ROUTES.LEARNING_PATHS}
                    className={`block text-center bg-gradient-to-r from-${path.color}-400 to-${path.color}-600 text-white py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300`}
                  >
                    開始學習 →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 區塊 */}
      <section className="py-20 bg-gradient-to-r from-pickleball-500 via-sport-500 to-court-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              準備好開始打球了嗎？
            </h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              加入台灣匹克球社群，找球友、找球場、學技巧，一起享受這項有趣的運動！
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to={ROUTES.COURTS}
                className="inline-block bg-white text-pickleball-600 px-10 py-5 rounded-full font-black text-xl shadow-2xl hover:shadow-white/50 transition-all duration-300"
              >
                立即尋找球場 🏓
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
