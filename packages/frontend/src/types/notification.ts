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