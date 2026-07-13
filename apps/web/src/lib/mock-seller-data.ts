import type {
  SellerProfile,
  SalesMetrics,
  SellerProduct,
  SellerOrder,
  CargoShipment,
  SellerDashboardData,
} from "@/types/seller";

export const mockSellerProfile: SellerProfile = {
  id: "seller-001",
  name: "Aung Myo",
  email: "aungmyo@crossmart.mm",
  avatar: "/avatars/seller-001.jpg",
  storeName: "Bangkok Fashion Hub",
  rating: 4.8,
  totalReviews: 342,
  joinedDate: "2025-03-15",
};

export const mockSalesMetrics: SalesMetrics = {
  totalSales: 12847500,
  totalOrders: 1243,
  totalProducts: 156,
  totalRevenue: 12847500,
  currency: "MMK",
  monthlyGrowth: 12.5,
  averageOrderValue: 10336,
};

export const mockSellerProducts: SellerProduct[] = [
  {
    id: "prod-001",
    name: "Thai Silk Scarf - Premium Collection",
    sku: "TSF-001",
    price: 25000,
    currency: "MMK",
    stock: 45,
    sold: 230,
    status: "active",
    category: "Fashion Accessories",
    image: "/products/thai-silk-scarf.jpg",
    createdAt: "2025-06-01",
    updatedAt: "2025-07-10",
  },
  {
    id: "prod-002",
    name: "Bangkok Street Style T-Shirt",
    sku: "BST-015",
    price: 15000,
    currency: "MMK",
    stock: 120,
    sold: 567,
    status: "active",
    category: "Clothing",
    image: "/products/bkk-tshirt.jpg",
    createdAt: "2025-04-20",
    updatedAt: "2025-07-12",
  },
  {
    id: "prod-003",
    name: "Ceramic Thai Elephant Figurine",
    sku: "CTE-008",
    price: 35000,
    currency: "MMK",
    stock: 0,
    sold: 89,
    status: "out_of_stock",
    category: "Home Decor",
    image: "/products/elephant-figurine.jpg",
    createdAt: "2025-05-10",
    updatedAt: "2025-07-08",
  },
  {
    id: "prod-004",
    name: "Bamboo Handbag - Natural Craft",
    sku: "BHB-022",
    price: 28000,
    currency: "MMK",
    stock: 67,
    sold: 145,
    status: "active",
    category: "Bags & Accessories",
    image: "/products/bamboo-handbag.jpg",
    createdAt: "2025-06-15",
    updatedAt: "2025-07-11",
  },
  {
    id: "prod-005",
    name: "Thai Herbal Soap Set (6 pcs)",
    sku: "THS-003",
    price: 12000,
    currency: "MMK",
    stock: 200,
    sold: 412,
    status: "active",
    category: "Beauty & Health",
    image: "/products/herbal-soap.jpg",
    createdAt: "2025-03-20",
    updatedAt: "2025-07-13",
  },
];

