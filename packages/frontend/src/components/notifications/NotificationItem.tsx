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
      className="notification-item rounded-md shadow-md overflow-hidden max-w-sm w-full mb-3"
      style={{ background: style.background, border: style.border }}
    >
      <div className="notification-content p-3">
        <div className="notification-header flex items-start gap-3">
          <div className="notification-icon text-xl">{displayIcon}</div>
          <div className="notification-text flex-1">
            <h4 className="notification-title text-text-primary font-semibold text-sm m-0">{notification.title}</h4>
            <p className="notification-message text-text-secondary text-sm m-0">{notification.message}</p>
          </div>
          <button 
            className="notification-close text-text-secondary text-lg p-1"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
        
        {notification.actions && notification.actions.length > 0 && (
          <div className="notification-actions mt-3 flex gap-2">
            {notification.actions.map((action: NotificationAction, index: number) => (
              <button
                key={index}
                className={`notification-action-btn px-3 py-1 rounded-md text-sm ${action.style === 'primary' ? 'bg-primary text-on-primary' : 'bg-transparent border border-divider text-text-primary'}`}
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {!notification.persistent && (
        <div className="notification-progress h-1 bg-[rgba(0,0,0,0.08)]">
          <div ref={progressRef} className="notification-progress-bar h-1 bg-primary w-full"></div>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;