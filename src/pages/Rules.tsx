import { useState } from 'react';
import { motion } from 'framer-motion';
import InteractiveCourt from '../components/court/InteractiveCourt';
import BallAnimation from '../components/court/BallAnimation';
import CourtViewer3D from '../components/learning/CourtViewer3D';
import GlassCard from '../components/common/GlassCard';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';
import { usePageTitle } from '../hooks/usePageTitle';

const Rules = () => {
  usePageTitle('匹克球規則教學');
  const [activeTab, setActiveTab] = useState('interactive-court');

  const tabs = [
    { id: 'interactive-court', label: '互動式球場', icon: '🎯' },
    { id: '3d-court', label: '3D 球場配置', icon: '🏟️' },
    { id: 'ball-path', label: '球路徑分析', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* 標題區 - 升級設計 */}
      <section className="relative bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 text-white py-20 md:py-24 overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary-300/20 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="font-display text-display-lg md:text-display-xl font-black mb-4 drop-shadow-lg"
          >
            規則教學
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-body-lg md:text-body-xl text-white/90 max-w-2xl mx-auto"
          >
            透過互動式教學，快速掌握匹克球的基本規則與球場配置
          </motion.p>
        </div>

        {/* 波浪裝飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#fafafa"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 頁籤導航 - Glassmorphism 設計 */}
        <div className="mb-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {tabs.map((tab) => (
              <motion.div key={tab.id} variants={staggerItem}>
                <GlassCard
                  variant={activeTab === tab.id ? 'secondary' : 'light'}
                  size="sm"
                  hoverable
                  clickable
                  onClick={() => setActiveTab(tab.id)}
                  className="cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center gap-3 px-4 py-2">
                    <span className="text-2xl">{tab.icon}</span>
                    <span className="font-display text-heading-md font-bold text-neutral-900">
                      {tab.label}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
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
              <GlassCard variant="light" size="lg" className="mb-12">
                <h2 className="font-display text-display-md font-black text-center mb-4 text-neutral-900">
                  互動式球場教學
                </h2>
                <p className="text-center text-body-md text-neutral-600 max-w-2xl mx-auto">
                  點擊球場上的不同區域，了解每個位置的規則和戰術要點
                </p>
              </GlassCard>
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
              <GlassCard variant="light" size="lg" className="mb-12">
                <h2 className="font-display text-display-md font-black text-center mb-4 text-neutral-900">
                  3D 球場配置與站位教學
                </h2>
                <p className="text-center text-body-md text-neutral-600 max-w-2xl mx-auto">
                  360 度檢視球場結構，學習正確的站位與各區域規則
                </p>
              </GlassCard>
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
              <GlassCard variant="light" size="lg" className="mb-12">
                <h2 className="font-display text-display-md font-black text-center mb-4 text-neutral-900">
                  球路徑動畫
                </h2>
                <p className="text-center text-body-md text-neutral-600 max-w-2xl mx-auto">
                  學習不同擊球類型的球路軌跡和落點
                </p>
              </GlassCard>
              <BallAnimation />
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Rules;
