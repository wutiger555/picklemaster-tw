import { useState } from 'react';
import { motion } from 'framer-motion';
import InteractiveCourt from '../components/court/InteractiveCourt';
import BallAnimation from '../components/court/BallAnimation';
import CourtViewer3D from '../components/learning/CourtViewer3D';
import PaddleGuide from '../components/equipment/PaddleGuide';
import ProPlayerPaddles from '../components/equipment/ProPlayerPaddles';
import PaddleRecommender from '../components/equipment/PaddleRecommender';
import LearningPathTimeline from '../components/learning/LearningPathTimeline';
import QuizCard from '../components/quiz/QuizCard';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('basics');

  const tabs = [
    { id: 'basics', label: '基礎規則', icon: '📚' },
    { id: 'techniques', label: '技巧訓練', icon: '🎯' },
    { id: 'equipment', label: '裝備指南', icon: '🏓' },
    { id: 'quiz', label: '互動測驗', icon: '✏️' },
    { id: 'learning-paths', label: '學習路徑', icon: '🚀' },
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
        {/* 頁籤導航 */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pickleball-500 to-sport-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 基礎規則頁籤 */}
        {activeTab === 'basics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="mb-20">
              <h2 className="text-3xl font-black text-center mb-8 text-gray-800">
                互動式球場教學
              </h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                點擊球場上的不同區域，了解每個位置的規則和戰術要點
              </p>
              <InteractiveCourt />
            </section>
          </motion.div>
        )}

        {/* 技巧訓練頁籤 */}
        {activeTab === 'techniques' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="mb-20">
              <h2 className="text-3xl font-black text-center mb-8 text-gray-800">
                3D 球場配置與站位教學
              </h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                360 度檢視球場結構，學習正確的站位與各區域規則
              </p>
              <CourtViewer3D />
            </section>

            <section className="mb-20">
              <h2 className="text-3xl font-black text-center mb-8 text-gray-800">
                球路徑動畫
              </h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                學習不同擊球類型的球路軌跡和落點
              </p>
              <BallAnimation />
            </section>
          </motion.div>
        )}

        {/* 裝備指南頁籤 */}
        {activeTab === 'equipment' && (
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

            <section className="mb-20">
              <h2 className="text-3xl font-black text-center mb-8 text-gray-800">
                頂尖選手裝備
              </h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                看看職業選手都在用什麼球拍，了解他們的選擇理由
              </p>
              <ProPlayerPaddles />
            </section>

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

        {/* 互動測驗頁籤 */}
        {activeTab === 'quiz' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section>
              <h2 className="text-3xl font-black text-center mb-8 text-gray-800">
                匹克球規則測驗
              </h2>
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                透過互動測驗檢驗你對匹克球規則的理解，答對會有綠色提示，答錯會有微小晃動提醒
              </p>
              <QuizCard />
            </section>
          </motion.div>
        )}

        {/* 學習路徑頁籤 */}
        {activeTab === 'learning-paths' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
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
                點選路徑卡片查看詳細課程，追蹤你的學習進度
              </p>

              <LearningPathTimeline />
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Learning;
