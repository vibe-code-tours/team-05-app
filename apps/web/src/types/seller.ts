// Seller Dashboard Types

export interface SellerProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  storeName: string;
  rating: number;
  totalReviews: number;
  joinedDate: string;
}

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  currency: string;
  monthlyGrowth: number;
  averageOrderValue: number;
}

export interface SellerProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  stock: number;
  sold: number;
  status: "active" | "inactive" | "out_of_stock";
  category: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export type SellerOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface SellerOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: SellerOrderItem[];
  total: number;
  currency: string;
  status: SellerOrderStatus;
  isCargo: boolean;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export type CargoMilestoneStatus =
  | "order_placed"
  | "payment_confirmed"
  | "waiting_purchase"
  | "purchased"
  | "packed"
  | "bkk_warehouse"
  | "export_clearance"
  | "air_cargo"
  | "customs"
  | "ygn_warehouse"
  | "out_for_delivery"
  | "delivered";

export interface CargoMilestone {
  status: CargoMilestoneStatus;
  label: string;
  location?: string;
  completedAt?: string;
  isCurrent: boolean;
}

export type CargoShipmentStatus =
  | "preparing"
  | "in_transit"
  | "customs"
  | "delivered";

export interface CargoShipment {
  id: string;
  shipmentNumber: string;
  orderNumber: string;
  destination: string;
  status: CargoShipmentStatus;
  currentMilestone: CargoMilestoneStatus;
  milestones: CargoMilestone[];
  currentLocation: string;
  estimatedArrival: string;
  weight: number;
  weightUnit: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerDashboardData {
  profile: SellerProfile;
  metrics: SalesMetrics;
  recentProducts: SellerProduct[];
  recentOrders: SellerOrder[];
  activeShipments: CargoShipment[];
}
