import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import CourtSkeleton from '../components/hero/CourtSkeleton';

// Lazy load
const HeroCourtPreview = lazy(() => import('../components/hero/HeroCourtPreview'));

const Home = () => {
  usePageTitle();

  return (
    <div className="min-h-screen">
      <SEOHead page="home" />

      {/* ═══════════════════════════════════════════════════════════════
          HERO - 球場風格
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700">
        {/* 球場線條背景 */}
        <div className="absolute inset-0">
          {/* 球場線條圖案 */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
            {/* 球場外框 */}
            <rect x="100" y="50" width="800" height="500" fill="none" stroke="white" strokeWidth="4" />
            {/* 中線 */}
            <line x1="500" y1="50" x2="500" y2="550" stroke="white" strokeWidth="4" />
            {/* 廚房區 */}
            <rect x="100" y="50" width="127" height="500" fill="white" fillOpacity="0.1" />
            <rect x="773" y="50" width="127" height="500" fill="white" fillOpacity="0.1" />
            <line x1="227" y1="50" x2="227" y2="550" stroke="white" strokeWidth="3" />
            <line x1="773" y1="50" x2="773" y2="550" stroke="white" strokeWidth="3" />
            {/* 發球區中線 */}
            <line x1="227" y1="300" x2="500" y2="300" stroke="white" strokeWidth="2" />
            <line x1="500" y1="300" x2="773" y2="300" stroke="white" strokeWidth="2" />
          </svg>

          {/* 浮動匹克球 */}
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[15%] w-24 h-24 md:w-32 md:h-32 opacity-20"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="white" />
              {/* 匹克球的洞 */}
              {[...Array(8)].map((_, i) => (
                <circle key={i} cx={50 + 25 * Math.cos(i * Math.PI / 4)} cy={50 + 25 * Math.sin(i * Math.PI / 4)} r="5" fill="#059669" />
              ))}
              <circle cx="50" cy="50" r="6" fill="#059669" />
            </svg>
          </motion.div>

          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[25%] left-[10%] w-16 h-16 md:w-24 md:h-24 opacity-15"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="white" />
              {[...Array(8)].map((_, i) => (
                <circle key={i} cx={50 + 25 * Math.cos(i * Math.PI / 4)} cy={50 + 25 * Math.sin(i * Math.PI / 4)} r="5" fill="#059669" />
              ))}
              <circle cx="50" cy="50" r="6" fill="#059669" />
            </svg>
          </motion.div>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[80vh]">
            {/* 左側文字 */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <span className="w-8 h-1 bg-yellow-400" />
                <span className="text-yellow-300 text-sm font-bold tracking-wider">TAIWAN PICKLEBALL</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white text-5xl md:text-7xl font-black leading-[0.95] mb-8"
              >
                從零開始
                <br />
                <span className="relative">
                  愛上匹克球
                  <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,6 Q50,12 100,6 T200,6" fill="none" stroke="#facc15" strokeWidth="3" />
                  </svg>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-emerald-100 text-lg md:text-xl leading-relaxed mb-10 max-w-md"
              >
                規則 • 球場 • 技巧 • 裝備
                <br />
                <span className="text-yellow-300 font-semibold">30 分鐘</span>讓你準備好踏上球場
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to={ROUTES.RULES}
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-yellow-400 text-emerald-900 font-bold hover:bg-yellow-300 transition-colors"
                >
                  開始學習規則
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to={ROUTES.COURTS}
                  className="inline-flex items-center gap-3 px-6 py-3 border-2 border-white/50 text-white font-bold hover:bg-white/10 transition-colors"
                >
                  找附近球場
                </Link>
              </motion.div>
            </div>

            {/* 右側 3D 球場 */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative"
              >
                {/* 球場預覽容器 - 帶有網子裝飾 */}
                <div className="relative">
                  <Suspense fallback={<CourtSkeleton />}>
                    <HeroCourtPreview />
                  </Suspense>

                  {/* 廚房區標示 */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute -right-4 top-1/3 hidden lg:block"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-yellow-400" />
                      <span className="text-yellow-300 text-sm font-bold whitespace-nowrap">廚房區 Kitchen</span>
                    </div>
                  </motion.div>
                </div>

                <p className="text-emerald-200/60 text-xs text-center mt-4 tracking-wider">
                  ↻ 拖曳旋轉 360° 檢視
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 底部統計 - 球場風格分割線 */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1 bg-white/20" />
          <div className="bg-emerald-800/50 backdrop-blur-sm">
            <div className="container mx-auto px-6 md:px-12">
              <div className="grid grid-cols-3 divide-x divide-emerald-600/50">
                {[
                  { value: '55+', label: '全台球場', icon: '📍' },
                  { value: '14萬', label: '參與人數', icon: '👥' },
                  { value: '3D', label: '互動教學', icon: '🎮' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="py-6 md:py-8 text-center"
                  >
                    <div className="text-2xl md:text-3xl font-black text-white mb-1">
                      {stat.icon} {stat.value}
                    </div>
                    <div className="text-xs text-emerald-200/70 uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          三大功能 - 配色豐富
      ═══════════════════════════════════════════════════════════════ */}
      <section>
        {/* 規則 - 藍色系 */}
        <Link to={ROUTES.RULES} className="group block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors duration-500" />

          {/* 球場線條裝飾 */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg viewBox="0 0 200 300" className="h-full w-full" preserveAspectRatio="xMaxYMid slice">
              <rect x="10" y="10" width="180" height="280" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600" />
              <line x1="100" y1="10" x2="100" y2="290" stroke="currentColor" strokeWidth="2" className="text-blue-600" />
              <rect x="10" y="10" width="35" height="280" fill="currentColor" fillOpacity="0.3" className="text-blue-600" />
            </svg>
          </div>

          <div className="container mx-auto px-6 md:px-12 py-16 md:py-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-blue-500 group-hover:text-blue-200 text-sm font-bold tracking-wider mb-2 block transition-colors">01 — 規則</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 group-hover:text-white transition-colors">
                  互動式規則教學
                </h2>
              </div>
              <div className="md:text-right max-w-md">
                <p className="text-neutral-500 group-hover:text-blue-100 text-lg mb-4 transition-colors">
                  雙彈跳、廚房區、發球計分——3D 球場讓規則變得直觀好懂
                </p>
                <span className="inline-flex items-center gap-2 text-blue-600 group-hover:text-yellow-300 font-bold transition-colors">
                  開始學習
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* 球場 - 綠色系 */}
        <Link to={ROUTES.COURTS} className="group block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600" />

          {/* 地圖裝飾 */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[...Array(10)].map((_, i) => (
                <circle key={i} cx={Math.random() * 100} cy={Math.random() * 100} r="1" fill="white" />
              ))}
              <path d="M20,30 Q35,20 50,35 T80,25" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M10,60 Q30,50 50,65 T90,55" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="container mx-auto px-6 md:px-12 py-16 md:py-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-emerald-200 text-sm font-bold tracking-wider mb-2 block">02 — 球場</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">
                  全台 55+ 球場地圖
                </h2>
              </div>
              <div className="md:text-right max-w-md">
                <p className="text-emerald-100 text-lg mb-4">
                  北中南東全覆蓋，篩選免費場地、室內室外
                </p>
                <span className="inline-flex items-center gap-2 text-yellow-300 font-bold">
                  開啟地圖
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* 技巧 - 橘色系 */}
        <Link to={ROUTES.TECHNIQUES} className="group block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-neutral-50 group-hover:bg-transparent transition-colors duration-500" />

          {/* 動態球拍裝飾 */}
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute right-[10%] top-1/2 -translate-y-1/2 text-8xl opacity-10 group-hover:opacity-20 transition-opacity"
          >
            🏓
          </motion.div>

          <div className="container mx-auto px-6 md:px-12 py-16 md:py-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-orange-500 group-hover:text-orange-200 text-sm font-bold tracking-wider mb-2 block transition-colors">03 — 技巧</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 group-hover:text-white transition-colors">
                  影片技巧教學
                </h2>
              </div>
              <div className="md:text-right max-w-md">
                <p className="text-neutral-500 group-hover:text-orange-100 text-lg mb-4 transition-colors">
                  發球、Dink、截擊、第三拍落地球——專業影片示範
                </p>
                <span className="inline-flex items-center gap-2 text-orange-500 group-hover:text-yellow-300 font-bold transition-colors">
                  觀看影片
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
          為什麼匹克球 - 活潑配色
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* 漸層背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-emerald-50" />

        {/* 裝飾性匹克球 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-64 h-64 opacity-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-600">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
            {[...Array(8)].map((_, i) => (
              <circle key={i} cx={50 + 30 * Math.cos(i * Math.PI / 4)} cy={50 + 30 * Math.sin(i * Math.PI / 4)} r="8" fill="currentColor" />
            ))}
          </svg>
        </motion.div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm mb-4">
              <span className="w-6 h-0.5 bg-emerald-600" />
              WHY PICKLEBALL
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 max-w-4xl">
              全世界都在瘋的
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">新興運動</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { num: '01', title: '30 分鐘上手', desc: '規則簡單，第一次就能享受對打樂趣', color: 'emerald' },
              { num: '02', title: '全年齡適合', desc: '6 到 90 歲都能玩，運動強度自己控制', color: 'blue' },
              { num: '03', title: '社交性極強', desc: '雙打為主，是認識新朋友的最佳場合', color: 'purple' },
              { num: '04', title: '場地好找', desc: '球場只需網球場的四分之一', color: 'orange' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <span className={`text-6xl font-black block mb-4 transition-colors ${item.color === 'emerald' ? 'text-emerald-200 group-hover:text-emerald-400' :
                    item.color === 'blue' ? 'text-blue-200 group-hover:text-blue-400' :
                      item.color === 'purple' ? 'text-purple-200 group-hover:text-purple-400' :
                        'text-orange-200 group-hover:text-orange-400'
                  }`}>
                  {item.num}
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          更多資源 - 色彩繽紛
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
              更多資源
            </h2>
            <Link to={ROUTES.LEARNING} className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors hidden md:inline-flex items-center gap-2">
              查看全部
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="flex gap-4 md:gap-6 px-6 md:px-12 overflow-x-auto pb-6 scrollbar-hide">
          {[
            { title: '裝備指南', desc: '球拍選購攻略', link: ROUTES.EQUIPMENT, gradient: 'from-amber-400 to-orange-500', icon: '🏓' },
            { title: '知識測驗', desc: '檢驗學習成果', link: ROUTES.QUIZ, gradient: 'from-violet-500 to-purple-600', icon: '✏️' },
            { title: '學習中心', desc: '完整資源入口', link: ROUTES.LEARNING, gradient: 'from-blue-500 to-indigo-600', icon: '📚' },
            { title: '計分器', desc: '比賽計分工具', link: ROUTES.SCORER, gradient: 'from-rose-500 to-pink-600', icon: '📊' },
            { title: '常見問題', desc: '新手疑問解答', link: ROUTES.FAQ, gradient: 'from-emerald-500 to-teal-600', icon: '❓' },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className="group flex-shrink-0 w-56 md:w-64"
            >
              <div className={`h-32 md:h-40 bg-gradient-to-br ${item.gradient} flex items-center justify-center text-5xl md:text-6xl relative overflow-hidden`}>
                <span className="relative z-10">{item.icon}</span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="pt-4">
                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-neutral-500 text-sm">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          最終 CTA - 球場風格
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 overflow-hidden">
        {/* 球場線條背景 */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
            <rect x="20" y="20" width="360" height="160" fill="none" stroke="white" strokeWidth="2" />
            <line x1="200" y1="20" x2="200" y2="180" stroke="white" strokeWidth="2" />
            <rect x="20" y="20" width="50" height="160" fill="white" fillOpacity="0.2" />
            <rect x="330" y="20" width="50" height="160" fill="white" fillOpacity="0.2" />
          </svg>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              準備上場了嗎？
            </h2>

            <p className="text-emerald-100 text-xl mb-10 max-w-lg mx-auto">
              選擇你的起點，加入台灣 14 萬匹克球玩家
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={ROUTES.RULES}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-400 text-emerald-900 font-bold text-lg hover:bg-yellow-300 transition-colors"
              >
                🌱 我是新手
              </Link>
              <Link
                to={ROUTES.COURTS}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold text-lg border border-white/30 hover:bg-white/20 transition-colors"
              >
                📍 我會打了，找球場
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
