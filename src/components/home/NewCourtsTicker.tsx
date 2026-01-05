import { useEffect, useState, useRef } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

interface Court {
  id: number;
  name: string;
  location: {
    city: string;
    district: string;
    address: string;
  };
  type: 'indoor' | 'outdoor' | 'covered';
  is_new?: boolean;
}

const NewCourtsTicker = () => {
  const [newCourts, setNewCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use import.meta.env.BASE_URL to handle subdirectory deployments (e.g. GitHub Pages)
    // or relative path if the file structure guarantees it.
    // Since this component is deep in src, using root-relative path is safest if BASE_URL is handled by Vite.
    const baseUrl = import.meta.env.BASE_URL || '/';
    // Ensure baseUrl ends with /
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    fetch(`${cleanBaseUrl}data/courts.json`)
      .then(res => res.json())
      .then(data => {
        const newer = data.courts.filter((c: Court) => c.is_new);
        setNewCourts(newer);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch courts data", err);
        setLoading(false);
      });
  }, []);

  if (loading || newCourts.length === 0) return null;

  // Duplicate the array to ensure smooth infinite scroll
  // We use 4 copies to ensure we have enough content to scroll seamlessly even on wide screens
  const tickerContent = [...newCourts, ...newCourts, ...newCourts, ...newCourts];

  return (
    <div className="relative bg-neutral-900 text-white overflow-hidden border-y border-white/10 h-12 flex items-center">
      {/* Label Badge - Absolute positioned to stay on top */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-gradient-to-r from-accent-600 to-accent-500 pl-4 pr-8 flex items-center shadow-[4px_0_24px_rgba(0,0,0,0.5)] clip-path-slant">
        <span className="flex items-center gap-2 font-bold tracking-wider text-sm whitespace-nowrap z-10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          新球場快訊
        </span>
        {/* Slanted edge effect created by CSS clip-path or overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-accent-500 to-transparent translate-x-full"></div>
      </div>

      {/* SVG for the slanted clip path is hard to do cleanly without extra markup,
          so we used a simpler gradient overlay approach in previous version.
          Here we refine the overlay to be cleaner. */}

      {/* Scrolling Content Container */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center pl-36 md:pl-44" ref={containerRef}>
        <m.div
          className="flex items-center gap-12 whitespace-nowrap"
          // We animate x from 0% to -50% because we doubled the content (twice, so 4x total).
          // Actually, simply translating -100% of the *original* set (1/4 of total width) is tricky without knowing width.
          // The standard technique for seamless loop with Framer Motion:
          // Animate x from "0%" to "-50%" of the container IF the container holds 2 copies of the full list.
          // Here we have tickerContent which is 4 copies.
          // Let's assume the content is long enough.
          // A safer simple way: CSS animation or specific percentages if we know the width.
          // Since we don't know the pixel width, using percentage of the *element itself* is best.
          // x: ["0%", "-50%"] assumes the element contains two identical halves and we scroll one half length.
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: Math.max(20, newCourts.length * 5), // Adaptive duration based on item count
              ease: "linear",
            },
          }}
        >
          {tickerContent.map((court, idx) => (
            <Link
              key={`${court.id}-${idx}`}
              to={`${ROUTES.COURTS}?id=${court.id}`}
              className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group flex-shrink-0"
            >
              <span className="text-lg">📍</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm group-hover:text-accent-300 transition-colors">
                  {court.name}
                </span>
                <span className="text-[10px] md:text-xs px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-neutral-300">
                  {court.location.city}
                </span>
              </div>
            </Link>
          ))}
        </m.div>
      </div>

      {/* Gradient Fade on Right */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-neutral-900 to-transparent z-20 pointer-events-none"></div>
    </div>
  );
};

export default NewCourtsTicker;
