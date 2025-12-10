import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';

// 測驗題目
const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: '匹克球的「廚房區」是指什麼？',
        options: [
            { id: 'a', text: '選手休息區' },
            { id: 'b', text: '發球區域' },
            { id: 'c', text: '禁止截擊的區域' },
            { id: 'd', text: '記分區域' },
        ],
        correct: 'c',
        explanation: '廚房區（Kitchen）是匹克球專有名詞，正式名稱為「Non-Volley Zone」（NVZ），指的是距離網子 7 英尺（約 2.13 公尺）的區域。在此區域內不能進行截擊（球未落地就擊球）。',
    },
    {
        id: 2,
        question: '匹克球的「雙彈跳規則」是什麼意思？',
        options: [
            { id: 'a', text: '球必須彈跳兩次才能得分' },
            { id: 'b', text: '發球後接發球回擊，雙方各讓球彈地一次' },
            { id: 'c', text: '每次擊球都要讓球彈兩次' },
            { id: 'd', text: '比賽中球可以彈跳兩次' },
        ],
        correct: 'b',
        explanation: '雙彈跳規則（Two-Bounce Rule）是指：發球後接發球方必須讓球彈地後才能擊球，發球方的第一次回擊也必須讓球彈地後才能擊球。這個規則防止發球方立即搶網得分。',
    },
    {
        id: 3,
        question: '匹克球發球時，球拍接觸球的位置需在哪裡？',
        options: [
            { id: 'a', text: '頭部以上' },
            { id: 'b', text: '肩膀高度' },
            { id: 'c', text: '腰部以下' },
            { id: 'd', text: '沒有限制' },
        ],
        correct: 'c',
        explanation: '匹克球規定發球必須是「低手發球」（Underhand Serve），球拍接觸球時必須在腰部以下。這與網球的上手發球不同，讓發球更容易掌握。',
    },
    {
        id: 4,
        question: '匹克球雙打比賽中，報分時需要報幾個數字？',
        options: [
            { id: 'a', text: '1 個' },
            { id: 'b', text: '2 個' },
            { id: 'c', text: '3 個' },
            { id: 'd', text: '4 個' },
        ],
        correct: 'c',
        explanation: '雙打報分時需報 3 個數字：己方比分、對方比分、發球員編號（1 或 2）。例如「3-2-1」表示我方 3 分、對方 2 分、目前是第一發球員發球。',
    },
    {
        id: 5,
        question: '匹克球發球碰網後落入正確發球區，這球算什麼？',
        options: [
            { id: 'a', text: '失誤，對方得分' },
            { id: 'b', text: '有效，比賽繼續' },
            { id: 'c', text: '重發' },
            { id: 'd', text: '發球方得分' },
        ],
        correct: 'b',
        explanation: '與網球不同，匹克球的發球碰網後只要落入正確的發球區就算有效（Let Serve），比賽會繼續進行，無需重發。',
    },
    {
        id: 6,
        question: '匹克球比賽一般打到幾分結束？',
        options: [
            { id: 'a', text: '11 分' },
            { id: 'b', text: '15 分' },
            { id: 'c', text: '21 分' },
            { id: 'd', text: '25 分' },
        ],
        correct: 'a',
        explanation: '一般匹克球比賽打到 11 分，且必須領先對手 2 分才能獲勝。如果比分來到 10-10，比賽會繼續直到一方領先 2 分。',
    },
];

