import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { learningPaths } from '../../data/learning-modules';

export default function LearningPathTimeline() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const handleLessonComplete = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(lessonId)) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
    }
    setCompletedLessons(newCompleted);
  };

  const toggleLessonExpand = (lessonId: string) => {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null);
    } else {
      setExpandedLesson(lessonId);
    }
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
              onClick={() => {
                setSelectedPath(path.id);
                setExpandedLesson(null);
              }}
              className={`cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 ${isSelected
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

            {/* Story Intro */}
            <div className={`bg-gradient-to-r ${selectedPathData.gradient} rounded-2xl p-6 text-white mb-8`}>
              <div className="flex items-start space-x-4">
                <span className="text-4xl">📖</span>
                <div>
                  <h3 className="text-xl font-bold mb-2">學習旅程</h3>
                  <p className="text-white/90 leading-relaxed">{selectedPathData.storyIntro}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline 線條 */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />

              {/* 課程列表 */}
              <div className="space-y-8">
                {selectedPathData.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.has(lesson.id);
                  const isExpanded = expandedLesson === lesson.id;

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
                        onClick={(e) => handleLessonComplete(lesson.id, e)}
                        className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center ${isCompleted
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
                        layout
                        onClick={() => toggleLessonExpand(lesson.id)}
                        className={`flex-1 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${isCompleted
                          ? `bg-gradient-to-r ${selectedPathData.gradient} shadow-lg`
                          : 'bg-gray-50 hover:bg-gray-100'
                          } ${isExpanded ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className={`text-xl font-bold ${isCompleted ? 'text-white' : 'text-gray-800'}`}>
                              {lesson.title}
                            </h3>
                            <div className="flex items-center space-x-3">
                              {lesson.content && (
                                <span className={`text-xs px-2 py-1 rounded-full ${isCompleted ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                  含互動教學
                                </span>
                              )}
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
                          </div>
                          <p className={`mb-4 ${isCompleted ? 'text-white/90' : 'text-gray-600'}`}>
                            {lesson.description}
                          </p>

                          {/* Key Points */}
                          {lesson.keyPoints && (
                            <div className="mb-4">
                              <h4 className={`text-sm font-bold mb-2 ${isCompleted ? 'text-white/80' : 'text-gray-700'}`}>
                                📌 重點內容：
                              </h4>
                              <ul className="space-y-1">
                                {lesson.keyPoints.map((point, idx) => (
                                  <li key={idx} className={`text-sm flex items-start ${isCompleted ? 'text-white/80' : 'text-gray-600'}`}>
                                    <span className="mr-2">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <div className={`text-sm ${isCompleted ? 'text-white/80' : 'text-gray-500'}`}>
                              ⏱️ {lesson.duration}
                            </div>

                            <div className="flex space-x-3">
                              {lesson.content && (
                                <button
                                  className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${isCompleted
                                      ? 'bg-white text-emerald-600 hover:bg-gray-100'
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                  {isExpanded ? '收起教學' : '開始互動教學'}
                                </button>
                              )}

                              <button
                                onClick={(e) => handleLessonComplete(lesson.id, e)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isCompleted
                                  ? 'bg-white/20 hover:bg-white/30 text-white'
                                  : 'bg-white border border-gray-200 hover:bg-gray-200 text-gray-700'
                                  }`}
                              >
                                {isCompleted ? '標記為未完成' : '標記為完成'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && lesson.content && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-white border-t border-gray-100"
                            >
                              <div className="p-6 cursor-default" onClick={(e) => e.stopPropagation()}>
                                {lesson.content}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
          <p className="text-lg">👆 點選上方卡片開始你的學習旅程</p>
        </motion.div>
      )}
    </div>
  );
}
