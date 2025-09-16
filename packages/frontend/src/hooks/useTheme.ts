import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Theme } from 'shared';
import { COLORS } from '../utils/tokens';

// Build theme color objects from centralized Tailwind tokens (COLORS).
// This keeps a single source of truth for palette values and ensures
// components using CSS variables stay in sync with Tailwind tokens.
const getNightThemeColors = () => ({
  '--color-background-primary': COLORS.backgroundDark || COLORS.background || '#0a0a14',
  '--color-background-secondary': COLORS.backgroundMedium || '#111122',
  '--color-background-tertiary': COLORS.backgroundDark || '#0f0f1a',
  '--color-surface': COLORS.surface || '#141428',
  '--color-surface-variant': COLORS['surface-variant'] || '#1a1a2e',

  '--color-text-primary': (COLORS.text && COLORS.text.primary) || '#e2e8f0',
  '--color-text-secondary': (COLORS.text && COLORS.text.secondary) || '#cbd5e1',
  '--color-text-tertiary': (COLORS.text && COLORS.text.tertiary) || '#94a3b8',
  '--color-text-on-surface': (COLORS.text && COLORS.text.primary) || '#e2e8f0',

  '--color-primary': COLORS.primaryBlue || COLORS.primary || '#60a5fa',
  '--color-primary-container': COLORS['primary-container'] || COLORS['primary-container'] || '#1e3a8a',
  '--color-on-primary': COLORS['on-primary'] || '#0f172a',
  '--color-on-primary-container': COLORS['on-primary'] || '#dbeafe',

  '--color-secondary': COLORS.secondaryBlue || COLORS.secondary || '#64748b',
  '--color-secondary-container': COLORS['secondary-container'] || '#334155',
  '--color-on-secondary': COLORS['on-secondary'] || '#0f172a',
  '--color-on-secondary-container': COLORS['on-secondary'] || '#f1f5f9',

  '--color-tertiary': COLORS.accentPurple || COLORS['accentPurple'] || '#a78bfa',
  '--color-tertiary-container': COLORS['tertiary-container'] || '#3730a3',
  '--color-on-tertiary': COLORS['on-tertiary'] || '#0f172a',
  '--color-on-tertiary-container': COLORS['on-tertiary-container'] || '#e9d5ff',

  '--color-error': COLORS.error || '#f87171',
  '--color-error-container': COLORS['error-container'] || '#7f1d1d',
  '--color-on-error': COLORS['on-error'] || '#0f172a',
  '--color-on-error-container': COLORS['on-error-container'] || '#fef2f2',

  '--color-success': COLORS.health && COLORS.health.healthy ? COLORS.health.healthy : COLORS['success'] || '#4ade80',
  '--color-success-container': COLORS['success-container'] || '#166534',
  '--color-on-success': COLORS['on-success'] || '#0f172a',
  '--color-on-success-container': COLORS['on-success-container'] || '#f0fdf4',

  '--color-warning': COLORS['health'] && COLORS.health.wounded ? COLORS.health.wounded : COLORS['warning'] || '#fbbf24',
  '--color-warning-container': COLORS['warning-container'] || '#92400e',
  '--color-on-warning': COLORS['on-warning'] || '#0f172a',
  '--color-on-warning-container': COLORS['on-warning-container'] || '#fffbeb',

  '--color-outline': COLORS.outline || '#475569',
  '--color-outline-variant': COLORS['outline-variant'] || '#64748b',

  '--color-legend-knight': COLORS.legendKnight || '#3b82f6',
  '--color-legend-rogue': COLORS.legendRogue || '#ef4444',
  '--color-legend-mage': COLORS.legendMage || '#8b5cf6',
  '--color-legend-npc': COLORS.legendNPC || '#f97316',
  '--color-legend-item': COLORS.legendItem || '#22c55e',

  '--color-health-healthy': (COLORS.health && COLORS.health.healthy) || '#22c55e',
  '--color-health-wounded': (COLORS.health && COLORS.health.wounded) || '#eab308',
  '--color-health-critical': (COLORS.health && COLORS.health.critical) || '#f97316',
  '--color-health-dying': (COLORS.health && COLORS.health.dying) || '#ef4444',
  '--color-health-fill-healthy-start': COLORS.health && COLORS.health.healthy || '#22c55e',
  '--color-health-fill-healthy-end': COLORS.healthFillHealthyEnd || '#16a34a',
  '--color-health-fill-wounded-start': COLORS.healthFillWoundedStart || '#eab308',
  '--color-health-fill-wounded-end': COLORS.healthFillWoundedEnd || '#ca8a04',
  '--color-health-fill-critical-start': COLORS.healthFillCriticalStart || '#f97316',
  '--color-health-fill-critical-end': COLORS.healthFillCriticalEnd || '#ea580c',
  '--color-health-fill-dying-start': COLORS.healthFillDyingStart || '#ef4444',
  '--color-health-fill-dying-end': COLORS.healthFillDyingEnd || '#dc2626',

  '--color-exp-fill-start': COLORS.expFillStart || '#8b5cf6',
  '--color-exp-fill-end': COLORS.expFillEnd || '#7c3aed',
  '--color-exp-value': COLORS.expValue || '#8b5cf6',

  '--color-status-active-bg': (COLORS.status && COLORS.status.active && COLORS.status.active.bg) || '#f0fdf4',
  '--color-status-active-text': (COLORS.status && COLORS.status.active && COLORS.status.active.text) || '#166534',
  '--color-status-active-border': (COLORS.status && COLORS.status.active && COLORS.status.active.border) || '#bbf7d0',
  '--color-status-negative-bg': (COLORS.status && COLORS.status.negative && COLORS.status.negative.bg) || '#fef2f2',
  '--color-status-negative-text': (COLORS.status && COLORS.status.negative && COLORS.status.negative.text) || '#991b1b',
  '--color-status-negative-border': (COLORS.status && COLORS.status.negative && COLORS.status.negative.border) || '#fecaca',
});

