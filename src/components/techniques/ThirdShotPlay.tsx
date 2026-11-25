import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';

/**
 * 第三球戰術俯視動畫：雙打從發球到四人都站上廚房線，一步一步看站位與球路。
 * 座標用英尺（場地 44 × 20 ft），左邊是發球方（你這隊）。
 */

const S = 10;
const OX = 30;
const OY = 28;
const X = (ft: number) => OX + ft * S;
const Y = (ft: number) => OY + ft * S;

type P = [number, number];
interface Step {
  title: string;
  caption: string;
  players: { A1: P; A2: P; B1: P; B2: P };
  /** 球路：起點 → 落地點 → 擊球點（落地點那一格會畫彈跳圈） */
  ball: P[];
  bounce?: number;
}

const STEPS: Step[] = [
  {
    title: '開局站位',
    caption: '發球方兩人都留在底線。雙彈跳規則規定發球和接發球都要先落地才能打，所以第三球之前不能上網；接發球方的搭檔則已經站在廚房線。',
    players: { A1: [-1.5, 15], A2: [-1.5, 5], B1: [45.5, 5], B2: [29.6, 15] },
    ball: [[-0.6, 14.4]],
  },
  {
    title: '發球',
    caption: '從右區斜對角發到對方的發球區，球必須先落地，接發球的人才能回擊。',
    players: { A1: [-1.5, 15], A2: [-1.5, 5], B1: [45.5, 5], B2: [29.6, 15] },
    ball: [[-0.6, 14.4], [38, 5.5], [45, 5.2]],
    bounce: 1,
  },
  {
    title: '接發球',
    caption: '接發球打深，把發球方壓在底線；接完立刻上網，接發球方兩人都站上廚房線，佔了上風。',
    players: { A1: [-1.5, 15], A2: [2.6, 7.5], B1: [29.6, 5], B2: [29.6, 15] },
    ball: [[45, 5.2], [6.5, 8], [3.2, 7.8]],
    bounce: 1,
  },
  {
    title: '第三球下切',
    caption: '用下切把球輕輕送進對方廚房。球飛得慢、落在對手腳前，對手只能等它落地再往上挑。趁這一秒多，兩人一起往前衝。',
    players: { A1: [7.5, 14.5], A2: [8, 6.5], B1: [29.6, 5], B2: [29.6, 15] },
    ball: [[3.2, 7.8], [25.5, 11], [28.6, 11.2]],
    bounce: 1,
  },
  {
    title: '跟上網前',
    caption: '四個人都站上廚房線，開局的劣勢變成平手。接下來進入吊球（dink）對戰，比的是耐心。',
    players: { A1: [14.4, 14.5], A2: [14.4, 5.5], B1: [29.6, 5], B2: [29.6, 15] },
    ball: [[28.6, 11.2], [18.5, 9.5], [15.4, 8.8]],
    bounce: 1,
  },
];

const Player = ({ id, at, team }: { id: string; at: P; team: 'A' | 'B' }) => (
  <m.g initial={false} animate={{ x: X(at[0]), y: Y(at[1]) }} transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}>
    <circle r={11} fill={team === 'A' ? '#059669' : '#475569'} stroke="#fff" strokeWidth={2.5} />
    <text textAnchor="middle" dy={4.5} fontSize={11} fontWeight={800} fill="#fff" className="text-[12px]">
      {id}
    </text>
  </m.g>
);

const ThirdShotPlay = () => {
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
  }, [auto, i]);

  const pts = step.ball.map(([x, y]) => [X(x), Y(y)] as const);
  const bounce = step.bounce !== undefined ? pts[step.bounce] : null;

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-neutral-100 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 p-2 sm:p-4">
        <svg viewBox="0 0 500 256" className="w-full h-auto block" role="img" aria-label={`第三球戰術俯視圖：${step.title}`}>
          {/* 場地 */}
          <rect x={X(0)} y={Y(0)} width={44 * S} height={20 * S} fill="#1e6091" stroke="#f8fafc" strokeWidth={2} />
          <rect x={X(15)} y={Y(0)} width={14 * S} height={20 * S} fill="#2a78b0" stroke="#f8fafc" strokeWidth={2} />
          <line x1={X(0)} x2={X(15)} y1={Y(10)} y2={Y(10)} stroke="#f8fafc" strokeWidth={2} />
          <line x1={X(29)} x2={X(44)} y1={Y(10)} y2={Y(10)} stroke="#f8fafc" strokeWidth={2} />
          <line x1={X(22)} x2={X(22)} y1={Y(-1)} y2={Y(21)} stroke="#0f172a" strokeWidth={4} />
          <line x1={X(22)} x2={X(22)} y1={Y(-1)} y2={Y(21)} stroke="#e2e8f0" strokeWidth={1.2} strokeDasharray="3 3" />
          <text x={X(22)} y={Y(0) - 9} textAnchor="middle" fontSize={10} fill="#a7f3d0" fontWeight={700} className="text-[15px] sm:text-[10px]">
            廚房（非截擊區）
          </text>
          <text x={X(7.5)} y={Y(20) + 18} textAnchor="middle" fontSize={11} fill="#6ee7b7" fontWeight={800} className="text-[16px] sm:text-[11px]">
            發球方（你這隊）
          </text>
          <text x={X(36.5)} y={Y(20) + 18} textAnchor="middle" fontSize={11} fill="#cbd5e1" fontWeight={800} className="text-[16px] sm:text-[11px]">
            接發球方
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
              <m.circle
                r={5}
                fill="#e6f53a"
                stroke="#713f12"
                strokeWidth={1}
                initial={{ cx: pts[0][0], cy: pts[0][1] }}
                animate={{ cx: pts.map((p) => p[0]), cy: pts.map((p) => p[1]) }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            </m.g>
          </AnimatePresence>

          <Player id="你" at={step.players.A1} team="A" />
          <Player id="友" at={step.players.A2} team="A" />
          <Player id="B1" at={step.players.B1} team="B" />
          <Player id="B2" at={step.players.B2} team="B" />
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="戰術步驟">
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

export default ThirdShotPlay;
