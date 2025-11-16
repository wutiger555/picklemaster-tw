import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
}

interface LearningPath {
  id: string;
  level: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  lessons: Lesson[];
  totalDuration: string;
}

const learningPaths: LearningPath[] = [
  {
    id: 'beginner',
    level: '新手入門',
    icon: '🌱',
    color: 'court',
    gradient: 'from-court-500 to-court-600',
    description: '適合完全沒有接觸過匹克球的初學者',
    totalDuration: '4 週',
    lessons: [
      {
        id: 'b1',
        title: '認識匹克球場地與器材',
        description: '了解球場規格、器材選擇、基本配備',
        duration: '30 分鐘',
        completed: false,
      },
      {
        id: 'b2',
        title: '基本規則與計分方式',
        description: '掌握比賽規則、得分機制、發球順序',
        duration: '45 分鐘',
        completed: false,
      },
      {
        id: 'b3',
        title: '正確握拍與站位',
        description: '學習正確握拍方式、基本站位、移動步法',
        duration: '1 小時',
        completed: false,
      },
      {
        id: 'b4',
        title: '發球與接發球技巧',
        description: '練習下手發球、接發球準備、回球技巧',
        duration: '1.5 小時',
        completed: false,
      },
    ],
  },
  {
    id: 'intermediate',
    level: '中階進修',
    icon: '⚡',
    color: 'sport',
    gradient: 'from-sport-500 to-sport-600',
    description: '已掌握基礎，想要提升技術水平',
    totalDuration: '6 週',
    lessons: [
      {
        id: 'i1',
        title: '進階擊球技巧',
        description: '學習切球、旋轉球、吊球等進階技術',
        duration: '2 小時',
        completed: false,
      },
      {
        id: 'i2',
        title: '戰術策略與場上走位',
        description: '理解戰術運用、場上定位、進攻防守',
        duration: '1.5 小時',
        completed: false,
      },
      {
        id: 'i3',
        title: '雙打配合與溝通',
        description: '培養雙打默契、溝通技巧、配合策略',
        duration: '2 小時',
        completed: false,
      },
      {
        id: 'i4',
        title: '常見錯誤修正',
        description: '診斷並修正常見技術問題、改善打法',
        duration: '1.5 小時',
        completed: false,
      },
    ],
  },
  {
    id: 'advanced',
    level: '進階強化',
    icon: '🏆',
    color: 'pickleball',
    gradient: 'from-pickleball-500 to-pickleball-600',
    description: '追求卓越，準備參加比賽',
    totalDuration: '8 週',
    lessons: [
      {
        id: 'a1',
        title: '專業技術細節優化',
        description: '精進每個技術動作、提升一致性與穩定性',
        duration: '2.5 小時',
        completed: false,
      },
      {
        id: 'a2',
        title: '比賽心理與策略運用',
        description: '培養比賽心態、壓力管理、臨場應變',
        duration: '2 小時',
        completed: false,
      },
      {
        id: 'a3',
        title: '體能訓練與傷害預防',
        description: '專項體能訓練、熱身拉伸、傷害預防',
        duration: '2 小時',
        completed: false,
      },
      {
        id: 'a4',
        title: '教練培訓與教學技巧',
        description: '學習教學方法、訓練計劃、指導技巧',
        duration: '3 小時',
        completed: false,
      },
    ],
  },
];

export default function LearningPathTimeline() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const handleLessonComplete = (lessonId: string) => {
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(lessonId)) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
    }
    setCompletedLessons(newCompleted);
  };

  const selectedPathData = learningPaths.find(path => path.id === selectedPath);

  return (
    <div>
      {/* 路徑選擇卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {learningPaths.map((path) => {
          const isSelected = selectedPath === path.id;
          const completedCount = path.lessons.filter(lesson =>
            completedLessons.has(lesson.id)
          ).length;
          const progress = (completedCount / path.lessons.length) * 100;

          return (
            <motion.div
              key={path.id}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPath(path.id)}
              className={`cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 ${
                isSelected
                  ? 'ring-4 ring-offset-4 ring-' + path.color + '-400 shadow-2xl'
                  : 'shadow-lg hover:shadow-xl'
              }`}
            >
              <div className={`bg-gradient-to-br ${path.gradient} text-white p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl">{path.icon}</span>
                  {progress > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold"
                    >
                      {Math.round(progress)}%
                    </motion.div>
                  )}
                </div>
                <h3 className="text-2xl font-black mb-2">{path.level}</h3>
                <p className="text-white/90 text-sm mb-4">{path.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span>⏱️ {path.totalDuration}</span>
                  <span>📚 {path.lessons.length} 課程</span>
                </div>
              </div>
              {progress > 0 && (
                <div className="bg-white">
                  <div className={`h-2 bg-gradient-to-r ${path.gradient}`} style={{ width: `${progress}%` }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 課程詳情 Timeline */}
      <AnimatePresence mode="wait">
        {selectedPathData && (
          <motion.div
            key={selectedPathData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <span className="text-6xl">{selectedPathData.icon}</span>
                <div>
                  <h2 className="text-3xl font-black text-gray-800">{selectedPathData.level}</h2>
                  <p className="text-gray-600">{selectedPathData.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPath(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline 線條 */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />

              {/* 課程列表 */}
              <div className="space-y-8">
                {selectedPathData.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.has(lesson.id);

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start space-x-6"
                    >
                      {/* Timeline 圓點 */}
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLessonComplete(lesson.id)}
                        className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center ${
                          isCompleted
                            ? `bg-gradient-to-br ${selectedPathData.gradient} shadow-lg`
                            : 'bg-white border-4 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-white text-2xl font-bold"
                          >
                            ✓
                          </motion.span>
                        ) : (
                          <span className="text-gray-400 font-bold">{index + 1}</span>
                        )}
                      </motion.div>

                      {/* 課程卡片 */}
                      <motion.div
                        whileHover={{ scale: 1.02, x: 10 }}
                        className={`flex-1 rounded-2xl p-6 transition-all duration-300 ${
                          isCompleted
                            ? `bg-gradient-to-r ${selectedPathData.gradient} text-white shadow-lg`
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`text-xl font-bold ${isCompleted ? 'text-white' : 'text-gray-800'}`}>
                            {lesson.title}
                          </h3>
                          {isCompleted && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="text-3xl"
                            >
                              🎉
                            </motion.div>
                          )}
                        </div>
                        <p className={`mb-3 ${isCompleted ? 'text-white/90' : 'text-gray-600'}`}>
                          {lesson.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={isCompleted ? 'text-white/80' : 'text-gray-500'}>
                            ⏱️ {lesson.duration}
                          </span>
                          <button
                            onClick={() => handleLessonComplete(lesson.id)}
                            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                              isCompleted
                                ? 'bg-white/20 hover:bg-white/30 text-white'
                                : 'bg-white hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {isCompleted ? '標記為未完成' : '標記為完成'}
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 完成進度總結 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`mt-12 bg-gradient-to-r ${selectedPathData.gradient} rounded-2xl p-6 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold mb-2">學習進度</h4>
                  <p className="text-white/90">
                    已完成 {selectedPathData.lessons.filter(l => completedLessons.has(l.id)).length} / {selectedPathData.lessons.length} 課程
                  </p>
                </div>
                <div className="text-5xl">
                  {selectedPathData.lessons.every(l => completedLessons.has(l.id)) ? '🏆' : '💪'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示文字 */}
      {!selectedPath && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 mt-8"
        >
          <p className="text-lg">👆 點選上方卡片查看詳細課程內容</p>
        </motion.div>
      )}
    </div>
  );
}
