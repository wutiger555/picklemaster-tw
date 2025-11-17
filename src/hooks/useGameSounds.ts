import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * 匹克球遊戲音效系統
 * 包含擊球、彈地、得分、犯規等遊戲音效
 */
export const useGameSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('game-muted');
    return saved === 'true';
  });

  // 初始化音效上下文
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('game-muted', String(isMuted));
  }, [isMuted]);

  // 擊球音效（球拍擊球）
  const playPaddleHitSound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // 低頻打擊聲
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.05);

    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc1.start(now);
    osc1.stop(now + 0.08);

    // 高頻打擊聲（模擬球拍表面）
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 0.02);

    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc2.start(now);
    osc2.stop(now + 0.04);
  }, [isMuted, initAudioContext]);

  // 球彈地音效
  const playBounceSound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }, [isMuted, initAudioContext]);

  // 得分音效（簡短的上升音）
  const playScoreSound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // 三個音符的快速上升旋律
    const notes = [
      { freq: 523.25, time: 0 },      // C5
      { freq: 659.25, time: 0.08 },   // E5
      { freq: 783.99, time: 0.16 },   // G5
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.25, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.1);

      osc.start(now + note.time);
      osc.stop(now + note.time + 0.1);
    });
  }, [isMuted, initAudioContext]);

  // 犯規音效（低沉的錯誤音）
  const playFaultSound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }, [isMuted, initAudioContext]);

  // 球掛網音效
  const playNetSound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // 模擬球撞網的聲音
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }, [isMuted, initAudioContext]);

  // 獲勝音效（完整的勝利旋律）
  const playWinSound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // 勝利旋律
    const melody = [
      { freq: 523.25, time: 0, duration: 0.15 },      // C5
      { freq: 587.33, time: 0.15, duration: 0.15 },   // D5
      { freq: 659.25, time: 0.3, duration: 0.15 },    // E5
      { freq: 783.99, time: 0.45, duration: 0.25 },   // G5
      { freq: 1046.50, time: 0.7, duration: 0.4 },    // C6
    ];

    melody.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.3, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.duration);
    });
  }, [isMuted, initAudioContext]);

  // 發球專屬音效（類似網球發球的"嗖"聲）
  const playServeSound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // 模擬發球的"嗖"聲 - 使用白噪音和濾波器
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    // 生成白噪音
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    filter.Q.setValueAtTime(5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.3);

    // 加入低頻的"咚"聲
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }, [isMuted, initAudioContext]);

  // 遊戲開始音效
  const playGameStartSound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // 簡短的開始提示音
    const notes = [
      { freq: 659.25, time: 0 },      // E5
      { freq: 783.99, time: 0.1 },    // G5
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.25, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.1);

      osc.start(now + note.time);
      osc.stop(now + note.time + 0.1);
    });
  }, [isMuted, initAudioContext]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
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
  };
};
