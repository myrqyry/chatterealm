// Design System - Centralized styling and layout constants
// This file establishes a cohesive design system for the entire application

import { COLORS } from './tokens';

// Spacing scale (in rem)
export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// Typography scale
export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'Inter, Roboto, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// Border radius scale
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// Shadow scale
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// Layout dimensions
export const LAYOUT = {
  headerHeight: '4rem',
  sidebarWidth: {
    sm: '16rem',    // 256px
    md: '20rem',    // 320px
    lg: '24rem',    // 384px
  },
  maxContentWidth: '90rem', // 1440px
  gameCanvas: {
    maxWidth: 'calc(100vw - 20rem)', // Account for sidebar
    aspectRatio: '16/9',
  },
} as const;

// Animation durations
export const ANIMATION = {
  duration: {
    fast: '150ms',
    standard: '300ms',
    slow: '500ms',
    slower: '750ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  // Legacy flat properties for backwards compatibility
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '750ms',
} as const;

// Z-index scale
export const Z_INDEX = {
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
} as const;

// Common style patterns
export const COMMON_STYLES = {
  // Glass morphism effect
  glass: {
    background: 'rgba(25, 23, 36, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(196, 167, 231, 0.2)',
  },

  // Card styles
  card: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-outline)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },

  // Button base styles
  button: {
    borderRadius: BORDER_RADIUS.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    transition: `all ${ANIMATION.fast} ease`,
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
  },

  // Text shadow effects
  textShadow: {
    neon: '0 0 10px rgba(196, 167, 231, 0.8), 0 0 20px rgba(196, 167, 231, 0.5)',
    glow: '0 0 8px rgba(156, 207, 216, 0.6)',
    subtle: '0 1px 2px rgba(0, 0, 0, 0.3)',
  },

  // Text gradient for titles
  titleGradient: {
    background: 'linear-gradient(135deg, #c4a7e7 0%, #9ccfd8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
} as const;

// Mode-specific styling
export const MODE_STYLES = {
  play: {
    accentColor: COLORS.status.active,
    headerIcon: '🎮',
    description: 'Join the realm and play',
  },
  spectate: {
    accentColor: COLORS.secondary,
    headerIcon: '👁️',
    description: 'Watch ongoing games',
  },
  dev: {
    accentColor: COLORS['on-error'],
    headerIcon: '🛠️',
    description: 'Developer tools & testing',
  },
} as const;

// Responsive breakpoints (in px)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Utility functions for responsive design
export const getResponsiveValue = <T>(values: { sm?: T; md?: T; lg?: T; xl?: T; default: T }): T => {
  if (typeof window === 'undefined') return values.default;

  const width = window.innerWidth;
  if (width >= BREAKPOINTS.xl && values.xl !== undefined) return values.xl;
  if (width >= BREAKPOINTS.lg && values.lg !== undefined) return values.lg;
  if (width >= BREAKPOINTS.md && values.md !== undefined) return values.md;
  if (width >= BREAKPOINTS.sm && values.sm !== undefined) return values.sm;

  return values.default;
};

// CSS custom properties for dynamic theming
export const CSS_VARIABLES = {
  // Layout
  '--header-height': LAYOUT.headerHeight,
  '--sidebar-width': LAYOUT.sidebarWidth.md,
  '--max-content-width': LAYOUT.maxContentWidth,

  // Spacing
  '--spacing-xs': SPACING.xs,
  '--spacing-sm': SPACING.sm,
  '--spacing-md': SPACING.md,
  '--spacing-lg': SPACING.lg,
  '--spacing-xl': SPACING.xl,

  // Typography
  '--font-family-primary': TYPOGRAPHY.fontFamily.primary,
  '--font-family-mono': TYPOGRAPHY.fontFamily.mono,

  // Border radius
  '--border-radius-sm': BORDER_RADIUS.sm,
  '--border-radius-md': BORDER_RADIUS.md,
  '--border-radius-lg': BORDER_RADIUS.lg,
  '--border-radius-xl': BORDER_RADIUS.xl,

  // Shadows
  '--shadow-sm': SHADOWS.sm,
  '--shadow-md': SHADOWS.md,
  '--shadow-lg': SHADOWS.lg,

  // Animation
  '--animation-fast': ANIMATION.fast,
  '--animation-normal': ANIMATION.normal,
  '--animation-slow': ANIMATION.slow,
} as const;

// Material-UI theme overrides for consistency
export const MATERIAL_THEME_OVERRIDES = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: BORDER_RADIUS.md,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
          transition: `all ${ANIMATION.fast} ease`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.sm,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.xl,
          boxShadow: SHADOWS.md,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
} as const;