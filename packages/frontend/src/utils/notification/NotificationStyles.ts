import { NotificationType } from '../../types/notification';

export const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          background: 'rgba(34, 197, 94, 0.95)',
          border: '1px solid #22c55e',
          icon: '✅'
        };
      case 'error':
        return {
          background: 'rgba(239, 68, 68, 0.95)',
          border: '1px solid #ef4444',
          icon: '❌'
        };
      case 'warning':
        return {
          background: 'rgba(245, 158, 11, 0.95)',
          border: '1px solid #f59e0b',
          icon: '⚠️'
        };
      case 'info':
        return {
          background: 'rgba(59, 130, 246, 0.95)',
          border: '1px solid #3b82f6',
          icon: 'ℹ️'
        };
      case 'combat':
        return {
          background: 'rgba(220, 38, 38, 0.95)',
          border: '1px solid #dc2626',
          icon: '⚔️'
        };
      case 'loot':
        return {
          background: 'rgba(245, 158, 11, 0.95)',
          border: '1px solid #f59e0b',
          icon: '💎'
        };
      case 'social':
        return {
          background: 'rgba(168, 85, 247, 0.95)',
          border: '1px solid #a855f7',
          icon: '💬'
        };
      case 'system':
        return {
          background: 'rgba(107, 114, 128, 0.95)',
          border: '1px solid #6b7280',
          icon: '🔧'
        };
      default:
        return {
          background: 'rgba(59, 130, 246, 0.95)',
          border: '1px solid #3b82f6',
          icon: 'ℹ️'
        };
    }
};