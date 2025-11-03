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
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      transitionProperty: {
        fast: 'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow: 'var(--transition-slow)',
      },
    },
  },
  plugins: [],
};
