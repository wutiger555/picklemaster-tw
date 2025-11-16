import { useEffect, useRef, useState, useCallback } from 'react';

// 球場配置（符合標準匹克球場規格）
const COURT = {
  WIDTH: 600,
  HEIGHT: 1320, // 44英尺 x 30像素/英尺
  BASELINE_Y: 60,
  NET_Y: 660, // 中線
  KITCHEN_DEPTH: 210, // 7英尺 x 30
  SERVICE_DEPTH: 450, // 15英尺 x 30
  LINE_WIDTH: 6, // 2英寸
  CENTER_X: 300,
};

// 遊戲物件配置
const PLAYER = {
  WIDTH: 40,
  HEIGHT: 60,
  SPEED: 8,
  PADDLE_WIDTH: 60,
  PADDLE_HEIGHT: 80,
};

const BALL = {
  RADIUS: 12,
  GRAVITY: 0.5,
  BOUNCE: 0.7,
  MAX_SPEED: 15,
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
  const [gameState, setGameState] = useState<'ready' | 'serving' | 'playing' | 'point'>('ready');
  const [message, setMessage] = useState('按下空白鍵開始發球');

  // 遊戲狀態
  const gameLoop = useRef<number | undefined>(undefined);
  const keys = useRef<Set<string>>(new Set());

  // 玩家（下方）
  const player = useRef<GameObject>({
    x: COURT.CENTER_X,
    y: COURT.HEIGHT - 100,
    vx: 0,
    vy: 0,
  });

  // 對手（上方）- AI
  const opponent = useRef<GameObject>({
    x: COURT.CENTER_X,
    y: 100,
    vx: 0,
    vy: 0,
  });

  // 球
  const ball = useRef<GameObject>({
    x: COURT.CENTER_X,
    y: COURT.HEIGHT - 200,
    vx: 0,
    vy: 0,
  });

  // 揮拍狀態
  const playerSwing = useRef(0);
  const opponentSwing = useRef(0);

  // 遊戲規則狀態
  const bounceCount = useRef(0); // 雙彈地規則計數
  const lastHitter = useRef<'player' | 'opponent' | null>(null);

  // 繪製球場
  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    // 背景
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, COURT.WIDTH, COURT.HEIGHT);

    // 外框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = COURT.LINE_WIDTH;
    ctx.strokeRect(0, 0, COURT.WIDTH, COURT.HEIGHT);

    // 球網
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, COURT.NET_Y - 4, COURT.WIDTH, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, COURT.NET_Y - 2, COURT.WIDTH, 4);

    // 廚房區線（上半場）
    const kitchenTopY = COURT.NET_Y - COURT.KITCHEN_DEPTH;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, kitchenTopY);
    ctx.lineTo(COURT.WIDTH, kitchenTopY);
    ctx.stroke();

    // 廚房區線（下半場）
    const kitchenBottomY = COURT.NET_Y + COURT.KITCHEN_DEPTH;
    ctx.beginPath();
    ctx.moveTo(0, kitchenBottomY);
    ctx.lineTo(COURT.WIDTH, kitchenBottomY);
    ctx.stroke();

    // 廚房區標記（半透明）
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.fillRect(0, kitchenTopY, COURT.WIDTH, COURT.KITCHEN_DEPTH);
    ctx.fillRect(0, COURT.NET_Y, COURT.WIDTH, COURT.KITCHEN_DEPTH);

    // 中線（虛線）- 上半場
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(COURT.CENTER_X, 0);
    ctx.lineTo(COURT.CENTER_X, kitchenTopY);
    ctx.stroke();

    // 中線（虛線）- 下半場
    ctx.beginPath();
    ctx.moveTo(COURT.CENTER_X, kitchenBottomY);
    ctx.lineTo(COURT.CENTER_X, COURT.HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // 繪製玩家
  const drawPlayer = (ctx: CanvasRenderingContext2D, obj: GameObject, isPlayer: boolean, swingAngle: number) => {
    const paddleColor = isPlayer ? '#3b82f6' : '#ef4444';
    const bodyColor = isPlayer ? '#60a5fa' : '#f87171';

    // 身體
    ctx.fillStyle = bodyColor;
    ctx.fillRect(obj.x - PLAYER.WIDTH / 2, obj.y - PLAYER.HEIGHT / 2, PLAYER.WIDTH, PLAYER.HEIGHT);

    // 頭
    ctx.beginPath();
    ctx.arc(obj.x, obj.y - PLAYER.HEIGHT / 2 - 15, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // 球拍
    const paddleX = obj.x + Math.cos(swingAngle) * 50;
    const paddleY = obj.y + Math.sin(swingAngle) * 50;

    ctx.save();
    ctx.translate(paddleX, paddleY);
    ctx.rotate(swingAngle);

    // 拍面
    ctx.fillStyle = paddleColor;
    ctx.fillRect(-PLAYER.PADDLE_WIDTH / 2, -PLAYER.PADDLE_HEIGHT / 2, PLAYER.PADDLE_WIDTH, PLAYER.PADDLE_HEIGHT);

    // 握把
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-5, PLAYER.PADDLE_HEIGHT / 2, 10, 30);

    ctx.restore();
  };

  // 繪製球
  const drawBall = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL.RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 球上的孔洞效果
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const holeX = ball.current.x + Math.cos(angle) * 8;
      const holeY = ball.current.y + Math.sin(angle) * 8;
      ctx.beginPath();
      ctx.arc(holeX, holeY, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#111';
      ctx.fill();
    }
  };

  // 碰撞檢測：球與球拍
  const checkPaddleCollision = (paddle: GameObject, isPlayer: boolean) => {
    const swingAngle = isPlayer ? playerSwing.current : opponentSwing.current;
    const paddleX = paddle.x + Math.cos(swingAngle) * 50;
    const paddleY = paddle.y + Math.sin(swingAngle) * 50;

    const dx = ball.current.x - paddleX;
    const dy = ball.current.y - paddleY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < BALL.RADIUS + PLAYER.PADDLE_WIDTH / 2) {
      // 擊中球拍
      const angle = Math.atan2(dy, dx);
      const speed = Math.sqrt(ball.current.vx ** 2 + ball.current.vy ** 2);
      const newSpeed = Math.min(speed * 1.2 + 2, BALL.MAX_SPEED);

      ball.current.vx = Math.cos(angle) * newSpeed;
      ball.current.vy = Math.sin(angle) * newSpeed;

      lastHitter.current = isPlayer ? 'player' : 'opponent';

      // 重置彈跳計數
      if (bounceCount.current < 2) {
        bounceCount.current = 0;
      }

      return true;
    }
    return false;
  };

  // AI 對手邏輯
  const updateOpponentAI = () => {
    const opp = opponent.current;
    const b = ball.current;

    // 如果球在對手半場且向上飛，AI 追蹤球
    if (b.y < COURT.NET_Y && b.vy < 0) {
      if (b.x < opp.x - 20) {
        opp.vx = -PLAYER.SPEED * 0.8;
      } else if (b.x > opp.x + 20) {
        opp.vx = PLAYER.SPEED * 0.8;
      } else {
        opp.vx = 0;
        // AI 揮拍
        if (Math.abs(b.y - opp.y) < 80 && Math.abs(b.x - opp.x) < 60) {
          opponentSwing.current = Math.PI / 4;
        }
      }
    } else {
      // 回到中場
      if (opp.x < COURT.CENTER_X - 20) {
        opp.vx = PLAYER.SPEED * 0.5;
      } else if (opp.x > COURT.CENTER_X + 20) {
        opp.vx = -PLAYER.SPEED * 0.5;
      } else {
        opp.vx = 0;
      }
    }

    opp.x += opp.vx;
    opp.x = Math.max(PLAYER.WIDTH / 2, Math.min(COURT.WIDTH - PLAYER.WIDTH / 2, opp.x));

    // 揮拍動畫復原
    if (opponentSwing.current > 0) {
      opponentSwing.current -= 0.1;
    }
  };

  // 更新遊戲邏輯
  const update = useCallback(() => {
    if (gameState !== 'playing' && gameState !== 'serving') return;

    // 玩家移動
    if (keys.current.has('ArrowLeft')) {
      player.current.x -= PLAYER.SPEED;
    }
    if (keys.current.has('ArrowRight')) {
      player.current.x += PLAYER.SPEED;
    }
    if (keys.current.has(' ')) {
      playerSwing.current = -Math.PI / 4;
    }

    player.current.x = Math.max(PLAYER.WIDTH / 2, Math.min(COURT.WIDTH - PLAYER.WIDTH / 2, player.current.x));

    // 揮拍動畫復原
    if (playerSwing.current < 0) {
      playerSwing.current += 0.1;
    }

    // AI 對手
    updateOpponentAI();

    // 球物理
    if (gameState === 'playing') {
      ball.current.vy += BALL.GRAVITY;
      ball.current.x += ball.current.vx;
      ball.current.y += ball.current.vy;

      // 球與球拍碰撞
      checkPaddleCollision(player.current, true);
      checkPaddleCollision(opponent.current, false);

      // 球與地面碰撞
      if (ball.current.y > COURT.HEIGHT - BALL.RADIUS) {
        ball.current.y = COURT.HEIGHT - BALL.RADIUS;
        ball.current.vy *= -BALL.BOUNCE;
        bounceCount.current++;

        // 判定得分
        if (lastHitter.current === 'player') {
          setScore(s => ({ ...s, opponent: s.opponent + 1 }));
          setMessage('對手得分！');
          setGameState('point');
        }
      } else if (ball.current.y < BALL.RADIUS) {
        ball.current.y = BALL.RADIUS;
        ball.current.vy *= -BALL.BOUNCE;
        bounceCount.current++;

        // 判定得分
        if (lastHitter.current === 'opponent') {
          setScore(s => ({ ...s, player: s.player + 1 }));
          setMessage('你得分了！');
          setGameState('point');
        }
      }

      // 球與邊界碰撞
      if (ball.current.x < BALL.RADIUS || ball.current.x > COURT.WIDTH - BALL.RADIUS) {
        ball.current.vx *= -1;
        ball.current.x = Math.max(BALL.RADIUS, Math.min(COURT.WIDTH - BALL.RADIUS, ball.current.x));
      }

      // 球網碰撞
      if (Math.abs(ball.current.y - COURT.NET_Y) < 10 && Math.abs(ball.current.vy) < 5) {
        if (lastHitter.current === 'player') {
          setScore(s => ({ ...s, opponent: s.opponent + 1 }));
          setMessage('球掛網！對手得分');
        } else {
          setScore(s => ({ ...s, player: s.player + 1 }));
          setMessage('球掛網！你得分');
        }
        setGameState('point');
      }
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
    drawPlayer(ctx, opponent.current, false, opponentSwing.current);
    drawPlayer(ctx, player.current, true, playerSwing.current);

    // 繪製球
    if (gameState === 'playing' || gameState === 'serving') {
      drawBall(ctx);
    }

    // 繪製計分板
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(COURT.WIDTH / 2 - 100, 10, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${score.opponent} - ${score.player}`, COURT.WIDTH / 2, 42);
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

      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'ready') {
          // 開始發球
          ball.current.x = player.current.x;
          ball.current.y = player.current.y - 100;
          ball.current.vx = (Math.random() - 0.5) * 4;
          ball.current.vy = -12;
          lastHitter.current = 'player';
          bounceCount.current = 0;
          setGameState('playing');
          setMessage('');
        } else if (gameState === 'point') {
          // 重新開始
          ball.current.x = COURT.CENTER_X;
          ball.current.y = COURT.HEIGHT - 200;
          ball.current.vx = 0;
          ball.current.vy = 0;
          setGameState('ready');
          setMessage('按下空白鍵開始發球');
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
    <div className="w-full max-w-3xl mx-auto">
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
          />
        </div>

        {message && (
          <div className="bg-gradient-to-r from-pickleball-500 to-sport-500 text-white px-6 py-3 rounded-full text-center font-bold text-lg mb-4 animate-bounce">
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
              <span className="font-bold mr-2">←→</span>
              <span>左右移動</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-2">空白鍵</span>
              <span>揮拍 / 發球</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-pickleball-50 rounded-xl p-4 border-2 border-pickleball-200">
          <div className="flex items-start space-x-2">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-1">遊戲提示：</p>
              <ul className="space-y-1">
                <li>• 使用左右鍵控制玩家移動</li>
                <li>• 按空白鍵揮拍擊球</li>
                <li>• 將球打到對手場地得分</li>
                <li>• 盡量避開廚房區（黃色區域）截擊</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickleballGame;
