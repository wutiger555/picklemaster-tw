import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SPECIALS, type PaddleSpec } from './engine/paddles';
import { SKILLS, type SkillId } from './engine/skills';
import { paddleFaceTexture } from './scene/textures';

/** 把球拍拍面貼圖轉成圖片，放進切入畫面 */
const useFaceArt = (spec: PaddleSpec | null) =>
  useMemo(() => {
    if (!spec) return '';
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
export interface CutInInfo {
  id: number;
  /** 球拍必殺：有球拍；角色絕招：有 skill、不顯示球拍 */
  spec: PaddleSpec;
  skill?: SkillId | null;
  /** 無雙覺醒的專屬演出 */
  awaken?: boolean;
  mine: boolean;
  portrait: string | null;
  name: string;
}

/** 覺醒的配色：金色火焰 */
const AWAKEN_LOOK = { name: '無雙覺醒', title: 'MUSOU AWAKENING', color: '#f59e0b', glow: '#fde68a' };

export const CutIn = ({ spec, skill, awaken, mine, portrait, name }: Omit<CutInInfo, 'id'>) => {
  const sp = awaken ? AWAKEN_LOOK : skill ? SKILLS[skill] : SPECIALS[spec.special];
  const art = useFaceArt(skill || awaken ? null : spec);
  const from = mine ? -1 : 1;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      <style>{'@keyframes pm-speedlines{from{background-position:0 0}to{background-position:-88px 0}}@keyframes pm-rays{to{transform:rotate(360deg)}}'}</style>
      {/* 覺醒：整個畫面染成金紅，放射光芒從選手身後轉出來 */}
      {awaken && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(253,230,138,0.35), rgba(220,38,38,0.55) 70%, rgba(69,10,10,0.85))' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[220vmax] w-[220vmax] -translate-x-1/2 -translate-y-1/2 opacity-40"
            style={{
              backgroundImage: 'repeating-conic-gradient(from 0deg, rgba(254,243,199,0.9) 0deg 4deg, transparent 4deg 18deg)',
              animation: 'pm-rays 6s linear infinite',
            }}
          />
        </>
      )}
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
      {/* 選手特寫：去背半身像從側邊衝進來 */}
      {portrait && (
        <motion.img
          src={portrait}
          alt=""
          className={`absolute bottom-0 h-[92%] ${mine ? 'left-[-2%]' : 'right-[-2%]'}`}
          style={{
            filter: `drop-shadow(0 0 24px ${sp.color})`,
            WebkitMaskImage: 'linear-gradient(180deg, #000 72%, transparent 100%)',
            maskImage: 'linear-gradient(180deg, #000 72%, transparent 100%)',
          }}
          initial={{ x: from * -260, opacity: 0, scale: 1.15 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        />
      )}
      {/* 球拍特寫 */}
      {art && (
        <motion.img
          src={art}
          alt=""
          className={`absolute drop-shadow-[0_0_30px_rgba(255,255,255,0.45)] ${portrait ? `top-[30%] h-[46%] ${mine ? 'left-[30%]' : 'right-[30%]'}` : `top-[18%] h-[64%] ${mine ? 'left-[6%]' : 'right-[6%]'}`}`}
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
          {awaken
            ? `${mine ? 'YOUR' : 'RIVAL'} AWAKENING · ${name ? `${name}・` : ''}逆轉開始`
            : `${skill ? (mine ? 'SIGNATURE MOVE' : 'RIVAL SIGNATURE') : mine ? 'YOUR SPECIAL' : 'RIVAL SPECIAL'} · ${name ? `${name}・` : ''}${skill ? '絕招' : spec.name}`}
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