export const mockSellerOrders: SellerOrder[] = [
  {
    id: "ord-001",
    orderNumber: "CM-2025-0891",
    customerName: "Khin Mar",
    customerEmail: "khinmar@gmail.com",
    items: [
      {
        id: "item-001",
        productName: "Thai Silk Scarf - Premium Collection",
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000,
      },
      {
        id: "item-002",
        productName: "Thai Herbal Soap Set (6 pcs)",
        quantity: 1,
        unitPrice: 12000,
        totalPrice: 12000,
      },
    ],
    total: 62000,
    currency: "MMK",
    status: "shipped",
    isCargo: false,
    createdAt: "2025-07-12T08:30:00Z",
    shippedAt: "2025-07-13T10:00:00Z",
  },
  {
    id: "ord-002",
    orderNumber: "CM-2025-0892",
    customerName: "Tun Aung",
    customerEmail: "tunaung@yahoo.com",
    items: [
      {
        id: "item-003",
        productName: "Bangkok Street Style T-Shirt",
        quantity: 3,
        unitPrice: 15000,
        totalPrice: 45000,
      },
    ],
    total: 45000,
    currency: "MMK",
    status: "processing",
    isCargo: true,
    createdAt: "2025-07-12T14:15:00Z",
  },
  {
    id: "ord-003",
    orderNumber: "CM-2025-0893",
    customerName: "Su Su",
    customerEmail: "susu@outlook.com",
    items: [
      {
        id: "item-004",
        productName: "Bamboo Handbag - Natural Craft",
        quantity: 1,
        unitPrice: 28000,
        totalPrice: 28000,
      },
    ],
    total: 28000,
    currency: "MMK",
    status: "delivered",
    isCargo: true,
    createdAt: "2025-07-10T09:00:00Z",
    shippedAt: "2025-07-11T08:00:00Z",
    deliveredAt: "2025-07-13T11:30:00Z",
  },
  {
    id: "ord-004",
    orderNumber: "CM-2025-0894",
    customerName: "Zaw Lin",
    customerEmail: "zawlin@gmail.com",
    items: [
      {
        id: "item-005",
        productName: "Thai Silk Scarf - Premium Collection",
        quantity: 1,
        unitPrice: 25000,
        totalPrice: 25000,
      },
      {
        id: "item-006",
        productName: "Ceramic Thai Elephant Figurine",
        quantity: 2,
        unitPrice: 35000,
        totalPrice: 70000,
      },
    ],
    total: 95000,
    currency: "MMK",
    status: "pending",
    isCargo: true,
    createdAt: "2025-07-13T06:45:00Z",
  },
  {
    id: "ord-005",
    orderNumber: "CM-2025-0895",
    customerName: "Nay Chi",
    customerEmail: "naychi@gmail.com",
    items: [
      {
        id: "item-007",
        productName: "Thai Herbal Soap Set (6 pcs)",
        quantity: 4,
        unitPrice: 12000,
        totalPrice: 48000,
      },
    ],
    total: 48000,
    currency: "MMK",
    status: "confirmed",
    isCargo: false,
    createdAt: "2025-07-13T07:20:00Z",
  },
];

