import React, { useEffect } from 'react';
import NotificationContainer from './notifications/NotificationContainer';
import { useNotifications } from '../hooks/useNotifications';
import { notificationQueue } from '../services/notification/NotificationQueue';
import { createNotification } from '../services/notification/NotificationFactory';
import { NotificationData } from '../types/notification';

interface NotificationSystemProps {
  maxNotifications?: number;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  maxNotifications = 5 
}) => {
  const { notifications, removeNotification } = useNotifications();

  React.useEffect(() => {
    // Optionally set maxNotifications on the queue instance
    // notificationQueue.setMaxNotifications(maxNotifications); // Add this method to NotificationQueue if needed

    const handleGlobalNotification = (event: CustomEvent<Omit<NotificationData, 'id'>>) => {
      const notification = createNotification(event.detail);
      notificationQueue.addNotification(notification);
    };

    window.addEventListener('game-notification', handleGlobalNotification as EventListener);
    
    return () => {
      window.removeEventListener('game-notification', handleGlobalNotification as EventListener);
    };
  }, []);

  return (
    <NotificationContainer
      notifications={notifications}
      onDismiss={removeNotification}
    />
  );
};

export default NotificationSystem;