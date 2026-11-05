import { AnimatePresence, motion } from 'framer-motion';
import type { LevelHud as LevelHudState } from './engine/levels';
import { Stars } from './TourScreens';

/** 關卡中的得分彈出字（+300 大杯、-12 之類） */
export interface LevelPop {
  id: number;
  text: string;
  tone: 'gold' | 'good' | 'bad' | 'hit';
}

const POP_TONE: Record<LevelPop['tone'], string> = {
  gold: 'text-amber-300',
  good: 'text-lime-300',
  bad: 'text-rose-400',
  hit: 'text-orange-300',
};

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * 風向儀：箭頭指向風吹去的方向（鏡頭在玩家身後往 −z 看，所以世界 +x 是畫面右、−z 是畫面上）。
 * 要換風向前，下一個風向用虛線箭頭預告並閃爍。
 */
const WindGauge = ({ wind }: { wind: NonNullable<LevelHudState['wind']> }) => {
  const speed = Math.hypot(wind.x, wind.z);
  const deg = (Math.atan2(wind.x, -wind.z) * 180) / Math.PI;
  const next = wind.next;
  const nextDeg = next ? (Math.atan2(next.x, -next.z) * 180) / Math.PI : 0;
  const level = speed > 5.5 ? '強陣風' : speed > 4 ? '強風' : '有風';
  return (
    <div className={`flex items-center gap-2 rounded-2xl border px-2.5 py-1.5 backdrop-blur-md ${wind.warn ? 'animate-pulse border-amber-300/80 bg-amber-500/25' : 'border-white/15 bg-slate-950/65'}`}>
      <svg viewBox="-20 -20 40 40" className="h-10 w-10 md:h-12 md:w-12" aria-label={`風速每秒 ${speed.toFixed(1)} 公尺`}>
        <circle r="18" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        {next && (
          <g transform={`rotate(${nextDeg})`} opacity="0.85">
            <path d="M0 -15 L5 -6 L1.6 -6 L1.6 12 L-1.6 12 L-1.6 -6 L-5 -6 Z" fill="none" stroke="#fcd34d" strokeWidth="1.4" strokeDasharray="2.5 2" />
          </g>
        )}
        <g transform={`rotate(${deg})`} style={{ transition: 'transform 0.6s ease-out' }}>
          <path d="M0 -15 L6 -5 L2 -5 L2 12 L-2 12 L-2 -5 L-6 -5 Z" fill="#7dd3fc" stroke="#0b0b14" strokeWidth="1.2" />
        </g>
      </svg>
      <div className="leading-tight">
        <div className="text-[10px] font-bold text-white/60">{wind.warn ? '風向要變了！' : level}</div>
        <div className="text-base font-black tabular-nums text-white md:text-lg">
          {speed.toFixed(1)}
          <span className="ml-0.5 text-[10px] font-bold text-white/60">m/s</span>
        </div>
      </div>
    </div>
  );
};

const Timer = ({ s }: { s: number }) => (
  <span className={`font-black tabular-nums ${s <= 10 ? 'animate-pulse text-rose-400' : 'text-white'}`}>⏱ {clock(s)}</span>
);

interface Props {
  level: LevelHudState;
  name: string;
  /** Boss 的名字與頭像（Boss 關才有） */
  boss?: { name: string; portrait: string | null };
  pops: LevelPop[];
  touch: boolean;
}

export const LevelBoard = ({ level, name, boss, pops, touch }: Props) => {
  if (level.id === 'typhoon' && boss) {
    const hp = level.hp ?? 0;
    return (
      <div className="flex items-start gap-2 max-md:portrait:flex-col">
        <div className="w-[min(22rem,62vw)] rounded-2xl border border-white/15 bg-slate-950/70 px-3 py-2 text-white shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            {boss.portrait && <img src={boss.portrait} alt="" className="h-9 w-9 shrink-0 rounded-full bg-slate-800 object-cover object-top ring-2 ring-rose-500" draggable={false} />}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-xs font-black text-rose-300">BOSS・{boss.name}</span>
                <span className="text-xs">
                  <Timer s={level.timeLeft} />
                </span>
              </div>
              <div className="relative mt-1 h-3.5 overflow-hidden rounded-full border border-white/20 bg-slate-800">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400"
                  animate={{ width: `${hp}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                />
                <motion.div key={hp} className="absolute inset-0 bg-white" initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black tabular-nums text-white drop-shadow">{hp}%</span>
              </div>
            </div>
          </div>
          <Pops pops={pops} />
        </div>
        {level.wind && <WindGauge wind={level.wind} />}
      </div>
    );
  }
  // 小遊戲：分數條上標出三顆星的位置
  const max = level.thresholds[2] * 1.1;
  const pct = Math.min(100, (level.score / max) * 100);
  return (
    <div className="w-[min(22rem,70vw)] rounded-2xl border border-white/15 bg-slate-950/70 px-3 py-2 text-white shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-black text-amber-300">{name}</span>
        <span className="text-xs">
          <Timer s={level.timeLeft} />
        </span>
      </div>
      <div className="mt-0.5 flex items-center gap-3">
        <motion.span key={level.score} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className="min-w-[3.5rem] text-2xl font-black tabular-nums md:text-3xl">
          {level.score}
        </motion.span>
        <div className="relative h-3 flex-1 rounded-full border border-white/20 bg-slate-800">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-lime-400 via-amber-300 to-amber-400" animate={{ width: `${pct}%` }} />
          {level.thresholds.map((t, i) => (
            <span
              key={t}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm leading-none ${level.stars > i ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]' : 'text-white/35'}`}
              style={{ left: `${(t / max) * 100}%` }}
            >
              ★
            </span>
          ))}
        </div>
        <Stars n={level.stars} size="text-sm" />
      </div>
      {!touch && level.id === 'pearls' && <div className="mt-0.5 text-[10px] text-white/50">金珍珠按 Shift 撲過去</div>}
      <Pops pops={pops} />
    </div>
  );
};

const Pops = ({ pops }: { pops: LevelPop[] }) => (
  <div className="pointer-events-none relative h-0">
    <AnimatePresence>
      {pops.slice(-3).map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 4, scale: 1.4 }}
          animate={{ opacity: 1, y: 8 + i * 22, scale: 1 }}
          exit={{ opacity: 0, y: 30 + i * 22 }}
          transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          className={`absolute right-1 top-0 whitespace-nowrap text-lg font-black italic ${POP_TONE[p.tone]}`}
          style={{ textShadow: '2px 2px 0 #000' }}
        >
          {p.text}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
