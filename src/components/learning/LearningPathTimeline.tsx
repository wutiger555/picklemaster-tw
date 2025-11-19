import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  keyPoints?: string[];
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
  storyIntro: string;
}

const learningPaths: LearningPath[] = [
  {
    id: 'beginner',
    level: '新手入門',
    icon: '🌱',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    description: '從零開始，帶你認識並愛上匹克球',
    storyIntro: '歡迎來到匹克球的世界！讓我們一步步了解這項有趣的運動，從認識開始，到能夠自信地上場比賽。',
    totalDuration: '6 週',
    lessons: [
      {
        id: 'b1',
        title: '第一章：認識匹克球',
        description: '匹克球是什麼？為什麼全球都在瘋這項運動？',
        duration: '20 分鐘',
        completed: false,
        keyPoints: [
          '匹克球的起源與發展',
          '為什麼匹克球適合所有年齡層',
          '匹克球 vs 網球、羽球的差異',
          '在台灣哪裡可以打匹克球',
        ],
      },
      {
        id: 'b2',
        title: '第二章：球場與裝備',
        description: '了解球場結構、需要準備什麼裝備',
        duration: '30 分鐘',
        completed: false,
        keyPoints: [
          '球場尺寸與區域劃分（廚房區、發球區）',
          '如何選擇第一支球拍',
          '匹克球的特性與選擇',
          '服裝與鞋子建議',
        ],
      },
      {
        id: 'b3',
        title: '第三章：基本規則',
        description: '掌握比賽規則，才能開始打球',
        duration: '45 分鐘',
        completed: false,
        keyPoints: [
          '計分方式（只有發球方能得分）',
          '發球規則（下手發球、對角發球）',
          '雙跳規則（Two-Bounce Rule）',
          '廚房規則（Non-Volley Zone）',
          '界內界外判定',
        ],
      },
      {
        id: 'b4',
        title: '第四章：握拍與準備姿勢',
        description: '正確的握拍是成功的第一步',
        duration: '40 分鐘',
        completed: false,
        keyPoints: [
          '三種基本握法（東方式、大陸式、西方式）',
          '準備姿勢（Ready Position）',
          '基本站位與重心',
          '常見握拍錯誤',
        ],
      },
      {
        id: 'b5',
        title: '第五章：發球技巧',
        description: '學會發球，就能開始比賽了',
        duration: '1 小時',
        completed: false,
        keyPoints: [
          '下手發球動作分解',
          '發球站位與瞄準',
          '如何發出穩定的發球',
          '發球常見錯誤與修正',
        ],
      },
      {
        id: 'b6',
        title: '第六章：接發球與回球',
        description: '學會接球，就能開始對打',
        duration: '1 小時',
        completed: false,
        keyPoints: [
          '接發球準備姿勢',
          '深回球技巧',
          '如何應對不同的來球',
          '回球的落點選擇',
        ],
      },
      {
        id: 'b7',
        title: '第七章：基本擊球技術',
        description: '掌握正手、反手、截擊三大基本擊球',
        duration: '1.5 小時',
        completed: false,
        keyPoints: [
          '正手擊球（Forehand）',
          '反手擊球（Backhand）',
          '截擊（Volley）',
          '高吊球（Lob）',
        ],
      },
      {
        id: 'b8',
        title: '第八章：移動與步法',
        description: '學會移動，才能打到每一球',
        duration: '1 小時',
        completed: false,
        keyPoints: [
          '基本移動步法',
          '側併步與交叉步',
          '回位觀念',
          '如何預判球的落點',
        ],
      },
      {
        id: 'b9',
        title: '第九章：球場禮儀與安全',
        description: '成為受歡迎的球友',
        duration: '30 分鐘',
        completed: false,
        keyPoints: [
          '球場基本禮儀',
          '如何呼叫界內界外',
          '安全注意事項',
          '如何找球友與加入社群',
        ],
      },
      {
        id: 'b10',
        title: '第十章：第一場比賽',
        description: '準備好了！上場試試看',
        duration: '1 小時',
        completed: false,
        keyPoints: [
          '比賽前的準備',
          '如何報分數',
          '雙打基本配合',
          '享受比賽，不要怕犯錯',
        ],
      },
    ],
  },
  {
    id: 'intermediate',
    level: '中階進修',
    icon: '⚡',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    description: '提升技術，成為更有競爭力的球員',
    storyIntro: '你已經掌握基礎了！現在讓我們深入學習進階技巧，提升你的比賽水平。',
    totalDuration: '8 週',
    lessons: [
      {
        id: 'i1',
        title: '進階擊球技巧',
        description: '學習切球、旋轉球、小球等進階技術',
        duration: '2 小時',
        completed: false,
        keyPoints: [
          '切球（Slice）技巧',
          '上旋球（Topspin）',
          '小球（Dink）精進',
          '快速抽球（Drive）',
        ],
      },
      {
        id: 'i2',
        title: '第三球小球策略',
        description: '掌握匹克球最重要的戰術',
        duration: '1.5 小時',
        completed: false,
        keyPoints: [
          '什麼是第三球小球',
          '為什麼第三球很重要',
          '如何練習第三球',
          '第三球的變化',
        ],
      },
      {
        id: 'i3',
        title: '網前對決技巧',
        description: '在廚房區域的攻防技巧',
        duration: '2 小時',
        completed: false,
        keyPoints: [
          '小球對拉技巧',
          '如何製造機會球',
          '網前截擊時機',
          '防守高吊球',
        ],
      },
      {
        id: 'i4',
        title: '雙打站位與配合',
        description: '培養雙打默契與戰術',
        duration: '2 小時',
        completed: false,
        keyPoints: [
          '雙打基本站位',
          '進攻與防守陣型',
          '與搭檔的溝通',
          '如何補位',
        ],
      },
      {
        id: 'i5',
        title: '常見錯誤診斷與修正',
        description: '找出並改善技術問題',
        duration: '1.5 小時',
        completed: false,
        keyPoints: [
          '擊球不穩定的原因',
          '移動不到位的問題',
          '發球失誤分析',
          '心理因素影響',
        ],
      },
    ],
  },
  {
    id: 'advanced',
    level: '進階強化',
    icon: '🏆',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    description: '追求卓越，準備參加比賽',
    storyIntro: '你已經是一位優秀的球員了！讓我們精進每個細節，準備在比賽中大放異彩。',
    totalDuration: '10 週',
    lessons: [
      {
        id: 'a1',
        title: '專業技術細節優化',
        description: '精進每個技術動作的細節',
        duration: '2.5 小時',
        completed: false,
        keyPoints: [
          '擊球一致性訓練',
          '旋轉控制',
          '落點精準度',
          '速度與力量平衡',
        ],
      },
      {
        id: 'a2',
        title: '高階戰術運用',
        description: '學習職業選手的戰術思維',
        duration: '2 小時',
        completed: false,
        keyPoints: [
          '如何分析對手',
          '戰術變化與調整',
          '壓力下的決策',
          '比賽節奏控制',
        ],
      },
      {
        id: 'a3',
        title: '比賽心理與心態',
        description: '培養冠軍心態',
        duration: '2 小時',
        completed: false,
        keyPoints: [
          '壓力管理技巧',
          '專注力訓練',
          '如何面對失誤',
          '比賽前的心理準備',
        ],
      },
      {
        id: 'a4',
        title: '體能訓練與傷害預防',
        description: '保持最佳狀態',
        duration: '2 小時',
        completed: false,
        keyPoints: [
          '匹克球專項體能',
          '熱身與拉伸',
          '常見運動傷害預防',
          '恢復與休息',
        ],
      },
      {
        id: 'a5',
        title: '教練培訓與教學',
        description: '成為教練，傳承技術',
        duration: '3 小時',
        completed: false,
        keyPoints: [
          '教學方法與技巧',
          '如何設計訓練計劃',
          '錯誤診斷與修正',
          '激勵與溝通',
        ],
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
                        whileHover={{ scale: 1.02, x: 10 }}
                        className={`flex-1 rounded-2xl p-6 transition-all duration-300 ${isCompleted
                            ? `bg-gradient-to-r ${selectedPathData.gradient} text-white shadow-lg`
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-3">
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

                        <div className="flex items-center space-x-4 text-sm">
                          <span className={isCompleted ? 'text-white/80' : 'text-gray-500'}>
                            ⏱️ {lesson.duration}
                          </span>
                          <button
                            onClick={() => handleLessonComplete(lesson.id)}
                            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${isCompleted
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
          <p className="text-lg">👆 點選上方卡片開始你的學習旅程</p>
        </motion.div>
      )}
    </div>
  );
}
