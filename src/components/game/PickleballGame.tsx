import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { GameEngine, type GameEvent, type HudState } from './engine/game';
import { createAI } from './engine/ai';
import { PADDLES, SPECIALS } from './engine/paddles';
import { SKILLS } from './engine/skills';
import type { CutInInfo } from './CutIn';
import { GameScene } from './GameScene';
import { GameHud, type PointCard, type Toast } from './GameHud';
import { ComicTitle, TitleSplash } from './ComicTitle';
import { GameOverScreen, MenuScreen, PauseScreen, type Records, type Settings } from './GameScreens';
import { PaddleSelect } from './PaddleSelect';
import { CharacterSelect } from './CharacterSelect';
import { CHARACTERS, type CharacterDef, characterById, pickOpponent } from './characters';
import { TouchControls } from './TouchControls';
import { useGameInput } from './useGameInput';
import { GameAudio } from './audio';
import { ChallengeIntro } from './ShareCard';
import { type Challenge, decodeChallenge, emptyHighlights, trackHit } from './share';

const RECORDS_KEY = 'pm-game-records';
const SETTINGS_KEY = 'pm-game-settings';

const emptyRecords = (): Records => ({
  wins: { rookie: 0, club: 0, pro: 0 },
  plays: { rookie: 0, club: 0, pro: 0 },
  dinkBest: { rookie: 0, club: 0, pro: 0 },
  comboBest: { rookie: 0, club: 0, pro: 0 },
});

/** 讀寫 localStorage 都包 try/catch：無痕模式或封鎖儲存時遊戲照樣能玩 */
const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
};
const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 存不了就算了 */
  }
};

/** 示範賽：隨機兩位照片角色 */
const demoCharacters = (): [CharacterDef, CharacterDef] => {
  const a = pickOpponent('default');
  return [a, pickOpponent(a.id)];
};

/** 主選單背後播放的 AI 對打示範（熱血模式，會看到必殺技與角色絕招） */
const createDemo = (chars: [CharacterDef, CharacterDef]) => {
  const ids = PADDLES.map((p) => p.id);
  const a = ids[Math.floor(Math.random() * ids.length)];
  const e = new GameEngine({ mode: 'match', difficulty: 'pro', assist: false, specials: true, paddles: [a] });
  e.athletes[0].ai = createAI('pro');
  e.setSkills([chars[0].skill, chars[1].skill]);
  return e;
};

/** 示範賽的角色與引擎一起建立（引擎要知道雙方的絕招） */
const newDemo = () => {
  const chars = demoCharacters();
  return { chars, engine: createDemo(chars) };
};

/** 絕招音效借用必殺技的音色 */
const SKILL_SOUND = { squatSmash: 'inferno', spinSmash: 'thunder', splash: 'frost', dualCurve: 'phantom' } as const;

/** 手機震動回饋（不支援的瀏覽器直接略過） */
const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* 不支援就算了 */
  }
};

/** 手機或核心數少的裝置：減少粒子、關掉色差與 MSAA */
const detectLowSpec = () => {
  try {
    return window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
  } catch {
    return false;
  }
};

type Screen = 'menu' | 'character' | 'paddle' | 'play' | 'over';

