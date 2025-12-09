import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PaddleGuide from '../components/equipment/PaddleGuide';
import ProPlayerPaddles from '../components/equipment/ProPlayerPaddles';
import PaddleRecommender from '../components/equipment/PaddleRecommender';
import PaddleComparison from '../components/equipment/PaddleComparison';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';

// 球拍類型資訊
const PADDLE_CATEGORIES = [
  {
    id: 'beginner',
    title: '入門級球拍',
    subtitle: 'NT$ 2,000 - 4,000',
    icon: '🌱',
    color: 'emerald',
    features: ['容錯性高', '重量適中', '適合新手學習'],
    recommended: '初學者、休閒玩家'
  },
  {
    id: 'intermediate',
    title: '中階級球拍',
    subtitle: 'NT$ 4,000 - 8,000',
    icon: '⚡',
    color: 'blue',
    features: ['控球精準', '平衡設計', '多元打法適用'],
    recommended: '有經驗玩家、進階學習'
  },
  {
    id: 'advanced',
    title: '高階級球拍',
    subtitle: 'NT$ 8,000+',
    icon: '🏆',
    color: 'purple',
    features: ['碳纖維材質', '極致性能', '專業競技'],
    recommended: '競技選手、追求極致'
  }
];

// 快速選購指南
const QUICK_GUIDE = [
  {
    question: '我完全沒打過匹克球',
    answer: '建議選擇重量 7.3-8.0 oz 的複合材質球拍，甜區大容錯性高，價格 NT$ 2,500-4,000',
    icon: '🆕',
    link: '#recommender'
  },
  {
    question: '我有網球/羽球經驗',
    answer: '可以選擇中階球拍，根據原有打法習慣選擇重量和平衡點',
    icon: '🎾',
    link: '#recommender'
  },
  {
    question: '想追求最佳性能',
    answer: '碳纖維材質球拍提供最佳控制和力量，但需要更好的技術配合',
    icon: '💪',
    link: '#comparison'
  }
];

