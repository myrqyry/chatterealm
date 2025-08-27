import React from 'react';
import NotificationItem from './NotificationItem';
import { NotificationData } from '../../types/notification';

interface NotificationContainerProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ 
  notifications, 
  onDismiss 
}) => {
  return (
    <div className="notification-system">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;