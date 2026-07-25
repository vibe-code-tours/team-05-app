'use client';

import { useState, useMemo } from 'react';
import { Search, Package, MapPin, Clock, Truck, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useCargoByTracking } from '@/lib/services/cargo.service';

// ── Constants ──────────────────────────────────────────────────────────────────

const MILESTONE_SEQUENCE = [
  'ORDER_PLACED',
  'PAYMENT_CONFIRMED',
  'WAITING_PURCHASE',
  'PURCHASED',
  'PACKED',
  'BKK_WAREHOUSE',
  'EXPORT_CLEARANCE',
  'AIR_CARGO',
  'CUSTOMS',
  'YGN_WAREHOUSE',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
] as const;

const MILESTONE_LABELS: Record<string, string> = {
  ORDER_PLACED: 'Order Placed',
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  WAITING_PURCHASE: 'Waiting for Purchase',
  PURCHASED: 'Purchased',
  PACKED: 'Packed',
  BKK_WAREHOUSE: 'Bangkok Warehouse',
  EXPORT_CLEARANCE: 'Export Clearance',
  AIR_CARGO: 'Air Cargo',
  CUSTOMS: 'Customs',
  YGN_WAREHOUSE: 'Yangon Warehouse',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

interface MilestoneDisplay {
  milestone: string;
  label: string;
  timestamp: string | null;
  location: string | null;
  completed: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(timestamp: string | null): string {
  if (!timestamp) return '';
  try {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(date);
  }
}

function getStatusBadge(milestone: string): { label: string; className: string } {
  switch (milestone) {
    case 'DELIVERED':
      return { label: 'Delivered', className: 'bg-green-100 text-green-800' };
    case 'CUSTOMS':
      return { label: 'Customs', className: 'bg-yellow-100 text-yellow-800' };
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out for Delivery', className: 'bg-blue-100 text-blue-800' };
    case 'YGN_WAREHOUSE':
      return { label: 'In Transit', className: 'bg-blue-100 text-blue-800' };
    default:
      return { label: 'In Transit', className: 'bg-blue-100 text-blue-800' };
  }
}

/** Build the full 12-milestone timeline from API history + currentMilestone. */
function buildMilestones(
  history: Array<{ milestone: string; timestamp: string; location?: string | null }>,
  currentMilestone: string,
): MilestoneDisplay[] {
  const currentIndex = MILESTONE_SEQUENCE.indexOf(currentMilestone as (typeof MILESTONE_SEQUENCE)[number]);
  const historyMap = new Map(history.map((h) => [h.milestone, h]));

  return MILESTONE_SEQUENCE.map((milestone, index) => {
    const entry = historyMap.get(milestone);
    const isCompleted = index <= currentIndex;
    return {
      milestone,
      label: MILESTONE_LABELS[milestone] || milestone,
      timestamp: entry?.timestamp ?? null,
      location: entry?.location ?? null,
      completed: isCompleted,
    };
  });
}

// ── Components ─────────────────────────────────────────────────────────────────

function InitialState({ onTrackDemo }: { onTrackDemo: (tn: string) => void }) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Enter a tracking number above to track your shipment.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onTrackDemo('CM-2024-001')}>
            Try CM-2024-001
          </Button>
          <Button variant="outline" size="sm" onClick={() => onTrackDemo('CM-2024-002')}>
            Try CM-2024-002
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        <p className="mt-3 text-sm text-muted-foreground">Looking up your shipment...</p>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Shipment Not Found</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{message}</p>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CargoTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedTrackingNumber, setSearchedTrackingNumber] = useState('');

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
  } = useCargoByTracking(searchedTrackingNumber);

  // Reset when user clears input or changes it
  const handleSearch = () => {
    if (!trackingNumber.trim()) return;
    setSearchedTrackingNumber(trackingNumber.trim());
  };

  const handleTryDemo = (tn: string) => {
    setTrackingNumber(tn);
    setSearchedTrackingNumber(tn);
  };

  // Build display model from API response
  const shipment = useMemo(() => {
    if (!apiResponse?.data) return null;
    const d = apiResponse.data;

    const history = d.history ?? [];
    const currentMilestone = d.currentMilestone ?? 'ORDER_PLACED';
    const milestones = buildMilestones(history, currentMilestone);

    // Derive destination from the order's shipping address
    const addr = d.order?.shippingAddress;
    const destination = addr
      ? `${addr.city}${addr.state ? `, ${addr.state}` : ''}, Myanmar`
      : 'Myanmar';

    return {
      trackingNumber: d.trackingNumber,
      carrier: d.carrier,
      origin: d.origin,
      destination,
      estimatedArrival: d.estimatedArrival,
      currentMilestone,
      milestones,
    };
  }, [apiResponse]);

  const statusBadge = shipment ? getStatusBadge(shipment.currentMilestone) : null;
  const completedCount = shipment?.milestones.filter((m) => m.completed).length ?? 0;
  const totalCount = MILESTONE_SEQUENCE.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Determine if we're in a loading state
  const isSearching = isLoading || isFetching;
  const searchError =
    error && searchedTrackingNumber
      ? (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        'No shipment found with this tracking number.'
      : '';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Cargo Tracking</h1>
          </div>

          {/* Search Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Track Your Shipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Enter tracking number (e.g., CM-2024-001)"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching || !trackingNumber.trim()}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Track
                </Button>
              </div>
              {searchError && (
                <p className="mt-3 text-sm text-red-600">{searchError}</p>
              )}
            </CardContent>
          </Card>

          {/* Results or initial state */}
          {isSearching && <LoadingState />}

          {!isSearching && searchError && <ErrorState message={searchError} />}

          {!isSearching && !searchError && shipment && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    <CardTitle className="text-lg">{shipment.trackingNumber}</CardTitle>
                    {shipment.carrier && (
                      <span className="text-sm text-muted-foreground ml-1">
                        ({shipment.carrier})
                      </span>
                    )}
                  </div>
                  {statusBadge && (
                    <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Shipment Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm font-medium">{shipment.origin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="text-sm font-medium">{shipment.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">ETA</p>
                      <p className="text-sm font-medium">
                        {formatDateShort(shipment.estimatedArrival)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {shipment.milestones.map((event, index) => {
                    const isLast = index === totalCount - 1;
                    const nextCompleted = index < totalCount - 1 && shipment.milestones[index + 1]?.completed;

                    return (
                      <div key={event.milestone} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Vertical line */}
                        {!isLast && (
                          <div
                            className={`absolute left-[19px] top-[40px] h-[calc(100%-40px)] w-0.5 ${
                              event.completed && nextCompleted
                                ? 'bg-green-500'
                                : event.completed && !nextCompleted
                                  ? 'bg-gradient-to-b from-green-500 to-gray-300'
                                  : 'bg-gray-300'
                            }`}
                          />
                        )}

                        {/* Icon */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              event.completed
                                ? 'bg-green-500 text-white shadow-md'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {event.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <span
                              className={`font-medium ${
                                event.completed ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {event.label}
                            </span>
                            {event.timestamp && (
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {formatDate(event.timestamp)}
                              </span>
                            )}
                          </div>
                          {event.location && (
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          )}
                          {!event.completed && !event.timestamp && (
                            <p className="mt-0.5 text-sm text-gray-400">Pending</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Summary */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {completedCount} / {totalCount} milestones
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Initial state before any search */}
          {!searchedTrackingNumber && !isSearching && (
            <InitialState onTrackDemo={handleTryDemo} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
