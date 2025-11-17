import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import { useScorerSounds } from '../hooks/useScorerSounds';

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
  const { playScoreSound, playSwitchServeSound, playWinSound, playSubtractSound, toggleMute, isMuted } = useScorerSounds();

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

    // 播放得分音效
    playScoreSound();

    const newState = { ...gameState };
    const teamName = team === 'team1' ? gameState.team1Name : gameState.team2Name;

    if (team === 'team1') {
      newState.team1Score += 1;
      addHistory(`${teamName} 得分 (${newState.team1Score}-${newState.team2Score})`);

      if (checkWin(newState.team1Score, newState.team2Score)) {
        newState.team1Sets += 1;
        addHistory(`${teamName} 贏得第 ${gameState.currentSet} 局！`);
        // 播放獲勝音效
        playWinSound();
        if (confirm(`${teamName} 贏得本局！開始下一局？`)) {
          newState.team1Score = 0;
          newState.team2Score = 0;
          newState.currentSet += 1;
          newState.servingSide = 'team1';
          newState.server = 1;
        }
      }
    } else {
      newState.team2Score += 1;
      addHistory(`${teamName} 得分 (${newState.team1Score}-${newState.team2Score})`);

      if (checkWin(newState.team2Score, newState.team1Score)) {
        newState.team2Sets += 1;
        addHistory(`${teamName} 贏得第 ${gameState.currentSet} 局！`);
        // 播放獲勝音效
        playWinSound();
        if (confirm(`${teamName} 贏得本局！開始下一局？`)) {
          newState.team1Score = 0;
          newState.team2Score = 0;
          newState.currentSet += 1;
          newState.servingSide = 'team1';
          newState.server = 1;
        }
      }
    }

    setGameState(newState);
  };

  // 減分
  const subtractScore = (team: 'team1' | 'team2') => {
    // 播放扣分音效
    playSubtractSound();

    const teamName = team === 'team1' ? gameState.team1Name : gameState.team2Name;
    setGameState(prev => ({
      ...prev,
      [team === 'team1' ? 'team1Score' : 'team2Score']:
        Math.max(0, team === 'team1' ? prev.team1Score - 1 : prev.team2Score - 1),
    }));
    addHistory(`${teamName} 分數修正`);
  };

  // 換發球
  const switchServe = () => {
    // 播放換發球音效
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
    }
  };

  // 橫屏佈局
  const LandscapeLayout = () => (
    <div className="flex h-screen w-screen bg-gray-900">
      {/* Team 1 (Left) */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 transition-all ${
        gameState.servingSide === 'team1' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gray-800'
      }`}>
        <div className="text-center w-full">
          {/* 隊伍名稱 */}
          <div className="text-white/80 text-2xl font-bold mb-2 tracking-wide uppercase">
            {gameState.team1Name}
          </div>

          {/* 局數 */}
          <div className="text-white/60 text-lg mb-4">
            局數: {gameState.team1Sets}
          </div>

          {/* 發球指示 */}
          {gameState.servingSide === 'team1' && (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xl font-semibold">
                  發球方 {gameState.isDoubles && `· 第 ${gameState.server} 位`}
                </span>
              </div>
            </div>
          )}

          {/* 分數 - 移除跳動動畫 */}
          <div className="text-white text-[18rem] font-black leading-none mb-10 tracking-tighter font-mono">
            {gameState.team1Score}
          </div>

          {/* 控制按鈕 */}
          <div className="space-y-4">
            <button
              onClick={() => addScore('team1')}
              disabled={gameState.servingSide !== 'team1'}
              className={`w-56 h-28 text-4xl font-bold rounded-xl transition-all shadow-2xl
                ${gameState.servingSide === 'team1'
                  ? 'bg-green-500 hover:bg-green-600 text-white active:scale-98'
                  : 'bg-gray-600 opacity-40 cursor-not-allowed text-gray-400'
                }`}
            >
              +1 得分
            </button>
            <button
              onClick={() => subtractScore('team1')}
              className="w-56 h-20 text-xl font-semibold bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all active:scale-98 shadow-lg"
            >
              -1 修正
            </button>
          </div>
        </div>
      </div>

      {/* 中間控制區 */}
      <div className="w-24 flex flex-col items-center justify-between py-6 bg-black/80 backdrop-blur-md border-l border-r border-white/10">
        {/* 頂部資訊 */}
        <div className="text-center">
          <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">局</div>
          <div className="text-white text-2xl font-bold mb-4">{gameState.currentSet}</div>

          <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">時間</div>
          <div className="text-white text-xl font-mono mb-2">{formatTime(gameTime)}</div>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all"
          >
            {isTimerRunning ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* 中間控制 */}
        <div className="flex flex-col gap-4">
          {/* 換發球 */}
          <button
            onClick={switchServe}
            className="w-16 h-16 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center"
            title="換發球"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>

          {/* 歷史記錄 */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center"
            title="歷史記錄"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* 設定 */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center"
            title="設定"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* 底部控制 */}
        <div className="flex flex-col gap-4">
          {/* 靜音切換 */}
          <button
            onClick={toggleMute}
            className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center"
            title={isMuted ? "開啟音效" : "靜音"}
          >
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* 全螢幕 */}
          <button
            onClick={toggleFullscreen}
            className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center"
            title="全螢幕"
          >
            {isFullscreen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {/* 重置 */}
          <button
            onClick={resetGame}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center"
            title="重置"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Team 2 (Right) */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 transition-all ${
        gameState.servingSide === 'team2' ? 'bg-gradient-to-br from-red-600 to-red-800' : 'bg-gray-800'
      }`}>
        <div className="text-center w-full">
          {/* 隊伍名稱 */}
          <div className="text-white/80 text-2xl font-bold mb-2 tracking-wide uppercase">
            {gameState.team2Name}
          </div>

          {/* 局數 */}
          <div className="text-white/60 text-lg mb-4">
            局數: {gameState.team2Sets}
          </div>

          {/* 發球指示 */}
          {gameState.servingSide === 'team2' && (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xl font-semibold">
                  發球方 {gameState.isDoubles && `· 第 ${gameState.server} 位`}
                </span>
              </div>
            </div>
          )}

          {/* 分數 - 移除跳動動畫 */}
          <div className="text-white text-[18rem] font-black leading-none mb-10 tracking-tighter font-mono">
            {gameState.team2Score}
          </div>

          {/* 控制按鈕 */}
          <div className="space-y-4">
            <button
              onClick={() => addScore('team2')}
              disabled={gameState.servingSide !== 'team2'}
              className={`w-56 h-28 text-4xl font-bold rounded-xl transition-all shadow-2xl
                ${gameState.servingSide === 'team2'
                  ? 'bg-green-500 hover:bg-green-600 text-white active:scale-98'
                  : 'bg-gray-600 opacity-40 cursor-not-allowed text-gray-400'
                }`}
            >
              +1 得分
            </button>
            <button
              onClick={() => subtractScore('team2')}
              className="w-56 h-20 text-xl font-semibold bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all active:scale-98 shadow-lg"
            >
              -1 修正
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 直屏佈局
  const PortraitLayout = () => (
    <div className="flex flex-col min-h-screen w-screen bg-gray-900">
      {/* Team 1 (Top) */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 transition-all ${
        gameState.servingSide === 'team1' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gray-800'
      }`}>
        <div className="text-center w-full">
          {/* 隊伍名稱 */}
          <div className="text-white/80 text-xl font-bold mb-2 tracking-wide uppercase">
            {gameState.team1Name}
          </div>

          {/* 局數 */}
          <div className="text-white/60 text-base mb-3">
            局數: {gameState.team1Sets}
          </div>

          {/* 發球指示 */}
          {gameState.servingSide === 'team1' && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-lg">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-base font-semibold">
                  發球方 {gameState.isDoubles && `· 第 ${gameState.server} 位`}
                </span>
              </div>
            </div>
          )}

          {/* 分數 - 移除跳動動畫 */}
          <div className="text-white text-[10rem] sm:text-[13rem] font-black leading-none mb-6 tracking-tighter font-mono">
            {gameState.team1Score}
          </div>

          {/* 控制按鈕 */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => addScore('team1')}
              disabled={gameState.servingSide !== 'team1'}
              className={`w-36 h-24 text-2xl font-bold rounded-xl transition-all shadow-2xl
                ${gameState.servingSide === 'team1'
                  ? 'bg-green-500 hover:bg-green-600 text-white active:scale-98'
                  : 'bg-gray-600 opacity-40 cursor-not-allowed text-gray-400'
                }`}
            >
              +1
            </button>
            <button
              onClick={() => subtractScore('team1')}
              className="w-28 h-24 text-lg font-semibold bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all active:scale-98 shadow-lg"
            >
              -1
            </button>
          </div>
        </div>
      </div>

      {/* 中間控制區 */}
      <div className="h-24 flex items-center justify-between px-6 bg-black/80 backdrop-blur-md border-t border-b border-white/10">
        {/* 左側資訊 */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-white/60 text-xs uppercase tracking-wider">局</div>
            <div className="text-white text-xl font-bold">{gameState.currentSet}</div>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-xs uppercase tracking-wider">時間</div>
            <div className="text-white text-lg font-mono">{formatTime(gameTime)}</div>
          </div>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all"
          >
            {isTimerRunning ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* 右側控制 */}
        <div className="flex gap-3">
          {/* 換發球 */}
          <button
            onClick={switchServe}
            className="w-14 h-14 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center"
            title="換發球"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>

          {/* 歷史 */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center"
            title="歷史"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* 設定 */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center"
            title="設定"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* 靜音切換 */}
          <button
            onClick={toggleMute}
            className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center"
            title={isMuted ? "開啟音效" : "靜音"}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* 全螢幕 */}
          <button
            onClick={toggleFullscreen}
            className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center"
            title="全螢幕"
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {/* 重置 */}
          <button
            onClick={resetGame}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center"
            title="重置"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Team 2 (Bottom) */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 transition-all ${
        gameState.servingSide === 'team2' ? 'bg-gradient-to-br from-red-600 to-red-800' : 'bg-gray-800'
      }`}>
        <div className="text-center w-full">
          {/* 控制按鈕 */}
          <div className="flex gap-3 justify-center mb-6">
            <button
              onClick={() => addScore('team2')}
              disabled={gameState.servingSide !== 'team2'}
              className={`w-36 h-24 text-2xl font-bold rounded-xl transition-all shadow-2xl
                ${gameState.servingSide === 'team2'
                  ? 'bg-green-500 hover:bg-green-600 text-white active:scale-98'
                  : 'bg-gray-600 opacity-40 cursor-not-allowed text-gray-400'
                }`}
            >
              +1
            </button>
            <button
              onClick={() => subtractScore('team2')}
              className="w-28 h-24 text-lg font-semibold bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all active:scale-98 shadow-lg"
            >
              -1
            </button>
          </div>

          {/* 分數 - 移除跳動動畫 */}
          <div className="text-white text-[10rem] sm:text-[13rem] font-black leading-none mb-4 tracking-tighter font-mono">
            {gameState.team2Score}
          </div>

          {/* 發球指示 */}
          {gameState.servingSide === 'team2' && (
            <div className="mb-3">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-lg">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-base font-semibold">
                  發球方 {gameState.isDoubles && `· 第 ${gameState.server} 位`}
                </span>
              </div>
            </div>
          )}

          {/* 局數 */}
          <div className="text-white/60 text-base mb-2">
            局數: {gameState.team2Sets}
          </div>

          {/* 隊伍名稱 */}
          <div className="text-white/80 text-xl font-bold tracking-wide uppercase">
            {gameState.team2Name}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {orientation === 'landscape' ? <LandscapeLayout /> : <PortraitLayout />}

      {/* 歷史記錄面板 */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-white/10"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">比賽記錄</h2>
              <div className="flex-1 overflow-y-auto space-y-2">
                {history.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">尚無記錄</div>
                ) : (
                  history.map((record, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg px-4 py-2 text-white/90 text-sm font-mono">
                      {record}
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all"
              >
                關閉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 設定彈窗 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/10"
            >
              <h2 className="text-3xl font-black mb-6 text-white">比賽設定</h2>

              <div className="space-y-6">
                {/* 隊伍名稱 */}
                <div>
                  <label className="block text-base font-semibold text-white/80 mb-2">隊伍名稱</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={gameState.team1Name}
                      onChange={(e) => setGameState(prev => ({ ...prev, team1Name: e.target.value }))}
                      className="bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Team 1"
                    />
                    <input
                      type="text"
                      value={gameState.team2Name}
                      onChange={(e) => setGameState(prev => ({ ...prev, team2Name: e.target.value }))}
                      className="bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Team 2"
                    />
                  </div>
                </div>

                {/* 比賽類型 */}
                <div>
                  <label className="block text-base font-semibold text-white/80 mb-3">比賽類型</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, isDoubles: true }))}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all ${
                        gameState.isDoubles
                          ? 'bg-pickleball-500 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      雙打
                    </button>
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, isDoubles: false, server: 1 }))}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all ${
                        !gameState.isDoubles
                          ? 'bg-pickleball-500 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      單打
                    </button>
                  </div>
                </div>

                {/* 目標分數 */}
                <div>
                  <label className="block text-base font-semibold text-white/80 mb-3">目標分數</label>
                  <div className="flex gap-3">
                    {[11, 15, 21].map(score => (
                      <button
                        key={score}
                        onClick={() => setGameState(prev => ({ ...prev, targetScore: score }))}
                        className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                          gameState.targetScore === score
                            ? 'bg-pickleball-500 text-white shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 說明 */}
                <div className="bg-gray-700/50 rounded-xl p-4 border border-white/10">
                  <h3 className="font-bold text-white mb-2">計分規則</h3>
                  <ul className="text-sm text-white/70 space-y-1.5 leading-relaxed">
                    <li>• 只有發球方可以得分</li>
                    <li>• 必須贏對手至少 2 分才算獲勝</li>
                    <li>• 雙打時每方有兩次發球機會</li>
                    <li>• 使用「換發球」按鈕切換發球權</li>
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
