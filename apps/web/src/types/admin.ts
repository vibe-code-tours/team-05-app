// Admin Dashboard Types

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "super_admin";
  lastLogin: string;
}

export interface PlatformMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  currency: string;
  monthlyGrowth: number;
  pendingApprovals: number;
  activeSellers: number;
}

export type UserRole = "admin" | "seller" | "client";
export type UserStatus = "active" | "inactive" | "suspended" | "pending";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  joinedDate: string;
  lastActive: string;
  totalOrders: number;
  totalSpent: number;
  currency: string;
}

export type ProductApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface AdminProduct {
  id: string;
  name: string;
  sellerName: string;
  category: string;
  price: number;
  currency: string;
  status: ProductApprovalStatus;
  image: string;
  submittedAt: string;
  description: string;
}

export type BannerStatus = "active" | "inactive" | "scheduled";

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  href: string;
  status: BannerStatus;
  position: "hero" | "promo" | "sidebar";
  startDate: string;
  endDate: string;
}

export type CouponType = "percentage" | "fixed";
export type CouponStatus = "active" | "inactive" | "expired";

export interface AdminCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  maxUses: number;
  usedCount: number;
  status: CouponStatus;
  validFrom: string;
  expiresAt: string;
  createdAt: string;
}

export interface AdminDashboardData {
  profile: AdminProfile;
  metrics: PlatformMetrics;
  pendingProducts: AdminProduct[];
  users: AdminUser[];
  banners: AdminBanner[];
  coupons: AdminCoupon[];
}

// ---------------------------------------------------------------------------
// Reports & Analytics Types
// ---------------------------------------------------------------------------

export type DateRange = "7d" | "30d" | "90d" | "year" | "custom";

export interface DateRangeOption {
  value: DateRange;
  label: string;
}

export interface SalesDataPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
}

export interface SellerPerformance {
  seller: string;
  revenue: number;
  orders: number;
}

export interface UserDataPoint {
  label: string;
  count: number;
}

export interface UserRoleCount {
  role: string;
  count: number;
}

export interface ReportOverview {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  aovChange: number;
  conversionChange: number;
}

export interface AdminReportData {
  overview: ReportOverview;
  salesOverTime: SalesDataPoint[];
  ordersByMonth: SalesDataPoint[];
  revenueByCategory: CategoryRevenue[];
  topSellers: SellerPerformance[];
  newUsersOverTime: UserDataPoint[];
  usersByRole: UserRoleCount[];
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}
