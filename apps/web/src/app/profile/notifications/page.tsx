'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useNotificationStore } from '@/stores/notification.store';
import { cn } from '@/lib/utils';
import type { NotificationChannel } from '@/types/notification';

const CHANNEL_META: Record<
  NotificationChannel,
  { label: string; icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  in_app: {
    label: 'In-App',
    icon: Monitor,
    description: 'Notifications within CrossMart',
  },
  email: {
    label: 'Email',
    icon: Mail,
    description: 'Email notifications',
  },
  sms: {
    label: 'SMS',
    icon: MessageSquare,
    description: 'Text message notifications',
  },
  push: {
    label: 'Push',
    icon: Smartphone,
    description: 'Mobile push notifications',
  },
};

const PREFERENCE_ROWS: {
  key: string;
  label: string;
  description: string;
}[] = [
  {
    key: 'orderUpdates',
    label: 'Order Updates',
    description: 'Order confirmation, status changes',
  },
  {
    key: 'promotions',
    label: 'Promotions',
    description: 'Deals, flash sales, and offers',
  },
  {
    key: 'systemAlerts',
    label: 'System Alerts',
    description: 'Platform updates and maintenance',
  },
  {
    key: 'deliveryUpdates',
    label: 'Delivery Updates',
    description: 'Shipping and delivery status',
  },
  {
    key: 'paymentUpdates',
    label: 'Payment Updates',
    description: 'Payment confirmation and refunds',
  },
];

const CHANNELS: NotificationChannel[] = ['in_app', 'email', 'sms', 'push'];

export default function NotificationPreferencesPage() {
  const preferences = useNotificationStore((s) => s.preferences);
  const updatePreference = useNotificationStore((s) => s.updatePreference);

  const handleToggle = (channel: string, key: string, checked: boolean) => {
    updatePreference(channel, key, checked);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Back Link */}
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-6 w-6 text-foreground" />
              <h1 className="text-2xl font-bold text-foreground">
                Notification Preferences
              </h1>
            </div>
            <p className="text-muted-foreground">
              Choose how you want to be notified
            </p>
          </div>

          {/* Preferences Table */}
          <Card>
            <CardContent className="p-0">
              {/* Header Row */}
              <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_repeat(4,5rem)] gap-0 border-b bg-muted/50">
                <div className="px-4 py-3 sm:px-6">
                  <span className="text-sm font-semibold text-foreground">
                    Notification Type
                  </span>
                </div>
                {CHANNELS.map((channel) => {
                  const meta = CHANNEL_META[channel];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={channel}
                      className="hidden sm:flex flex-col items-center justify-center px-2 py-3"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Preference Rows */}
              {PREFERENCE_ROWS.map((row, index) => (
                <div
                  key={row.key}
                  className={cn(
                    'grid grid-cols-[1fr] sm:grid-cols-[1fr_repeat(4,5rem)] gap-0',
                    index < PREFERENCE_ROWS.length - 1 && 'border-b'
                  )}
                >
                  {/* Row Label */}
                  <div className="px-4 py-4 sm:px-6">
                    <p className="text-sm font-medium text-foreground">
                      {row.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {row.description}
                    </p>
                  </div>

                  {/* Channel Toggles */}
                  {CHANNELS.map((channel) => {
                    const pref = preferences.find((p) => p.channel === channel);
                    const isChecked = pref ? (pref as unknown as Record<string, boolean>)[row.key] : false;

                    return (
                      <div
                        key={`${channel}-${row.key}`}
                        className="hidden sm:flex items-center justify-center"
                      >
                        <Switch
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleToggle(channel, row.key, checked)
                          }
                          aria-label={`${row.label} via ${CHANNEL_META[channel].label}`}
                        />
                      </div>
                    );
                  })}

                  {/* Mobile: Show channel labels with toggles */}
                  <div className="sm:hidden px-4 pb-4 grid grid-cols-2 gap-3">
                    {CHANNELS.map((channel) => {
                      const meta = CHANNEL_META[channel];
                      const Icon = meta.icon;
                      const pref = preferences.find((p) => p.channel === channel);
                      const isChecked = pref ? (pref as unknown as Record<string, boolean>)[row.key] : false;

                      return (
                        <div
                          key={`mobile-${channel}-${row.key}`}
                          className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">
                              {meta.label}
                            </span>
                          </div>
                          <Switch
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleToggle(channel, row.key, checked)
                            }
                            aria-label={`${row.label} via ${meta.label}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Info Text */}
          <div className="mt-6 flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-950/20 p-4">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              In-app notifications are always enabled for important updates.
              You can customize email, SMS, and push notification preferences
              for each category above.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
