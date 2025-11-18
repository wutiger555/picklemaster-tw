import designTokens from './src/styles/designTokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 色彩系統 - 導入 Design Tokens
      colors: {
        ...designTokens.colors,
      },

      // 字體家族
      fontFamily: {
        sans: designTokens.fontFamily.sans,
        display: designTokens.fontFamily.display,
        mono: designTokens.fontFamily.mono,
      },

      // 字級系統
      fontSize: {
        ...designTokens.fontSize,
      },

      // 字重
      fontWeight: {
        ...designTokens.fontWeight,
      },

      // 間距系統
      spacing: {
        ...designTokens.spacing,
      },

      // 陰影系統
      boxShadow: {
        ...designTokens.boxShadow,
      },

      // 圓角系統
      borderRadius: {
        ...designTokens.borderRadius,
      },

      // Z-Index
      zIndex: {
        ...designTokens.zIndex,
      },

      // 響應式斷點
      screens: {
        ...designTokens.screens,
      },

      // 動畫系統
      animation: {
        'bounce-slow': 'bounce 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        // 新增進階動畫
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.4)' },
        },
      },

      // Backdrop 模糊
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },

      // 背景圖案
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      },
    },
  },
  plugins: [],
}
