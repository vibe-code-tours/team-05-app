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
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useAdminProducts, useAdminOrders, useAllSellers } from "@/lib/services/admin.service";
import type { AdminProduct } from "@/lib/services/admin.service";
import { ProtectedRoute } from "@/components/auth/protected-route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return <Badge variant="success">Approved</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "ARCHIVED":
      return <Badge variant="outline">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function orderStatusBadge(status: string) {
  const s = status?.toLowerCase?.() ?? "";
  switch (s) {
    case "delivered":
      return <Badge variant="success">Delivered</Badge>;
    case "shipping":
    case "shipped":
      return <Badge variant="default">Shipping</Badge>;
    case "processing":
      return <Badge variant="secondary">Processing</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const { data: productsData, isLoading: productsLoading } = useAdminProducts();
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders();
  const { data: sellersData, isLoading: sellersLoading } = useAllSellers();

  const isLoading = productsLoading || ordersLoading || sellersLoading;

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardSkeleton />
      </ProtectedRoute>
    );
  }

  const products: AdminProduct[] = Array.isArray(productsData) ? productsData : [];
  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];
  const sellers: any[] = Array.isArray(sellersData) ? sellersData : [];

  // Compute metrics from real data
  const totalProducts = products.length;
  const pendingApprovals = products.filter((p) => p.status === "PENDING").length;
  const approvedProducts = products.filter((p) => p.status === "APPROVED").length;
  const totalOrders = orders.length;
  const totalSellers = sellers.length;

  const pendingProducts = products
    .filter((p) => p.status === "PENDING")
    .slice(0, 5);

  // Compute orders by status from real data
  const orderStatusCounts: Record<string, number> = {};
  orders.forEach((o: any) => {
    const s = o.status ?? "pending";
    orderStatusCounts[s] = (orderStatusCounts[s] || 0) + 1;
  });

  const statusColorMap: Record<string, string> = {
    delivered: "bg-green-500",
    shipping: "bg-blue-500",
    shipped: "bg-blue-500",
    processing: "bg-yellow-500",
    pending: "bg-orange-500",
    cancelled: "bg-red-500",
  };

  const ordersByStatus = Object.entries(orderStatusCounts)
    .map(([label, count]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      count,
      color: statusColorMap[label.toLowerCase()] ?? "bg-muted-foreground",
    }))
    .sort((a, b) => b.count - a.count);

  const maxOrderCount = Math.max(...ordersByStatus.map((o) => o.count), 1);

  // Build recent orders from real data (last 5)
  const recentOrders = orders.slice(0, 5);

  return (
    <ProtectedRoute requiredRole="ADMIN">
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
        {/* Total Sellers / Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sellers</p>
                <p className="text-2xl font-bold">{formatNumber(totalSellers)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Registered on platform
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
                <p className="text-2xl font-bold">{formatNumber(totalOrders)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  All-time orders
                </p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <ShoppingCart className="h-6 w-6 text-blue-500" />
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
                <p className="text-2xl font-bold">{formatNumber(approvedProducts)}</p>
                <p className="mt-1 flex items-center text-xs text-orange-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {pendingApprovals} pending approval
                </p>
              </div>
              <div className="rounded-full bg-orange-500/10 p-3">
                <Package className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{formatNumber(totalProducts)}</p>
                <p className="mt-1 flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  All statuses
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Charts Row                                                      */}
      {/* --------------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByStatus.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No order data available
              </p>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Products by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["APPROVED", "PENDING", "REJECTED", "DRAFT", "ARCHIVED"] as const).map((status) => {
                const count = products.filter((p) => p.status === status).length;
                if (count === 0) return null;
                const colorMap: Record<string, string> = {
                  APPROVED: "bg-green-500",
                  PENDING: "bg-yellow-500",
                  REJECTED: "bg-red-500",
                  DRAFT: "bg-blue-500",
                  ARCHIVED: "bg-muted-foreground",
                };
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                      <span className="text-muted-foreground">{formatNumber(count)}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${colorMap[status]}`}
                        style={{ width: `${(count / totalProducts) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Activity Feed & Quick Actions                                   */}
      {/* --------------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
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
            {recentOrders.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No recent orders
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {order.orderNumber ?? order.id}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.customerName ?? order.user?.name ?? "Customer"} &middot;{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatPrice(order.total ?? order.totalAmount ?? 0)}
                      </p>
                      {orderStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                        {product.seller?.name} &middot; {product.category?.name}
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
                    {pendingApprovals} pending
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
                    {formatNumber(totalSellers)} sellers
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
    </ProtectedRoute>
  );
}
