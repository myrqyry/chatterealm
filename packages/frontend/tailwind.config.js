/** @type {import('tailwindcss').Config} */

// Centralized color tokens (moved from src/constants/colors.js)
const { colorTokens } = require('../../shared/src/constants/colorConstants.ts');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Keep the original tokens for static references
        ...colorTokens,
        // Add aliases that map to CSS variables so Tailwind utilities can use runtime theme values
        'background-primary': 'var(--color-background-primary)',
        'background-secondary': 'var(--color-background-secondary)',
        'background-tertiary': 'var(--color-background-tertiary)',
        'surface': 'var(--color-surface)',
        'surface-variant': 'var(--color-surface-variant)',

        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',

        'primary': 'var(--color-primary)',
        'primary-container': 'var(--color-primary-container)',
        'on-primary': 'var(--color-on-primary)',

        'secondary': 'var(--color-secondary)',
        'secondary-container': 'var(--color-secondary-container)',
        'on-secondary': 'var(--color-on-secondary)',

        'tertiary': 'var(--color-tertiary)',
        'tertiary-container': 'var(--color-tertiary-container)',

        'error': 'var(--color-error)',
        'error-container': 'var(--color-error-container)',

        'success': 'var(--color-success)',
        'success-container': 'var(--color-success-container)',

        'warning': 'var(--color-warning)',
        'warning-container': 'var(--color-warning-container)',

        'outline': 'var(--color-outline)',

        'legend-knight': 'var(--color-legend-knight)',
        'legend-rogue': 'var(--color-legend-rogue)',
        'legend-mage': 'var(--color-legend-mage)',
        'legend-npc': 'var(--color-legend-npc)',
        'legend-item': 'var(--color-legend-item)',

        // Health and status
        'health-healthy': 'var(--color-health-healthy)',
        'health-wounded': 'var(--color-health-wounded)',
        'health-critical': 'var(--color-health-critical)',
        'health-dying': 'var(--color-health-dying)',

        'status-active-bg': 'var(--color-status-active-bg)',
        'status-active-text': 'var(--color-status-active-text)',
        'status-active-border': 'var(--color-status-active-border)',
        'status-negative-bg': 'var(--color-status-negative-bg)',
        'status-negative-text': 'var(--color-status-negative-text)',
        'status-negative-border': 'var(--color-status-negative-border)',

        // Material 3 Primary Palette
        'm3-primary': {
          40: '#006C54',
          50: '#007E62',
          60: '#00906E',
          70: '#00A37A',
          80: '#00B786',
          90: '#00CB92',
          100: '#00DF9D'
        },

        // Material 3 Surface Colors
        'm3-surface': {
          1: '#F8F9FA',
          2: '#F1F3F4',
          3: '#E9ECEF',
          4: '#E2E6E9',
          5: '#DDE2E6'
        },

        // Material 3 Elevation System
        'm3-elevation': {
          0: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
          1: '0px 1px 2px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12), 0px 1px 3px 0px rgba(0, 0, 0, 0.20)',
          2: '0px 2px 4px -1px rgba(0, 0, 0, 0.14), 0px 4px 5px 0px rgba(0, 0, 0, 0.12), 0px 1px 10px 0px rgba(0, 0, 0, 0.20)',
          3: '0px 3px 5px -1px rgba(0, 0, 0, 0.14), 0px 5px 8px 0px rgba(0, 0, 0, 0.12), 0px 1px 14px 0px rgba(0, 0, 0, 0.20)',
          4: '0px 4px 5px -2px rgba(0, 0, 0, 0.14), 0px 6px 10px 0px rgba(0, 0, 0, 0.12), 0px 2px 16px 0px rgba(0, 0, 0, 0.20)',
          5: '0px 5px 8px -3px rgba(0, 0, 0, 0.14), 0px 7px 10px 0px rgba(0, 0, 0, 0.12), 0px 4px 18px 0px rgba(0, 0, 0, 0.20)'
        }
      },
      fontFamily: {
        'jetbrains': ['JetBrains Mono', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        // Material 3 Compact Spacing
        '0.5': '0.125rem', // 2px
        '1.5': '0.375rem', // 6px
        '2.5': '0.625rem', // 10px
        '3.5': '0.875rem', // 14px
        '4.5': '1.125rem', // 18px
        '5.5': '1.375rem', // 22px
        '6.5': '1.625rem', // 26px
        '7.5': '1.875rem', // 30px
        '8.5': '2.125rem', // 34px
        '9.5': '2.375rem', // 38px
        '10.5': '2.625rem', // 42px
        '11.5': '2.875rem', // 46px
        '12.5': '3.125rem', // 50px
        '13.5': '3.375rem', // 54px
        '14.5': '3.625rem', // 58px
        '15.5': '3.875rem', // 62px
        '16.5': '4.125rem', // 66px
        '17.5': '4.375rem', // 70px
        '18.5': '4.625rem', // 74px
        '19.5': '4.875rem', // 78px
        '20.5': '5.125rem', // 82px
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
        // Material 3 Radius
        'm3-sm': '0.125rem', // 2px
        'm3-md': '0.25rem', // 4px
        'm3-lg': '0.375rem', // 6px
        'm3-xl': '0.5rem', // 8px
        'm3-full': '100rem'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        // Material 3 Elevation Shadows
        'm3-1': '0px 1px 2px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12), 0px 1px 3px 0px rgba(0, 0, 0, 0.20)',
        'm3-2': '0px 2px 4px -1px rgba(0, 0, 0, 0.14), 0px 4px 5px 0px rgba(0, 0, 0, 0.12), 0px 1px 10px 0px rgba(0, 0, 0, 0.20)',
        'm3-3': '0px 3px 5px -1px rgba(0, 0, 0, 0.14), 0px 5px 8px 0px rgba(0, 0, 0, 0.12), 0px 1px 14px 0px rgba(0, 0, 0, 0.20)',
        'm3-4': '0px 4px 5px -2px rgba(0, 0, 0, 0.14), 0px 6px 10px 0px rgba(0, 0, 0, 0.12), 0px 2px 16px 0px rgba(0, 0, 0, 0.20)',
        'm3-5': '0px 5px 8px -3px rgba(0, 0, 0, 0.14), 0px 7px 10px 0px rgba(0, 0, 0, 0.12), 0px 4px 18px 0px rgba(0, 0, 0, 0.20)'
      },
      transitionProperty: {
        fast: 'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow: 'var(--transition-slow)',
        // Material 3 Transition Timings
        'm3-fast': '50ms',
        'm3-normal': '100ms',
        'm3-slow': '150ms',
        'm3-extra-slow': '200ms'
      },
      // Material 3 Animation Utilities
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'm3-fade-in': 'm3FadeIn 100ms ease-in-out',
        'm3-fade-out': 'm3FadeOut 100ms ease-in-out',
        'm3-slide-up': 'm3SlideUp 150ms cubic-bezier(0.2, 0, 0, 1)',
        'm3-slide-down': 'm3SlideDown 150ms cubic-bezier(0.2, 0, 0, 1)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        m3FadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        m3FadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        m3SlideUp: {
          '0%': { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        m3SlideDown: {
          '0%': { transform: 'translateY(-4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};