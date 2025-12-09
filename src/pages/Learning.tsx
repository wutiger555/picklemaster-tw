import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import InteractiveCourt from '../components/court/InteractiveCourt';
import BallAnimation from '../components/court/BallAnimation';
import CourtViewer3D from '../components/learning/CourtViewer3D';
import LearningPathTimeline from '../components/learning/LearningPathTimeline';
import VideoTutorials from '../components/learning/VideoTutorials';
import QuizCard from '../components/quiz/QuizCard';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';

// 技巧分類
const SKILL_CATEGORIES = [
  {
    id: 'serve',
    title: '發球技巧',
    icon: '🎯',
    description: '發球是每一分的開始，掌握正確姿勢和穩定性',
    skills: ['低手發球', '強力發球', '旋轉發球']
  },
  {
    id: 'return',
    title: '接發球',
    icon: '🏃',
    description: '接發球決定了你在這一分中的位置優勢',
    skills: ['深球回擊', '短球壓制', '側身接球']
  },
  {
    id: 'dink',
    title: 'Dink 軟球',
    icon: '🎾',
    description: '網前控制戰的核心技術，需要精準的手感',
    skills: ['直線 Dink', '斜線 Dink', 'ATP 繞頭']
  },
  {
    id: 'volley',
    title: '截擊技巧',
    icon: '⚡',
    description: '快速反應的網前截擊，給對手壓力',
    skills: ['正手截擊', '反手截擊', '高壓球']
  }
];

// 學習資源快速入口
const QUICK_RESOURCES = [
  {
    icon: '📖',
    title: '匹克球規則',
    description: '雙彈跳、廚房區、發球規則',
    link: ROUTES.RULES,
    color: 'emerald'
  },
  {
    icon: '🏓',
    title: '裝備選購指南',
    description: '球拍選購、材質分析',
    link: ROUTES.EQUIPMENT,
    color: 'amber'
  },
  {
    icon: '📍',
    title: '球場地圖',
    description: '全台 55+ 球場資訊',
    link: ROUTES.COURTS,
    color: 'blue'
  }
];

