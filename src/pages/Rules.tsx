import { useState } from 'react';
import { motion } from 'framer-motion';
import InteractiveCourt from '../components/court/InteractiveCourt';
import BallAnimation from '../components/court/BallAnimation';
import CourtViewer3D from '../components/learning/CourtViewer3D';
import { usePageTitle } from '../hooks/usePageTitle';

const Rules = () => {
  usePageTitle('匹克球規則教學');
  const [activeTab, setActiveTab] = useState('interactive-court');

  const tabs = [
    { id: 'interactive-court', label: '互動式球場' },
    { id: '3d-court', label: '3D 球場配置' },
    { id: 'ball-path', label: '球路徑分析' },
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
            規則教學
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            透過互動式教學，快速掌握匹克球的基本規則與球場配置
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

        {/* 互動式球場 */}
        {activeTab === 'interactive-court' && (
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

        {/* 3D 球場配置 */}
        {activeTab === '3d-court' && (
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
          </motion.div>
        )}

        {/* 球路徑動畫 */}
        {activeTab === 'ball-path' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
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
      </div>
    </div>
  );
};

export default Rules;
