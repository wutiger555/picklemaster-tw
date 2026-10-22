import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SPECIALS, type PaddleSpec } from './engine/paddles';
import { paddleFaceTexture } from './scene/textures';

/** 把球拍拍面貼圖轉成圖片，放進切入畫面 */
const useFaceArt = (spec: PaddleSpec) =>
  useMemo(() => {
    const img = paddleFaceTexture(spec).image as HTMLCanvasElement;
    try {
      return img.toDataURL('image/png');
    } catch {
      return '';
    }
  }, [spec]);

/**
 * 動漫式必殺切入：斜切色帶＋速度線＋巨大招式名＋球拍特寫。
 * 遊戲時間在這段幾乎凍結，所以畫面動態全靠這層 CSS。
 */
export const CutIn = ({ spec, mine }: { spec: PaddleSpec; mine: boolean }) => {
  const sp = SPECIALS[spec.special];
  const art = useFaceArt(spec);
  const from = mine ? -1 : 1;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      <style>{'@keyframes pm-speedlines{from{background-position:0 0}to{background-position:-88px 0}}'}</style>
      {/* 畫面閃白 */}
      <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} />
      {/* 斜切色帶 */}
      <motion.div
        className="absolute left-[-10%] right-[-10%] top-[30%] h-[40%] -skew-y-6 overflow-hidden"
        style={{ background: `linear-gradient(90deg, #05060a 0%, ${sp.color} 45%, #05060a 100%)` }}
        initial={{ x: `${from * 110}%` }}
        animate={{ x: '0%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        {/* 速度線 */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.0) 0px, rgba(255,255,255,0.0) 18px, rgba(255,255,255,0.55) 19px, rgba(255,255,255,0) 22px)',
            animation: 'pm-speedlines 0.25s linear infinite',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)]" />
      </motion.div>
      {/* 球拍特寫 */}
      {art && (
        <motion.img
          src={art}
          alt=""
          className={`absolute top-[18%] h-[64%] drop-shadow-[0_0_30px_rgba(255,255,255,0.45)] ${mine ? 'left-[6%]' : 'right-[6%]'}`}
          style={{ aspectRatio: '1 / 2', borderRadius: '42% 42% 18% 18% / 22% 22% 10% 10%' }}
          initial={{ x: from * -300, rotate: mine ? -35 : 35, opacity: 0 }}
          animate={{ x: 0, rotate: mine ? -18 : 18, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.05 }}
        />
      )}
      {/* 招式名 */}
      <div className={`absolute inset-y-0 flex flex-col justify-center ${mine ? 'right-[6%] items-end text-right' : 'left-[6%] items-start text-left'}`}>
        <motion.div
          className="text-xs font-black tracking-[0.4em] text-white/80 md:text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          {mine ? 'YOUR SPECIAL' : 'RIVAL SPECIAL'} · {spec.name}
        </motion.div>
        <motion.div
          className="font-display text-5xl font-black italic leading-none text-white md:text-8xl"
          style={{ textShadow: `0 0 18px ${sp.glow}, 0 0 42px ${sp.color}, 4px 4px 0 #000` }}
          initial={{ scale: 2.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
        >
          {sp.name}
        </motion.div>
        <motion.div
          className="mt-2 text-lg font-black italic tracking-[0.25em] md:text-2xl"
          style={{ color: sp.glow, textShadow: '2px 2px 0 #000' }}
          initial={{ x: from * 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.22 }}
        >
          {sp.title}
        </motion.div>
      </div>
    </motion.div>
  );
};
