import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { NotificationData, NotificationType, NotificationAction } from '../../types/notification';
import { getNotificationStyle } from '../../utils/notification/NotificationStyles'; // Will be created later

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
            {notification.actions.map((action: NotificationAction, index: number) => (
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

export default NotificationItem;