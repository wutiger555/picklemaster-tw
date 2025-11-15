import { motion } from 'framer-motion';
import InteractiveCourt from '../components/court/InteractiveCourt';
import BallAnimation from '../components/court/BallAnimation';
import TechniqueViewer3D from '../components/learning/TechniqueViewer3D';

const Learning = () => {
  const learningPaths = [
    {
      level: '新手入門',
      icon: '🌱',
      color: 'court',
      gradient: 'from-court-500 to-court-600',
      description: '適合完全沒有接觸過匹克球的初學者',
      topics: [
        '認識匹克球場地與器材',
        '基本規則與計分方式',
        '正確握拍與站位',
        '發球與接發球技巧',
      ],
    },
    {
      level: '中階進修',
      icon: '⚡',
      color: 'sport',
      gradient: 'from-sport-500 to-sport-600',
      description: '已掌握基礎，想要提升技術水平',
      topics: [
        '進階擊球技巧（切球、旋轉球）',
        '戰術策略與場上走位',
        '雙打配合與溝通',
        '常見錯誤修正',
      ],
    },
    {
      level: '進階強化',
      icon: '🏆',
      color: 'pickleball',
      gradient: 'from-pickleball-500 to-pickleball-600',
      description: '追求卓越，準備參加比賽',
      topics: [
        '專業技術細節優化',
        '比賽心理與策略運用',
        '體能訓練與傷害預防',
        '教練培訓與教學技巧',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 標題區 */}
      <section className="bg-gradient-to-r from-pickleball-500 via-sport-500 to-court-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-4"
          >
            技巧教學
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            從基礎規則到進階技巧，系統化學習匹克球
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 互動式球場教學 */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <InteractiveCourt />
          </motion.div>
        </section>

        {/* 球路徑動畫 */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <BallAnimation />
          </motion.div>
        </section>

        {/* 3D 技術動作教學 */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <TechniqueViewer3D />
          </motion.div>
        </section>

        {/* 學習路徑 */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-center mb-4"
          >
            選擇你的學習路徑
          </motion.h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            依照你的程度選擇合適的課程，循序漸進提升技巧
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-3xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300"
              >
                <div className={`bg-gradient-to-br ${path.gradient} text-white p-8`}>
                  <div className="text-6xl mb-4 group-hover:animate-bounce-slow">
                    {path.icon}
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{path.level}</h2>
                  <p className="text-white/90">{path.description}</p>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {path.topics.map((topic, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start"
                      >
                        <span className={`text-${path.color}-500 mr-3 text-lg`}>✓</span>
                        <span className="text-gray-700">{topic}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <button
                    className={`w-full bg-gradient-to-r ${path.gradient} text-white py-4 rounded-full font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2`}
                  >
                    <span>開始學習</span>
                    <span className="text-xl">→</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 學習提示 */}
        <section className="mt-20 bg-gradient-to-br from-pickleball-50 to-sport-50 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-2">循序漸進</h3>
              <p className="text-gray-600">
                建議從基礎開始，打好基本功再進階學習
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">多加練習</h3>
              <p className="text-gray-600">
                理論搭配實戰，到球場實際演練效果更好
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">找球友</h3>
              <p className="text-gray-600">
                加入社群，與其他球友一起切磋進步
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Learning;
