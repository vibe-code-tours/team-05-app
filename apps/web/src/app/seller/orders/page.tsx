"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  ChevronDown,
  ShoppingCart,
  Calendar,
  Package,
  CreditCard,
  Truck,
  MapPin,
  User,
  Mail,
  Hash,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { mockSellerOrders } from "@/lib/mock-seller-data";
import type { SellerOrder, SellerOrderStatus } from "@/types/seller";

const statusConfig: Record<
  SellerOrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }
> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  processing: { label: "Processing", variant: "default" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const statusTabs = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const nextStatusMap: Partial<Record<SellerOrderStatus, SellerOrderStatus[]>> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function SellerOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTargetOrder, setStatusTargetOrder] = useState<SellerOrder | null>(null);
  const [newStatus, setNewStatus] = useState<SellerOrderStatus | null>(null);

  const filteredOrders = useMemo(() => {
    return mockSellerOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === "all" || order.status === activeTab;

      let matchesDate = true;
      if (dateFrom) {
        const orderDate = new Date(order.createdAt);
        const fromDate = new Date(dateFrom);
        matchesDate = matchesDate && orderDate >= fromDate;
      }
      if (dateTo) {
        const orderDate = new Date(order.createdAt);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && orderDate <= toDate;
      }

      return matchesSearch && matchesTab && matchesDate;
    });
  }, [searchQuery, activeTab, dateFrom, dateTo]);

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mockSellerOrders.length };
    for (const order of mockSellerOrders) {
      counts[order.status] = (counts[order.status] || 0) + 1;
    }
    return counts;
  }, []);

  const handleViewDetail = (order: SellerOrder) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleStatusChangeClick = (order: SellerOrder, targetStatus: SellerOrderStatus) => {
    setStatusTargetOrder(order);
    setNewStatus(targetStatus);
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = () => {
    // In a real app, this would call an API to update the order status
    setStatusDialogOpen(false);
    setStatusTargetOrder(null);
    setNewStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage customer orders, update status, and track shipments.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            {/* Search */}
            <div className="flex-1 space-y-2">
              <label htmlFor="order-search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="order-search"
                  placeholder="Search by order ID or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex gap-2">
              <div className="space-y-2">
                <label htmlFor="date-from" className="text-sm font-medium">
                  From
                </label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full lg:w-40"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date-to" className="text-sm font-medium">
                  To
                </label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full lg:w-40"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-6"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  aria-label="Clear date filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
              <span className="ml-1 text-muted-foreground">
                ({orderCounts[tab.value] || 0})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Results Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
          <Package className="h-4 w-4" />
          <span>
            Showing {filteredOrders.length} of {mockSellerOrders.length} orders
          </span>
        </div>

        {/* Order List */}
        <TabsContent value={activeTab} className="mt-4">
          {filteredOrders.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                {/* Table Header */}
                <div className="hidden border-b bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground lg:grid lg:grid-cols-12 lg:gap-4">
                  <div className="col-span-2">Order ID</div>
                  <div className="col-span-2">Customer</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Order Rows */}
                <div className="divide-y">
                  {filteredOrders.map((order) => {
                    const statusInfo = statusConfig[order.status];
                    return (
                      <div
                        key={order.id}
                        className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/50 lg:grid lg:grid-cols-12 lg:items-center lg:gap-4"
                      >
                        {/* Order ID */}
                        <div className="lg:col-span-2">
                          <span className="text-xs text-muted-foreground lg:hidden">
                            Order:{" "}
                          </span>
                          <span className="font-medium">{order.orderNumber}</span>
                          {order.isCargo && (
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              Cargo
                            </Badge>
                          )}
                        </div>

                        {/* Customer */}
                        <div className="lg:col-span-2">
                          <span className="text-xs text-muted-foreground lg:hidden">
                            Customer:{" "}
                          </span>
                          <span className="text-sm">{order.customerName}</span>
                        </div>

                        {/* Date */}
                        <div className="lg:col-span-2">
                          <span className="text-xs text-muted-foreground lg:hidden">
                            Date:{" "}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDateShort(order.createdAt)}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="lg:col-span-2 lg:text-right">
                          <span className="text-xs text-muted-foreground lg:hidden">
                            Amount:{" "}
                          </span>
                          <span className="font-semibold">
                            {formatPrice(order.total)}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="lg:col-span-2 lg:text-center">
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 lg:col-span-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewDetail(order)}
                            aria-label={`View details for ${order.orderNumber}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Status Update Dropdown */}
                          {nextStatusMap[order.status] && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                >
                                  Update Status
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {nextStatusMap[order.status]?.map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() =>
                                      handleStatusChangeClick(order, status)
                                    }
                                  >
                                    <Badge
                                      variant={statusConfig[status].variant}
                                      className="mr-2 text-[10px]"
                                    >
                                      {statusConfig[status].label}
                                    </Badge>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order {selectedOrder?.orderNumber}
              {selectedOrder && (
                <Badge variant={statusConfig[selectedOrder.status].variant}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">
                      {selectedOrder.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span>{selectedOrder.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address (mock) */}
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h4>
                <p className="text-sm text-muted-foreground">
                  123 Main Street, Yangon, Myanmar
                </p>
              </div>

              {/* Order Items */}
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Package className="h-4 w-4" />
                  Order Items ({selectedOrder.items.length})
                </h4>
                <div className="divide-y">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} x {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="h-4 w-4" />
                  Payment Status
                </h4>
                <Badge variant="success">Paid</Badge>
              </div>

              {/* Tracking Information */}
              {selectedOrder.status === "shipped" && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Truck className="h-4 w-4" />
                    Tracking Information
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Tracking #:</span>
                      <span className="font-mono font-medium">
                        CM-SHP-2025-0321
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Shipped on:</span>
                      <span>{formatDate(selectedOrder.shippedAt!)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="default">In Transit</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivered Info */}
              {selectedOrder.status === "delivered" && selectedOrder.deliveredAt && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Truck className="h-4 w-4" />
                    Delivery Information
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Delivered on:</span>
                      <span>{formatDate(selectedOrder.deliveredAt)}</span>
                    </div>
                    <Badge variant="success">Delivered</Badge>
                  </div>
                </div>
              )}

              {/* Cargo Badge */}
              {selectedOrder.isCargo && (
                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      This is a cargo order from Bangkok
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of order{" "}
              <span className="font-semibold">
                {statusTargetOrder?.orderNumber}
              </span>{" "}
              from{" "}
              <Badge
                variant={
                  statusConfig[statusTargetOrder?.status || "pending"].variant
                }
                className="text-[10px]"
              >
                {statusConfig[statusTargetOrder?.status || "pending"].label}
              </Badge>{" "}
              to{" "}
              {newStatus && (
                <Badge variant={statusConfig[newStatus].variant} className="text-[10px]">
                  {statusConfig[newStatus].label}
                </Badge>
              )}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusConfirm}>Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
