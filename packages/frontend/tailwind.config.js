/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        // Health colors
        'health-healthy': '#a3e635',
        'health-wounded': '#fbbf24',
        'health-critical': '#f97316',
        'health-dying': '#dc2626',
        // Status colors
        'status-active': {
          bg: 'rgba(163, 230, 53, 0.2)',
          text: '#a3e635',
          border: '#84cc16',
        },
        'status-negative': {
          bg: 'rgba(220, 38, 38, 0.2)',
          text: '#dc2626',
          border: '#b91c1c',
        },
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
}
