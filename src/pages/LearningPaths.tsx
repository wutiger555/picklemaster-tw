import { useState } from 'react';
import { motion } from 'framer-motion';
import LearningPathTimeline from '../components/learning/LearningPathTimeline';
import QuizCard from '../components/quiz/QuizCard';

const LearningPaths = () => {
  const [activeTab, setActiveTab] = useState('paths');

  const tabs = [
    { id: 'paths', label: '學習路徑', icon: '🚀' },
    { id: 'quiz', label: '互動測驗', icon: '✏️' },
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
            學習路徑
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            根據你的程度，選擇最適合的學習路徑，並透過測驗檢驗學習成果
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

        {/* 學習路徑時間軸 */}
        {activeTab === 'paths' && (
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

        {/* 互動測驗 */}
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
      </div>
    </div>
  );
};

export default LearningPaths;
