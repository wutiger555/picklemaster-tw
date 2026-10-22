import { AnimatePresence, motion } from 'framer-motion';
import type { HudState } from './engine/game';
import type { CourtLine } from './engine/rules';

/**
 * 電視輔助判決的畫面層（參考 MLB Replay Review、日本職棒「リクエスト」的轉播包裝）：
 * 壓線 → 問要不要申請（倒數）→ 多角度重播（上下黑邊、紅色 VIDEO REVIEW）→ 揭曉判決。
 */

type Review = NonNullable<HudState['review']>;

const LINE_NAME: Record<CourtLine, string> = { side: '邊線', base: '底線', kitchen: '廚房線', center: '中線' };
const ANGLE_NAME = {
  mini: '',
  broadcast: 'ANGLE 1 · 轉播慢動作',
  line: 'ANGLE 2 · 線審視角',
  hawk: 'HAWK-EYE · 落點分析',
} as const;

const call = (inside: boolean) => (inside ? '界內 IN' : '出界 OUT');

const Offer = ({ r, onChallenge, onAccept }: { r: Review; onChallenge: () => void; onAccept: () => void }) => (
  <motion.div
    key="offer"
    className="absolute inset-x-0 top-[18%] flex flex-col items-center gap-3 px-4"
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
  >
    <div className="rounded-2xl border border-amber-300/60 bg-slate-950/80 px-5 py-2 text-center backdrop-blur-md">
      <div className="font-display text-3xl font-black italic text-amber-300 md:text-4xl">壓線！</div>
      <div className="text-xs font-bold text-white/80">
        {LINE_NAME[r.line]}附近・現場判決 <span className={r.calledIn ? 'text-emerald-300' : 'text-rose-300'}>{call(r.calledIn)}</span>
      </div>
    </div>
    {r.mine && r.left > 0 && (
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/15 bg-slate-950/85 p-4 text-center shadow-2xl backdrop-blur-md">
        <div className="text-base font-black text-white">要申請電視輔助判決嗎？</div>
        <div className="mt-0.5 text-[11px] text-white/60">剩 {r.left} 次・判決被推翻就不扣次數</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onChallenge}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 py-2.5 text-sm font-black text-white shadow-lg shadow-red-900/40"
          >
            申請判決 <span className="text-white/70">C</span>
          </button>
          <button type="button" onClick={onAccept} className="rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white hover:bg-white/15">
            接受判決 <span className="text-white/50">Enter</span>
          </button>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-amber-300 transition-[width] duration-200" style={{ width: `${(r.countdown / 7) * 100}%` }} />
        </div>
      </div>
    )}
    {r.mine && r.left === 0 && <div className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold text-white/70">判決次數已用完</div>}
    {!r.mine && r.left > 0 && (
      <div className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold text-white/80">對手考慮申請判決中…</div>
    )}
  </motion.div>
);

const Reviewing = ({ r }: { r: Review }) => {
  const v = r.verdict;
  return (
    <motion.div key="reviewing" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* 轉播重播的上下黑邊 */}
      <div className="absolute inset-x-0 top-0 h-[9%] bg-black/85" />
      <div className="absolute inset-x-0 bottom-0 h-[9%] bg-black/85" />
      <div className="absolute left-4 top-[11%] flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 shadow-lg">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        <span className="text-sm font-black tracking-[0.18em] text-white">VIDEO REVIEW</span>
      </div>
      <div className="absolute left-4 top-[11%] mt-10 text-xs font-bold text-white/85 drop-shadow">
        電視輔助判決・{r.mine ? '你' : '對手'}申請・原判 {call(r.calledIn)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={r.angle}
          className="absolute bottom-[11%] left-4 rounded-md bg-slate-950/75 px-3 py-1 text-xs font-black tracking-widest text-sky-200"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
        >
          {ANGLE_NAME[r.angle]}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {v && (
          <motion.div
            className="absolute inset-x-0 top-[17%] flex flex-col items-center"
            initial={{ opacity: 0, scale: 1.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            <div
              className={`rounded-2xl px-6 py-3 text-center shadow-2xl ${v.overturned ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-slate-950/90'}`}
            >
              <div className={`font-display text-4xl font-black italic md:text-6xl ${v.overturned ? 'text-slate-950' : 'text-white'}`}>
                {v.overturned ? '判決推翻！' : '維持原判'}
              </div>
              <div className={`mt-1 text-sm font-black md:text-base ${v.overturned ? 'text-slate-900' : 'text-white/85'}`}>
                <span className={v.truthIn ? (v.overturned ? '' : 'text-emerald-300') : v.overturned ? '' : 'text-rose-300'}>{call(v.truthIn)}</span>
                ・{v.truthIn ? `壓在${LINE_NAME[r.line]}內 ${v.marginCm.toFixed(1)} cm` : `出${LINE_NAME[r.line]} ${v.marginCm.toFixed(1)} cm`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const ReviewOverlay = ({ review, onChallenge, onAccept }: { review: HudState['review']; onChallenge: () => void; onAccept: () => void }) => (
  <AnimatePresence>
    {review?.state === 'offer' && <Offer r={review} onChallenge={onChallenge} onAccept={onAccept} />}
    {review?.state === 'reviewing' && <Reviewing r={review} />}
  </AnimatePresence>
);
