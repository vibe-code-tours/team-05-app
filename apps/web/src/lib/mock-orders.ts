import { Order, CargoMilestone } from '@/types/order';

const CARGO_MILESTONES: { milestone: CargoMilestone; label: string }[] = [
  { milestone: 'ORDER_PLACED', label: 'Order Placed' },
  { milestone: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed' },
  { milestone: 'WAITING_PURCHASE', label: 'Waiting Purchase' },
  { milestone: 'PURCHASED', label: 'Purchased' },
  { milestone: 'PACKED', label: 'Packed' },
  { milestone: 'BKK_WAREHOUSE', label: 'Bangkok Warehouse' },
  { milestone: 'EXPORT_CLEARANCE', label: 'Export Clearance' },
  { milestone: 'AIR_CARGO', label: 'Air Cargo' },
  { milestone: 'CUSTOMS', label: 'Customs Clearance' },
  { milestone: 'YGN_WAREHOUSE', label: 'Yangon Warehouse' },
  { milestone: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { milestone: 'DELIVERED', label: 'Delivered' },
];

function buildCargoTracking(upToIndex: number): Order['cargoTracking'] {
  return CARGO_MILESTONES.map((m, i) => ({
    ...m,
    completed: i <= upToIndex,
    timestamp:
      i <= upToIndex
        ? new Date(Date.now() - (upToIndex - i) * 2 * 60 * 60 * 1000).toISOString()
        : null,
    location:
      i <= upToIndex
        ? i < 5
          ? 'Bangkok, Thailand'
          : i < 9
            ? 'In Transit'
            : 'Yangon, Myanmar'
        : undefined,
  }));
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-38472916',
    date: '2026-07-10',
    status: 'shipped',
    total: 285000,
    currency: 'MMK',
    isCargo: true,
    trackingNumber: 'CRG-2026-78432',
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    cargoTracking: buildCargoTracking(7),
    shippingAddress: {
      name: 'Win Naing Soe',
      line1: '42 Pyay Road, Block 10',
      line2: 'Sanchaung Township',
      city: 'Yangon',
      postalCode: '11111',
      country: 'Myanmar',
    },
    mapPoints: [
      { lat: 13.7563, lng: 100.5018, label: 'Bangkok', type: 'origin' },
      { lat: 16.8661, lng: 96.1951, label: 'In Transit', type: 'current' },
      { lat: 16.8661, lng: 96.1951, label: 'Yangon', type: 'destination' },
    ],
    items: [
      {
        id: '1',
        name: 'Premium Wireless Bluetooth Headphones',
        price: 79900,
        quantity: 1,
        image: 'https://via.placeholder.com/80?text=Headphones',
      },
      {
        id: '2',
        name: 'USB-C Fast Charging Cable (2m)',
        price: 12900,
        quantity: 2,
        image: 'https://via.placeholder.com/80?text=Cable',
      },
      {
        id: '3',
        name: 'Laptop Stand - Aluminum',
        price: 45000,
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
    total: 56470,
    currency: 'MMK',
    isCargo: false,
    deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      name: 'Win Naing Soe',
      line1: '42 Pyay Road, Block 10',
      line2: 'Sanchaung Township',
      city: 'Yangon',
      postalCode: '11111',
      country: 'Myanmar',
    },
    items: [
      {
        id: '4',
        name: 'Organic Cotton T-Shirt (L)',
        price: 24900,
        quantity: 2,
        image: 'https://via.placeholder.com/80?text=T-Shirt',
      },
      {
        id: '5',
        name: 'Running Socks (3-Pack)',
        price: 8500,
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
    total: 215000,
    currency: 'MMK',
    isCargo: true,
    deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: 'CRG-2026-65218',
    cargoTracking: buildCargoTracking(11),
    shippingAddress: {
      name: 'Win Naing Soe',
      line1: '42 Pyay Road, Block 10',
      line2: 'Sanchaung Township',
      city: 'Yangon',
      postalCode: '11111',
      country: 'Myanmar',
    },
    items: [
      {
        id: '6',
        name: 'Smart Watch Pro',
        price: 199000,
        quantity: 1,
        image: 'https://via.placeholder.com/80?text=Watch',
      },
      {
        id: '7',
        name: 'Watch Band - Silicone',
        price: 12000,
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
    total: 89900,
    currency: 'MMK',
    isCargo: true,
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    cargoTracking: buildCargoTracking(1),
    shippingAddress: {
      name: 'Win Naing Soe',
      line1: '42 Pyay Road, Block 10',
      line2: 'Sanchaung Township',
      city: 'Yangon',
      postalCode: '11111',
      country: 'Myanmar',
    },
    items: [
      {
        id: '8',
        name: 'Mechanical Keyboard - RGB',
        price: 89900,
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
    total: 34900,
    currency: 'MMK',
    isCargo: false,
    shippingAddress: {
      name: 'Win Naing Soe',
      line1: '42 Pyay Road, Block 10',
      line2: 'Sanchaung Township',
      city: 'Yangon',
      postalCode: '11111',
      country: 'Myanmar',
    },
    items: [
      {
        id: '9',
        name: 'Wireless Mouse - Ergonomic',
        price: 34900,
        quantity: 1,
        image: 'https://via.placeholder.com/80?text=Mouse',
      },
    ],
  },
];
