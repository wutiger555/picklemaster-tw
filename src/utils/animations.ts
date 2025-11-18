/**
 * Framer Motion 動畫配置系統
 * 提供可重用的動畫變體和預設配置
 *
 * 使用方式：
 * import { fadeInUp, staggerContainer } from '@/utils/animations';
 * <motion.div variants={fadeInUp} initial="hidden" animate="visible" />
 */

import type { Variants, Transition } from 'framer-motion';

// ========== 緩動函數 ==========

/**
 * 自訂緩動曲線
 */
export const easing = {
  // 標準緩動
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],

  // 彈性緩動（Bounce）
  bounceIn: [0.68, -0.55, 0.265, 1.55],
  bounceOut: [0.34, 1.56, 0.64, 1],

  // 平滑緩動
  smooth: [0.25, 0.1, 0.25, 1],

  // 快速緩動
  sharp: [0.4, 0, 0.6, 1],
} as const;

// ========== 基礎過渡配置 ==========

/**
 * 常用過渡時長
 */
export const transition = {
  // 快速（微交互）
  fast: { duration: 0.2, ease: easing.easeOut } as Transition,

  // 中等（一般動畫）
  medium: { duration: 0.3, ease: easing.easeInOut } as Transition,

  // 慢速（強調動畫）
  slow: { duration: 0.5, ease: easing.easeInOut } as Transition,

  // 彈性（趣味動畫）
  bounce: { duration: 0.4, ease: easing.bounceOut } as Transition,

  // 彈簧（物理動畫）
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  } as Transition,

  // 平滑彈簧
  smoothSpring: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
  } as Transition,
} as const;

// ========== 淡入動畫 ==========

/**
 * 基礎淡入
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transition.medium,
  },
};

/**
 * 淡入向上
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.medium,
  },
};

/**
 * 淡入向下
 */
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.medium,
  },
};

/**
 * 淡入向左
 */
export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition.medium,
  },
};

/**
 * 淡入向右
 */
export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition.medium,
  },
};

// ========== 縮放動畫 ==========

/**
 * 基礎縮放進入
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transition.spring,
  },
};

/**
 * 彈性縮放
 */
export const scaleInBounce: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transition.bounce,
  },
};

/**
 * 縮放脈衝（懸停效果）
 */
export const scalePulse: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: transition.fast,
  },
  tap: {
    scale: 0.95,
    transition: transition.fast,
  },
};

// ========== 滑動動畫 ==========

/**
 * 從左滑入
 */
export const slideInLeft: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transition.medium,
  },
};

/**
 * 從右滑入
 */
export const slideInRight: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transition.medium,
  },
};

// ========== 旋轉動畫 ==========

/**
 * 旋轉淡入
 */
export const rotateIn: Variants = {
  hidden: {
    opacity: 0,
    rotate: -180,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: transition.spring,
  },
};

/**
 * 3D 翻轉（卡片翻轉效果）
 */
export const flipCard: Variants = {
  front: {
    rotateY: 0,
    transition: transition.medium,
  },
  back: {
    rotateY: 180,
    transition: transition.medium,
  },
};

// ========== 容器動畫（Stagger Children） ==========

/**
 * 列表容器（交錯動畫）
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * 快速交錯容器
 */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

/**
 * 列表項目（搭配 staggerContainer）
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.medium,
  },
};

// ========== 懸浮效果 ==========

/**
 * 懸浮上升
 */
export const hoverLift: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
    transition: transition.fast,
  },
};

/**
 * 懸浮發光（霓虹效果）
 */
export const hoverGlow: Variants = {
  rest: {
    boxShadow: '0 0 0 rgba(16, 185, 129, 0)',
  },
  hover: {
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.4)',
    transition: transition.fast,
  },
};

/**
 * 懸浮傾斜（磁性效果）
 */
export const hoverTilt = (strength = 5) => ({
  rest: {
    rotateX: 0,
    rotateY: 0,
  },
  hover: (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * strength;
    const rotateY = ((x - centerX) / centerX) * -strength;

    return {
      rotateX,
      rotateY,
      transition: transition.fast,
    };
  },
});

// ========== Glassmorphism 動畫 ==========

/**
 * 玻璃卡片進入
 */
export const glassCardEnter: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    backdropFilter: 'blur(16px)',
    transition: {
      ...transition.medium,
      backdropFilter: { duration: 0.5 },
    },
  },
};

/**
 * 玻璃卡片懸浮
 */
export const glassCardHover: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    transition: transition.fast,
  },
};

// ========== 頁面過渡 ==========

/**
 * 頁面淡入
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transition.medium,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transition.fast,
  },
};

/**
 * 頁面滑動過渡
 */
export const pageSlideTransition: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: transition.medium,
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: transition.fast,
  },
};

// ========== 特效動畫 ==========

/**
 * 呼吸效果（持續脈衝）
 */
export const breathe: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * 搖晃效果（錯誤提示）
 */
export const shake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

/**
 * 彈跳效果
 */
export const bounce: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: easing.bounceOut,
    },
  },
};

// ========== 視差滾動 ==========

/**
 * 視差背景（基於滾動）
 */
export const parallaxBackground = (speed = 0.5) => ({
  y: [-100 * speed, 100 * speed],
  transition: {
    ease: 'linear',
  },
});

/**
 * 視差元素
 */
export const parallaxElement = (speed = 0.3) => ({
  y: [-50 * speed, 50 * speed],
  transition: {
    ease: 'linear',
  },
});

// ========== 滾動觸發動畫輔助函數 ==========

/**
 * 建立滾動觸發配置（搭配 Intersection Observer）
 */
export const createScrollTrigger = (
  threshold = 0.1,
  rootMargin = '-100px'
) => ({
  viewport: {
    once: true,
    amount: threshold,
    margin: rootMargin,
  },
});

// ========== 預設導出 ==========

export default {
  easing,
  transition,
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInBounce,
  scalePulse,
  slideInLeft,
  slideInRight,
  rotateIn,
  flipCard,
  staggerContainer,
  staggerContainerFast,
  staggerItem,
  hoverLift,
  hoverGlow,
  hoverTilt,
  glassCardEnter,
  glassCardHover,
  pageTransition,
  pageSlideTransition,
  breathe,
  shake,
  bounce,
  parallaxBackground,
  parallaxElement,
  createScrollTrigger,
};
