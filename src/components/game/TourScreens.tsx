import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { LevelId } from './engine/levels';
import { characterById } from './characters';
import { type LevelDef, type StageDef, type StoryPanel, type TourProgress, STAGES, levelUnlocked, stageStars } from './tour';
import type { MatchResult } from './share';
import { ShareActions } from './ShareCard';

/**
 * 踢館之旅的畫面：台灣地圖選站、漫畫格劇情、關卡結算。
 * 視覺沿用開場標題的漫畫風：黑粗框、錯位黑影、網點、斜斜的字。
 */

const FONT = "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif";

/** 漫畫字：黑描邊＋錯位黑影 */
const Inked = ({ children, className = '', stroke = 4 }: { children: React.ReactNode; className?: string; stroke?: number }) => (
  <span
    className={`font-black ${className}`}
    style={{ fontFamily: FONT, WebkitTextStroke: `${stroke}px #0b0b14`, paintOrder: 'stroke fill', textShadow: `${stroke * 0.6}px ${stroke * 0.8}px 0 #0b0b14` }}
  >
    {children}
  </span>
);

const Halftone = ({ color = '#0b0b14', opacity = 0.18, size = 8 }: { color?: string; opacity?: number; size?: number }) => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0"
    style={{ opacity, backgroundImage: `radial-gradient(${color} 1.2px, transparent 1.5px)`, backgroundSize: `${size}px ${size}px` }}
  />
);

export const Stars = ({ n, size = 'text-lg', dim = 'text-white/20' }: { n: number; size?: string; dim?: string }) => (
  <span className={`inline-flex gap-0.5 leading-none ${size}`} aria-label={`${n} 顆星`}>
    {[0, 1, 2].map((i) => (
      <span key={i} className={i < n ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]' : dim}>
        ★
      </span>
    ))}
  </span>
);

/** 台灣本島輪廓（依經緯度線性換算的簡化折線） */
const TAIWAN =
  'M139 8 L128 18 L112 22 L100 30 L92 40 L86 49 L74 64 L62 84 L53 98 L44 106 L36 115 L28 136 L21 166 L15 186 L12 204 L20 220 L31 237 L44 248 L58 258 L66 274 L68 289 L80 298 L86 286 L85 261 L95 244 L106 224 L118 196 L133 158 L146 121 L156 96 L166 69 L166 55 L172 44 L178 33 L168 28 L156 23 L148 14 Z';

const MapPin = ({ s, selected, stars, onClick }: { s: StageDef; selected: boolean; stars: number; onClick: () => void }) => (
  <g transform={`translate(${s.map.x} ${s.map.y})`} onClick={onClick} className="cursor-pointer" role="button" aria-label={`${s.name}${s.open ? '' : '（即將開放）'}`}>
    {selected && (
      <circle r="13" fill="none" stroke={s.open ? '#fde047' : '#94a3b8'} strokeWidth="2" opacity="0.9">
        <animate attributeName="r" values="9;15;9" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />
      </circle>
    )}
    <circle r="7.5" fill="#0b0b14" transform="translate(1.4 1.8)" />
    <circle r="7.5" fill={s.open ? (stars > 0 ? '#fbbf24' : '#fb7185') : '#475569'} stroke="#0b0b14" strokeWidth="2" />
    <text y="3.4" textAnchor="middle" fontSize="9" fontWeight="900" fill={s.open ? '#0b0b14' : '#cbd5e1'}>
      {s.open ? '!' : '?'}
    </text>
  </g>
);

interface TourMapProps {
  progress: TourProgress;
  onPlay: (id: LevelId) => void;
  onBack: () => void;
}