const Learning = () => {
  usePageTitle('匹克球技巧教學');
  const [expandedSection, setExpandedSection] = useState<string | null>('3d-court');
  const [showQuiz, setShowQuiz] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SEOHead page="learning" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          {/* 動態波浪背景 */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <motion.path
              d="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z"
              fill="rgba(255,255,255,0.05)"
              animate={{
                d: [
                  "M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z",
                  "M0,50 C150,20 350,100 600,50 C850,0 1050,80 1200,50 L1200,120 L0,120 Z",
                  "M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z"
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          {/* 麵包屑導航 */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link to={ROUTES.HOME} className="hover:text-white transition-colors">首頁</Link>
            <span>›</span>
            <span className="text-white">技巧教學</span>
          </nav>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-4"
            >
              <span>🎯</span>
              3D 互動教學 · 影片示範
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-4"
            >
              匹克球
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300">技巧教學</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
            >
              從發球到截擊，從站位到戰術，透過 3D 互動球場和專業影片，
              讓你快速掌握匹克球的核心技巧！
            </motion.p>

            {/* 技巧快速預覽 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {SKILL_CATEGORIES.map((category, index) => (
                <motion.span
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm"
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.title}
                </motion.span>
              ))}
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
        {/* 快速資源入口 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {QUICK_RESOURCES.map((resource, index) => (
              <Link
                key={index}
                to={resource.link}
                className={`group p-5 rounded-xl border-2 transition-all hover:shadow-lg ${resource.color === 'emerald' ? 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50' :
                    resource.color === 'amber' ? 'border-amber-200 hover:border-amber-400 bg-amber-50/50' :
                      'border-blue-200 hover:border-blue-400 bg-blue-50/50'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{resource.icon}</span>
                  <div>
                    <h3 className={`font-bold group-hover:${resource.color === 'emerald' ? 'text-emerald-600' :
                        resource.color === 'amber' ? 'text-amber-600' :
                          'text-blue-600'
                      } transition-colors`}>
                      {resource.title}
                    </h3>
                    <p className="text-sm text-neutral-500">{resource.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-neutral-400 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* 3D 球場配置與站位 */}
        <motion.section
          id="3d-court"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('3d-court')}
              className="w-full p-6 md:p-8 flex items-center justify-between text-left"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium mb-2">
                  🎮 互動體驗
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  3D 球場配置與站位教學
                </h2>
                <p className="text-neutral-600 mt-2">
                  360° 檢視球場結構，學習正確的站位與各區域規則
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full bg-white shadow flex items-center justify-center transition-transform ${expandedSection === '3d-court' ? 'rotate-180' : ''
                }`}>
                <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <AnimatePresence>
              {expandedSection === '3d-court' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 md:px-8 pb-8 overflow-hidden"
                >
                  <CourtViewer3D />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* 互動式球場教學 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('interactive-court')}
              className="w-full p-6 md:p-8 flex items-center justify-between text-left"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium mb-2">
                  📍 點擊學習
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  互動式球場區域教學
                </h2>
                <p className="text-neutral-600 mt-2">
                  點擊球場上的不同區域，了解每個位置的規則和戰術要點
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full bg-white shadow flex items-center justify-center transition-transform ${expandedSection === 'interactive-court' ? 'rotate-180' : ''
                }`}>
                <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <AnimatePresence>
              {expandedSection === 'interactive-court' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 md:px-8 pb-8 overflow-hidden"
                >
                  <InteractiveCourt />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* 球路徑動畫 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('ball-animation')}
              className="w-full p-6 md:p-8 flex items-center justify-between text-left"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-2">
                  🎾 動畫示範
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  球路徑軌跡動畫
                </h2>
                <p className="text-neutral-600 mt-2">
                  學習不同擊球類型的球路軌跡和落點
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full bg-white shadow flex items-center justify-center transition-transform ${expandedSection === 'ball-animation' ? 'rotate-180' : ''
                }`}>
                <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <AnimatePresence>
              {expandedSection === 'ball-animation' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 md:px-8 pb-8 overflow-hidden"
                >
                  <BallAnimation />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* 影片教學區 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
              🎬 影片教學
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
              專業技巧影片
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              由專業教練示範的技巧教學影片，讓你更直觀地學習
            </p>
          </div>
          <VideoTutorials />
        </motion.section>

        {/* 技巧分類卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
              核心技巧分類
            </h2>
            <p className="text-neutral-600">
              匹克球四大核心技巧，循序漸進學習
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SKILL_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-neutral-100 p-6 hover:shadow-lg hover:border-purple-200 transition-all group"
              >
                <span className="text-4xl mb-4 block">{category.icon}</span>
                <h3 className="font-bold text-lg text-neutral-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-neutral-500 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.skills.map((skill, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 互動測驗 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium mb-2">
                  ✏️ 測試你的知識
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  匹克球規則測驗
                </h2>
                <p className="text-neutral-600 mt-2">
                  透過互動測驗檢驗你對匹克球規則的理解
                </p>
              </div>
              <button
                onClick={() => setShowQuiz(!showQuiz)}
                className={`px-6 py-3 font-bold rounded-xl transition-all ${showQuiz
                    ? 'bg-neutral-200 text-neutral-700'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl'
                  }`}
              >
                {showQuiz ? '收起測驗' : '開始測驗'}
              </button>
            </div>
            <AnimatePresence>
              {showQuiz && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <QuizCard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* 學習路徑 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              🚀 系統學習
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
              學習路徑規劃
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              從新手到高手的完整學習路徑，循序漸進掌握匹克球
            </p>
          </div>
          <LearningPathTimeline />
          <div className="text-center mt-8">
            <Link
              to={ROUTES.LEARNING_PATHS}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              查看完整學習路徑
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.section>

        {/* 下一步 CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-neutral-900 rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            準備好開始練習了嗎？
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            學會基本技巧後，找一個球場開始實戰練習吧！
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={ROUTES.COURTS}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              📍 找附近球場
            </Link>
            <Link
              to={ROUTES.SCORER}
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              📊 計分器工具
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Learning;
