import { AnimatePresence, motion } from 'framer-motion';

/**
 * 精彩重播的轉播包裝：上下黑邊、紅色 REPLAY、這一球的名堂，右下角可以跳過。
 * 和電視輔助判決（ReviewOverlay）同一套視覺語言。
 */
export const ReplayOverlay = ({ label, touch, onSkip }: { label: string; touch: boolean; onSkip: () => void }) => (
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
    </motion.div>
    <button
      type="button"
      onClick={onSkip}
      className="pointer-events-auto absolute bottom-[10%] right-4 flex items-center gap-2 rounded-full bg-slate-950/70 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-slate-950/90"
    >
      跳過重播 <span aria-hidden>▸▸</span>
      {!touch && <span className="rounded bg-white/15 px-1.5 text-[10px] text-white/70">任意鍵</span>}
    </button>
  </motion.div>
);

export type ClipStatus = 'cutting' | 'ready' | 'shared' | 'saved';

/** 漂亮的一分打完出現：存下這球（分享到 Threads，不支援分享就下載） */
export const SaveClipButton = ({ clip, onSave }: { clip: { id: number; label: string; status: ClipStatus } | null; onSave: () => void }) => (
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
        className="pointer-events-auto relative flex items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300 py-2 pl-3 pr-4 text-left text-slate-950 shadow-xl shadow-orange-600/30 ring-1 ring-white/40 disabled:from-emerald-400 disabled:via-emerald-400 disabled:to-teal-400"
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
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950/90">
          {clip.status === 'shared' || clip.status === 'saved' ? (
            <span className="text-sm text-emerald-300">✓</span>
          ) : (
            <span className={`h-3 w-3 rounded-full bg-red-500 ${clip.status === 'cutting' ? 'animate-pulse' : ''}`} />
          )}
        </span>
        <span className="relative flex flex-col leading-tight">
          <span className="text-base font-black">
            {clip.status === 'shared' ? '分享出去了！' : clip.status === 'saved' ? '影片已下載' : '存下這球'}
          </span>
          <span className="text-[11px] font-bold text-slate-900/75">
            {clip.status === 'cutting' ? `${clip.label}・剪輯中…` : `${clip.label}・分享到 Threads`}
          </span>
        </span>
      </motion.button>
    )}
  </AnimatePresence>
);
