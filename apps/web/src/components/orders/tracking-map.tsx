'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plane } from 'lucide-react';
import { TrackingMapPoint } from '@/types/order';

interface TrackingMapProps {
  points: TrackingMapPoint[];
  origin: string;
  destination: string;
}

const POINT_CONFIG = {
  origin: {
    color: 'bg-blue-500',
    ring: 'ring-blue-200',
    dot: 'bg-blue-600',
    label: 'Origin',
  },
  current: {
    color: 'bg-green-500',
    ring: 'ring-green-200',
    dot: 'bg-green-600',
    label: 'Current',
  },
  destination: {
    color: 'bg-red-500',
    ring: 'ring-red-200',
    dot: 'bg-red-600',
    label: 'Destination',
  },
} as const;

function getCountryEmoji(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('bangkok') || lower.includes('thailand') || lower.includes('bkk')) {
    return '\u{1F1F9}\u{1F1ED}';
  }
  if (lower.includes('yangon') || lower.includes('myanmar') || lower.includes('rangoon')) {
    return '\u{1F1F2}\u{1F1F2}';
  }
  return '';
}

export function TrackingMap({ points, origin, destination }: TrackingMapProps) {
  const originPoint = points.find((p) => p.type === 'origin');
  const currentPoint = points.find((p) => p.type === 'current');
  const destinationPoint = points.find((p) => p.type === 'destination');

  const visiblePoints = [originPoint, currentPoint, destinationPoint].filter(
    (p): p is TrackingMapPoint => p !== undefined
  );

  const originEmoji = getCountryEmoji(origin);
  const destinationEmoji = getCountryEmoji(destination);

  return (
    <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Shipment Route</h3>
      </div>

      {/* Route visualization - horizontal on desktop, vertical on mobile */}
      <div className="relative">
        {/* Mobile: Vertical layout */}
        <div className="flex flex-col items-start gap-0 md:hidden">
          {visiblePoints.map((point, index) => {
            const config = POINT_CONFIG[point.type];
            const isLast = index === visiblePoints.length - 1;

            return (
              <div key={point.type} className="flex w-full">
                {/* Line + dot column */}
                <div className="flex flex-col items-center">
                  {/* Top line (not for first point) */}
                  {!isLast && (
                    <div
                      className={cn(
                        'w-0.5 h-16',
                        'bg-gradient-to-b',
                        index === 0
                          ? 'from-blue-400 to-green-400'
                          : 'from-green-400 to-red-400'
                      )}
                    />
                  )}
                  {/* Point dot */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full ring-4 flex items-center justify-center',
                        config.color,
                        config.ring
                      )}
                    >
                      {point.type === 'current' && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-50" />
                      )}
                      <span className="relative text-white text-xs font-bold">
                        {point.type === 'origin' && '1'}
                        {point.type === 'current' && <Plane className="h-4 w-4" />}
                        {point.type === 'destination' && '3'}
                      </span>
                    </div>
                  </div>
                  {/* Bottom line (not for last point) */}
                  {!isLast && (
                    <div
                      className={cn(
                        'w-0.5 h-16',
                        'bg-gradient-to-b',
                        index === 0
                          ? 'from-blue-400 to-green-400'
                          : 'from-green-400 to-red-400'
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="ml-4 flex flex-col justify-center pb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {point.label}
                    </span>
                    {point.type === 'origin' && originEmoji && (
                      <span className="text-lg">{originEmoji}</span>
                    )}
                    {point.type === 'destination' && destinationEmoji && (
                      <span className="text-lg">{destinationEmoji}</span>
                    )}
                  </div>
                  <Badge
                    variant={point.type === 'current' ? 'success' : point.type === 'origin' ? 'default' : 'destructive'}
                    className="mt-1 w-fit text-xs"
                  >
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex md:items-center md:justify-between">
          {visiblePoints.map((point, index) => {
            const config = POINT_CONFIG[point.type];
            const isLast = index === visiblePoints.length - 1;

            return (
              <div key={point.type} className="flex flex-1 items-center">
                {/* Point */}
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={cn(
                        'h-12 w-12 rounded-full ring-4 flex items-center justify-center',
                        config.color,
                        config.ring
                      )}
                    >
                      {point.type === 'current' && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-50" />
                      )}
                      <span className="relative text-white text-sm font-bold">
                        {point.type === 'origin' && '1'}
                        {point.type === 'current' && <Plane className="h-5 w-5" />}
                        {point.type === 'destination' && '3'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {point.label}
                      </span>
                      {point.type === 'origin' && originEmoji && (
                        <span className="text-lg">{originEmoji}</span>
                      )}
                      {point.type === 'destination' && destinationEmoji && (
                        <span className="text-lg">{destinationEmoji}</span>
                      )}
                    </div>
                    <Badge
                      variant={point.type === 'current' ? 'success' : point.type === 'origin' ? 'default' : 'destructive'}
                      className="mt-1 text-xs"
                    >
                      {config.label}
                    </Badge>
                  </div>
                </div>

                {/* Connecting line */}
                {!isLast && (
                  <div className="mx-4 flex-1">
                    <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'absolute inset-0',
                          index === 0
                            ? 'bg-gradient-to-r from-blue-400 to-green-400'
                            : 'bg-gradient-to-r from-green-400 to-red-400'
                        )}
                      />
                      <div
                        className={cn(
                          'absolute inset-0',
                          'animate-[dash_2s_linear_infinite]'
                        )}
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.6) 6px, rgba(255,255,255,0.6) 12px)',
                          backgroundSize: '12px 100%',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Route summary */}
      <div className="mt-6 flex items-center justify-between rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <span>
          {originEmoji && <span className="mr-1">{originEmoji}</span>}
          {origin}
        </span>
        <span className="text-xs">{'→'}</span>
        <span>
          {destinationEmoji && <span className="mr-1">{destinationEmoji}</span>}
          {destination}
        </span>
      </div>

      {/* Inline keyframes for dash animation */}
      <style jsx>{`
        @keyframes dash {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 24px 0;
          }
        }
      `}</style>
    </div>
  );
}
