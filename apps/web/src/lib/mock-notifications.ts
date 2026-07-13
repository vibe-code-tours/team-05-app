import { Notification, NotificationPreference } from '@/types/notification';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'delivery',
    title: 'Out for Delivery',
    message: 'Your order ORD-38472916 is out for delivery and will arrive today.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/orders/order-1',
  },
  {
    id: 'notif-2',
    type: 'order_update',
    title: 'Order Shipped',
    message: 'Your order ORD-92710458 has been shipped via Thailand Air Cargo.',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/orders/order-2',
  },
  {
    id: 'notif-3',
    type: 'promotion',
    title: 'Flash Sale - 30% Off Electronics!',
    message: 'Hurry! Get 30% off on all electronics. Sale ends in 24 hours.',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/products',
  },
  {
    id: 'notif-4',
    type: 'payment',
    title: 'Payment Confirmed',
    message: 'Payment of 285,000 MMK for order ORD-38472916 has been confirmed.',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/orders/order-1',
  },
  {
    id: 'notif-5',
    type: 'system',
    title: 'Welcome to CrossMart!',
    message: 'Thank you for joining CrossMart. Start exploring our products from Thailand.',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_PREFERENCES: NotificationPreference[] = [
  {
    channel: 'in_app',
    orderUpdates: true,
    promotions: true,
    systemAlerts: true,
    deliveryUpdates: true,
    paymentUpdates: true,
  },
  {
    channel: 'email',
    orderUpdates: true,
    promotions: false,
    systemAlerts: true,
    deliveryUpdates: true,
    paymentUpdates: true,
  },
  {
    channel: 'sms',
    orderUpdates: false,
    promotions: false,
    systemAlerts: false,
    deliveryUpdates: true,
    paymentUpdates: false,
  },
  {
    channel: 'push',
    orderUpdates: true,
    promotions: true,
    systemAlerts: false,
    deliveryUpdates: true,
    paymentUpdates: true,
  },
];
