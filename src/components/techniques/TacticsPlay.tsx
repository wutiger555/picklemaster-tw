import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import type { P, TacticPlay } from './tactics';

/**
 * 雙打俯視戰術動畫：一步一步看站位和球路。
 * 座標用英尺（場地 44 × 20 ft），左邊是「你這隊」。
 */

const S = 10;
const OX = 30;
const OY = 34;
const X = (ft: number) => OX + ft * S;
const Y = (ft: number) => OY + ft * S;

const Player = ({ label, at, team, focus }: { label: string; at: P; team: 'A' | 'B'; focus: boolean }) => (
  <m.g initial={false} animate={{ x: X(at[0]), y: Y(at[1]) }} transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}>
    {focus && (
      <m.circle r={11} fill="none" stroke="#fde047" strokeWidth={2} initial={{ scale: 1, opacity: 0.9 }} animate={{ scale: [1, 1.9], opacity: [0.9, 0] }} transition={{ duration: 1.3, repeat: Infinity }} />
    )}
    <circle r={11} fill={team === 'A' ? '#059669' : '#475569'} stroke={focus ? '#fde047' : '#fff'} strokeWidth={2.5} />
    <text textAnchor="middle" dy={4.5} fontSize={11} fontWeight={800} fill="#fff" className="text-[12px]">
      {label}
    </text>
  </m.g>
);

const TacticsPlay = ({ play }: { play: TacticPlay }) => {
  const { steps: STEPS } = play;
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const step = STEPS[i];

  useEffect(() => {
    if (!auto) return;
    if (i >= STEPS.length - 1) {
      setAuto(false);
      return;
    }
    const id = window.setTimeout(() => setI((n) => n + 1), 3200);
    return () => window.clearTimeout(id);
  }, [auto, i, STEPS.length]);

  const pts = step.ball.map(([x, y]) => [X(x), Y(y)] as const);
  const bounce = step.bounce !== undefined ? pts[step.bounce] : null;

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-neutral-100 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 p-2 sm:p-4">
        <svg viewBox="0 0 500 280" className="w-full h-auto block" role="img" aria-label={`${play.label}俯視圖：${step.title}`}>
          {/* 場地 */}
          <rect x={X(0)} y={Y(0)} width={44 * S} height={20 * S} fill="#1e6091" stroke="#f8fafc" strokeWidth={2} />
          <rect x={X(15)} y={Y(0)} width={14 * S} height={20 * S} fill="#2a78b0" stroke="#f8fafc" strokeWidth={2} />
          <line x1={X(0)} x2={X(15)} y1={Y(10)} y2={Y(10)} stroke="#f8fafc" strokeWidth={2} />
          <line x1={X(29)} x2={X(44)} y1={Y(10)} y2={Y(10)} stroke="#f8fafc" strokeWidth={2} />
          <line x1={X(22)} x2={X(22)} y1={Y(-1)} y2={Y(21)} stroke="#0f172a" strokeWidth={4} />
          <line x1={X(22)} x2={X(22)} y1={Y(-1)} y2={Y(21)} stroke="#e2e8f0" strokeWidth={1.2} strokeDasharray="3 3" />
          {[-1, 21].map((y) => (
            <circle key={y} cx={X(22)} cy={Y(y)} r={3.5} fill="#e2e8f0" stroke="#0f172a" strokeWidth={1.5} />
          ))}
          {[18.5, 25.5].map((x) => (
            <text key={x} x={X(x)} y={Y(1.6)} textAnchor="middle" fontSize={9} fill="#dbeafe" fillOpacity={0.55} fontWeight={700} className="text-[13px] sm:text-[9px]">
              廚房
            </text>
          ))}
          <text x={X(7.5)} y={Y(0) - 12} textAnchor="middle" fontSize={11} fill="#6ee7b7" fontWeight={800} className="text-[16px] sm:text-[11px]">
            {play.sides[0]}
          </text>
          <text x={X(36.5)} y={Y(0) - 12} textAnchor="middle" fontSize={11} fill="#cbd5e1" fontWeight={800} className="text-[16px] sm:text-[11px]">
            {play.sides[1]}
          </text>

          {/* 球路 */}
          <AnimatePresence mode="wait">
            <m.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {pts.length > 1 && (
                <m.path
                  d={pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x},${y}`).join('')}
                  fill="none"
                  stroke="#fde047"
                  strokeWidth={2.5}
                  strokeDasharray="1 7"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />
              )}
              {bounce && (
                <m.circle
                  cx={bounce[0]}
                  cy={bounce[1]}
                  fill="none"
                  stroke="#fde047"
                  strokeWidth={2}
                  initial={{ r: 2, opacity: 0 }}
                  animate={{ r: [2, 12, 9], opacity: [0, 1, 0.8] }}
                  transition={{ duration: 0.6, delay: 0.75 }}
                />
              )}
              {pts.length > 0 && (
                <m.circle
                  r={5}
                  fill="#e6f53a"
                  stroke="#713f12"
                  strokeWidth={1}
                  initial={{ cx: pts[0][0], cy: pts[0][1] }}
                  animate={{ cx: pts.map((p) => p[0]), cy: pts.map((p) => p[1]) }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />
              )}
            </m.g>
          </AnimatePresence>

          {play.roster.map((r) => (
            <Player key={r.id} label={r.label} team={r.team} at={step.players[r.id]} focus={step.focus === r.id} />
          ))}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="tablist" aria-label={`${play.label}步驟`}>
        {STEPS.map((s, k) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            aria-selected={k === i}
            onClick={() => {
              setAuto(false);
              setI(k);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              k === i ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' : k < i ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-neutral-600 border-neutral-200 hover:border-emerald-300'
            }`}
          >
            <span className="tabular-nums opacity-70">{k + 1}</span>
            {s.title}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            if (i >= STEPS.length - 1) setI(0);
            setAuto((a) => !a);
          }}
          className="ml-auto px-3.5 py-1.5 rounded-full text-sm font-bold bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
        >
          {auto ? '❚❚ 暫停' : '▶ 自動播放'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <m.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="mt-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
          <div className="font-bold text-neutral-900 mb-1">
            {i + 1}. {step.title}
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed min-h-[3.5em]">{step.caption}</p>
        </m.div>
      </AnimatePresence>
    </div>
  );
};

export default TacticsPlay;
