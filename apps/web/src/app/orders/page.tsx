'use client';

import { useState } from 'react';
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

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-38472916',
    date: '2026-07-10',
    status: 'shipped',
    total: 138.96,
    items: [
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
    ],
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-92710458',
    date: '2026-07-05',
    status: 'delivered',
    total: 56.47,
    items: [
      {
        id: '4',
        name: 'Organic Cotton T-Shirt (L)',
        price: 24.99,
        quantity: 2,
        image: 'https://via.placeholder.com/80?text=T-Shirt',
      },
      {
        id: '5',
        name: 'Running Socks (3-Pack)',
        price: 8.50,
        quantity: 1,
        image: 'https://via.placeholder.com/80?text=Socks',
      },
    ],
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-61058327',
    date: '2026-06-28',
    status: 'delivered',
    total: 215.00,
    items: [
      {
        id: '6',
        name: 'Smart Watch Pro',
        price: 199.00,
        quantity: 1,
        image: 'https://via.placeholder.com/80?text=Watch',
      },
      {
        id: '7',
        name: 'Watch Band - Silicone',
        price: 12.00,
        quantity: 1,
        image: 'https://via.placeholder.com/80?text=Band',
      },
    ],
  },
  {
    id: 'order-4',
    orderNumber: 'ORD-74829103',
    date: '2026-06-20',
    status: 'processing',
    total: 89.99,
    items: [
      {
        id: '8',
        name: 'Mechanical Keyboard - RGB',
        price: 89.99,
        quantity: 1,
        image: 'https://via.placeholder.com/80?text=Keyboard',
      },
    ],
  },
  {
    id: 'order-5',
    orderNumber: 'ORD-55390184',
    date: '2026-06-15',
    status: 'cancelled',
    total: 34.99,
    items: [
      {
        id: '9',
        name: 'Wireless Mouse - Ergonomic',
        price: 34.99,
        quantity: 1,
        image: 'https://via.placeholder.com/80?text=Mouse',
      },
    ],
  },
];

const STATUS_CONFIG = {
  processing: {
    label: 'Processing',
    variant: 'warning' as const,
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  shipped: {
    label: 'Shipped',
    variant: 'default' as const,
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  delivered: {
    label: 'Delivered',
    variant: 'success' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive' as const,
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

function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-0 hover:bg-gray-50 transition-colors"
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Order Icon */}
            <div
              className={`w-12 h-12 ${statusConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
            </div>

            {/* Order Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-gray-900">
                  {order.orderNumber}
                </h3>
                <Badge variant={statusConfig.variant} className="text-xs">
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(order.date)} &middot; {order.items.length}{' '}
                {order.items.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Total & Expand */}
            <div className="flex items-center gap-3">
              <p className="text-base font-bold text-gray-900">
                ${order.total.toFixed(2)}
              </p>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </CardContent>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="p-4 sm:p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Order Items
            </p>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
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
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <Separator className="my-3" />

            <div className="flex justify-between text-sm font-bold text-gray-900">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function OrdersPage() {
  const orders = MOCK_ORDERS;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and track your order history
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {orders.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No orders yet
              </h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                When you place an order, it will appear here. Start browsing
                our products to find something you love.
              </p>
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
