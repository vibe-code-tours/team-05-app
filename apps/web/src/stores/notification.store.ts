import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, NotificationPreference } from '@/types/notification';
import { MOCK_PREFERENCES } from '@/lib/mock-notifications';

interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreference[];
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUnreadCount: () => number;
  updatePreference: (channel: string, key: string, value: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      preferences: MOCK_PREFERENCES,

      setNotifications: (notifications) => set({ notifications }),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      getUnreadCount: () =>
        get().notifications.filter((n) => !n.read).length,

      updatePreference: (channel, key, value) =>
        set((state) => ({
          preferences: state.preferences.map((p) =>
            p.channel === channel ? { ...p, [key]: value } : p
          ),
        })),
    }),
    {
      name: 'crossmart-notifications',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
