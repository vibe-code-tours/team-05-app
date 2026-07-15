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
  Loader2,
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
import { toast } from "@/components/ui/use-toast";
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@/lib/services/coupon.service";
import type {
  Coupon as ApiCoupon,
  CreateCouponInput,
} from "@/lib/services/coupon.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CouponType = "percentage" | "fixed";
type CouponStatus = "active" | "inactive" | "expired";

interface CouponFormData {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxUses: number;
  expiresAt: string;
  active: boolean;
}

const emptyForm: CouponFormData = {
  code: "",
  type: "percentage",
  value: 0,
  minOrderAmount: 0,
  maxUses: 100,
  expiresAt: "",
  active: true,
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

function deriveCouponStatus(coupon: ApiCoupon): CouponStatus {
  if (!coupon.active) return "inactive";
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return "expired";
  return "active";
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

function mapApiTypeToForm(apiType: "PERCENTAGE" | "FIXED"): CouponType {
  return apiType === "PERCENTAGE" ? "percentage" : "fixed";
}

function mapFormTypeToApi(formType: CouponType): "PERCENTAGE" | "FIXED" {
  return formType === "percentage" ? "PERCENTAGE" : "FIXED";
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdminCouponsPage() {
  // ---- data ----
  const { data: apiResponse, isLoading } = useAdminCoupons();
  const coupons: ApiCoupon[] = useMemo(() => apiResponse?.data ?? [], [apiResponse]);
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();

  const isMutating = createCoupon.isPending || updateCoupon.isPending || deleteCouponMutation.isPending;

  // ---- state ----
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CouponStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | CouponType>("all");

  // dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ApiCoupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(emptyForm);

  const [deleteDialogCoupon, setDeleteDialogCoupon] = useState<ApiCoupon | null>(null);

  // ---- derived ----
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (
        searchQuery &&
        !c.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      const status = deriveCouponStatus(c);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      const formType = mapApiTypeToForm(c.discountType);
      if (typeFilter !== "all" && formType !== typeFilter) return false;
      return true;
    });
  }, [coupons, searchQuery, statusFilter, typeFilter]);

  const counts = useMemo(() => {
    const all = coupons.length;
    let active = 0;
    let expired = 0;
    let inactive = 0;
    for (const c of coupons) {
      const s = deriveCouponStatus(c);
      if (s === "active") active++;
      else if (s === "expired") expired++;
      else inactive++;
    }
    return { all, active, expired, inactive };
  }, [coupons]);

  const stats = useMemo(() => {
    const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0);
    const totalDiscountGiven = coupons.reduce((sum, c) => {
      if (c.discountType === "PERCENTAGE") {
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
  function openCreateForm() {
    setEditingCoupon(null);
    setFormData({ ...emptyForm });
    setFormOpen(true);
  }

  function openEditForm(coupon: ApiCoupon) {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: mapApiTypeToForm(coupon.discountType),
      value: coupon.value,
      minOrderAmount: coupon.minOrder,
      maxUses: coupon.usageLimit,
      expiresAt: coupon.expiresAt,
      active: coupon.active,
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCoupon(null);
    setFormData(emptyForm);
  }

  function handleFormSubmit() {
    if (!formData.code.trim() || formData.value <= 0) return;

    const payload: CreateCouponInput = {
      code: formData.code.trim().toUpperCase(),
      discountType: mapFormTypeToApi(formData.type),
      value: formData.value,
      minOrder: formData.minOrderAmount || undefined,
      usageLimit: formData.maxUses || undefined,
      expiresAt: formData.expiresAt || undefined,
      active: formData.active,
    };

    if (editingCoupon) {
      updateCoupon.mutate(
        { id: editingCoupon.id, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Coupon updated", description: `Coupon "${formData.code}" has been updated.` });
            closeForm();
          },
          onError: (err) => {
            toast({ title: "Update failed", description: err.message ?? "Something went wrong.", variant: "destructive" });
          },
        }
      );
    } else {
      createCoupon.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Coupon created", description: `Coupon "${formData.code}" has been created.` });
          closeForm();
        },
        onError: (err) => {
          toast({ title: "Creation failed", description: err.message ?? "Something went wrong.", variant: "destructive" });
        },
      });
    }
  }

  function handleDeleteCoupon() {
    if (!deleteDialogCoupon) return;
    const id = deleteDialogCoupon.id;
    const code = deleteDialogCoupon.code;
    deleteCouponMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Coupon deleted", description: `Coupon "${code}" has been removed.` });
        setDeleteDialogCoupon(null);
      },
      onError: (err) => {
        toast({ title: "Delete failed", description: err.message ?? "Something went wrong.", variant: "destructive" });
        setDeleteDialogCoupon(null);
      },
    });
  }

  const toggleStatus = useCallback(
    (coupon: ApiCoupon) => {
      updateCoupon.mutate(
        { id: coupon.id, data: { active: !coupon.active } },
        {
          onSuccess: () => {
            const newStatus = !coupon.active ? "active" : "inactive";
            toast({ title: "Status updated", description: `Coupon "${coupon.code}" set to ${newStatus}.` });
          },
          onError: (err) => {
            toast({ title: "Update failed", description: err.message ?? "Something went wrong.", variant: "destructive" });
          },
        }
      );
    },
    [updateCoupon]
  );

  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({ title: "Copied", description: `"${code}" copied to clipboard.` });
    });
  }, []);

  const handleAutoGenerate = useCallback(() => {
    setFormData((prev) => ({ ...prev, code: generateCouponCode() }));
  }, []);

  // ---- loading state ----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        <Button onClick={openCreateForm} disabled={isMutating}>
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
          {filteredCoupons.map((coupon) => {
            const formType = mapApiTypeToForm(coupon.discountType);
            return (
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
                            {typeBadge(formType)}
                            <span className="text-sm font-semibold text-primary">
                              {formType === "percentage"
                                ? `${coupon.value}% OFF`
                                : `${formatCurrency(coupon.value)} MMK OFF`}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {statusBadge(deriveCouponStatus(coupon))}
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {coupon.minOrder > 0 && (
                          <span>
                            Min. order: {formatCurrency(coupon.minOrder)} MMK
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {formatDate(coupon.expiresAt)}
                        </span>
                      </div>

                      {/* Usage bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Usage: {coupon.usedCount} / {coupon.usageLimit}
                          </span>
                          <span>
                            {usagePercentage(coupon.usedCount, coupon.usageLimit)}%
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${usagePercentage(coupon.usedCount, coupon.usageLimit)}%`,
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
                          disabled={isMutating}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStatus(coupon)}
                          disabled={isMutating}
                        >
                          {coupon.active ? (
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
                          disabled={isMutating}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ================================================================
          Create / Edit Coupon Dialog
          ================================================================ */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
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

            {/* Min order */}
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

            {/* Expires at */}
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

            {/* Status toggle */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
                <span className="text-sm font-medium">
                  {formData.active ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeForm} disabled={isMutating}>
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={
                !formData.code.trim() ||
                formData.value <= 0 ||
                (formData.type === "percentage" && formData.value > 100) ||
                isMutating
              }
            >
              {createCoupon.isPending || updateCoupon.isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : null}
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
        onOpenChange={(open) => { if (!open) setDeleteDialogCoupon(null); }}
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
                    {deleteDialogCoupon.discountType === "PERCENTAGE"
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
                  disabled={deleteCouponMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteCoupon}
                  disabled={deleteCouponMutation.isPending}
                >
                  {deleteCouponMutation.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1 h-4 w-4" />
                  )}
                  Delete Coupon
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