export const mockCargoShipments: CargoShipment[] = [
  {
    id: "ship-001",
    shipmentNumber: "CM-SHP-2025-0321",
    orderNumber: "CM-2025-0892",
    destination: "Yangon, Myanmar",
    status: "in_transit",
    currentMilestone: "bkk_warehouse",
    currentLocation: "Bangkok Warehouse",
    estimatedArrival: "2025-07-20",
    weight: 2.5,
    weightUnit: "kg",
    itemCount: 3,
    createdAt: "2025-07-12T15:00:00Z",
    updatedAt: "2025-07-13T08:00:00Z",
    milestones: [
      { status: "order_placed", label: "Order Placed", location: "CrossMart System", completedAt: "2025-07-12T15:00:00Z", isCurrent: false },
      { status: "payment_confirmed", label: "Payment Confirmed", location: "CrossMart System", completedAt: "2025-07-12T15:05:00Z", isCurrent: false },
      { status: "waiting_purchase", label: "Waiting Purchase", location: "Bangkok Supplier", completedAt: "2025-07-12T16:00:00Z", isCurrent: false },
      { status: "purchased", label: "Purchased", location: "Bangkok Supplier", completedAt: "2025-07-12T18:30:00Z", isCurrent: false },
      { status: "packed", label: "Packed", location: "Bangkok Warehouse", completedAt: "2025-07-13T06:00:00Z", isCurrent: false },
      { status: "bkk_warehouse", label: "BKK Warehouse", location: "Bangkok Warehouse", completedAt: "2025-07-13T08:00:00Z", isCurrent: true },
      { status: "export_clearance", label: "Export Clearance", isCurrent: false },
      { status: "air_cargo", label: "Air Cargo", isCurrent: false },
      { status: "customs", label: "Customs", isCurrent: false },
      { status: "ygn_warehouse", label: "YGN Warehouse", isCurrent: false },
      { status: "out_for_delivery", label: "Out for Delivery", isCurrent: false },
      { status: "delivered", label: "Delivered", isCurrent: false },
    ],
  },
  {
    id: "ship-002",
    shipmentNumber: "CM-SHP-2025-0322",
    orderNumber: "CM-2025-0893",
    destination: "Mandalay, Myanmar",
    status: "customs",
    currentMilestone: "customs",
    currentLocation: "Yangon Customs Office",
    estimatedArrival: "2025-07-15",
    weight: 1.8,
    weightUnit: "kg",
    itemCount: 1,
    createdAt: "2025-07-11T09:00:00Z",
    updatedAt: "2025-07-13T06:30:00Z",
    milestones: [
      { status: "order_placed", label: "Order Placed", location: "CrossMart System", completedAt: "2025-07-11T09:00:00Z", isCurrent: false },
      { status: "payment_confirmed", label: "Payment Confirmed", location: "CrossMart System", completedAt: "2025-07-11T09:10:00Z", isCurrent: false },
      { status: "waiting_purchase", label: "Waiting Purchase", location: "Bangkok Supplier", completedAt: "2025-07-11T10:00:00Z", isCurrent: false },
      { status: "purchased", label: "Purchased", location: "Bangkok Supplier", completedAt: "2025-07-11T14:00:00Z", isCurrent: false },
      { status: "packed", label: "Packed", location: "Bangkok Warehouse", completedAt: "2025-07-12T08:00:00Z", isCurrent: false },
      { status: "bkk_warehouse", label: "BKK Warehouse", location: "Bangkok Warehouse", completedAt: "2025-07-12T10:00:00Z", isCurrent: false },
      { status: "export_clearance", label: "Export Clearance", location: "Bangkok Export Office", completedAt: "2025-07-12T14:00:00Z", isCurrent: false },
      { status: "air_cargo", label: "Air Cargo", location: "Suvarnabhumi Airport", completedAt: "2025-07-12T20:00:00Z", isCurrent: false },
      { status: "customs", label: "Customs", location: "Yangon Customs Office", completedAt: "2025-07-13T06:30:00Z", isCurrent: true },
      { status: "ygn_warehouse", label: "YGN Warehouse", isCurrent: false },
      { status: "out_for_delivery", label: "Out for Delivery", isCurrent: false },
      { status: "delivered", label: "Delivered", isCurrent: false },
    ],
  },
  {
    id: "ship-003",
    shipmentNumber: "CM-SHP-2025-0323",
    orderNumber: "CM-2025-0894",
    destination: "Nay Pyi Taw, Myanmar",
    status: "preparing",
    currentMilestone: "packed",
    currentLocation: "Bangkok Warehouse",
    estimatedArrival: "2025-07-25",
    weight: 4.2,
    weightUnit: "kg",
    itemCount: 3,
    createdAt: "2025-07-13T07:00:00Z",
    updatedAt: "2025-07-13T07:00:00Z",
    milestones: [
      { status: "order_placed", label: "Order Placed", location: "CrossMart System", completedAt: "2025-07-13T07:00:00Z", isCurrent: false },
      { status: "payment_confirmed", label: "Payment Confirmed", location: "CrossMart System", completedAt: "2025-07-13T07:05:00Z", isCurrent: false },
      { status: "waiting_purchase", label: "Waiting Purchase", location: "Bangkok Supplier", completedAt: "2025-07-13T07:30:00Z", isCurrent: false },
      { status: "purchased", label: "Purchased", location: "Bangkok Supplier", completedAt: "2025-07-13T08:00:00Z", isCurrent: false },
      { status: "packed", label: "Packed", location: "Bangkok Warehouse", isCurrent: true },
      { status: "bkk_warehouse", label: "BKK Warehouse", isCurrent: false },
      { status: "export_clearance", label: "Export Clearance", isCurrent: false },
      { status: "air_cargo", label: "Air Cargo", isCurrent: false },
      { status: "customs", label: "Customs", isCurrent: false },
      { status: "ygn_warehouse", label: "YGN Warehouse", isCurrent: false },
      { status: "out_for_delivery", label: "Out for Delivery", isCurrent: false },
      { status: "delivered", label: "Delivered", isCurrent: false },
    ],
  },
  {
    id: "ship-004",
    shipmentNumber: "CM-SHP-2025-0324",
    orderNumber: "CM-2025-0895",
    destination: "Yangon, Myanmar",
    status: "delivered",
    currentMilestone: "delivered",
    currentLocation: "Yangon, Myanmar",
    estimatedArrival: "2025-07-13",
    weight: 3.0,
    weightUnit: "kg",
    itemCount: 2,
    createdAt: "2025-07-08T10:00:00Z",
    updatedAt: "2025-07-13T11:30:00Z",
    milestones: [
      { status: "order_placed", label: "Order Placed", location: "CrossMart System", completedAt: "2025-07-08T10:00:00Z", isCurrent: false },
      { status: "payment_confirmed", label: "Payment Confirmed", location: "CrossMart System", completedAt: "2025-07-08T10:10:00Z", isCurrent: false },
      { status: "waiting_purchase", label: "Waiting Purchase", location: "Bangkok Supplier", completedAt: "2025-07-08T11:00:00Z", isCurrent: false },
      { status: "purchased", label: "Purchased", location: "Bangkok Supplier", completedAt: "2025-07-08T14:00:00Z", isCurrent: false },
      { status: "packed", label: "Packed", location: "Bangkok Warehouse", completedAt: "2025-07-09T08:00:00Z", isCurrent: false },
      { status: "bkk_warehouse", label: "BKK Warehouse", location: "Bangkok Warehouse", completedAt: "2025-07-09T10:00:00Z", isCurrent: false },
      { status: "export_clearance", label: "Export Clearance", location: "Bangkok Export Office", completedAt: "2025-07-09T14:00:00Z", isCurrent: false },
      { status: "air_cargo", label: "Air Cargo", location: "Suvarnabhumi Airport", completedAt: "2025-07-09T20:00:00Z", isCurrent: false },
      { status: "customs", label: "Customs", location: "Yangon Customs Office", completedAt: "2025-07-10T14:00:00Z", isCurrent: false },
      { status: "ygn_warehouse", label: "YGN Warehouse", location: "Yangon Warehouse", completedAt: "2025-07-11T09:00:00Z", isCurrent: false },
      { status: "out_for_delivery", label: "Out for Delivery", location: "Yangon Distribution Center", completedAt: "2025-07-13T08:00:00Z", isCurrent: false },
      { status: "delivered", label: "Delivered", location: "Yangon, Myanmar", completedAt: "2025-07-13T11:30:00Z", isCurrent: true },
    ],
  },
  {
    id: "ship-005",
    shipmentNumber: "CM-SHP-2025-0325",
    orderNumber: "CM-2025-0896",
    destination: "Mawlamyine, Myanmar",
    status: "in_transit",
    currentMilestone: "air_cargo",
    currentLocation: "In Flight - BKK to YGN",
    estimatedArrival: "2025-07-18",
    weight: 1.2,
    weightUnit: "kg",
    itemCount: 1,
    createdAt: "2025-07-10T12:00:00Z",
    updatedAt: "2025-07-12T22:00:00Z",
    milestones: [
      { status: "order_placed", label: "Order Placed", location: "CrossMart System", completedAt: "2025-07-10T12:00:00Z", isCurrent: false },
      { status: "payment_confirmed", label: "Payment Confirmed", location: "CrossMart System", completedAt: "2025-07-10T12:05:00Z", isCurrent: false },
      { status: "waiting_purchase", label: "Waiting Purchase", location: "Bangkok Supplier", completedAt: "2025-07-10T13:00:00Z", isCurrent: false },
      { status: "purchased", label: "Purchased", location: "Bangkok Supplier", completedAt: "2025-07-10T16:00:00Z", isCurrent: false },
      { status: "packed", label: "Packed", location: "Bangkok Warehouse", completedAt: "2025-07-11T08:00:00Z", isCurrent: false },
      { status: "bkk_warehouse", label: "BKK Warehouse", location: "Bangkok Warehouse", completedAt: "2025-07-11T10:00:00Z", isCurrent: false },
      { status: "export_clearance", label: "Export Clearance", location: "Bangkok Export Office", completedAt: "2025-07-11T14:00:00Z", isCurrent: false },
      { status: "air_cargo", label: "Air Cargo", location: "In Flight - BKK to YGN", isCurrent: true },
      { status: "customs", label: "Customs", isCurrent: false },
      { status: "ygn_warehouse", label: "YGN Warehouse", isCurrent: false },
      { status: "out_for_delivery", label: "Out for Delivery", isCurrent: false },
      { status: "delivered", label: "Delivered", isCurrent: false },
    ],
  },
];

