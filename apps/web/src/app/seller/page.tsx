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
import { formatPrice } from "@/lib/utils";
import {
  mockSalesMetrics,
  mockSellerOrders,
  mockSellerProducts,
} from "@/lib/mock-seller-data";

const orderStatusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }
> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  processing: { label: "Processing", variant: "default" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
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

export default function SellerDashboardPage() {
  const metrics = mockSalesMetrics;
  const recentOrders = mockSellerOrders;
  const topProducts = [...mockSellerProducts]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);
  const pendingShipments = metrics.totalOrders - mockSellerOrders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled"
  ).length;

  const statsCards = [
    {
      title: "Total Revenue",
      value: formatPrice(metrics.totalRevenue),
      icon: DollarSign,
      change: `+${metrics.monthlyGrowth}%`,
      changeType: "positive" as const,
    },
    {
      title: "Total Orders",
      value: metrics.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: "+8.2%",
      changeType: "positive" as const,
    },
    {
      title: "Active Products",
      value: metrics.totalProducts.toLocaleString(),
      icon: Package,
      change: "+3",
      changeType: "positive" as const,
    },
    {
      title: "Pending Shipments",
      value: pendingShipments.toLocaleString(),
      icon: Truck,
      change: "-2",
      changeType: "negative" as const,
    },
  ];

  return (
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
                <TrendingUp className={`mr-1 h-3 w-3 ${stat.changeType === "negative" ? "rotate-180" : ""}`} />
                <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
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
              {recentOrders.map((order) => {
                const statusInfo = orderStatusConfig[order.status];
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
                          {order.isCargo && (
                            <Badge variant="outline" className="text-[10px]">
                              Cargo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} - {order.items.length} item
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
          <CardTitle>Top Selling Products</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/products">
              View All Products
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {topProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="aspect-square overflow-hidden rounded-md bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <h4 className="line-clamp-2 text-sm font-medium">{product.name}</h4>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {product.sold} sold
                    </Badge>
                  </div>
                  <Badge
                    variant={product.stock > 0 ? "success" : "destructive"}
                    className="text-[10px]"
                  >
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
