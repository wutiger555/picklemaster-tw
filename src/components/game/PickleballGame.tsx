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
  PADDLE_WIDTH: 60,  // 增大球拍寬度，更接近真實匹克球拍
  PADDLE_HEIGHT: 90, // 調整球拍高度
  SPEED: 10,
};

const BALL = {
  RADIUS: 14,
  GRAVITY: 0.35, // 3D高度的重力加速度（降低讓球飛更遠）
  BOUNCE: 0.85, // 彈性係數（提高讓球彈更遠）
  INITIAL_VX: 6,
  INITIAL_VY: -8,
  SHADOW_OFFSET: 0.3, // 陰影偏移比例
};

// 【重要】3D俯視球物件（加入Z軸高度）
interface GameObject {
  x: number;  // 球場X軸位置（左右）
  y: number;  // 球場Y軸位置（前後）
  vx: number; // X軸速度
  vy: number; // Y軸速度
}

interface Ball3D extends GameObject {
  z: number;  // 高度（Z軸，垂直於球場）
  vz: number; // 垂直速度
}

type GamePhase = 'serve' | 'return' | 'third-shot' | 'rally';
type GameScreen = 'intro' | 'game' | 'game-over';

// 匹克球比賽規則
const GAME_RULES = {
  WIN_SCORE: 11, // 11分制
  MIN_LEAD: 2,   // 至少領先2分
};

const PickleballGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [gameScreen, setGameScreen] = useState<GameScreen>('intro');
  const [gameState, setGameState] = useState<'ready' | 'serving-drop' | 'serving-ready' | 'playing' | 'point'>('ready');
  const [message, setMessage] = useState('點擊「發球」按鈕或按空白鍵開始發球');
  const [serverSide, setServerSide] = useState<'player' | 'opponent'>('player');
  // const [servePower, setServePower] = useState<'short' | 'long'>('long'); // 發球力度（未來功能）
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  // 遊戲狀態
  const gameLoop = useRef<number | undefined>(undefined);
  const keys = useRef<Set<string>>(new Set());

  // 匹克球規則狀態
  const gamePhase = useRef<GamePhase>('serve');
  const bounceCount = useRef(0);
  const lastHitter = useRef<'player' | 'opponent' | null>(null);
  const canHit = useRef(true); // 是否可以擊球
  const mustBounce = useRef(true); // 是否必須彈地

  // 滑鼠控制
  const mouseY = useRef<number | null>(null);
  const mouseX = useRef<number | null>(null);

  // 揮拍機制
  const isSwinging = useRef(false); // 是否正在揮拍
  const swingProgress = useRef(0); // 揮拍進度 0-1
  const opponentSwingProgress = useRef(0); // 對手揮拍進度

  // 玩家（左側）- 初始位置在底線發球區
  const player = useRef<GameObject>({
    x: 50, // 底線附近
    y: COURT.CENTER_Y + 100,
    vx: 0,
    vy: 0,
  });

  // 對手（右側）- AI
  const opponent = useRef<GameObject>({
    x: COURT.WIDTH - 50, // 底線附近
    y: COURT.CENTER_Y - 100,
    vx: 0,
    vy: 0,
  });

  // 【3D俯視】球（加入Z軸高度）
  const ball = useRef<Ball3D>({
    x: 50,
    y: COURT.CENTER_Y + 50,
    z: 0,   // 初始在地面
    vx: 0,
    vy: 0,
    vz: 0,  // 初始無垂直速度
  });

  // 繪製球場（橫向）
  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    // 背景 - 增加球場紋理感
    const gradient = ctx.createLinearGradient(0, 0, COURT.WIDTH, COURT.HEIGHT);
    gradient.addColorStop(0, '#16803d');
    gradient.addColorStop(0.5, '#15803d');
    gradient.addColorStop(1, '#14702d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, COURT.WIDTH, COURT.HEIGHT);

    // 外框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = COURT.LINE_WIDTH;
    ctx.strokeRect(0, 0, COURT.WIDTH, COURT.HEIGHT);

    // 球網柱子（左邊）
    ctx.fillStyle = '#374151';
    ctx.fillRect(COURT.NET_X - 8, -10, 6, 10);
    ctx.fillRect(COURT.NET_X - 8, COURT.HEIGHT, 6, 10);

    // 球網柱子（右邊）
    ctx.fillRect(COURT.NET_X + 2, -10, 6, 10);
    ctx.fillRect(COURT.NET_X + 2, COURT.HEIGHT, 6, 10);

    // 球網 - 更真實的網狀結構
    // 網子背景
    ctx.fillStyle = 'rgba(31, 41, 55, 0.3)';
    ctx.fillRect(COURT.NET_X - 3, 0, 6, COURT.HEIGHT);

    // 網格線條（垂直）
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.6)';
    ctx.lineWidth = 1;
    for (let y = 0; y < COURT.HEIGHT; y += 15) {
      ctx.beginPath();
      ctx.moveTo(COURT.NET_X - 3, y);
      ctx.lineTo(COURT.NET_X + 3, y);
      ctx.stroke();
    }

    // 網格線條（對角線，增加立體感）
    for (let y = 0; y < COURT.HEIGHT; y += 15) {
      ctx.beginPath();
      ctx.moveTo(COURT.NET_X - 3, y);
      ctx.lineTo(COURT.NET_X + 3, y + 7.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(COURT.NET_X + 3, y);
      ctx.lineTo(COURT.NET_X - 3, y + 7.5);
      ctx.stroke();
    }

    // 網子上緣（白色）
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(COURT.NET_X, 0);
    ctx.lineTo(COURT.NET_X, COURT.HEIGHT);
    ctx.stroke();

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

  // 繪製球拍（真實匹克球拍設計 - 圓角矩形直立樣式 + 改良揮拍動畫）
  const drawPlayer = (ctx: CanvasRenderingContext2D, obj: GameObject, isPlayer: boolean) => {
    const paddleColor = isPlayer ? '#3b82f6' : '#ef4444';
    const paddleAccent = isPlayer ? '#2563eb' : '#dc2626';
    const paddleDark = isPlayer ? '#1e40af' : '#991b1b';

    // 【改良】揮拍動畫：更自然的前後揮動，減少旋轉
    const swing = isPlayer ? swingProgress.current : opponentSwingProgress.current;
    const swingOffset = swing * 20; // 前後揮動距離
    const swingAngle = swing * Math.PI / 12; // 減少旋轉角度（15度）

    ctx.save();

    // 應用揮拍變換
    ctx.translate(obj.x, obj.y);
    // 前後移動
    ctx.translate(isPlayer ? swingOffset : -swingOffset, 0);
    // 輕微旋轉
    ctx.rotate(isPlayer ? swingAngle : -swingAngle);
    ctx.translate(-obj.x, -obj.y);

    // 球拍陰影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10 + swing * 5;
    ctx.shadowOffsetX = isPlayer ? 4 : -4;
    ctx.shadowOffsetY = 4;

    // 【新】揮拍軌跡殘影（圓角矩形）
    if (swing > 0.4) {
      ctx.globalAlpha = 0.25 * swing;
      ctx.fillStyle = paddleColor;
      const offsetX = isPlayer ? -10 : 10;
      ctx.roundRect(
        obj.x - PLAYER.PADDLE_WIDTH / 2 + offsetX,
        obj.y - PLAYER.PADDLE_HEIGHT / 2,
        PLAYER.PADDLE_WIDTH,
        PLAYER.PADDLE_HEIGHT,
        12
      );
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 【新】球拍外框（深色邊框）
    ctx.fillStyle = paddleDark;
    ctx.roundRect(
      obj.x - PLAYER.PADDLE_WIDTH / 2 - 2,
      obj.y - PLAYER.PADDLE_HEIGHT / 2 - 2,
      PLAYER.PADDLE_WIDTH + 4,
      PLAYER.PADDLE_HEIGHT + 4,
      14
    );
    ctx.fill();

    // 【新】球拍主體（圓角矩形）
    ctx.fillStyle = paddleAccent;
    ctx.roundRect(
      obj.x - PLAYER.PADDLE_WIDTH / 2,
      obj.y - PLAYER.PADDLE_HEIGHT / 2,
      PLAYER.PADDLE_WIDTH,
      PLAYER.PADDLE_HEIGHT,
      12
    );
    ctx.fill();

    // 【新】球拍面（內框效果）
    ctx.fillStyle = paddleColor;
    ctx.roundRect(
      obj.x - PLAYER.PADDLE_WIDTH / 2 + 4,
      obj.y - PLAYER.PADDLE_HEIGHT / 2 + 4,
      PLAYER.PADDLE_WIDTH - 8,
      PLAYER.PADDLE_HEIGHT - 8,
      10
    );
    ctx.fill();

    // 【新】蜂窩孔洞紋理（匹克球拍的特徵）
    ctx.fillStyle = paddleAccent;
    const holeSize = 3;
    const holeSpacing = 9;
    for (let gx = -PLAYER.PADDLE_WIDTH / 2 + 12; gx < PLAYER.PADDLE_WIDTH / 2 - 12; gx += holeSpacing) {
      for (let gy = -PLAYER.PADDLE_HEIGHT / 2 + 12; gy < PLAYER.PADDLE_HEIGHT / 2 - 12; gy += holeSpacing) {
        ctx.beginPath();
        ctx.arc(obj.x + gx, obj.y + gy, holeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 【新】品牌標誌區（中心裝飾）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.roundRect(
      obj.x - 15,
      obj.y - 10,
      30,
      20,
      5
    );
    ctx.fill();

    // 【新】握把（改為從球拍下方延伸）
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#2d3748';
    const handleWidth = 18;
    const handleLength = 40;
    const handleY = obj.y + PLAYER.PADDLE_HEIGHT / 2;
    ctx.roundRect(
      obj.x - handleWidth / 2,
      handleY,
      handleWidth,
      handleLength,
      5
    );
    ctx.fill();

    // 握把紋理（橫向凹槽）
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const gripY = handleY + 5 + i * 6;
      ctx.beginPath();
      ctx.moveTo(obj.x - handleWidth / 2 + 2, gripY);
      ctx.lineTo(obj.x + handleWidth / 2 - 2, gripY);
      ctx.stroke();
    }

    // 握把末端（圓形cap）
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(obj.x, handleY + handleLength, handleWidth / 2 + 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // 恢復變換
  };

  // 【3D俯視】繪製球（含陰影表示高度）
  const drawBall = (ctx: CanvasRenderingContext2D) => {
    const b = ball.current;

    // 【陰影】表示球在地面的真實位置
    if (b.z > 5) { // 只有球在空中時才畫陰影
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      // 陰影大小隨高度變化（高度越高，陰影越小）
      const shadowRadius = BALL.RADIUS * (1 - b.z / 200);
      ctx.arc(b.x, b.y, Math.max(shadowRadius, 5), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 【球本身】根據高度偏移顯示（模擬3D效果）
    // 高度越高，視覺上向左上方偏移
    const visualOffsetX = -b.z * BALL.SHADOW_OFFSET;
    const visualOffsetY = -b.z * BALL.SHADOW_OFFSET;
    const ballX = b.x + visualOffsetX;
    const ballY = b.y + visualOffsetY;

    // 球的大小隨高度略微變化（近大遠小）
    const sizeScale = 1 + (b.z / 300);
    const visualRadius = BALL.RADIUS * sizeScale;

    // 球體
    ctx.beginPath();
    ctx.arc(ballX, ballY, visualRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 球上的孔洞效果
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const holeX = ballX + Math.cos(angle) * (10 * sizeScale);
      const holeY = ballY + Math.sin(angle) * (10 * sizeScale);
      ctx.beginPath();
      ctx.arc(holeX, holeY, 2.5 * sizeScale, 0, Math.PI * 2);
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

  // 加分並檢查遊戲是否結束
  const addPoint = useCallback((side: 'player' | 'opponent') => {
    setScore((s) => {
      const newScore = { ...s, [side]: s[side] + 1 };

      // 檢查遊戲是否結束（11分制，領先2分）
      const playerScore = side === 'player' ? newScore.player : s.player;
      const opponentScore = side === 'opponent' ? newScore.opponent : s.opponent;
      const scoreDiff = Math.abs(playerScore - opponentScore);

      if (
        (playerScore >= GAME_RULES.WIN_SCORE || opponentScore >= GAME_RULES.WIN_SCORE) &&
        scoreDiff >= GAME_RULES.MIN_LEAD
      ) {
        // 遊戲結束
        const gameWinner = playerScore > opponentScore ? 'player' : 'opponent';
        setWinner(gameWinner);
        setGameScreen('game-over');
      }

      return newScore;
    });

    setServerSide(side); // 得分方獲得發球權
  }, []);

  // 【3D俯視】碰撞檢測：球與球拍（矩形碰撞 + Z軸判斷 + 匹克球規則 + 揮拍機制）
  const checkPaddleCollision = (paddle: GameObject, isPlayer: boolean) => {
    const b = ball.current;

    // 雙彈跳規則檢查
    if (mustBounce.current && bounceCount.current === 0) {
      return false; // 球還沒彈地，不能擊球
    }

    // 【關鍵】球必須在合適的高度才能擊球（模擬真實匹克球）
    // Z軸在0-80之間（地面到球拍可達高度）
    if (b.z < 0 || b.z > 80) {
      return false;
    }

    // 矩形碰撞檢測（使用陰影位置，即真實的X,Y位置）
    const paddleLeft = paddle.x - PLAYER.PADDLE_WIDTH / 2;
    const paddleRight = paddle.x + PLAYER.PADDLE_WIDTH / 2;
    const paddleTop = paddle.y - PLAYER.PADDLE_HEIGHT / 2;
    const paddleBottom = paddle.y + PLAYER.PADDLE_HEIGHT / 2;

    const ballLeft = b.x - BALL.RADIUS;
    const ballRight = b.x + BALL.RADIUS;
    const ballTop = b.y - BALL.RADIUS;
    const ballBottom = b.y + BALL.RADIUS;

    const isColliding = !(
      ballRight < paddleLeft ||
      ballLeft > paddleRight ||
      ballBottom < paddleTop ||
      ballTop > paddleBottom
    );

    // 需要揮拍才能擊球
    const currentSwing = isPlayer ? swingProgress.current : opponentSwingProgress.current;
    const canSwing = isPlayer ? isSwinging.current : true; // AI 自動揮拍

    if (isColliding && canHit.current && canSwing && currentSwing > 0.5) {
      // 觸發對手揮拍動畫（如果是AI擊球）
      if (!isPlayer) {
        opponentSwingProgress.current = 1;
      }

      // 擊球後重置玩家揮拍狀態
      if (isPlayer) {
        isSwinging.current = false;
      }
      // 檢查廚房區規則：如果球沒有彈地（截擊），且在廚房區內，則犯規
      if (bounceCount.current === 0 && isInKitchen(paddle.x)) {
        // 廚房區截擊犯規
        const winner = isPlayer ? 'opponent' : 'player';
        addPoint(winner);
        setMessage(`廚房區截擊犯規！${isPlayer ? '對手' : '你'}得分`);
        setGameState('point');
        return true;
      }

      // 【3D俯視】擊中球拍 - 設定3D速度
      const direction = isPlayer ? 1 : -1;
      const baseSpeed = isPlayer ? 5 : 6;

      // X軸速度（左右方向）
      b.vx = direction * baseSpeed;

      // Y軸速度（前後方向）- 根據擊球位置調整
      const hitPosition = (b.y - paddle.y) / (PLAYER.PADDLE_HEIGHT / 2);

      // 玩家可以使用方向鍵控制擊球方向
      let angleControl = 0;
      if (isPlayer) {
        if (keys.current.has('ArrowUp') || keys.current.has('w') || keys.current.has('W')) {
          angleControl = -2; // 往前打
        } else if (keys.current.has('ArrowDown') || keys.current.has('s') || keys.current.has('S')) {
          angleControl = 2; // 往後打
        }
      }

      const verticalBoost = isPlayer ? 1 : 1.5;
      b.vy = hitPosition * 2 * verticalBoost + angleControl;

      // 【關鍵】Z軸速度（向上的速度，讓球飛起來）
      // 基礎向上速度 + 根據當前高度調整
      b.vz = 8 - (b.z / 20); // 球越低，打出去飛得越高

      // 速度限制
      const maxSpeed = 12;
      b.vx = Math.max(-maxSpeed, Math.min(maxSpeed, b.vx));
      b.vy = Math.max(-maxSpeed, Math.min(maxSpeed, b.vy));

      // 確保球離開球拍
      if (isPlayer) {
        b.x = paddleRight + BALL.RADIUS + 5;
      } else {
        b.x = paddleLeft - BALL.RADIUS - 5;
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

  // AI 對手邏輯（大幅改善版 + 修正揮拍問題）
  const updateOpponentAI = () => {
    const opp = opponent.current;
    const b = ball.current;

    // AI 追蹤球的位置（上下和左右）
    if (b.vx > 0 && b.x > COURT.NET_X - 150) {
      // 球往對手方向移動 - 非常積極追球

      // 預測球的未來位置
      const predictedY = b.y + b.vy * 10; // 預測10幀後的位置
      const targetY = Math.max(PLAYER.PADDLE_HEIGHT / 2, Math.min(COURT.HEIGHT - PLAYER.PADDLE_HEIGHT / 2, predictedY));

      // AI 根據球的距離調整位置
      const distanceFromNet = b.x - COURT.NET_X;
      let targetX: number;

      if (distanceFromNet < 150) {
        // 球靠近球網，AI 往前移動
        targetX = COURT.NET_X + COURT.KITCHEN_WIDTH + 50;
      } else if (distanceFromNet < 300) {
        // 中距離 - 最佳擊球位置
        targetX = COURT.WIDTH - 120;
      } else {
        // 球在後場，AI 往後退
        targetX = COURT.WIDTH - 60;
      }

      // Y 軸追蹤 - 非常積極，使用預測位置
      const diffY = targetY - opp.y;
      if (Math.abs(diffY) > 3) {
        opp.vy = diffY > 0 ? PLAYER.SPEED * 1.2 : -PLAYER.SPEED * 1.2; // 提高到1.2倍速度
      } else {
        opp.vy = 0;
      }

      // X 軸追蹤 - 更積極的左右移動
      const diffX = targetX - opp.x;
      if (Math.abs(diffX) > 10) {
        opp.vx = diffX > 0 ? PLAYER.SPEED * 1.0 : -PLAYER.SPEED * 1.0; // 提高到1.0倍速度
      } else {
        opp.vx = 0;
      }

      // 【修正】AI 提前揮拍 - 當球接近時開始揮拍
      const dx = b.x - opp.x;
      const dy = b.y - opp.y;
      const distanceToBall = Math.sqrt(dx * dx + dy * dy);

      // 當球距離在 80 像素內且正在接近時，開始揮拍
      if (distanceToBall < 80 && opponentSwingProgress.current === 0) {
        opponentSwingProgress.current = 1;
      }
    } else {
      // 回到預設位置（中後場）
      const defaultX = COURT.WIDTH - 100;
      const defaultY = COURT.CENTER_Y;

      const diffY = defaultY - opp.y;
      if (Math.abs(diffY) > 10) {
        opp.vy = diffY > 0 ? PLAYER.SPEED * 0.6 : -PLAYER.SPEED * 0.6;
      } else {
        opp.vy = 0;
      }

      const diffX = defaultX - opp.x;
      if (Math.abs(diffX) > 15) {
        opp.vx = diffX > 0 ? PLAYER.SPEED * 0.6 : -PLAYER.SPEED * 0.6;
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
    // 【關鍵】遊戲結束時立即停止所有邏輯
    if (gameScreen === 'game-over') {
      return;
    }

    // 【3D俯視】處理發球掉落階段
    if (gameState === 'serving-drop') {
      const b = ball.current;
      // 球從高處自由落下（只有Z軸運動）
      b.vz -= BALL.GRAVITY;
      b.z += b.vz;

      // 當球落地後，立即進入準備擊球階段
      if (b.z <= 0) {
        b.z = 0;
        b.vz = 0;
        b.vx = 0;
        b.vy = 0;
        setGameState('serving-ready');

        if (serverSide === 'opponent') {
          setMessage('AI準備發球...');
          setTimeout(() => {
            performServe(false);
          }, 500);
        } else {
          setMessage('按空白鍵擊球發球到對角！');
        }
      }
      return;
    }

    // AI發球觸發（在 point 狀態後）
    if (gameState === 'point' && serverSide === 'opponent') {
      // AI在得分後延遲1秒自動開始發球
      setTimeout(() => {
        if (gameState === 'point' && serverSide === 'opponent') {
          // 開始AI發球流程
          gamePhase.current = 'serve';
          bounceCount.current = 0;
          mustBounce.current = true;
          canHit.current = true;

          const b = ball.current;
          b.x = opponent.current.x - 30;
          b.y = opponent.current.y;
          b.z = 100; // 在高處
          b.vx = 0;
          b.vy = 0;
          b.vz = 0;
          lastHitter.current = 'opponent';

          setGameState('serving-drop');
          setMessage('對手正在發球...');
        }
      }, 1000);
    }

    if (gameState !== 'playing' && gameState !== 'serving-ready') return;

    // 【修正】發球階段鎖定在底線（在 serving-ready 狀態時）
    const isPlayerServing = serverSide === 'player' && gameState === 'serving-ready';
    const isOpponentServing = serverSide === 'opponent' && gameState === 'serving-ready';

    // 玩家移動 - 優先使用滑鼠控制，否則用鍵盤

    if (mouseX.current !== null && mouseY.current !== null) {
      // 滑鼠控制（直接設定位置）
      if (isPlayerServing) {
        // 發球時只能控制Y軸，X軸鎖定在底線
        player.current.y = mouseY.current;
      } else {
        player.current.x = mouseX.current;
        player.current.y = mouseY.current;
      }
    } else {
      // 鍵盤控制（上下左右）
      if (keys.current.has('ArrowUp') || keys.current.has('w') || keys.current.has('W')) {
        player.current.y -= PLAYER.SPEED;
      }
      if (keys.current.has('ArrowDown') || keys.current.has('s') || keys.current.has('S')) {
        player.current.y += PLAYER.SPEED;
      }
      // 【修正】發球時禁止左右移動
      if (!isPlayerServing) {
        if (keys.current.has('ArrowLeft') || keys.current.has('a') || keys.current.has('A')) {
          player.current.x -= PLAYER.SPEED;
        }
        if (keys.current.has('ArrowRight') || keys.current.has('d') || keys.current.has('D')) {
          player.current.x += PLAYER.SPEED;
        }
      }
    }

    // 【重要】限制玩家範圍
    if (isPlayerServing) {
      // 發球時鎖定在左側底線
      player.current.x = 50;
      player.current.y = Math.max(
        PLAYER.PADDLE_HEIGHT / 2,
        Math.min(COURT.HEIGHT - PLAYER.PADDLE_HEIGHT / 2, player.current.y)
      );
    } else {
      // 【修正】正常遊戲時只能在左半場移動（不能越過球網）
      player.current.x = Math.max(
        PLAYER.PADDLE_WIDTH / 2,
        Math.min(COURT.NET_X - PLAYER.PADDLE_WIDTH / 2, player.current.x) // 限制在球網左側
      );
      player.current.y = Math.max(
        PLAYER.PADDLE_HEIGHT / 2,
        Math.min(COURT.HEIGHT - PLAYER.PADDLE_HEIGHT / 2, player.current.y)
      );
    }

    // 【修正】對手發球時也鎖定在底線
    if (isOpponentServing) {
      opponent.current.x = COURT.WIDTH - 50;
    }

    // 【3D俯視】如果還在發球準備階段，球跟著發球方移動
    if (gameState === 'serving-ready') {
      const b = ball.current;
      if (serverSide === 'player') {
        b.x = player.current.x + 30;
        b.y = player.current.y;
        b.z = 0; // 在地面上
      } else {
        b.x = opponent.current.x - 30;
        b.y = opponent.current.y;
        b.z = 0;
      }
      return;
    }

    // 更新揮拍動畫
    if (swingProgress.current > 0) {
      swingProgress.current -= 0.15; // 揮拍動畫衰減
      if (swingProgress.current < 0) swingProgress.current = 0;
    }
    if (opponentSwingProgress.current > 0) {
      opponentSwingProgress.current -= 0.15;
      if (opponentSwingProgress.current < 0) opponentSwingProgress.current = 0;
    }

    // AI 對手
    updateOpponentAI();

    // 【3D俯視】球物理系統
    const b = ball.current;

    // 重力只影響Z軸（高度）
    b.vz -= BALL.GRAVITY;

    // 更新位置
    b.x += b.vx;
    b.y += b.vy;
    b.z += b.vz;

    // 【關鍵】球觸地判定（Z <= 0，可在任何X,Y位置）
    if (b.z <= 0) {
      b.z = 0;
      b.vz = -b.vz * BALL.BOUNCE; // Z軸反彈

      // 觸地時減速（摩擦力）
      b.vx *= 0.95;
      b.vy *= 0.95;

      // 只有明顯的彈跳才計數（避免滾動時重複計數）
      if (Math.abs(b.vz) > 2) {
        bounceCount.current++;
        canHit.current = true; // 彈地後可以擊球

        // 檢查是否彈地兩次（失分）
        if (bounceCount.current >= 2) {
          let winner: 'player' | 'opponent';
          if (b.x < COURT.NET_X) {
            // 球在左側（玩家側）彈地兩次，玩家失分
            winner = 'opponent';
          } else {
            // 球在右側（對手側）彈地兩次，對手失分
            winner = 'player';
          }
          addPoint(winner);
          setMessage(`球彈地兩次！${winner === 'player' ? '你' : '對手'}得分`);
          setGameState('point');
          return;
        }
      }

      // 球停止時（幾乎沒有速度）
      if (Math.abs(b.vx) < 0.5 && Math.abs(b.vy) < 0.5 && Math.abs(b.vz) < 1) {
        b.vx = 0;
        b.vy = 0;
        b.vz = 0;
      }
    }

    // 球場邊界限制（防止球飛出球場）
    if (b.y < 0) {
      b.y = 0;
      b.vy = -b.vy * 0.8; // 撞到邊界反彈
    }
    if (b.y > COURT.HEIGHT) {
      b.y = COURT.HEIGHT;
      b.vy = -b.vy * 0.8;
    }

    // 球與球拍碰撞
    checkPaddleCollision(player.current, true);
    checkPaddleCollision(opponent.current, false);

    // 球出界判定（左右）
    if (ball.current.x < -BALL.RADIUS) {
      // 對手得分
      addPoint('opponent');
      setMessage('球出界！對手得分，對手發球');
      setGameState('point');
    } else if (ball.current.x > COURT.WIDTH + BALL.RADIUS) {
      // 玩家得分
      addPoint('player');
      setMessage('球出界！你得分，你發球');
      setGameState('point');
    }

    // 球網碰撞檢測
    if (
      Math.abs(ball.current.x - COURT.NET_X) < 10 &&
      ball.current.y > COURT.HEIGHT - 40 &&
      Math.abs(ball.current.vx) < 3
    ) {
      const winner = lastHitter.current === 'player' ? 'opponent' : 'player';
      addPoint(winner);
      setMessage(`球掛網！${winner === 'player' ? '你' : '對手'}得分，${winner === 'player' ? '你' : '對手'}發球`);
      setGameState('point');
    }
  }, [gameState, serverSide, gameScreen, addPoint]);

  // 【3D俯視】執行發球的函數
  const performServe = useCallback((isPlayerServing: boolean) => {
    const b = ball.current;

    if (isPlayerServing) {
      // 玩家發球到對角線
      const targetY = player.current.y < COURT.CENTER_Y ? COURT.HEIGHT * 0.75 : COURT.HEIGHT * 0.25;
      const dx = COURT.WIDTH * 0.85 - b.x;
      const dy = targetY - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      b.vx = (dx / distance) * 7;
      b.vy = (dy / distance) * 7;
      b.vz = 6; // 向上的速度，讓球弧線飛行
    } else {
      // AI發球到玩家對角線
      const targetY = opponent.current.y < COURT.CENTER_Y ? COURT.HEIGHT * 0.75 : COURT.HEIGHT * 0.25;
      const dx = COURT.WIDTH * 0.15 - b.x;
      const dy = targetY - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      b.vx = (dx / distance) * 6.5;
      b.vy = (dy / distance) * 6.5;
      b.vz = 6;
    }

    setGameState('playing');
    setMessage('');
  }, []);

  // 渲染
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 縮放以支持高解析度（2x）
    ctx.save();
    ctx.scale(2, 2);

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

    ctx.restore(); // 恢復縮放
  }, [gameState, score]);

  // 遊戲循環
  useEffect(() => {
    // 【關鍵】只在遊戲進行中才運行遊戲循環
    if (gameScreen !== 'game') {
      return;
    }

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
  }, [update, render, gameScreen]);

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
          // 只有輪到玩家發球才能按空白鍵發球
          if (serverSide !== 'player') {
            return; // AI發球時，玩家按空白鍵無效
          }

          // 第一階段：開始發球（球掉落）
          gamePhase.current = 'serve';
          bounceCount.current = 0;
          mustBounce.current = true;
          canHit.current = true;

          // 【3D俯視】球在發球方手中（高處）
          const b = ball.current;
          if (serverSide === 'player') {
            b.x = player.current.x + 30;
            b.y = player.current.y;
            b.z = 100; // 在高處，準備掉落
            lastHitter.current = 'player';
          } else {
            b.x = opponent.current.x - 30;
            b.y = opponent.current.y;
            b.z = 100;
            lastHitter.current = 'opponent';
          }

          b.vx = 0;
          b.vy = 0;
          b.vz = 0; // 開始時靜止

          setGameState('serving-drop');
          setMessage('球正在掉落...');
        } else if (gameState === 'serving-ready') {
          // 只有輪到玩家發球才能按空白鍵擊球
          if (serverSide !== 'player') {
            return;
          }

          // 第二階段：擊球發球到對角線
          performServe(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = COURT.WIDTH / rect.width;
      const scaleY = COURT.HEIGHT / rect.height;
      mouseX.current = (e.clientX - rect.left) * scaleX;
      mouseY.current = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseLeave = () => {
      mouseX.current = null;
      mouseY.current = null;
    };

    const handleMouseClick = () => {
      // 滑鼠點擊揮拍
      if (gameState === 'playing' || gameState === 'serving-ready') {
        isSwinging.current = true;
        swingProgress.current = 1; // 開始揮拍動畫
      }
    };

    const canvas = canvasRef.current;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      canvas.addEventListener('click', handleMouseClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('click', handleMouseClick);
      }
    };
  }, [gameState]);

  // 遊戲開始按鈕
  const startGame = () => {
    setGameScreen('game');
    setGameState('ready');
    setScore({ player: 0, opponent: 0 });
    setMessage('點擊「發球」按鈕或按空白鍵開始發球');
  };

  // 處理發球按鈕點擊（供手機使用）
  const handleServeButton = () => {
    if (gameState === 'ready' || gameState === 'point') {
      // 只有輪到玩家發球才能點擊
      if (serverSide !== 'player') {
        return;
      }

      // 開始發球流程
      gamePhase.current = 'serve';
      bounceCount.current = 0;
      mustBounce.current = true;
      canHit.current = true;

      const b = ball.current;
      b.x = player.current.x + 30;
      b.y = player.current.y;
      b.z = 100;
      lastHitter.current = 'player';
      b.vx = 0;
      b.vy = 0;
      b.vz = 0;

      setGameState('serving-drop');
      setMessage('球正在掉落...');
    } else if (gameState === 'serving-ready') {
      if (serverSide !== 'player') {
        return;
      }
      performServe(true);
    }
  };

  // 重新開始遊戲
  const restartGame = () => {
    setGameScreen('game');
    setGameState('ready');
    setScore({ player: 0, opponent: 0 });
    setWinner(null);
    player.current = { x: 50, y: COURT.CENTER_Y + 100, vx: 0, vy: 0 };
    opponent.current = { x: COURT.WIDTH - 50, y: COURT.CENTER_Y - 100, vx: 0, vy: 0 };
    ball.current = { x: 50, y: COURT.CENTER_Y + 50, z: 0, vx: 0, vy: 0, vz: 0 };
    setServerSide('player');
    setMessage('點擊「發球」按鈕或按空白鍵開始發球');
  };


  // 遊戲結束介面
  if (gameScreen === 'game-over') {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-sport-50 to-court-50 rounded-3xl shadow-2xl p-12">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-pickleball-600">
              {winner === 'player' ? '🎉 恭喜獲勝！🎉' : '😢 再接再厲！'}
            </h1>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">最終比分</h2>
              <div className="flex justify-center items-center gap-8">
                <div className={`text-center p-6 rounded-xl ${winner === 'player' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className="text-gray-600 text-lg mb-2">你</div>
                  <div className="text-5xl font-black text-blue-600">{score.player}</div>
                </div>
                <div className="text-4xl font-bold text-gray-400">:</div>
                <div className={`text-center p-6 rounded-xl ${winner === 'opponent' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className="text-gray-600 text-lg mb-2">對手</div>
                  <div className="text-5xl font-black text-red-600">{score.opponent}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-sport-500 to-court-500 hover:from-sport-600 hover:to-court-600 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                再玩一次
              </button>
              <button
                onClick={() => setGameScreen('intro')}
                className="bg-gray-500 hover:bg-gray-600 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                回到主選單
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 遊戲畫面（始終顯示球場，介面層疊在上方）
  return (
    <div className="w-full max-w-6xl mx-auto relative">
      {/* 背景球場（始終可見） */}
      <div className="bg-gradient-to-br from-sport-50 to-court-50 rounded-3xl shadow-2xl p-6">
        <h2 className="text-3xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-court-600">
          匹克球小遊戲
        </h2>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-inner">
          <canvas
            ref={canvasRef}
            width={COURT.WIDTH * 2}
            height={COURT.HEIGHT * 2}
            className="w-full border-4 border-gray-800 rounded-lg"
            style={{ maxHeight: '70vh', imageRendering: 'crisp-edges' }}
          />
        </div>

        {/* 【Intro 介面】半透明覆蓋層 */}
        {gameScreen === 'intro' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-2xl mx-4 border-2 border-pickleball-300">
              <div className="text-center space-y-6">
                <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sport-600 via-court-600 to-pickleball-600">
                  🏓 匹克球互動遊戲 🏓
                </h1>
                <p className="text-lg text-gray-800 font-semibold">體驗真實的匹克球規則與操作！</p>

                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 shadow-inner">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">遊戲規則 & 操作</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left text-sm">
                    <div className="bg-white/80 p-3 rounded-lg">
                      <h3 className="font-bold text-blue-600 mb-1.5">⚡ 比賽規則</h3>
                      <ul className="space-y-0.5 text-gray-700">
                        <li>• 11分制，領先2分獲勝</li>
                        <li>• 雙彈跳：前兩球須彈地</li>
                        <li>• 廚房區內禁止截擊</li>
                      </ul>
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg">
                      <h3 className="font-bold text-green-600 mb-1.5">🎮 操作方式</h3>
                      <ul className="space-y-0.5 text-gray-700">
                        <li>• 🖱️ 滑鼠移動控制球拍</li>
                        <li>• 🖱️ 左鍵或空白鍵揮拍</li>
                        <li>• ⌨️ WASD / 方向鍵移動</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-sport-500 to-court-500 hover:from-sport-600 hover:to-court-600 text-white text-xl font-bold py-3 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-white"
                >
                  開始遊戲 🎯
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 【遊戲介面】只在遊戲進行時顯示 */}
        {gameScreen === 'game' && (
          <>
            {message && (
              <div className="bg-gradient-to-r from-pickleball-500 to-sport-500 text-white px-6 py-3 rounded-full text-center font-bold text-lg mb-4">
                {message}
              </div>
            )}

            {/* 手機版發球按鈕 */}
            {serverSide === 'player' && (gameState === 'ready' || gameState === 'point' || gameState === 'serving-ready') && (
              <div className="mb-4">
                <button
                  onClick={handleServeButton}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xl font-black py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white"
                >
                  {gameState === 'serving-ready' ? '🎾 擊球發出！' : '🏓 開始發球'}
                </button>
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
          <h3 className="font-bold text-gray-800 mb-2">⚡ 操作說明</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="bg-green-50 p-2 rounded-lg">
              <div className="flex items-center">
                <span className="font-bold mr-2">🖱️ 滑鼠移動</span>
                <span className="text-green-600">在球場上移動滑鼠控制球拍位置（推薦）</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="font-bold mr-2">🖱️ 滑鼠左鍵</span>
                <span className="text-green-600">點擊揮拍擊球</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-2">↑↓←→ 或 WASD</span>
              <span>鍵盤四方向移動球拍（可在整個球場移動）</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-2">空白鍵</span>
              <span className="text-yellow-600">發球時使用 / 對打時揮拍擊球</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-2">↑↓（擊球時）</span>
              <span className="text-blue-600">🎯 控制擊球角度（高球/低球）</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-pickleball-50 rounded-xl p-4 border-2 border-pickleball-200">
          <div className="flex items-start space-x-2">
            <span className="text-2xl">📖</span>
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-2">匹克球規則：</p>
              <ul className="space-y-1">
                <li>• <strong>得分方發球</strong>：誰得分誰發球，AI也會自動發球</li>
                <li>• <strong>兩段式發球</strong>：第一次按空白鍵球掉落，第二次按擊球發出</li>
                <li>• <strong>對角發球</strong>：發球會自動往對角線方向飛行</li>
                <li>• <strong>方向控制</strong>：擊球時按上下鍵可控制球往上或往下飛</li>
                <li>• <strong>雙彈跳規則</strong>：發球和接發球都必須等球彈地後才能擊球</li>
                <li>• <strong>廚房區</strong>：黃色區域內不能截擊（球沒彈地直接打）</li>
                <li>• <strong>單彈跳</strong>：球只能彈地一次，彈兩次失分</li>
              </ul>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PickleballGame;