export const mockSellerDashboardData: SellerDashboardData = {
  profile: mockSellerProfile,
  metrics: mockSalesMetrics,
  recentProducts: mockSellerProducts,
  recentOrders: mockSellerOrders,
  activeShipments: mockCargoShipments,
};

// ── Reports Mock Data ──────────────────────────────────────────────

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProductReport {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  growth: number; // percentage, positive or negative
  category: string;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface ReportMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  returnRate: number;
  revenueChange: number;
  aovChange: number;
  conversionChange: number;
  returnChange: number;
}

export const mockReportMetrics: ReportMetrics = {
  totalRevenue: 12847500,
  averageOrderValue: 10336,
  conversionRate: 3.8,
  returnRate: 2.1,
  revenueChange: 12.5,
  aovChange: 5.2,
  conversionChange: 0.4,
  returnChange: -0.3,
};

export const mockSalesOverTime: SalesDataPoint[] = [
  { date: "Jul 7", revenue: 1_250_000, orders: 98 },
  { date: "Jul 8", revenue: 1_580_000, orders: 112 },
  { date: "Jul 9", revenue: 1_420_000, orders: 105 },
  { date: "Jul 10", revenue: 1_890_000, orders: 134 },
  { date: "Jul 11", revenue: 2_100_000, orders: 156 },
  { date: "Jul 12", revenue: 1_750_000, orders: 128 },
  { date: "Jul 13", revenue: 2_350_000, orders: 174 },
];

