import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';
import { GameEngine, type GameEvent, type HudState } from './engine/game';
import { createAI } from './engine/ai';
import { PADDLES, SPECIALS, type PaddleSpec } from './engine/paddles';
import { GameScene } from './GameScene';
import { GameHud, type PointCard, type Toast } from './GameHud';
import { GameOverScreen, MenuScreen, PauseScreen, type Records, type Settings } from './GameScreens';
import { PaddleSelect } from './PaddleSelect';
import { CharacterSelect } from './CharacterSelect';
import { CHARACTERS, type CharacterDef, characterById, pickOpponent } from './characters';
import { TouchControls } from './TouchControls';
import { useGameInput } from './useGameInput';
import { GameAudio } from './audio';

const RECORDS_KEY = 'pm-game-records';
const SETTINGS_KEY = 'pm-game-settings';

const emptyRecords = (): Records => ({
  wins: { rookie: 0, club: 0, pro: 0 },
  plays: { rookie: 0, club: 0, pro: 0 },
  dinkBest: { rookie: 0, club: 0, pro: 0 },
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

/** 主選單背後播放的 AI 對打示範（熱血模式，會看到必殺技） */
const createDemo = () => {
  const ids = PADDLES.map((p) => p.id);
  const a = ids[Math.floor(Math.random() * ids.length)];
  const e = new GameEngine({ mode: 'match', difficulty: 'pro', assist: false, specials: true, paddles: [a] });
  e.athletes[0].ai = createAI('pro');
  return e;
};

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
  const [settings, setSettings] = useState<Settings>(() =>
    load<Settings>(SETTINGS_KEY, {
      mode: 'match',
      difficulty: 'rookie',
      assist: true,
      specials: true,
      paddle: PADDLES[0].id,
      character: CHARACTERS[1]?.id ?? 'default',
    }),
  );
  const [records, setRecords] = useState<Records>(() => load<Records>(RECORDS_KEY, emptyRecords()));
  const [engine, setEngine] = useState<GameEngine>(createDemo);
  const [characters, setCharacters] = useState<[CharacterDef, CharacterDef]>(demoCharacters);
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState<HudState>(() => engine.hud());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [aiToast, setAiToast] = useState<Toast | null>(null);
  const [banner, setBanner] = useState<{ id: number; text: string } | null>(null);
  const [card, setCard] = useState<PointCard | null>(null);
  const [cutIn, setCutIn] = useState<{ id: number; spec: PaddleSpec; mine: boolean; portrait: string | null; name: string } | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [muted, setMuted] = useState(false);
  const [touch, setTouch] = useState(false);
  // 起始畫質依裝置判斷；PerformanceMonitor 發現掉幀會再往下調（解析度、MSAA、色差）
  const [lowSpec, setLowSpec] = useState(detectLowSpec);
  const [dpr, setDpr] = useState(() => (detectLowSpec() ? 1.25 : 1.75));
  const audio = useMemo(() => new GameAudio(), []);
  const stage = useRef<HTMLDivElement>(null);
  const ids = useRef(0);
  const timers = useRef<number[]>([]);

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

  // 分頁切到背景時自動暫停
  useEffect(() => {
    const vis = () => document.hidden && screen === 'play' && setPaused(true);
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, [screen]);

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
      }
      setRecords(next);
      save(RECORDS_KEY, next);
      setNewRecord(record);
      audio.ambience(false);
      audio.win(eng.mode === 'dink' ? record : eng.match.winner === 0);
      setScreen('over');
    },
    [records, settings.difficulty, audio],
  );

  const onEvents = useCallback(
    (events: GameEvent[]) => {
      if (screen !== 'play') {
        // 示範對打不出聲、不顯示；打完一場就換一場新的
        if (screen === 'menu' && events.some((e) => e.type === 'gameOver')) {
          setEngine(createDemo());
          setCharacters(demoCharacters());
        }
        return;
      }
      for (const e of events) {
        switch (e.type) {
          case 'swing':
            if (e.team === 0) audio.swing(e.button === 'drive');
            break;
          case 'hit': {
            const perfect = e.team === 0 && e.quality !== null && e.quality >= 0.9;
            audio.hit(e.speed, perfect);
            if (e.team === 0) buzz(e.special ? [30, 40, 60] : perfect ? 25 : 12);
            if (perfect && e.streak >= 2) audio.streak(e.streak);
            const kmh = `${Math.round(e.speed * 3.6)} km/h`;
            if (e.team === 0) {
              const tone: Toast['tone'] = e.special
                ? 'special'
                : e.quality === null
                  ? 'plain'
                  : e.quality >= 0.9
                    ? 'perfect'
                    : e.quality >= 0.65
                      ? 'good'
                      : 'off';
              const t: Toast = { id: ++ids.current, text: e.label, sub: kmh, tone, streak: perfect ? e.streak : 0 };
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
            const who = characters[e.team];
            const c = { id: ++ids.current, spec: engine.athletes[e.team].paddle, mine: e.team === 0, portrait: who.portrait, name: who.name };
            setCutIn(c);
            later(() => setCutIn((x) => (x?.id === c.id ? null : x)), 1150);
            break;
          }
          case 'counter':
            if (e.team === 0) buzz(40);
            audio.counter();
            audio.cheer(true);
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
          case 'whiff':
            audio.whoosh();
            if (e.team === 0) {
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
          case 'gameOver':
            finish(engine);
            break;
          default:
        }
      }
    },
    [screen, audio, engine, finish, characters],
  );

  const start = (s: Settings = settings) => {
    audio.unlock();
    audio.ambience(true);
    save(SETTINGS_KEY, s);
    const e = new GameEngine({
      mode: s.mode,
      difficulty: s.difficulty,
      assist: s.assist,
      specials: s.specials,
      paddles: [s.paddle],
    });
    setEngine(e);
    const mine = characterById(s.character);
    setCharacters([mine, pickOpponent(mine.id)]);
    setHud(e.hud());
    setToasts([]);
    setCard(null);
    setBanner(null);
    setCutIn(null);
    setPaused(false);
    setScreen('play');
    stage.current?.focus({ preventScroll: true });
    // 手機上舞台在標題下方，開打時捲到整個舞台都看得到
    stage.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const toMenu = () => {
    audio.ambience(false);
    setEngine(createDemo());
    setCharacters(demoCharacters());
    setPaused(false);
    setCard(null);
    setCutIn(null);
    setScreen('menu');
  };

  const toggleFullscreen = () => {
    const el = stage.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => {});
  };

  const best = records.dinkBest[settings.difficulty];
  const mySpecial = SPECIALS[engine.human.paddle.special];

  return (
    <div
      ref={stage}
      tabIndex={-1}
      className="relative w-full overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-emerald-900/20 outline-none ring-1 ring-black/5 aspect-[16/10] max-md:aspect-auto max-md:h-[calc(100svh-6rem)] max-md:min-h-[560px] [&:fullscreen]:rounded-none"
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
          onDecline={() => {
            setDpr((d) => Math.max(1, d - 0.25));
            setLowSpec(true);
          }}
          onIncline={() => setDpr((d) => Math.min(lowSpec ? 1.25 : 1.75, d + 0.25))}
          flipflops={3}
        />
        <GameScene engine={engine} characters={characters} readInput={read} paused={paused || screen === 'over'} onEvents={onEvents} lowSpec={lowSpec} />
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
          />
          {touch && !paused && (
            <TouchControls
              touch={touchRef}
              special={hud.specials ? { ready: hud.energy[0] >= 100, armed: hud.armed, color: mySpecial.color, name: mySpecial.name } : null}
            />
          )}
          <div className="absolute right-3 top-3 z-20 flex gap-2 max-md:flex-col">
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
              onClick={toggleFullscreen}
              className="rounded-xl bg-slate-950/60 px-2.5 py-2 text-sm text-white backdrop-blur-md hover:bg-slate-950/80"
              aria-label="全螢幕"
            >
              ⛶
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

      <AnimatePresence>
        {screen === 'menu' && (
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
        {screen === 'character' && (
          <CharacterSelect
            key="character"
            value={settings.character}
            onChange={(id) => setSettings({ ...settings, character: id })}
            onBack={() => setScreen('menu')}
            onNext={() => setScreen('paddle')}
          />
        )}
        {screen === 'paddle' && (
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
          <PauseScreen key="pause" touch={touch} onResume={() => setPaused(false)} onRestart={() => start()} onMenu={toMenu} />
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
            difficulty={settings.difficulty}
            onAgain={() => start()}
            onMenu={toMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PickleballGame;
