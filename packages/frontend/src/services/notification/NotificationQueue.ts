import { NotificationData } from '../../types/notification';

class NotificationQueue {
  private notifications: NotificationData[] = [];
  private maxNotifications: number;
  private subscribers: ((notifications: NotificationData[]) => void)[] = [];

  constructor(maxNotifications: number = 5) {
    this.maxNotifications = maxNotifications;
  }

  addNotification(notification: NotificationData) {
    this.notifications = [notification, ...this.notifications].slice(0, this.maxNotifications);
    this.notifySubscribers();
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifySubscribers();
  }

  getNotifications(): NotificationData[] {
    return this.notifications;
  }

  subscribe(callback: (notifications: NotificationData[]) => void) {
    this.subscribers.push(callback);
    callback(this.notifications); // Send current state to new subscriber
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.notifications));
  }
}

export const notificationQueue = new NotificationQueue();