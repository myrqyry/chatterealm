import { NotificationData } from '../../types/notification';
import { useGameStore } from '../../stores/gameStore';

class NotificationQueue {
  private maxNotifications: number;

  constructor(maxNotifications: number = 5) {
    this.maxNotifications = maxNotifications;
  }

  addNotification(notification: Omit<NotificationData, 'id'>) {
    const store = useGameStore.getState();
    const currentNotifications = store.notifications;

    // Create notification with ID
    const newNotification: NotificationData = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Add to beginning and limit
    const updatedNotifications = [newNotification, ...currentNotifications].slice(0, this.maxNotifications);

    // Update store
    store.notifications = updatedNotifications;

    // Auto-remove after duration if specified
    if (newNotification.duration && !newNotification.persistent) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  }

  removeNotification(id: string) {
    const store = useGameStore.getState();
    store.removeNotification(id);
  }

  getNotifications(): NotificationData[] {
    return useGameStore.getState().notifications;
  }

  // Legacy subscribe method for backward compatibility - returns empty unsubscribe
  subscribe(callback: (notifications: NotificationData[]) => void) {
    // Since we're using Zustand now, we don't need subscribers
    // Components should use useGameStore directly
    callback(this.getNotifications());
    return () => {}; // No-op unsubscribe
  }
}

export const notificationQueue = new NotificationQueue();