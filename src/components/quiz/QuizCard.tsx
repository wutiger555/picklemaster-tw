import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: '匹克球場地的非截擊區（廚房區）距離球網多遠？',
    options: ['5 英尺', '7 英尺', '10 英尺', '15 英尺'],
    correctAnswer: 1,
    explanation: '非截擊區（Kitchen）距離球網 7 英尺，在此區域內不能進行截擊（凌空擊球）。',
  },
  {
    id: 2,
    question: '發球時必須採用什麼方式？',
    options: ['上手發球', '下手發球', '側手發球', '任何方式'],
    correctAnswer: 1,
    explanation: '匹克球規定必須使用下手發球（Underhand Serve），球拍接觸球時必須低於腰部。',
  },
  {
    id: 3,
    question: '雙打比賽中，每方最多可以發球幾次後換邊？',
    options: ['1 次', '2 次', '3 次', '無限制'],
    correctAnswer: 1,
    explanation: '雙打比賽中，除了比賽開始時發球方只有一次發球機會外，之後每方都有兩次發球機會。',
  },
  {
    id: 4,
    question: '比賽通常採用幾分制？',
    options: ['7 分', '11 分', '15 分', '21 分'],
    correctAnswer: 1,
    explanation: '標準比賽採用 11 分制，必須領先 2 分才能獲勝。部分賽事也會採用 15 分或 21 分制。',
  },
];

export default function QuizCard() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-gradient-to-br from-pickleball-500 to-sport-500 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-7xl mb-6"
          >
            {score === sampleQuestions.length ? '🏆' : score >= sampleQuestions.length / 2 ? '🎉' : '💪'}
          </motion.div>

          <h2 className="text-4xl font-black mb-4">測驗完成！</h2>
          <p className="text-2xl mb-8">
            你答對了 <span className="font-black text-5xl">{score}</span> / {sampleQuestions.length} 題
          </p>

          <div className="mb-8">
            {score === sampleQuestions.length && (
              <p className="text-xl">完美！你是匹克球規則專家！</p>
            )}
            {score >= sampleQuestions.length / 2 && score < sampleQuestions.length && (
              <p className="text-xl">做得不錯！繼續加油！</p>
            )}
            {score < sampleQuestions.length / 2 && (
              <p className="text-xl">還需要多練習，加油！</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRestart}
            className="bg-white text-pickleball-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            重新測驗
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 進度條 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600">
            題目 {currentQuestionIndex + 1} / {sampleQuestions.length}
          </span>
          <span className="text-sm font-semibold text-pickleball-600">
            得分: {score}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / sampleQuestions.length) * 100}%` }}
            className="bg-gradient-to-r from-pickleball-500 to-sport-500 h-full rounded-full"
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ x: 300, opacity: 0, rotateY: -20 }}
          animate={{ x: 0, opacity: 1, rotateY: 0 }}
          exit={{ x: -300, opacity: 0, rotateY: 20 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* 問題卡片 */}
          <div className="bg-gradient-to-br from-pickleball-500 to-sport-500 text-white p-8">
            <h3 className="text-2xl md:text-3xl font-bold leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          {/* 選項 */}
          <div className="p-8 space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = showExplanation;

              let buttonClass = 'bg-gray-100 hover:bg-gray-200 text-gray-800';

              if (showResult) {
                if (isCorrect) {
                  buttonClass = 'bg-green-500 text-white';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'bg-red-500 text-white';
                } else {
                  buttonClass = 'bg-gray-100 text-gray-400';
                }
              } else if (isSelected) {
                buttonClass = 'bg-pickleball-100 text-pickleball-700 border-2 border-pickleball-500';
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null}
                  whileHover={selectedAnswer === null ? { scale: 1.02, x: 10 } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  animate={
                    showResult && !isCorrect && isSelected
                      ? { x: [0, -10, 10, -10, 10, 0] }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                  className={`w-full p-4 rounded-xl font-semibold text-left transition-all duration-300 ${buttonClass} flex items-center justify-between`}
                >
                  <span>{option}</span>
                  {showResult && isCorrect && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-2xl"
                    >
                      ✓
                    </motion.span>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-2xl"
                    >
                      ✗
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* 解釋 */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gradient-to-r from-pickleball-50 to-sport-50 p-6 border-t-2 border-pickleball-200">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">說明</h4>
                      <p className="text-gray-700">{currentQuestion.explanation}</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="mt-6 w-full bg-gradient-to-r from-pickleball-500 to-sport-500 text-white py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300"
                  >
                    {currentQuestionIndex < sampleQuestions.length - 1 ? '下一題 →' : '查看結果'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
