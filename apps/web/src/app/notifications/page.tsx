'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  Trash2,
  Package,
  Megaphone,
  Info,
  CreditCard,
  Truck,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicLayout } from '@/components/layout/public-layout';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/lib/services/notification.service';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/notification';
import { ProtectedRoute } from '@/components/auth/protected-route';

const TYPE_ICON_MAP: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  order_update: Package,
  promotion: Megaphone,
  system: Info,
  delivery: Truck,
  payment: CreditCard,
};

const TYPE_BORDER_COLOR: Record<NotificationType, string> = {
  order_update: 'border-l-blue-500',
  promotion: 'border-l-purple-500',
  system: 'border-l-gray-400',
  delivery: 'border-l-green-500',
  payment: 'border-l-yellow-500',
};

function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-l-4 border-l-muted animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="h-8 w-8 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();

  const { data: notificationsData, isLoading } = useNotifications({ limit: 50 });
  const { data: unreadData } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.data ?? [];
  const unreadCount = unreadData?.data?.count ?? 0;

  const handleNotificationClick = (notification: (typeof notifications)[number]) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(id);
  };

  return (
    <ProtectedRoute>
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-blue-500 text-white hover:bg-blue-500/80">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-sm"
              >
                <Check className="h-4 w-4 mr-1.5" />
                {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark All as Read'}
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile/notifications">
                <Settings className="h-4 w-4 mr-1.5" />
                Preferences
              </Link>
            </Button>
          </div>
        </div>

        {/* Notification List */}
        {isLoading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">
              No notifications yet
            </h2>
            <p className="text-sm text-muted-foreground">
              When you receive notifications, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = TYPE_ICON_MAP[notification.type];
              const borderColor = TYPE_BORDER_COLOR[notification.type];

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    'border-l-4 cursor-pointer transition-colors',
                    borderColor,
                    notification.read
                      ? 'bg-background hover:bg-muted/50'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <div
                        className={cn(
                          'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                          notification.type === 'order_update' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                          notification.type === 'promotion' && 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
                          notification.type === 'system' && 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
                          notification.type === 'delivery' && 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                          notification.type === 'payment' && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={cn(
                              'text-sm font-semibold leading-tight',
                              notification.read
                                ? 'text-foreground'
                                : 'text-foreground'
                            )}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1.5">
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
    </ProtectedRoute>
  );
}