const getLightThemeColors = () => ({
  '--color-background-primary': COLORS.background || '#ffffff',
  '--color-background-secondary': COLORS['backgroundMedium'] || '#f8fafc',
  '--color-background-tertiary': COLORS['background'] || '#f1f5f9',
  '--color-surface': COLORS.surface || '#ffffff',
  '--color-surface-variant': COLORS['surface-variant'] || '#f8fafc',

  '--color-text-primary': (COLORS.text && COLORS.text.primary) || '#1e293b',
  '--color-text-secondary': (COLORS.text && COLORS.text.secondary) || '#475569',
  '--color-text-tertiary': (COLORS.text && COLORS.text.tertiary) || '#64748b',
  '--color-text-on-surface': (COLORS.text && COLORS.text.primary) || '#1e293b',

  '--color-primary': COLORS.primaryBlue || COLORS.primary || '#2563eb',
  '--color-primary-container': COLORS['primary-container'] || '#dbeafe',
  '--color-on-primary': COLORS['on-primary'] || '#ffffff',
  '--color-on-primary-container': COLORS['on-primary-container'] || '#1e40af',

  '--color-secondary': COLORS.secondaryBlue || COLORS.secondary || '#64748b',
  '--color-secondary-container': COLORS['secondary-container'] || '#f1f5f9',
  '--color-on-secondary': COLORS['on-secondary'] || '#ffffff',
  '--color-on-secondary-container': COLORS['on-secondary-container'] || '#334155',

  '--color-tertiary': COLORS.accentPurple || '#7c3aed',
  '--color-tertiary-container': COLORS['tertiary-container'] || '#f3e8ff',
  '--color-on-tertiary': COLORS['on-tertiary'] || '#ffffff',
  '--color-on-tertiary-container': COLORS['on-tertiary-container'] || '#581c87',

  '--color-error': COLORS.error || '#dc2626',
  '--color-error-container': COLORS['error-container'] || '#fef2f2',
  '--color-on-error': COLORS['on-error'] || '#ffffff',
  '--color-on-error-container': COLORS['on-error-container'] || '#7f1d1d',

  '--color-success': COLORS.health && COLORS.health.healthy || '#16a34a',
  '--color-success-container': COLORS['success-container'] || '#f0fdf4',
  '--color-on-success': COLORS['on-success'] || '#ffffff',
  '--color-on-success-container': COLORS['on-success-container'] || '#166534',

  '--color-warning': COLORS['health'] && COLORS.health.wounded || '#ca8a04',
  '--color-warning-container': COLORS['warning-container'] || '#fffbeb',
  '--color-on-warning': COLORS['on-warning'] || '#ffffff',
  '--color-on-warning-container': COLORS['on-warning-container'] || '#92400e',

  '--color-outline': COLORS.outline || '#cbd5e1',
  '--color-outline-variant': COLORS['outline-variant'] || '#e2e8f0',

  '--color-legend-knight': COLORS.legendKnight || '#2563eb',
  '--color-legend-rogue': COLORS.legendRogue || '#dc2626',
  '--color-legend-mage': COLORS.legendMage || '#7c3aed',
  '--color-legend-npc': COLORS.legendNPC || '#ea580c',
  '--color-legend-item': COLORS.legendItem || '#16a34a',

  '--color-health-healthy': (COLORS.health && COLORS.health.healthy) || '#16a34a',
  '--color-health-wounded': (COLORS.health && COLORS.health.wounded) || '#ca8a04',
  '--color-health-critical': (COLORS.health && COLORS.health.critical) || '#ea580c',
  '--color-health-dying': (COLORS.health && COLORS.health.dying) || '#dc2626',
  '--color-health-fill-healthy-start': COLORS.healthFillHealthyStart || '#16a34a',
  '--color-health-fill-healthy-end': COLORS.healthFillHealthyEnd || '#15803d',
  '--color-health-fill-wounded-start': COLORS.healthFillWoundedStart || '#ca8a04',
  '--color-health-fill-wounded-end': COLORS.healthFillWoundedEnd || '#a16207',
  '--color-health-fill-critical-start': COLORS.healthFillCriticalStart || '#ea580c',
  '--color-health-fill-critical-end': COLORS.healthFillCriticalEnd || '#c2410c',
  '--color-health-fill-dying-start': COLORS.healthFillDyingStart || '#dc2626',
  '--color-health-fill-dying-end': COLORS.healthFillDyingEnd || '#b91c1c',

  '--color-exp-fill-start': COLORS.expFillStart || '#7c3aed',
  '--color-exp-fill-end': COLORS.expFillEnd || '#581c87',
  '--color-exp-value': COLORS.expValue || '#7c3aed',

  '--color-status-active-bg': (COLORS.status && COLORS.status.active && COLORS.status.active.bg) || '#f0fdf4',
  '--color-status-active-text': (COLORS.status && COLORS.status.active && COLORS.status.active.text) || '#166534',
  '--color-status-active-border': (COLORS.status && COLORS.status.active && COLORS.status.active.border) || '#bbf7d0',
  '--color-status-negative-bg': (COLORS.status && COLORS.status.negative && COLORS.status.negative.bg) || '#fef2f2',
  '--color-status-negative-text': (COLORS.status && COLORS.status.negative && COLORS.status.negative.text) || '#991b1b',
  '--color-status-negative-border': (COLORS.status && COLORS.status.negative && COLORS.status.negative.border) || '#fecaca',
});

