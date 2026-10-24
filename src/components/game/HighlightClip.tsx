import { AnimatePresence, motion } from 'framer-motion';
import type { HudState, Landing } from './engine/game';

/**
 * 精彩重播的轉播包裝：上下黑邊、紅色 REPLAY、這一球的名堂，右下角可以跳過。
 * 和電視輔助判決（ReviewOverlay）同一套視覺語言。
 */
const LANDING_TEXT = (l: Landing) =>
  l.kind === 'net' ? '掛網' : l.cm === 0 ? (l.kind === 'in' ? '界內' : '出界') : l.kind === 'in' ? `界內・離線 ${l.cm} 公分` : `出界 ${l.cm} 公分`;

export const ReplayOverlay = ({
  label,
  touch,
  onSkip,
  info,
}: {
  label: string;
  touch: boolean;
  onSkip: () => void;
  info: HudState['replayInfo'];
}) => (
  <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
    <motion.div className="absolute inset-x-0 top-0 h-[8%] origin-top bg-black/85" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} />
    <motion.div className="absolute inset-x-0 bottom-0 h-[8%] origin-bottom bg-black/85" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} />
    <motion.div
      className="absolute left-4 top-[10%] flex flex-col items-start gap-1.5"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26, delay: 0.08 }}
    >
      <div className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 shadow-lg shadow-red-950/40">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        <span className="text-sm font-black tracking-[0.18em] text-white">REPLAY</span>
        <span className="text-[10px] font-bold tracking-widest text-white/75">慢動作</span>
      </div>
      <span
        className={`font-display font-black italic tracking-tight text-amber-300 ${touch ? 'text-3xl' : 'text-5xl'}`}
        style={{ textShadow: '0 0 18px rgba(251,191,36,0.6), 3px 3px 0 #000' }}
      >
        {label}
      </span>
      {info?.landing && (
        <span
          className={`rounded-full px-3 py-1 text-sm font-black text-slate-950 shadow-lg ${
            info.landing.kind === 'in' ? 'bg-emerald-400' : info.landing.kind === 'out' ? 'bg-red-400' : 'bg-orange-400'
          }`}
        >
          落點：{LANDING_TEXT(info.landing)}
        </span>
      )}
    </motion.div>
    {info?.tip && (
      <motion.div
        className={`absolute inset-x-0 flex justify-center px-4 ${touch ? 'bottom-[calc(8%+3.75rem)]' : 'bottom-[11%]'}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-lg rounded-2xl border border-emerald-300/40 bg-slate-950/85 px-4 py-3 text-white shadow-2xl backdrop-blur-md">
          <div className="text-[11px] font-bold tracking-wider text-emerald-300">💡 下一球這樣改</div>
          <div className="mt-1 text-sm font-semibold leading-relaxed md:text-base">{info.tip}</div>
          <div className="mt-2 flex gap-3 text-[11px] text-white/60">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-white" /> 你當時的位置
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-emerald-400" /> 建議站位
            </span>
          </div>
        </div>
      </motion.div>
    )}
    <button
      type="button"
      onClick={onSkip}
      className={`pointer-events-auto absolute right-4 flex ${touch ? 'bottom-[calc(8%+0.75rem)]' : 'bottom-[10%]'} items-center gap-2 rounded-full bg-slate-950/70 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-slate-950/90`}
    >
      跳過重播 <span aria-hidden>▸▸</span>
      {!touch && <span className="rounded bg-white/15 px-1.5 text-[10px] text-white/70">任意鍵</span>}
    </button>
  </motion.div>
);

export type ClipStatus = 'cutting' | 'ready' | 'shared' | 'saved';

/** 漂亮的一分打完出現：存下這球（分享到 Threads，不支援分享就下載） */
export const SaveClipButton = ({
  clip,
  onSave,
  compact = false,
}: {
  clip: { id: number; label: string; status: ClipStatus } | null;
  onSave: () => void;
  /** 手機：縮成一顆小膠囊，不擋球場 */
  compact?: boolean;
}) => (
  <AnimatePresence>
    {clip && (
      <motion.button
        key={clip.id}
        type="button"
        onClick={onSave}
        disabled={clip.status === 'shared' || clip.status === 'saved'}
        initial={{ opacity: 0, y: -14, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 460, damping: 24 }}
        className={`pointer-events-auto relative flex items-center overflow-hidden bg-gradient-to-r ${compact ? 'gap-2 rounded-full py-1 pl-1 pr-3' : 'gap-2.5 rounded-2xl py-2 pl-3 pr-4'} from-rose-500 via-orange-400 to-amber-300 text-left text-slate-950 shadow-xl shadow-orange-600/30 ring-1 ring-white/40 disabled:from-emerald-400 disabled:via-emerald-400 disabled:to-teal-400`}
      >
        {/* 掃光：吸引目光但不擋畫面 */}
        {clip.status === 'ready' && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-10 -skew-x-12 bg-white/40 blur-sm"
            initial={{ x: -60 }}
            animate={{ x: 260 }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
          />
        )}
        <span className={`relative grid shrink-0 ${compact ? 'h-6 w-6' : 'h-8 w-8'} place-items-center rounded-full bg-slate-950/90`}>
          {clip.status === 'shared' || clip.status === 'saved' ? (
            <span className="text-sm text-emerald-300">✓</span>
          ) : (
            <span className={`h-3 w-3 rounded-full bg-red-500 ${clip.status === 'cutting' ? 'animate-pulse' : ''}`} />
          )}
        </span>
        <span className="relative flex flex-col leading-tight">
          <span className={compact ? 'text-sm font-black' : 'text-base font-black'}>
            {clip.status === 'shared' ? '分享出去了！' : clip.status === 'saved' ? '影片已下載' : '存下這球'}
          </span>
          {!compact && (
          <span className="text-[11px] font-bold text-slate-900/75">
            {clip.status === 'cutting' ? `${clip.label}・剪輯中…` : `${clip.label}・分享到 Threads`}
          </span>
          )}
        </span>
      </motion.button>
    )}
  </AnimatePresence>
);
