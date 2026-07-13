export type NotificationType =
  | 'order_update'
  | 'promotion'
  | 'system'
  | 'delivery'
  | 'payment';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  icon?: string;
}

export interface NotificationPreference {
  channel: NotificationChannel;
  orderUpdates: boolean;
  promotions: boolean;
  systemAlerts: boolean;
  deliveryUpdates: boolean;
  paymentUpdates: boolean;
}
