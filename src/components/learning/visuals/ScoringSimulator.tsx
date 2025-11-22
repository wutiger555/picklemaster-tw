import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ScoringSimulator() {
    const [serverScore, setServerScore] = useState(10);
    const [receiverScore, setReceiverScore] = useState(10);
    const [gameStatus, setGameStatus] = useState<'playing' | 'server_win' | 'receiver_win'>('playing');

    const checkWin = (s: number, r: number) => {
        if (s >= 11 && s >= r + 2) return 'server_win';
        if (r >= 11 && r >= s + 2) return 'receiver_win';
        return 'playing';
    };

    const handleScore = (winner: 'server' | 'receiver') => {
        if (gameStatus !== 'playing') return;

        let newServerScore = serverScore;
        let newReceiverScore = receiverScore;

        if (winner === 'server') {
            newServerScore += 1;
        } else {
            newReceiverScore += 1;
        }

        setServerScore(newServerScore);
        setReceiverScore(newReceiverScore);
        setGameStatus(checkWin(newServerScore, newReceiverScore));
    };

    const resetGame = () => {
        setServerScore(10);
        setReceiverScore(10);
        setGameStatus('playing');
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200 text-center">
            <h3 className="text-xl font-bold mb-2 text-neutral-900">計分模擬器：連得兩分 (Win by 2)</h3>
            <p className="text-sm text-gray-500 mb-6">從 10-10 平手開始，體驗如何才能贏得比賽</p>

            <div className="flex justify-center items-center space-x-8 mb-8">
                {/* Server Score */}
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-blue-600 mb-2">我方 (發球)</span>
                    <motion.div
                        key={serverScore}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center text-5xl font-black text-blue-800"
                    >
                        {serverScore}
                    </motion.div>
                </div>

                <div className="text-2xl font-bold text-gray-300">-</div>

                {/* Receiver Score */}
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-red-600 mb-2">對方</span>
                    <motion.div
                        key={receiverScore}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center text-5xl font-black text-red-800"
                    >
                        {receiverScore}
                    </motion.div>
                </div>
            </div>

            {/* Controls */}
            {gameStatus === 'playing' ? (
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleScore('server')}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-colors"
                    >
                        我方得分 (+1)
                    </button>
                    <button
                        onClick={() => handleScore('receiver')}
                        className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors"
                    >
                        對方得分 (+1)
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className={`p-4 rounded-xl font-bold text-lg ${gameStatus === 'server_win' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {gameStatus === 'server_win' ? '🎉 我方獲勝！' : '😢 對方獲勝'}
                    </div>
                    <button
                        onClick={resetGame}
                        className="text-gray-500 hover:text-gray-700 underline text-sm"
                    >
                        重新開始 (10-10)
                    </button>
                </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm text-left text-yellow-800">
                💡 <strong>規則重點：</strong> 匹克球比賽通常是打到 11 分，但必須「領先 2 分」才能獲勝。如果打到 10-10，比賽會繼續進行（11-10 還沒贏），直到一方領先兩分為止（例如 12-10, 13-11）。
            </div>
        </div>
    );
}
