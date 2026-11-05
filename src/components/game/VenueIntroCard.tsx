import { motion } from 'framer-motion';
import type { Venue } from './GameScreens';
import { VENUE_INFO } from './scene/venueIntro';

/**
 * 開賽前的場地介紹卡（瑪利歐賽車那種）：上下黑邊、左下角滑進場地名稱，點任何地方略過。
 * 鏡頭由 GameScene 照 venueIntro 的腳本走。
 */
export const VenueIntroCard = ({ venue, touch, onSkip }: { venue: Exclude<Venue, 'beach'>; touch: boolean; onSkip: () => void }) => {
  const info = VENUE_INFO[venue];
  return (
    <motion.div
      className="absolute inset-0 z-40 cursor-pointer select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      onPointerDown={onSkip}
    >
      <motion.div className="absolute inset-x-0 top-0 h-[9%] origin-top bg-black" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} />
      <motion.div className="absolute inset-x-0 bottom-0 h-[9%] origin-bottom bg-black" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} />
      <motion.div
        className="absolute bottom-[13%] left-0 max-w-[92%]"
        initial={{ x: '-110%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.25 }}
      >
        <div className="rounded-r-2xl bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/40 py-3 pl-5 pr-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
            <span className="text-[11px] font-black italic tracking-[0.3em] text-amber-300">TODAY&apos;S COURT</span>
          </div>
          <div className="mt-1 font-display text-3xl font-black italic leading-tight text-white md:text-5xl" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.6)' }}>
            {info.name}
          </div>
          <div className="mt-1 text-xs font-bold text-emerald-300 md:text-sm">📍 {info.where}</div>
          <div className="mt-0.5 text-xs text-white/75 md:text-sm">{info.line}</div>
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-[3%] right-4 text-xs font-bold text-white/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {touch ? '點一下略過' : '按任意鍵略過'} ▸▸
      </motion.div>
    </motion.div>
  );
};
