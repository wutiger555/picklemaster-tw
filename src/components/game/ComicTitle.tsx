import { useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * 遊戲名稱「匹克硬邦幫」的漫畫風標題：粗黑描邊、黃橘漸層字、每個字歪一點，
 * 開場用 TitleSplash 一個字一個字砸上畫面（集中線＋網點背景）。
 */

export const GAME_NAME = '匹克硬邦幫';
const CHARS = [...GAME_NAME];
/** 每個字的歪斜角度與高低差，做出手寫招牌的跳動感 */
const TILT = [-8, 5, -4, 7, -6];
const LIFT = [0.06, -0.08, 0.04, -0.05, 0.08];

// 標題字只載這幾個字的子集（幾 KB），系統字的「粗體」不夠漫畫
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@900&text=' + encodeURIComponent(`${GAME_NAME}砰！`) + '&display=swap';
const useTitleFont = () =>
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_URL}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = FONT_URL;
    document.head.appendChild(l);
  }, []);

const FONT = "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif";

/** 一個字：黑色粗描邊＋錯位黑影墊在後面，前面疊漸層字 */
const Glyph = ({ ch, i, stroke }: { ch: string; i: number; stroke: number }) => (
  <span className="relative inline-grid" style={{ transform: `rotate(${TILT[i % TILT.length]}deg) translateY(${LIFT[i % LIFT.length]}em)` }}>
    {/* 描邊與錯位黑影用 ::before 畫：文字只在 DOM 裡出現一次，搜尋引擎讀標題才不會變成「匹匹匹克克克」 */}
    <span
      aria-hidden
      data-ch={ch}
      className="col-start-1 row-start-1 text-slate-950 before:content-[attr(data-ch)]"
      style={{ WebkitTextStroke: `${stroke}px #0b0b14`, transform: `translate(${stroke * 0.55}px, ${stroke * 0.7}px)` }}
    />
    <span aria-hidden data-ch={ch} className="relative col-start-1 row-start-1 text-slate-950 before:content-[attr(data-ch)]" style={{ WebkitTextStroke: `${stroke}px #0b0b14` }} />
    <span className="relative col-start-1 row-start-1 bg-gradient-to-b from-yellow-200 via-amber-300 to-orange-500 bg-clip-text text-transparent">
      {ch}
    </span>
  </span>
);

/** 選單等處用的靜態標題 */
export const ComicTitle = ({ className = '', stroke = 6, as: Tag = 'h2' }: { className?: string; stroke?: number; as?: 'h1' | 'h2' | 'div' | 'span' }) => {
  useTitleFont();
  return (
    <Tag className={`inline-flex select-none font-black leading-none tracking-tight ${className}`} style={{ fontFamily: FONT }} aria-label={GAME_NAME}>
      {CHARS.map((c, i) => (
        <Glyph key={i} ch={c} i={i} stroke={stroke} />
      ))}
    </Tag>
  );
};

/** 開場：字一個一個砸下來、畫面一震，接著打出副標；點一下或時間到就收掉 */
export const TitleSplash = ({ onDone }: { onDone: () => void }) => {
  useTitleFont();
  const still = useReducedMotion();
  // 遊戲區在頁面下方：捲到看得見才開始砸字、才開始倒數
  const root = useRef<HTMLDivElement>(null);
  const seen = useInView(root, { once: true, amount: 0.6 });
  useEffect(() => {
    if (!seen) return;
    const t = window.setTimeout(onDone, still ? 1400 : 3200);
    return () => clearTimeout(t);
  }, [seen, onDone, still]);
  const slam = 0.12;
  const land = 0.2 + CHARS.length * slam;
  return (
    <motion.div
      ref={root}
      className="absolute inset-0 z-40 flex cursor-pointer items-center justify-center overflow-hidden bg-amber-300"
      onClick={onDone}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.35 } }}
      role="button"
      aria-label={`${GAME_NAME}：點一下繼續`}
    >
      {/* 集中線 */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[300vmax] w-[300vmax]"
        style={{
          x: '-50%',
          y: '-50%',
          background:
            'repeating-conic-gradient(from 0deg, #fff7d6 0deg 2.2deg, transparent 2.2deg 7deg), radial-gradient(circle, #fde68a 0%, #f59e0b 55%, #c2410c 100%)',
        }}
        animate={still ? undefined : { rotate: 360 }}
        transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
      />
      {/* 網點 */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-25 mix-blend-multiply"
        style={{ backgroundImage: 'radial-gradient(#7c2d12 1.3px, transparent 1.6px)', backgroundSize: '9px 9px' }}
      />
      {/* 中間留白，讓字站得住 */}
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(255,251,235,0.85) 0%, rgba(255,251,235,0) 42%)' }} />

      {seen && (
        <motion.div
          className="relative flex flex-col items-center px-4"
          animate={still ? undefined : { x: [0, -10, 9, -6, 4, 0], y: [0, 6, -7, 4, -2, 0] }}
          transition={{ delay: land, duration: 0.38 }}
        >
          <div
            className="flex select-none font-black leading-none tracking-tight text-[3.4rem] sm:text-[5rem] md:text-[7.5rem]"
            style={{ fontFamily: FONT }}
            aria-hidden
          >
            {CHARS.map((c, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={still ? { opacity: 0 } : { opacity: 0, scale: 4, rotate: TILT[i] * 4, y: -40 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                transition={still ? { duration: 0.3 } : { delay: 0.2 + i * slam, type: 'spring', stiffness: 520, damping: 17 }}
              >
                <Glyph ch={c} i={i} stroke={10} />
              </motion.span>
            ))}
          </div>

          {/* 副標：斜斜的黑底橫幅 */}
          <motion.div
            className="mt-5 -rotate-2 border-[3px] border-slate-950 bg-slate-950 px-4 py-1.5 text-center shadow-[6px_6px_0_#0b0b14] sm:mt-7 md:px-6 md:py-2"
            initial={{ opacity: 0, x: still ? 0 : -260, skewX: still ? 0 : -18 }}
            animate={{ opacity: 1, x: 0, skewX: 0 }}
            transition={{ delay: land + 0.15, type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="text-sm font-black tracking-wider text-white sm:text-base md:text-xl">
              真實物理 <span className="text-amber-300">×</span> 熱血必殺技的匹克球對戰
            </div>
          </motion.div>
          <motion.div
            className="mt-2 rotate-1 bg-white px-3 py-1 text-[11px] font-black tracking-[0.3em] text-slate-950 shadow-[4px_4px_0_#0b0b14] md:text-xs"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: land + 0.35 }}
          >
            PICKLE HARD-BANG GANG
          </motion.div>
        </motion.div>
      )}

      {/* 擬聲字 */}
      {seen && (
        <motion.div
          aria-hidden
          className="absolute right-[7%] top-[9%] select-none text-4xl font-black text-rose-600 md:text-6xl"
          style={{ fontFamily: FONT, WebkitTextStroke: '3px #0b0b14', rotate: 14 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: land, type: 'spring', stiffness: 600, damping: 12 }}
        >
          砰！
        </motion.div>
      )}

      <motion.div
        className="absolute bottom-5 text-xs font-bold text-slate-900/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.4, 1] }}
        transition={{ delay: land + 0.8, duration: 1.6, repeat: Infinity }}
      >
        點一下開始
      </motion.div>
    </motion.div>
  );
};
