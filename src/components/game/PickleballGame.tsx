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
  PADDLE_WIDTH: 25,
  PADDLE_HEIGHT: 100,
  SPEED: 10,
};

const BALL = {
  RADIUS: 14,
  GRAVITY: 0.25,
  BOUNCE: 0.78,
  INITIAL_VX: 6,
  INITIAL_VY: -8,
};

interface GameObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

type GamePhase = 'serve' | 'return' | 'third-shot' | 'rally';

const PickleballGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [gameState, setGameState] = useState<'ready' | 'serving-drop' | 'serving-ready' | 'playing' | 'point'>('ready');
  const [message, setMessage] = useState('按空白鍵開始發球（球會先掉落）');

  // 遊戲狀態
  const gameLoop = useRef<number | undefined>(undefined);
  const keys = useRef<Set<string>>(new Set());

  // 匹克球規則狀態
  const gamePhase = useRef<GamePhase>('serve');
  const bounceCount = useRef(0);
  const lastHitter = useRef<'player' | 'opponent' | null>(null);
  const canHit = useRef(true); // 是否可以擊球
  const mustBounce = useRef(true); // 是否必須彈地

  // 蓄力系統
  const chargeTime = useRef(0); // 蓄力時間
  const isCharging = useRef(false); // 是否正在蓄力
  const [chargeLevel, setChargeLevel] = useState(0); // 顯示蓄力條

  // 玩家（左側）
  const player = useRef<GameObject>({
    x: 80,
    y: COURT.CENTER_Y + 100,
    vx: 0,
    vy: 0,
  });

  // 對手（右側）- AI
  const opponent = useRef<GameObject>({
    x: COURT.WIDTH - 80,
    y: COURT.CENTER_Y - 100,
    vx: 0,
    vy: 0,
  });

  // 球
  const ball = useRef<GameObject>({
    x: 80,
    y: COURT.CENTER_Y + 50,
    vx: 0,
    vy: 0,
  });

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

  // 繪製球拍（較大的球拍設計）
  const drawPlayer = (ctx: CanvasRenderingContext2D, obj: GameObject, isPlayer: boolean) => {
    const paddleColor = isPlayer ? '#3b82f6' : '#ef4444';
    const paddleAccent = isPlayer ? '#2563eb' : '#dc2626';

    // 球拍外框
    ctx.fillStyle = paddleAccent;
    ctx.roundRect(
      obj.x - PLAYER.PADDLE_WIDTH / 2 - 3,
      obj.y - PLAYER.PADDLE_HEIGHT / 2 - 3,
      PLAYER.PADDLE_WIDTH + 6,
      PLAYER.PADDLE_HEIGHT + 6,
      8
    );
    ctx.fill();

    // 球拍主體
    ctx.fillStyle = paddleColor;
    ctx.roundRect(
      obj.x - PLAYER.PADDLE_WIDTH / 2,
      obj.y - PLAYER.PADDLE_HEIGHT / 2,
      PLAYER.PADDLE_WIDTH,
      PLAYER.PADDLE_HEIGHT,
      6
    );
    ctx.fill();

    // 握把
    ctx.fillStyle = '#1f2937';
    const handleWidth = isPlayer ? -40 : 40;
    const handleX = isPlayer ? obj.x - PLAYER.PADDLE_WIDTH / 2 - 40 : obj.x + PLAYER.PADDLE_WIDTH / 2;
    ctx.roundRect(handleX, obj.y - 12, Math.abs(handleWidth), 24, 4);
    ctx.fill();

    // 握把紋理
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const gripX = handleX + (isPlayer ? 10 : 10) + i * 10;
      ctx.moveTo(gripX, obj.y - 8);
      ctx.lineTo(gripX, obj.y + 8);
      ctx.stroke();
    }
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

  // 檢查是否在廚房區內
  const isInKitchen = (x: number) => {
    return (
      (x > COURT.NET_X - COURT.KITCHEN_WIDTH && x < COURT.NET_X) || // 左側廚房區
      (x > COURT.NET_X && x < COURT.NET_X + COURT.KITCHEN_WIDTH) // 右側廚房區
    );
  };

  // 碰撞檢測：球與球拍（加入匹克球規則）
  const checkPaddleCollision = (paddle: GameObject, isPlayer: boolean) => {
    // 雙彈跳規則檢查
    if (mustBounce.current && bounceCount.current === 0) {
      return false; // 球還沒彈地，不能擊球
    }

    const paddleLeft = paddle.x - PLAYER.PADDLE_WIDTH / 2 - 15;
    const paddleRight = paddle.x + PLAYER.PADDLE_WIDTH / 2 + 15;
    const paddleTop = paddle.y - PLAYER.PADDLE_HEIGHT / 2 - 15;
    const paddleBottom = paddle.y + PLAYER.PADDLE_HEIGHT / 2 + 15;

    const ballInPaddleX = ball.current.x > paddleLeft && ball.current.x < paddleRight;
    const ballInPaddleY = ball.current.y > paddleTop && ball.current.y < paddleBottom;

    if (ballInPaddleX && ballInPaddleY && canHit.current) {
      // 檢查廚房區規則：如果球沒有彈地（截擊），且在廚房區內，則犯規
      if (bounceCount.current === 0 && isInKitchen(paddle.x)) {
        // 廚房區截擊犯規
        const winner = isPlayer ? 'opponent' : 'player';
        setScore((s) => ({ ...s, [winner]: s[winner] + 1 }));
        setMessage(`廚房區截擊犯規！${isPlayer ? '對手' : '你'}得分`);
        setGameState('point');
        return true;
      }

      // 擊中球拍 - 反彈
      const direction = isPlayer ? 1 : -1;

      // 計算蓄力加成（玩家專用）
      const chargePower = isPlayer ? (1 + chargeTime.current * 0.8) : 1;
      const baseSpeed = isPlayer ? 6 : 8; // 提高對手擊球速度

      ball.current.vx = direction * baseSpeed * chargePower;

      // 根據擊球位置調整垂直速度
      const hitPosition = (ball.current.y - paddle.y) / (PLAYER.PADDLE_HEIGHT / 2);
      // 對手擊球時給予更大的向上力量，確保球能飛回來
      const verticalBoost = isPlayer ? 1 : 1.5;
      ball.current.vy = hitPosition * 3 * chargePower * verticalBoost - 2;

      // 重置蓄力
      if (isPlayer) {
        chargeTime.current = 0;
        isCharging.current = false;
        setChargeLevel(0);
      }

      // 速度限制
      const maxSpeed = 12;
      ball.current.vx = Math.max(-maxSpeed, Math.min(maxSpeed, ball.current.vx));
      ball.current.vy = Math.max(-maxSpeed, Math.min(maxSpeed, ball.current.vy));

      // 確保球離開球拍
      if (isPlayer) {
        ball.current.x = paddleRight + BALL.RADIUS;
      } else {
        ball.current.x = paddleLeft - BALL.RADIUS;
      }

      lastHitter.current = isPlayer ? 'player' : 'opponent';
      bounceCount.current = 0; // 重置彈跳計數
      canHit.current = false; // 防止重複擊球

      // 更新遊戲階段
      if (gamePhase.current === 'serve') {
        gamePhase.current = 'return';
        mustBounce.current = true; // 接發球必須彈地
      } else if (gamePhase.current === 'return') {
        gamePhase.current = 'third-shot';
        mustBounce.current = true; // 第三球必須彈地
      } else if (gamePhase.current === 'third-shot') {
        gamePhase.current = 'rally';
        mustBounce.current = false; // 進入對打階段，可以截擊
      }

      return true;
    }
    return false;
  };

  // AI 對手邏輯（改善版）
  const updateOpponentAI = () => {
    const opp = opponent.current;
    const b = ball.current;

    // AI 追蹤球的位置（上下和左右）
    if (b.vx > 0 && b.x > COURT.NET_X - 100) {
      // 球往對手方向移動 - 積極追球
      // AI 會預測球的落點並移動到那個位置
      const targetY = b.y;
      // AI 根據球的距離調整位置：遠距離時往後退，近距離時往前衝
      const distanceFromNet = b.x - COURT.NET_X;
      let targetX: number;

      if (distanceFromNet < 150) {
        // 球靠近球網，AI 往前移動
        targetX = COURT.NET_X + COURT.KITCHEN_WIDTH + 50;
      } else if (distanceFromNet < 300) {
        // 中距離
        targetX = COURT.WIDTH - 150;
      } else {
        // 球在後場，AI 往後退
        targetX = COURT.WIDTH - 80;
      }

      // Y 軸追蹤 - 更積極
      const diffY = targetY - opp.y;
      if (Math.abs(diffY) > 5) {
        opp.vy = diffY > 0 ? PLAYER.SPEED * 1.0 : -PLAYER.SPEED * 1.0;
      } else {
        opp.vy = 0;
      }

      // X 軸追蹤 - 更積極的左右移動
      const diffX = targetX - opp.x;
      if (Math.abs(diffX) > 15) {
        opp.vx = diffX > 0 ? PLAYER.SPEED * 0.8 : -PLAYER.SPEED * 0.8;
      } else {
        opp.vx = 0;
      }
    } else {
      // 回到預設位置（中後場）
      const defaultX = COURT.WIDTH - 100;
      const defaultY = COURT.CENTER_Y;

      const diffY = defaultY - opp.y;
      if (Math.abs(diffY) > 10) {
        opp.vy = diffY > 0 ? PLAYER.SPEED * 0.5 : -PLAYER.SPEED * 0.5;
      } else {
        opp.vy = 0;
      }

      const diffX = defaultX - opp.x;
      if (Math.abs(diffX) > 15) {
        opp.vx = diffX > 0 ? PLAYER.SPEED * 0.5 : -PLAYER.SPEED * 0.5;
      } else {
        opp.vx = 0;
      }
    }

    opp.x += opp.vx;
    opp.y += opp.vy;

    // 限制範圍（對手可以在右半場移動）
    opp.x = Math.max(COURT.NET_X + 50, Math.min(COURT.WIDTH - PLAYER.PADDLE_WIDTH / 2, opp.x));
    opp.y = Math.max(PLAYER.PADDLE_HEIGHT / 2, Math.min(COURT.HEIGHT - PLAYER.PADDLE_HEIGHT / 2, opp.y));
  };

  // 更新遊戲邏輯
  const update = useCallback(() => {
    // 處理發球掉落階段
    if (gameState === 'serving-drop') {
      // 球自由落下
      ball.current.vy += BALL.GRAVITY;
      ball.current.y += ball.current.vy;

      // 當球落地後，立即進入準備擊球階段
      if (ball.current.y >= COURT.HEIGHT - BALL.RADIUS) {
        ball.current.y = COURT.HEIGHT - BALL.RADIUS;
        ball.current.vy = 0; // 停止球的移動
        ball.current.vx = 0;
        setGameState('serving-ready');
        setMessage('按空白鍵擊球發球到對角！');
      }
      return;
    }

    if (gameState !== 'playing' && gameState !== 'serving-ready') return;

    // 玩家移動（上下左右）- 發球準備階段也可以移動
    if (keys.current.has('ArrowUp') || keys.current.has('w') || keys.current.has('W')) {
      player.current.y -= PLAYER.SPEED;
    }
    if (keys.current.has('ArrowDown') || keys.current.has('s') || keys.current.has('S')) {
      player.current.y += PLAYER.SPEED;
    }
    if (keys.current.has('ArrowLeft') || keys.current.has('a') || keys.current.has('A')) {
      player.current.x -= PLAYER.SPEED;
    }
    if (keys.current.has('ArrowRight') || keys.current.has('d') || keys.current.has('D')) {
      player.current.x += PLAYER.SPEED;
    }

    // 限制玩家範圍
    player.current.x = Math.max(
      PLAYER.PADDLE_WIDTH / 2,
      Math.min(COURT.WIDTH / 2 - 50, player.current.x) // 限制在左半場
    );
    player.current.y = Math.max(
      PLAYER.PADDLE_HEIGHT / 2,
      Math.min(COURT.HEIGHT - PLAYER.PADDLE_HEIGHT / 2, player.current.y)
    );

    // 如果還在發球準備階段，球跟著玩家移動
    if (gameState === 'serving-ready') {
      ball.current.x = player.current.x + 30;
      ball.current.y = player.current.y;
      return;
    }

    // 蓄力系統更新（只有在 playing 階段才能蓄力）
    if (isCharging.current && chargeTime.current < 2 && gameState === 'playing') {
      chargeTime.current += 0.05;
      setChargeLevel(Math.min(chargeTime.current / 2, 1));
    }

    // AI 對手
    updateOpponentAI();

    // 球物理
    ball.current.vy += BALL.GRAVITY; // 重力
    ball.current.x += ball.current.vx;
    ball.current.y += ball.current.vy;

    // 球與地面碰撞（彈地）
    if (ball.current.y > COURT.HEIGHT - BALL.RADIUS) {
      ball.current.y = COURT.HEIGHT - BALL.RADIUS;
      ball.current.vy *= -BALL.BOUNCE;
      bounceCount.current++;
      canHit.current = true; // 彈地後可以擊球

      // 檢查是否彈地兩次（失分）- 修正邏輯
      if (bounceCount.current >= 2) {
        // 球在哪邊彈地兩次，那邊就失分
        let winner: 'player' | 'opponent';
        if (ball.current.x < COURT.NET_X) {
          // 球在左側（玩家側）彈地兩次，玩家失分
          winner = 'opponent';
        } else {
          // 球在右側（對手側）彈地兩次，對手失分
          winner = 'player';
        }
        setScore((s) => ({ ...s, [winner]: s[winner] + 1 }));
        setMessage(`球彈地兩次！${winner === 'player' ? '你' : '對手'}得分`);
        setGameState('point');
        return;
      }
    }

    // 球與上邊界碰撞
    if (ball.current.y < BALL.RADIUS) {
      ball.current.y = BALL.RADIUS;
      ball.current.vy *= -BALL.BOUNCE;
    }

    // 球與球拍碰撞
    checkPaddleCollision(player.current, true);
    checkPaddleCollision(opponent.current, false);

    // 球出界判定（左右）
    if (ball.current.x < -BALL.RADIUS) {
      // 對手得分
      setScore((s) => ({ ...s, opponent: s.opponent + 1 }));
      setMessage('球出界！對手得分');
      setGameState('point');
    } else if (ball.current.x > COURT.WIDTH + BALL.RADIUS) {
      // 玩家得分
      setScore((s) => ({ ...s, player: s.player + 1 }));
      setMessage('球出界！你得分');
      setGameState('point');
    }

    // 球網碰撞檢測
    if (
      Math.abs(ball.current.x - COURT.NET_X) < 10 &&
      ball.current.y > COURT.HEIGHT - 40 &&
      Math.abs(ball.current.vx) < 3
    ) {
      const winner = lastHitter.current === 'player' ? 'opponent' : 'player';
      setScore((s) => ({ ...s, [winner]: s[winner] + 1 }));
      setMessage('球掛網！');
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

    // 繪製球（在所有狀態下除了 ready）
    if (gameState !== 'ready') {
      drawBall(ctx);
    }

    // 繪製計分板
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(COURT.WIDTH / 2 - 100, 10, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${score.player} - ${score.opponent}`, COURT.WIDTH / 2, 45);

    // 繪製蓄力條
    if (chargeLevel > 0) {
      const barWidth = 150;
      const barHeight = 20;
      const barX = player.current.x - barWidth / 2;
      const barY = player.current.y - PLAYER.PADDLE_HEIGHT / 2 - 35;

      // 背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.roundRect(barX, barY, barWidth, barHeight, 10);
      ctx.fill();

      // 蓄力進度
      const chargeColor = chargeLevel < 0.5 ? '#fbbf24' : chargeLevel < 0.8 ? '#f59e0b' : '#ef4444';
      ctx.fillStyle = chargeColor;
      ctx.roundRect(barX + 2, barY + 2, (barWidth - 4) * chargeLevel, barHeight - 4, 8);
      ctx.fill();

      // 文字
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('蓄力', barX + barWidth / 2, barY + 14);
    }
  }, [gameState, score, chargeLevel]);

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
      // 非空白鍵的一般按鍵處理
      if (e.key !== ' ' && e.key !== 'Enter') {
        keys.current.add(e.key);
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();

        // 防止重複觸發
        if (keys.current.has(e.key)) return;
        keys.current.add(e.key);

        if (gameState === 'ready' || gameState === 'point') {
          // 第一階段：開始發球（球掉落）
          gamePhase.current = 'serve';
          bounceCount.current = 0;
          mustBounce.current = true;
          canHit.current = true;

          // 球在玩家上方
          ball.current.x = player.current.x + 30;
          ball.current.y = player.current.y - 100; // 從玩家上方掉落
          ball.current.vx = 0;
          ball.current.vy = 0;

          lastHitter.current = 'player';
          setGameState('serving-drop');
          setMessage('球正在掉落...');
        } else if (gameState === 'serving-ready') {
          // 第二階段：擊球發球到對角線
          // 計算斜對角方向（發到右上或右下的對角）
          const targetY = player.current.y < COURT.CENTER_Y ? COURT.HEIGHT * 0.75 : COURT.HEIGHT * 0.25;
          const dx = COURT.WIDTH * 0.85 - ball.current.x;
          const dy = targetY - ball.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // 發球到對角線
          ball.current.vx = (dx / distance) * 8;
          ball.current.vy = (dy / distance) * 8 - 2; // 稍微向下以符合拋物線

          setGameState('playing');
          setMessage('');
        } else if (gameState === 'playing') {
          // 遊戲中按住空白鍵開始蓄力
          if (!isCharging.current) {
            isCharging.current = true;
            chargeTime.current = 0;
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key);

      // 放開空白鍵停止蓄力
      if (e.key === ' ' && gameState === 'playing') {
        isCharging.current = false;
      }
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
              <span className="font-bold mr-2">↑↓←→ 或 WASD</span>
              <span>四方向移動球拍</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-2">空白鍵（第一次）</span>
              <span>球開始掉落</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-2">空白鍵（第二次）</span>
              <span>擊球發球到對角線</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-2">空白鍵（長按）</span>
              <span className="text-yellow-600">⚡ 對打時蓄力擊球（最高1.8倍威力）</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-pickleball-50 rounded-xl p-4 border-2 border-pickleball-200">
          <div className="flex items-start space-x-2">
            <span className="text-2xl">📖</span>
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-2">匹克球規則：</p>
              <ul className="space-y-1">
                <li>• <strong>兩段式發球</strong>：第一次按空白鍵球掉落，第二次按擊球發出</li>
                <li>• <strong>對角發球</strong>：發球會自動往對角線方向飛行</li>
                <li>• <strong>雙彈跳規則</strong>：發球和接發球都必須等球彈地後才能擊球</li>
                <li>• <strong>第三球</strong>：發球方回擊時也必須等球彈地</li>
                <li>• <strong>廚房區</strong>：黃色區域內不能截擊（球沒彈地直接打）</li>
                <li>• <strong>單彈跳</strong>：球只能彈地一次，彈兩次失分</li>
                <li>• 進入對打後可以截擊，但要避開廚房區！</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickleballGame;
