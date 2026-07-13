'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  CreditCard,
  Clock,
  ShoppingBag,
  Package,
  Building2,
  FileCheck,
  Plane,
  ShieldCheck,
  Warehouse,
  Truck,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { CargoTrackingEvent, CargoMilestone } from '@/types/order';

const CARGO_MILESTONE_ICONS: Record<CargoMilestone, LucideIcon> = {
  ORDER_PLACED: ShoppingCart,
  PAYMENT_CONFIRMED: CreditCard,
  WAITING_PURCHASE: Clock,
  PURCHASED: ShoppingBag,
  PACKED: Package,
  BKK_WAREHOUSE: Building2,
  EXPORT_CLEARANCE: FileCheck,
  AIR_CARGO: Plane,
  CUSTOMS: ShieldCheck,
  YGN_WAREHOUSE: Warehouse,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle,
};

interface CargoTimelineProps {
  events: CargoTrackingEvent[];
}

function formatDate(timestamp: string | null): string {
  if (!timestamp) return '';
  try {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
  } catch {
    return timestamp;
  }
}

export function CargoTimeline({ events }: CargoTimelineProps) {
  // Find the last completed milestone index for "current" state
  const lastCompletedIndex = events.reduce(
    (acc, event, index) => (event.completed ? index : acc),
    -1
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-muted-foreground" />
          Cargo Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          {events.map((event, index) => {
            const Icon = CARGO_MILESTONE_ICONS[event.milestone] || Package;
            const isCompleted = event.completed;
            const isCurrent = index === lastCompletedIndex && isCompleted;
            const isPending = !isCompleted;
            const isLast = index === events.length - 1;

            return (
              <div key={event.milestone} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Vertical line connector */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-[19px] top-[40px] h-[calc(100%-40px)] w-0.5',
                      isCompleted && events[index + 1]?.completed
                        ? 'bg-green-500'
                        : isCompleted && !events[index + 1]?.completed
                        ? 'bg-gradient-to-b from-green-500 to-gray-300'
                        : 'bg-gray-300'
                    )}
                  />
                )}

                {/* Milestone icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300',
                      isCompleted && !isCurrent &&
                        'bg-green-500 text-white shadow-md',
                      isCurrent &&
                        'bg-green-500 text-white shadow-lg ring-4 ring-green-200',
                      isPending &&
                        'bg-gray-200 text-gray-400'
                    )}
                  >
                    {isCurrent && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-30" />
                    )}
                    <Icon className="relative h-5 w-5" />
                  </div>
                </div>

                {/* Event details */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'font-medium',
                          isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {event.label}
                      </span>
                      {isCurrent && (
                        <Badge variant="success" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {event.milestone === 'DELIVERED' && event.completed && (
                        <Badge variant="success" className="text-xs">
                          Delivered
                        </Badge>
                      )}
                    </div>
                    {event.timestamp && (
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(event.timestamp)}
                      </span>
                    )}
                  </div>
                  {event.location && (
                    <p
                      className={cn(
                        'mt-0.5 text-sm',
                        isCompleted ? 'text-muted-foreground' : 'text-gray-400'
                      )}
                    >
                      {event.location}
                    </p>
                  )}
                  {!event.timestamp && isPending && (
                    <p className="mt-0.5 text-sm text-gray-400">Pending</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {events.length > 0 && (
          <div className="mt-6 rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium">
              {events.filter((e) => e.completed).length}
            </span>{' '}
            of{' '}
            <span className="font-medium">{events.length}</span> milestones
            completed
          </div>
        )}
      </CardContent>
    </Card>
  );
}
