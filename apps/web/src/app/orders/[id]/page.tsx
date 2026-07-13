'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  ShoppingBag,
  MapPin,
  Calendar,
  Hash,
  ExternalLink,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CargoTimeline } from '@/components/orders/cargo-timeline';
import { TrackingMap } from '@/components/orders/tracking-map';
import { ShareTrackingLink } from '@/components/orders/share-tracking-link';
import { MOCK_ORDERS } from '@/lib/mock-orders';
import { cn, formatPrice } from '@/lib/utils';
import { Order, OrderStatus } from '@/types/order';

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    variant: 'warning' | 'default' | 'success' | 'destructive';
    icon: typeof Clock;
    color: string;
    bgColor: string;
  }
> = {
  processing: {
    label: 'Processing',
    variant: 'warning',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  shipped: {
    label: 'Shipped',
    variant: 'default',
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  delivered: {
    label: 'Delivered',
    variant: 'success',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Order not found
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                The order you are looking for does not exist or may have been
                removed.
              </p>
              <Link href="/orders">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  View My Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const order = MOCK_ORDERS.find((o) => o.id === id);

  if (!order) {
    return <OrderNotFound />;
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;
  const currency = order.currency || 'MMK';

  // Calculate subtotal from items
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = order.isCargo ? 15000 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = order.total;

  // Determine if we should show estimated delivery
  const showEstimatedDelivery =
    order.estimatedDelivery &&
    (order.status === 'processing' || order.status === 'shipped');

  // Get origin and destination from mapPoints for TrackingMap
  const originPoint = order.mapPoints?.find((p) => p.type === 'origin');
  const destinationPoint = order.mapPoints?.find(
    (p) => p.type === 'destination'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed on {formatDate(order.date)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusConfig.variant}>
                  <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                  {statusConfig.label}
                </Badge>
                {order.isCargo && (
                  <Badge variant="secondary">
                    <Package className="w-3.5 h-3.5 mr-1.5" />
                    Cargo
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Estimated Delivery Banner */}
          {showEstimatedDelivery && order.estimatedDelivery && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Estimated Delivery
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatDateShort(order.estimatedDelivery)}
                    </p>
                  </div>
                  {order.status === 'shipped' && (
                    <Badge variant="default" className="ml-auto">
                      <Truck className="w-3.5 h-3.5 mr-1.5" />
                      In Transit
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    Order Items ({order.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-border">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="w-16 h-16 bg-background rounded-lg border border-border overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                            {item.variant && (
                              <>
                                <span className="text-muted-foreground">
                                  &middot;
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {item.variant}
                                </p>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatPrice(item.price, currency)} each
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground flex-shrink-0">
                          {formatPrice(item.price * item.quantity, currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cargo Timeline */}
              {order.isCargo && order.cargoTracking && (
                <CargoTimeline events={order.cargoTracking} />
              )}

              {/* Tracking Map */}
              {order.isCargo &&
                order.mapPoints &&
                order.mapPoints.length > 0 &&
                originPoint &&
                destinationPoint && (
                  <Card>
                    <CardContent className="p-0">
                      <TrackingMap
                        points={order.mapPoints}
                        origin={originPoint.label}
                        destination={destinationPoint.label}
                      />
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {shipping > 0
                        ? formatPrice(shipping, currency)
                        : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span className="text-foreground">
                      {formatPrice(tax, currency)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-foreground">
                      Total
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(total, currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-foreground space-y-0.5">
                    <p className="font-medium">
                      {order.shippingAddress.name}
                    </p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && (
                      <p>{order.shippingAddress.line2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city},{' '}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Share Tracking Link */}
              {order.isCargo && order.trackingNumber && (
                <ShareTrackingLink
                  orderNumber={order.orderNumber}
                  trackingNumber={order.trackingNumber}
                />
              )}

              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Info</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Order Date
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(order.date)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <CircleDot
                      className={cn('w-4 h-4 flex-shrink-0', statusConfig.color)}
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium text-foreground">
                        {statusConfig.label}
                      </p>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Tracking Number
                          </p>
                          <p className="text-sm font-medium text-foreground font-mono">
                            {order.trackingNumber}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {order.shippedAt && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Shipped At
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {formatDateTime(order.shippedAt)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {order.deliveredAt && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Delivered At
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {formatDateTime(order.deliveredAt)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full sm:w-auto">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
              </a>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
