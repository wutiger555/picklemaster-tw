import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const src = (file: string) => `${base}/game/trailer/${file}`;

/**
 * 首頁的遊戲預覽：實機錄下的對戰畫面（AI 對打、殺球、必殺技）循環播放，整塊點下去就進遊戲。
 * 只放影片不跑 3D，首頁不用下載遊戲素材；影片進到畫面才開始載入，偏好減少動態的使用者只看封面。
 */
const GameTrailerHero = () => {
  const frame = useRef<HTMLAnchorElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const el = frame.current;
    if (!el || !('IntersectionObserver' in window)) {
      setLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!load || !v) return;
    // 影片來源是之後才加的，要重新 load 才會開始抓
    v.load();
    v.play().catch(() => {});
  }, [load]);

  return (
    <Link
      ref={frame}
      to={ROUTES.GAME}
      aria-label="進入匹克球對戰遊戲"
      className="group relative block aspect-[4/3] w-full sm:aspect-video overflow-hidden rounded-3xl bg-neutral-950 shadow-2xl shadow-emerald-900/25 ring-1 ring-neutral-900/10"
    >
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        poster={src('poster.webp')}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
      >
        {load && <source src={src('trailer.webm')} type="video/webm" />}
        {load && <source src={src('trailer.mp4')} type="video/mp4" />}
      </video>

      {/* 上方標籤 */}
      <div className="absolute left-4 top-4 flex items-center gap-2 md:left-6 md:top-6">
        <span className="rounded-full bg-emerald-400 px-3 py-1 text-[11px] font-black tracking-wider text-emerald-950">NEW</span>
        <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-bold tracking-wider text-white/90 backdrop-blur">
          實機遊戲畫面
        </span>
      </div>

      {/* 下方標題與按鈕 */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-12 text-left sm:px-6 sm:pb-6 sm:pt-16 md:px-8 md:pb-7 md:pt-24">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-xl font-black tracking-tight text-white sm:text-2xl md:text-4xl">
              Pickle Master<span className="hidden sm:inline"> 對戰遊戲</span>
            </div>
            <p className="mt-1 hidden text-sm text-white/75 sm:block md:text-base">真實物理、照片選手、殺球攔網與必殺技 —— 打開瀏覽器就能玩</p>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2.5 text-sm font-black text-emerald-950 shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-105 sm:gap-2 sm:px-6 sm:py-3 sm:text-base">
            立即開打
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GameTrailerHero;
