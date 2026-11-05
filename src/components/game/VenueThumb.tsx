import type { Venue } from './GameScreens';

/** 場地縮圖：用 SVG 畫，不必另外下載圖 */
export const VenueThumb = ({ venue }: { venue: Exclude<Venue, 'beach'> }) =>
  venue === 'xinyi' ? (
    <svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="160" height="64" fill="#9cc6ea" />
      {/* 台北 101 */}
      <g fill="#5d8c87">
        <rect x="96" y="44" width="16" height="12" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <polygon key={i} points={`${98},${44 - i * 6} ${110},${44 - i * 6} ${112},${38 - i * 6} ${96},${38 - i * 6}`} />
        ))}
        <rect x="101" y="4" width="6" height="4" />
        <rect x="103.4" y="0" width="1.2" height="4" />
      </g>
      <rect x="20" y="30" width="18" height="26" fill="#cfd5d9" />
      <rect x="122" y="26" width="22" height="30" fill="#dfe3e2" />
      <rect y="46" width="160" height="18" fill="#3b6550" />
      <polygon points="40,64 120,64 106,48 54,48" fill="#3f6b56" stroke="#f4f6f8" strokeWidth="1" />
      <line x1="80" y1="48" x2="80" y2="64" stroke="#f4f6f8" strokeWidth="0.8" />
      {/* 防護網鋼管 */}
      <g stroke="#2a2d31" strokeWidth="1.2" fill="none">
        <path d="M4 64 L18 8 L142 8 L156 64" />
        <path d="M18 8 L4 0 M142 8 L156 0 M60 8 L58 0 M100 8 L102 0" />
      </g>
    </svg>
  ) : venue === 'riverside' ? (
    <svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="160" height="64" fill="#a9cdf0" />
      <g fill="#b7c3cc">
        <rect x="8" y="14" width="10" height="16" />
        <rect x="22" y="10" width="8" height="20" />
        <rect x="120" y="12" width="12" height="18" />
        <rect x="138" y="16" width="9" height="14" />
      </g>
      <rect y="26" width="160" height="8" fill="#4b7a3b" />
      <rect y="32" width="160" height="32" fill="#3d7a4e" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <polygon points={`${8 + i * 38},64 ${40 + i * 38},64 ${36 + i * 38},40 ${14 + i * 38},40`} fill="#2f5fae" stroke="#f4f6f8" strokeWidth="0.8" />
          <polygon points={`${11 + i * 38},55 ${38 + i * 38},55 ${37 + i * 38},49 ${12 + i * 38},49`} fill="#4d9be0" />
        </g>
      ))}
      <g stroke="#c7cbcd" strokeWidth="1.2">
        <line x1="4" y1="64" x2="6" y2="14" />
        <line x1="156" y1="64" x2="154" y2="14" />
      </g>
    </svg>
  ) : venue === 'arena' ? (
    <svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="vt-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#02040c" />
          <stop offset="1" stopColor="#1d2f5c" />
        </linearGradient>
        <radialGradient id="vt-spot">
          <stop offset="0" stopColor="#fff4d6" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="64" fill="url(#vt-night)" />
      <circle cx="22" cy="10" r="16" fill="url(#vt-spot)" />
      <circle cx="138" cy="10" r="16" fill="url(#vt-spot)" />
      <rect x="0" y="30" width="160" height="10" fill="#1a2333" />
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={4 + i * 6} cy={33 + (i % 3) * 2} r="1.6" fill={['#b91c1c', '#ca8a04', '#0e7490', '#e5e7eb'][i % 4]} />
      ))}
      <rect x="0" y="40" width="160" height="4" fill="#34d399" opacity="0.85" />
      <polygon points="44,44 116,44 140,64 20,64" fill="#24604a" />
      <polygon points="56,46 104,46 120,64 40,64" fill="#1f4f9a" stroke="#f7f9fc" strokeWidth="0.8" />
      <line x1="47" y1="54" x2="113" y2="54" stroke="#f7f9fc" strokeWidth="0.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="vt-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f6fc4" />
          <stop offset="1" stopColor="#d9e9f5" />
        </linearGradient>
      </defs>
      <rect width="160" height="64" fill="url(#vt-day)" />
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="40" cy="14" rx="16" ry="5" />
        <ellipse cx="50" cy="11" rx="9" ry="5" />
        <ellipse cx="118" cy="20" rx="18" ry="4.5" />
        <ellipse cx="126" cy="17" rx="8" ry="4" />
      </g>
      <rect x="6" y="26" width="30" height="16" fill="#eef0ee" />
      <rect x="10" y="22" width="9" height="20" rx="4" fill="#f5f6f3" />
      {[44, 52, 60].map((x) => (
        <g key={x}>
          <line x1={x} y1="42" x2={x} y2="14" stroke="#b8b4aa" strokeWidth="1.2" />
          <path d={`M${x - 7} 17 Q${x} 9 ${x + 7} 17 M${x - 6} 13 Q${x} 16 ${x + 6} 13`} stroke="#4f7d36" strokeWidth="2" fill="none" />
        </g>
      ))}
      <circle cx="132" cy="34" r="12" fill="#4a7a34" />
      <circle cx="146" cy="38" r="9" fill="#3f6a2e" />
      <rect x="0" y="40" width="160" height="24" fill="#6f9a45" />
      <rect x="76" y="20" width="3" height="22" fill="#f1f2ef" />
      <ellipse cx="77.5" cy="20" rx="11" ry="2.4" fill="#f1f2ef" />
      <rect x="0" y="42" width="160" height="3" fill="#4f7f35" />
      <polygon points="30,45 130,45 154,64 6,64" fill="#4f7a62" />
      <polygon points="56,46 104,46 120,64 40,64" fill="none" stroke="#f2c230" strokeWidth="0.9" />
      <line x1="47" y1="54" x2="113" y2="54" stroke="#f2c230" strokeWidth="0.9" />
      <line x1="12" y1="52" x2="148" y2="52" stroke="#f5f7f2" strokeWidth="0.5" opacity="0.8" />
    </svg>
  );