export const TourMap = ({ progress, onPlay, onBack }: TourMapProps) => {
  const [sel, setSel] = useState(STAGES[0].id);
  const stage = STAGES.find((s) => s.id === sel) ?? STAGES[0];
  const total = STAGES.reduce((n, s) => n + s.levels.length * 3, 0);
  const got = STAGES.reduce((n, s) => n + stageStars(progress, s), 0);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 overflow-y-auto overscroll-contain bg-gradient-to-br from-sky-800 via-cyan-900 to-slate-950"
    >
      <Halftone color="#e0f2fe" opacity={0.08} size={10} />
      <div className="relative mx-auto flex min-h-full w-full max-w-4xl flex-col p-3 md:p-5">
        {/* 右邊留位置給全螢幕的關閉鍵 */}
        <div className="flex items-center justify-between gap-2 pr-12">
          <button type="button" onClick={onBack} className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/20">
            ← 主選單
          </button>
          {/* 橫拿手機：畫面很矮，標題縮進這一列 */}
          <span className="hidden -rotate-2 text-xl text-amber-300 landscape:max-md:inline">
            <Inked stroke={3}>全台踢館之旅</Inked>
          </span>
          <span className="rounded-full border-2 border-slate-950 bg-amber-300 px-3 py-1 text-xs font-black text-slate-950 shadow-[3px_3px_0_#0b0b14]">
            ★ {got} / {total}
          </span>
        </div>
        <div className="mt-2 text-center md:mt-1 landscape:max-md:hidden">
          <div className="text-[10px] font-black tracking-[0.35em] text-cyan-200/80 md:text-xs">STORY MODE</div>
          <h2 className="-rotate-2 text-3xl leading-tight text-amber-300 md:text-5xl">
            <Inked stroke={5}>全台踢館之旅</Inked>
          </h2>
        </div>

        <div className="mt-3 grid flex-1 items-center gap-3 landscape:max-md:mt-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-6 landscape:max-md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          {/* 地圖 */}
          <div className="relative mx-auto aspect-[190/305] w-full max-w-[13rem] md:max-w-[17rem] landscape:max-md:max-w-[9.5rem]">
            <svg viewBox="-6 -6 202 317" className="h-full w-full overflow-visible" aria-label="台灣地圖">
              <defs>
                <linearGradient id="tw-land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#bef264" />
                  <stop offset="1" stopColor="#4ade80" />
                </linearGradient>
                <pattern id="tw-dots" width="6" height="6" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="0.9" fill="#14532d" opacity="0.35" />
                </pattern>
              </defs>
              <path d={TAIWAN} fill="#0b0b14" transform="translate(4 6)" />
              <path d={TAIWAN} fill="url(#tw-land)" stroke="#0b0b14" strokeWidth="3" strokeLinejoin="round" />
              <path d={TAIWAN} fill="url(#tw-dots)" />
              {/* 中央山脈 */}
              <path d="M128 40 Q120 110 98 190 Q90 222 82 250" stroke="#166534" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.35" />
              {/* 路線：照站別順序連起來 */}
              <polyline
                points={STAGES.map((s) => `${s.map.x},${s.map.y}`).join(' ')}
                fill="none"
                stroke="#0b0b14"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.55"
              />
              {STAGES.map((s) => (
                <MapPin key={s.id} s={s} selected={s.id === sel} stars={stageStars(progress, s)} onClick={() => setSel(s.id)} />
              ))}
              {/* 颱風：在東北外海轉 */}
              <g transform="translate(184 92)" opacity="0.85">
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur="6s" repeatCount="indefinite" />
                  <path d="M0 -14 Q10 -12 9 0 M0 14 Q-10 12 -9 0 M14 0 Q12 10 0 9 M-14 0 Q-12 -10 0 -9" stroke="#e0f2fe" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
                <circle r="3" fill="#e0f2fe" />
              </g>
            </svg>
          </div>

          {/* 站別面板 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: 24, rotate: 1.5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative overflow-hidden rounded-2xl border-[3px] border-slate-950 bg-gradient-to-br from-amber-50 to-orange-100 p-3 text-slate-950 shadow-[6px_6px_0_#0b0b14] md:p-4"
            >
              <Halftone color="#c2410c" opacity={0.12} size={7} />
              <StagePanel stage={stage} progress={progress} onPlay={onPlay} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const StagePanel = ({ stage, progress, onPlay }: { stage: StageDef; progress: TourProgress; onPlay: (id: LevelId) => void }) => {
  const boss = characterById(stage.bossChar);
  if (!stage.open) {
    return (
      <div className="relative flex items-center gap-3 py-2">
        <div className="relative h-24 w-20 shrink-0 md:h-32 md:w-28">
          {boss.portrait ? (
            <img src={boss.portrait} alt="" className="h-full w-full object-contain object-bottom brightness-0 opacity-70" draggable={false} />
          ) : (
            <div className="flex h-full items-end justify-center text-6xl font-black text-slate-950/70">?</div>
          )}
        </div>
        <div>
          <div className="text-xs font-black tracking-widest text-amber-900/70">{stage.place}</div>
          <div className="text-2xl font-black md:text-3xl">{stage.name}</div>
          <div className="mt-1 text-sm font-bold text-amber-950/80">站主：{stage.boss}</div>
          <div className="mt-2 inline-block -rotate-2 rounded-md border-2 border-slate-950 bg-slate-950 px-2.5 py-1 text-sm font-black text-amber-300">
            即將開放
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-black tracking-widest text-orange-700">第 1 站・{stage.place}</div>
          <div className="text-2xl font-black leading-tight md:text-3xl landscape:max-md:text-xl">{stage.name}</div>
          <div className="mt-0.5 text-xs font-bold text-amber-950/75 md:text-sm">
            站主：<b className="text-slate-950">{stage.boss}</b>・★ {stageStars(progress, stage)} / {stage.levels.length * 3}
          </div>
        </div>
        {boss.portrait && (
          <img
            src={boss.portrait}
            alt={stage.boss}
            draggable={false}
            className="-mb-1 h-16 w-14 shrink-0 object-contain object-bottom md:h-24 md:w-20"
            style={PORTRAIT_MASK}
          />
        )}
      </div>
      <div className="mt-2 grid gap-2 landscape:max-md:mt-1.5 landscape:max-md:gap-1.5">
        {stage.levels.map((l, i) => (
          <LevelCard key={l.id} n={i + 1} def={l} stars={progress.stars[l.id] ?? 0} locked={!levelUnlocked(progress, stage, i)} onPlay={() => onPlay(l.id)} />
        ))}
      </div>
    </div>
  );
};

const LevelCard = ({ n, def, stars, locked, onPlay }: { n: number; def: LevelDef; stars: number; locked: boolean; onPlay: () => void }) => {
  const boss = def.kind === 'boss';
  const fresh = !locked && stars === 0;
  return (
    <motion.button
      type="button"
      disabled={locked}
      onClick={onPlay}
      whileHover={locked ? undefined : { y: -2, rotate: -0.5 }}
      whileTap={locked ? undefined : { scale: 0.98 }}
      className={`relative flex w-full items-center gap-2.5 rounded-xl border-[2.5px] border-slate-950 px-2.5 py-2 text-left landscape:max-md:py-1 transition-colors md:gap-3 md:px-3 md:py-2.5 ${
        locked
          ? 'cursor-not-allowed bg-slate-300/70 text-slate-500'
          : boss
            ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-[3px_3px_0_#0b0b14]'
            : 'bg-white shadow-[3px_3px_0_#0b0b14] hover:bg-amber-50'
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-slate-950 text-sm font-black md:h-9 md:w-9 ${
          boss ? 'bg-rose-500 text-white' : 'bg-amber-300 text-slate-950'
        }`}
      >
        {locked ? '🔒' : boss ? '👊' : n}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-black md:text-base">{def.name}</span>
          {fresh && <span className="shrink-0 rounded bg-rose-500 px-1.5 text-[10px] font-black text-white">必修</span>}
        </span>
        <span className={`block truncate text-[11px] font-semibold md:text-xs ${boss ? 'text-white/65' : 'text-amber-950/60'}`}>
          {locked ? '先通過前一關' : `教你：${def.teaches}`}
        </span>
      </span>
      <Stars n={stars} size="text-base md:text-lg" dim={boss ? 'text-white/20' : 'text-slate-300'} />
    </motion.button>
  );
};

// ───────────────────────────── 劇情漫畫格 ─────────────────────────────

const SCENE_BG: Record<StoryPanel['scene'], string> = {
  storm: 'linear-gradient(180deg,#0f172a 0%,#1e3a5f 55%,#334155 100%)',
  stall: 'linear-gradient(180deg,#7c2d12 0%,#ea580c 55%,#fbbf24 100%)',
  beach: 'linear-gradient(180deg,#334155 0%,#0e7490 60%,#d6c7a1 100%)',
  ko: 'linear-gradient(180deg,#facc15 0%,#f97316 100%)',
  court: 'linear-gradient(180deg,#0b1a3a 0%,#1d4ed8 55%,#15803d 100%)',
};

/** 去背照片轉正後的斜邊用橢圓淡出藏起來（和挑戰卡同一招） */
const PORTRAIT_MASK = {
  WebkitMaskImage: 'radial-gradient(ellipse 72% 80% at 50% 40%, #000 60%, transparent 100%)',
  maskImage: 'radial-gradient(ellipse 72% 80% at 50% 40%, #000 60%, transparent 100%)',
};

const SCENE_ART: Record<StoryPanel['scene'], string> = { storm: '🌀', stall: '🧋', beach: '🌊', ko: '💥', court: '🏟️' };

const Panel = ({ p, i }: { p: StoryPanel; i: number }) => {
  const who = p.who ? characterById(p.who) : null;
  const still = useReducedMotion();
  const tilt = [-1.5, 1.2, -0.8][i % 3];
  return (
    <motion.div
      initial={still ? { opacity: 0 } : { opacity: 0, scale: 1.25, rotate: tilt * 4 }}
      animate={{ opacity: 1, scale: 1, rotate: tilt }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="relative min-h-[9rem] overflow-hidden rounded-lg border-[3px] border-slate-950 shadow-[5px_5px_0_#0b0b14]"
      style={{ background: SCENE_BG[p.scene] }}
    >
      <Halftone color="#0b0b14" opacity={0.18} size={7} />
      {(p.scene === 'storm' || p.scene === 'beach') && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: 'repeating-linear-gradient(105deg, rgba(224,242,254,0.55) 0 1.5px, transparent 1.5px 14px)' }}
        />
      )}
      {p.scene === 'stall' && (
        <div aria-hidden className="absolute inset-x-0 top-2 flex justify-around">
          {Array.from({ length: 9 }, (_, k) => (
            <span key={k} className="h-2.5 w-2.5 rounded-full bg-yellow-200 shadow-[0_0_10px_#fde68a]" />
          ))}
        </div>
      )}
      {/* 場景主視覺：大大的一個圖示墊在後面 */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center">
        <span className="-rotate-6 select-none text-[6.5rem] leading-none md:text-[10rem]" style={{ filter: 'drop-shadow(5px 6px 0 #0b0b14)' }}>
          {SCENE_ART[p.scene]}
        </span>
      </div>
      {who?.portrait && (
        <img
          src={who.portrait}
          alt={who.name}
          draggable={false}
          className="absolute bottom-0 left-1/2 h-[68%] w-auto -translate-x-1/2 object-contain object-bottom"
          style={PORTRAIT_MASK}
        />
      )}
      {who ? (
        <div className="absolute inset-x-2.5 top-2.5 rounded-2xl border-[2.5px] border-slate-950 bg-white px-3 py-2 text-sm font-black leading-snug text-slate-950 md:inset-x-3 md:top-3 md:text-base">
          <span className="mb-0.5 block text-[10px] tracking-widest text-rose-600">{who.name}</span>
          {p.text}
          <span aria-hidden className="absolute -bottom-2.5 left-1/2 h-4 w-4 rotate-45 border-b-[2.5px] border-r-[2.5px] border-slate-950 bg-white" />
        </div>
      ) : (
        <div className="absolute inset-x-2.5 bottom-2.5 -rotate-1 border-[2.5px] border-slate-950 bg-amber-200 px-3 py-2 text-sm font-black leading-snug text-slate-950 shadow-[3px_3px_0_#0b0b14] md:inset-x-3 md:bottom-3 md:text-base">
          {p.text}
        </div>
      )}
      {p.sfx && (
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 12 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 600, damping: 12 }}
          className="absolute right-2 top-1 text-2xl text-rose-500 md:text-4xl"
        >
          <Inked stroke={3}>{p.sfx}</Inked>
        </motion.span>
      )}
    </motion.div>
  );
};

