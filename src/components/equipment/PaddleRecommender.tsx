import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Answer {
  value: string;
  label: string;
  icon: string;
}

interface Question {
  id: string;
  question: string;
  answers: Answer[];
}

interface Recommendation {
  type: string;
  icon: string;
  title: string;
  description: string;
  specs: {
    weight: string;
    type: string;
    core: string;
    surface: string;
    budget: string;
  };
  brands: string[];
  whyThisChoice: string[];
  source: string;
}

const PaddleRecommender = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const questions: Question[] = [
    {
      id: 'level',
      question: '你的匹克球程度如何？',
      answers: [
        { value: 'beginner', label: '初學者（剛開始玩，不到 6 個月）', icon: '🌱' },
        { value: 'intermediate', label: '中階球員（6 個月 - 2 年）', icon: '🎯' },
        { value: 'advanced', label: '進階球員（2 年以上）', icon: '🏆' },
      ],
    },
    {
      id: 'style',
      question: '你喜歡什麼樣的打法風格？',
      answers: [
        { value: 'power', label: '進攻型（喜歡強力擊球和扣殺）', icon: '💥' },
        { value: 'control', label: '技術型（重視精準控球和擺放）', icon: '🎯' },
        { value: 'balanced', label: '還不確定 / 全方位', icon: '⚖️' },
      ],
    },
    {
      id: 'frequency',
      question: '你打球的頻率如何？',
      answers: [
        { value: 'casual', label: '休閒娛樂（每月 1-2 次）', icon: '🌴' },
        { value: 'regular', label: '定期練習（每週 1-2 次）', icon: '📅' },
        { value: 'serious', label: '認真訓練（每週 3 次以上）', icon: '💪' },
      ],
    },
    {
      id: 'budget',
      question: '你的預算範圍？',
      answers: [
        { value: 'low', label: 'NT$ 2,000 - 4,000（入門級）', icon: '💰' },
        { value: 'mid', label: 'NT$ 4,000 - 8,000（中階級）', icon: '💎' },
        { value: 'high', label: 'NT$ 8,000 以上（高階級）', icon: '👑' },
      ],
    },
    {
      id: 'weight',
      question: '你偏好的球拍重量？',
      answers: [
        { value: 'light', label: '輕量（7.0 - 7.5 oz）- 靈活快速', icon: '🪶' },
        { value: 'medium', label: '中等（7.5 - 8.2 oz）- 平衡', icon: '⚖️' },
        { value: 'heavy', label: '重量（8.2 - 9.0 oz）- 力量強大', icon: '💪' },
      ],
    },
  ];

  const getRecommendation = (): Recommendation => {
    const { level, style, budget } = answers;

    // 初學者推薦
    if (level === 'beginner') {
      return {
        type: 'beginner-balanced',
        icon: '🌱',
        title: '初學者平衡型球拍',
        description: '適合剛入門的球員，提供良好的控制性和容錯率，幫助你快速掌握基本技巧',
        specs: {
          weight: '7.5 - 8.0 oz (213 - 227 g)',
          type: '平衡型',
          core: 'Polymer Honeycomb（靜音、舒適）',
          surface: 'Fiberglass 或 Composite（球感好）',
          budget: 'NT$ 2,500 - 5,000',
        },
        brands: ['Paddletek Tempest Wave', 'Selkirk Latitude', 'HEAD Radical Tour'],
        whyThisChoice: [
          '✅ 平衡的重量讓你不會太累，也有足夠的力量',
          '✅ 較大的甜區（sweet spot）提供更高的容錯率',
          '✅ 價格實惠，適合作為第一支球拍',
          '✅ Polymer 核心提供良好的球感回饋',
        ],
        source: 'USA Pickleball Equipment Recommendations 2024',
      };
    }

    // 中階 + 力量型
    if (level === 'intermediate' && style === 'power') {
      return {
        type: 'intermediate-power',
        icon: '💥',
        title: '中階力量型球拍',
        description: '適合喜歡進攻、想要增加擊球力道的中階球員',
        specs: {
          weight: '8.0 - 8.5 oz (227 - 241 g)',
          type: '力量型',
          core: 'Polymer Honeycomb',
          surface: 'Carbon Fiber 或 Graphite',
          budget: 'NT$ 5,000 - 9,000',
        },
        brands: ['JOOLA Perseus', 'Selkirk Vanguard Power Air', 'CRBN-1 Power Series'],
        whyThisChoice: [
          '✅ 較重的重量提供更強的擊球力道',
          '✅ Carbon Fiber 表面增加球速和旋轉',
          '✅ 適合已有基礎，想要進攻的球員',
          '✅ 專業級材質，耐用度高',
        ],
        source: 'USA Pickleball Equipment Recommendations 2024',
      };
    }

    // 中階 + 控制型
    if (level === 'intermediate' && style === 'control') {
      return {
        type: 'intermediate-control',
        icon: '🎯',
        title: '中階控制型球拍',
        description: '適合重視精準度和球感的技術型球員',
        specs: {
          weight: '7.3 - 7.8 oz (207 - 221 g)',
          type: '控制型',
          core: 'Polymer Honeycomb',
          surface: 'Carbon Fiber 或 Titanium',
          budget: 'NT$ 5,500 - 10,000',
        },
        brands: ['Paddletek Bantam ALW-C', 'ProXR Control', 'Engage Encore Pro'],
        whyThisChoice: [
          '✅ 較輕的重量提供更好的操控性',
          '✅ 優異的球感回饋，精準落點控制',
          '✅ 適合喜歡軟球、放小球的球員',
          '✅ 高品質材質確保長期使用',
        ],
        source: 'USA Pickleball Equipment Recommendations 2024',
      };
    }

    // 進階 + 力量型
    if (level === 'advanced' && style === 'power') {
      return {
        type: 'advanced-power',
        icon: '🚀',
        title: '進階力量型球拍',
        description: '職業級力量型球拍，適合競技型進攻球員',
        specs: {
          weight: '8.2 - 9.0 oz (232 - 255 g)',
          type: '力量型',
          core: 'Polymer Reactive Honeycomb',
          surface: 'Carbon Fiber / Carbon Friction',
          budget: 'NT$ 8,000 - 12,000',
        },
        brands: ['JOOLA Perseus Pro V (Ben Johns)', 'CRBN 1X Power Series', 'Selkirk Vanguard Power Air Invikta'],
        whyThisChoice: [
          '✅ 職業選手級別的材質和工藝',
          '✅ 最大化擊球力道和速度',
          '✅ 先進的 Carbon Friction 表面增加旋轉',
          '✅ 適合參加比賽的進攻型球員',
        ],
        source: 'Professional Players Equipment Data 2024',
      };
    }

    // 進階 + 控制型
    if (level === 'advanced' && style === 'control') {
      return {
        type: 'advanced-control',
        icon: '🎨',
        title: '進階控制型球拍',
        description: '職業級控制型球拍，適合技術純熟的精準型球員',
        specs: {
          weight: '7.0 - 7.8 oz (198 - 221 g)',
          type: '控制型',
          core: 'Polymer Honeycomb',
          surface: 'Raw Carbon Fiber / Titanium',
          budget: 'NT$ 8,500 - 13,000',
        },
        brands: ['Paddletek Bantam ALW-C Pro', 'Engage Pursuit Pro', 'ProXR Signature'],
        whyThisChoice: [
          '✅ 極致的控球精準度和球感',
          '✅ 頂級材質提供卓越的觸球回饋',
          '✅ 適合技術型打法和雙打策略',
          '✅ 職業選手認證的性能',
        ],
        source: 'Professional Players Equipment Data 2024',
      };
    }

    // 預算考量
    if (budget === 'low') {
      return {
        type: 'budget-friendly',
        icon: '💰',
        title: '經濟實惠型球拍',
        description: '性價比高的入門到中階球拍，適合預算有限的球員',
        specs: {
          weight: '7.5 - 8.2 oz (213 - 232 g)',
          type: '平衡型',
          core: 'Polymer Honeycomb',
          surface: 'Fiberglass / Composite',
          budget: 'NT$ 2,000 - 4,000',
        },
        brands: ['HEAD Radical Tour', 'Niupipo Explorer', 'Amazon Basics Pickleball Paddle'],
        whyThisChoice: [
          '✅ 價格實惠，適合初學者嘗試',
          '✅ 基本功能齊全，品質可靠',
          '✅ 適合休閒娛樂使用',
          '✅ 找到自己的打法後再升級',
        ],
        source: 'Budget Paddle Reviews 2024',
      };
    }

    // 預設：平衡型
    return {
      type: 'balanced-allround',
      icon: '⚖️',
      title: '全方位平衡型球拍',
      description: '適合各種打法和程度的萬用球拍',
      specs: {
        weight: '7.8 - 8.2 oz (221 - 232 g)',
        type: '平衡型',
        core: 'Polymer Honeycomb',
        surface: 'Graphite / Carbon Fiber',
        budget: 'NT$ 4,500 - 8,000',
      },
      brands: ['Selkirk Amped S2', 'GAMMA Compass', 'Franklin Ben Johns Signature'],
      whyThisChoice: [
        '✅ 力量與控制兼具',
        '✅ 適應各種打法風格',
        '✅ 中等重量，適合大多數球員',
        '✅ 優質材質，性價比高',
      ],
      source: 'USA Pickleball Equipment Recommendations 2024',
    };
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const recommendation = showResult ? getRecommendation() : null;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-court-600 to-pickleball-600">
          球拍選擇建議工具
        </h2>
        <p className="text-center text-gray-600 mb-8">
          回答幾個簡單問題，找到最適合你的球拍 🎯
        </p>

        {!showResult ? (
          <>
            {/* 進度條 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  問題 {currentQuestion + 1} / {questions.length}
                </span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-sport-500 to-court-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </div>

            {/* 問題 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  {questions[currentQuestion].question}
                </h3>

                <div className="space-y-4">
                  {questions[currentQuestion].answers.map((answer) => (
                    <button
                      key={answer.value}
                      onClick={() => handleAnswer(answer.value)}
                      className="w-full bg-gradient-to-r from-gray-50 to-white hover:from-sport-50 hover:to-court-50 border-2 border-gray-200 hover:border-sport-400 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg text-left group"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                          {answer.icon}
                        </span>
                        <span className="text-lg font-semibold text-gray-800 group-hover:text-sport-700">
                          {answer.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 返回按鈕 */}
            {currentQuestion > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-semibold transition-all duration-300"
                >
                  ← 上一題
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 推薦結果 */}
            <div className="bg-gradient-to-br from-sport-50 via-court-50 to-pickleball-50 rounded-2xl p-8 mb-6">
              <div className="text-center mb-6">
                <div className="text-7xl mb-4">{recommendation!.icon}</div>
                <h3 className="text-3xl font-black text-gray-800 mb-2">{recommendation!.title}</h3>
                <p className="text-lg text-gray-700">{recommendation!.description}</p>
              </div>

              {/* 規格 */}
              <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📊</span>
                  建議規格
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">重量</p>
                    <p className="font-semibold text-gray-800">{recommendation!.specs.weight}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">類型</p>
                    <p className="font-semibold text-gray-800">{recommendation!.specs.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">核心</p>
                    <p className="font-semibold text-gray-800">{recommendation!.specs.core}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">表面</p>
                    <p className="font-semibold text-gray-800">{recommendation!.specs.surface}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">預算範圍</p>
                    <p className="font-bold text-xl text-sport-600">{recommendation!.specs.budget}</p>
                  </div>
                </div>
              </div>

              {/* 為什麼推薦這個選擇 */}
              <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💡</span>
                  為什麼推薦這個選擇？
                </h4>
                <ul className="space-y-3">
                  {recommendation!.whyThisChoice.map((reason, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 推薦品牌/型號 */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🏓</span>
                  推薦品牌與型號
                </h4>
                <div className="flex flex-wrap gap-3">
                  {recommendation!.brands.map((brand, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-sport-100 to-court-100 text-gray-800 rounded-full text-sm font-semibold"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400 italic mt-6 text-center">
                資料來源：{recommendation!.source}
              </p>
            </div>

            {/* 重新測試按鈕 */}
            <div className="text-center">
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-gradient-to-r from-sport-500 to-court-500 text-white rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                🔄 重新測試
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaddleRecommender;
