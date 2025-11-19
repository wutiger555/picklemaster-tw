import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';

type ServingSide = 'team1' | 'team2';

interface GameState {
  team1Score: number;
  team2Score: number;
  servingSide: ServingSide;
  server: 1 | 2;
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

  const [showSettings, setShowSettings] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // 檢測螢幕方向
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };
    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  // 觸覺反饋
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // 檢查是否獲勝
  const checkWin = (score: number, opponentScore: number) => {
    return score >= gameState.targetScore && score - opponentScore >= 2;
  };

  // 加分
  const addScore = (team: 'team1' | 'team2') => {
    if (gameState.servingSide !== team) return;
    vibrate(50);

    setGameState(prev => {
      const newState = { ...prev };
      if (team === 'team1') {
        newState.team1Score += 1;
        if (checkWin(newState.team1Score, newState.team2Score)) {
          vibrate([100, 50, 100]);
          setTimeout(() => {
            if (confirm('Team 1 獲勝！開始新局？')) {
              resetGame();
            }
          }, 300);
        }
      } else {
        newState.team2Score += 1;
        if (checkWin(newState.team2Score, newState.team1Score)) {
          vibrate([100, 50, 100]);
          setTimeout(() => {
            if (confirm('Team 2 獲勝！開始新局？')) {
              resetGame();
            }
          }, 300);
        }
      }
      return newState;
    });
  };

  // 換發球
  const switchServe = () => {
    vibrate([50, 50]);
    setGameState(prev => {
      const newState = { ...prev };
      if (prev.isDoubles) {
        if (prev.server === 1) {
          newState.server = 2;
        } else {
          newState.servingSide = prev.servingSide === 'team1' ? 'team2' : 'team1';
          newState.server = 1;
        }
      } else {
        newState.servingSide = prev.servingSide === 'team1' ? 'team2' : 'team1';
      }
      return newState;
    });
  };

  // 重置
  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      team1Score: 0,
      team2Score: 0,
      servingSide: 'team1',
      server: 1,
    }));
  };

  // 橫屏佈局
  const LandscapeLayout = () => (
    <div className="flex h-screen w-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
      {/* Team 1 */}
      <button
        onClick={() => addScore('team1')}
        disabled={gameState.servingSide !== 'team1'}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${gameState.servingSide === 'team1'
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
            : 'bg-neutral-800/50 opacity-50'
          }`}
      >
        <div className="text-white/80 text-2xl font-bold mb-4">TEAM 1</div>
        {gameState.servingSide === 'team1' && (
          <div className="mb-6 flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xl font-bold">
              發球 {gameState.isDoubles && `· ${gameState.server}`}
            </span>
          </div>
        )}
        <div className="text-white text-[20rem] font-black leading-none font-mono">
          {gameState.team1Score}
        </div>
      </button>

      {/* 中間控制 */}
      <div className="w-32 flex flex-col items-center justify-between py-8 bg-black/90">
        <div className="text-white/60 text-sm">目標 {gameState.targetScore}</div>

        <div className="flex flex-col gap-4">
          <button
            onClick={switchServe}
            className="w-20 h-20 bg-yellow-500 hover:bg-yellow-600 rounded-2xl text-white font-black text-3xl transition-all active:scale-95 shadow-lg"
          >
            ⇅
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-20 h-20 bg-white/10 hover:bg-white/20 rounded-2xl text-white text-2xl transition-all active:scale-95"
          >
            ⚙️
          </button>
          <button
            onClick={resetGame}
            className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-2xl text-white text-2xl transition-all active:scale-95 shadow-lg"
          >
            ↻
          </button>
        </div>

        <div className="text-white/40 text-xs text-center">
          {gameState.team1Score} - {gameState.team2Score}
        </div>
      </div>

      {/* Team 2 */}
      <button
        onClick={() => addScore('team2')}
        disabled={gameState.servingSide !== 'team2'}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${gameState.servingSide === 'team2'
            ? 'bg-gradient-to-br from-blue-600 to-blue-700'
            : 'bg-neutral-800/50 opacity-50'
          }`}
      >
        <div className="text-white/80 text-2xl font-bold mb-4">TEAM 2</div>
        {gameState.servingSide === 'team2' && (
          <div className="mb-6 flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xl font-bold">
              發球 {gameState.isDoubles && `· ${gameState.server}`}
            </span>
          </div>
        )}
        <div className="text-white text-[20rem] font-black leading-none font-mono">
          {gameState.team2Score}
        </div>
      </button>
    </div>
  );

  // 直屏佈局
  const PortraitLayout = () => (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
      {/* Team 1 */}
      <button
        onClick={() => addScore('team1')}
        disabled={gameState.servingSide !== 'team1'}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${gameState.servingSide === 'team1'
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
            : 'bg-neutral-800/50 opacity-50'
          }`}
      >
        <div className="text-white/80 text-xl font-bold mb-2">TEAM 1</div>
        {gameState.servingSide === 'team1' && (
          <div className="mb-4 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-bold">
              發球 {gameState.isDoubles && `· ${gameState.server}`}
            </span>
          </div>
        )}
        <div className="text-white text-[10rem] font-black leading-none font-mono">
          {gameState.team1Score}
        </div>
      </button>

      {/* 中間控制 */}
      <div className="h-24 flex items-center justify-between px-6 bg-black/90">
        <div className="text-white/60 text-sm">
          目標 {gameState.targetScore} · {gameState.team1Score}-{gameState.team2Score}
        </div>

        <div className="flex gap-3">
          <button
            onClick={switchServe}
            className="w-16 h-16 bg-yellow-500 active:bg-yellow-600 rounded-xl text-white font-black text-2xl transition-all shadow-lg"
          >
            ⇅
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-16 h-16 bg-white/10 active:bg-white/20 rounded-xl text-white text-xl transition-all"
          >
            ⚙️
          </button>
          <button
            onClick={resetGame}
            className="w-16 h-16 bg-red-600 active:bg-red-700 rounded-xl text-white text-xl transition-all shadow-lg"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Team 2 */}
      <button
        onClick={() => addScore('team2')}
        disabled={gameState.servingSide !== 'team2'}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${gameState.servingSide === 'team2'
            ? 'bg-gradient-to-br from-blue-600 to-blue-700'
            : 'bg-neutral-800/50 opacity-50'
          }`}
      >
        <div className="text-white/80 text-xl font-bold mb-2">TEAM 2</div>
        {gameState.servingSide === 'team2' && (
          <div className="mb-4 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-bold">
              發球 {gameState.isDoubles && `· ${gameState.server}`}
            </span>
          </div>
        )}
        <div className="text-white text-[10rem] font-black leading-none font-mono">
          {gameState.team2Score}
        </div>
      </button>
    </div>
  );

  return (
    <>
      <SEOHead page="scorer" />
      {orientation === 'landscape' ? <LandscapeLayout /> : <PortraitLayout />}

      {/* 設定面板 */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-800 rounded-2xl p-8 max-w-md w-full border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">設定</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* 比賽類型 */}
            <div className="mb-6">
              <label className="block text-white/80 font-bold mb-3">比賽類型</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setGameState(prev => ({ ...prev, isDoubles: true }))}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all ${gameState.isDoubles
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-white/10 text-white/60'
                    }`}
                >
                  雙打
                </button>
                <button
                  onClick={() => setGameState(prev => ({ ...prev, isDoubles: false, server: 1 }))}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all ${!gameState.isDoubles
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-white/10 text-white/60'
                    }`}
                >
                  單打
                </button>
              </div>
            </div>

            {/* 目標分數 */}
            <div>
              <label className="block text-white/80 font-bold mb-3">目標分數</label>
              <div className="flex gap-3">
                {[11, 15, 21].map(score => (
                  <button
                    key={score}
                    onClick={() => setGameState(prev => ({ ...prev, targetScore: score }))}
                    className={`flex-1 py-4 rounded-xl font-bold text-xl transition-all ${gameState.targetScore === score
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white/10 text-white/60'
                      }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* 說明 */}
            <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="font-bold text-white mb-2">💡 使用說明</h3>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• 點擊分數區域加分（只有發球方能得分）</li>
                <li>• 點擊 ⇅ 換發球</li>
                <li>• 點擊 ↻ 重置比賽</li>
                <li>• 橫放手機獲得更大顯示</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default Scorer;
