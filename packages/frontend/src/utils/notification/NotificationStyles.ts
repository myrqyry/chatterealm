import { NotificationType } from '../../types/notification';
import { COLORS } from '../tokens';

const tokenOrFallback = (tokenPath: string, fallback: string) => {
  const parts = tokenPath.split('.');
  let cur: any = COLORS;
  for (const p of parts) {
    if (!cur) return fallback;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : fallback;
};

export const getNotificationStyle = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        background: tokenOrFallback('health.healthy', 'rgba(34, 197, 94, 0.95)'),
        border: `1px solid ${tokenOrFallback('health.healthy', '#22c55e')}`,
        icon: '✅'
      };
    case 'error':
      return {
        background: tokenOrFallback('error', 'rgba(239, 68, 68, 0.95)'),
        border: `1px solid ${tokenOrFallback('error', '#ef4444')}`,
        icon: '❌'
      };
    case 'warning':
      return {
        background: tokenOrFallback('health.wounded', 'rgba(245, 158, 11, 0.95)'),
        border: `1px solid ${tokenOrFallback('health.wounded', '#f59e0b')}`,
        icon: '⚠️'
      };
    case 'info':
      return {
        background: tokenOrFallback('primary', 'rgba(59, 130, 246, 0.95)'),
        border: `1px solid ${tokenOrFallback('primary', '#3b82f6')}`,
        icon: 'ℹ️'
      };
    case 'combat':
      return {
        background: tokenOrFallback('error', 'rgba(220, 38, 38, 0.95)'),
        border: `1px solid ${tokenOrFallback('error', '#dc2626')}`,
        icon: '⚔️'
      };
    case 'loot':
      return {
        background: tokenOrFallback('health.wounded', 'rgba(245, 158, 11, 0.95)'),
        border: `1px solid ${tokenOrFallback('health.wounded', '#f59e0b')}`,
        icon: '💎'
      };
    case 'social':
      return {
        background: tokenOrFallback('accentPurple', 'rgba(168, 85, 247, 0.95)'),
        border: `1px solid ${tokenOrFallback('accentPurple', '#a855f7')}`,
        icon: '💬'
      };
    case 'system':
      return {
        background: tokenOrFallback('text.tertiary', 'rgba(107, 114, 128, 0.95)'),
        border: `1px solid ${tokenOrFallback('text.tertiary', '#6b7280')}`,
        icon: '🔧'
      };
    default:
      return {
        background: tokenOrFallback('primary', 'rgba(59, 130, 246, 0.95)'),
        border: `1px solid ${tokenOrFallback('primary', '#3b82f6')}`,
        icon: 'ℹ️'
      };
  }
};