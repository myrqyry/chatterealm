import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';

// Notification types for different game events
export type NotificationType = 
  | 'success'    // Level ups, achievements, successful actions
  | 'error'      // Failed actions, system errors
  | 'warning'    // Low health, resource warnings
  | 'info'       // General information, tips
  | 'combat'     // Combat results, damage dealt/taken
  | 'loot'       // Item pickups, treasure found
  | 'social'     // Player interactions, chat mentions
  | 'system';    // System messages, connection status

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // Duration in milliseconds (default: 4000)
  icon?: string;     // Optional custom icon
  persistent?: boolean; // If true, won't auto-dismiss
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

interface NotificationItemProps {
  notification: NotificationData;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onDismiss 
}) => {
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Get notification styling based on type
  const getNotificationStyle = (type: NotificationType) => {
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

  const style = getNotificationStyle(notification.type);
  const displayIcon = notification.icon || style.icon;
  const duration = notification.duration || 4000;

  useEffect(() => {
    const element = notificationRef.current;
    const progress = progressRef.current;
    
    if (!element || !progress) return;

    // Animation timeline
    const tl = gsap.timeline();

    // Slide in from right
    tl.fromTo(element, 
      { 
        x: 300, 
        opacity: 0, 
        scale: 0.8 
      },
      { 
        x: 0, 
        opacity: 1, 
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
      }
    );

    // Progress bar animation
    if (!notification.persistent) {
      tl.fromTo(progress,
        { width: '100%' },
        {
          width: '0%',
          duration: duration / 1000,
          ease: "none",
          onComplete: () => {
            handleDismiss();
          }
        },
        0.3 // Start slightly after slide-in
      );
    }

    setIsVisible(true);

    return () => {
      tl.kill();
    };
  }, [notification, duration]);

  const handleDismiss = () => {
    const element = notificationRef.current;
    if (!element) return;

    // Slide out animation
    gsap.to(element, {
      x: 300,
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: "back.in(1.7)",
      onComplete: () => {
        onDismiss(notification.id);
      }
    });
  };

  const handleActionClick = (action: NotificationAction) => {
    action.action();
    if (!notification.persistent) {
      handleDismiss();
    }
  };

  return (
    <div
      ref={notificationRef}
      className="notification-item"
      style={{
        background: style.background,
        border: style.border
      }}
    >
      <div className="notification-content">
        <div className="notification-header">
          <div className="notification-icon">{displayIcon}</div>
          <div className="notification-text">
            <h4 className="notification-title">{notification.title}</h4>
            <p className="notification-message">{notification.message}</p>
          </div>
          <button 
            className="notification-close"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
        
        {notification.actions && notification.actions.length > 0 && (
          <div className="notification-actions">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                className={`notification-action-btn ${action.style || 'secondary'}`}
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {!notification.persistent && (
        <div className="notification-progress">
          <div ref={progressRef} className="notification-progress-bar"></div>
        </div>
      )}
    </div>
  );
};

interface NotificationSystemProps {
  maxNotifications?: number;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  maxNotifications = 5 
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Global notification function that can be called from anywhere
  React.useEffect(() => {
    const handleGlobalNotification = (event: CustomEvent<NotificationData>) => {
      addNotification(event.detail);
    };

    window.addEventListener('game-notification', handleGlobalNotification as EventListener);
    
    return () => {
      window.removeEventListener('game-notification', handleGlobalNotification as EventListener);
    };
  }, []);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      // Limit number of notifications
      return newNotifications.slice(0, maxNotifications);
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notification-system">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
};

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

export default NotificationSystem;