const Quiz = () => {
    usePageTitle('匹克球知識測驗');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleAnswer = (optionId: string) => {
        if (showResult) return;
        setSelectedAnswer(optionId);
        setShowResult(true);

        if (optionId === QUIZ_QUESTIONS[currentQuestion].correct) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setQuizCompleted(false);
    };

    const question = QUIZ_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen">
            <SEOHead
                page="learning"
                customTitle="知識測驗 - 檢驗你的匹克球學習成果"
                customDescription="6 題快問快答互動測驗，測試你對匹克球規則的了解程度，每題都有詳細解說。"
            />

            {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[40vh] flex items-center overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute right-[10%] top-1/2 -translate-y-1/2 text-[150px] opacity-20"
                >
                    ✏️
                </motion.div>

                <div className="container mx-auto px-6 md:px-12 relative z-10 py-16">
                    <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
                        <Link to={ROUTES.HOME} className="hover:text-white transition-colors">首頁</Link>
                        <span>/</span>
                        <Link to={ROUTES.LEARNING} className="hover:text-white transition-colors">學習中心</Link>
                        <span>/</span>
                        <span className="text-white">知識測驗</span>
                    </nav>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <span className="inline-flex items-center gap-2 text-purple-200 font-bold text-sm mb-4">
                            <span className="w-8 h-0.5 bg-yellow-400" />
                            QUIZ
                        </span>

                        <h1 className="text-5xl md:text-6xl font-black text-white leading-[0.95] mb-4">
                            知識測驗
                        </h1>

                        <p className="text-xl text-purple-100">
                            {QUIZ_QUESTIONS.length} 題快問快答，檢驗你的學習成果
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
          測驗區
      ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-24 bg-neutral-50">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-3xl mx-auto">
                        <AnimatePresence mode="wait">
                            {!quizCompleted ? (
                                <motion.div
                                    key={currentQuestion}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    {/* 進度條 */}
                                    <div className="mb-8">
                                        <div className="flex justify-between text-sm text-neutral-500 mb-2">
                                            <span>問題 {currentQuestion + 1} / {QUIZ_QUESTIONS.length}</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-2 bg-neutral-200 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {/* 題目 */}
                                    <div className="bg-white p-8 md:p-12 mb-8">
                                        <span className="text-6xl font-black text-violet-200 block mb-4">
                                            Q{currentQuestion + 1}
                                        </span>
                                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8">
                                            {question.question}
                                        </h2>

                                        {/* 選項 */}
                                        <div className="space-y-3">
                                            {question.options.map((option) => {
                                                const isCorrect = option.id === question.correct;
                                                const isSelected = option.id === selectedAnswer;

                                                let bgColor = 'bg-neutral-100 hover:bg-neutral-200';
                                                if (showResult) {
                                                    if (isCorrect) {
                                                        bgColor = 'bg-emerald-500 text-white';
                                                    } else if (isSelected && !isCorrect) {
                                                        bgColor = 'bg-rose-500 text-white';
                                                    } else {
                                                        bgColor = 'bg-neutral-100';
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => handleAnswer(option.id)}
                                                        disabled={showResult}
                                                        className={`w-full text-left p-5 transition-all ${bgColor} ${!showResult ? 'cursor-pointer' : 'cursor-default'
                                                            }`}
                                                    >
                                                        <span className="font-bold mr-3">{option.id.toUpperCase()}.</span>
                                                        {option.text}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 解說 */}
                                    <AnimatePresence>
                                        {showResult && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-6 mb-8 ${selectedAnswer === question.correct
                                                        ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                                        : 'bg-rose-50 border-l-4 border-rose-500'
                                                    }`}
                                            >
                                                <p className={`font-bold text-lg mb-2 ${selectedAnswer === question.correct ? 'text-emerald-600' : 'text-rose-600'
                                                    }`}>
                                                    {selectedAnswer === question.correct ? '✓ 答對了！' : '✗ 答錯了！'}
                                                </p>
                                                <p className="text-neutral-600 leading-relaxed">
                                                    {question.explanation}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* 下一題按鈕 */}
                                    {showResult && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center"
                                        >
                                            <button
                                                onClick={handleNext}
                                                className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white font-bold text-lg hover:bg-violet-700 transition-colors"
                                            >
                                                {currentQuestion < QUIZ_QUESTIONS.length - 1 ? '下一題' : '查看結果'}
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                /* 結果頁面 */
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className={`py-16 px-8 mb-8 ${score === QUIZ_QUESTIONS.length
                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                            : score >= QUIZ_QUESTIONS.length * 0.6
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                                : 'bg-gradient-to-br from-violet-500 to-purple-500'
                                        }`}>
                                        <div className="text-8xl mb-6">
                                            {score === QUIZ_QUESTIONS.length ? '🏆' : score >= QUIZ_QUESTIONS.length * 0.6 ? '🎉' : '📚'}
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                                            {score === QUIZ_QUESTIONS.length
                                                ? '完美！'
                                                : score >= QUIZ_QUESTIONS.length * 0.6
                                                    ? '很棒！'
                                                    : '加油！'}
                                        </h2>
                                        <p className="text-2xl text-white/90 mb-2">
                                            你答對了 <span className="font-black">{score}</span> / {QUIZ_QUESTIONS.length} 題
                                        </p>
                                        <p className="text-white/70">
                                            {score === QUIZ_QUESTIONS.length
                                                ? '你已經完全掌握匹克球規則！'
                                                : score >= QUIZ_QUESTIONS.length * 0.6
                                                    ? '繼續加油，你很快就能成為專家！'
                                                    : '建議複習一下規則教學，再來挑戰！'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={handleRestart}
                                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 text-white font-bold text-lg hover:bg-violet-700 transition-colors"
                                        >
                                            🔄 再測一次
                                        </button>
                                        <Link
                                            to={ROUTES.RULES}
                                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
                                        >
                                            📖 複習規則
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
          相關連結
      ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div>
                            <h2 className="text-2xl font-black text-neutral-900 mb-2">繼續學習</h2>
                            <p className="text-neutral-500">測驗完了，繼續深入學習</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to={ROUTES.RULES}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                            >
                                📖 規則教學
                            </Link>
                            <Link
                                to={ROUTES.TECHNIQUES}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors"
                            >
                                🎯 技巧教學
                            </Link>
                            <Link
                                to={ROUTES.COURTS}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                            >
                                📍 找球場開打
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Quiz;
