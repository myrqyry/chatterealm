import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Theme } from 'shared';

// Night theme color palette - cooler, more muted tones for late-night use
const nightThemeColors = {
  // Background colors - deeper, more subdued
  '--color-background-primary': '#0a0a14',
  '--color-background-secondary': '#111122',
  '--color-background-tertiary': '#0f0f1a',
  '--color-surface': '#141428',
  '--color-surface-variant': '#1a1a2e',

  // Text colors - slightly warmer for better readability in low light
  '--color-text-primary': '#e2e8f0',
  '--color-text-secondary': '#cbd5e1',
  '--color-text-tertiary': '#94a3b8',
  '--color-text-on-surface': '#e2e8f0',

  // Primary colors - cooler blue tones
  '--color-primary': '#60a5fa',
  '--color-primary-container': '#1e3a8a',
  '--color-on-primary': '#0f172a',
  '--color-on-primary-container': '#dbeafe',

  // Secondary colors - muted slate
  '--color-secondary': '#64748b',
  '--color-secondary-container': '#334155',
  '--color-on-secondary': '#0f172a',
  '--color-on-secondary-container': '#f1f5f9',

  // Tertiary colors - softer purple
  '--color-tertiary': '#a78bfa',
  '--color-tertiary-container': '#3730a3',
  '--color-on-tertiary': '#0f172a',
  '--color-on-tertiary-container': '#e9d5ff',

  // Status colors - adjusted for night visibility
  '--color-error': '#f87171',
  '--color-error-container': '#7f1d1d',
  '--color-on-error': '#0f172a',
  '--color-on-error-container': '#fef2f2',

  '--color-success': '#4ade80',
  '--color-success-container': '#166534',
  '--color-on-success': '#0f172a',
  '--color-on-success-container': '#f0fdf4',

  '--color-warning': '#fbbf24',
  '--color-warning-container': '#92400e',
  '--color-on-warning': '#0f172a',
  '--color-on-warning-container': '#fffbeb',

  // Border colors - more subtle
  '--color-outline': '#475569',
  '--color-outline-variant': '#64748b',

  // Game-specific colors - slightly dimmed for night
  '--color-legend-knight': '#3b82f6',
  '--color-legend-rogue': '#ef4444',
  '--color-legend-mage': '#8b5cf6',
  '--color-legend-npc': '#f97316',
  '--color-legend-item': '#22c55e',

  // Health bar colors - night-adjusted
  '--color-health-healthy': '#22c55e',
  '--color-health-wounded': '#eab308',
  '--color-health-critical': '#f97316',
  '--color-health-dying': '#ef4444',
  '--color-health-fill-healthy-start': '#22c55e',
  '--color-health-fill-healthy-end': '#16a34a',
  '--color-health-fill-wounded-start': '#eab308',
  '--color-health-fill-wounded-end': '#ca8a04',
  '--color-health-fill-critical-start': '#f97316',
  '--color-health-fill-critical-end': '#ea580c',
  '--color-health-fill-dying-start': '#ef4444',
  '--color-health-fill-dying-end': '#dc2626',

  // Experience bar colors - cooler tones
  '--color-exp-fill-start': '#8b5cf6',
  '--color-exp-fill-end': '#7c3aed',
  '--color-exp-value': '#8b5cf6',

  // Status effects - night-friendly
  '--color-status-active-bg': '#f0fdf4',
  '--color-status-active-text': '#166534',
  '--color-status-active-border': '#bbf7d0',
  '--color-status-negative-bg': '#fef2f2',
  '--color-status-negative-text': '#991b1b',
  '--color-status-negative-border': '#fecaca',
};

// Light theme colors (existing)
const lightThemeColors = {
  '--color-background-primary': '#ffffff',
  '--color-background-secondary': '#f8fafc',
  '--color-background-tertiary': '#f1f5f9',
  '--color-surface': '#ffffff',
  '--color-surface-variant': '#f8fafc',

  '--color-text-primary': '#1e293b',
  '--color-text-secondary': '#475569',
  '--color-text-tertiary': '#64748b',
  '--color-text-on-surface': '#1e293b',

  '--color-primary': '#2563eb',
  '--color-primary-container': '#dbeafe',
  '--color-on-primary': '#ffffff',
  '--color-on-primary-container': '#1e40af',

  '--color-secondary': '#64748b',
  '--color-secondary-container': '#f1f5f9',
  '--color-on-secondary': '#ffffff',
  '--color-on-secondary-container': '#334155',

  '--color-tertiary': '#7c3aed',
  '--color-tertiary-container': '#f3e8ff',
  '--color-on-tertiary': '#ffffff',
  '--color-on-tertiary-container': '#581c87',

  '--color-error': '#dc2626',
  '--color-error-container': '#fef2f2',
  '--color-on-error': '#ffffff',
  '--color-on-error-container': '#7f1d1d',

  '--color-success': '#16a34a',
  '--color-success-container': '#f0fdf4',
  '--color-on-success': '#ffffff',
  '--color-on-success-container': '#166534',

  '--color-warning': '#ca8a04',
  '--color-warning-container': '#fffbeb',
  '--color-on-warning': '#ffffff',
  '--color-on-warning-container': '#92400e',

  '--color-outline': '#cbd5e1',
  '--color-outline-variant': '#e2e8f0',

  '--color-legend-knight': '#2563eb',
  '--color-legend-rogue': '#dc2626',
  '--color-legend-mage': '#7c3aed',
  '--color-legend-npc': '#ea580c',
  '--color-legend-item': '#16a34a',

  '--color-health-healthy': '#16a34a',
  '--color-health-wounded': '#ca8a04',
  '--color-health-critical': '#ea580c',
  '--color-health-dying': '#dc2626',
  '--color-health-fill-healthy-start': '#16a34a',
  '--color-health-fill-healthy-end': '#15803d',
  '--color-health-fill-wounded-start': '#ca8a04',
  '--color-health-fill-wounded-end': '#a16207',
  '--color-health-fill-critical-start': '#ea580c',
  '--color-health-fill-critical-end': '#c2410c',
  '--color-health-fill-dying-start': '#dc2626',
  '--color-health-fill-dying-end': '#b91c1c',

  '--color-exp-fill-start': '#7c3aed',
  '--color-exp-fill-end': '#581c87',
  '--color-exp-value': '#7c3aed',

  '--color-status-active-bg': '#f0fdf4',
  '--color-status-active-text': '#166534',
  '--color-status-active-border': '#bbf7d0',
  '--color-status-negative-bg': '#fef2f2',
  '--color-status-negative-text': '#991b1b',
  '--color-status-negative-border': '#fecaca',
};

