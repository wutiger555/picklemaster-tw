import React, { useEffect, useRef, useState } from 'react';
import { useGameSounds } from '../../hooks/useGameSounds';
import { motion, AnimatePresence } from 'framer-motion';

// --- 3D Engine Constants ---
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const BASE_FOV = 360;
const CAMERA_HEIGHT = 140;
const COURT_LENGTH = 880;
const COURT_WIDTH = 400;

// --- Physics Constants ---
const PHYSICS = {
  GRAVITY: 0.25,
  DRAG: 0.995,
  BOUNCE_DAMPING: 0.85,
  NET_HEIGHT: 34,
  PADDLE_REACH: 140,
  PADDLE_WIDTH: 60,
  PLAYER_SPEED: 16,
};

// --- Types ---
interface Vector3 { x: number; y: number; z: number; }
interface Point2D { x: number; y: number; scale: number; }
interface Particle {
  id: number; pos: Vector3; vel: Vector3;
  life: number; color: string; size: number;
  type: 'spark' | 'text' | 'ring' | 'trail'; text?: string;
}

type GameState = 'MENU' | 'SERVING' | 'PLAYING' | 'POINT_AWARDED' | 'GAME_OVER';
type ShotType = '平擊' | '高吊' | '小球' | '殺球' | '火焰球' | '幸運球';

// --- Helper Classes ---
class Ball {
  pos: Vector3 = { x: 0, y: 100, z: 200 };
  vel: Vector3 = { x: 0, y: 0, z: 0 };
  radius: number = 10;
  bounces: number = 0;
  lastHitter: 'player' | 'opponent' | null = null;
  maxHeight: number = 0;
  isFireball: boolean = false;

  update() {
    this.vel.y -= PHYSICS.GRAVITY;
    this.vel.x *= PHYSICS.DRAG;
    this.vel.z *= PHYSICS.DRAG;

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.pos.z += this.vel.z;

    if (this.pos.y > this.maxHeight) this.maxHeight = this.pos.y;

    // Ground
    if (this.pos.y <= 0) {
      this.pos.y = 0;
      this.isFireball = false; // Fireball extinguishes on bounce
      if (Math.abs(this.vel.y) > 1) {
        this.vel.y = -this.vel.y * PHYSICS.BOUNCE_DAMPING;
        this.bounces++;
        return 'bounce';
      } else {
        this.vel.y = 0;
        this.vel.x *= 0.9;
        this.vel.z *= 0.9;
      }
    }

    // Net
    if (Math.abs(this.pos.z) < 10 && this.pos.y < PHYSICS.NET_HEIGHT && Math.abs(this.pos.x) < COURT_WIDTH / 2 + 40) {
      this.vel.z *= -0.5;
      this.vel.x *= 0.5;
      this.pos.z = this.pos.z < 0 ? -15 : 15;
      this.isFireball = false;
      return 'net';
    }

    return null;
  }

  reset(z: number) {
    this.pos = { x: 0, y: 100, z };
    this.vel = { x: 0, y: 0, z: 0 };
    this.bounces = 0;
    this.lastHitter = null;
    this.maxHeight = 0;
    this.isFireball = false;
  }
}

