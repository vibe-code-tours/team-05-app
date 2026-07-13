export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type CargoMilestone =
  | 'ORDER_PLACED'
  | 'PAYMENT_CONFIRMED'
  | 'WAITING_PURCHASE'
  | 'PURCHASED'
  | 'PACKED'
  | 'BKK_WAREHOUSE'
  | 'EXPORT_CLEARANCE'
  | 'AIR_CARGO'
  | 'CUSTOMS'
  | 'YGN_WAREHOUSE'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

export interface CargoTrackingEvent {
  milestone: CargoMilestone;
  label: string;
  location?: string;
  timestamp: string | null;
  completed: boolean;
}

export interface TrackingMapPoint {
  lat: number;
  lng: number;
  label: string;
  type: 'origin' | 'current' | 'destination';
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  currency: string;
  items: OrderItem[];
  isCargo: boolean;
  cargoTracking?: CargoTrackingEvent[];
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  mapPoints?: TrackingMapPoint[];
}
