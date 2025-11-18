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
import GlassCard from '../components/common/GlassCard';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';

const Learning = () => {
  usePageTitle('匹克球學習');
  const [activeTab, setActiveTab] = useState('basics');

  const tabs = [
    { id: 'basics', label: '基礎規則', icon: '📚', variant: 'primary' as const },
    { id: 'techniques', label: '技巧訓練', icon: '🎯', variant: 'secondary' as const },
    { id: 'equipment', label: '裝備指南', icon: '🏓', variant: 'accent' as const },
    { id: 'quiz', label: '互動測驗', icon: '✏️', variant: 'primary' as const },
    { id: 'learning-paths', label: '學習路徑', icon: '🚀', variant: 'secondary' as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
      <SEOHead page="learning" />
      {/* 標題區 */}
      <section className="relative bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white py-20 overflow-hidden">
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <motion.path
              d="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z"
              fill="white"
              animate={{
                d: [
                  "M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z",
                  "M0,50 C150,20 350,100 600,50 C850,0 1050,80 1200,50 L1200,120 L0,120 Z",
                  "M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z"
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-display-2xl font-black mb-4"
          >
            技巧教學
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-body-xl text-white/90 max-w-2xl mx-auto"
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
              <motion.div
                key={tab.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassCard
                  variant={activeTab === tab.id ? tab.variant : 'light'}
                  size="sm"
                  hoverable
                  clickable
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? 'ring-2 ring-white shadow-elevated-lg' : ''}
                >
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <span className="text-2xl">{tab.icon}</span>
                    <span className="font-display text-heading-sm font-bold text-neutral-900">
                      {tab.label}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
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
              <GlassCard variant="primary" size="md" className="mb-8">
                <h2 className="font-display text-heading-2xl font-black text-center text-neutral-900">
                  互動式球場教學
                </h2>
                <p className="text-body-lg text-center text-neutral-700 mt-3 max-w-2xl mx-auto">
                  點擊球場上的不同區域，了解每個位置的規則和戰術要點
                </p>
              </GlassCard>
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
              <GlassCard variant="secondary" size="md" className="mb-8">
                <h2 className="font-display text-heading-2xl font-black text-center text-neutral-900">
                  3D 球場配置與站位教學
                </h2>
                <p className="text-body-lg text-center text-neutral-700 mt-3 max-w-2xl mx-auto">
                  360 度檢視球場結構，學習正確的站位與各區域規則
                </p>
              </GlassCard>
              <CourtViewer3D />
            </section>

            <section className="mb-20">
              <GlassCard variant="secondary" size="md" className="mb-8">
                <h2 className="font-display text-heading-2xl font-black text-center text-neutral-900">
                  球路徑動畫
                </h2>
                <p className="text-body-lg text-center text-neutral-700 mt-3 max-w-2xl mx-auto">
                  學習不同擊球類型的球路軌跡和落點
                </p>
              </GlassCard>
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
              <GlassCard variant="accent" size="md" className="mb-8">
                <h2 className="font-display text-heading-2xl font-black text-center text-neutral-900">
                  球拍完全指南
                </h2>
                <p className="text-body-lg text-center text-neutral-700 mt-3 max-w-2xl mx-auto">
                  深入了解球拍的材質、重量、平衡點等規格如何影響你的打法
                </p>
              </GlassCard>
              <PaddleGuide />
            </section>

            <section className="mb-20">
              <GlassCard variant="accent" size="md" className="mb-8">
                <h2 className="font-display text-heading-2xl font-black text-center text-neutral-900">
                  頂尖選手裝備
                </h2>
                <p className="text-body-lg text-center text-neutral-700 mt-3 max-w-2xl mx-auto">
                  看看職業選手都在用什麼球拍，了解他們的選擇理由
                </p>
              </GlassCard>
              <ProPlayerPaddles />
            </section>

            <section className="mb-20">
              <GlassCard variant="accent" size="md" className="mb-8">
                <h2 className="font-display text-heading-2xl font-black text-center text-neutral-900">
                  球拍選擇建議工具
                </h2>
                <p className="text-body-lg text-center text-neutral-700 mt-3 max-w-2xl mx-auto">
                  根據你的打法風格和經驗，為你推薦最適合的球拍
                </p>
              </GlassCard>
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
              <GlassCard variant="primary" size="md" className="mb-12">
                <h2 className="font-display text-heading-2xl font-black text-center text-neutral-900">
                  匹克球規則測驗
                </h2>
                <p className="text-body-lg text-center text-neutral-700 mt-3 max-w-2xl mx-auto">
                  透過互動測驗檢驗你對匹克球規則的理解，答對會有綠色提示，答錯會有微小晃動提醒
                </p>
              </GlassCard>
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
              <GlassCard variant="secondary" size="md" className="mb-12">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="font-display text-heading-2xl font-black text-center text-neutral-900"
                >
                  選擇你的學習路徑
                </motion.h2>
                <p className="text-body-lg text-center text-neutral-700 mt-3 max-w-2xl mx-auto">
                  點選路徑卡片查看詳細課程，追蹤你的學習進度
                </p>
              </GlassCard>

              <LearningPathTimeline />
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Learning;