const getDarkThemeColors = () => ({
  '--color-background-primary': COLORS.background || '#0f0f23',
  '--color-background-secondary': COLORS.backgroundMedium || '#1a1a2e',
  '--color-background-tertiary': COLORS.background || '#16213e',
  '--color-surface': COLORS.surface || '#1e1e2e',
  '--color-surface-variant': COLORS['surface-variant'] || '#2a2a3e',

  '--color-text-primary': (COLORS.text && COLORS.text.primary) || '#cdd6f4',
  '--color-text-secondary': (COLORS.text && COLORS.text.secondary) || '#bac2de',
  '--color-text-tertiary': (COLORS.text && COLORS.text.tertiary) || '#a6adc8',
  '--color-text-on-surface': (COLORS.text && COLORS.text.primary) || '#cdd6f4',

  '--color-primary': COLORS.primaryBlue || COLORS.primary || '#89b4fa',
  '--color-primary-container': COLORS['primary-container'] || '#1e40af',
  '--color-on-primary': COLORS['on-primary'] || '#1e1e2e',
  '--color-on-primary-container': COLORS['on-primary-container'] || '#dbeafe',

  '--color-secondary': COLORS.secondaryBlue || COLORS.secondary || '#94a3b8',
  '--color-secondary-container': COLORS['secondary-container'] || '#334155',
  '--color-on-secondary': COLORS['on-secondary'] || '#1e1e2e',
  '--color-on-secondary-container': COLORS['on-secondary-container'] || '#f1f5f9',

  '--color-tertiary': COLORS.accentPurple || COLORS['accentPurple'] || '#c4a7e7',
  '--color-tertiary-container': COLORS['tertiary-container'] || '#581c87',
  '--color-on-tertiary': COLORS['on-tertiary'] || '#1e1e2e',
  '--color-on-tertiary-container': COLORS['on-tertiary-container'] || '#f3e8ff',

  '--color-error': COLORS.error || '#f38ba8',
  '--color-error-container': COLORS['error-container'] || '#7f1d1d',
  '--color-on-error': COLORS['on-error'] || '#1e1e2e',
  '--color-on-error-container': COLORS['on-error-container'] || '#fef2f2',

  '--color-success': (COLORS.health && COLORS.health.healthy) || '#a6e3a1',
  '--color-success-container': COLORS['success-container'] || '#166534',
  '--color-on-success': COLORS['on-success'] || '#1e1e2e',
  '--color-on-success-container': COLORS['on-success-container'] || '#f0fdf4',

  '--color-warning': COLORS['warning'] || '#f9e2af',
  '--color-warning-container': COLORS['warning-container'] || '#92400e',
  '--color-on-warning': COLORS['on-warning'] || '#1e1e2e',
  '--color-on-warning-container': COLORS['on-warning-container'] || '#fffbeb',

  '--color-outline': COLORS.outline || '#6c7086',
  '--color-outline-variant': COLORS['outline-variant'] || '#9399b2',

  '--color-legend-knight': COLORS.legendKnight || '#2563eb',
  '--color-legend-rogue': COLORS.legendRogue || '#dc2626',
  '--color-legend-mage': COLORS.legendMage || '#7c3aed',
  '--color-legend-npc': COLORS.legendNPC || '#ea580c',
  '--color-legend-item': COLORS.legendItem || '#16a34a',

  '--color-health-healthy': (COLORS.health && COLORS.health.healthy) || '#16a34a',
  '--color-health-wounded': (COLORS.health && COLORS.health.wounded) || '#ca8a04',
  '--color-health-critical': (COLORS.health && COLORS.health.critical) || '#ea580c',
  '--color-health-dying': (COLORS.health && COLORS.health.dying) || '#dc2626',
  '--color-health-fill-healthy-start': COLORS.healthFillHealthyStart || '#16a34a',
  '--color-health-fill-healthy-end': COLORS.healthFillHealthyEnd || '#15803d',
  '--color-health-fill-wounded-start': COLORS.healthFillWoundedStart || '#ca8a04',
  '--color-health-fill-wounded-end': COLORS.healthFillWoundedEnd || '#a16207',
  '--color-health-fill-critical-start': COLORS.healthFillCriticalStart || '#ea580c',
  '--color-health-fill-critical-end': COLORS.healthFillCriticalEnd || '#c2410c',
  '--color-health-fill-dying-start': COLORS.healthFillDyingStart || '#dc2626',
  '--color-health-fill-dying-end': COLORS.healthFillDyingEnd || '#b91c1c',

  '--color-exp-fill-start': COLORS.expFillStart || '#7c3aed',
  '--color-exp-fill-end': COLORS.expFillEnd || '#581c87',
  '--color-exp-value': COLORS.expValue || '#7c3aed',

  '--color-status-active-bg': (COLORS.status && COLORS.status.active && COLORS.status.active.bg) || '#f0fdf4',
  '--color-status-active-text': (COLORS.status && COLORS.status.active && COLORS.status.active.text) || '#166534',
  '--color-status-active-border': (COLORS.status && COLORS.status.active && COLORS.status.active.border) || '#bbf7d0',
  '--color-status-negative-bg': (COLORS.status && COLORS.status.negative && COLORS.status.negative.bg) || '#fef2f2',
  '--color-status-negative-text': (COLORS.status && COLORS.status.negative && COLORS.status.negative.text) || '#991b1b',
  '--color-status-negative-border': (COLORS.status && COLORS.status.negative && COLORS.status.negative.border) || '#fecaca',
});

const themeColorMap = {
  [Theme.LIGHT]: getLightThemeColors,
  [Theme.DARK]: getDarkThemeColors,
  [Theme.NIGHT]: getNightThemeColors,
  [Theme.AUTO]: getDarkThemeColors, // Default to dark for auto until we implement system preference detection
};

export const useTheme = () => {
  const { unifiedSettings } = useGameStore();
  const currentTheme = unifiedSettings.visual.theme;

  useEffect(() => {
    const root = document.documentElement;
    const colorsGetter = themeColorMap[currentTheme] || getDarkThemeColors;
    const colors = colorsGetter();

    // Apply all theme colors to CSS custom properties
    Object.entries(colors).forEach(([property, value]) => {
      // ensure the value is a string before setting
      root.style.setProperty(property, String(value));
    });

    // Store current theme in localStorage for persistence
    localStorage.setItem('chatte-realm-theme', currentTheme);
  }, [currentTheme]);

  const currentColorsGetter = themeColorMap[currentTheme] || getDarkThemeColors;

  return {
    currentTheme,
    availableThemes: Object.values(Theme),
    themeColors: currentColorsGetter(),
  };
};