export const mockTopProductsReport: TopProductReport[] = [
  { id: "prod-002", name: "Bangkok Street Style T-Shirt", unitsSold: 567, revenue: 8_505_000, growth: 18.3, category: "Clothing" },
  { id: "prod-005", name: "Thai Herbal Soap Set (6 pcs)", unitsSold: 412, revenue: 4_944_000, growth: 24.7, category: "Beauty & Health" },
  { id: "prod-001", name: "Thai Silk Scarf - Premium Collection", unitsSold: 230, revenue: 5_750_000, growth: 8.1, category: "Fashion Accessories" },
  { id: "prod-004", name: "Bamboo Handbag - Natural Craft", unitsSold: 145, revenue: 4_060_000, growth: -3.2, category: "Bags & Accessories" },
  { id: "prod-003", name: "Ceramic Thai Elephant Figurine", unitsSold: 89, revenue: 3_115_000, growth: 12.6, category: "Home Decor" },
];

export const mockCategoryBreakdown: CategoryBreakdown[] = [
  { category: "Clothing", revenue: 8_505_000, percentage: 28, color: "bg-blue-500" },
  { category: "Fashion Accessories", revenue: 5_750_000, percentage: 19, color: "bg-purple-500" },
  { category: "Beauty & Health", revenue: 4_944_000, percentage: 16, color: "bg-pink-500" },
  { category: "Bags & Accessories", revenue: 4_060_000, percentage: 13, color: "bg-amber-500" },
  { category: "Home Decor", revenue: 3_115_000, percentage: 10, color: "bg-green-500" },
  { category: "Other", revenue: 3_773_500, percentage: 14, color: "bg-gray-400" },
];
