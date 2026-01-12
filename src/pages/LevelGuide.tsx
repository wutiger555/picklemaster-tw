import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

// Level Data
const LEVELS = [
  {
    level: '1.0 - 2.0',
    title: '新手冒險家 (Novice)',
    description: '剛開始接觸匹克球，正在學習規則與基本擊球。',
    skills: [
      '知道如何握拍',
      '了解基本規則 (雙彈跳、廚房區)',
      '能將球打過網 (成功率不高)',
    ],
    improve: [
      '多練習對牆擊球增加球感',
      '參加新手體驗營',
      '觀看規則教學影片',
    ],
    color: 'from-emerald-400 to-teal-500',
    icon: '🌱',
  },
  {
    level: '2.5',
    title: '休閒玩家 (Casual)',
    description: '能進行簡單的來回對打，但穩定性與控制力尚待加強。',
    skills: [
      '能持續進行短暫的來回擊球',
      '知道如何計分',
      '能發球過網 (但深度不一)',
    ],
    improve: [
      '練習「丁克球」(Dink) 的耐心',
      '加強正手拍的穩定度',
      '學習站位移動 (跟隨球移動)',
    ],
    color: 'from-blue-400 to-indigo-500',
    icon: '🚶',
  },
  {
    level: '3.0',
    title: '潛力新星 (Intermediate)',
    description: '熟悉比賽節奏，具備基本的控球能力，開始學習戰術。',
    skills: [
      '中場擊球與截擊成功率尚可',
      '能打出不同深度的發球',
      '試著使用第三球 (Third Shot)',
    ],
    improve: [
      '專注練習「第三球落點」(Third Shot Drop)',
      '減少非受迫性失誤',
      '學習與隊友溝通',
    ],
    color: 'from-violet-400 to-purple-500',
    icon: '⭐',
  },
  {
    level: '3.5',
    title: '競技好手 (Competitor)',
    description: '具備穩定的技術與戰術意識，能針對對手弱點進攻。',
    skills: [
      '穩定的丁克球 (Dink) 能力',
      '能判斷何時進攻、何時防守',
      '第三球成功率高',
    ],
    improve: [
      '練習更具攻擊性的截擊',
      '學習堆疊 (Stacking) 戰術',
      '加強反手拍的攻擊力',
    ],
    color: 'from-amber-400 to-orange-500',
    icon: '🔥',
  },
  {
    level: '4.0',
    title: '戰場大師 (Advanced)',
    description: '擁有全面的技術，能精準控制球的落點與旋轉。',
    skills: [
      '精通各種球路 (上旋、下旋)',
      '極少出現非受迫性失誤',
      '能預判對手動作',
    ],
    improve: [
      '參加高強度比賽累積經驗',
      '針對心理素質進行訓練',
      '微調動作細節',
    ],
    color: 'from-red-400 to-rose-600',
    icon: '👑',
  },
  {
    level: '4.5+',
    title: '傳奇球神 (Pro)',
    description: '職業級水準，技術、體能與心理素質皆達到頂峰。',
    skills: [
      '宰制全場',
      '完美的各項技術',
      '極致的戰術執行力',
    ],
    improve: [
      '保持體能巔峰',
      '創造新的戰術風格',
      '享受比賽',
    ],
    color: 'from-fuchsia-500 to-pink-600',
    icon: '🦄',
  },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "你能穩定地將發球打進對角發球區嗎？",
    yesPoints: 1,
    noPoints: 0,
  },
  {
    id: 2,
    question: "你知道什麼是「雙彈跳規則」與「廚房區」嗎？",
    yesPoints: 1,
    noPoints: 0,
  },
  {
    id: 3,
    question: "在網前對打 (Dinking) 時，你能保持耐心超過 5 拍不失誤嗎？",
    yesPoints: 2,
    noPoints: 0,
  },
  {
    id: 4,
    question: "你會使用「第三球落點」(Third Shot Drop) 讓球輕輕過網掉進廚房嗎？",
    yesPoints: 3,
    noPoints: 0,
  },
  {
    id: 5,
    question: "面對對手的強力殺球，你能穩定地擋回去 (Block) 嗎？",
    yesPoints: 2,
    noPoints: 0,
  },
  {
    id: 6,
    question: "你會使用上旋球 (Topspin) 或下旋球 (Slice) 來改變節奏嗎？",
    yesPoints: 3,
    noPoints: 0,
  },
  {
    id: 7,
    question: "比賽中，你能觀察對手弱點並制定戰術嗎？",
    yesPoints: 3,
    noPoints: 0,
  },
];

