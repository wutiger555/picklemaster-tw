import { motion } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';
import VisualSkillGrid from '../components/learning/VisualSkillGrid';

export default function LearningPaths() {
  return (
    <>
      <SEOHead page="learning-paths" />

      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-bold text-sm mb-6"
            >
              ✨ 全新視覺化學習體驗
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight"
            >
              不只是閱讀，<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                親眼看見你的進步
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              我們將複雜的匹克球理論轉化為直觀的互動圖表。
              <br className="hidden md:block" />
              針對你的具體問題，提供最直接的視覺化解答。
            </motion.p>
          </div>

          {/* Main Content Grid */}
          <VisualSkillGrid />

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-center text-white overflow-hidden relative"
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                準備好上場實戰了嗎？
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                掌握了這些觀念後，最好的練習就是直接上場打球。
                立即搜尋離你最近的球場，開始你的匹克球之旅！
              </p>
              <motion.a
                href="/courts"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                搜尋附近球場 ➜
              </motion.a>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </motion.div>
        </div>
      </div>
    </>
  );
}
