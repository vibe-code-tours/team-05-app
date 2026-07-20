'use client';

import { useState } from 'react';
import { Search, Package, MapPin, Clock, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Mock cargo data for demo
const MOCK_SHIPMENTS = [
  {
    trackingNumber: 'CM-2024-001',
    status: 'IN_TRANSIT',
    origin: 'Bangkok, Thailand',
    destination: 'Yangon, Myanmar',
    estimatedArrival: '2024-03-25',
    carrier: 'Thai Express',
    milestones: [
      { milestone: 'ORDER_PLACED', label: 'Order Placed', timestamp: '2024-03-15T10:00:00Z', completed: true },
      { milestone: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', timestamp: '2024-03-15T10:15:00Z', completed: true },
      { milestone: 'WAITING_PURCHASE', label: 'Waiting for Purchase', timestamp: '2024-03-16T09:00:00Z', completed: true },
      { milestone: 'PURCHASED', label: 'Purchased', timestamp: '2024-03-17T14:30:00Z', completed: true },
      { milestone: 'PACKED', label: 'Packed', timestamp: '2024-03-18T11:00:00Z', completed: true },
      { milestone: 'BKK_WAREHOUSE', label: 'Bangkok Warehouse', timestamp: '2024-03-19T08:00:00Z', completed: true },
      { milestone: 'EXPORT_CLEARANCE', label: 'Export Clearance', timestamp: '2024-03-20T16:00:00Z', completed: true },
      { milestone: 'AIR_CARGO', label: 'Air Cargo', timestamp: '2024-03-21T22:00:00Z', completed: true },
      { milestone: 'CUSTOMS', label: 'Customs', timestamp: null, completed: false },
      { milestone: 'YGN_WAREHOUSE', label: 'Yangon Warehouse', timestamp: null, completed: false },
      { milestone: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', timestamp: null, completed: false },
      { milestone: 'DELIVERED', label: 'Delivered', timestamp: null, completed: false },
    ],
  },
  {
    trackingNumber: 'CM-2024-002',
    status: 'DELIVERED',
    origin: 'Bangkok, Thailand',
    destination: 'Mandalay, Myanmar',
    estimatedArrival: '2024-03-20',
    carrier: 'Thai Express',
    milestones: [
      { milestone: 'ORDER_PLACED', label: 'Order Placed', timestamp: '2024-03-10T10:00:00Z', completed: true },
      { milestone: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', timestamp: '2024-03-10T10:15:00Z', completed: true },
      { milestone: 'WAITING_PURCHASE', label: 'Waiting for Purchase', timestamp: '2024-03-11T09:00:00Z', completed: true },
      { milestone: 'PURCHASED', label: 'Purchased', timestamp: '2024-03-12T14:30:00Z', completed: true },
      { milestone: 'PACKED', label: 'Packed', timestamp: '2024-03-13T11:00:00Z', completed: true },
      { milestone: 'BKK_WAREHOUSE', label: 'Bangkok Warehouse', timestamp: '2024-03-14T08:00:00Z', completed: true },
      { milestone: 'EXPORT_CLEARANCE', label: 'Export Clearance', timestamp: '2024-03-15T16:00:00Z', completed: true },
      { milestone: 'AIR_CARGO', label: 'Air Cargo', timestamp: '2024-03-16T22:00:00Z', completed: true },
      { milestone: 'CUSTOMS', label: 'Customs', timestamp: '2024-03-17T10:00:00Z', completed: true },
      { milestone: 'YGN_WAREHOUSE', label: 'Yangon Warehouse', timestamp: '2024-03-18T14:00:00Z', completed: true },
      { milestone: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', timestamp: '2024-03-19T09:00:00Z', completed: true },
      { milestone: 'DELIVERED', label: 'Delivered', timestamp: '2024-03-20T15:30:00Z', completed: true },
    ],
  },
];

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

export default function CargoTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedShipment, setSearchedShipment] = useState<typeof MOCK_SHIPMENTS[0] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchedShipment(null);

    // Simulate API call
    setTimeout(() => {
      const found = MOCK_SHIPMENTS.find(
        (s) => s.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()
      );

      if (found) {
        setSearchedShipment(found);
        setError('');
      } else {
        setError('No shipment found with this tracking number. Try: CM-2024-001 or CM-2024-002');
      }
      setIsSearching(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Track
                </Button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Search Result */}
          {searchedShipment && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {searchedShipment.trackingNumber}
                  </CardTitle>
                  <Badge className={getStatusColor(searchedShipment.status)}>
                    {searchedShipment.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Shipment Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm font-medium">{searchedShipment.origin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="text-sm font-medium">{searchedShipment.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">ETA</p>
                      <p className="text-sm font-medium">{searchedShipment.estimatedArrival}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {searchedShipment.milestones.map((event, index) => {
                    const isLast = index === searchedShipment.milestones.length - 1;
                    const isCompleted = event.completed;

                    return (
                      <div key={event.milestone} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Vertical line */}
                        {!isLast && (
                          <div
                            className={`absolute left-[19px] top-[40px] h-[calc(100%-40px)] w-0.5 ${
                              isCompleted && searchedShipment.milestones[index + 1]?.completed
                                ? 'bg-green-500'
                                : isCompleted && !searchedShipment.milestones[index + 1]?.completed
                                ? 'bg-gradient-to-b from-green-500 to-gray-300'
                                : 'bg-gray-300'
                            }`}
                          />
                        )}

                        {/* Icon */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              isCompleted
                                ? 'bg-green-500 text-white shadow-md'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {isCompleted ? (
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
                                isCompleted ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {MILESTONE_LABELS[event.milestone] || event.milestone}
                            </span>
                            {event.timestamp && (
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {formatDate(event.timestamp)}
                              </span>
                            )}
                          </div>
                          {!event.timestamp && !isCompleted && (
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
                      {searchedShipment.milestones.filter((m) => m.completed).length} / {searchedShipment.milestones.length} milestones
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${
                          (searchedShipment.milestones.filter((m) => m.completed).length /
                            searchedShipment.milestones.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Info */}
          {!searchedShipment && !isSearching && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Demo tracking numbers: <strong>CM-2024-001</strong> (In Transit) or <strong>CM-2024-002</strong> (Delivered)
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
