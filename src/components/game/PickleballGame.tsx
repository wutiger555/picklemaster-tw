import { useEffect, useRef, useState, useCallback } from 'react';

// 球場配置（橫向顯示，符合標準匹克球場規格比例）
const COURT = {
  WIDTH: 1000, // 44英尺（橫向）
  HEIGHT: 450, // 20英尺（縱向）
  NET_X: 500, // 中線（左右分界）
  KITCHEN_WIDTH: 160, // 7英尺廚房區
  LINE_WIDTH: 4,
  CENTER_Y: 225,
};

// 遊戲物件配置
const PLAYER = {
  PADDLE_WIDTH: 20,
  PADDLE_HEIGHT: 120,
  SPEED: 12,
};

const BALL = {
  RADIUS: 16,
  SPEED: 6, // 固定速度，更容易控制
};

interface GameObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const PickleballGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'point'>('ready');
  const [message, setMessage] = useState('按下空白鍵或上下鍵開始遊戲');

  // 遊戲狀態
  const gameLoop = useRef<number | undefined>(undefined);
  const keys = useRef<Set<string>>(new Set());

  // 玩家（左側）
  const player = useRef<GameObject>({
    x: 50,
    y: COURT.CENTER_Y,
    vx: 0,
    vy: 0,
  });

  // 對手（右側）- AI
  const opponent = useRef<GameObject>({
    x: COURT.WIDTH - 50,
    y: COURT.CENTER_Y,
    vx: 0,
    vy: 0,
  });

  // 球
  const ball = useRef<GameObject>({
    x: COURT.WIDTH / 2,
    y: COURT.HEIGHT / 2,
    vx: BALL.SPEED,
    vy: 0,
  });

  const lastHitter = useRef<'player' | 'opponent' | null>(null);

  // 繪製球場（橫向）
  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    // 背景
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, COURT.WIDTH, COURT.HEIGHT);

    // 外框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = COURT.LINE_WIDTH;
    ctx.strokeRect(0, 0, COURT.WIDTH, COURT.HEIGHT);

    // 球網（中線）
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(COURT.NET_X - 4, 0, 8, COURT.HEIGHT);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(COURT.NET_X - 2, 0, 4, COURT.HEIGHT);

    // 廚房區線（左側）
    const kitchenLeftX = COURT.KITCHEN_WIDTH;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(kitchenLeftX, 0);
    ctx.lineTo(kitchenLeftX, COURT.HEIGHT);
    ctx.stroke();

    // 廚房區線（右側）
    const kitchenRightX = COURT.WIDTH - COURT.KITCHEN_WIDTH;
    ctx.beginPath();
    ctx.moveTo(kitchenRightX, 0);
    ctx.lineTo(kitchenRightX, COURT.HEIGHT);
    ctx.stroke();

    // 廚房區標記（半透明黃色）
    ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.fillRect(COURT.NET_X - COURT.KITCHEN_WIDTH, 0, COURT.KITCHEN_WIDTH, COURT.HEIGHT);
    ctx.fillRect(COURT.NET_X, 0, COURT.KITCHEN_WIDTH, COURT.HEIGHT);

    // 中線（虛線）- 上半場
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, COURT.CENTER_Y);
    ctx.lineTo(kitchenLeftX, COURT.CENTER_Y);
    ctx.stroke();

    // 中線（虛線）- 下半場
    ctx.beginPath();
    ctx.moveTo(kitchenRightX, COURT.CENTER_Y);
    ctx.lineTo(COURT.WIDTH, COURT.CENTER_Y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // 繪製球拍（簡化版）
  const drawPlayer = (ctx: CanvasRenderingContext2D, obj: GameObject, isPlayer: boolean) => {
    const paddleColor = isPlayer ? '#3b82f6' : '#ef4444';
    const paddleAccent = isPlayer ? '#2563eb' : '#dc2626';

    // 球拍外框
    ctx.fillStyle = paddleAccent;
    ctx.roundRect(
      obj.x - PLAYER.PADDLE_WIDTH / 2 - 2,
      obj.y - PLAYER.PADDLE_HEIGHT / 2 - 2,
      PLAYER.PADDLE_WIDTH + 4,
      PLAYER.PADDLE_HEIGHT + 4,
      6
    );
    ctx.fill();

    // 球拍主體
    ctx.fillStyle = paddleColor;
    ctx.roundRect(
      obj.x - PLAYER.PADDLE_WIDTH / 2,
      obj.y - PLAYER.PADDLE_HEIGHT / 2,
      PLAYER.PADDLE_WIDTH,
      PLAYER.PADDLE_HEIGHT,
      4
    );
    ctx.fill();

    // 握把細節
    ctx.fillStyle = '#1f2937';
    const handleSize = 30;
    const handleOffset = isPlayer ? -PLAYER.PADDLE_WIDTH / 2 - handleSize : PLAYER.PADDLE_WIDTH / 2;
    ctx.roundRect(obj.x + handleOffset, obj.y - 10, handleSize, 20, 3);
    ctx.fill();
  };

  // 繪製球
  const drawBall = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL.RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 球上的孔洞效果
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const holeX = ball.current.x + Math.cos(angle) * 10;
      const holeY = ball.current.y + Math.sin(angle) * 10;
      ctx.beginPath();
      ctx.arc(holeX, holeY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#d97706';
      ctx.fill();
    }
  };

  // 碰撞檢測：球與球拍（簡化並增大碰撞範圍）
  const checkPaddleCollision = (paddle: GameObject, isPlayer: boolean) => {
    const paddleLeft = paddle.x - PLAYER.PADDLE_WIDTH / 2 - 10;
    const paddleRight = paddle.x + PLAYER.PADDLE_WIDTH / 2 + 10;
    const paddleTop = paddle.y - PLAYER.PADDLE_HEIGHT / 2 - 10;
    const paddleBottom = paddle.y + PLAYER.PADDLE_HEIGHT / 2 + 10;

    const ballInPaddleX = ball.current.x > paddleLeft && ball.current.x < paddleRight;
    const ballInPaddleY = ball.current.y > paddleTop && ball.current.y < paddleBottom;

    if (ballInPaddleX && ballInPaddleY) {
      // 擊中球拍 - 反彈並增加一點隨機性
      ball.current.vx = -ball.current.vx;

      // 根據擊球位置增加垂直速度
      const hitPosition = (ball.current.y - paddle.y) / (PLAYER.PADDLE_HEIGHT / 2);
      ball.current.vy = hitPosition * BALL.SPEED * 0.5;

      // 確保球離開球拍
      if (isPlayer) {
        ball.current.x = paddleRight + BALL.RADIUS;
      } else {
        ball.current.x = paddleLeft - BALL.RADIUS;
      }

      lastHitter.current = isPlayer ? 'player' : 'opponent';
      return true;
    }
    return false;
  };

  // AI 對手邏輯（簡化）
  const updateOpponentAI = () => {
    const opp = opponent.current;
    const b = ball.current;

    // AI 追蹤球的 Y 位置
    if (b.vx > 0 && b.x > COURT.NET_X) {
      // 球往對手方向移動
      const targetY = b.y;
      const diff = targetY - opp.y;

      if (Math.abs(diff) > 10) {
        opp.vy = diff > 0 ? PLAYER.SPEED * 0.7 : -PLAYER.SPEED * 0.7;
      } else {
        opp.vy = 0;
      }
    } else {
      // 回到中央
      const diff = COURT.CENTER_Y - opp.y;
      if (Math.abs(diff) > 10) {
        opp.vy = diff > 0 ? PLAYER.SPEED * 0.5 : -PLAYER.SPEED * 0.5;
      } else {
        opp.vy = 0;
      }
    }

    opp.y += opp.vy;
    opp.y = Math.max(PLAYER.PADDLE_HEIGHT / 2, Math.min(COURT.HEIGHT - PLAYER.PADDLE_HEIGHT / 2, opp.y));
  };

  // 更新遊戲邏輯
  const update = useCallback(() => {
    if (gameState !== 'playing') return;

    // 玩家移動（上下）
    if (keys.current.has('ArrowUp') || keys.current.has('w') || keys.current.has('W')) {
      player.current.y -= PLAYER.SPEED;
    }
    if (keys.current.has('ArrowDown') || keys.current.has('s') || keys.current.has('S')) {
      player.current.y += PLAYER.SPEED;
    }

    player.current.y = Math.max(
      PLAYER.PADDLE_HEIGHT / 2,
      Math.min(COURT.HEIGHT - PLAYER.PADDLE_HEIGHT / 2, player.current.y)
    );

    // AI 對手
    updateOpponentAI();

    // 球移動
    ball.current.x += ball.current.vx;
    ball.current.y += ball.current.vy;

    // 球與球拍碰撞
    checkPaddleCollision(player.current, true);
    checkPaddleCollision(opponent.current, false);

    // 球與上下邊界碰撞
    if (ball.current.y < BALL.RADIUS || ball.current.y > COURT.HEIGHT - BALL.RADIUS) {
      ball.current.vy = -ball.current.vy;
      ball.current.y = Math.max(BALL.RADIUS, Math.min(COURT.HEIGHT - BALL.RADIUS, ball.current.y));
    }

    // 球出界判定（左右）
    if (ball.current.x < -BALL.RADIUS) {
      // 對手得分
      setScore((s) => ({ ...s, opponent: s.opponent + 1 }));
      setMessage('對手得分！按空白鍵繼續');
      setGameState('point');
    } else if (ball.current.x > COURT.WIDTH + BALL.RADIUS) {
      // 玩家得分
      setScore((s) => ({ ...s, player: s.player + 1 }));
      setMessage('你得分了！按空白鍵繼續');
      setGameState('point');
    }
  }, [gameState]);

  // 渲染
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空畫面
    ctx.clearRect(0, 0, COURT.WIDTH, COURT.HEIGHT);

    // 繪製球場
    drawCourt(ctx);

    // 繪製玩家
    drawPlayer(ctx, player.current, true);
    drawPlayer(ctx, opponent.current, false);

    // 繪製球
    if (gameState === 'playing' || gameState === 'point') {
      drawBall(ctx);
    }

    // 繪製計分板
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(COURT.WIDTH / 2 - 100, 10, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${score.player} - ${score.opponent}`, COURT.WIDTH / 2, 45);
  }, [gameState, score]);

  // 遊戲循環
  useEffect(() => {
    const loop = () => {
      update();
      render();
      gameLoop.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (gameLoop.current) {
        cancelAnimationFrame(gameLoop.current);
      }
    };
  }, [update, render]);

  // 鍵盤控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key);

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (gameState === 'ready' || gameState === 'point') {
          // 開始/重新開始遊戲
          ball.current.x = COURT.WIDTH / 2;
          ball.current.y = COURT.HEIGHT / 2;
          ball.current.vx = lastHitter.current === 'player' ? BALL.SPEED : -BALL.SPEED;
          ball.current.vy = (Math.random() - 0.5) * 2;
          setGameState('playing');
          setMessage('');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-sport-50 to-court-50 rounded-3xl shadow-2xl p-6">
        <h2 className="text-3xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-court-600">
          匹克球小遊戲
        </h2>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-inner">
          <canvas
            ref={canvasRef}
            width={COURT.WIDTH}
            height={COURT.HEIGHT}
            className="w-full border-4 border-gray-800 rounded-lg"
            style={{ maxHeight: '70vh' }}
          />
        </div>

        {message && (
          <div className="bg-gradient-to-r from-pickleball-500 to-sport-500 text-white px-6 py-3 rounded-full text-center font-bold text-lg mb-4">
            {message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-100 rounded-xl p-4">
            <div className="text-center">
              <div className="text-gray-600 text-sm mb-1">你的分數</div>
              <div className="text-4xl font-black text-blue-600">{score.player}</div>
            </div>
          </div>
          <div className="bg-red-100 rounded-xl p-4">
            <div className="text-center">
              <div className="text-gray-600 text-sm mb-1">對手分數</div>
              <div className="text-4xl font-black text-red-600">{score.opponent}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl p-4">
          <h3 className="font-bold text-gray-800 mb-2">操作說明</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex items-center">
              <span className="font-bold mr-2">↑↓ 或 W/S</span>
              <span>上下移動球拍</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-2">空白鍵</span>
              <span>開始遊戲</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-pickleball-50 rounded-xl p-4 border-2 border-pickleball-200">
          <div className="flex items-start space-x-2">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-1">遊戲提示：</p>
              <ul className="space-y-1">
                <li>• 這是簡化版的乒乓球式匹克球遊戲</li>
                <li>• 使用上下鍵控制球拍移動接球</li>
                <li>• 球會自動反彈，你只需要接住它</li>
                <li>• 在球拍不同位置接球會改變球的角度</li>
                <li>• 盡量讓對手接不到球來得分！</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickleballGame;