// --- Main Component ---
const PickleballGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [server, setServer] = useState<'player' | 'opponent'>('player');
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  const [focus, setFocus] = useState(0); // 0-100
  const [charge, setCharge] = useState(0);
  const [shotType, setShotType] = useState<ShotType>('平擊');
  const [ruleHint, setRuleHint] = useState<string>('');

  const ball = useRef(new Ball());
  const player = useRef({ x: 0, z: -450 });
  const opponent = useRef({ x: 0, z: 450 });
  const particles = useRef<Particle[]>([]);
  const cameraShake = useRef(0);
  const currentFOV = useRef(BASE_FOV);

  // Swing State
  const swingState = useRef({
    active: false,
    timer: 0,
    charge: 0,
    hasHit: false
  });

  // Game Rules State
  const rallyState = useRef({
    serveBounceCount: 0,
    rallyCount: 0
  });

  const mouse = useRef({ x: 0, y: 0, leftDown: false, rightDown: false, downTime: 0 });

  const { playPaddleHitSound, playBounceSound, playScoreSound, playWinSound, playNetSound } = useGameSounds();

  // True FPS Projection
  const project = (p: Vector3): Point2D => {
    const camX = player.current.x;
    const camY = CAMERA_HEIGHT;
    const camZ = player.current.z;

    const rx = p.x - camX;
    const ry = p.y - camY;
    const rz = p.z - camZ;

    if (rz <= 10) return { x: -9999, y: -9999, scale: 0 };

    const scale = currentFOV.current / rz;
    const x2d = rx * scale + CANVAS_WIDTH / 2;
    const y2d = -ry * scale + CANVAS_HEIGHT / 2;

    return { x: x2d, y: y2d, scale };
  };

  const projectClamped = (p: Vector3): Point2D => {
    const camZ = player.current.z;
    const z = Math.max(p.z, camZ + 20);
    return project({ ...p, z });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      update(dt);
      draw(ctx);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  const update = (dt: number) => {
    if (gameState === 'MENU' || gameState === 'GAME_OVER') return;

    const p = player.current;
    const b = ball.current;

    // --- DYNAMIC FOV ---
    // Zoom in slightly when hitting or when ball is close
    let targetFOV = BASE_FOV;
    if (swingState.current.active) targetFOV = BASE_FOV + 20;
    currentFOV.current += (targetFOV - currentFOV.current) * 0.1 * dt;

    // --- AUTO MOVEMENT SYSTEM (Smart Positioning) ---
    let targetX = p.x;
    let targetZ = -450;

    if (gameState === 'PLAYING') {
      // X Positioning
      if (b.vel.z < 0 || b.pos.z < 0) {
        targetX = b.pos.x;
        targetX = Math.max(-COURT_WIDTH / 2 + 20, Math.min(COURT_WIDTH / 2 - 20, targetX));
      } else {
        targetX = 0;
      }

      // Z Positioning
      const isDropShot = b.pos.z < -50 && b.vel.z < 0 && b.bounces > 0;

      if (isDropShot) {
        targetZ = b.pos.z - 70;
      } else {
        targetZ = -480;
        if (b.pos.z < -350 && b.vel.z < 0) targetZ = -550;
      }
    } else if (gameState === 'SERVING') {
      targetZ = -480;
      targetX = 0;
    }

    // Smooth Move
    p.x += (targetX - p.x) * 0.15 * dt;
    p.z += (targetZ - p.z) * 0.15 * dt;

    // Clamp Player
    p.x = Math.max(-COURT_WIDTH / 2 - 80, Math.min(COURT_WIDTH / 2 + 80, p.x));
    p.z = Math.min(-20, p.z);


    // --- BALL LOGIC ---
    if (gameState === 'SERVING') {
      if (server === 'player') {
        ball.current.pos.x = p.x + 30;
        ball.current.pos.y = 100;
        ball.current.pos.z = p.z + 50;
        ball.current.vel = { x: 0, y: 0, z: 0 };

        if (mouse.current.leftDown) {
          const duration = Date.now() - mouse.current.downTime;
          const c = Math.min(duration / 1000, 1); // 1 second to max charge
          setCharge(c);
        } else {
          setCharge(0);
        }
      } else {
        // Opponent Serving
        if (Math.random() < 0.02) {
          setGameState('PLAYING');
          performHit('opponent', 0.5, '平擊');
          rallyState.current.serveBounceCount = 0;
          rallyState.current.rallyCount = 0;
        }
      }
    } else {
      const event = ball.current.update();
      if (event === 'bounce') {
        playBounceSound();
        spawnParticles(ball.current.pos, 5, '#fbbf24');
        cameraShake.current = 2;

        if (rallyState.current.serveBounceCount < 2) {
          rallyState.current.serveBounceCount++;
        }
      } else if (event === 'net') {
        playNetSound();
        cameraShake.current = 5;
      }

      // Fireball Trail
      if (ball.current.isFireball) {
        spawnParticles(ball.current.pos, 2, '#ef4444');
      }
    }

    // --- SWING & HIT LOGIC ---
    if (swingState.current.active) {
      swingState.current.timer -= 0.08 * dt;

      if (!swingState.current.hasHit && swingState.current.timer < 0.8 && swingState.current.timer > 0.2) {
        const dx = b.pos.x - p.x;
        const dz = b.pos.z - p.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const inFront = b.pos.z > p.z - 20;

        if (dist < PHYSICS.PADDLE_REACH && inFront) {
          performHit('player', swingState.current.charge, shotType);
          swingState.current.hasHit = true;
        }
      }

      if (swingState.current.timer <= 0) {
        swingState.current.active = false;
      }
    }

    // Charge Logic
    if (gameState === 'PLAYING' && mouse.current.leftDown && !swingState.current.active) {
      const duration = Date.now() - mouse.current.downTime;
      const c = Math.min(duration / 800, 1);
      setCharge(c);
    }

    updateAI(dt);
    checkAIHit();
    checkRules();
    updateParticles();
    if (cameraShake.current > 0) cameraShake.current *= 0.9;
  };

  const handleMouseUp = () => {
    if (gameState === 'SERVING') {
      if (server === 'player') {
        mouse.current.leftDown = false;
        setGameState('PLAYING');
        // Serve power based on charge
        performHit('player', charge, '平擊');
        rallyState.current.serveBounceCount = 0;
        rallyState.current.rallyCount = 0;
      }
      return;
    }

    if (gameState !== 'PLAYING') return;

    if (!swingState.current.active) {
      swingState.current.active = true;
      swingState.current.timer = 1.0;
      swingState.current.charge = charge;
      swingState.current.hasHit = false;
      mouse.current.leftDown = false;
      setCharge(0);
    }
  };

  const performHit = (side: 'player' | 'opponent', power: number, type: ShotType) => {
    const b = ball.current;
    const isPlayer = side === 'player';
    const p = player.current;

    if (isPlayer) {
      const inKitchen = p.z > -70;
      if (inKitchen && b.bounces === 0) {
        handlePoint('opponent', '廚房違規 (Kitchen)');
        return;
      }

      if (rallyState.current.serveBounceCount < 2 && b.bounces === 0) {
        handlePoint('opponent', '二跳規則 (Two-Bounce)');
        return;
      }

      // --- FOCUS & LUCK SYSTEM ---
      let finalType = type;
      let isFireball = false;

      // 1. Max Focus = Guaranteed Fireball
      if (focus >= 100) {
        finalType = '火焰球';
        isFireball = true;
        setFocus(0); // Reset
        spawnFloatingText("FIREBALL!", 80);
      }
      // 2. Luck = Random Critical Hit (15%)
      else if (Math.random() < 0.15) {
        finalType = '幸運球';
        spawnFloatingText("LUCKY HIT!", 60);
        setFocus(prev => Math.min(prev + 20, 100)); // Bonus focus
      }
      // 3. Normal Hit
      else {
        setFocus(prev => Math.min(prev + 10, 100));
      }

      setShotType(finalType);
      b.isFireball = isFireball;

      playPaddleHitSound();
      cameraShake.current = isFireball ? 20 : (finalType === '幸運球' ? 10 : 5 + power * 10);
      spawnParticles(b.pos, isFireball ? 40 : 20, isFireball ? '#ef4444' : (isPlayer ? '#3b82f6' : '#ef4444'));
      spawnRing(b.pos, isFireball ? '#ef4444' : (isPlayer ? '#3b82f6' : '#ef4444'));

      // Target Logic
      let targetX = 0;
      let targetZ = 380;

      const mouseRatio = (mouse.current.x - CANVAS_WIDTH / 2) / (CANVAS_WIDTH / 2);
      targetX = mouseRatio * (COURT_WIDTH / 2 - 40);
      targetX = Math.max(-COURT_WIDTH / 2 + 30, Math.min(COURT_WIDTH / 2 - 30, targetX));

      // Contextual Shot Types if not special
      if (finalType !== '火焰球' && finalType !== '幸運球') {
        if (b.pos.y > 80 && b.pos.z < p.z + 250) finalType = '殺球';
        else if (power < 0.2) finalType = '小球';
        else if (Math.random() < 0.1) finalType = '高吊'; // Add random lob chance for variety
        else finalType = '平擊';
      }

      if (finalType === '小球') targetZ = 60 + Math.random() * 40;
      else if (finalType === '高吊') targetZ = COURT_LENGTH / 2 - 60;
      else targetZ = COURT_LENGTH / 2 - 80 - Math.random() * 50;

      const dx = targetX - b.pos.x;
      const dz = targetZ - b.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      let speed = 12;
      let vy = 5;

      switch (finalType) {
        case '平擊': speed = 18 + power * 6; vy = 4 + power * 3; break;
        case '高吊': speed = 12 + power * 3; vy = 22 + power * 4; break;
        case '小球': speed = 9; vy = 9; break;
        case '殺球': speed = 26 + power * 6; vy = -6; break;
        case '火焰球': speed = 32; vy = 2; break; // Laser beam
        case '幸運球': speed = 24; vy = 5; break; // Fast drive
      }

      b.vel.x = (dx / dist) * speed;
      b.vel.z = (dz / dist) * speed;
      b.vel.y = vy;

    } else {
      // Opponent Hit
      playPaddleHitSound();
      spawnParticles(b.pos, 20, '#ef4444');

      let targetX = player.current.x + (Math.random() - 0.5) * 120;
      let targetZ = -COURT_LENGTH / 2 + 80 + Math.random() * 60;

      const dx = targetX - b.pos.x;
      const dz = targetZ - b.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      let speed = 16;
      let vy = 4;

      // AI Logic
      if (type === '殺球') { speed = 22; vy = -5; }
      else if (type === '高吊') { speed = 10; vy = 18; }
      else if (type === '小球') { speed = 8; vy = 8; }

      b.vel.x = (dx / dist) * speed;
      b.vel.z = (dz / dist) * speed;
      b.vel.y = vy;
    }

    b.lastHitter = side;
    b.bounces = 0;
    rallyState.current.rallyCount++;
  };

  const updateAI = (dt: number) => {
    const ai = opponent.current;
    const b = ball.current;

    let tx = b.pos.x;
    let tz = 400;

    if (b.vel.z > 0) {
      tx = b.pos.x;
      if (b.pos.z > 50 && b.bounces > 0) {
        tz = b.pos.z;
      } else {
        tz = 400;
      }
    }

    ai.x += (tx - ai.x) * 0.05 * dt;
    ai.z += (tz - ai.z) * 0.05 * dt;
  };

  const checkAIHit = () => {
    const ai = opponent.current;
    const b = ball.current;

    if (b.lastHitter !== 'opponent' && b.pos.z > 0 && b.vel.z > 0) {
      const dist = Math.sqrt(Math.pow(b.pos.x - ai.x, 2) + Math.pow(b.pos.z - ai.z, 2));
      if (dist < PHYSICS.PADDLE_REACH && b.pos.y < 120) {
        if (rallyState.current.serveBounceCount < 2 && b.bounces === 0) return;

        let type: ShotType = '平擊';
        if (b.pos.y > 80 && Math.random() < 0.5) type = '殺球';
        else if (Math.random() < 0.1) type = '高吊';
        else if (Math.random() < 0.2) type = '小球';

        performHit('opponent', 0.4, type);
      }
    }
  };

  const checkRules = () => {
    const b = ball.current;
    if (Math.abs(b.pos.z) > COURT_LENGTH / 2 + 50 || Math.abs(b.pos.x) > COURT_WIDTH / 2 + 50) {
      if (b.bounces === 0) {
        handlePoint(b.lastHitter === 'player' ? 'opponent' : 'player', '出界!');
      }
    }
    if (b.bounces >= 2) {
      handlePoint(b.lastHitter === 'player' ? 'player' : 'opponent', '二跳得分');
    }
  };

  const handlePoint = (winner: 'player' | 'opponent', reason: string) => {
    if (gameState === 'POINT_AWARDED') return;
    setGameState('POINT_AWARDED');
    playScoreSound();
    spawnFloatingText(reason, 60);

    if (reason.includes('Kitchen')) setRuleHint('規則提示: 不可在廚房區(橘色)內截擊(Volley)');
    else if (reason.includes('Two-Bounce')) setRuleHint('規則提示: 發球與接發球後必須各落地一次才能截擊');
    else setRuleHint('');

    let nextServer = server;
    let pointScored = false;

    if (winner === server) {
      pointScored = true;
    } else {
      nextServer = server === 'player' ? 'opponent' : 'player';
      spawnFloatingText("換發球 (Side Out)", 50);
    }

    setScore(s => {
      const ns = { ...s };
      if (pointScored) {
        ns[winner] = s[winner] + 1;
      }

      if (ns.player >= 11 || ns.opponent >= 11) {
        setTimeout(() => {
          setWinner(ns.player > ns.opponent ? 'player' : 'opponent');
          setGameState('GAME_OVER');
          playWinSound();
        }, 1000);
      } else {
        setTimeout(() => resetRound(nextServer), 2000);
      }
      return ns;
    });
  };

  const resetRound = (nextServer: 'player' | 'opponent') => {
    setServer(nextServer);
    if (nextServer === 'player') {
      ball.current.reset(-380);
    } else {
      ball.current.reset(380);
    }
    setGameState('SERVING');
    setRuleHint('');
  };

  const spawnParticles = (pos: Vector3, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      particles.current.push({
        id: Math.random(),
        pos: { ...pos },
        vel: { x: (Math.random() - 0.5) * 15, y: Math.random() * 15, z: (Math.random() - 0.5) * 15 },
        life: 1, color, size: Math.random() * 8 + 4,
        type: 'spark'
      });
    }
  };

  const spawnRing = (pos: Vector3, color: string) => {
    particles.current.push({
      id: Math.random(), pos: { ...pos }, vel: { x: 0, y: 0, z: 0 },
      life: 1, color, size: 10, type: 'ring'
    });
  };

  const spawnFloatingText = (text: string, size: number) => {
    particles.current.push({
      id: Math.random(),
      pos: { x: 0, y: 150, z: 0 },
      vel: { x: 0, y: 2, z: 0 },
      life: 2, color: '#fff', size,
      type: 'text', text
    });
  };

  const updateParticles = () => {
    particles.current = particles.current.filter(p => p.life > 0);
    particles.current.forEach(p => {
      if (p.type === 'spark') {
        p.pos.x += p.vel.x;
        p.pos.y += p.vel.y;
        p.pos.z += p.vel.z;
        p.vel.y -= 0.5;
      } else if (p.type === 'ring') {
        p.size += 5;
      } else if (p.type === 'text') {
        p.pos.y += p.vel.y;
      }
      p.life -= 0.04;
    });
  };

  // --- Draw Functions ---

  const drawEnvironment = (ctx: CanvasRenderingContext2D) => {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT / 2);
    skyGrad.addColorStop(0, '#0ea5e9');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ground (Grass)
    const groundGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT / 2, 0, CANVAS_HEIGHT);
    groundGrad.addColorStop(0, '#166534');
    groundGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 50, CANVAS_WIDTH, CANVAS_HEIGHT / 2 + 50);

    // Trees
    ctx.fillStyle = '#064e3b';
    [-800, -600, 600, 800].forEach(x => {
      const p = project({ x, y: 0, z: 800 });
      if (p.scale > 0) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 60 * p.scale, p.y);
        ctx.lineTo(p.x, p.y - 300 * p.scale);
        ctx.lineTo(p.x + 60 * p.scale, p.y);
        ctx.fill();
      }
    });
  };

  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    // Use projectClamped for floor points to prevent clipping
    const c1 = projectClamped({ x: -COURT_WIDTH / 2, y: 0, z: -COURT_LENGTH / 2 });
    const c2 = projectClamped({ x: COURT_WIDTH / 2, y: 0, z: -COURT_LENGTH / 2 });
    const c3 = projectClamped({ x: COURT_WIDTH / 2, y: 0, z: COURT_LENGTH / 2 });
    const c4 = projectClamped({ x: -COURT_WIDTH / 2, y: 0, z: COURT_LENGTH / 2 });

    // Main Court Area (Blue)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.lineTo(c4.x, c4.y);
    ctx.closePath();
    ctx.fill();

    // Kitchen (Orange)
    const k1 = projectClamped({ x: -COURT_WIDTH / 2, y: 0, z: -70 });
    const k2 = projectClamped({ x: COURT_WIDTH / 2, y: 0, z: -70 });
    const k3 = projectClamped({ x: COURT_WIDTH / 2, y: 0, z: 70 });
    const k4 = projectClamped({ x: -COURT_WIDTH / 2, y: 0, z: 70 });

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(k1.x, k1.y);
    ctx.lineTo(k2.x, k2.y);
    ctx.lineTo(k3.x, k3.y);
    ctx.lineTo(k4.x, k4.y);
    ctx.fill();

    // Lines
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.lineTo(c4.x, c4.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.stroke();

    // Kitchen Lines
    ctx.beginPath();
    ctx.moveTo(k1.x, k1.y);
    ctx.lineTo(k2.x, k2.y);
    ctx.moveTo(k3.x, k3.y);
    ctx.lineTo(k4.x, k4.y);
    ctx.stroke();

    // Center Line
    const m1 = projectClamped({ x: 0, y: 0, z: -COURT_LENGTH / 2 });
    const m2 = projectClamped({ x: 0, y: 0, z: -70 });
    const m3 = projectClamped({ x: 0, y: 0, z: 70 });
    const m4 = projectClamped({ x: 0, y: 0, z: COURT_LENGTH / 2 });

    ctx.beginPath();
    ctx.moveTo(m1.x, m1.y); ctx.lineTo(m2.x, m2.y);
    ctx.moveTo(m3.x, m3.y); ctx.lineTo(m4.x, m4.y);
    ctx.stroke();
  };

  const drawNet = (ctx: CanvasRenderingContext2D) => {
    const p1 = project({ x: -COURT_WIDTH / 2 - 40, y: 0, z: 0 });
    const p2 = project({ x: COURT_WIDTH / 2 + 40, y: 0, z: 0 });
    const p3 = project({ x: COURT_WIDTH / 2 + 40, y: PHYSICS.NET_HEIGHT, z: 0 });
    const p4 = project({ x: -COURT_WIDTH / 2 - 40, y: PHYSICS.NET_HEIGHT, z: 0 });

    if (p1.scale <= 0) return;

    // Net Mesh
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
    ctx.fill();

    // Top Tape
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
    ctx.stroke();

    // Posts
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p4.x, p4.y);
    ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
    ctx.stroke();
  };

  const drawShadow = (ctx: CanvasRenderingContext2D, pos: Vector3, radius: number) => {
    const proj = project({ x: pos.x, y: 0, z: pos.z });
    if (proj.scale <= 0) return;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(proj.x, proj.y, radius * proj.scale * 2, radius * proj.scale * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawOpponent = (ctx: CanvasRenderingContext2D) => {
    const pos = opponent.current;
    const proj = project({ x: pos.x, y: 0, z: pos.z });
    if (proj.scale <= 0) return;
    const scale = proj.scale;

    // Body
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y - 70 * scale, 20 * scale, 0, Math.PI * 2); // Head
    ctx.fill();
    ctx.fillRect(proj.x - 20 * scale, proj.y - 50 * scale, 40 * scale, 50 * scale); // Torso

    // Paddle
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(proj.x - 35 * scale, proj.y - 35 * scale, 18 * scale, 30 * scale);
  };

  const drawBall = (ctx: CanvasRenderingContext2D) => {
    const b = ball.current;
    const proj = project(b.pos);
    if (proj.scale <= 0) return;

    ctx.fillStyle = b.isFireball ? '#ef4444' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, b.radius * proj.scale, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(proj.x - b.radius * 0.3 * proj.scale, proj.y - b.radius * 0.3 * proj.scale, b.radius * 0.3 * proj.scale, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawFirstPersonPaddle = (ctx: CanvasRenderingContext2D) => {
    // Position based on mouse sway
    const swayX = (mouse.current.x - CANVAS_WIDTH / 2) * 0.15;
    const swayY = (mouse.current.y - CANVAS_HEIGHT / 2) * 0.15;

    const baseX = CANVAS_WIDTH * 0.75;
    const baseY = CANVAS_HEIGHT * 0.85;

    // Swing Animation
    let rotation = -0.2; // Resting angle
    let x = baseX + swayX;
    let y = baseY + swayY;

    if (swingState.current.active) {
      // Swing motion: Rotate forward and move slightly
      const t = swingState.current.timer; // 1.0 -> 0.0
      // Ease out
      const ease = 1 - Math.pow(1 - t, 3);

      rotation = -0.2 - Math.sin(ease * Math.PI) * 1.8; // Swing arc
      x -= Math.sin(ease * Math.PI) * 150;
      y -= Math.sin(ease * Math.PI) * 80;
    } else if (charge > 0) {
      // Charge back
      x += charge * 60;
      y += charge * 20;
      rotation += charge * 0.6;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Paddle Handle
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-15, 0, 30, 120);

    // Paddle Face
    ctx.fillStyle = focus >= 100 ? '#fbbf24' : '#3b82f6'; // Gold if charged
    ctx.beginPath();
    ctx.roundRect(-65, -150, 130, 160, 24);
    ctx.fill();

    // Paddle Rim
    ctx.strokeStyle = focus >= 100 ? '#f59e0b' : '#1d4ed8';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Charge Glow
    if (charge > 0 || focus >= 100) {
      ctx.shadowColor = focus >= 100 ? '#fbbf24' : 'white';
      ctx.shadowBlur = (charge * 40) + (focus >= 100 ? 20 : 0);
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(charge, focus >= 100 ? 0.5 : 0)})`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  };

  const handleMouseDown = () => {
    if (gameState === 'MENU' || gameState === 'GAME_OVER') {
      setGameState('SERVING');
      setScore({ player: 0, opponent: 0 });
      setServer('player');
      setFocus(0);
      ball.current.reset(-380);
      return;
    }
    mouse.current.leftDown = true;
    mouse.current.downTime = Date.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouse.current.x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      mouse.current.y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    const shakeX = (Math.random() - 0.5) * cameraShake.current;
    const shakeY = (Math.random() - 0.5) * cameraShake.current;
    ctx.translate(shakeX, shakeY);

    drawEnvironment(ctx);
    drawCourt(ctx);

    // Shadows
    drawShadow(ctx, ball.current.pos, 15);
    drawShadow(ctx, { x: opponent.current.x, y: 0, z: opponent.current.z }, 25);

    // Entities (Sorted by Z)
    const entities = [
      { type: 'opponent', pos: { x: opponent.current.x, y: 0, z: opponent.current.z } },
      { type: 'ball', pos: ball.current.pos },
      { type: 'net', pos: { x: 0, y: 0, z: 0 } }
    ];
    entities.sort((a, b) => a.pos.z - b.pos.z);

    entities.forEach(e => {
      if (e.type === 'net') drawNet(ctx);
      else if (e.type === 'opponent') drawOpponent(ctx);
      else if (e.type === 'ball') drawBall(ctx);
    });

    particles.current.forEach(p => {
      const proj = project(p.pos);
      if (proj.scale <= 0) return;

      ctx.globalAlpha = p.life;

      if (p.type === 'text' && p.text) {
        ctx.font = `900 ${p.size}px "Noto Sans TC", sans-serif`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText(p.text, proj.x, proj.y);
        ctx.fillText(p.text, proj.x, proj.y);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 5 * p.life;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;

    ctx.restore(); // End camera shake

    // UI & First Person Elements (No Shake)
    drawFirstPersonPaddle(ctx);

  };

  useEffect(() => {
    const contextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', contextMenu);
    return () => {
      window.removeEventListener('contextmenu', contextMenu);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto relative select-none">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-neutral-800 bg-neutral-900 aspect-[16/9]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full cursor-none block"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
        />

        {/* Minimal HUD */}
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
          {/* Score */}
          <div className="flex justify-center items-start space-x-12">
            <div className="text-center">
              <div className={`text-6xl font-black drop-shadow-lg ${server === 'player' ? 'text-yellow-400 scale-110' : 'text-blue-400'}`}>
                {score.player}
                {server === 'player' && <div className="text-sm text-yellow-400 mt-1">Serving</div>}
              </div>
            </div>
            <div className="text-white/50 font-black text-4xl pt-2">-</div>
            <div className="text-center">
              <div className={`text-6xl font-black drop-shadow-lg ${server === 'opponent' ? 'text-yellow-400 scale-110' : 'text-red-400'}`}>
                {score.opponent}
                {server === 'opponent' && <div className="text-sm text-yellow-400 mt-1">Serving</div>}
              </div>
            </div>
          </div>

          {/* Shot Type Indicator */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2">
            {gameState === 'PLAYING' && (
              <div className={`px-6 py-2 rounded-full font-bold text-xl shadow-xl backdrop-blur-md border border-white/20 ${shotType === '殺球' ? 'bg-red-600/80 text-white animate-pulse' :
                shotType === '高吊' ? 'bg-purple-600/80 text-white' :
                  shotType === '火焰球' ? 'bg-red-500 text-white animate-bounce' :
                    shotType === '幸運球' ? 'bg-yellow-500 text-black animate-bounce' :
                      'bg-blue-600/80 text-white'
                }`}>
                {shotType}
              </div>
            )}
            {ruleHint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 bg-black/70 text-yellow-400 rounded text-sm font-bold"
              >
                {ruleHint}
              </motion.div>
            )}
          </div>

          {/* Serve Guide */}
          {gameState === 'SERVING' && server === 'player' && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2">
              <div className="text-white font-bold text-lg drop-shadow-md animate-pulse">
                {charge > 0 ? "放開擊球!" : "按住蓄力，放開擊球"}
              </div>
              <div className="w-64 h-4 bg-black/50 rounded-full overflow-hidden border border-white/30">
                <div
                  className={`h-full transition-all duration-75 ${charge > 0.8 ? 'bg-red-500' : 'bg-yellow-400'}`}
                  style={{ width: `${charge * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Focus Meter */}
          <div className="flex justify-start items-end">
            <div className="w-64">
              <div className="flex justify-between text-xs text-white mb-1 font-bold tracking-widest shadow-black drop-shadow-md">
                <span>專注 (FOCUS)</span>
                {focus >= 100 && <span className="text-yellow-400 animate-pulse">FIREBALL READY!</span>}
              </div>
              <div className={`h-4 rounded-full overflow-hidden border border-white/20 backdrop-blur ${focus >= 100 ? 'bg-red-900/50' : 'bg-black/50'}`}>
                <div
                  className={`h-full transition-all duration-200 ${focus >= 100 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-blue-500'}`}
                  style={{ width: `${focus}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-white/60 font-mono">
                集滿專注值可擊出火焰球!
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {gameState === 'MENU' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10"
            >
              <h1 className="text-8xl font-black mb-4 italic tracking-tighter text-white drop-shadow-2xl">
                PICKLE MASTER
              </h1>
              <p className="text-2xl text-white/90 mb-12 font-bold tracking-widest">第一人稱擬真體驗</p>
              <button
                className="px-16 py-6 bg-blue-600 text-white font-black text-3xl rounded-lg hover:bg-blue-500 transition-all pointer-events-auto shadow-xl hover:scale-105"
                onClick={handleMouseDown}
              >
                開始比賽
              </button>
            </motion.div>
          )}
          {gameState === 'GAME_OVER' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-10"
            >
              <h2 className="text-8xl font-black mb-8 tracking-tighter">
                {winner === 'player' ? <span className="text-blue-400">獲勝!</span> : <span className="text-red-400">落敗...</span>}
              </h2>
              <button
                className="px-12 py-4 bg-white text-black font-black text-2xl rounded hover:bg-neutral-200 pointer-events-auto"
                onClick={handleMouseDown}
              >
                再玩一次
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PickleballGame;
