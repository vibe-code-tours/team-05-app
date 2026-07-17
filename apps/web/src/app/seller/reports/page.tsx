"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Target,
  RotateCcw,
  FileText,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import {
  mockReportMetrics,
  mockSalesOverTime,
  mockTopProductsReport,
  mockCategoryBreakdown,
} from "@/lib/mock-seller-data";
import { ProtectedRoute } from "@/components/auth/protected-route";

// ── CSS-Based Line Chart ───────────────────────────────────────────

function SalesLineChart() {
  const data = mockSalesOverTime;
  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const minRevenue = Math.min(...data.map((d) => d.revenue));
  const range = maxRevenue - minRevenue || 1;

  // Build SVG polyline points
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerW;
    const y = padding.top + innerH - ((d.revenue - minRevenue) / range) * innerH;
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M${points[0].x},${padding.top + innerH} ${points.map((p) => `L${p.x},${p.y}`).join(" ")} L${points[points.length - 1].x},${padding.top + innerH} Z`;

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    const val = minRevenue + (range / (yTicks - 1)) * i;
    return val;
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-64">
        {/* Grid lines */}
        {yTickValues.map((val, i) => {
          const y = padding.top + innerH - ((val - minRevenue) / range) * innerH;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {(val / 1_000_000).toFixed(1)}M
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} className="fill-primary/10" />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" className="fill-primary stroke-background" strokeWidth="2" />
            {/* X-axis label */}
            <text
              x={p.x}
              y={chartHeight - 5}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {p.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── CSS-Based Bar Chart ────────────────────────────────────────────

function TopProductsBarChart() {
  const data = mockTopProductsReport;
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="space-y-3">
      {data.map((product) => {
        const widthPercent = (product.revenue / maxRevenue) * 100;
        return (
          <div key={product.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium max-w-[200px]">{product.name}</span>
              <span className="text-muted-foreground ml-2 shrink-0">
                {formatPrice(product.revenue)}
              </span>
            </div>
            <div className="relative h-6 w-full overflow-hidden rounded-md bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-md bg-primary/80 transition-all duration-500"
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── CSS-Based Pie Chart (Donut) ────────────────────────────────────

function CategoryPieChart() {
  const data = mockCategoryBreakdown;
  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  // Build conic gradient stops
  let accumulated = 0;
  const stops: string[] = [];
  const colorMap: Record<string, string> = {
    "bg-blue-500": "#3b82f6",
    "bg-purple-500": "#a855f7",
    "bg-pink-500": "#ec4899",
    "bg-amber-500": "#f59e0b",
    "bg-green-500": "#22c55e",
    "bg-gray-400": "#9ca3af",
  };

  data.forEach((d) => {
    const start = accumulated;
    accumulated += (d.revenue / total) * 360;
    const hex = colorMap[d.color] || "#9ca3af";
    stops.push(`${hex} ${start}deg ${accumulated}deg`);
  });

  const conicGradient = `conic-gradient(${stops.join(", ")})`;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      {/* Donut */}
      <div className="relative shrink-0">
        <div
          className="h-44 w-44 rounded-full"
          style={{ background: conicGradient }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-background" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{formatPrice(total)}</span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {data.map((d) => {
          const hex = colorMap[d.color] || "#9ca3af";
          return (
            <div key={d.category} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: hex }}
              />
              <span className="truncate">{d.category}</span>
              <span className="ml-auto text-muted-foreground">{d.percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function SellerReportsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const metrics = mockReportMetrics;

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatPrice(metrics.totalRevenue),
      change: metrics.revenueChange,
      icon: DollarSign,
    },
    {
      title: "Average Order Value",
      value: formatPrice(metrics.averageOrderValue),
      change: metrics.aovChange,
      icon: Target,
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      change: metrics.conversionChange,
      icon: TrendingUp,
    },
    {
      title: "Return Rate",
      value: `${metrics.returnRate}%`,
      change: metrics.returnChange,
      icon: RotateCcw,
      invertColors: true,
    },
  ];

  function handleExportCSV() {
    const header = "Product,Units Sold,Revenue,Growth %,Category\n";
    const rows = mockTopProductsReport
      .map(
        (p) =>
          `"${p.name}",${p.unitsSold},${p.revenue},${p.growth},"${p.category}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportPDF() {
    // Placeholder: in a real app this would generate a PDF
    alert("PDF export would be generated here. This is a placeholder.");
  }

  return (
    <ProtectedRoute requiredRole="SELLER">
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Reports</h1>
          <p className="text-muted-foreground">
            Analyze your store performance and track key metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={dateRange} onValueChange={setDateRange}>
              <TabsList>
                <TabsTrigger value="7d">Last 7 days</TabsTrigger>
                <TabsTrigger value="30d">Last 30 days</TabsTrigger>
                <TabsTrigger value="90d">Last 90 days</TabsTrigger>
                <TabsTrigger value="custom">Custom range</TabsTrigger>
              </TabsList>
            </Tabs>
            {dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="rounded-md border bg-background px-3 py-1.5 text-sm"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  className="rounded-md border bg-background px-3 py-1.5 text-sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const isPositiveGood = !metric.invertColors;
          const changeIsGood = metric.change >= 0 ? isPositiveGood : !isPositiveGood;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="flex items-center text-xs text-muted-foreground">
                  {metric.change >= 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  <span
                    className={
                      changeIsGood ? "text-green-600" : "text-red-600"
                    }
                  >
                    {metric.change >= 0 ? "+" : ""}
                    {metric.change}%
                  </span>
                  <span className="ml-1">from last period</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesLineChart />
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart />
          </CardContent>
        </Card>
      </div>

      {/* Top Products Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <TopProductsBarChart />
        </CardContent>
      </Card>

      {/* Top Performing Products Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Performing Products</CardTitle>
          <Badge variant="secondary">
            {mockTopProductsReport.length} products
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium text-right">Units Sold</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                  <th className="pb-3 font-medium text-right">Growth</th>
                </tr>
              </thead>
              <tbody>
                {mockTopProductsReport.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      {product.unitsSold.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {formatPrice(product.revenue)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={
                          product.growth >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {product.growth >= 0 ? "+" : ""}
                        {product.growth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}
