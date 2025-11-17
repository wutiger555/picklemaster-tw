import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * 專業匹克球計分器音效與語音系統
 * 包含哨音、語音提示、比賽狀態播報
 */
export const useScorerSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('scorer-muted');
    return saved === 'true';
  });

  // 初始化音效上下文（需要用戶互動）
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // 恢復 AudioContext（iOS Safari 需要）
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
    // 清理函數
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 保存靜音設定
  useEffect(() => {
    localStorage.setItem('scorer-muted', String(isMuted));
  }, [isMuted]);

  // 語音播報功能（使用 Web Speech API）
  const speak = useCallback((text: string, pitch: number = 1.0, rate: number = 1.0) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    // 停止之前的語音
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 嘗試使用英文語音（對於英文術語）
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 0.8;

    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // 專業哨音：單短哨（用於得分）
  const playWhistleShort = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // 創建更響亮、更尖銳的哨音
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 哨音特性：高頻率、快速衰減
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(2800, now);
    oscillator.frequency.exponentialRampToValueAtTime(3200, now + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(2600, now + 0.1);

    // 濾波器增強哨音特性
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.Q.setValueAtTime(10, now);

    // 音量包絡
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, [isMuted, initAudioContext]);

  // 專業哨音：雙哨（用於換發球）
  const playWhistleDouble = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // 第一聲哨音
    const createWhistle = (startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2800, startTime);
      osc.frequency.exponentialRampToValueAtTime(3200, startTime + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3000, startTime);
      filter.Q.setValueAtTime(10, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    };

    createWhistle(now);
    createWhistle(now + 0.15);
  }, [isMuted, initAudioContext]);

  // 專業哨音：長哨（用於開始/結束）
  const playWhistleLong = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(2600, now);
    oscillator.frequency.linearRampToValueAtTime(2900, now + 0.3);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.Q.setValueAtTime(8, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
    gainNode.gain.setValueAtTime(0.5, now + 0.35);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }, [isMuted, initAudioContext]);

  // 勝利音效
  const playVictorySound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // 勝利和弦進行
    const notes = [
      { freq: 523.25, time: 0, duration: 0.2 },      // C5
      { freq: 659.25, time: 0.15, duration: 0.2 },   // E5
      { freq: 783.99, time: 0.3, duration: 0.3 },    // G5
      { freq: 1046.50, time: 0.5, duration: 0.4 },   // C6
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.3, now + note.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.duration);
    });
  }, [isMuted, initAudioContext]);

  // ===================
  // 組合音效與語音
  // ===================

  // 得分音效
  const playScoreSound = useCallback(() => {
    playWhistleShort();
  }, [playWhistleShort]);

  // 換發球音效
  const playSwitchServeSound = useCallback(() => {
    playWhistleDouble();
    setTimeout(() => speak("Switch serve", 1.0, 1.1), 300);
  }, [playWhistleDouble, speak]);

  // 開始比賽音效
  const playGameStartSound = useCallback(() => {
    playWhistleLong();
    setTimeout(() => speak("Let's play!", 1.1, 1.0), 600);
  }, [playWhistleLong, speak]);

  // Game Point 提示
  const playGamePointSound = useCallback(() => {
    playWhistleShort();
    setTimeout(() => speak("Game point!", 1.2, 0.95), 200);
  }, [playWhistleShort, speak]);

  // Deuce 提示（打平時）
  const playDeuceSound = useCallback(() => {
    playWhistleShort();
    setTimeout(() => speak("Deuce!", 1.0, 1.0), 200);
  }, [playWhistleShort, speak]);

  // 獲勝音效
  const playWinSound = useCallback(() => {
    playWhistleLong();
    playVictorySound();
    setTimeout(() => speak("Game!", 1.2, 0.9), 600);
  }, [playWhistleLong, playVictorySound, speak]);

  // 扣分音效
  const playSubtractSound = useCallback(() => {
    if (isMuted) return;
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, [isMuted, initAudioContext]);

  // 切換靜音
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    playScoreSound,
    playSwitchServeSound,
    playGameStartSound,
    playGamePointSound,
    playDeuceSound,
    playWinSound,
    playSubtractSound,
    toggleMute,
    isMuted,
    initAudioContext, // 暴露給組件在用戶第一次互動時調用
  };
};
