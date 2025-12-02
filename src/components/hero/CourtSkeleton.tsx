const CourtSkeleton = () => {
  return (
    <div className="w-full h-64 md:h-80 relative overflow-hidden rounded-xl shadow-2xl transform rotate-x-12 perspective-1000">
      {/* Court Base */}
      <div className="absolute inset-0 bg-emerald-700 flex items-center justify-center transform skew-x-[-10deg] scale-90">
        <div className="w-[80%] h-[60%] border-2 border-white/80 relative">
            {/* Kitchen Line Top */}
            <div className="absolute top-[30%] left-0 right-0 h-0.5 bg-white/80"></div>
            {/* Kitchen Line Bottom */}
            <div className="absolute bottom-[30%] left-0 right-0 h-0.5 bg-white/80"></div>
            
            {/* Center Line Top */}
            <div className="absolute top-0 left-1/2 bottom-[70%] w-0.5 bg-white/80 -translate-x-1/2"></div>
            {/* Center Line Bottom */}
            <div className="absolute top-[70%] left-1/2 bottom-0 w-0.5 bg-white/80 -translate-x-1/2"></div>

            {/* Net (Visual Approximation) */}
            <div className="absolute top-1/2 left-[-10%] right-[-10%] h-4 bg-neutral-800/50 -translate-y-1/2 blur-[1px]"></div>
            <div className="absolute top-1/2 left-[-10%] right-[-10%] h-1 bg-white -translate-y-1/2 shadow-lg"></div>
        </div>
      </div>
      
      {/* Loading Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
      
      <div className="absolute bottom-4 right-4 text-white/60 text-xs font-mono">
        Loading 3D View...
      </div>
    </div>
  );
};

export default CourtSkeleton;
