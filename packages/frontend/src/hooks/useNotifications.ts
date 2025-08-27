import { useState, useEffect } from 'react';
import { notificationQueue } from '../services/notification/NotificationQueue';
import { NotificationData } from '../types/notification';

export const useNotifications = (maxNotifications?: number) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    // Optionally update maxNotifications if the queue is managed here
    // Currently, maxNotifications is passed to the NotificationQueue constructor.
    // If the hook is responsible for limiting, this logic should move here.

    const unsubscribe = notificationQueue.subscribe((currentNotifications) => {
      setNotifications(currentNotifications);
    });

    return () => unsubscribe();
  }, []);

  return { notifications, removeNotification: notificationQueue.removeNotification };
};