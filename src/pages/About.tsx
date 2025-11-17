import { motion } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const About = () => {
  usePageTitle('關於我們');

  // 漂浮的匹克球動畫
  const FloatingBall = ({ delay = 0, duration = 3 }) => (
    <motion.div
      className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-20"
      style={{
        boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.2)',
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        rotate: [0, 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {/* 球上的孔洞效果 */}
      <div className="absolute inset-0 grid grid-cols-3 gap-1 p-2">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-yellow-600 rounded-full opacity-30" />
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-sport-50 to-court-50 overflow-hidden">
      {/* 背景裝飾球 */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingBall delay={0} duration={4} />
        <div className="absolute top-20 right-10">
          <FloatingBall delay={1} duration={5} />
        </div>
        <div className="absolute bottom-20 left-20">
          <FloatingBall delay={2} duration={6} />
        </div>
        <div className="absolute top-1/2 right-1/4">
          <FloatingBall delay={1.5} duration={4.5} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section - 大 Logo 與標題 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            className="mb-8"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img
              src="/logo.png"
              alt="Picklemaster Taiwan"
              className="w-48 h-48 md:w-64 md:h-64 mx-auto drop-shadow-2xl"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pickleball-600 via-sport-600 to-court-600"
          >
            匹克大師台灣
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl text-gray-700 font-bold mb-4"
          >
            Picklemaster Taiwan
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
          >
            台灣最完整的匹克球學習與社群平台
          </motion.p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* 我們的使命 */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden">
              {/* 裝飾性網格 */}
              <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <motion.h2
                className="text-4xl md:text-5xl font-black text-gray-800 mb-6 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                🎯 我們的使命
              </motion.h2>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 text-lg md:text-xl leading-relaxed text-center mb-8">
                  <strong className="text-sport-600">Picklemaster Taiwan</strong> 致力於在台灣推廣匹克球運動，
                  打造一個完整的學習與社群生態系統。我們相信，這項老少咸宜、充滿樂趣的運動，
                  能夠為台灣帶來更健康、更有活力的運動文化。
                </p>

                {/* 特色功能展示 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {[
                    {
                      icon: '🗺️',
                      title: '全台球場地圖',
                      description: '超過55個球場資訊，精準定位離你最近的匹克球場',
                      color: 'from-sport-500 to-sport-600'
                    },
                    {
                      icon: '📚',
                      title: '互動式規則教學',
                      description: '3D視覺化教學，輕鬆掌握雙彈跳、廚房區等核心規則',
                      color: 'from-court-500 to-court-600'
                    },
                    {
                      icon: '🎮',
                      title: '匹克球遊戲',
                      description: '真實模擬匹克球比賽，在遊戲中學習實戰技巧',
                      color: 'from-pickleball-500 to-pickleball-600'
                    },
                    {
                      icon: '🏸',
                      title: '裝備選購指南',
                      description: '專業球拍推薦、職業選手裝備分析，幫你找到最適合的裝備',
                      color: 'from-yellow-500 to-orange-500'
                    },
                    {
                      icon: '📈',
                      title: '完整學習路徑',
                      description: '從新手到進階，系統化的學習課程與技術指導',
                      color: 'from-blue-500 to-indigo-600'
                    },
                    {
                      icon: '🎯',
                      title: '豐富學習資源',
                      description: '影片教學、社群連結、賽事資訊，應有盡有',
                      color: 'from-purple-500 to-pink-600'
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-sport-300 transition-all duration-300"
                    >
                      <div className="text-5xl mb-4">{feature.icon}</div>
                      <h3 className={`text-xl font-black mb-3 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* 核心理念與精神 */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-sport-100 via-court-100 to-pickleball-100 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden">
              {/* 裝飾性球拍 */}
              <motion.div
                className="absolute -right-10 -top-10 w-48 h-48 opacity-10"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                <div className="w-32 h-48 bg-gradient-to-b from-sport-600 to-sport-800 rounded-full" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-8 text-center">
                💫 核心理念
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: '易學易懂',
                    subtitle: 'Easy to Learn',
                    description: '用最直觀的方式呈現複雜的規則，讓每個人都能快速上手',
                    icon: '🎓',
                    gradient: 'from-sport-500 to-sport-600'
                  },
                  {
                    title: '互動體驗',
                    subtitle: 'Interactive Experience',
                    description: '3D視覺化、互動遊戲，讓學習變得有趣而深刻',
                    icon: '✨',
                    gradient: 'from-court-500 to-court-600'
                  },
                  {
                    title: '社群連結',
                    subtitle: 'Community Connection',
                    description: '串連全台球友，建立充滿活力的匹克球社群',
                    icon: '🤝',
                    gradient: 'from-pickleball-500 to-pickleball-600'
                  }
                ].map((principle, index) => (
                  <motion.div
                    key={principle.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-2xl p-8 shadow-xl"
                  >
                    <div className="text-6xl mb-4 text-center">{principle.icon}</div>
                    <h3 className={`text-2xl font-black mb-2 text-center bg-gradient-to-r ${principle.gradient} bg-clip-text text-transparent`}>
                      {principle.title}
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-4 font-semibold">
                      {principle.subtitle}
                    </p>
                    <p className="text-gray-700 text-center leading-relaxed">
                      {principle.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* 精神標語 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 text-center"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl max-w-3xl mx-auto">
                  <motion.p
                    className="text-3xl md:text-4xl font-black text-gray-800 mb-4"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #FF6B6B)',
                      backgroundSize: '200% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    "讓每個人都能享受匹克球的樂趣"
                  </motion.p>
                  <p className="text-gray-600 text-lg italic">
                    Making Pickleball Accessible to Everyone in Taiwan
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* 推廣台灣匹克球運動 */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
              {/* 台灣圖案裝飾 */}
              <div className="absolute -bottom-10 -left-10 text-9xl opacity-5">🇹🇼</div>

              <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-8 text-center">
                🏓 推廣台灣匹克球運動
              </h2>

              <div className="max-w-4xl mx-auto">
                <p className="text-gray-700 text-lg md:text-xl leading-relaxed text-center mb-8">
                  匹克球在全球快速成長，在美國已有超過 <strong className="text-sport-600">890萬</strong> 名玩家。
                  在台灣，這項運動也正在蓬勃發展！從都會公園到運動中心，越來越多人愛上這項運動。
                </p>

                {/* 統計數據 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {[
                    { number: '55+', label: '台灣球場數', icon: '🏟️' },
                    { number: '158%', label: '三年成長率', icon: '📈' },
                    { number: '70+', label: '普及國家數', icon: '🌏' },
                    { number: '2025', label: '持續成長中', icon: '🚀' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-sport-100 to-court-100 rounded-2xl p-6 text-center shadow-lg"
                    >
                      <div className="text-4xl mb-2">{stat.icon}</div>
                      <div className="text-3xl md:text-4xl font-black text-sport-700 mb-2">
                        {stat.number}
                      </div>
                      <div className="text-sm text-gray-700 font-semibold">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-sport-50 via-court-50 to-pickleball-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-black text-gray-800 mb-4 text-center">
                    我們的願景
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    <strong className="text-sport-600">Picklemaster Taiwan</strong> 不只是一個資訊平台，
                    更是推動台灣匹克球運動發展的重要推手。我們希望透過：
                  </p>
                  <ul className="space-y-4">
                    {[
                      '降低入門門檻，讓更多人認識並嘗試這項運動',
                      '提供完整資源，幫助球友持續進步',
                      '建立社群網絡，促進球友交流與球場建設',
                      '推廣運動文化，讓匹克球成為台灣主流運動之一'
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start text-gray-700"
                      >
                        <span className="text-sport-500 font-bold mr-3 text-xl">✓</span>
                        <span className="text-lg">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-sport-500 via-court-500 to-pickleball-500 rounded-3xl shadow-2xl p-12">
              <motion.h2
                className="text-4xl md:text-5xl font-black text-white mb-6"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                立即開始你的匹克球之旅！
              </motion.h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                從規則學習到實戰練習，從找球場到交球友，一切都在 Picklemaster Taiwan
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={ROUTES.COURTS}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-sport-600 rounded-full font-black text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    🗺️ 尋找附近球場
                  </motion.button>
                </Link>
                <Link to={ROUTES.LEARNING_PATHS}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-full font-black text-lg hover:bg-white/30 transition-all duration-300"
                  >
                    📚 開始學習
                  </motion.button>
                </Link>
                <Link to={ROUTES.GAME}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-full font-black text-lg hover:bg-white/30 transition-all duration-300"
                  >
                    🎮 玩互動遊戲
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.section>

          {/* 開發者資訊 */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <h3 className="text-2xl font-black text-gray-800 mb-6 text-center">
                關於開發團隊
              </h3>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-gray-700 leading-relaxed mb-6">
                  本平台由 <strong className="text-sport-600">Max Wu (@wutiger555)</strong> 開發與維護，
                  結合技術專業與對匹克球運動的熱情，致力於為台灣匹克球社群打造最佳的數位平台。
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://github.com/wutiger555/picklemaster-tw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://github.com/wutiger555"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-sport-500 text-white rounded-lg hover:bg-sport-600 transition-all font-semibold"
                  >
                    開發者主頁
                  </a>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default About;