const PickleballGame = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  // 開場標題：每次進遊戲頁播一次
  const [splash, setSplash] = useState(true);
  const endSplash = useCallback(() => setSplash(false), []);
  const [settings, setSettings] = useState<Settings>(() =>
    load<Settings>(SETTINGS_KEY, {
      mode: 'match',
      difficulty: 'rookie',
      assist: true,
      controls: 'auto',
      specials: true,
      paddle: PADDLES[0].id,
      character: CHARACTERS[1]?.id ?? 'default',
      venue: 'arena',
    }),
  );
  const [records, setRecords] = useState<Records>(() => load<Records>(RECORDS_KEY, emptyRecords()));
  const [initialDemo] = useState(newDemo);
  const [engine, setEngine] = useState<GameEngine>(initialDemo.engine);
  const [characters, setCharacters] = useState<[CharacterDef, CharacterDef]>(initialDemo.chars);
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState<HudState>(() => engine.hud());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [aiToast, setAiToast] = useState<Toast | null>(null);
  const [banner, setBanner] = useState<{ id: number; text: string } | null>(null);
  const [card, setCard] = useState<PointCard | null>(null);
  const [cutIn, setCutIn] = useState<CutInInfo | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [muted, setMuted] = useState(false);
  const [touch, setTouch] = useState(false);
  // 畫質等級開場就定好，不在比賽中切換（切換會重建後處理、重編著色器，反而當場卡一下）；
  // 掉幀時 PerformanceMonitor 只往下調解析度
  const [lowSpec] = useState(detectLowSpec);
  const maxDpr = lowSpec ? 1.25 : 1.5;
  const [dpr, setDpr] = useState(maxDpr);
  // 沉浸模式：開打後舞台蓋滿整個視窗（能全螢幕就全螢幕；iPhone 不支援元素全螢幕，就靠鋪滿視窗）
  const [immersive, setImmersive] = useState(false);
  const [rotateHint, setRotateHint] = useState(false);
  const audio = useMemo(() => new GameAudio(), []);
  const stage = useRef<HTMLDivElement>(null);
  const ids = useRef(0);
  const timers = useRef<number[]>([]);
  // 挑戰連結（?vs=）與本場亮點數據，給分享卡用
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [intro, setIntro] = useState(false);
  const highlights = useRef(emptyHighlights());

  const playing = screen === 'play';
  const togglePause = useCallback(() => setPaused((p) => (screen === 'play' ? !p : p)), [screen]);
  const { read, touch: touchRef } = useGameInput(playing && !paused, togglePause);

  useEffect(() => {
    const pending = timers.current;
    setMuted(audio.muted);
    const mq = window.matchMedia('(pointer: coarse)');
    setTouch(mq.matches);
    const on = (e: MediaQueryListEvent) => setTouch(e.matches);
    mq.addEventListener('change', on);
    return () => {
      mq.removeEventListener('change', on);
      audio.dispose();
      pending.forEach(clearTimeout);
    };
  }, [audio]);

  // 從挑戰連結進來：先秀挑戰卡，並把遊戲舞台捲進畫面
  useEffect(() => {
    const c = decodeChallenge(new URLSearchParams(window.location.search).get('vs'));
    if (!c) return;
    setChallenge(c);
    setIntro(true);
    stage.current?.scrollIntoView({ block: 'center' });
  }, []);

  // DEV 模式下暴露引擎給瀏覽器測試用（同 __courtMap 的做法）
  useEffect(() => {
    if (import.meta.env.DEV) (window as unknown as { __pmGame?: GameEngine }).__pmGame = engine;
  }, [engine]);

  // HUD 不需要每幀重繪：約 15 Hz 讀一次引擎狀態，有變才更新
  useEffect(() => {
    let last = '';
    const t = window.setInterval(() => {
      const h = engine.hud();
      const key = JSON.stringify(h);
      if (key !== last) {
        last = key;
        setHud(h);
      }
    }, 66);
    return () => clearInterval(t);
  }, [engine]);

  // 電視輔助判決：詢問時按 C 申請、Enter 接受
  const offering = hud.review?.state === 'offer' && hud.review.mine && hud.review.left > 0;
  useEffect(() => {
    if (!offering || paused) return;
    const down = (e: KeyboardEvent) => {
      if (e.code === 'KeyC') engine.requestReview();
      else if (e.code === 'Enter' || e.code === 'NumpadEnter') engine.declineReview();
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [offering, paused, engine]);

  // 分頁切到背景時自動暫停
  useEffect(() => {
    const vis = () => document.hidden && screen === 'play' && setPaused(true);
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, [screen]);

  // 沉浸模式時鎖住頁面捲動，免得手機上滑動搖桿時整頁跟著跑
  useEffect(() => {
    if (!immersive) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [immersive]);

  // 開打時才鎖橫向（選單、選角在直向比較好點）；鎖方向只在全螢幕中有效，iPhone 不支援就算了
  const lockLandscape = () =>
    void (window.screen.orientation as unknown as { lock?: (o: string) => Promise<void> } | undefined)?.lock?.('landscape')?.catch(() => {});

  const enterImmersive = (landscape = false) => {
    setImmersive(true);
    const el = stage.current;
    if (el && !document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen({ navigationUI: 'hide' })
        .then(() => landscape && lockLandscape())
        .catch(() => {});
    } else if (landscape && document.fullscreenElement) lockLandscape();
  };

  const exitImmersive = () => {
    setImmersive(false);
    setRotateHint(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  };

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const finish = useCallback(
    (eng: GameEngine) => {
      const d = settings.difficulty;
      const next = structuredClone(records);
      let record = false;
      if (eng.mode === 'dink') {
        if (eng.dinkStreak > next.dinkBest[d]) {
          next.dinkBest[d] = eng.dinkStreak;
          record = eng.dinkStreak > 0;
        }
      } else {
        next.plays[d] += 1;
        if (eng.match.winner === 0) next.wins[d] += 1;
        const prev = next.comboBest?.[d] ?? 0;
        record = eng.longestRally > prev && eng.longestRally >= 5;
        next.comboBest = { ...emptyRecords().comboBest, ...next.comboBest, [d]: Math.max(prev, eng.longestRally) };
      }
      setRecords(next);
      save(RECORDS_KEY, next);
      setNewRecord(record);
      audio.ambience(false);
      const won = eng.mode === 'dink' ? record : eng.match.winner === 0;
      audio.win(won);
      audio.say(won ? 'win' : 'lose', { priority: true, cooldown: 0, delay: 0.5 });
      setScreen('over');
    },
    [records, settings.difficulty, audio],
  );

  const onEvents = useCallback(
    (events: GameEvent[]) => {
      if (screen !== 'play') {
        // 示範對打不出聲、不顯示；打完一場就換一場新的
        if (screen === 'menu' && events.some((e) => e.type === 'gameOver')) {
          const d = newDemo();
          setEngine(d.engine);
          setCharacters(d.chars);
        }
        return;
      }
      for (const e of events) {
        switch (e.type) {
          case 'swing':
            if (e.team === 0) audio.swing(e.button === 'drive');
            break;
          case 'hit': {
            trackHit(highlights.current, e);
            const perfect = e.team === 0 && e.quality !== null && e.quality >= 0.9;
            const attack = e.team === 0 && !e.special && !e.skill && (e.kind === 'smash' || e.kind === 'punch' || e.kind === 'speedup');
            audio.hit(e.speed, perfect);
            if (attack) audio.attack(e.kind === 'smash');
            // 自己打出大力球（殺球、截擊、突擊、重抽）時喊「硬啦！」或「幹！」，輕打的 dink 不喊
            // 喊聲還在冷卻時，殺球／截擊改由球評講
            const shouted = e.team === 0 && !e.special && (attack || e.speed > 17) && audio.say('hard', { priority: true, cooldown: 2.5 });
            if (attack && !shouted) audio.say(e.kind === 'smash' ? 'smash' : 'block', { cooldown: 3 });
            if (e.team === 0) buzz(e.special ? [30, 40, 60] : attack ? [20, 30, 45] : perfect ? 25 : 12);
            if (perfect && e.streak >= 2) {
              audio.streak(e.streak);
              audio.say(e.streak >= 4 ? 'great' : 'nice', { cooldown: 6 });
            }
            const kmh = `${Math.round(e.speed * 3.6)} km/h`;
            if (e.team === 0) {
              const tone: Toast['tone'] = e.special || e.skill
                ? 'special'
                : e.quality === null
                  ? 'plain'
                  : e.quality >= 0.9
                    ? 'perfect'
                    : e.quality >= 0.65
                      ? 'good'
                      : 'off';
              const t: Toast = { id: ++ids.current, text: e.label, sub: kmh, tone, streak: perfect ? e.streak : 0, kind: attack ? e.kind : undefined, dive: e.dive };
              setToasts([t]);
              later(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 900);
            } else {
              const t: Toast = { id: ++ids.current, text: `對手 ${e.label}`, sub: kmh, tone: 'plain' };
              setAiToast(t);
              later(() => setAiToast((x) => (x?.id === t.id ? null : x)), 1100);
            }
            break;
          }
          case 'special': {
            audio.special(e.id);
            audio.say(e.id, { priority: true, cooldown: 0 });
            const who = characters[e.team];
            const c = { id: ++ids.current, spec: engine.athletes[e.team].paddle, mine: e.team === 0, portrait: who.portrait, name: who.name };
            setCutIn(c);
            later(() => setCutIn((x) => (x?.id === c.id ? null : x)), 1150);
            break;
          }
          case 'skill': {
            audio.special(SKILL_SOUND[e.id]);
            audio.say('wow', { priority: true, cooldown: 2 });
            if (e.team === 0) buzz([20, 30, 50]);
            const who = characters[e.team];
            const c = { id: ++ids.current, spec: engine.athletes[e.team].paddle, skill: e.id, mine: e.team === 0, portrait: who.portrait, name: who.name };
            setCutIn(c);
            later(() => setCutIn((x) => (x?.id === c.id ? null : x)), 900);
            break;
          }
          case 'counter':
            if (e.team === 0) buzz(40);
            audio.counter();
            audio.cheer(true);
            audio.say('wow', { priority: true, cooldown: 2 });
            break;
          case 'blown': {
            const t: Toast = { id: ++ids.current, text: e.team === 0 ? '拍子被震飛！' : '對手被震飛！', tone: 'off' };
            if (e.team === 0) setToasts([t]);
            else setAiToast(t);
            later(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 1000);
            break;
          }
          case 'energyFull':
            if (e.team === 0) audio.energyFull();
            break;
          case 'awakenReady':
            if (e.team === 0) {
              audio.energyFull();
              const b = { id: ++ids.current, text: touch ? '覺醒量表集滿！點「覺醒」逆轉' : '覺醒量表集滿！按 Q 逆轉' };
              setBanner(b);
              later(() => setBanner((x) => (x?.id === b.id ? null : x)), 1800);
            }
            break;
          case 'awaken': {
            audio.awaken();
            audio.cheer(true);
            audio.say('awaken', { priority: true, cooldown: 0 });
            if (e.team === 0) buzz([40, 30, 40, 30, 80]);
            const who = characters[e.team];
            const c = { id: ++ids.current, spec: engine.athletes[e.team].paddle, awaken: true, mine: e.team === 0, portrait: who.portrait, name: who.name };
            setCutIn(c);
            later(() => setCutIn((x) => (x?.id === c.id ? null : x)), 1100);
            break;
          }
          case 'comboMilestone':
            audio.cheer(true);
            audio.milestone(e.n);
            audio.say('unstoppable', { cooldown: 8 });
            buzz(20);
            break;
          case 'dive':
            audio.whoosh();
            if (e.team === 0) buzz(15);
            break;
          case 'diveLand':
            audio.bounce(6);
            if (e.team === 0) buzz([10, 20, 30]);
            break;
          case 'whiff':
            audio.whoosh();
            if (e.team === 0) {
              audio.say('oops', { cooldown: 5 });
              const t: Toast = { id: ++ids.current, text: '揮空了', tone: 'off' };
              setToasts([t]);
              later(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 700);
            }
            break;
          case 'bounce':
            if (e.special) audio.specialImpact(e.special);
            else audio.bounce(e.speed);
            break;
          case 'net':
            audio.net();
            break;
          case 'cord':
            audio.cord();
            audio.say('lucky');
            break;
          case 'chance':
            audio.chance();
            buzz(10);
            break;
          case 'highlight': {
            audio.highlight();
            const b = { id: ++ids.current, text: e.text };
            setBanner(b);
            later(() => setBanner((x) => (x?.id === b.id ? null : x)), 1400);
            break;
          }
          case 'point': {
            const won = e.winner === 0;
            audio.point(won);
            if (e.faultTeam === null) audio.cheer(e.rallyHits > 8);
            // 球評：出界、掛網直接講；長來回贏球大讚；自己失誤就打氣
            if (e.reason === 'out') audio.say('out', { delay: 0.15 });
            else if (e.reason === 'net') audio.say('net', { delay: 0.15 });
            else if (won && e.rallyHits > 8) audio.say('great', { delay: 0.15 });
            else if (won) audio.say('nice', { delay: 0.15, cooldown: 6 });
            else if (e.faultTeam === 0) audio.say('again', { delay: 0.3, cooldown: 10 });
            const dink = engine.mode === 'dink';
            const headline = dink
              ? won
                ? '對手失誤，繼續'
                : '挑戰結束'
              : won
                ? '你得分'
                : e.sideOut
                  ? '換對手發球'
                  : '對手得分';
            const c: PointCard = {
              id: ++ids.current,
              won,
              title: e.title,
              // 只有自己失誤時才講規則；對手失誤時簡短帶過
              lesson: e.faultTeam === 0 || (e.reason === 'notInKitchen' && !won) ? e.lesson : null,
              headline: !dink && won && e.sideOut ? '換你發球' : headline,
              call: dink ? '' : e.call,
            };
            setCard(c);
            later(() => setCard((x) => (x?.id === c.id ? null : x)), 1900);
            break;
          }
          case 'closeCall':
            audio.whoosh();
            break;
          case 'reviewStart':
            audio.highlight();
            audio.say('review', { priority: true, cooldown: 0 });
            break;
          case 'reviewVerdict':
            if (e.overturned) {
              audio.counter();
              audio.say('overturned', { priority: true, cooldown: 0 });
            }
            audio.cheer(e.overturned);
            break;
          case 'gameOver':
            finish(engine);
            break;
          default:
        }
      }
    },
    [screen, audio, engine, finish, characters, touch],
  );

  const start = (s: Settings = settings) => {
    audio.unlock();
    audio.ambience(true);
    audio.say('start', { priority: true, cooldown: 0, delay: 0.8 });
    save(SETTINGS_KEY, s);
    const e = new GameEngine({
      mode: s.mode,
      difficulty: s.difficulty,
      assist: s.assist,
      controls: s.controls ?? 'auto',
      specials: s.specials,
      paddles: [s.paddle],
    });
    const mine = characterById(s.character);
    const opp = pickOpponent(mine.id);
    e.setSkills([mine.skill, opp.skill]);
    highlights.current = emptyHighlights();
    setEngine(e);
    setCharacters([mine, opp]);
    setHud(e.hud());
    setToasts([]);
    setCard(null);
    setBanner(null);
    setCutIn(null);
    setPaused(false);
    setScreen('play');
    stage.current?.focus({ preventScroll: true });
    enterImmersive(true);
    // 手機直拿時提示可以轉橫向（直向也能玩，只是畫面比較窄）
    if (window.matchMedia('(pointer: coarse) and (orientation: portrait)').matches) {
      setRotateHint(true);
      later(() => setRotateHint(false), 3500);
    }
  };

  const toMenu = () => {
    audio.ambience(false);
    const d = newDemo();
    setEngine(d.engine);
    setCharacters(d.chars);
    setPaused(false);
    setCard(null);
    setCutIn(null);
    setScreen('menu');
    exitImmersive();
  };

  // 手機在頁面裡只放封面＋大按鈕，點了才全螢幕進選單：小框框裡捲選單、按小按鈕太難用
  // 從挑戰連結進來時改由挑戰卡當封面（接受挑戰就直接全螢幕開打）
  const cover = touch && !immersive && screen !== 'play' && screen !== 'over' && !(intro && challenge);
  const best = records.dinkBest[settings.difficulty];
  const mySpecial = SPECIALS[engine.human.paddle.special];

  return (
    <div
      ref={stage}
      tabIndex={-1}
      className={`overflow-hidden bg-slate-950 outline-none ${
        immersive
          ? 'fixed inset-0 z-[200] h-[100dvh] w-screen'
          : 'relative w-full rounded-3xl shadow-2xl shadow-emerald-900/20 ring-1 ring-black/5 aspect-[16/10] md:max-h-[calc(100svh-6.5rem)] max-md:aspect-[4/5]'
      }`}
      onPointerDown={() => audio.unlock()}
    >
      <Canvas
        shadows
        dpr={dpr}
        camera={{ fov: 46, position: [0, 5.2, 11], near: 0.1, far: 160 }}
        className="touch-none"
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(lowSpec ? 0.75 : 1, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
          flipflops={3}
        />
        <GameScene engine={engine} characters={characters} readInput={read} paused={paused || screen === 'over'} onEvents={onEvents} lowSpec={lowSpec} venue={settings.venue ?? 'arena'} />
      </Canvas>

      {playing && (
        <>
          <GameHud
            hud={hud}
            difficulty={settings.difficulty}
            best={best}
            toasts={toasts}
            aiToast={aiToast}
            banner={banner}
            card={card}
            cutIn={cutIn}
            touch={touch}
            oppName={characters[1].name}
            onChallenge={() => engine.requestReview()}
            onAccept={() => engine.declineReview()}
          />
          {touch && !paused && (
            <TouchControls
              touch={touchRef}
              chance={hud.phase === 'rally' ? hud.chance : null}
              dive={{ hint: hud.dive, busy: hud.diving }}
              special={hud.specials ? { ready: hud.energy[0] >= 100, armed: hud.armed, color: mySpecial.color, name: mySpecial.name, energy: hud.energy[0] } : null}
              skill={
                hud.specials && hud.skill
                  ? { ready: hud.skillReady, armed: hud.skillArmed, color: SKILLS[hud.skill].color, name: SKILLS[hud.skill].name }
                  : null
              }
              awaken={
                hud.awaken && !hud.awaken.used && hud.awaken.gauge > 0
                  ? { ready: hud.awaken.gauge >= 100, armed: false, color: '#f59e0b', name: '無雙覺醒', energy: hud.awaken.gauge }
                  : null
              }
            />
          )}
          {rotateHint && (
            <div className="pointer-events-none absolute inset-x-0 top-1/3 z-20 flex justify-center">
              <div className="rounded-2xl bg-slate-950/70 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur-md">
                <div className="mb-1 text-2xl">📱↻</div>
                轉成橫向，畫面更大更好打
              </div>
            </div>
          )}
          <div className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 flex gap-2 max-md:portrait:flex-col">
            <button
              type="button"
              onClick={() => {
                audio.setMuted(!muted);
                setMuted(!muted);
              }}
              className="rounded-xl bg-slate-950/60 px-2.5 py-2 text-sm text-white backdrop-blur-md hover:bg-slate-950/80"
              aria-label={muted ? '開啟音效' : '關閉音效'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button
              type="button"
              onClick={() => (immersive ? exitImmersive() : enterImmersive(true))}
              className="rounded-xl bg-slate-950/60 px-2.5 py-2 text-sm text-white backdrop-blur-md hover:bg-slate-950/80"
              aria-label={immersive ? '離開全螢幕' : '全螢幕'}
            >
              {immersive ? '✕' : '⛶'}
            </button>
            <button
              type="button"
              onClick={togglePause}
              className="rounded-xl bg-slate-950/60 px-3 py-2 text-sm font-bold text-white backdrop-blur-md hover:bg-slate-950/80"
              aria-label="暫停"
            >
              ❚❚
            </button>
          </div>
        </>
      )}

      {immersive && !playing && (
        <button
          type="button"
          onClick={exitImmersive}
          className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
          aria-label="離開全螢幕"
        >
          ✕
        </button>
      )}

      {cover && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-end bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent p-6 pb-8 text-center">
          <ComicTitle className="text-5xl" />
          <p className="mt-3 text-sm text-white/75">左手搖桿跑位、右手按鍵擊球，集滿能量放必殺</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              audio.unlock();
              enterImmersive();
            }}
            className="mt-5 w-full max-w-xs rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-4 text-xl font-black text-emerald-950 shadow-xl shadow-emerald-500/30"
          >
            ▶ 全螢幕開打
          </motion.button>
          <p className="mt-2.5 text-xs text-white/50">開打後橫拿手機，畫面更大更好打</p>
        </div>
      )}

      <AnimatePresence>{splash && <TitleSplash key="splash" onDone={endSplash} />}</AnimatePresence>
      <AnimatePresence>
        {screen === 'menu' && intro && challenge && (
          <ChallengeIntro
            key="challenge"
            challenge={challenge}
            onAccept={() => {
              const s: Settings = { ...settings, mode: 'match', specials: true, difficulty: challenge.difficulty, character: challenge.character, paddle: challenge.paddle };
              setSettings(s);
              setIntro(false);
              start(s);
            }}
            onSkip={() => setIntro(false)}
          />
        )}
        {screen === 'menu' && !intro && !cover && (
          <MenuScreen
            key="menu"
            settings={settings}
            records={records}
            touch={touch}
            onChange={setSettings}
            onNext={() => {
              audio.unlock();
              setScreen('character');
            }}
          />
        )}
        {screen === 'character' && !cover && (
          <CharacterSelect
            key="character"
            value={settings.character}
            onChange={(id) => setSettings({ ...settings, character: id })}
            onBack={() => setScreen('menu')}
            onNext={() => setScreen('paddle')}
          />
        )}
        {screen === 'paddle' && !cover && (
          <PaddleSelect
            key="paddle"
            value={settings.paddle}
            specials={settings.specials}
            onChange={(id) => setSettings({ ...settings, paddle: id })}
            onBack={() => setScreen('character')}
            onStart={() => start()}
          />
        )}
        {playing && paused && (
          <PauseScreen key="pause" touch={touch} controls={engine.controls} onResume={() => setPaused(false)} onRestart={() => start()} onMenu={toMenu} />
        )}
        {screen === 'over' && (
          <GameOverScreen
            key="over"
            mode={engine.mode}
            won={engine.match.winner === 0}
            score={[engine.match.score[0], engine.match.score[1]]}
            dinkStreak={engine.dinkStreak}
            newRecord={newRecord}
            stats={engine.stats}
            longestRally={engine.longestRally}
            comboBest={records.comboBest?.[settings.difficulty] ?? 0}
            difficulty={settings.difficulty}
            result={
              engine.mode === 'match'
                ? {
                    won: engine.match.winner === 0,
                    score: [engine.match.score[0], engine.match.score[1]],
                    difficulty: settings.difficulty,
                    stats: engine.stats[0],
                    longestRally: engine.longestRally,
                    highlights: highlights.current,
                    character: characters[0],
                    paddle: settings.paddle,
                  }
                : null
            }
            challenge={engine.mode === 'match' && challenge?.difficulty === settings.difficulty ? challenge : null}
            onAgain={() => start()}
            onMenu={toMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PickleballGame;
