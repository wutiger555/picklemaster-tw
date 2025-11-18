import { useState } from 'react';
import { motion } from 'framer-motion';
import PaddleGuide from '../components/equipment/PaddleGuide';
import ProPlayerPaddles from '../components/equipment/ProPlayerPaddles';
import PaddleRecommender from '../components/equipment/PaddleRecommender';
import PaddleComparison from '../components/equipment/PaddleComparison';
import { usePageTitle } from '../hooks/usePageTitle';

const Equipment = () => {
  usePageTitle('匹克球裝備指南');
  const [activeTab, setActiveTab] = useState('paddle-guide');

  const tabs = [
    { id: 'paddle-guide', label: '球拍完全指南' },
    { id: 'comparison', label: '球拍對比' },
    { id: 'pro-paddles', label: '職業選手裝備' },
    { id: 'recommender', label: '選購建議工具' },
    { id: 'budget', label: '裝備預算參考' },
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
            裝備指南
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            選擇適合你的球拍與裝備，提升你的球技
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 頁籤導航 */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pickleball-500 to-sport-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 球拍完全指南 */}
        {activeTab === 'paddle-guide' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="mb-20">
              <h2 className="text-3xl font-black text-center mb-8 text-gray-800">
                球拍完全指南
              </h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                深入了解球拍的材質、重量、平衡點等規格如何影響你的打法
              </p>
              <PaddleGuide />
            </section>
          </motion.div>
        )}

        {/* 球拍對比 */}
        {activeTab === 'comparison' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PaddleComparison />
          </motion.div>
        )}

        {/* 職業選手裝備 */}
        {activeTab === 'pro-paddles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="mb-20">
              <h2 className="text-3xl font-black text-center mb-8 text-gray-800">
                頂尖選手裝備
              </h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                看看職業選手都在用什麼球拍，了解他們的選擇理由
              </p>
              <ProPlayerPaddles />
            </section>
          </motion.div>
        )}

        {/* 選購建議工具 */}
        {activeTab === 'recommender' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="mb-20">
              <h2 className="text-3xl font-black text-center mb-8 text-gray-800">
                球拍選擇建議工具
              </h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                根據你的打法風格和經驗，為你推薦最適合的球拍
              </p>
              <PaddleRecommender />
            </section>
          </motion.div>
        )}

        {/* 裝備預算參考 */}
        {activeTab === 'budget' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="mb-20">
              <h2 className="text-3xl font-black text-center mb-8 text-gray-800">
                裝備預算參考
              </h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                了解各級別裝備的價格範圍，做出明智的購買決策
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="font-bold text-xl text-court-700 mb-4">
                    球拍預算參考
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="font-semibold text-gray-700">入門級</span>
                      <span className="text-court-600 font-bold">NT$ 2,000 - 4,000</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="font-semibold text-gray-700">中階級</span>
                      <span className="text-sport-600 font-bold">NT$ 4,000 - 8,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">高階級</span>
                      <span className="text-pickleball-600 font-bold">NT$ 8,000+</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    提示：新手建議從中階球拍開始，重量 7.5-8.5 oz 較適合
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="font-bold text-xl text-sport-700 mb-4">
                    其他裝備
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-sport-500 mr-2">•</span>
                      <div>
                        <p className="font-semibold text-gray-800">鞋子</p>
                        <p className="text-sm text-gray-600">室內運動鞋或網球鞋，良好抓地力</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sport-500 mr-2">•</span>
                      <div>
                        <p className="font-semibold text-gray-800">服裝</p>
                        <p className="text-sm text-gray-600">透氣排汗的運動服飾</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sport-500 mr-2">•</span>
                      <div>
                        <p className="font-semibold text-gray-800">配件</p>
                        <p className="text-sm text-gray-600">護腕、頭帶、運動毛巾</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Equipment;