// Dark theme colors (existing, current default)
const darkThemeColors = {
  '--color-background-primary': '#0f0f23',
  '--color-background-secondary': '#1a1a2e',
  '--color-background-tertiary': '#16213e',
  '--color-surface': '#1e1e2e',
  '--color-surface-variant': '#2a2a3e',

  '--color-text-primary': '#cdd6f4',
  '--color-text-secondary': '#bac2de',
  '--color-text-tertiary': '#a6adc8',
  '--color-text-on-surface': '#cdd6f4',

  '--color-primary': '#89b4fa',
  '--color-primary-container': '#1e40af',
  '--color-on-primary': '#1e1e2e',
  '--color-on-primary-container': '#dbeafe',

  '--color-secondary': '#94a3b8',
  '--color-secondary-container': '#334155',
  '--color-on-secondary': '#1e1e2e',
  '--color-on-secondary-container': '#f1f5f9',

  '--color-tertiary': '#c4a7e7',
  '--color-tertiary-container': '#581c87',
  '--color-on-tertiary': '#1e1e2e',
  '--color-on-tertiary-container': '#f3e8ff',

  '--color-error': '#f38ba8',
  '--color-error-container': '#7f1d1d',
  '--color-on-error': '#1e1e2e',
  '--color-on-error-container': '#fef2f2',

  '--color-success': '#a6e3a1',
  '--color-success-container': '#166534',
  '--color-on-success': '#1e1e2e',
  '--color-on-success-container': '#f0fdf4',

  '--color-warning': '#f9e2af',
  '--color-warning-container': '#92400e',
  '--color-on-warning': '#1e1e2e',
  '--color-on-warning-container': '#fffbeb',

  '--color-outline': '#6c7086',
  '--color-outline-variant': '#9399b2',

  '--color-legend-knight': '#2563eb',
  '--color-legend-rogue': '#dc2626',
  '--color-legend-mage': '#7c3aed',
  '--color-legend-npc': '#ea580c',
  '--color-legend-item': '#16a34a',

  '--color-health-healthy': '#16a34a',
  '--color-health-wounded': '#ca8a04',
  '--color-health-critical': '#ea580c',
  '--color-health-dying': '#dc2626',
  '--color-health-fill-healthy-start': '#16a34a',
  '--color-health-fill-healthy-end': '#15803d',
  '--color-health-fill-wounded-start': '#ca8a04',
  '--color-health-fill-wounded-end': '#a16207',
  '--color-health-fill-critical-start': '#ea580c',
  '--color-health-fill-critical-end': '#c2410c',
  '--color-health-fill-dying-start': '#dc2626',
  '--color-health-fill-dying-end': '#b91c1c',

  '--color-exp-fill-start': '#7c3aed',
  '--color-exp-fill-end': '#581c87',
  '--color-exp-value': '#7c3aed',

  '--color-status-active-bg': '#f0fdf4',
  '--color-status-active-text': '#166534',
  '--color-status-active-border': '#bbf7d0',
  '--color-status-negative-bg': '#fef2f2',
  '--color-status-negative-text': '#991b1b',
  '--color-status-negative-border': '#fecaca',
};

const themeColorMap = {
  [Theme.LIGHT]: lightThemeColors,
  [Theme.DARK]: darkThemeColors,
  [Theme.NIGHT]: nightThemeColors,
  [Theme.AUTO]: darkThemeColors, // Default to dark for auto until we implement system preference detection
};

export const useTheme = () => {
  const { unifiedSettings } = useGameStore();
  const currentTheme = unifiedSettings.visual.theme;

  useEffect(() => {
    const root = document.documentElement;
    const colors = themeColorMap[currentTheme] || darkThemeColors;

    // Apply all theme colors to CSS custom properties
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Store current theme in localStorage for persistence
    localStorage.setItem('chatte-realm-theme', currentTheme);
  }, [currentTheme]);

  return {
    currentTheme,
    availableThemes: Object.values(Theme),
    themeColors: themeColorMap[currentTheme] || darkThemeColors,
  };
};