const LevelGuide = () => {
  const [activeTab, setActiveTab] = useState<'guide' | 'quiz'>('guide');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setQuizFinished(false);
  };

  const handleAnswer = (points: number) => {
    const newScore = score + points;
    setScore(newScore);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const getCalculatedLevel = (finalScore: number) => {
    if (finalScore <= 2) return LEVELS[0]; // 1.0-2.0
    if (finalScore <= 4) return LEVELS[1]; // 2.5
    if (finalScore <= 8) return LEVELS[2]; // 3.0
    if (finalScore <= 11) return LEVELS[3]; // 3.5
    if (finalScore <= 13) return LEVELS[4]; // 4.0
    return LEVELS[5]; // 4.5+
  };

  const resultLevel = getCalculatedLevel(score);

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-emerald-900 text-white py-20 mb-12">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1599474924187-334a4ae513df?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6"
          >
            你是哪個等級的
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300"> 匹克球大師</span>？
          </motion.h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-8">
            從 1.0 新手到 5.0 職業選手，了解分級制度，找到你的修練目標！
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'guide' ? 'bg-white text-emerald-900' : 'bg-emerald-800/50 text-white hover:bg-emerald-800'}`}
            >
              等級圖鑑
            </button>
            <button
              onClick={() => { setActiveTab('quiz'); handleStartQuiz(); }}
              className={`px-8 py-3 rounded-full font-bold transition-all flex items-center space-x-2 ${activeTab === 'quiz' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg' : 'bg-emerald-800/50 text-white hover:bg-emerald-800'}`}
            >
              <span>測測看</span>
              <span>✨</span>
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6">
        {activeTab === 'guide' ? (
          <div className="grid gap-8">
            {LEVELS.map((lvl, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-100 group hover:shadow-2xl transition-all duration-300"
              >
                <div className="grid md:grid-cols-[1fr_2fr] min-h-[300px]">
                  {/* Visual Side */}
                  <div className={`bg-gradient-to-br ${lvl.color} p-8 flex flex-col justify-center items-center text-white relative overflow-hidden`}>
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 rotate-12 scale-150 transform origin-top-right group-hover:rotate-45 transition-transform duration-700" />
                    <span className="text-8xl mb-4 relative z-10 filter drop-shadow-md">{lvl.icon}</span>
                    <h2 className="text-4xl font-black relative z-10">{lvl.level}</h2>
                    <p className="text-lg font-bold opacity-90 relative z-10">{lvl.title}</p>
                  </div>

                  {/* Content Side */}
                  <div className="p-8 flex flex-col justify-center">
                    <p className="text-xl text-neutral-600 mb-6 leading-relaxed">
                      {lvl.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-emerald-700 font-bold mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          必備技能
                        </h3>
                        <ul className="space-y-2">
                          {lvl.skills.map((skill, i) => (
                            <li key={i} className="text-neutral-600 text-sm flex items-start">
                              <span className="w-1.5 h-1.5 bg-emerald-200 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-amber-600 font-bold mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          升級攻略
                        </h3>
                        <ul className="space-y-2">
                          {lvl.improve.map((tip, i) => (
                            <li key={i} className="text-neutral-600 text-sm flex items-start">
                              <span className="w-1.5 h-1.5 bg-amber-200 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="text-center mt-12 bg-emerald-50 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-emerald-900 mb-4">想更上一層樓？</h3>
              <p className="text-neutral-600 mb-6">查看我們的系統化學習路徑，幫你快速升級！</p>
              <Link
                to={ROUTES.LEARNING_PATHS}
                className="inline-block px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                前往學習路徑
              </Link>
            </div>
          </div>
        ) : (
          /* Quiz Section */
          <div className="max-w-3xl mx-auto">
            {!quizStarted ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                <span className="text-6xl mb-6 block">🤔</span>
                <h2 className="text-3xl font-bold text-neutral-800 mb-4">30 秒找出你的匹克球等級</h2>
                <p className="text-neutral-600 mb-8">透過 7 個簡單的問題，讓我們幫你分析目前的實力落點。</p>
                <button
                  onClick={handleStartQuiz}
                  className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg"
                >
                  開始測驗
                </button>
              </div>
            ) : !quizFinished ? (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-bold text-emerald-600 tracking-wider">
                    QUESTION {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                  <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-12 leading-tight">
                  {QUIZ_QUESTIONS[currentQuestion].question}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswer(QUIZ_QUESTIONS[currentQuestion].noPoints)}
                    className="p-6 border-2 border-neutral-200 rounded-2xl text-xl font-bold text-neutral-500 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    還不太行 🙅
                  </button>
                  <button
                    onClick={() => handleAnswer(QUIZ_QUESTIONS[currentQuestion].yesPoints)}
                    className="p-6 border-2 border-neutral-200 rounded-2xl text-xl font-bold text-neutral-500 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    沒問題 👌
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${resultLevel.color} p-12 text-center text-white`}>
                  <p className="font-bold text-white/80 mb-2 tracking-widest">測驗結果</p>
                  <div className="text-9xl mb-4 filter drop-shadow-lg">{resultLevel.icon}</div>
                  <h2 className="text-5xl font-black mb-2">{resultLevel.title}</h2>
                  <p className="text-2xl font-bold opacity-90">Level {resultLevel.level}</p>
                </div>
                <div className="p-12 text-center">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">給你的建議</h3>
                  <p className="text-neutral-600 mb-8 max-w-lg mx-auto leading-relaxed">
                    {resultLevel.description}
                  </p>

                  <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                    <button
                      onClick={handleStartQuiz}
                      className="px-8 py-3 border-2 border-neutral-200 rounded-xl font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      重新測驗
                    </button>
                    <Link
                      to={ROUTES.LEARNING}
                      className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                    >
                      開始特訓
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelGuide;