/** 2–3 格短漫畫：一格一格砸出來，點一下跳下一格，可以整段跳過 */
/** 漫畫分格：踢館之旅每關的開場，也用在第一次進遊戲的世界觀介紹（cta 換最後的按鈕字） */
export const StoryComic = ({
  def,
  onDone,
  onSkip,
  cta = '開打！',
}: {
  def: Pick<LevelDef, 'name' | 'story'>;
  onDone: () => void;
  /** 「跳過」另外處理（預設跟看完一樣） */
  onSkip?: () => void;
  cta?: string;
}) => {
  const [shown, setShown] = useState(1);
  const all = shown >= def.story.length;
  useEffect(() => {
    if (all) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), 1600);
    return () => clearTimeout(t);
  }, [shown, all]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      className="absolute inset-0 z-40 flex flex-col bg-amber-100 p-3 md:p-5"
      onClick={() => (all ? onDone() : setShown((n) => n + 1))}
    >
      <Halftone color="#b45309" opacity={0.18} size={8} />
      <div className="relative flex items-center justify-between">
        <div className="-rotate-2 border-[3px] border-slate-950 bg-slate-950 px-3 py-1 text-sm font-black text-amber-300 shadow-[4px_4px_0_#0b0b14] md:text-lg">
          {def.name}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            (onSkip ?? onDone)();
          }}
          className="rounded-full border-2 border-slate-950 bg-white px-3 py-1 text-xs font-black text-slate-950 shadow-[2px_2px_0_#0b0b14] hover:bg-amber-50 md:text-sm"
        >
          跳過 ▶▶
        </button>
      </div>
      <div className="relative mt-3 grid min-h-0 flex-1 gap-3 md:grid-cols-3 landscape:grid-cols-3" style={{ gridAutoRows: 'minmax(0,1fr)' }}>
        {def.story.slice(0, shown).map((p, i) => (
          <Panel key={i} p={p} i={i} />
        ))}
      </div>
      <motion.div
        key={all ? 'go' : 'more'}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-3 text-center"
      >
        {all ? (
          <span className="inline-block -rotate-1 rounded-xl border-[3px] border-slate-950 bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-2 text-lg font-black text-slate-950 shadow-[4px_4px_0_#0b0b14] md:text-xl">
            {cta}
          </span>
        ) : (
          <span className="text-xs font-bold text-amber-950/75">點一下繼續</span>
        )}
      </motion.div>
    </motion.div>
  );
};

