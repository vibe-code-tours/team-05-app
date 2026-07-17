"use client";

import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Truck,
  Plus,
  Eye,
  Tag,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useMyProducts, useSellerOrders } from "@/lib/services/seller.service";
import { ProtectedRoute } from "@/components/auth/protected-route";

const orderStatusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
  }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "secondary" },
  PROCESSING: { label: "Processing", variant: "default" },
  SHIPPED: { label: "Shipped", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  const { data: productsResponse, isLoading: productsLoading } = useMyProducts();
  const { data: ordersResponse, isLoading: ordersLoading } = useSellerOrders();

  const products = productsResponse?.data ?? [];
  const orders = ordersResponse?.data ?? [];

  const isLoading = productsLoading || ordersLoading;

  // Compute metrics from real data
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const deliveredOrCancelled = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
  ).length;
  const pendingShipments = totalOrders - deliveredOrCancelled;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const statsCards = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      changeType: "positive" as const,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      changeType: "positive" as const,
    },
    {
      title: "Active Products",
      value: totalProducts.toLocaleString(),
      icon: Package,
      changeType: "positive" as const,
    },
    {
      title: "Pending Shipments",
      value: pendingShipments.toLocaleString(),
      icon: Truck,
      changeType: pendingShipments > 0 ? "negative" : "positive" as const,
    },
  ];

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="SELLER">
        <DashboardSkeleton />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="SELLER">
      <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here is an overview of your store performance.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="flex items-center text-xs text-muted-foreground">
                <TrendingUp
                  className={`mr-1 h-3 w-3 ${
                    stat.changeType === "negative" ? "rotate-180" : ""
                  }`}
                />
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  }
                >
                  {stat.changeType === "positive" ? "Active" : "Needs attention"}
                </span>
                <span className="ml-1">right now</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/orders">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No orders yet.
                </p>
              )}
              {recentOrders.map((order) => {
                const statusInfo = orderStatusConfig[order.status] ?? {
                  label: order.status,
                  variant: "secondary" as const,
                };
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.orderNumber}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.shippingAddress?.name ?? "Customer"} -{" "}
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total)}</p>
                      <Badge variant={statusInfo.variant} className="mt-1">
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/seller/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/seller/orders">
                <Eye className="mr-2 h-4 w-4" />
                View All Orders
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/seller/promotions/new">
                <Tag className="mr-2 h-4 w-4" />
                Create Promotion
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Products</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/products">
              View All Products
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {topProducts.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground text-center py-8">
                No products yet.
              </p>
            )}
            {topProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="aspect-square overflow-hidden rounded-md bg-muted">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  <h4 className="line-clamp-2 text-sm font-medium">
                    {product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {product.category?.name ?? "Uncategorized"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <Badge
                    variant={product.stock > 0 ? "secondary" : "destructive"}
                    className="text-[10px]"
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}
