'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicLayout } from '@/components/layout/public-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Truck, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useCargoByTracking } from '@/lib/services/cargo.service';

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

function formatDate(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return timestamp;
  }
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialTracking = searchParams.get('tracking') || '';

  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [searchedTrackingNumber, setSearchedTrackingNumber] = useState(initialTracking);

  useEffect(() => {
    const tracking = searchParams.get('tracking');
    if (tracking) {
      setTrackingNumber(tracking);
      setSearchedTrackingNumber(tracking);
    }
  }, [searchParams]);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
  } = useCargoByTracking(searchedTrackingNumber);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setSearchedTrackingNumber(trackingNumber.trim());
  };

  const shipment = useMemo(() => {
    if (!apiResponse?.data) return null;
    const d = apiResponse.data;
    const history = d.history ?? [];
    return {
      orderNumber: d.trackingNumber,
      status: d.currentMilestone,
      estimatedArrival: d.estimatedArrival
        ? formatDate(d.estimatedArrival as string)
        : 'N/A',
      history: history.map((h: any) => ({
        milestone: MILESTONE_LABELS[h.milestone] || h.milestone,
        date: h.timestamp ? formatDate(h.timestamp) : '',
        location: h.notes ?? h.location ?? '',
      })),
    };
  }, [apiResponse]);

  const isSearching = isLoading || isFetching;
  const searchError =
    error && searchedTrackingNumber
      ? (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        'No tracking information found for this number.'
      : '';

  return (
    <>
      <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Track Your Order</h1>
          <p className="text-lg text-muted-foreground">
            Enter your tracking number to see real-time cargo tracking updates.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleTrack} className="flex gap-3">
              <Input
                placeholder="Enter tracking number (e.g., CM-2024-001)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching || !trackingNumber.trim()}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading state */}
        {isSearching && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
              <p className="mt-3 text-sm text-muted-foreground">Looking up your shipment...</p>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {!isSearching && searchError && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Not Found</h3>
              <p className="text-sm text-muted-foreground">{searchError}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!isSearching && !searchError && shipment && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">{shipment.orderNumber}</h2>
                  <p className="text-sm text-muted-foreground">
                    Estimated arrival: {shipment.estimatedArrival}
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  <Truck className="h-4 w-4 mr-1.5" />
                  {shipment.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="space-y-3">
                {shipment.history.map((item, index) => (
                  <div key={`${item.milestone}-${index}`} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {index === shipment.history.length - 1 ? (
                        <Truck className="h-4 w-4 text-primary" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.milestone}</p>
                      {item.location && (
                        <p className="text-sm text-muted-foreground">{item.location}</p>
                      )}
                    </div>
                    {item.date && (
                      <div className="text-sm text-muted-foreground flex-shrink-0">{item.date}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </>
  );
}

export default function TrackOrderPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}>
          <TrackOrderContent />
        </Suspense>
      </div>
    </PublicLayout>
  );
}
