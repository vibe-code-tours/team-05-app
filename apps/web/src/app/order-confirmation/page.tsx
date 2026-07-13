'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  Truck,
  ShoppingBag,
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

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const MOCK_ORDER_ITEMS: OrderItem[] = [
  {
    id: '1',
    name: 'Premium Wireless Bluetooth Headphones',
    price: 79.99,
    quantity: 1,
    image: 'https://via.placeholder.com/80?text=Headphones',
  },
  {
    id: '2',
    name: 'USB-C Fast Charging Cable (2m)',
    price: 12.99,
    quantity: 2,
    image: 'https://via.placeholder.com/80?text=Cable',
  },
  {
    id: '3',
    name: 'Laptop Stand - Aluminum',
    price: 45.00,
    quantity: 1,
    image: 'https://via.placeholder.com/80?text=Stand',
  },
];

export default function OrderConfirmationPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Generate order number on mount
  useEffect(() => {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    setOrderNumber(`ORD-${randomDigits}`);
    // Trigger confetti effect after a short delay
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const orderItems = MOCK_ORDER_ITEMS;
  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems],
  );
  const shipping = 5.99;
  const tax = useMemo(() => +(subtotal * 0.05).toFixed(2), [subtotal]);
  const total = useMemo(() => +(subtotal + shipping + tax).toFixed(2), [subtotal, shipping, tax]);

  const shippingAddress = {
    name: 'Win Naing Soe',
    line1: '42 Pyay Road, Block 10',
    line2: 'Sanchaung Township',
    city: 'Yangon',
    postalCode: '11111',
    country: 'Myanmar',
  };

  const paymentMethod = {
    type: 'Credit Card',
    last4: '4242',
    brand: 'Visa',
  };

  // Confetti particles
  const confettiParticles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 1.5 + Math.random() * 2,
        color: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][
          i % 6
        ],
        size: 6 + Math.random() * 6,
      })),
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute opacity-0 animate-[confetti-fall_3s_ease-out_forwards]"
              style={{
                left: `${particle.left}%`,
                top: '-20px',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                borderRadius: '2px',
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
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
          {/* Green Checkmark Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-checkmark">
                <CheckCircle className="w-14 h-14 text-green-600" strokeWidth={2} />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 w-24 h-24 bg-green-200 rounded-full animate-ping opacity-20" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          {orderNumber && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-green-100 text-green-800 border-green-200">
                {orderNumber}
              </Badge>
            </div>
          )}
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
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <Separator className="my-4" />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
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
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{shippingAddress.name}</p>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.postalCode}
                </p>
                <p>{shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">
                    {paymentMethod.brand}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{paymentMethod.type}</p>
                  <p>**** **** **** {paymentMethod.last4}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estimated Delivery */}
        <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Estimated Delivery
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/orders" className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
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
