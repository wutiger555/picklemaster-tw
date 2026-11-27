import { useId } from 'react';
import { avatarColors } from './avatarColors';

// 球拍頭像：依暱稱與種子產生顏色和紋路，不需要上傳照片、也沒有肖像問題

interface Props {
  name: string;
  seed?: number;
  size?: number;
  className?: string;
  title?: string;
}

export default function PaddleAvatar({ name, seed = 0, size = 40, className, title }: Props) {
  const clip = useId();
  const { c1, c2, pattern, initial } = avatarColors(name, seed);
  return (
    <svg viewBox="0 0 40 50" width={size} height={size * 1.25} className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <clipPath id={clip}><rect x="4" y="2" width="32" height="32" rx="13" /></clipPath>
      </defs>
      <rect x="16.5" y="30" width="7" height="17" rx="3.5" fill="#1f2a26" />
      <rect x="16.5" y="40" width="7" height="2" fill="#475a53" />
      <rect x="4" y="2" width="32" height="32" rx="13" fill={c1} />
      <g clipPath={`url(#${clip})`}>
        {pattern === 0 && <path d="M8 22 L30 6 M10 30 L34 12" stroke={c2} strokeWidth="3" opacity=".45" />}
        {pattern === 1 && (
          <g fill={c2} opacity=".35">
            <circle cx="13" cy="10" r="1.6" /><circle cx="20" cy="8" r="1.6" /><circle cx="27" cy="10" r="1.6" />
            <circle cx="11" cy="26" r="1.6" /><circle cx="29" cy="26" r="1.6" />
          </g>
        )}
        {pattern === 2 && <path d="M6 18 H34" stroke={c2} strokeWidth="5" opacity=".35" />}
      </g>
      <rect x="4" y="2" width="32" height="32" rx="13" fill="none" stroke={c2} strokeWidth="2" />
      <text x="20" y="23.5" textAnchor="middle" fontWeight="900" fontSize="15" fill="#fff" style={{ fontFamily: 'inherit' }}>{initial}</text>
    </svg>
  );
}
