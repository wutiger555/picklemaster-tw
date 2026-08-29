/**
 * PaddleVisual — 依真實拍形與品牌配色程式繪製的球拍示意圖
 * 不使用外部圖片：不會抓錯圖、不會有版權問題、也不會因連結失效而破圖
 * 形狀比例依 USAP 規範：拍面長 + 寬 ≤ 24"，總長 ≤ 17"
 */

import type { Paddle } from '../../data/paddleDatabase';

// 三種拍形的臉部尺寸（SVG 座標，viewBox 140x220）
const SHAPE_GEOMETRY = {
  '寬型 Widebody': { faceW: 96, faceH: 118, faceRx: 40 },
  '混合 Hybrid': { faceW: 88, faceH: 128, faceRx: 36 },
  '長型 Elongated': { faceW: 78, faceH: 140, faceRx: 32 },
} as const;

const isCarbonFace = (face: string) =>
  face.includes('碳纖') || face.includes('Carbon') || face.includes('石墨');

const isKevlarFace = (face: string) => face.includes('Kevlar');

interface PaddleVisualProps {
  paddle: Paddle;
  className?: string;
}

const PaddleVisual = ({ paddle, className = '' }: PaddleVisualProps) => {
  const geo = SHAPE_GEOMETRY[paddle.shape];
  const cx = 70;
  const faceTop = 12;
  const faceBottom = faceTop + geo.faceH;
  const handleW = 18;
  const handleH = 200 - faceBottom - 14;
  const uid = paddle.slug; // 每支拍獨立的 gradient/pattern id，避免多實例衝突

  const carbon = isCarbonFace(paddle.face);
  const kevlar = isKevlarFace(paddle.face);

  return (
    <svg
      viewBox="0 0 140 220"
      className={className}
      role="img"
      aria-label={`${paddle.brand} ${paddle.model} 球拍示意圖（${paddle.shape}）`}
    >
      <defs>
        <linearGradient id={`face-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={paddle.colors.face} />
          <stop offset="100%" stopColor={paddle.colors.face} stopOpacity="0.75" />
        </linearGradient>
        {/* 碳纖 / Kevlar 編織紋理 */}
        <pattern id={`weave-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="transparent" />
          <rect width="4" height="8" fill={kevlar ? paddle.colors.accent : '#ffffff'} opacity={kevlar ? 0.22 : 0.06} />
        </pattern>
        <radialGradient id={`sweet-${uid}`} cx="0.5" cy="0.42" r="0.55">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 拍面 */}
      <rect
        x={cx - geo.faceW / 2}
        y={faceTop}
        width={geo.faceW}
        height={geo.faceH}
        rx={geo.faceRx}
        fill={`url(#face-${uid})`}
      />
      {(carbon || kevlar) && (
        <rect
          x={cx - geo.faceW / 2}
          y={faceTop}
          width={geo.faceW}
          height={geo.faceH}
          rx={geo.faceRx}
          fill={`url(#weave-${uid})`}
        />
      )}
      {/* 甜蜜點光暈 */}
      <rect
        x={cx - geo.faceW / 2}
        y={faceTop}
        width={geo.faceW}
        height={geo.faceH}
        rx={geo.faceRx}
        fill={`url(#sweet-${uid})`}
      />
      {/* 護邊條 */}
      <rect
        x={cx - geo.faceW / 2}
        y={faceTop}
        width={geo.faceW}
        height={geo.faceH}
        rx={geo.faceRx}
        fill="none"
        stroke={paddle.colors.accent}
        strokeWidth="3"
      />

      {/* 品牌線條裝飾 */}
      <line
        x1={cx - geo.faceW / 2 + 14}
        y1={faceTop + geo.faceH * 0.72}
        x2={cx + geo.faceW / 2 - 14}
        y2={faceTop + geo.faceH * 0.72}
        stroke={paddle.colors.accent}
        strokeWidth="2"
        opacity="0.9"
      />
      {/* 品牌名（依長度自動縮小字級，不截斷） */}
      {(() => {
        const name = paddle.brand.replace(' by Selkirk', '').toUpperCase();
        const fontSize = name.length <= 6 ? 16 : name.length <= 9 ? 12 : 9.5;
        return (
          <text
            x={cx}
            y={faceTop + geo.faceH * 0.46}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="900"
            fill="#ffffff"
            opacity="0.92"
            style={{ letterSpacing: '0.05em' }}
          >
            {name}
          </text>
        );
      })()}
      <text
        x={cx}
        y={faceTop + geo.faceH * 0.62}
        textAnchor="middle"
        fontSize="8"
        fontWeight="600"
        fill={paddle.colors.accent}
      >
        {paddle.thickness}
      </text>

      {/* 喉部 */}
      <path
        d={`M ${cx - handleW / 2 - 8} ${faceBottom - 6} Q ${cx} ${faceBottom + 10} ${cx + handleW / 2 + 8} ${faceBottom - 6} L ${cx + handleW / 2} ${faceBottom + 12} L ${cx - handleW / 2} ${faceBottom + 12} Z`}
        fill={paddle.colors.face}
      />

      {/* 握把 */}
      <rect
        x={cx - handleW / 2}
        y={faceBottom + 10}
        width={handleW}
        height={handleH}
        rx={6}
        fill="#2b2b2b"
      />
      {/* 握把纏帶紋 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <line
          key={i}
          x1={cx - handleW / 2 + 2}
          y1={faceBottom + 20 + i * (handleH - 18) / 4}
          x2={cx + handleW / 2 - 2}
          y2={faceBottom + 26 + i * (handleH - 18) / 4}
          stroke="#4a4a4a"
          strokeWidth="2.5"
        />
      ))}
      {/* 底蓋 */}
      <rect
        x={cx - handleW / 2 - 3}
        y={faceBottom + 10 + handleH - 4}
        width={handleW + 6}
        height={8}
        rx={4}
        fill={paddle.colors.accent}
      />
    </svg>
  );
};

export default PaddleVisual;
