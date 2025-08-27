import { NotificationData } from '../../types/notification';

export const createNotification = (data: Omit<NotificationData, 'id'>): NotificationData => {
  return {
    id: `notification-${Date.now()}-${Math.random()}`,
    ...data,
  };
};