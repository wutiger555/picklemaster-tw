/**
 * GlassCard 組件
 * 玻璃擬態（Glassmorphism）設計風格的卡片組件
 * 支援多種變體、懸浮效果、磁性游標效果
 */

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { glassCardEnter } from '../../utils/animations';

type GlassCardVariant = 'light' | 'medium' | 'dark' | 'primary' | 'secondary' | 'accent';
type GlassCardSize = 'sm' | 'md' | 'lg' | 'xl';

interface GlassCardProps {
  /**
   * 卡片內容
   */
  children: React.ReactNode;

  /**
   * 卡片變體
   * @default 'light'
   */
  variant?: GlassCardVariant;

  /**
   * 卡片尺寸
   * @default 'md'
   */
  size?: GlassCardSize;

  /**
   * 自訂類名
   */
  className?: string;

  /**
   * 是否啟用懸浮效果
   * @default true
   */
  hoverable?: boolean;

  /**
   * 是否啟用磁性游標效果（3D 傾斜）
   * @default false
   */
  magnetic?: boolean;

  /**
   * 磁性效果強度（度數）
   * @default 10
   */
  magneticStrength?: number;

  /**
   * 是否啟用進入動畫
   * @default true
   */
  animated?: boolean;

  /**
   * 點擊事件
   */
  onClick?: () => void;

  /**
   * 是否可點擊（顯示游標指針）
   */
  clickable?: boolean;
}

/**
 * Glassmorphism 卡片組件
 *
 * @example
 * ```tsx
 * <GlassCard variant="primary" magnetic hoverable>
 *   <h3>標題</h3>
 *   <p>內容</p>
 * </GlassCard>
 * ```
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'light',
  size = 'md',
  className = '',
  hoverable = true,
  magnetic = false,
  magneticStrength = 10,
  animated = true,
  onClick,
  clickable = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 磁性效果的 motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 使用彈簧動畫使移動更平滑
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [magneticStrength, -magneticStrength]), {
    stiffness: 300,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-magneticStrength, magneticStrength]), {
    stiffness: 300,
    damping: 20,
  });

  // 處理滑鼠移動（磁性效果）
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!magnetic || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (magnetic) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  // 變體樣式
  const variantStyles: Record<GlassCardVariant, string> = {
    light: 'bg-white/70 border-white/30',
    medium: 'bg-white/50 border-white/20',
    dark: 'bg-neutral-900/50 border-white/10 text-white',
    primary: 'bg-primary-500/20 border-primary-300/30 backdrop-saturate-150',
    secondary: 'bg-secondary-500/20 border-secondary-300/30 backdrop-saturate-150',
    accent: 'bg-accent-500/20 border-accent-300/30 backdrop-saturate-150',
  };

  // 尺寸樣式
  const sizeStyles: Record<GlassCardSize, string> = {
    sm: 'p-4 rounded-lg',
    md: 'p-6 rounded-xl',
    lg: 'p-8 rounded-2xl',
    xl: 'p-10 rounded-3xl',
  };

  // 組合類名
  const cardClassName = `
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    backdrop-blur-xl
    border
    shadow-glass
    transition-all duration-300
    ${hoverable ? 'hover:shadow-glass-lg' : ''}
    ${clickable || onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <motion.div
      ref={cardRef}
      className={cardClassName}
      variants={animated ? glassCardEnter : undefined}
      initial={animated ? 'hidden' : undefined}
      whileInView={animated ? 'visible' : undefined}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={hoverable && !magnetic ? 'hover' : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={
        magnetic
          ? {
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
              perspective: 1000,
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
};

/**
 * 簡化的預設變體
 */

export const GlassCardLight: React.FC<Omit<GlassCardProps, 'variant'>> = (props) => (
  <GlassCard variant="light" {...props} />
);

export const GlassCardMedium: React.FC<Omit<GlassCardProps, 'variant'>> = (props) => (
  <GlassCard variant="medium" {...props} />
);

export const GlassCardDark: React.FC<Omit<GlassCardProps, 'variant'>> = (props) => (
  <GlassCard variant="dark" {...props} />
);

export const GlassCardPrimary: React.FC<Omit<GlassCardProps, 'variant'>> = (props) => (
  <GlassCard variant="primary" {...props} />
);

export const GlassCardSecondary: React.FC<Omit<GlassCardProps, 'variant'>> = (props) => (
  <GlassCard variant="secondary" {...props} />
);

export const GlassCardAccent: React.FC<Omit<GlassCardProps, 'variant'>> = (props) => (
  <GlassCard variant="accent" {...props} />
);

export default GlassCard;
