"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  MapPin,
  Calendar,
  Package,
  Truck,
  Phone,
  Mail,
  Check,
  Clock,
  Ship,
  X,
  Hash,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "@/components/ui/use-toast";
import { useSellerShipments, useUpdateMilestone, CARGO_MILESTONES } from "@/lib/services/cargo.service";
import type { CargoMilestone as ApiCargoMilestone } from "@/lib/services/cargo.service";
import type { CargoShipment as ApiCargoShipment } from "@/lib/services/cargo.service";
import { ProtectedRoute } from "@/components/auth/protected-route";

// ── Types ─────────────────────────────────────────────────────────────────

type CargoShipmentStatus = "preparing" | "in_transit" | "customs" | "delivered";
type CargoMilestoneStatus =
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

interface UICargoMilestone {
  status: CargoMilestoneStatus;
  label: string;
  location?: string;
  completedAt?: string;
  isCurrent: boolean;
}

interface UIShipment {
  id: string;
  shipmentNumber: string;
  orderNumber: string;
  destination: string;
  status: CargoShipmentStatus;
  currentMilestone: CargoMilestoneStatus;
  currentLocation: string;
  estimatedArrival: string;
  weight: number;
  weightUnit: string;
  itemCount: number;
  milestones: UICargoMilestone[];
  createdAt: string;
  updatedAt: string;
}

// ── Mapping ───────────────────────────────────────────────────────────────

function normalizeShipmentStatus(raw: string): CargoShipmentStatus {
  const lower = raw.toLowerCase();
  if (["preparing", "in_transit", "customs", "delivered"].includes(lower)) {
    return lower as CargoShipmentStatus;
  }
  return "preparing";
}

function normalizeMilestoneStatus(raw: string): CargoMilestoneStatus {
  const lower = raw.toLowerCase();
  if (
    [
      "order_placed", "payment_confirmed", "waiting_purchase", "purchased",
      "packed", "bkk_warehouse", "export_clearance", "air_cargo",
      "customs", "ygn_warehouse", "out_for_delivery", "delivered",
    ].includes(lower)
  ) {
    return lower as CargoMilestoneStatus;
  }
  return "order_placed";
}

function formatMilestoneLabel(milestone: string): string {
  return milestone
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function deriveLocationFromMilestone(milestone: CargoMilestoneStatus): string {
  const locationMap: Record<CargoMilestoneStatus, string> = {
    order_placed: "CrossMart System",
    payment_confirmed: "CrossMart System",
    waiting_purchase: "Bangkok Supplier",
    purchased: "Bangkok Supplier",
    packed: "Bangkok Warehouse",
    bkk_warehouse: "Bangkok Warehouse",
    export_clearance: "Bangkok Export Office",
    air_cargo: "In Transit",
    customs: "Yangon Customs Office",
    ygn_warehouse: "Yangon Warehouse",
    out_for_delivery: "Distribution Center",
    delivered: "Destination",
  };
  return locationMap[milestone];
}

function mapApiShipmentToUI(apiShipment: ApiCargoShipment): UIShipment {
  const currentMilestoneIdx = CARGO_MILESTONES.indexOf(apiShipment.milestone);
  const completedMilestoneSet = new Set(
    apiShipment.milestones.map((m) => m.milestone)
  );

  const uiMilestones: UICargoMilestone[] = CARGO_MILESTONES.map((ms) => {
    const apiMilestone = apiShipment.milestones.find((m) => m.milestone === ms);
    const isCurrent = ms === apiShipment.milestone;
    const isCompleted = completedMilestoneSet.has(ms) && !isCurrent;

    return {
      status: normalizeMilestoneStatus(ms),
      label: formatMilestoneLabel(ms),
      location: apiMilestone?.notes ?? (isCurrent || isCompleted ? deriveLocationFromMilestone(normalizeMilestoneStatus(ms)) : undefined),
      completedAt: apiMilestone?.timestamp,
      isCurrent,
    };
  });

  const lastMilestone = apiShipment.milestones[apiShipment.milestones.length - 1];
  const currentLocation = lastMilestone?.notes ?? deriveLocationFromMilestone(normalizeMilestoneStatus(apiShipment.milestone));

  return {
    id: apiShipment.id,
    shipmentNumber: apiShipment.trackingNumber,
    orderNumber: apiShipment.orderId,
    destination: apiShipment.destination,
    status: normalizeShipmentStatus(apiShipment.status),
    currentMilestone: normalizeMilestoneStatus(apiShipment.milestone),
    currentLocation,
    estimatedArrival: apiShipment.estimatedArrival,
    weight: 0,
    weightUnit: "kg",
    itemCount: 0,
    milestones: uiMilestones,
    createdAt: apiShipment.createdAt,
    updatedAt: lastMilestone?.timestamp ?? apiShipment.createdAt,
  };
}

// ── Config ────────────────────────────────────────────────────────────────

const shipmentStatusConfig: Record<
  CargoShipmentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }
> = {
  preparing: { label: "Preparing", variant: "warning" },
  in_transit: { label: "In Transit", variant: "default" },
  customs: { label: "Customs", variant: "secondary" },
  delivered: { label: "Delivered", variant: "success" },
};

