import { AnimatePresence, motion } from 'framer-motion';
import { type Lesson, LESSONS } from './tutorial';

/** 教學進行中：上方的關卡卡片（第幾招、這招有什麼用、要按什麼） */
export const TutorialPanel = ({
  lesson,
  index,
  touch,
  cleared,
  onSkip,
  onExit,
}: {
  lesson: Lesson;
  index: number;
  touch: boolean;
  cleared: boolean;
  onSkip: () => void;
  onExit: () => void;
}) => (
  <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-20 flex justify-center px-3 max-md:justify-start max-md:pr-16">
    <motion.div
      key={lesson.id}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-auto w-full max-w-lg rounded-2xl border border-white/15 bg-slate-950/80 p-3.5 text-white shadow-2xl backdrop-blur-md md:p-4"
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-300 px-2 py-0.5 text-[11px] font-black text-amber-950">
          第 {index + 1}/{LESSONS.length} 招
        </span>
        <h3 className="whitespace-nowrap text-lg font-black md:text-xl">{lesson.title}</h3>
        <div className="ml-auto flex gap-1">
          {LESSONS.map((l, i) => (
            <span
              key={l.id}
              className={`h-1.5 w-4 rounded-full ${i < index || (i === index && cleared) ? 'bg-emerald-400' : i === index ? 'bg-amber-300' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-white/55">{lesson.why}</p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-white">{touch ? lesson.touch : lesson.keys}</p>
      <div className="mt-2.5 flex items-center gap-3 text-xs">
        <button type="button" onClick={onSkip} className="font-semibold text-white/55 underline-offset-2 hover:text-white hover:underline">
          跳過這招
        </button>
        <button type="button" onClick={onExit} className="font-semibold text-white/55 underline-offset-2 hover:text-white hover:underline">
          離開教學
        </button>
      </div>
    </motion.div>
    <AnimatePresence>
      {cleared && (
        <motion.div
          key="cleared"
          initial={{ opacity: 0, scale: 1.8, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: -4 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 480, damping: 18 }}
          className="pointer-events-none absolute inset-x-0 top-[22vh] text-center"
        >
          <span className="font-display text-5xl font-black italic text-emerald-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.9)] md:text-6xl">學會了！</span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/** 教學完成：還沒親手練到的功能列一下，比賽中第一次遇到時教練會再提醒 */
export const TutorialDone = ({ onPlay, onMenu }: { onPlay: () => void; onMenu: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-30 flex overflow-y-auto overscroll-contain bg-slate-950/85 p-4 backdrop-blur-sm"
  >
    <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} className="m-auto w-full max-w-md py-4 text-center text-white">
      <div className="text-5xl">🎓</div>
      <h2 className="mt-2 text-3xl font-black">五招都學會了！</h2>
      <p className="mt-2 text-sm text-white/70">還有這幾個，比賽中第一次遇到時教練會提醒你：</p>
      <ul className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-white/85">
        <li>
          <b className="text-yellow-300">發球</b>：按住擊球鍵蓄力，力道條到綠色區放開
        </li>
        <li>
          <b className="text-rose-300">破解必殺</b>：對手放必殺時，抓準時機打出「完美」就能擋回去，還會大量回能量
        </li>
        <li>
          <b className="text-amber-300">無雙覺醒</b>：落後時量表會集滿，一場一次的逆轉大招
        </li>
        <li>
          <b className="text-sky-300">電視輔助判決</b>：壓線球判你出界時，可以申請看重播
        </li>
        <li>
          <b className="text-emerald-300">規則</b>：雙彈跳和廚房規則遊戲會幫你遵守，失分時卡片會說明原因
        </li>
      </ul>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onPlay}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-3.5 text-lg font-black text-emerald-950 shadow-xl shadow-emerald-500/25"
      >
        開始第一場比賽 →
      </motion.button>
      <button type="button" onClick={onMenu} className="mt-3 text-sm font-semibold text-white/60 hover:text-white">
        回主選單
      </button>
    </motion.div>
  </motion.div>
);

/** 比賽中的教練提示：第一次遇到某種狀況時跳一句 */
export const CoachTip = ({ tip, touch = false }: { tip: { id: number; text: string } | null; touch?: boolean }) => (
  // 手機：貼在記分板下方，不壓在球場中間
  <div className={`pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4 ${touch ? 'top-[8.75rem] landscape:top-[7.25rem]' : 'top-[30%]'}`}>
    <AnimatePresence>
      {tip && (
        <motion.div
          key={tip.id}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex max-w-md items-start gap-2.5 rounded-2xl border border-emerald-300/40 bg-slate-950/85 px-4 py-3 text-white shadow-2xl backdrop-blur-md"
        >
          <span className="text-xl leading-none">💡</span>
          <div>
            <div className="text-[11px] font-bold tracking-wider text-emerald-300">教練提示</div>
            <div className="mt-0.5 text-sm font-semibold leading-relaxed">{tip.text}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