const Equipment = () => {
  usePageTitle('匹克球裝備指南');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SEOHead page="equipment" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-400/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          {/* 麵包屑導航 */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link to={ROUTES.HOME} className="hover:text-white transition-colors">首頁</Link>
            <span>›</span>
            <span className="text-white">裝備指南</span>
          </nav>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-4"
            >
              <span>🏓</span>
              2024 最新選購指南
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-4"
            >
              匹克球拍
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-100">選購指南</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
            >
              不知道如何選擇匹克球拍？從材質、重量、握把到預算，
              專業分析幫你找到最適合的球拍，讓你的匹克球技術更上一層樓！
            </motion.p>

            {/* 快速導航按鈕 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={() => scrollToSection('recommender')}
                className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-orange-50 transition-all"
              >
                🎯 智能推薦工具
              </button>
              <button
                onClick={() => scrollToSection('comparison')}
                className="px-6 py-3 bg-white/15 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/25 transition-all"
              >
                ⚖️ 球拍對比
              </button>
              <button
                onClick={() => scrollToSection('guide')}
                className="px-6 py-3 bg-white/15 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/25 transition-all"
              >
                📖 完整教學
              </button>
            </motion.div>
          </div>
        </div>

        {/* 波浪裝飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto">
            <path fill="#fafafa" d="M0,40L60,44C120,48,240,56,360,52C480,48,600,32,720,28C840,24,960,32,1080,36C1200,40,1320,40,1380,40L1440,40L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z" />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 快速選購指南 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
            快速選購指南
          </h2>
          <p className="text-neutral-500 text-center mb-8">
            告訴我們你的情況，我們給你最適合的建議
          </p>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {QUICK_GUIDE.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToSection('recommender')}
                className="group text-left bg-white rounded-2xl border border-neutral-100 p-6 hover:border-orange-200 hover:shadow-lg transition-all"
              >
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {item.question}
                </h3>
                <p className="text-sm text-neutral-500">{item.answer}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* 價格分級概覽 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
            球拍價格分級
          </h2>
          <p className="text-neutral-500 text-center mb-8">
            根據預算和程度選擇適合的球拍等級
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PADDLE_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl border-2 p-6 hover:shadow-xl transition-all ${category.color === 'emerald' ? 'border-emerald-200 hover:border-emerald-400' :
                  category.color === 'blue' ? 'border-blue-200 hover:border-blue-400' :
                    'border-purple-200 hover:border-purple-400'
                  }`}
              >
                {category.id === 'intermediate' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full">
                    🔥 最推薦
                  </span>
                )}
                <div className="text-center mb-4">
                  <span className="text-4xl mb-2 block">{category.icon}</span>
                  <h3 className="text-xl font-bold text-neutral-900">{category.title}</h3>
                  <p className={`text-lg font-bold ${category.color === 'emerald' ? 'text-emerald-600' :
                    category.color === 'blue' ? 'text-blue-600' :
                      'text-purple-600'
                    }`}>
                    {category.subtitle}
                  </p>
                </div>

                <ul className="space-y-2 mb-4">
                  {category.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                      <span className={`w-1.5 h-1.5 rounded-full ${category.color === 'emerald' ? 'bg-emerald-500' :
                        category.color === 'blue' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-neutral-400 text-center">
                  適合：{category.recommended}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 智能推薦工具 */}
        <section id="recommender" className="mb-20 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
                🎯 互動工具
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                球拍選擇建議工具
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                回答幾個簡單問題，我們會根據你的打法風格和經驗推薦最適合的球拍
              </p>
            </div>
            <PaddleRecommender />
          </motion.div>
        </section>

        {/* 球拍對比工具 */}
        <section id="comparison" className="mb-20 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                ⚖️ 對比分析
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                球拍規格對比
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                並排比較不同球拍的重量、材質、甜區大小等關鍵規格
              </p>
            </div>
            <PaddleComparison />
          </motion.div>
        </section>

        {/* 完整選購指南 */}
        <section id="guide" className="mb-20 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                📖 深度教學
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                球拍選購完全指南
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                深入了解球拍的材質、重量、平衡點等規格如何影響你的打法
              </p>
            </div>
            <PaddleGuide />
          </motion.div>
        </section>

        {/* 職業選手裝備 */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                🏆 職業參考
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                頂尖選手使用裝備
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                了解職業選手的球拍選擇和他們的打法特點
              </p>
            </div>
            <ProPlayerPaddles />
          </motion.div>
        </section>

        {/* 其他裝備推薦 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-neutral-900 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">
              除了球拍，還需要什麼？
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: '👟',
                  title: '運動鞋',
                  desc: '室內運動鞋或網球鞋，注意避免黑底鞋',
                  price: 'NT$ 1,500-4,000'
                },
                {
                  icon: '🎾',
                  title: '匹克球',
                  desc: '室內球（孔較少）或室外球（孔較多）',
                  price: 'NT$ 50-150/顆'
                },
                {
                  icon: '👕',
                  title: '運動服裝',
                  desc: '透氣排汗材質，方便活動的設計',
                  price: 'NT$ 500-2,000'
                },
                {
                  icon: '🎒',
                  title: '球拍袋',
                  desc: '保護球拍，方便攜帶配件',
                  price: 'NT$ 500-2,000'
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <span className="text-4xl mb-3 block">{item.icon}</span>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-neutral-400 mb-2">{item.desc}</p>
                  <p className="text-sm text-orange-400 font-medium">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 相關資源連結 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 text-center">
            選好球拍，下一步是什麼？
          </h2>
          <p className="text-neutral-600 text-center mb-8 max-w-2xl mx-auto">
            裝備準備好了，接下來就是找到球場、學習規則、開始練習！
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to={ROUTES.COURTS}
              className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">
                尋找附近球場
              </h3>
              <p className="text-sm text-neutral-500">
                全台 55+ 球場資訊，找到離你最近的匹克球場
              </p>
            </Link>

            <Link
              to={ROUTES.RULES}
              className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">
                學習匹克球規則
              </h3>
              <p className="text-sm text-neutral-500">
                雙彈跳、廚房區、計分規則，10分鐘完整掌握
              </p>
            </Link>

            <Link
              to={ROUTES.LEARNING}
              className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">
                技巧教學影片
              </h3>
              <p className="text-sm text-neutral-500">
                發球、接發球、正反手，3D 互動教學
              </p>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Equipment;
