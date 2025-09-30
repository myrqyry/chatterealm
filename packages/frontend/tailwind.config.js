/** @type {import('tailwindcss').Config} */

// Centralized color tokens (moved from src/constants/colors.js)
const colorTokens = {
  primary: '#31748f',
  'primary-container': '#1e40af',
  'on-primary': '#1f1d2e',
  secondary: '#9ccfd8',
  'secondary-container': '#334155',
  'on-secondary': '#1f1d2e',
  surface: '#1f1d2e',
  'surface-variant': '#2a2a3e',
  'on-surface': '#e0def4',
  'on-surface-variant': '#908caa',
  outline: '#6e6a86',
  background: '#191724',
  'on-background': '#e0def4',
  error: '#dc2626',
  'on-error': '#1f1d2e',
  'error-container': '#7f1d1d',
  'on-error-container': '#fef2f2',
  text: {
    primary: '#e0def4',
    secondary: '#908caa',
    tertiary: '#6e6a86',
  },
  health: {
    healthy: '#a3e635',
    wounded: '#fbbf24',
    critical: '#f97316',
    dying: '#dc2626',
  },
  status: {
    active: {
      bg: 'rgba(163, 230, 53, 0.2)',
      text: '#a3e635',
      border: '#84cc16',
    },
    negative: {
      bg: 'rgba(220, 38, 38, 0.2)',
      text: '#dc2626',
      border: '#b91c1c',
    },
  },
  backgroundDark: '#191724',
  backgroundMedium: '#1f1d2e',
  textLight: '#e0def4',
  accentPurple: '#c4a7e7',
  primaryBlue: '#31748f',
  secondaryBlue: '#9ccfd8',
  accentDarkPurple: '#9b59b6',
  legendKnight: '#FFD700',
  legendRogue: '#8B0000',
  legendMage: '#4B0082',
  legendNPC: '#DC143C',
  legendItem: '#F59E0B',
  tabSettings: '#17a2b8',
  healthFillHealthyStart: '#22c55e',
  healthFillHealthyEnd: '#16a34a',
  healthFillWoundedStart: '#fbbf24',
  healthFillWoundedEnd: '#f59e0b',
  healthFillCriticalStart: '#f97316',
  healthFillCriticalEnd: '#ea580c',
  healthFillDyingStart: '#dc2626',
  healthFillDyingEnd: '#b91c1c',
  expFillStart: '#f6c177',
  expFillEnd: '#ebbcba',
  expValue: '#f6c177',
  textLightAlt: '#ecf0f1',
  textMedium: '#bdc3c7',
  borderGray: '#6e6a86',
  textDark: '#908caa',
};

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
