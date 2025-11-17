import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';

type ServingSide = 'team1' | 'team2';
type Server = 1 | 2;

interface GameState {
  team1Score: number;
  team2Score: number;
  servingSide: ServingSide;
  server: Server;
  targetScore: number;
  isDoubles: boolean;
}

const Scorer = () => {
  usePageTitle('匹克球計分器');

  const [gameState, setGameState] = useState<GameState>({
    team1Score: 0,
    team2Score: 0,
    servingSide: 'team1',
    server: 1,
    targetScore: 11,
    isDoubles: true,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showSettings, setShowSettings] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 檢測螢幕方向
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.innerWidth > window.innerHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  // 計時器
  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // 格式化時間
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 螢幕常亮
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);

        lock.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
      }
    } catch (err) {
      console.error('Wake Lock error:', err);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  // 全螢幕
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        await requestWakeLock();
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        await releaseWakeLock();
      }
    }
  }, [requestWakeLock, releaseWakeLock]);

  // 檢查是否獲勝
  const checkWin = (score: number, opponentScore: number) => {
    return score >= gameState.targetScore && score - opponentScore >= 2;
  };

  // 加分邏輯
  const addScore = (team: 'team1' | 'team2') => {
    if (gameState.servingSide !== team) return; // 只有發球方能得分

    const newState = { ...gameState };

    if (team === 'team1') {
      newState.team1Score += 1;

      if (checkWin(newState.team1Score, newState.team2Score)) {
        alert('🎉 Team 1 獲勝！');
        return;
      }

      // 得分後在雙打中交換發球員位置
      // 但不改變發球方
    } else {
      newState.team2Score += 1;

      if (checkWin(newState.team2Score, newState.team1Score)) {
        alert('🎉 Team 2 獲勝！');
        return;
      }
    }

    setGameState(newState);
  };

  // 減分（誤觸修正）
  const subtractScore = (team: 'team1' | 'team2') => {
    setGameState(prev => ({
      ...prev,
      [team === 'team1' ? 'team1Score' : 'team2Score']:
        Math.max(0, team === 'team1' ? prev.team1Score - 1 : prev.team2Score - 1),
    }));
  };

  // 換發球
  const switchServe = () => {
    setGameState(prev => {
      const newState = { ...prev };

      if (prev.isDoubles) {
        // 雙打規則
        if (prev.server === 1) {
          // 第一發球員失分，換第二發球員
          newState.server = 2;
        } else {
          // 第二發球員失分，換對方發球
          newState.servingSide = prev.servingSide === 'team1' ? 'team2' : 'team1';
          newState.server = 1;
        }
      } else {
        // 單打規則
        newState.servingSide = prev.servingSide === 'team1' ? 'team2' : 'team1';
      }

      return newState;
    });
  };

  // 重置比賽
  const resetGame = () => {
    if (confirm('確定要重置比賽嗎？')) {
      setGameState({
        team1Score: 0,
        team2Score: 0,
        servingSide: 'team1',
        server: 1,
        targetScore: gameState.targetScore,
        isDoubles: gameState.isDoubles,
      });
      setGameTime(0);
      setIsTimerRunning(false);
    }
  };

  // 橫屏佈局
  const LandscapeLayout = () => (
    <div className="flex h-screen w-screen bg-gradient-to-r from-pickleball-500 to-sport-500">
      {/* Team 1 (Left) */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4">
        <div className="text-center w-full">
          {/* 發球指示 */}
          <AnimatePresence>
            {gameState.servingSide === 'team1' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4"
              >
                <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-2xl font-bold">
                  🏓 發球方 {gameState.isDoubles && `(發球員 ${gameState.server})`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 分數 */}
          <motion.div
            key={gameState.team1Score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-[20rem] font-black leading-none mb-8"
          >
            {gameState.team1Score}
          </motion.div>

          {/* 控制按鈕 */}
          <div className="space-y-4">
            <button
              onClick={() => addScore('team1')}
              disabled={gameState.servingSide !== 'team1'}
              className={`w-48 h-24 text-3xl font-bold rounded-2xl transition-all shadow-2xl
                ${gameState.servingSide === 'team1'
                  ? 'bg-green-500 hover:bg-green-600 active:scale-95'
                  : 'bg-gray-500 opacity-50 cursor-not-allowed'
                }`}
            >
              +1
            </button>
            <button
              onClick={() => subtractScore('team1')}
              className="w-48 h-16 text-2xl font-bold bg-red-500 hover:bg-red-600 rounded-2xl transition-all active:scale-95 shadow-lg"
            >
              -1
            </button>
          </div>
        </div>
      </div>

      {/* 中間控制區 */}
      <div className="w-20 flex flex-col items-center justify-between py-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          {/* 計時器 */}
          <div className="text-white text-center">
            <div className="text-2xl font-bold">{formatTime(gameTime)}</div>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="mt-2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
            >
              {isTimerRunning ? '⏸' : '▶'}
            </button>
          </div>

          {/* 換發球 */}
          <button
            onClick={switchServe}
            className="w-16 h-16 bg-yellow-500 hover:bg-yellow-600 rounded-full text-2xl font-bold transition-all active:scale-95 shadow-lg"
            title="換發球"
          >
            ⇄
          </button>

          {/* 設定 */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full text-2xl transition-all active:scale-95"
            title="設定"
          >
            ⚙️
          </button>

          {/* 全螢幕 */}
          <button
            onClick={toggleFullscreen}
            className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full text-2xl transition-all active:scale-95"
            title="全螢幕"
          >
            {isFullscreen ? '⊗' : '⛶'}
          </button>

          {/* 重置 */}
          <button
            onClick={resetGame}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full text-2xl font-bold transition-all active:scale-95 shadow-lg"
            title="重置"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Team 2 (Right) */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-red-700 text-white p-4">
        <div className="text-center w-full">
          {/* 發球指示 */}
          <AnimatePresence>
            {gameState.servingSide === 'team2' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4"
              >
                <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-2xl font-bold">
                  🏓 發球方 {gameState.isDoubles && `(發球員 ${gameState.server})`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 分數 */}
          <motion.div
            key={gameState.team2Score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-[20rem] font-black leading-none mb-8"
          >
            {gameState.team2Score}
          </motion.div>

          {/* 控制按鈕 */}
          <div className="space-y-4">
            <button
              onClick={() => addScore('team2')}
              disabled={gameState.servingSide !== 'team2'}
              className={`w-48 h-24 text-3xl font-bold rounded-2xl transition-all shadow-2xl
                ${gameState.servingSide === 'team2'
                  ? 'bg-green-500 hover:bg-green-600 active:scale-95'
                  : 'bg-gray-500 opacity-50 cursor-not-allowed'
                }`}
            >
              +1
            </button>
            <button
              onClick={() => subtractScore('team2')}
              className="w-48 h-16 text-2xl font-bold bg-red-500 hover:bg-red-600 rounded-2xl transition-all active:scale-95 shadow-lg"
            >
              -1
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 直屏佈局
  const PortraitLayout = () => (
    <div className="flex flex-col min-h-screen w-screen bg-gradient-to-b from-pickleball-500 to-sport-500">
      {/* Team 1 (Top) */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4">
        <div className="text-center w-full">
          {/* 發球指示 */}
          <AnimatePresence>
            {gameState.servingSide === 'team1' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4"
              >
                <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-xl font-bold">
                  🏓 發球方 {gameState.isDoubles && `(發球員 ${gameState.server})`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 分數 */}
          <motion.div
            key={gameState.team1Score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-[12rem] sm:text-[15rem] font-black leading-none mb-6"
          >
            {gameState.team1Score}
          </motion.div>

          {/* 控制按鈕 */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => addScore('team1')}
              disabled={gameState.servingSide !== 'team1'}
              className={`w-32 h-20 text-2xl font-bold rounded-2xl transition-all shadow-2xl
                ${gameState.servingSide === 'team1'
                  ? 'bg-green-500 hover:bg-green-600 active:scale-95'
                  : 'bg-gray-500 opacity-50 cursor-not-allowed'
                }`}
            >
              +1
            </button>
            <button
              onClick={() => subtractScore('team1')}
              className="w-24 h-20 text-xl font-bold bg-red-500 hover:bg-red-600 rounded-2xl transition-all active:scale-95 shadow-lg"
            >
              -1
            </button>
          </div>
        </div>
      </div>

      {/* 中間控制區 */}
      <div className="h-20 flex items-center justify-center gap-4 bg-gray-900/50 backdrop-blur-sm px-4">
        {/* 計時器 */}
        <div className="text-white text-center flex items-center gap-2">
          <div className="text-xl font-bold">{formatTime(gameTime)}</div>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
          >
            {isTimerRunning ? '⏸' : '▶'}
          </button>
        </div>

        {/* 換發球 */}
        <button
          onClick={switchServe}
          className="w-14 h-14 bg-yellow-500 hover:bg-yellow-600 rounded-full text-xl font-bold transition-all active:scale-95 shadow-lg"
          title="換發球"
        >
          ⇄
        </button>

        {/* 設定 */}
        <button
          onClick={() => setShowSettings(true)}
          className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full text-xl transition-all active:scale-95"
          title="設定"
        >
          ⚙️
        </button>

        {/* 全螢幕 */}
        <button
          onClick={toggleFullscreen}
          className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full text-xl transition-all active:scale-95"
          title="全螢幕"
        >
          {isFullscreen ? '⊗' : '⛶'}
        </button>

        {/* 重置 */}
        <button
          onClick={resetGame}
          className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full text-xl font-bold transition-all active:scale-95 shadow-lg"
          title="重置"
        >
          ↻
        </button>
      </div>

      {/* Team 2 (Bottom) */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-red-700 text-white p-4">
        <div className="text-center w-full">
          {/* 控制按鈕 */}
          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={() => addScore('team2')}
              disabled={gameState.servingSide !== 'team2'}
              className={`w-32 h-20 text-2xl font-bold rounded-2xl transition-all shadow-2xl
                ${gameState.servingSide === 'team2'
                  ? 'bg-green-500 hover:bg-green-600 active:scale-95'
                  : 'bg-gray-500 opacity-50 cursor-not-allowed'
                }`}
            >
              +1
            </button>
            <button
              onClick={() => subtractScore('team2')}
              className="w-24 h-20 text-xl font-bold bg-red-500 hover:bg-red-600 rounded-2xl transition-all active:scale-95 shadow-lg"
            >
              -1
            </button>
          </div>

          {/* 分數 */}
          <motion.div
            key={gameState.team2Score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-[12rem] sm:text-[15rem] font-black leading-none mb-4"
          >
            {gameState.team2Score}
          </motion.div>

          {/* 發球指示 */}
          <AnimatePresence>
            {gameState.servingSide === 'team2' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-4"
              >
                <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-xl font-bold">
                  🏓 發球方 {gameState.isDoubles && `(發球員 ${gameState.server})`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {orientation === 'landscape' ? <LandscapeLayout /> : <PortraitLayout />}

      {/* 設定彈窗 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-3xl font-black mb-6 text-gray-800">比賽設定</h2>

              <div className="space-y-6">
                {/* 比賽類型 */}
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">比賽類型</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, isDoubles: true }))}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                        gameState.isDoubles
                          ? 'bg-pickleball-500 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      雙打
                    </button>
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, isDoubles: false, server: 1 }))}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                        !gameState.isDoubles
                          ? 'bg-pickleball-500 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      單打
                    </button>
                  </div>
                </div>

                {/* 目標分數 */}
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">目標分數</label>
                  <div className="flex gap-3">
                    {[11, 15, 21].map(score => (
                      <button
                        key={score}
                        onClick={() => setGameState(prev => ({ ...prev, targetScore: score }))}
                        className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                          gameState.targetScore === score
                            ? 'bg-pickleball-500 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 說明 */}
                <div className="bg-pickleball-50 rounded-xl p-4">
                  <h3 className="font-bold text-pickleball-800 mb-2">計分規則說明</h3>
                  <ul className="text-sm text-pickleball-700 space-y-1">
                    <li>• 只有發球方可以得分</li>
                    <li>• 必須贏對手至少 2 分才算獲勝</li>
                    <li>• 雙打時每方有兩次發球機會</li>
                    <li>• 點擊「⇄」按鈕換發球</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-8 bg-gradient-to-r from-pickleball-500 to-sport-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
              >
                確定
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Scorer;
