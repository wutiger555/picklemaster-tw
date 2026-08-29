/**
 * PaddleRadar — 多支球拍性能雷達疊加比較圖
 * 四軸：力量 / 旋轉 / 容錯 / 控球，刻度 60-100（放大實際差異區間）
 */

import { motion } from 'framer-motion';
import type { Paddle } from '../../data/paddleDatabase';

const AXES: { key: keyof Paddle['rating']; label: string }[] = [
  { key: 'power', label: '力量' },
  { key: 'spin', label: '旋轉' },
  { key: 'forgiveness', label: '容錯' },
  { key: 'control', label: '控球' },
];

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = 100;
const MIN = 60; // 刻度下限：所有球拍評分都在 60 以上，從 60 起算差異更明顯

// 四軸方位：上、右、下、左
const axisPoint = (axisIndex: number, r: number): [number, number] => {
  const angle = (Math.PI / 2) * axisIndex - Math.PI / 2;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
};

const valueRadius = (v: number) => ((Math.max(v, MIN) - MIN) / (100 - MIN)) * RADIUS;

const PaddleRadar = ({ paddles, seriesColors }: { paddles: Paddle[]; seriesColors: string[] }) => (
  <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[300px] mx-auto" role="img" aria-label="球拍性能雷達比較圖">
    {/* 背景同心格線 */}
    {[0.25, 0.5, 0.75, 1].map(f => (
      <polygon
        key={f}
        points={AXES.map((_, i) => axisPoint(i, RADIUS * f).join(',')).join(' ')}
        fill={f === 1 ? 'rgba(16,185,129,0.04)' : 'none'}
        stroke="#e5e5e5"
        strokeWidth="1"
      />
    ))}
    {/* 軸線 */}
    {AXES.map((_, i) => {
      const [x, y] = axisPoint(i, RADIUS);
      return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#e5e5e5" strokeWidth="1" />;
    })}
    {/* 軸標籤 */}
    {AXES.map((axis, i) => {
      const [x, y] = axisPoint(i, RADIUS + 20);
      return (
        <text key={axis.key} x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#737373">
          {axis.label}
        </text>
      );
    })}
    {/* 每支球拍的多邊形 */}
    {paddles.map((p, pi) => {
      const points = AXES.map((axis, i) => axisPoint(i, valueRadius(p.rating[axis.key])).join(',')).join(' ');
      const color = seriesColors[pi % seriesColors.length];
      return (
        <motion.g
          key={p.slug}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: pi * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        >
          <polygon points={points} fill={color} fillOpacity="0.14" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
          {AXES.map((axis, i) => {
            const [x, y] = axisPoint(i, valueRadius(p.rating[axis.key]));
            return <circle key={axis.key} cx={x} cy={y} r="3.5" fill={color} />;
          })}
        </motion.g>
      );
    })}
  </svg>
);

export default PaddleRadar;
