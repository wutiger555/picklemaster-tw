import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from '../../hooks/useInView';
import type { CameraView, DemoClock, StrokeDemoConfig } from './strokeConfig';

const StrokeScene = lazy(() => import('./StrokeScene'));

const VIEW_LABEL: Record<CameraView, string> = { side: '側面', front: '正面', back: '背後', top: '俯視' };
const SPEEDS = [0.25, 0.5, 1];

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

/** 目前在哪個階段：最後一個已經走到的章節 */
const chapterAt = (cfg: StrokeDemoConfig, u: number) => {
  let i = 0;
  cfg.chapters.forEach((c, k) => {
    if (u >= c.t - 0.02) i = k;
  });
  return i;
};

const StrokeDemo = ({ cfg }: { cfg: StrokeDemoConfig }) => {
  // 捲到附近才載 3D（約 1 MB 的選手模型）；離開畫面就停止繪製
  const { ref: near, inView: load } = useInView<HTMLDivElement>({ rootMargin: '300px', once: true });
  const { ref: box, inView: visible } = useInView<HTMLDivElement>({ threshold: 0.05, once: false });
  const [webgl, setWebgl] = useState(true);
  const [ready, setReady] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const reduce = useMemo(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);
  const clock = useRef<DemoClock>({ u: cfg.from, playing: !reduce, speed: 0.25, view: cfg.view, viewNonce: 0, loop: 0 }).current;
  const [playing, setPlaying] = useState(clock.playing);
  const [speed, setSpeed] = useState(clock.speed);
  const [view, setView] = useState<CameraView>(cfg.view);
  const [chapter, setChapter] = useState(reduce ? cfg.chapters.length - 2 : 0);
  const scrub = useRef<HTMLInputElement>(null);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    setWebgl(hasWebGL());
    setCoarse(!!window.matchMedia?.('(pointer: coarse)').matches);
    if (reduce) clock.u = cfg.chapters[cfg.chapters.length - 2].t;
  }, [clock, cfg, reduce]);

  // 時間軸與目前階段跟著時鐘走（直接改 DOM，不每幀重繪 React）
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      if (scrub.current && document.activeElement !== scrub.current) scrub.current.value = String(clock.u);
      const c = chapterAt(cfg, clock.u);
      if (c !== last) {
        last = c;
        setChapter(c);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, clock, cfg]);

  const play = (p: boolean) => {
    clock.playing = p;
    setPlaying(p);
  };
  const jump = (k: number) => {
    clock.u = cfg.chapters[k].t;
    setChapter(k);
    play(false);
  };
  const pickView = (v: CameraView) => {
    clock.view = v;
    clock.viewNonce++;
    setView(v);
  };
  const ch = cfg.chapters[chapter];
  const span = cfg.to - cfg.from;

  return (
    <div ref={near}>
      <div ref={box} className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d1f1a] via-[#10261f] to-slate-900 aspect-[4/5] sm:aspect-[16/10] shadow-xl shadow-emerald-950/20">
        {load && webgl && (
          <Suspense fallback={null}>
            <StrokeScene cfg={cfg} clock={clock} active={visible} orbit={!coarse} onReady={onReady} />
          </Suspense>
        )}

        {/* 載入中／不支援 3D */}
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            {webgl ? (
              <>
                <div className="w-10 h-10 rounded-full border-[3px] border-emerald-400/25 border-t-emerald-400 animate-spin mb-4" />
                <div className="text-emerald-100 font-semibold">3D 選手熱身中…</div>
                <div className="text-emerald-200/50 text-xs mt-1">第一次載入約 1 MB</div>
              </>
            ) : (
              <div className="text-emerald-100 text-sm leading-relaxed max-w-xs">這台裝置的瀏覽器不支援 3D 繪圖（WebGL），請直接參考下方的步驟分解。</div>
            )}
          </div>
        )}

        {ready && (
          <>
            {/* 目前階段 */}
            <div className="absolute left-3 top-3 right-3 sm:right-auto sm:max-w-xs pointer-events-none">
              <div className="rounded-xl bg-black/45 backdrop-blur-md border border-white/10 px-3.5 py-2.5 text-white">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 text-[11px] font-black flex items-center justify-center">{chapter + 1}</span>
                  <span className="font-bold">{ch.label}</span>
                </div>
                <p className="text-[13px] text-white/80 leading-snug mt-1">{ch.note}</p>
              </div>
            </div>

            {/* 視角 */}
            <div className="absolute right-3 bottom-[4.5rem] sm:top-3 sm:bottom-auto flex sm:flex-col gap-1 rounded-xl bg-black/45 backdrop-blur-md border border-white/10 p-1" role="group" aria-label="視角">
              {(Object.keys(VIEW_LABEL) as CameraView[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => pickView(v)}
                  aria-pressed={view === v}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${view === v ? 'bg-white text-neutral-900' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
                >
                  {VIEW_LABEL[v]}
                </button>
              ))}
            </div>

            {/* 播放列 */}
            <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/45 backdrop-blur-md border border-white/10 px-3 py-2 flex items-center gap-3 text-white">
              <button
                type="button"
                onClick={() => play(!playing)}
                aria-label={playing ? '暫停' : '播放'}
                className="w-8 h-8 flex-shrink-0 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center hover:bg-emerald-300 transition-colors"
              >
                {playing ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                    <rect x="2" y="1" width="3" height="10" rx="1" fill="currentColor" />
                    <rect x="7" y="1" width="3" height="10" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                    <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" />
                  </svg>
                )}
              </button>
              <div className="relative flex-1 h-8 flex items-center">
                {cfg.chapters.map((c, k) => (
                  <span
                    key={c.label}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${k <= chapter ? 'bg-emerald-300' : 'bg-white/40'}`}
                    style={{ left: `${((c.t - cfg.from) / span) * 100}%` }}
                  />
                ))}
                <input
                  ref={scrub}
                  type="range"
                  min={cfg.from}
                  max={cfg.to}
                  step={0.005}
                  defaultValue={clock.u}
                  aria-label="時間軸"
                  onPointerDown={() => play(false)}
                  onChange={(e) => {
                    clock.u = +e.target.value;
                    play(false);
                  }}
                  className="relative w-full accent-emerald-400 cursor-pointer"
                />
              </div>
              <div className="flex gap-0.5 flex-shrink-0" role="group" aria-label="播放速度">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      clock.speed = s;
                      setSpeed(s);
                      if (!playing) play(true);
                    }}
                    aria-pressed={speed === s}
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums transition-colors ${speed === s ? 'bg-white text-neutral-900' : 'text-white/70 hover:text-white'}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 階段：對照下方的步驟分解，點了就定格在那個瞬間 */}
      <ol className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {cfg.chapters.map((c, k) => (
          <li key={c.label}>
            <button
              type="button"
              onClick={() => jump(k)}
              className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${
                k === chapter ? 'border-emerald-400 bg-emerald-50 shadow-sm' : 'border-neutral-100 bg-white hover:border-emerald-200'
              }`}
            >
              <div className={`text-xs font-black tabular-nums ${k === chapter ? 'text-emerald-600' : 'text-neutral-300'}`}>0{k + 1}</div>
              <div className="text-sm font-bold text-neutral-800">{c.label}</div>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
        {coarse ? '點視角按鈕切換角度' : '拖曳畫面可以自由旋轉、滾輪縮放'}；點上方任一階段會定格在那個瞬間。綠色線是拍面甜區的揮拍軌跡，黃圈是擊球點。
        選手動作由本站匹克球遊戲的姿勢解算產生（有關節角度限制），示範的是動作要領，不是特定選手的動作。
      </p>
    </div>
  );
};

export default StrokeDemo;