// ───────────────────────────── 關卡結算 ─────────────────────────────

export interface LevelOutcome {
  id: LevelId;
  stars: number;
  /** 小遊戲是分數；颱風關是打倒時剩餘秒數 */
  score: number;
  best: number;
  newBest: boolean;
  cleared: boolean;
  /** 第一次過關（解鎖下一關） */
  firstClear: boolean;
  /** Boss 剩多少血（沒打倒時顯示） */
  hp?: number;
}

interface ResultProps {
  def: LevelDef;
  outcome: LevelOutcome;
  next: LevelDef | null;
  share: MatchResult | null;
  onRetry: () => void;
  onNext: () => void;
  onMap: () => void;
}

export const LevelResult = ({ def, outcome, next, share, onRetry, onNext, onMap }: ResultProps) => {
  const boss = def.kind === 'boss';
  const unit = def.id === 'pearls' ? '顆' : def.id === 'cups' ? '分' : '秒';
  const head = outcome.cleared ? (boss ? 'K.O.！' : outcome.stars === 3 ? '完美通關！' : '過關！') : boss ? '時間到…' : '差一點！';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex overflow-y-auto overscroll-contain bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-cyan-950/85 p-4 backdrop-blur-[2px]"
    >
      <motion.div
        initial={{ scale: 0.9, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="relative m-auto w-full max-w-md overflow-hidden rounded-2xl border-[3px] border-slate-950 bg-gradient-to-br from-amber-50 to-orange-100 p-4 text-center text-slate-950 shadow-[7px_7px_0_#0b0b14] md:p-5"
      >
        <Halftone color="#c2410c" opacity={0.1} size={7} />
        <div className="relative">
          <div className="text-[11px] font-black tracking-[0.3em] text-orange-700">{def.name}</div>
          <div className={`mt-1 text-4xl md:text-5xl ${outcome.cleared ? 'text-amber-300' : 'text-slate-400'}`}>
            <Inked stroke={5}>{head}</Inked>
          </div>
          <div className="mt-3 flex justify-center gap-2 text-5xl md:text-6xl">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -40, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.28, type: 'spring', stiffness: 500, damping: 14 }}
                className={i < outcome.stars ? 'text-amber-400' : 'text-slate-300'}
                style={{ WebkitTextStroke: '3px #0b0b14', filter: i < outcome.stars ? 'drop-shadow(0 0 10px rgba(251,191,36,0.9))' : undefined }}
              >
                ★
              </motion.span>
            ))}
          </div>
          <div className="mt-2 text-sm font-bold text-amber-950/80">
            {boss ? (outcome.cleared ? `剩 ${outcome.score} 秒打倒黑框` : `黑框還剩 ${outcome.hp ?? 0}% 血`) : `${outcome.score} ${unit}`}
            {outcome.newBest && outcome.cleared && <b className="ml-2 rounded bg-rose-500 px-1.5 py-0.5 text-xs text-white">新紀錄</b>}
            {!outcome.newBest && outcome.best > 0 && <span className="ml-2 text-xs text-amber-950/60">（最佳 {outcome.best}）</span>}
          </div>
          <ul className="mx-auto mt-3 grid max-w-xs gap-1 text-left text-xs font-bold">
            {def.starText.map((t, i) => (
              <li key={t} className={`flex items-center gap-2 rounded-lg border-2 border-slate-950/80 px-2 py-1 ${i < outcome.stars ? 'bg-amber-200' : 'bg-white/70 text-amber-950/55'}`}>
                <Stars n={i + 1} size="text-xs" dim="hidden" />
                <span className="flex-1">{t}</span>
                {i < outcome.stars && <span>✓</span>}
              </li>
            ))}
          </ul>
          {outcome.firstClear && next && (
            <div className="mt-3 -rotate-1 rounded-lg border-2 border-slate-950 bg-slate-950 px-3 py-1.5 text-sm font-black text-amber-300">解鎖：{next.name}</div>
          )}
          {share && (
            <div className="mt-3 rounded-xl border-[2.5px] border-slate-950 bg-slate-950 px-3 pb-3 pt-0.5 text-left">
              <ShareActions result={share} />
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {next && outcome.cleared ? (
              <button type="button" onClick={onNext} className="col-span-2 rounded-xl border-[2.5px] border-slate-950 bg-gradient-to-r from-amber-300 to-orange-400 py-3 font-black shadow-[3px_3px_0_#0b0b14]">
                下一關：{next.name} →
              </button>
            ) : null}
            <button type="button" onClick={onRetry} className="rounded-xl border-[2.5px] border-slate-950 bg-white py-2.5 font-black shadow-[3px_3px_0_#0b0b14] hover:bg-amber-50">
              {outcome.cleared ? '再玩刷星' : '再挑戰'}
            </button>
            <button type="button" onClick={onMap} className="rounded-xl border-[2.5px] border-slate-950 bg-white py-2.5 font-black shadow-[3px_3px_0_#0b0b14] hover:bg-amber-50">
              回地圖
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
