import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameSounds } from '../../hooks/useGameSounds';

// 球場配置（橫向顯示，符合標準匹克球場規格比例）
const COURT = {
  WIDTH: 1000, // 44英尺（橫向）
  HEIGHT: 450, // 20英尺（縱向）
  NET_X: 500, // 中線（左右分界）
  KITCHEN_WIDTH: 130, // 7英尺廚房區（稍微縮小，讓網前截擊更容易）
  LINE_WIDTH: 4,
  CENTER_Y: 225,
  NET_HEIGHT: 35, // 球網高度（匹克球網中央高度為34英寸）
};

// 遊戲物件配置
const PLAYER = {
  PADDLE_WIDTH: 60,  // 增大球拍寬度，更接近真實匹克球拍
  PADDLE_HEIGHT: 90, // 調整球拍高度
  SPEED: 10,
};

const BALL = {
  RADIUS: 14,
  GRAVITY: 0.25, // 3D高度的重力加速度（增加，讓球更快落地，更像真實匹克球）
  BOUNCE: 0.75, // 彈性係數（適中，匹克球彈跳較低但仍可過網）
  INITIAL_VX: 4,
  INITIAL_VY: -5,
  SHADOW_OFFSET: 0.3, // 陰影偏移比例
  SPIN_EFFECT: 0.3, // 旋球效果強度
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
  spin: number; // 旋轉（正值=上旋，負值=下旋）
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
  const [message, setMessage] = useState('點擊「發球」按鈕開始發球');
  const [serverSide, setServerSide] = useState<'player' | 'opponent'>('player');
  // const [servePower, setServePower] = useState<'short' | 'long'>('long'); // 發球力度（未來功能）
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  // 音效系統
  const {
    playPaddleHitSound,
    playBounceSound,
    playScoreSound,
    playFaultSound,
    playNetSound,
    playWinSound,
    playServeSound,
    playGameStartSound,
    toggleMute,
    isMuted,
    initAudioContext,
  } = useGameSounds();

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

  // 【新增】長按蓄力機制
  const chargeStartTime = useRef<number | null>(null); // 開始蓄力時間
  const [chargePower, setChargePower] = useState(0); // 當前蓄力程度 0-1

  // 【新增】擊球視覺反饋
  const hitEffect = useRef<{ x: number; y: number; progress: number } | null>(null);

  // 【新增】連擊系統
  const [combo, setCombo] = useState(0);
  const comboTimer = useRef<number | null>(null);

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
    spin: 0, // 初始無旋轉
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

    // 【新增】理想截擊位置標記（綠色虛線，在廚房區線外側）
    const volleyLineOffset = 40; // 距離廚房區線40單位（理想截擊位置）
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; // 綠色半透明
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    // 左側理想截擊線
    ctx.beginPath();
    ctx.moveTo(kitchenLeftX - volleyLineOffset, 0);
    ctx.lineTo(kitchenLeftX - volleyLineOffset, COURT.HEIGHT);
    ctx.stroke();
    // 右側理想截擊線
    ctx.beginPath();
    ctx.moveTo(kitchenRightX + volleyLineOffset, 0);
    ctx.lineTo(kitchenRightX + volleyLineOffset, COURT.HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

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

  // 繪製玩家（人物 + 球拍）
  const drawPlayer = (ctx: CanvasRenderingContext2D, obj: GameObject, isPlayer: boolean) => {
    const paddleColor = isPlayer ? '#3b82f6' : '#ef4444';
    const paddleAccent = isPlayer ? '#2563eb' : '#dc2626';
    const paddleDark = isPlayer ? '#1e40af' : '#991b1b';
    const skinTone = '#f5c0a1';
    const shirtColor = isPlayer ? '#3b82f6' : '#ef4444';
    const shortsColor = isPlayer ? '#1e40af' : '#991b1b';

    // 【改良】揮拍動畫：更自然的前後揮動，減少旋轉
    const swing = isPlayer ? swingProgress.current : opponentSwingProgress.current;
    const swingOffset = swing * 20; // 前後揮動距離
    const swingAngle = swing * Math.PI / 12; // 減少旋轉角度（15度）

    // 【新增】先繪製人物（在球拍後方）
    // 腿部
    ctx.fillStyle = shortsColor;
    ctx.beginPath();
    ctx.ellipse(obj.x - 8, obj.y + 35, 6, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(obj.x + 8, obj.y + 35, 6, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 身體
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.ellipse(obj.x, obj.y + 5, 18, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 手臂（持拍手）- 跟隨揮拍動作
    const armX = isPlayer ? obj.x + 15 : obj.x - 15;
    const armSwingOffset = swing * (isPlayer ? 10 : -10);
    ctx.strokeStyle = skinTone;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(obj.x, obj.y);
    ctx.lineTo(armX + armSwingOffset, obj.y + 10);
    ctx.stroke();

    // 另一隻手
    const otherArmX = isPlayer ? obj.x - 12 : obj.x + 12;
    ctx.beginPath();
    ctx.moveTo(obj.x, obj.y + 5);
    ctx.lineTo(otherArmX, obj.y + 15);
    ctx.stroke();

    // 頭部
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(obj.x, obj.y - 20, 12, 0, Math.PI * 2);
    ctx.fill();

    // 頭髮
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.arc(obj.x, obj.y - 22, 13, Math.PI, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(obj.x - 4, obj.y - 20, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(obj.x + 4, obj.y - 20, 2, 0, Math.PI * 2);
    ctx.fill();

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
    // 播放得分音效
    playScoreSound();

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
        // 播放獲勝音效
        playWinSound();
      }

      return newScore;
    });

    setServerSide(side); // 得分方獲得發球權
  }, [playScoreSound, playWinSound]);

  // 【3D俯視】碰撞檢測：球與球拍（矩形碰撞 + Z軸判斷 + 匹克球規則 + 揮拍機制）
  const checkPaddleCollision = (paddle: GameObject, isPlayer: boolean) => {
    const b = ball.current;

    // 雙彈跳規則檢查
    if (mustBounce.current && bounceCount.current === 0) {
      return false; // 球還沒彈地，不能擊球
    }

    // 【改進】球必須在合適的高度才能擊球（極度擴大範圍讓截擊變得自然流暢）
    // Z軸在0-400之間（地面到極高球，完全放寬限制讓任何高度都能擊中）
    if (b.z < 0 || b.z > 400) {
      return false;
    }

    // 【改進】矩形碰撞檢測（大幅增加碰撞範圍padding，讓擊球非常容易）
    const collisionPadding = 50; // 大幅增加碰撞檢測的寬容度（從20增加到50）
    // 垂直方向額外增加容差，讓高球超級容易擊中
    const verticalPadding = 60; // 垂直方向極度寬鬆
    const paddleLeft = paddle.x - PLAYER.PADDLE_WIDTH / 2 - collisionPadding;
    const paddleRight = paddle.x + PLAYER.PADDLE_WIDTH / 2 + collisionPadding;
    const paddleTop = paddle.y - PLAYER.PADDLE_HEIGHT / 2 - verticalPadding;
    const paddleBottom = paddle.y + PLAYER.PADDLE_HEIGHT / 2 + verticalPadding;

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

    // 【改進】極度降低揮拍要求（從0.15降到0.05，讓擊球極其容易）
    const currentSwing = isPlayer ? swingProgress.current : opponentSwingProgress.current;
    const canSwing = isPlayer ? isSwinging.current : true; // AI 自動揮拍

    if (isColliding && canHit.current && canSwing && currentSwing > 0.05) {
      // 觸發對手揮拍動畫（如果是AI擊球）
      if (!isPlayer) {
        opponentSwingProgress.current = 1;
      }

      // 擊球後重置玩家揮拍狀態
      if (isPlayer) {
        isSwinging.current = false;
      }

      // 【新增】觸發擊球視覺特效
      hitEffect.current = { x: b.x, y: b.y, progress: 1 };

      // 【新增】更新連擊數（只計算玩家的擊球）
      if (isPlayer) {
        setCombo(prev => prev + 1);
        // 重置連擊計時器
        if (comboTimer.current) clearTimeout(comboTimer.current);
        comboTimer.current = window.setTimeout(() => setCombo(0), 3000); // 3秒後重置
      }

      // 檢查廚房區規則：如果球沒有彈地（截擊），且在廚房區內，則犯規
      if (bounceCount.current === 0 && isInKitchen(paddle.x)) {
        // 廚房區截擊犯規
        playFaultSound();
        const winner = isPlayer ? 'opponent' : 'player';
        addPoint(winner);
        setMessage(`廚房區截擊犯規！${isPlayer ? '對手' : '你'}得分`);
        setGameState('point');
        return true;
      }

      // 【3D俯視】擊中球拍 - 設定3D速度（改進版：加入旋球和力度控制）
      const direction = isPlayer ? 1 : -1;

      // 【長按蓄力】計算蓄力倍數（僅對玩家生效）
      let chargePowerMultiplier = 1;
      if (isPlayer && chargeStartTime.current !== null) {
        const chargeTime = Date.now() - chargeStartTime.current;
        const chargePower = Math.min(chargeTime / 1000, 1.5); // 最多1.5秒
        chargePowerMultiplier = 1 + chargePower; // 1-2.5倍
        chargeStartTime.current = null;
        setChargePower(0);
      }

      // 【新增】力度控制：根據球拍移動速度調整擊球力道
      const paddleSpeed = Math.sqrt(paddle.vx * paddle.vx + paddle.vy * paddle.vy);
      const powerMultiplier = 1 + Math.min(paddleSpeed / 20, 0.3); // 最多增加30%力道
      const baseSpeed = (isPlayer ? 4 : 4.2) * powerMultiplier * chargePowerMultiplier; // 應用蓄力倍數

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

      const verticalBoost = isPlayer ? 0.8 : 1; // 降低垂直速度，讓球更快落地不飛太遠
      b.vy = hitPosition * 1.5 * verticalBoost + angleControl; // 降低前後速度（從2降到1.5）

      // 【新增】旋球機制：根據擊球位置產生旋轉（球拍上緣=下旋，下緣=上旋）
      // hitPosition > 0 表示球在球拍下方 -> 上旋（球會下墜）
      // hitPosition < 0 表示球在球拍上方 -> 下旋（球會飄浮）
      b.spin = hitPosition * BALL.SPIN_EFFECT;

      // 【關鍵】Z軸速度（向上的速度，讓球飛起來）
      // 【匹克球特性】降低向上速度，讓球更快落地，鼓勵落地後回擊
      let upwardSpeed = 7 - (b.z / 25); // 大幅降低（從8.5降到7，球快速落地）
      // 下旋會增加向上速度（球飄），上旋會減少向上速度（球快速下墜）
      upwardSpeed += b.spin * -6; // 降低旋球影響
      // 確保合理的向上速度範圍（匹克球的低弧線特性）
      upwardSpeed = Math.max(Math.min(upwardSpeed, 8.5), 5); // 範圍5-8.5（大幅降低）
      b.vz = upwardSpeed;

      // 速度限制（匹克球特性：降低整體速度）
      const maxSpeed = 8; // 從12降到8，讓球更快落地
      b.vx = Math.max(-maxSpeed, Math.min(maxSpeed, b.vx));
      b.vy = Math.max(-maxSpeed, Math.min(maxSpeed, b.vy));

      // 確保球離開球拍
      if (isPlayer) {
        b.x = paddleRight + BALL.RADIUS + 5;
      } else {
        b.x = paddleLeft - BALL.RADIUS - 5;
      }

      // 播放擊球音效
      playPaddleHitSound();

      lastHitter.current = isPlayer ? 'player' : 'opponent';
      bounceCount.current = 0; // 重置彈跳計數
      canHit.current = false; // 防止重複擊球

      // 【匹克球雙彈跳規則】更新遊戲階段
      if (gamePhase.current === 'serve') {
        // 發球階段 -> 接發球階段（接發球方必須等球彈地）
        gamePhase.current = 'return';
        mustBounce.current = true;
      } else if (gamePhase.current === 'return') {
        // 接發球階段 -> 第三拍階段（發球方也必須等球彈地）
        gamePhase.current = 'third-shot';
        mustBounce.current = true;
      } else if (gamePhase.current === 'third-shot') {
        // 第三拍階段 -> 對打階段（可以截擊了，除非在廚房區）
        gamePhase.current = 'rally';
        mustBounce.current = false;
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

    // 【長按蓄力】更新蓄力進度視覺反饋
    if (chargeStartTime.current !== null) {
      const chargeTime = Date.now() - chargeStartTime.current;
      const power = Math.min(chargeTime / 1000, 1.5);
      setChargePower(power);
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
          setMessage('點擊畫面或「擊球發出」按鈕發球到對角！');
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

    // 【改進】更新揮拍動畫（加快速度讓擊球更靈敏）
    if (swingProgress.current > 0) {
      swingProgress.current -= 0.08; // 揮拍動畫衰減（從0.15降到0.08，動畫更持久）
      if (swingProgress.current < 0) swingProgress.current = 0;
    }
    if (opponentSwingProgress.current > 0) {
      opponentSwingProgress.current -= 0.08;
      if (opponentSwingProgress.current < 0) opponentSwingProgress.current = 0;
    }

    // 【新增】更新擊球視覺特效
    if (hitEffect.current) {
      hitEffect.current.progress -= 0.05;
      if (hitEffect.current.progress <= 0) {
        hitEffect.current = null;
      }
    }

    // AI 對手
    updateOpponentAI();

    // 【3D俯視】球物理系統
    const b = ball.current;

    // 重力只影響Z軸（高度），但旋球會影響下墜速度
    // 上旋（spin > 0）會加速下墜，下旋（spin < 0）會減緩下墜
    const gravityEffect = BALL.GRAVITY + (b.spin * 0.05);
    b.vz -= gravityEffect;

    // 【新增】旋球對水平速度的影響（模擬馬格努斯效應）
    // 旋球會讓球在空中產生弧線
    if (Math.abs(b.spin) > 0.01) {
      b.vy += b.spin * 0.1; // 旋轉影響垂直方向的軌跡
      // 旋轉逐漸衰減
      b.spin *= 0.98;
    }

    // 更新位置
    b.x += b.vx;
    b.y += b.vy;
    b.z += b.vz;

    // 【關鍵】球觸地判定（Z <= 0，可在任何X,Y位置）
    if (b.z <= 0) {
      b.z = 0;
      b.vz = -b.vz * BALL.BOUNCE; // Z軸反彈

      // 觸地時減速（摩擦力）- 適中摩擦力
      b.vx *= 0.97;
      b.vy *= 0.97;

      // 只有明顯的彈跳才計數（避免滾動時重複計數）
      if (Math.abs(b.vz) > 2) {
        // 播放彈地音效
        playBounceSound();
        bounceCount.current++;
        canHit.current = true; // 彈地後可以擊球

        // 【修正】檢查球是否在錯誤的一側落地（匹克球規則：擊球後球必須直接飛過網）
        if (bounceCount.current === 1) {
          // 第一次落地時檢查位置（加入小緩衝區避免球網邊緣誤判）
          const netBuffer = 20; // 球網附近20像素的緩衝區
          const ballOnLeftSide = b.x < (COURT.NET_X - netBuffer);
          const ballOnRightSide = b.x > (COURT.NET_X + netBuffer);

          // 如果最後擊球者是玩家（左側），球應該在右側落地
          // 如果最後擊球者是對手（右側），球應該在左側落地
          let wrongSide = false;
          let winner: 'player' | 'opponent' = 'player';

          if (lastHitter.current === 'player' && ballOnLeftSide) {
            // 玩家擊球，但球在自己這邊落地 - 玩家失分
            wrongSide = true;
            winner = 'opponent';
          } else if (lastHitter.current === 'opponent' && ballOnRightSide) {
            // 對手擊球，但球在自己那邊落地 - 對手失分
            wrongSide = true;
            winner = 'player';
          }

          if (wrongSide) {
            playFaultSound();
            addPoint(winner);
            setMessage(`球未過網！${winner === 'player' ? '你' : '對手'}得分`);
            setGameState('point');
            return;
          }
        }

        // 檢查是否在對方場地彈地兩次（失分）
        if (bounceCount.current >= 2) {
          let winner: 'player' | 'opponent';
          if (b.x < COURT.NET_X) {
            // 球在左側（玩家側）彈地兩次，玩家失分
            winner = 'opponent';
          } else {
            // 球在右側（對手側）彈地兩次，對手失分
            winner = 'player';
          }
          playFaultSound();
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

    // 球出界判定（左右）- 誰打出界，對方得分
    if (ball.current.x < -BALL.RADIUS || ball.current.x > COURT.WIDTH + BALL.RADIUS) {
      // 根據最後擊球者判定
      playFaultSound();
      const winner = lastHitter.current === 'player' ? 'opponent' : 'player';
      addPoint(winner);
      setMessage(`球出界！${winner === 'player' ? '你' : '對手'}得分`);
      setGameState('point');
    }

    // 【改進】球網碰撞檢測（匹克球特色：考慮球的高度）
    const isNearNet = Math.abs(ball.current.x - COURT.NET_X) < 15;
    const isBallLow = ball.current.z < COURT.NET_HEIGHT; // 球低於網高

    if (isNearNet && isBallLow && Math.abs(ball.current.vx) > 0.5) {
      // 球撞到網子
      ball.current.vx = -ball.current.vx * 0.3; // 反彈但大幅減速
      ball.current.vz = -ball.current.vz * 0.3; // 垂直速度也減弱

      // 如果速度太低，判定為掛網
      if (Math.abs(ball.current.vx) < 2) {
        playNetSound();
        const winner = lastHitter.current === 'player' ? 'opponent' : 'player';
        addPoint(winner);
        setMessage(`球掛網！${winner === 'player' ? '你' : '對手'}得分`);
        setGameState('point');
      }
    }
  }, [gameState, serverSide, gameScreen, addPoint]);

  // 【3D俯視】執行發球的函數
  const performServe = useCallback((isPlayerServing: boolean, power: number = 1) => {
    const b = ball.current;

    // 播放發球音效
    playServeSound();

    // 【長按蓄力】力度倍數：確保最小力道足夠（1.5-2.5倍）
    // power 範圍 0-1.5，轉換為 1.5-3.0 倍數
    const powerMultiplier = 1.5 + power; // 最小1.5倍，最大3.0倍

    if (isPlayerServing) {
      // 玩家發球到對角線（匹克球特性+蓄力機制）
      const targetY = player.current.y < COURT.CENTER_Y ? COURT.HEIGHT * 0.75 : COURT.HEIGHT * 0.25;
      const dx = COURT.WIDTH * 0.85 - b.x;
      const dy = targetY - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const baseSpeed = 4.5 * powerMultiplier; // 應用蓄力倍數（最小6.75）
      b.vx = (dx / distance) * baseSpeed;
      b.vy = (dy / distance) * baseSpeed;
      b.vz = 7.0 + power * 2; // 提高初始高度，蓄力也影響向上速度
    } else {
      // AI發球到玩家對角線（匹克球特性：更慢、更低的發球）
      const targetY = opponent.current.y < COURT.CENTER_Y ? COURT.HEIGHT * 0.75 : COURT.HEIGHT * 0.25;
      const dx = COURT.WIDTH * 0.15 - b.x;
      const dy = targetY - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      b.vx = (dx / distance) * 4.2;
      b.vy = (dy / distance) * 4.2;
      b.vz = 6.5;
    }

    setGameState('playing');
    setMessage('');
  }, [playServeSound]);

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

    // 【新增】繪製擊球視覺特效
    if (hitEffect.current) {
      const effect = hitEffect.current;
      const alpha = effect.progress;
      const radius = (1 - effect.progress) * 40; // 擴散效果

      // 擊球閃光（放射狀）
      ctx.save();
      ctx.globalAlpha = alpha * 0.6;
      const gradient = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, radius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#fbbf24');
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // 擊球火花（圓圈）
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // 擊球粒子（小點）
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const particleRadius = radius * 0.8;
        const px = effect.x + Math.cos(angle) * particleRadius;
        const py = effect.y + Math.sin(angle) * particleRadius;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 【長按蓄力】繪製蓄力條
    if (chargePower > 0) {
      const barWidth = 200;
      const barHeight = 20;
      const barX = COURT.WIDTH / 2 - barWidth / 2;
      const barY = COURT.HEIGHT - 80;

      // 背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.roundRect(barX, barY, barWidth, barHeight, 10);
      ctx.fill();

      // 蓄力進度（漸層色）
      const powerPercent = chargePower / 1.5; // 0-1
      const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth * powerPercent, barY);
      gradient.addColorStop(0, '#22c55e'); // 綠色（正常）
      gradient.addColorStop(0.6, '#eab308'); // 黃色（中等）
      gradient.addColorStop(1, '#ef4444'); // 紅色（滿力）
      ctx.fillStyle = gradient;
      ctx.roundRect(barX, barY, barWidth * powerPercent, barHeight, 10);
      ctx.fill();

      // 邊框
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.roundRect(barX, barY, barWidth, barHeight, 10);
      ctx.stroke();

      // 文字提示
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      const powerText = `力度: ${Math.round(powerPercent * 100)}%`;
      ctx.fillText(powerText, COURT.WIDTH / 2, barY - 8);
    }

    // 【改進】繪製專業計分板
    const scoreboardY = 15;
    const scoreboardHeight = 60;

    // 計分板背景（漸層）
    const scoreBgGradient = ctx.createLinearGradient(
      COURT.WIDTH / 2 - 120, scoreboardY,
      COURT.WIDTH / 2 + 120, scoreboardY + scoreboardHeight
    );
    scoreBgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    scoreBgGradient.addColorStop(1, 'rgba(30, 30, 30, 0.85)');
    ctx.fillStyle = scoreBgGradient;
    ctx.roundRect(COURT.WIDTH / 2 - 120, scoreboardY, 240, scoreboardHeight, 12);
    ctx.fill();

    // 計分板邊框
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 2;
    ctx.roundRect(COURT.WIDTH / 2 - 120, scoreboardY, 240, scoreboardHeight, 12);
    ctx.stroke();

    // 分數（玩家）
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${score.player}`, COURT.WIDTH / 2 - 20, scoreboardY + 42);

    // 分隔符
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(':', COURT.WIDTH / 2, scoreboardY + 40);

    // 分數（對手）
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'left';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`${score.opponent}`, COURT.WIDTH / 2 + 20, scoreboardY + 42);

    // 發球方指示器
    const serverIndicatorY = scoreboardY + scoreboardHeight - 15;
    if (serverSide === 'player') {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(COURT.WIDTH / 2 - 80, serverIndicatorY, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(COURT.WIDTH / 2 + 80, serverIndicatorY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 【新增】連擊顯示
    if (combo > 2) {
      ctx.save();
      const comboScale = 1 + (combo / 20);
      ctx.translate(COURT.WIDTH / 2, scoreboardY + scoreboardHeight + 30);
      ctx.scale(comboScale, comboScale);

      // 連擊背景
      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.roundRect(-50, -15, 100, 30, 15);
      ctx.fill();

      // 連擊文字
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${combo} COMBO!`, 0, 5);
      ctx.restore();
    }

    ctx.restore(); // 恢復縮放
  }, [gameState, score, combo, serverSide]);

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

        // 【長按蓄力】記錄開始蓄力時間
        if (gameState === 'serving-ready' || gameState === 'playing') {
          chargeStartTime.current = Date.now();
          return; // 不立即執行，等待keyup
        }

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
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // 【長按蓄力】計算力度並執行動作
      if ((e.key === ' ' || e.key === 'Enter') && chargeStartTime.current !== null) {
        const chargeTime = Date.now() - chargeStartTime.current;
        const power = Math.min(chargeTime / 1000, 1.5); // 最多1.5秒，力度1-2.5倍
        chargeStartTime.current = null;
        setChargePower(0);

        // 執行發球或擊球
        if (gameState === 'serving-ready' && serverSide === 'player') {
          performServe(true, power);
        } else if (gameState === 'playing') {
          isSwinging.current = true;
          swingProgress.current = 0.1;
        }
      }

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

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      // 開始發球流程（掉落階段）
      if (gameState === 'ready' || gameState === 'point') {
        if (serverSide !== 'player') return;

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
        return;
      }

      // 【長按蓄力】開始蓄力
      if (gameState === 'serving-ready' || gameState === 'playing') {
        chargeStartTime.current = Date.now();
      }
    };

    const handleMouseUp = () => {
      // 【長按蓄力】計算力度並執行動作
      if (chargeStartTime.current !== null) {
        const chargeTime = Date.now() - chargeStartTime.current;
        const power = Math.min(chargeTime / 1000, 1.5); // 最多1.5秒
        chargeStartTime.current = null;
        setChargePower(0);

        if (gameState === 'serving-ready' && serverSide === 'player') {
          performServe(true, power);
        } else if (gameState === 'playing') {
          isSwinging.current = true;
          swingProgress.current = 0.1;
        }
      }
    };

    const canvas = canvasRef.current;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('touchstart', handleMouseDown as any);
      canvas.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('touchstart', handleMouseDown as any);
        canvas.removeEventListener('touchend', handleMouseUp);
      }
    };
  }, [gameState]);

  // 遊戲開始按鈕
  const startGame = () => {
    // 初始化音效系統並播放開場音效
    initAudioContext();
    playGameStartSound();

    setGameScreen('game');
    setGameState('ready');
    setScore({ player: 0, opponent: 0 });
    setMessage('點擊「發球」按鈕或點擊畫面開始發球');
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
    // 播放開場音效
    playGameStartSound();

    setGameScreen('game');
    setGameState('ready');
    setScore({ player: 0, opponent: 0 });
    setWinner(null);
    player.current = { x: 50, y: COURT.CENTER_Y + 100, vx: 0, vy: 0 };
    opponent.current = { x: COURT.WIDTH - 50, y: COURT.CENTER_Y - 100, vx: 0, vy: 0 };
    ball.current = { x: 50, y: COURT.CENTER_Y + 50, z: 0, vx: 0, vy: 0, vz: 0, spin: 0 };
    setServerSide('player');
    setMessage('點擊「發球」按鈕或點擊畫面開始發球');
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
                        <li>• 第三球後可截擊對打</li>
                        <li>• 廚房區內永遠禁止截擊</li>
                      </ul>
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg">
                      <h3 className="font-bold text-green-600 mb-1.5">🎮 操作方式</h3>
                      <ul className="space-y-0.5 text-gray-700">
                        <li>• 🖱️ 滑鼠移動控制球拍</li>
                        <li>• 🖱️ 點擊發球與揮拍</li>
                        <li>• ⌨️ WASD / 方向鍵移動</li>
                        <li>• 🎯 擊球位置影響旋轉</li>
                        <li>• ⚡ 移動速度影響力道</li>
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
              <div className="bg-gradient-to-r from-pickleball-500 to-sport-500 text-white px-6 py-3 rounded-full text-center font-bold text-lg mb-4 shadow-lg animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">📢</span>
                  <span>{message}</span>
                </div>
              </div>
            )}

            {/* 音效控制按鈕 */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={toggleMute}
                className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 flex items-center gap-2"
                title={isMuted ? "開啟音效" : "靜音"}
              >
                {isMuted ? (
                  <>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-600">靜音</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span className="text-sm font-semibold text-green-600">音效</span>
                  </>
                )}
              </button>
            </div>

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
          <div className={`rounded-xl p-4 transition-all duration-300 ${serverSide === 'player' ? 'bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-400' : 'bg-blue-50'}`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-gray-600 text-sm font-semibold">你的分數</span>
                {serverSide === 'player' && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">發球</span>}
              </div>
              <div className="text-5xl font-black text-blue-600 drop-shadow-sm">{score.player}</div>
              {combo > 2 && (
                <div className="mt-2 text-xs font-bold text-yellow-600 animate-bounce">
                  🔥 {combo} 連擊！
                </div>
              )}
            </div>
          </div>
          <div className={`rounded-xl p-4 transition-all duration-300 ${serverSide === 'opponent' ? 'bg-gradient-to-br from-red-100 to-red-200 ring-2 ring-red-400' : 'bg-red-50'}`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-gray-600 text-sm font-semibold">對手分數</span>
                {serverSide === 'opponent' && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">發球</span>}
              </div>
              <div className="text-5xl font-black text-red-600 drop-shadow-sm">{score.opponent}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎮</span>
            <h3 className="font-bold text-gray-800">遊戲控制</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-green-200">
              <div className="font-bold text-green-700 mb-2 flex items-center gap-1">
                <span>🖱️</span>
                <span>滑鼠控制（推薦）</span>
              </div>
              <div className="text-gray-600 space-y-1">
                <div>• 移動滑鼠：控制球拍</div>
                <div>• 點擊畫面：揮拍/發球</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
              <div className="font-bold text-blue-700 mb-2 flex items-center gap-1">
                <span>⌨️</span>
                <span>鍵盤控制</span>
              </div>
              <div className="text-gray-600 space-y-1">
                <div>• WASD/方向鍵：移動</div>
                <div>• 空白鍵：揮拍/發球</div>
              </div>
            </div>
          </div>
          <div className="mt-3 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-300">
            <div className="font-bold text-yellow-800 mb-1 flex items-center gap-1">
              <span>⚡</span>
              <span>進階技巧</span>
            </div>
            <div className="text-yellow-700 text-xs space-y-1">
              <div>• 快速移動球拍 → 增加擊球力道（最多+50%）</div>
              <div>• 球拍上緣擊球 → 下旋（球會飄）</div>
              <div>• 球拍下緣擊球 → 上旋（球快速下墜）</div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gradient-to-br from-pickleball-50 to-sport-50 rounded-xl p-4 border-2 border-pickleball-300 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📖</span>
            <h3 className="font-bold text-gray-800">匹克球規則</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
            <div className="space-y-2">
              <div className="bg-white p-2 rounded-lg border border-pickleball-200">
                <span className="font-bold text-pickleball-600">🏓 發球規則</span>
                <div className="mt-1 space-y-0.5 text-gray-600">
                  <div>• 得分方發球</div>
                  <div>• 兩段式發球（掉落→擊球）</div>
                  <div>• 自動對角發球</div>
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-200">
                <span className="font-bold text-blue-600">⚡ 雙彈跳規則</span>
                <div className="mt-1 space-y-0.5 text-gray-600">
                  <div>• 發球、接發球必須等球彈地</div>
                  <div>• 第三球後可直接截擊</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded-lg border border-yellow-200">
                <span className="font-bold text-yellow-600">🚫 廚房區限制</span>
                <div className="mt-1 space-y-0.5 text-gray-600">
                  <div>• 黃色區域內禁止截擊</div>
                  <div>• 必須等球彈地才能打</div>
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-red-200">
                <span className="font-bold text-red-600">❌ 失分條件</span>
                <div className="mt-1 space-y-0.5 text-gray-600">
                  <div>• 球未過網到對方場地</div>
                  <div>• 球在對方場地彈兩次</div>
                  <div>• 球出界或掛網</div>
                </div>
              </div>
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
