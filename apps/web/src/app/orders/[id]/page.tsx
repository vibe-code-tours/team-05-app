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
  CircleDot,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn, formatPrice } from '@/lib/utils';
import { useOrder } from '@/lib/services/order.service';
import type { Order as ApiOrder } from '@/lib/services/order.service';
import type { Order, OrderStatus } from '@/types/order';

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

function mapApiStatusToDisplayStatus(
  apiStatus: ApiOrder['status']
): OrderStatus {
  switch (apiStatus) {
    case 'PENDING':
    case 'CONFIRMED':
    case 'PROCESSING':
      return 'processing';
    case 'SHIPPED':
      return 'shipped';
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'processing';
  }
}

function mapApiOrderToUiOrder(apiOrder: ApiOrder): Order {
  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    date: apiOrder.createdAt,
    status: mapApiStatusToDisplayStatus(apiOrder.status),
    total: apiOrder.total,
    currency: 'MMK',
    isCargo: false,
    items: apiOrder.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0] || '/placeholder.png',
    })),
    shippingAddress: {
      name: apiOrder.shippingAddress.name,
      line1: apiOrder.shippingAddress.address,
      city: apiOrder.shippingAddress.city,
      postalCode: apiOrder.shippingAddress.zipCode || '',
      country: 'Myanmar',
    },
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-4 bg-muted rounded w-24 mb-4 animate-pulse" />
            <div className="h-7 bg-muted rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4 animate-pulse">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-2/3" />
                          <div className="h-3 bg-muted rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-4 bg-muted rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
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
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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

function ErrorState({ message }: { message?: string }) {
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
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Failed to load order
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                {message || 'Something went wrong while fetching this order. Please try again later.'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Try Again
              </Button>
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
  const { data: apiResponse, isLoading, error } = useOrder(id);

  const apiOrder = apiResponse?.data;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!apiOrder) {
    return <OrderNotFound />;
  }

  const order = mapApiOrderToUiOrder(apiOrder);
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;
  const currency = order.currency || 'MMK';

  // Calculate subtotal from items
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = order.isCargo ? 15000 : 0;
  const total = order.total;

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
                          <p className="text-xs text-muted-foreground mt-1">
                            Qty: {item.quantity}
                          </p>
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
                    <p>
                      {order.shippingAddress.city},{' '}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>

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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
