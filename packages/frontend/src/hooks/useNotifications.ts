import { useGameStore } from '../stores/gameStore';
import { NotificationData } from '../types/notification';

/**
 * Custom hook for accessing notification state and actions from the global game store.
 *
 * This hook provides access to the current notifications list and functions to manage
 * notifications (add, remove). It automatically limits the number of notifications
 * displayed if maxNotifications is specified.
 *
 * @param maxNotifications - Optional maximum number of notifications to display
 * @returns Object containing notifications array and management functions
 *
 * @example
 * ```tsx
 * const { notifications, addNotification, removeNotification } = useNotifications(5);
 *
 * // Add a new notification
 * addNotification({
 *   type: 'success',
 *   title: 'Item Found!',
 *   message: 'You found a health potion'
 * });
 *
 * // Remove a notification
 * removeNotification(notificationId);
 * ```
 */
export const useNotifications = (maxNotifications?: number) => {
  const { notifications, addNotification, removeNotification } = useGameStore();

  // If maxNotifications is specified, limit the notifications
  const limitedNotifications = maxNotifications
    ? notifications.slice(-maxNotifications)
    : notifications;

  return {
    notifications: limitedNotifications,
    addNotification,
    removeNotification
  };
};