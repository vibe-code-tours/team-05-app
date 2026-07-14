import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Notification } from "@/types/notification";

// Query params
export interface NotificationFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
}

// API calls
export const notificationApi = {
  getNotifications: (filters?: NotificationFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return api.get<Notification[]>(`/notifications${query ? `?${query}` : ""}`);
  },

  getUnreadCount: () =>
    api.get<{ count: number }>("/notifications/unread-count"),

  markAsRead: (id: string) =>
    api.put<Notification>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put<void>("/notifications/read-all"),

  deleteNotification: (id: string) =>
    api.delete<void>(`/notifications/${id}`),
};

// React Query hooks
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => notificationApi.getNotifications(filters),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationApi.getUnreadCount,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}
