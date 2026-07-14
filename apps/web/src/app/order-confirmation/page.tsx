'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  Truck,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrder } from '@/lib/services/order.service';
import { formatPrice } from '@/lib/utils';

// Confetti colors
const CONFETTI_COLORS = [
  '#10B981',
  '#3B82F6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: apiResponse, isLoading, error } = useOrder(orderId!);
  const order = apiResponse?.data;

  const showConfetti = useConfetti(!!order);

  // Estimated delivery: 5 business days (7 calendar days) from order creation
  const estimatedDelivery = useMemo(() => {
    if (!order?.createdAt) return null;
    const created = new Date(order.createdAt);
    const delivery = new Date(created);
    let businessDays = 0;
    while (businessDays < 5) {
      delivery.setDate(delivery.getDate() + 1);
      const day = delivery.getDay();
      if (day !== 0 && day !== 6) businessDays++;
    }
    return delivery;
  }, [order?.createdAt]);

  // Loading skeleton
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Error / not found state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Order Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              {orderId
                ? `We couldn't find order ${orderId}. It may have been removed or the link is invalid.`
                : 'No order ID was provided. Please check your link and try again.'}
            </p>
            <Link href="/products">
              <Button className="w-full">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <ConfettiOverlay />
      )}

      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
          }
        }
        @keyframes checkmark-pop {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-checkmark {
          animation: checkmark-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Success Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-checkmark">
                <CheckCircle className="w-14 h-14 text-green-600" strokeWidth={2} />
              </div>
              <div className="absolute inset-0 w-24 h-24 bg-green-200 rounded-full animate-ping opacity-20" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <div className="mt-4">
            <Badge
              variant="secondary"
              className="text-sm px-4 py-1.5 bg-green-100 text-green-800 border-green-200"
            >
              {order.orderNumber}
            </Badge>
          </div>
        </div>

        {/* Order Summary Card */}
        <Card className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-blue-600" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground flex-shrink-0">
                  {formatPrice(item.totalPrice)}
                </p>
              </div>
            ))}

            <Separator className="my-4" />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Shipping Address */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-5 h-5 text-blue-600" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">
                  {order.shippingAddress.name}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                {order.shippingAddress.phone && (
                  <p>{order.shippingAddress.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-blue-100 rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-700" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Payment Status</p>
                  <Badge
                    variant={
                      order.paymentStatus === 'PAID'
                        ? 'default'
                        : order.paymentStatus === 'REFUNDED'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="mt-1"
                  >
                    {order.paymentStatus === 'PAID'
                      ? 'Paid'
                      : order.paymentStatus === 'REFUNDED'
                        ? 'Refunded'
                        : 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estimated Delivery */}
        {estimatedDelivery && (
          <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Estimated Delivery
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {estimatedDelivery.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <Link href={`/orders/${order.id}`} className="flex-1">
            <Button className="w-full" size="lg">
              <Package className="w-5 h-5 mr-2" />
              Track Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header skeleton */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-80 mx-auto" />
          <div className="mt-4">
            <Skeleton className="h-7 w-32 mx-auto rounded-full" />
          </div>
        </div>

        {/* Order summary skeleton */}
        <Skeleton className="h-48 w-full rounded-lg mb-6" />

        {/* Shipping & payment skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-36 rounded-lg" />
          <Skeleton className="h-36 rounded-lg" />
        </div>

        {/* Delivery skeleton */}
        <Skeleton className="h-20 w-full rounded-lg mb-8" />

        {/* Buttons skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Confetti hook
function useConfetti(orderLoaded: boolean): boolean {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (orderLoaded) {
      const timer = setTimeout(() => setShowConfetti(true), 300);
      return () => clearTimeout(timer);
    }
  }, [orderLoaded]);

  return showConfetti;
}

// Confetti overlay
function ConfettiOverlay() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 1.5 + Math.random() * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute opacity-0 animate-[confetti-fall_3s_ease-out_forwards]"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
