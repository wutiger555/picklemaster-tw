import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import { useScorerSounds } from '../hooks/useScorerSounds';
import GlassCard from '../components/common/GlassCard';

type ServingSide = 'team1' | 'team2';
type Server = 1 | 2;

interface GameState {
  team1Score: number;
  team2Score: number;
  servingSide: ServingSide;
  server: Server;
  targetScore: number;
  isDoubles: boolean;
  team1Name: string;
  team2Name: string;
  currentSet: number;
  team1Sets: number;
  team2Sets: number;
}

const Scorer = () => {
  usePageTitle('匹克球計分器');

  // 音效系統
  const {
    playScoreSound,
    playSwitchServeSound,
    playGameStartSound,
    playGamePointSound,
    playDeuceSound,
    playWinSound,
    playSubtractSound,
    toggleMute,
    isMuted,
    initAudioContext
  } = useScorerSounds();

  const [gameState, setGameState] = useState<GameState>({
    team1Score: 0,
    team2Score: 0,
    servingSide: 'team1',
    server: 1,
    targetScore: 11,
    isDoubles: true,
    team1Name: 'Team 1',
    team2Name: 'Team 2',
    currentSet: 1,
    team1Sets: 0,
    team2Sets: 0,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showSettings, setShowSettings] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [hasPlayedOpeningSound, setHasPlayedOpeningSound] = useState(false);
  const [compactMode, setCompactMode] = useState(false); // 新增：精簡模式

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

  // 記錄歷史
  const addHistory = (message: string) => {
    const timestamp = formatTime(gameTime);
    setHistory(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  // 加分邏輯
  const addScore = (team: 'team1' | 'team2') => {
    if (gameState.servingSide !== team) return;

    // 觸覺反饋
    vibrate(50);

    // 初始化音效系統（確保在用戶互動時啟動）
    initAudioContext();

    // 第一次互動時播放開場音效
    if (!hasPlayedOpeningSound) {
      playGameStartSound();
      setHasPlayedOpeningSound(true);
    }

    const newState = { ...gameState };
    const teamName = team === 'team1' ? gameState.team1Name : gameState.team2Name;

    if (team === 'team1') {
      newState.team1Score += 1;
      addHistory(`${teamName} 得分 (${newState.team1Score}-${newState.team2Score})`);

      // 檢查是否獲勝
      if (checkWin(newState.team1Score, newState.team2Score)) {
        newState.team1Sets += 1;
        addHistory(`${teamName} 贏得第 ${gameState.currentSet} 局！`);
        vibrate([100, 50, 100, 50, 100]);
        playWinSound();
        if (confirm(`${teamName} 贏得本局！開始下一局？`)) {
          newState.team1Score = 0;
          newState.team2Score = 0;
          newState.currentSet += 1;
          newState.servingSide = 'team1';
          newState.server = 1;
        }
      } else {
        if (newState.team1Score === newState.team2Score &&
            newState.team1Score >= gameState.targetScore - 1) {
          playDeuceSound();
          addHistory('Deuce!');
        }
        else if (newState.team1Score >= gameState.targetScore - 1 &&
                 newState.team1Score - newState.team2Score === 1) {
          playGamePointSound();
          addHistory(`Game Point - ${teamName}!`);
        } else {
          playScoreSound();
        }
      }
    } else {
      newState.team2Score += 1;
      addHistory(`${teamName} 得分 (${newState.team1Score}-${newState.team2Score})`);

      if (checkWin(newState.team2Score, newState.team1Score)) {
        newState.team2Sets += 1;
        addHistory(`${teamName} 贏得第 ${gameState.currentSet} 局！`);
        vibrate([100, 50, 100, 50, 100]);
        playWinSound();
        if (confirm(`${teamName} 贏得本局！開始下一局？`)) {
          newState.team1Score = 0;
          newState.team2Score = 0;
          newState.currentSet += 1;
          newState.servingSide = 'team1';
          newState.server = 1;
        }
      } else {
        if (newState.team1Score === newState.team2Score &&
            newState.team2Score >= gameState.targetScore - 1) {
          playDeuceSound();
          addHistory('Deuce!');
        }
        else if (newState.team2Score >= gameState.targetScore - 1 &&
                 newState.team2Score - newState.team1Score === 1) {
          playGamePointSound();
          addHistory(`Game Point - ${teamName}!`);
        } else {
          playScoreSound();
        }
      }
    }

    setGameState(newState);
  };

  // 減分邏輯
  const subtractScore = (team: 'team1' | 'team2') => {
    vibrate(30);
    initAudioContext();
    playSubtractSound();

    setGameState(prev => {
      const newState = { ...prev };
      if (team === 'team1' && prev.team1Score > 0) {
        newState.team1Score -= 1;
        addHistory(`${prev.team1Name} 分數修正 (${newState.team1Score}-${newState.team2Score})`);
      } else if (team === 'team2' && prev.team2Score > 0) {
        newState.team2Score -= 1;
        addHistory(`${prev.team2Name} 分數修正 (${newState.team1Score}-${newState.team2Score})`);
      }
      return newState;
    });
  };

  // 換發球
  const switchServe = () => {
    vibrate([50, 50, 50]);
    initAudioContext();
    playSwitchServeSound();

    setGameState(prev => {
      const newState = { ...prev };

      if (prev.isDoubles) {
        if (prev.server === 1) {
          newState.server = 2;
          addHistory(`${prev.servingSide === 'team1' ? prev.team1Name : prev.team2Name} 換第二發球員`);
        } else {
          newState.servingSide = prev.servingSide === 'team1' ? 'team2' : 'team1';
          newState.server = 1;
          const newServingName = newState.servingSide === 'team1' ? prev.team1Name : prev.team2Name;
          addHistory(`換發球方：${newServingName}`);
        }
      } else {
        newState.servingSide = prev.servingSide === 'team1' ? 'team2' : 'team1';
        const newServingName = newState.servingSide === 'team1' ? prev.team1Name : prev.team2Name;
        addHistory(`換發球方：${newServingName}`);
      }

      return newState;
    });
  };

  // 重置比賽
  const resetGame = () => {
    if (confirm('確定要重置整個比賽嗎？')) {
      initAudioContext();

      setGameState({
        team1Score: 0,
        team2Score: 0,
        servingSide: 'team1',
        server: 1,
        targetScore: gameState.targetScore,
        isDoubles: gameState.isDoubles,
        team1Name: gameState.team1Name,
        team2Name: gameState.team2Name,
        currentSet: 1,
        team1Sets: 0,
        team2Sets: 0,
      });
      setGameTime(0);
      setIsTimerRunning(false);
      setHistory([]);
      addHistory('比賽開始');

      setTimeout(() => playGameStartSound(), 300);
    }
  };

  // 橫屏佈局（桌機或手機橫放）
  const LandscapeLayout = () => (
    <div className="flex h-screen w-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Team 1 (Left) */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300 ${
        gameState.servingSide === 'team1'
          ? 'bg-gradient-to-br from-secondary-600 to-secondary-800'
          : 'bg-neutral-800/50'
      }`}>
        <div className="text-center w-full">
          {/* 隊伍名稱 */}
          <div className="text-white/90 text-xl md:text-2xl font-display font-black mb-2 uppercase tracking-wide">
            {gameState.team1Name}
          </div>

          {!compactMode && (
            <div className="text-white/60 text-sm md:text-lg mb-3">
              局數: {gameState.team1Sets}
            </div>
          )}

          {/* 發球指示 */}
          {gameState.servingSide === 'team1' && (
            <div className="mb-4 md:mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-xl">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-primary-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm md:text-xl font-bold">
                  發球 {gameState.isDoubles && `· ${gameState.server}`}
                </span>
              </div>
            </div>
          )}

          {/* 分數 */}
          <div className="text-white text-[12rem] md:text-[18rem] font-black leading-none mb-6 md:mb-10 tracking-tighter font-mono">
            {gameState.team1Score}
          </div>

          {/* 控制按鈕 */}
          <div className="space-y-3 md:space-y-4">
            <button
              onClick={() => addScore('team1')}
              disabled={gameState.servingSide !== 'team1'}
              className={`w-48 md:w-56 h-20 md:h-28 text-2xl md:text-4xl font-black rounded-2xl transition-all shadow-2xl
                ${gameState.servingSide === 'team1'
                  ? 'bg-primary-500 hover:bg-primary-600 text-white active:scale-95 shadow-primary-500/50'
                  : 'bg-neutral-600 opacity-30 cursor-not-allowed text-neutral-400'
                }`}
            >
              +1 得分
            </button>
            <button
              onClick={() => subtractScore('team1')}
              className="w-48 md:w-56 h-14 md:h-20 text-lg md:text-xl font-bold bg-neutral-700 hover:bg-neutral-600 text-white rounded-2xl transition-all active:scale-95 shadow-lg"
            >
              -1 修正
            </button>
          </div>
        </div>
      </div>

      {/* 中間控制區 */}
      <div className="w-20 md:w-24 flex flex-col items-center justify-between py-4 md:py-6 bg-black/90 backdrop-blur-md border-l border-r border-white/10">
        {/* 頂部資訊 */}
        {!compactMode && (
          <div className="text-center space-y-4">
            <div>
              <div className="text-white/60 text-xs uppercase tracking-wider">局</div>
              <div className="text-white text-xl md:text-2xl font-bold">{gameState.currentSet}</div>
            </div>

            <div>
              <div className="text-white/60 text-xs uppercase tracking-wider">時間</div>
              <div className="text-white text-base md:text-xl font-mono">{formatTime(gameTime)}</div>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="mt-2 w-12 md:w-14 h-12 md:h-14 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all active:scale-95"
              >
                {isTimerRunning ? '⏸' : '▶'}
              </button>
            </div>
          </div>
        )}

        {/* 中間控制 */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* 換發球 */}
          <button
            onClick={switchServe}
            className="w-14 md:w-16 h-14 md:h-16 bg-accent-500 hover:bg-accent-600 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg shadow-accent-500/50 flex items-center justify-center text-2xl"
            title="換發球"
          >
            ⇅
          </button>

          {/* 精簡模式切換 */}
          <button
            onClick={() => setCompactMode(!compactMode)}
            className="w-14 md:w-16 h-14 md:h-16 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center text-xl"
            title={compactMode ? "完整模式" : "精簡模式"}
          >
            {compactMode ? '📋' : '⚡'}
          </button>

          {!compactMode && (
            <>
              {/* 歷史記錄 */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-14 md:w-16 h-14 md:h-16 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center text-xl"
                title="歷史記錄"
              >
                📜
              </button>

              {/* 設定 */}
              <button
                onClick={() => setShowSettings(true)}
                className="w-14 md:w-16 h-14 md:h-16 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center text-xl"
                title="設定"
              >
                ⚙️
              </button>
            </>
          )}
        </div>

        {/* 底部控制 */}
        <div className="flex flex-col gap-3 md:gap-4">
          <button
            onClick={toggleMute}
            className="w-14 md:w-16 h-14 md:h-16 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center text-xl"
            title={isMuted ? "開啟音效" : "靜音"}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={toggleFullscreen}
            className="w-14 md:w-16 h-14 md:h-16 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center text-xl"
            title="全螢幕"
          >
            {isFullscreen ? '⊡' : '⊞'}
          </button>

          <button
            onClick={resetGame}
            className="w-14 md:w-16 h-14 md:h-16 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg shadow-red-600/50 flex items-center justify-center text-xl"
            title="重置"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Team 2 (Right) */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300 ${
        gameState.servingSide === 'team2'
          ? 'bg-gradient-to-br from-accent-600 to-accent-800'
          : 'bg-neutral-800/50'
      }`}>
        <div className="text-center w-full">
          <div className="text-white/90 text-xl md:text-2xl font-display font-black mb-2 uppercase tracking-wide">
            {gameState.team2Name}
          </div>

          {!compactMode && (
            <div className="text-white/60 text-sm md:text-lg mb-3">
              局數: {gameState.team2Sets}
            </div>
          )}

          {gameState.servingSide === 'team2' && (
            <div className="mb-4 md:mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-xl">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-primary-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm md:text-xl font-bold">
                  發球 {gameState.isDoubles && `· ${gameState.server}`}
                </span>
              </div>
            </div>
          )}

          <div className="text-white text-[12rem] md:text-[18rem] font-black leading-none mb-6 md:mb-10 tracking-tighter font-mono">
            {gameState.team2Score}
          </div>

          <div className="space-y-3 md:space-y-4">
            <button
              onClick={() => addScore('team2')}
              disabled={gameState.servingSide !== 'team2'}
              className={`w-48 md:w-56 h-20 md:h-28 text-2xl md:text-4xl font-black rounded-2xl transition-all shadow-2xl
                ${gameState.servingSide === 'team2'
                  ? 'bg-primary-500 hover:bg-primary-600 text-white active:scale-95 shadow-primary-500/50'
                  : 'bg-neutral-600 opacity-30 cursor-not-allowed text-neutral-400'
                }`}
            >
              +1 得分
            </button>
            <button
              onClick={() => subtractScore('team2')}
              className="w-48 md:w-56 h-14 md:h-20 text-lg md:text-xl font-bold bg-neutral-700 hover:bg-neutral-600 text-white rounded-2xl transition-all active:scale-95 shadow-lg"
            >
              -1 修正
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 直屏佈局（手機直立）- 優化版
  const PortraitLayout = () => (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
      {/* Team 1 (Top) */}
      <div className={`flex-1 flex flex-col items-center justify-center px-4 py-3 transition-all duration-300 ${
        gameState.servingSide === 'team1'
          ? 'bg-gradient-to-br from-secondary-600 to-secondary-800'
          : 'bg-neutral-800/50'
      }`}>
        <div className="text-center w-full">
          <div className="text-white/90 text-lg font-display font-black mb-1 uppercase tracking-wide">
            {gameState.team1Name}
          </div>

          {gameState.servingSide === 'team1' && (
            <div className="mb-2">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-bold">
                  發球 {gameState.isDoubles && `· ${gameState.server}`}
                </span>
              </div>
            </div>
          )}

          {/* 分數 - 針對小螢幕優化 */}
          <div className="text-white text-[6.5rem] xs:text-[7.5rem] sm:text-[9rem] font-black leading-none mb-3 tracking-tighter font-mono">
            {gameState.team1Score}
          </div>

          {/* 按鈕 - 更大更易點擊 */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => addScore('team1')}
              disabled={gameState.servingSide !== 'team1'}
              className={`flex-1 max-w-[160px] h-20 text-2xl font-black rounded-2xl transition-all shadow-xl
                ${gameState.servingSide === 'team1'
                  ? 'bg-primary-500 active:bg-primary-600 text-white shadow-primary-500/50'
                  : 'bg-neutral-600 opacity-30 cursor-not-allowed text-neutral-400'
                }`}
            >
              +1
            </button>
            <button
              onClick={() => subtractScore('team1')}
              className="w-20 h-20 text-lg font-bold bg-neutral-700 active:bg-neutral-600 text-white rounded-2xl transition-all shadow-lg"
            >
              -1
            </button>
          </div>
        </div>
      </div>

      {/* 中間控制區 - 精簡化 */}
      <div className="h-16 flex items-center justify-between px-4 bg-black/90 backdrop-blur-md border-t border-b border-white/10">
        {!compactMode ? (
          <>
            {/* 左側資訊 */}
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-white/60 text-[10px] uppercase">局</div>
                <div className="text-white text-base font-bold">{gameState.currentSet}</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-[10px] uppercase">時間</div>
                <div className="text-white text-sm font-mono">{formatTime(gameTime)}</div>
              </div>
            </div>

            {/* 右側控制 */}
            <div className="flex gap-2">
              <button
                onClick={switchServe}
                className="w-12 h-12 bg-accent-500 active:bg-accent-600 rounded-lg text-white font-bold transition-all shadow-lg shadow-accent-500/50 flex items-center justify-center text-xl"
              >
                ⇅
              </button>
              <button
                onClick={() => setCompactMode(true)}
                className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-lg text-white flex items-center justify-center text-lg"
                title="精簡模式"
              >
                ⚡
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-lg text-white flex items-center justify-center text-lg"
              >
                ⚙️
              </button>
            </div>
          </>
        ) : (
          /* 精簡模式：只顯示換發球和退出精簡模式 */
          <div className="flex items-center justify-between w-full">
            <div className="text-white/80 text-sm font-bold">第 {gameState.currentSet} 局 · {formatTime(gameTime)}</div>
            <div className="flex gap-2">
              <button
                onClick={switchServe}
                className="w-14 h-12 bg-accent-500 active:bg-accent-600 rounded-lg text-white font-black transition-all shadow-lg shadow-accent-500/50 flex items-center justify-center text-xl"
              >
                ⇅
              </button>
              <button
                onClick={() => setCompactMode(false)}
                className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-lg text-white flex items-center justify-center text-lg"
                title="完整模式"
              >
                📋
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team 2 (Bottom) */}
      <div className={`flex-1 flex flex-col items-center justify-center px-4 py-3 transition-all duration-300 ${
        gameState.servingSide === 'team2'
          ? 'bg-gradient-to-br from-accent-600 to-accent-800'
          : 'bg-neutral-800/50'
      }`}>
        <div className="text-center w-full">
          <div className="text-white/90 text-lg font-display font-black mb-1 uppercase tracking-wide">
            {gameState.team2Name}
          </div>

          {gameState.servingSide === 'team2' && (
            <div className="mb-2">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-bold">
                  發球 {gameState.isDoubles && `· ${gameState.server}`}
                </span>
              </div>
            </div>
          )}

          <div className="text-white text-[6.5rem] xs:text-[7.5rem] sm:text-[9rem] font-black leading-none mb-3 tracking-tighter font-mono">
            {gameState.team2Score}
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => addScore('team2')}
              disabled={gameState.servingSide !== 'team2'}
              className={`flex-1 max-w-[160px] h-20 text-2xl font-black rounded-2xl transition-all shadow-xl
                ${gameState.servingSide === 'team2'
                  ? 'bg-primary-500 active:bg-primary-600 text-white shadow-primary-500/50'
                  : 'bg-neutral-600 opacity-30 cursor-not-allowed text-neutral-400'
                }`}
            >
              +1
            </button>
            <button
              onClick={() => subtractScore('team2')}
              className="w-20 h-20 text-lg font-bold bg-neutral-700 active:bg-neutral-600 text-white rounded-2xl transition-all shadow-lg"
            >
              -1
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {orientation === 'landscape' ? <LandscapeLayout /> : <PortraitLayout />}

      {/* 設定面板 - 使用 GlassCard */}
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <GlassCard variant="dark" size="xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-heading-xl font-black text-white">設定</h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center justify-center transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 隊伍名稱 */}
                  <div>
                    <label className="block text-base font-bold text-white/80 mb-3">隊伍名稱</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={gameState.team1Name}
                        onChange={(e) => setGameState(prev => ({ ...prev, team1Name: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                        placeholder="Team 1"
                      />
                      <input
                        type="text"
                        value={gameState.team2Name}
                        onChange={(e) => setGameState(prev => ({ ...prev, team2Name: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        placeholder="Team 2"
                      />
                    </div>
                  </div>

                  {/* 比賽類型 */}
                  <div>
                    <label className="block text-base font-bold text-white/80 mb-3">比賽類型</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setGameState(prev => ({ ...prev, isDoubles: true }))}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                          gameState.isDoubles
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        雙打
                      </button>
                      <button
                        onClick={() => setGameState(prev => ({ ...prev, isDoubles: false, server: 1 }))}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                          !gameState.isDoubles
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        單打
                      </button>
                    </div>
                  </div>

                  {/* 目標分數 */}
                  <div>
                    <label className="block text-base font-bold text-white/80 mb-3">目標分數</label>
                    <div className="flex gap-3">
                      {[11, 15, 21].map(score => (
                        <button
                          key={score}
                          onClick={() => setGameState(prev => ({ ...prev, targetScore: score }))}
                          className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all ${
                            gameState.targetScore === score
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 說明 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-bold text-white mb-2">💡 使用提示</h3>
                    <ul className="text-sm text-white/70 space-y-1.5 leading-relaxed">
                      <li>• 點擊「⚡」進入精簡模式（隱藏次要資訊）</li>
                      <li>• 點擊「⊞」進入全螢幕（推薦比賽時使用）</li>
                      <li>• 按鈕會有震動反饋（需手機支援）</li>
                      <li>• 橫放手機獲得更大的分數顯示</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/50"
                  >
                    完成
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 歷史記錄面板 */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <GlassCard variant="dark" size="xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-heading-xl font-black text-white">比賽記錄</h2>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center justify-center transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.length === 0 ? (
                      <p className="text-white/50 text-center py-8">尚無記錄</p>
                    ) : (
                      history.map((entry, index) => (
                        <div
                          key={index}
                          className="bg-white/5 rounded-lg p-3 text-sm text-white/80 font-mono border border-white/10"
                        >
                          {entry}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Scorer;
