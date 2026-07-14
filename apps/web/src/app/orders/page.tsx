'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  AlertCircle,
  Search,
  ExternalLink,
  MapPin,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn, formatPrice } from '@/lib/utils';
import { useMyOrders } from '@/lib/services/order.service';
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

const TAB_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

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

function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-0 hover:bg-muted/30 transition-colors"
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Status Icon */}
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                statusConfig.bgColor
              )}
            >
              <StatusIcon className={cn('w-6 h-6', statusConfig.color)} />
            </div>

            {/* Order Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-bold text-foreground">
                  {order.orderNumber}
                </h3>
                <Badge variant={statusConfig.variant} className="text-xs">
                  {statusConfig.label}
                </Badge>
                {order.isCargo && (
                  <Badge variant="secondary" className="text-xs">
                    Cargo
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.date)} &middot; {order.items.length}{' '}
                {order.items.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Total & Expand */}
            <div className="flex items-center gap-3">
              <p className="text-base font-bold text-foreground">
                {formatPrice(order.total, order.currency || 'MMK')}
              </p>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20">
          <div className="p-4 sm:p-5 space-y-4">
            {/* Items Section */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Order Items
              </p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-background rounded-lg border border-border overflow-hidden flex-shrink-0">
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
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground flex-shrink-0">
                      {formatPrice(item.price * item.quantity, order.currency || 'MMK')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Shipping Address */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Shipping Address
              </p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-foreground">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.line1}</p>
                  <p>
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-foreground">Total</span>
              <span className="text-sm font-bold text-foreground">
                {formatPrice(order.total, order.currency || 'MMK')}
              </span>
            </div>

            {/* View Detail Link */}
            <Link href={`/orders/${order.id}`} className="block">
              <Button variant="outline" className="w-full" size="sm">
                View Order Details
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="h-5 bg-muted rounded w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Failed to load orders
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          {message || 'Something went wrong while fetching your orders. Please try again later.'}
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
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          No orders found
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          No orders match your current filters. Try adjusting your search or
          browse our products to place your first order.
        </p>
        <Link href="/products">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Browse Products
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function NoResultsState({ searchTerm }: { searchTerm: string }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          No orders found
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          No orders matching &ldquo;{searchTerm}&rdquo;. Try a different order
          number or clear your search.
        </p>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: apiResponse, isLoading, error } = useMyOrders();

  const apiOrders = apiResponse?.data;

  const mappedOrders = useMemo(() => {
    if (!apiOrders) return [];
    return apiOrders.map(mapApiOrderToUiOrder);
  }, [apiOrders]);

  const filteredOrders = useMemo(() => {
    let orders = mappedOrders;

    // Filter by status tab
    if (activeTab !== 'all') {
      orders = orders.filter((order) => order.status === activeTab);
    }

    // Filter by search term (order number)
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      orders = orders.filter((order) =>
        order.orderNumber.toLowerCase().includes(term)
      );
    }

    return orders;
  }, [activeTab, searchTerm, mappedOrders]);

  const orderCountByStatus = useMemo(() => {
    const counts: Record<string, number> = {
      all: mappedOrders.length,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    mappedOrders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [mappedOrders]);

  const hasFilters = activeTab !== 'all' || searchTerm.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and track your order history
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Error State */}
          {error && !isLoading && <ErrorState message={error.message} />}

          {/* Search Input (hidden while loading) */}
          {!isLoading && !error && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by order number..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Status Filter Tabs (hidden while loading) */}
          {!isLoading && !error && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              defaultValue="all"
            >
              <TabsList className="w-full justify-start overflow-x-auto">
                {TAB_FILTERS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-xs sm:text-sm"
                  >
                    {tab.label}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({orderCountByStatus[tab.value] || 0})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Order Count (hidden while loading) */}
          {!isLoading && !error && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredOrders.length}{' '}
                {filteredOrders.length === 1 ? 'order' : 'orders'}
                {hasFilters && ' found'}
              </p>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveTab('all');
                    setSearchTerm('');
                  }}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && <LoadingSkeleton />}

          {/* Orders List or Empty State */}
          {!isLoading && !error && filteredOrders.length > 0 && (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          {!isLoading && !error && filteredOrders.length === 0 && hasFilters && (
            <NoResultsState searchTerm={searchTerm} />
          )}

          {!isLoading && !error && filteredOrders.length === 0 && !hasFilters && (
            <EmptyState />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
