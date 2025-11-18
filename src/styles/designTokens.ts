/**
 * Design Tokens System
 * 設計系統核心配置 - 色彩、字體、間距、陰影等
 *
 * 遵循現代化設計原則：
 * - 大膽色塊與銳利對比
 * - 專業色階系統
 * - 清晰的視覺層級
 */

// ========== 色彩系統 ==========

/**
 * 主色系統 - 匹克球專屬色
 * 使用更大膽的色彩對比，減少柔和漸層
 */
export const colors = {
  // 主色：匹克球綠（更大膽的綠色）
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',  // 主要使用
    600: '#059669',  // 深色變體
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  // 次色：專業藍（運動科技感）
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 主要使用
    600: '#2563eb',  // 深色變體
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // 輔色：警示橘紅（行動召喚）
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // 主要使用
    600: '#ea580c',  // 深色變體
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  // 中性灰階（專業黑白灰系統）
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
    1000: '#000000',
  },

  // 語義色彩
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // 保留原有的品牌色（向後相容）
  pickleball: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  sport: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  court: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
};

// ========== 字體系統 ==========

/**
 * 字體家族
 * 建立清晰的字體層級系統
 */
export const fontFamily = {
  // 主要字體（系統字體棧）
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    '"Noto Sans"',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"',
  ],

  // 粗黑體（標題專用 - 力量感）
  display: [
    '"Inter"',
    '"SF Pro Display"',
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif',
  ],

  // 等寬字體（數據、統計、代碼）
  mono: [
    '"Fira Code"',
    '"JetBrains Mono"',
    '"SF Mono"',
    'Monaco',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace',
  ],
};

/**
 * 字級層級（Type Scale）
 * display > heading > body > caption
 */
export const fontSize = {
  // Display - 超大標題（Hero Section）
  'display-2xl': ['4.5rem', { lineHeight: '1', fontWeight: '900' }],  // 72px
  'display-xl': ['3.75rem', { lineHeight: '1', fontWeight: '900' }],  // 60px
  'display-lg': ['3rem', { lineHeight: '1.1', fontWeight: '800' }],   // 48px
  'display-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '800' }], // 36px
  'display-sm': ['1.875rem', { lineHeight: '1.2', fontWeight: '800' }], // 30px

  // Heading - 標題
  'heading-xl': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],  // 24px
  'heading-lg': ['1.25rem', { lineHeight: '1.4', fontWeight: '700' }], // 20px
  'heading-md': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }], // 18px
  'heading-sm': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],    // 16px

  // Body - 內文
  'body-xl': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],  // 18px
  'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],      // 16px
  'body-md': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],  // 14px
  'body-sm': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }], // 13px

  // Caption - 小字說明
  'caption-lg': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }], // 12px
  'caption-md': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }], // 11px
  'caption-sm': ['0.625rem', { lineHeight: '1.4', fontWeight: '500' }],  // 10px
};

/**
 * 字重層級
 */
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// ========== 間距系統 ==========

/**
 * 間距尺度（8px 基準）
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

// ========== 陰影系統 ==========

/**
 * 陰影層級（深度系統）
 * 從微妙到強烈的陰影效果
 */
export const boxShadow = {
  // 微妙陰影
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Glassmorphism 專用陰影
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',

  // 霓虹發光效果
  'neon-primary': '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)',
  'neon-secondary': '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
  'neon-accent': '0 0 20px rgba(249, 115, 22, 0.5), 0 0 40px rgba(249, 115, 22, 0.3)',

  // 懸浮效果（Elevated）
  'elevated-sm': '0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.08)',
  'elevated-md': '0 4px 16px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.1)',
  'elevated-lg': '0 8px 24px rgba(0, 0, 0, 0.12), 0 16px 48px rgba(0, 0, 0, 0.12)',

  // 內陰影
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // 無陰影
  none: 'none',
};

// ========== 圓角系統 ==========

/**
 * 邊角半徑
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

// ========== 動畫時間 ==========

/**
 * 動畫持續時間和緩動函數
 */
export const animation = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    // 彈性動畫
    'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// ========== Z-Index 層級 ==========

/**
 * 堆疊順序
 */
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  // 語義層級
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  'modal-backdrop': '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
};

// ========== 斷點系統 ==========

/**
 * 響應式斷點
 */
export const screens = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ========== Glassmorphism 預設值 ==========

/**
 * 玻璃擬態效果的預設配置
 */
export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: boxShadow.glass,
  },

  medium: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: boxShadow['glass-lg'],
  },

  dark: {
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: boxShadow['glass-lg'],
  },
};

export default {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  boxShadow,
  borderRadius,
  animation,
  zIndex,
  screens,
  glassmorphism,
};
