import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import CourtSkeleton from './CourtSkeleton';

// Lazy load the heavy 3D component
const HeroCourt3D = lazy(() => import('./HeroCourt3D'));

const HeroCourtPreview = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleHandleRef = useRef<number | null>(null);

  useEffect(() => {
    // Strategy: load 3D only when (a) browser is idle AND (b) hero is in viewport
    // This dramatically reduces initial JS load without changing visuals

    let observer: IntersectionObserver | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const triggerLoad = () => setShouldLoad(true);

    const scheduleIdleLoad = () => {
      // Use requestIdleCallback if available (Chrome/Edge/Firefox), else setTimeout
      const win = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (typeof win.requestIdleCallback === 'function') {
        idleHandleRef.current = win.requestIdleCallback(triggerLoad, { timeout: 4000 });
      } else {
        timeoutId = setTimeout(triggerLoad, 2500);
      }
    };

    if (!containerRef.current) return;

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            scheduleIdleLoad();
            observer?.disconnect();
          }
        },
        { rootMargin: '200px' } // start loading 200px before scrolling into view
      );
      observer.observe(containerRef.current);
    } else {
      scheduleIdleLoad();
    }

    return () => {
      observer?.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      if (idleHandleRef.current !== null) {
        const win = window as Window & { cancelIdleCallback?: (id: number) => void };
        win.cancelIdleCallback?.(idleHandleRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setShouldLoad(true)}
      role="button"
      tabIndex={0}
      aria-label="載入3D球場預覽"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setShouldLoad(true);
        }
      }}
    >
      {/* Always keep the skeleton as a background/fallback until 3D covers it */}
      {(!shouldLoad) && (
        <div className="absolute inset-0 z-10 cursor-pointer">
          <CourtSkeleton />

          {/* Interactive hint overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold text-sm border border-white/20 shadow-xl flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              點擊立即載入 3D 視圖
            </div>
          </div>
        </div>
      )}

      {shouldLoad && (
        <Suspense fallback={<CourtSkeleton />}>
          <HeroCourt3D />
        </Suspense>
      )}
    </div>
  );
};

export default HeroCourtPreview;
