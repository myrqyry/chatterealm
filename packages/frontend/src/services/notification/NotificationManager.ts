import { NotificationData, NotificationType } from '../../types/notification';

// Utility function to show notifications from anywhere in the app
export const showNotification = (data: Omit<NotificationData, 'id'>) => {
  const notification: NotificationData = {
    id: `notification-${Date.now()}-${Math.random()}`,
    ...data
  };

  const event = new CustomEvent('game-notification', { detail: notification });
  window.dispatchEvent(event);
};

// Preset notification helpers
export const notificationHelpers = {
  success: (title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({ type: 'success', title, message, ...options });
  },
  error: (title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({ type: 'error', title, message, ...options });
  },
  warning: (title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({ type: 'warning', title, message, ...options });
  },
  info: (title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({ type: 'info', title, message, ...options });
  },
  combat: (title: string, message: string, damage?: number, options?: Partial<NotificationData>) => {
    const icon = damage ? (damage > 0 ? '⚡' : '🛡️') : '⚔️';
    showNotification({ type: 'combat', title, message, icon, ...options });
  },
  loot: (title: string, message: string, rarity?: string, options?: Partial<NotificationData>) => {
    const rarityIcons: Record<string, string> = {
      common: '📦',
      uncommon: '💚', 
      rare: '💙',
      epic: '💜',
      legendary: '🟠'
    };
    const icon = rarity ? rarityIcons[rarity.toLowerCase()] || '💎' : '💎';
    showNotification({ type: 'loot', title, message, icon, ...options });
  },
  social: (title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({ type: 'social', title, message, ...options });
  },
  system: (title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({ type: 'system', title, message, ...options });
  },
  levelUp: (level: number, className?: string) => {
    showNotification({
      type: 'success',
      title: '🎉 Level Up!',
      message: `You reached level ${level}${className ? ` as a ${className}` : ''}!`,
      icon: '⭐',
      duration: 6000,
      persistent: false
    });
  },
  lowHealth: (currentHp: number, maxHp: number) => {
    showNotification({
      type: 'warning',
      title: '⚡ Low Health!',
      message: `Health critical: ${currentHp}/${maxHp} HP remaining`,
      icon: '💔',
      persistent: true,
      actions: [
        {
          label: 'Heal',
          action: () => {
            // This would trigger healing action in the game
            console.log('Healing action triggered');
          },
          style: 'primary'
        }
      ]
    });
  }
};