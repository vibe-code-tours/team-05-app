"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Ticket,
  Copy,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Percent,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockCoupons } from "@/lib/mock-admin-data";
import type { AdminCoupon, CouponType, CouponStatus } from "@/types/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CouponFormData {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  maxUses: number;
  validFrom: string;
  expiresAt: string;
  status: CouponStatus;
}

const emptyForm: CouponFormData = {
  code: "",
  type: "percentage",
  value: 0,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  maxUses: 100,
  validFrom: "",
  expiresAt: "",
  status: "active",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

function generateCouponCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function statusBadge(status: CouponStatus) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "expired":
      return <Badge variant="warning">Expired</Badge>;
    case "inactive":
      return <Badge variant="secondary">Disabled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function typeBadge(type: CouponType) {
  if (type === "percentage") {
    return (
      <Badge variant="default">
        <Percent className="mr-1 h-3 w-3" />
        Percentage
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <DollarSign className="mr-1 h-3 w-3" />
      Fixed Amount
    </Badge>
  );
}

function usagePercentage(used: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(Math.round((used / max) * 100), 100);
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdminCouponsPage() {
  // ---- state ----
  const [coupons, setCoupons] = useState<AdminCoupon[]>(mockCoupons);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CouponStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | CouponType>("all");

  // dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(emptyForm);

  const [deleteDialogCoupon, setDeleteDialogCoupon] =
    useState<AdminCoupon | null>(null);

  // toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ---- derived ----
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (
        searchQuery &&
        !c.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      return true;
    });
  }, [coupons, searchQuery, statusFilter, typeFilter]);

  const counts = useMemo(
    () => ({
      all: coupons.length,
      active: coupons.filter((c) => c.status === "active").length,
      expired: coupons.filter((c) => c.status === "expired").length,
      inactive: coupons.filter((c) => c.status === "inactive").length,
    }),
    [coupons]
  );

  const stats = useMemo(() => {
    const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0);
    const totalDiscountGiven = coupons.reduce((sum, c) => {
      if (c.type === "percentage") {
        return sum + c.usedCount * c.value * 100;
      }
      return sum + c.usedCount * c.value;
    }, 0);
    return {
      totalCoupons: coupons.length,
      activeCoupons: counts.active,
      totalUsage,
      totalDiscountGiven,
    };
  }, [coupons, counts.active]);

  // ---- helpers ----
  function showToast(
    message: string,
    type: "success" | "error" = "success"
  ) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreateForm() {
    setEditingCoupon(null);
    setFormData({ ...emptyForm, validFrom: new Date().toISOString().split("T")[0] });
    setFormOpen(true);
  }

  function openEditForm(coupon: AdminCoupon) {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount ?? 0,
      maxUses: coupon.maxUses,
      validFrom: coupon.validFrom,
      expiresAt: coupon.expiresAt,
      status: coupon.status,
    });
    setFormOpen(true);
  }

  function handleFormSubmit() {
    if (!formData.code.trim() || formData.value <= 0) return;

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? { ...c, ...formData }
            : c
        )
      );
      showToast(`Coupon "${formData.code}" updated successfully`);
    } else {
      const newCoupon: AdminCoupon = {
        id: `coupon-${Date.now()}`,
        ...formData,
        usedCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCoupons((prev) => [...prev, newCoupon]);
      showToast(`Coupon "${formData.code}" created successfully`);
    }

    setFormOpen(false);
    setFormData(emptyForm);
    setEditingCoupon(null);
  }

  function deleteCoupon(coupon: AdminCoupon) {
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    showToast(`Coupon "${coupon.code}" deleted`, "error");
    setDeleteDialogCoupon(null);
  }

  const toggleStatus = useCallback(
    (coupon: AdminCoupon) => {
      const newStatus: CouponStatus =
        coupon.status === "active" ? "inactive" : "active";
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, status: newStatus } : c
        )
      );
      showToast(`Coupon "${coupon.code}" set to ${newStatus}`);
    },
    [showToast]
  );

  const copyCode = useCallback(
    (code: string) => {
      navigator.clipboard.writeText(code).then(() => {
        showToast(`"${code}" copied to clipboard`);
      });
    },
    [showToast]
  );

  const handleAutoGenerate = useCallback(() => {
    setFormData((prev) => ({ ...prev, code: generateCouponCode() }));
  }, []);

  // ---- render ----
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupon Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage discount coupons for the platform.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-1 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Ticket className="h-4 w-4" />
              <p className="text-sm">Total Coupons</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.totalCoupons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm">Active Coupons</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.activeCoupons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <p className="text-sm">Total Usage</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(stats.totalUsage)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <p className="text-sm">Total Discount Given</p>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(stats.totalDiscountGiven)} MMK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for status filter */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as "all" | CouponStatus)}
      >
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({counts.expired})</TabsTrigger>
          <TabsTrigger value="inactive">Disabled ({counts.inactive})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by coupon code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | CouponType)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Coupon list */}
      {filteredCoupons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Ticket className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              No coupons found
            </p>
            <p className="text-sm text-muted-foreground/70">
              Try adjusting your filters or create a new coupon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCoupons.map((coupon) => (
            <Card key={coupon.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Coupon code icon */}
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
                    <Ticket className="h-6 w-6 text-primary" />
                  </div>

                  {/* Coupon info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-lg font-bold tracking-wide">
                            {coupon.code}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyCode(coupon.code)}
                            title="Copy code"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {typeBadge(coupon.type)}
                          <span className="text-sm font-semibold text-primary">
                            {coupon.type === "percentage"
                              ? `${coupon.value}% OFF`
                              : `${formatCurrency(coupon.value)} MMK OFF`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {statusBadge(coupon.status)}
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {coupon.minOrderAmount > 0 && (
                        <span>
                          Min. order: {formatCurrency(coupon.minOrderAmount)} MMK
                        </span>
                      )}
                      {coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0 && (
                        <span>
                          Max. discount: {formatCurrency(coupon.maxDiscountAmount)} MMK
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(coupon.validFrom)} - {formatDate(coupon.expiresAt)}
                      </span>
                    </div>

                    {/* Usage bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Usage: {coupon.usedCount} / {coupon.maxUses}
                        </span>
                        <span>
                          {usagePercentage(coupon.usedCount, coupon.maxUses)}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${usagePercentage(coupon.usedCount, coupon.maxUses)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(coupon)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(coupon)}
                      >
                        {coupon.status === "active" ? (
                          <>
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Disable
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Enable
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialogCoupon(coupon)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ================================================================
          Create / Edit Coupon Dialog
          ================================================================ */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditingCoupon(null);
            setFormData(emptyForm);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? `Editing coupon "${editingCoupon.code}"`
                : "Fill in the details below to create a new discount coupon."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="coupon-code">
                Coupon Code <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="coupon-code"
                  placeholder="e.g. SUMMER25"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAutoGenerate}
                  title="Auto-generate code"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Discount type & value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-type">Discount Type</Label>
                <select
                  id="coupon-type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as CouponType,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (MMK)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-value">
                  Discount Value <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min={0}
                  max={formData.type === "percentage" ? 100 : undefined}
                  placeholder={formData.type === "percentage" ? "e.g. 10" : "e.g. 5000"}
                  value={formData.value || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      value: Number(e.target.value),
                    }))
                  }
                />
                {formData.type === "percentage" && formData.value > 100 && (
                  <p className="text-xs text-destructive">
                    Percentage cannot exceed 100%
                  </p>
                )}
              </div>
            </div>

            {/* Min order & Max discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-min-order">Minimum Order (MMK)</Label>
                <Input
                  id="coupon-min-order"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.minOrderAmount || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minOrderAmount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              {formData.type === "percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="coupon-max-discount">Max Discount (MMK)</Label>
                  <Input
                    id="coupon-max-discount"
                    type="number"
                    min={0}
                    placeholder="No limit"
                    value={formData.maxDiscountAmount || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxDiscountAmount: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              )}
            </div>

            {/* Usage limit */}
            <div className="space-y-2">
              <Label htmlFor="coupon-max-uses">Usage Limit</Label>
              <Input
                id="coupon-max-uses"
                type="number"
                min={1}
                placeholder="e.g. 100"
                value={formData.maxUses || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxUses: Number(e.target.value),
                  }))
                }
              />
            </div>

            {/* Validity dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-valid-from">Valid From</Label>
                <Input
                  id="coupon-valid-from"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validFrom: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-expires">Expires At</Label>
                <Input
                  id="coupon-expires"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expiresAt: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Status toggle */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: checked ? "active" : "inactive",
                    }))
                  }
                />
                <span className="text-sm font-medium">
                  {formData.status === "active" ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setFormOpen(false);
                setEditingCoupon(null);
                setFormData(emptyForm);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={
                !formData.code.trim() ||
                formData.value <= 0 ||
                (formData.type === "percentage" && formData.value > 100)
              }
            >
              {editingCoupon ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Delete Confirmation Dialog
          ================================================================ */}
      <Dialog
        open={!!deleteDialogCoupon}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogCoupon(null);
        }}
      >
        <DialogContent className="max-w-md">
          {deleteDialogCoupon && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">Delete Coupon</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete coupon &quot;{deleteDialogCoupon.code}&quot;?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-mono font-bold">{deleteDialogCoupon.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span>
                    {deleteDialogCoupon.type === "percentage"
                      ? `${deleteDialogCoupon.value}%`
                      : `${formatCurrency(deleteDialogCoupon.value)} MMK`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Times used:</span>
                  <span>{deleteDialogCoupon.usedCount}</span>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteDialogCoupon(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteCoupon(deleteDialogCoupon)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete Coupon
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Toast
          ================================================================ */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
