"use client";

import Link from "next/link";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  AlertCircle,
  LayoutDashboard,
  Tag,
  Image,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  mockPlatformMetrics,
  mockAdminUsers,
  mockPendingProducts,
} from "@/lib/mock-admin-data";

// ---------------------------------------------------------------------------
// Derived dashboard data
// ---------------------------------------------------------------------------

const recentUsers = mockAdminUsers.slice(-5).reverse();

const recentOrders = [
  { id: "ORD-8234", customer: "May Thida", amount: 85000, status: "delivered", date: "13 Jul" },
  { id: "ORD-8233", customer: "Htet Aung", amount: 45000, status: "shipping", date: "13 Jul" },
  { id: "ORD-8232", customer: "Aung Kyaw", amount: 120000, status: "processing", date: "12 Jul" },
  { id: "ORD-8231", customer: "Thin Zar", amount: 32000, status: "pending", date: "12 Jul" },
  { id: "ORD-8230", customer: "Nay Chi", amount: 67000, status: "delivered", date: "11 Jul" },
];

const pendingProducts = mockPendingProducts.filter((p) => p.status === "pending").slice(0, 5);

const salesTrendData = [
  { label: "Jan", value: 64 },
  { label: "Feb", value: 70 },
  { label: "Mar", value: 76 },
  { label: "Apr", value: 84 },
  { label: "May", value: 80 },
  { label: "Jun", value: 90 },
  { label: "Jul", value: 96 },
  { label: "Aug", value: 78 },
  { label: "Sep", value: 72 },
  { label: "Oct", value: 88 },
  { label: "Nov", value: 92 },
  { label: "Dec", value: 100 },
];

const ordersByStatus = [
  { label: "Delivered", count: 5240, color: "bg-green-500" },
  { label: "Shipping", count: 1230, color: "bg-blue-500" },
  { label: "Processing", count: 890, color: "bg-yellow-500" },
  { label: "Pending", count: 520, color: "bg-orange-500" },
  { label: "Cancelled", count: 350, color: "bg-red-500" },
];

const maxOrderCount = Math.max(...ordersByStatus.map((o) => o.count));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: string) {
  switch (status) {
    case "delivered":
      return <Badge variant="success">Delivered</Badge>;
    case "shipping":
      return <Badge variant="default">Shipping</Badge>;
    case "processing":
      return <Badge variant="secondary">Processing</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "suspended":
      return <Badge variant="destructive">Suspended</Badge>;
    case "pending_approval":
      return <Badge variant="warning">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back. Here is what is happening on your platform.
          </p>
        </div>
        <Link href="/admin/reports">
          <Button variant="outline" size="sm">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </Link>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Platform Metrics Cards                                           */}
      {/* --------------------------------------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(12458)}</p>
                <p className="mt-1 flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +14.2% from last month
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{formatNumber(8234)}</p>
                <p className="mt-1 flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +11.5% from last month
                </p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <ShoppingCart className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatPrice(mockPlatformMetrics.totalRevenue)}
                </p>
                <p className="mt-1 flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +14.2% from last month
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Products */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{formatNumber(mockPlatformMetrics.totalProducts)}</p>
                <p className="mt-1 flex items-center text-xs text-orange-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {mockPlatformMetrics.pendingApprovals} pending approval
                </p>
              </div>
              <div className="rounded-full bg-orange-500/10 p-3">
                <Package className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Charts Row                                                      */}
      {/* --------------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5" style={{ height: 160 }}>
              {salesTrendData.map((d) => (
                <div
                  key={d.label}
                  className="group flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-sm transition-all duration-200 group-hover:opacity-80"
                    style={{
                      height: `${d.value}%`,
                      background: "linear-gradient(to top, var(--primary), hsl(var(--primary) / 0.3))",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              {salesTrendData.map((d) => (
                <div
                  key={d.label}
                  className="flex-1 text-center text-[10px] text-muted-foreground"
                >
                  {d.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersByStatus.map((o) => (
                <div key={o.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{o.label}</span>
                    <span className="text-muted-foreground">{formatNumber(o.count)}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${o.color}`}
                      style={{ width: `${(o.count / maxOrderCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Activity Feed & Quick Actions                                   */}
      {/* --------------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent User Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Recent Users</CardTitle>
            <Link
              href="/admin/users"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  {statusBadge(user.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link
              href="/admin/reports"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{order.id}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.customer} &middot; {order.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(order.amount)}</p>
                    {statusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Product Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Pending Approvals</CardTitle>
            <Link
              href="/admin/products"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingProducts.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No pending products
                </p>
              ) : (
                pendingProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10">
                      <Package className="h-3.5 w-3.5 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {product.sellerName} &middot; {product.category}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(product.price)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Quick Actions                                                   */}
      {/* --------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/products" className="group">
              <div className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="rounded-full bg-yellow-500/10 p-2.5">
                  <Package className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary">
                    Approve Products
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mockPlatformMetrics.pendingApprovals} pending
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/users" className="group">
              <div className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="rounded-full bg-blue-500/10 p-2.5">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary">
                    Manage Users
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(mockPlatformMetrics.totalUsers)} total
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/banners" className="group">
              <div className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="rounded-full bg-purple-500/10 p-2.5">
                  <Image className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary">
                    Create Banner
                  </p>
                  <p className="text-xs text-muted-foreground">Promotions</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/coupons" className="group">
              <div className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="rounded-full bg-green-500/10 p-2.5">
                  <Tag className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary">
                    Create Coupon
                  </p>
                  <p className="text-xs text-muted-foreground">Discounts</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
