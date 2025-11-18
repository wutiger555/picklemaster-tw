import { useState } from 'react';
import { motion } from 'framer-motion';
import LearningPathTimeline from '../components/learning/LearningPathTimeline';
import QuizCard from '../components/quiz/QuizCard';
import GlassCard from '../components/common/GlassCard';
import GripVisualization from '../components/equipment/GripVisualization';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';

const LearningPaths = () => {
  usePageTitle('學習路徑');
  const [activeTab, setActiveTab] = useState('paths');

  const tabs = [
    { id: 'paths', label: '學習路徑', icon: '🎯' },
    { id: 'grips', label: '握拍技巧', icon: '🤝' },
    { id: 'quiz', label: '互動測驗', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SEOHead page="learningPaths" />
      {/* 標題區 - 升級設計 */}
      <section className="relative bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 text-white py-20 md:py-24 overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="font-display text-display-lg md:text-display-xl font-black mb-4 drop-shadow-lg"
          >
            學習路徑
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-body-lg md:text-body-xl text-white/90 max-w-2xl mx-auto"
          >
            根據你的程度，選擇最適合的學習路徑，並透過測驗檢驗學習成果
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
                  variant={activeTab === tab.id ? 'primary' : 'light'}
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

        {/* 學習路徑時間軸 */}
        {activeTab === 'paths' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section>
              <GlassCard variant="light" size="lg" className="mb-12">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="font-display text-display-md font-black text-center mb-4 text-neutral-900"
                >
                  選擇你的學習路徑
                </motion.h2>
                <p className="text-center text-body-md text-neutral-600 max-w-2xl mx-auto">
                  點選路徑卡片查看詳細課程，追蹤你的學習進度
                </p>
              </GlassCard>

              <LearningPathTimeline />
            </section>
          </motion.div>
        )}

        {/* 握拍技巧 */}
        {activeTab === 'grips' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section>
              <GlassCard variant="light" size="lg" className="mb-12">
                <h2 className="font-display text-display-md font-black text-center mb-4 text-neutral-900">
                  正確握拍是成功的第一步
                </h2>
                <p className="text-center text-body-md text-neutral-600 max-w-2xl mx-auto">
                  學習三種基本握法：東方式、西方式、大陸式，掌握正確的握拍方式能提升控球與擊球品質
                </p>
              </GlassCard>
              <GripVisualization />
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
              <GlassCard variant="light" size="lg" className="mb-12">
                <h2 className="font-display text-display-md font-black text-center mb-4 text-neutral-900">
                  匹克球規則測驗
                </h2>
                <p className="text-center text-body-md text-neutral-600 max-w-2xl mx-auto">
                  透過互動測驗檢驗你對匹克球規則的理解，答對會有綠色提示，答錯會有微小晃動提醒
                </p>
              </GlassCard>
              <QuizCard />
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LearningPaths;