const statusTabs = [
  { value: "all", label: "All Shipments" },
  { value: "preparing", label: "Preparing" },
  { value: "in_transit", label: "In Transit" },
  { value: "customs", label: "Customs" },
  { value: "delivered", label: "Delivered" },
];

// ── Helpers ───────────────────────────────────────────────────────────────

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

// ── Cargo Timeline ────────────────────────────────────────────────────────

function CargoTimeline({ shipment }: { shipment: UIShipment }) {
  return (
    <div className="relative">
      {shipment.milestones.map((milestone, index) => {
        const isCompleted = milestone.completedAt && !milestone.isCurrent;
        const isCurrent = milestone.isCurrent;

        return (
          <div key={milestone.status} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector line */}
            {index < shipment.milestones.length - 1 && (
              <div
                className={`absolute left-[11px] top-6 h-full w-0.5 ${
                  isCompleted ? "bg-primary" : "bg-muted"
                }`}
              />
            )}

            {/* Status circle */}
            <div
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                isCompleted
                  ? "border-primary bg-primary"
                  : isCurrent
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30 bg-background"
              }`}
            >
              {isCompleted ? (
                <Check className="h-3 w-3 text-primary-foreground" />
              ) : isCurrent ? (
                <Clock className="h-3 w-3 text-primary-foreground" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {milestone.label}
                </span>
                {isCurrent && (
                  <Badge variant="default" className="text-[10px]">
                    Current
                  </Badge>
                )}
              </div>
              {milestone.location && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {milestone.location}
                  </span>
                </div>
              )}
              {milestone.completedAt && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(milestone.completedAt)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────

function ShipmentCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-32" />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-28" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page Component ────────────────────────────────────────────────────────

export default function SellerCargoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<UIShipment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [milestoneTarget, setMilestoneTarget] = useState<UIShipment | null>(null);
  const [nextMilestone, setNextMilestone] = useState<ApiCargoMilestone | null>(null);

  const { data: apiShipments, isLoading, isError } = useSellerShipments();
  const updateMilestoneMutation = useUpdateMilestone();

  const shipments = useMemo(() => {
    if (!apiShipments?.data) return [];
    return apiShipments.data.map(mapApiShipmentToUI);
  }, [apiShipments]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const matchesSearch =
        shipment.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === "all" || shipment.status === activeTab;

      let matchesDate = true;
      if (dateFrom) {
        const shipmentDate = new Date(shipment.createdAt);
        const fromDate = new Date(dateFrom);
        matchesDate = matchesDate && shipmentDate >= fromDate;
      }
      if (dateTo) {
        const shipmentDate = new Date(shipment.createdAt);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && shipmentDate <= toDate;
      }

      return matchesSearch && matchesTab && matchesDate;
    });
  }, [shipments, searchQuery, activeTab, dateFrom, dateTo]);

  const shipmentCounts = useMemo(() => {
    const counts: Record<string, number> = { all: shipments.length };
    for (const shipment of shipments) {
      counts[shipment.status] = (counts[shipment.status] || 0) + 1;
    }
    return counts;
  }, [shipments]);

  const getNextMilestone = (currentMilestone: CargoMilestoneStatus): ApiCargoMilestone | null => {
    const currentIdx = CARGO_MILESTONES.findIndex(
      (m) => m.toLowerCase() === currentMilestone
    );
    if (currentIdx < 0 || currentIdx >= CARGO_MILESTONES.length - 1) return null;
    return CARGO_MILESTONES[currentIdx + 1];
  };

  const handleViewDetail = (shipment: UIShipment) => {
    setSelectedShipment(shipment);
    setDetailDialogOpen(true);
  };

  const handleViewTimeline = (shipment: UIShipment) => {
    setSelectedShipment(shipment);
    setTimelineDialogOpen(true);
  };

  const handleContactCustomer = (shipment: UIShipment) => {
    setSelectedShipment(shipment);
    setContactDialogOpen(true);
  };

  const handleAdvanceMilestone = (shipment: UIShipment) => {
    const next = getNextMilestone(shipment.currentMilestone);
    if (!next) return;
    setMilestoneTarget(shipment);
    setNextMilestone(next);
    setMilestoneDialogOpen(true);
  };

  const handleMilestoneConfirm = async () => {
    if (!milestoneTarget || !nextMilestone) return;

    try {
      await updateMilestoneMutation.mutateAsync({
        id: milestoneTarget.id,
        milestone: nextMilestone,
      });
      toast({
        title: "Milestone updated",
        description: `Shipment ${milestoneTarget.shipmentNumber} advanced to ${formatMilestoneLabel(nextMilestone)}.`,
      });
    } catch {
      toast({
        title: "Failed to update milestone",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setMilestoneDialogOpen(false);
      setMilestoneTarget(null);
      setNextMilestone(null);
    }
  };

  return (
    <ProtectedRoute requiredRole="SELLER">
      <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cargo Management</h1>
        <p className="text-muted-foreground">
          Track cargo shipments, view milestones, and manage cross-border deliveries.
        </p>
      </div>

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load shipments. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : shipments.length}</div>
            <p className="text-xs text-muted-foreground">Active cargo shipments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : shipments.filter((s) => s.status === "in_transit").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently shipping</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Customs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : shipments.filter((s) => s.status === "customs").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending clearance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : shipments.filter((s) => s.status === "delivered").length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            {/* Search */}
            <div className="flex-1 space-y-2">
              <label htmlFor="cargo-search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="cargo-search"
                  placeholder="Search by tracking number, order reference, or destination..."
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
                ({shipmentCounts[tab.value] || 0})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Results Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
          <Package className="h-4 w-4" />
          <span>
            {isLoading
              ? "Loading shipments..."
              : `Showing ${filteredShipments.length} of ${shipments.length} shipments`}
          </span>
        </div>

        {/* Shipment List */}
        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ShipmentCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredShipments.length > 0 ? (
            <div className="space-y-4">
              {filteredShipments.map((shipment) => {
                const statusInfo = shipmentStatusConfig[shipment.status];
                const currentMilestone = shipment.milestones.find(
                  (m) => m.isCurrent
                );
                const canAdvance = getNextMilestone(shipment.currentMilestone) !== null;

                return (
                  <Card key={shipment.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Shipment Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{shipment.shipmentNumber}</h3>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Order:</span>
                              <span className="font-medium">{shipment.orderNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Destination:</span>
                              <span>{shipment.destination}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Current:</span>
                              <span className="font-medium">{shipment.currentLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">ETA:</span>
                              <span>{formatDateShort(shipment.estimatedArrival)}</span>
                            </div>
                          </div>

                          {/* Current Milestone */}
                          {currentMilestone && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Current Status:</span>
                              <span className="font-medium text-primary">
                                {currentMilestone.label}
                              </span>
                              {currentMilestone.location && (
                                <span className="text-muted-foreground">
                                  at {currentMilestone.location}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2 lg:flex-col">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(shipment)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTimeline(shipment)}
                          >
                            <Truck className="mr-1 h-3 w-3" />
                            Track Shipment
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContactCustomer(shipment)}
                          >
                            <Phone className="mr-1 h-3 w-3" />
                            Contact Customer
                          </Button>
                          {canAdvance && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAdvanceMilestone(shipment)}
                            >
                              <ChevronDown className="mr-1 h-3 w-3" />
                              Advance Milestone
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ship className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No shipments found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Shipment Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedShipment?.shipmentNumber}
              {selectedShipment && (
                <Badge variant={shipmentStatusConfig[selectedShipment.status].variant}>
                  {shipmentStatusConfig[selectedShipment.status].label}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Created on {selectedShipment && formatDate(selectedShipment.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedShipment && (
            <div className="space-y-6">
              {/* Shipment Overview */}
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Package className="h-4 w-4" />
                  Shipment Overview
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Tracking Number:</span>
                    <span className="font-mono font-medium">
                      {selectedShipment.shipmentNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Order Reference:</span>
                    <span className="font-medium">{selectedShipment.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Destination:</span>
                    <span>{selectedShipment.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Current Location:</span>
                    <span className="font-medium">{selectedShipment.currentLocation}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Schedule */}
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="h-4 w-4" />
                  Delivery Schedule
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Estimated Arrival:</span>
                    <span className="font-medium">
                      {formatDateShort(selectedShipment.estimatedArrival)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{formatDate(selectedShipment.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="rounded-lg border border-dashed p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Current Status: {shipmentStatusConfig[selectedShipment.status].label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Location: {selectedShipment.currentLocation}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog open={timelineDialogOpen} onOpenChange={setTimelineDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipment Timeline
            </DialogTitle>
            <DialogDescription>
              {selectedShipment?.shipmentNumber} - {selectedShipment?.destination}
            </DialogDescription>
          </DialogHeader>

          {selectedShipment && (
            <div className="py-4">
              <CargoTimeline shipment={selectedShipment} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Customer Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Customer</DialogTitle>
            <DialogDescription>
              Reach out to the customer for shipment {selectedShipment?.shipmentNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 text-sm font-semibold">Shipment Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Tracking: {selectedShipment?.shipmentNumber}</p>
                <p>Order: {selectedShipment?.orderNumber}</p>
                <p>Destination: {selectedShipment?.destination}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Call Customer
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestone Advance Confirmation Dialog */}
      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advance Milestone</DialogTitle>
            <DialogDescription>
              Are you sure you want to advance shipment{" "}
              <span className="font-semibold">
                {milestoneTarget?.shipmentNumber}
              </span>{" "}
              to{" "}
              {nextMilestone && (
                <Badge variant="default" className="text-[10px]">
                  {formatMilestoneLabel(nextMilestone)}
                </Badge>
              )}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMilestoneDialogOpen(false)}
              disabled={updateMilestoneMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMilestoneConfirm}
              disabled={updateMilestoneMutation.isPending}
            >
              {updateMilestoneMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm Advance"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedRoute>
  );
}
