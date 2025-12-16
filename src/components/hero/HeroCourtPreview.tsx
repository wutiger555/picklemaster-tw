import { useState, useEffect, Suspense, lazy } from 'react';
import CourtSkeleton from './CourtSkeleton';

// Lazy load the heavy 3D component
const HeroCourt3D = lazy(() => import('./HeroCourt3D'));

const HeroCourtPreview = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Defer loading to reduce initial TBT and improve LCP
    // Wait for 3.5 seconds (after main content is likely loaded and user has oriented)
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
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
