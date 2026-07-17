"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Target,
  Download,
  FileText,
  Users,
  Star,
  Package,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import { mockReportData } from "@/lib/mock-admin-data";
import { ProtectedRoute } from "@/components/auth/protected-route";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DateRange = "7d" | "30d" | "90d" | "year";

interface DateRangeOption {
  value: DateRange;
  label: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "This Year" },
];

const PAYMENT_METHODS = [
  { label: "Bank Transfer", percentage: 42, color: "bg-blue-500" },
  { label: "KBZ Pay", percentage: 28, color: "bg-emerald-500" },
  { label: "Wave Money", percentage: 18, color: "bg-violet-500" },
  { label: "COD", percentage: 12, color: "bg-amber-500" },
];

const SELLER_RATINGS: Record<string, number> = {
  "TechZone Myanmar": 4.8,
  "Bangkok Natural Shop": 4.6,
  "Silk Paradise": 4.5,
  "Myanmar Delights": 4.3,
  "Shan Tea House": 4.7,
};

const SELLER_PRODUCTS: Record<string, number> = {
  "TechZone Myanmar": 124,
  "Bangkok Natural Shop": 89,
  "Silk Paradise": 67,
  "Myanmar Delights": 156,
  "Shan Tea House": 43,
};

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string;
  change: number;
  icon: typeof DollarSign;
  iconColor: string;
}) {
  const isPositive = change >= 0;
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {change}% from last period
              </span>
            </div>
          </div>
          <div className={`rounded-lg p-3 ${iconColor}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BarChart({
  data,
  maxValue,
  barColor,
  formatValue,
}: {
  data: { label: string; value: number }[];
  maxValue: number;
  barColor: string;
  formatValue: (v: number) => string;
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              {item.label}
            </span>
            <span className="text-foreground">{formatValue(item.value)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function VerticalBarChart({
  data,
  maxValue,
  barColor,
  formatValue,
}: {
  data: { label: string; value: number }[];
  maxValue: number;
  barColor: string;
  formatValue: (v: number) => string;
}) {
  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((item) => {
        const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {formatValue(item.value)}
            </span>
            <div className="w-full flex justify-center">
              <div
                className={`w-full max-w-[40px] rounded-t transition-all duration-500 ${barColor}`}
                style={{ height: `${Math.max(height, 2)}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PieVisualization({
  segments,
}: {
  segments: { label: string; percentage: number; color: string }[];
}) {
  // Build a conic-gradient for the pie chart
  let cumulative = 0;
  const gradientParts: string[] = [];
  const colorMap: Record<string, string> = {
    "bg-blue-500": "#3b82f6",
    "bg-emerald-500": "#10b981",
    "bg-violet-500": "#8b5cf6",
    "bg-amber-500": "#f59e0b",
  };

  for (const seg of segments) {
    const start = cumulative;
    cumulative += seg.percentage;
    const color = colorMap[seg.color] ?? "#6b7280";
    gradientParts.push(`${color} ${start}% ${cumulative}%`);
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div
        className="h-44 w-44 flex-shrink-0 rounded-full shadow-inner"
        style={{
          background: `conic-gradient(${gradientParts.join(", ")})`,
        }}
      />
      <div className="space-y-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${seg.color}`} />
            <span className="text-sm text-muted-foreground">{seg.label}</span>
            <span className="ml-auto text-sm font-semibold">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("year");

  const data = mockReportData;

  // Slice data based on date range
  const visibleMonths = useMemo(() => {
    switch (dateRange) {
      case "7d":
        return data.salesOverTime.slice(-1);
      case "30d":
        return data.salesOverTime.slice(-2);
      case "90d":
        return data.salesOverTime.slice(-3);
      case "year":
      default:
        return data.salesOverTime;
    }
  }, [dateRange, data.salesOverTime]);

  const visibleCategories = useMemo(() => data.revenueByCategory, [data.revenueByCategory]);

  const maxRevenue = useMemo(
    () => Math.max(...visibleMonths.map((m) => m.revenue), 1),
    [visibleMonths]
  );

  const maxCategoryRevenue = useMemo(
    () => Math.max(...visibleCategories.map((c) => c.revenue), 1),
    [visibleCategories]
  );

  // Format helpers
  function formatCompact(value: number): string {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K`;
    }
    return value.toString();
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Platform performance overview and business insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Export Sales Report
          </Button>
          <Button variant="outline" size="sm">
            <Users className="mr-1.5 h-4 w-4" />
            Export Users Report
          </Button>
        </div>
      </div>

      {/* Date range selector */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Period:</span>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <TabsList>
            {DATE_RANGE_OPTIONS.map((opt) => (
              <TabsTrigger key={opt.value} value={opt.value}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Overview metrics cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatPrice(data.overview.totalRevenue)}
          change={data.overview.revenueChange}
          icon={DollarSign}
          iconColor="bg-emerald-500"
        />
        <MetricCard
          title="Total Orders"
          value={data.overview.totalOrders.toLocaleString()}
          change={data.overview.ordersChange}
          icon={ShoppingCart}
          iconColor="bg-blue-500"
        />
        <MetricCard
          title="Average Order Value"
          value={formatPrice(data.overview.averageOrderValue)}
          change={data.overview.aovChange}
          icon={BarChart3}
          iconColor="bg-violet-500"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${data.overview.conversionRate}%`}
          change={data.overview.conversionChange}
          icon={Target}
          iconColor="bg-amber-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue over time - vertical bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VerticalBarChart
              data={visibleMonths.map((m) => ({
                label: m.label,
                value: m.revenue,
              }))}
              maxValue={maxRevenue}
              barColor="bg-gradient-to-t from-emerald-600 to-emerald-400"
              formatValue={formatCompact}
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Revenue in MMK (millions)
            </p>
          </CardContent>
        </Card>

        {/* Revenue by category - horizontal bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-muted-foreground" />
              Orders by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={visibleCategories.map((c) => ({
                label: c.category,
                value: c.revenue,
              }))}
              maxValue={maxCategoryRevenue}
              barColor="bg-gradient-to-r from-blue-600 to-blue-400"
              formatValue={(v) => `${formatCompact(v)} MMK`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Second row: Payment methods + Top sellers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by payment method - pie visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              Revenue by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieVisualization segments={PAYMENT_METHODS} />
          </CardContent>
        </Card>

        {/* Top performing sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-muted-foreground" />
              Top Performing Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topSellers.map((seller, idx) => (
                <div
                  key={seller.seller}
                  className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {seller.seller}
                      </p>
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Star className="mr-0.5 h-3 w-3 fill-amber-400 text-amber-400" />
                        {SELLER_RATINGS[seller.seller] ?? "N/A"}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatPrice(seller.revenue)} sales</span>
                      <span className="text-border">|</span>
                      <span>{SELLER_PRODUCTS[seller.seller] ?? 0} products</span>
                      <span className="text-border">|</span>
                      <span>{seller.orders.toLocaleString()} orders</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders by month detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            Orders by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Month
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Orders
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Revenue
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Avg. Order Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleMonths.map((month) => (
                  <tr
                    key={month.label}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 font-medium">{month.label}</td>
                    <td className="py-3 text-right">
                      {month.orders.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-semibold text-emerald-600">
                      {formatPrice(month.revenue)}
                    </td>
                    <td className="py-3 text-right">
                      {month.orders > 0
                        ? formatPrice(Math.round(month.revenue / month.orders))
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export section */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Export Reports</p>
            <p className="text-xs text-muted-foreground">
              Download detailed reports for offline analysis and sharing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-1.5 h-4 w-4" />
              Sales Report (CSV)
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-1.5 h-4 w-4" />
              Users Report (CSV)
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Full Export (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}
