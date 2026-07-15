"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Package,
  Filter,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import {
  useAdminProducts,
  useApproveProduct,
} from "@/lib/services/admin.service";
import type { AdminProduct } from "@/lib/services/admin.service";

// ---------------------------------------------------------------------------
// Types (local filter types aligned with API status values)
// ---------------------------------------------------------------------------

type StatusFilter = "all" | AdminProduct["status"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAllCategories(products: AdminProduct[]): string[] {
  const set = new Set(products.map((p) => p.category?.name).filter(Boolean));
  return Array.from(set).sort() as string[];
}

function getAllSellers(products: AdminProduct[]): string[] {
  const set = new Set(products.map((p) => p.seller?.name).filter(Boolean));
  return Array.from(set).sort() as string[];
}

function statusBadge(status: AdminProduct["status"]) {
  switch (status) {
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "APPROVED":
      return <Badge variant="success">Approved</Badge>;
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

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-80" />
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdminProductsPage() {
  // ---- data ----
  const { data, isLoading } = useAdminProducts();
  const approveMutation = useApproveProduct();

  const products: AdminProduct[] = Array.isArray(data) ? data : [];

  // ---- state ----
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");

  // selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // dialogs
  const [reviewProduct, setReviewProduct] = useState<AdminProduct | null>(null);
  const [approveNote, setApproveNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogProduct, setRejectDialogProduct] =
    useState<AdminProduct | null>(null);

  // bulk dialogs
  const [bulkApproveDialogOpen, setBulkApproveDialogOpen] = useState(false);
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [bulkApproveNote, setBulkApproveNote] = useState("");
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  // ---- derived ----
  const categories = useMemo(() => getAllCategories(products), [products]);
  const sellers = useMemo(() => getAllSellers(products), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== "all" && p.category?.name !== categoryFilter) {
        return false;
      }
      if (sellerFilter !== "all" && p.seller?.name !== sellerFilter) {
        return false;
      }
      return true;
    });
  }, [products, searchQuery, statusFilter, categoryFilter, sellerFilter]);

  const counts = useMemo(() => {
    return {
      all: products.length,
      PENDING: products.filter((p) => p.status === "PENDING").length,
      APPROVED: products.filter((p) => p.status === "APPROVED").length,
      REJECTED: products.filter((p) => p.status === "REJECTED").length,
      DRAFT: products.filter((p) => p.status === "DRAFT").length,
    };
  }, [products]);

  const allVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.has(p.id));

  // ---- helpers ----

  const toggleSelectAll = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  }, [allVisibleSelected, filteredProducts]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const approveProduct = useCallback(
    (product: AdminProduct, note: string) => {
      approveMutation.mutate(
        { id: product.id, data: { status: "APPROVED", reason: note || undefined } },
        {
          onSuccess: () => {
            toast({ title: `"${product.name}" approved` });
            setReviewProduct(null);
            setApproveNote("");
            setSelectedIds((prev) => {
              const next = new Set(prev);
              next.delete(product.id);
              return next;
            });
          },
          onError: () => {
            toast({ title: "Failed to approve product", variant: "destructive" });
          },
        }
      );
    },
    [approveMutation]
  );

  const rejectProduct = useCallback(
    (product: AdminProduct, reason: string) => {
      approveMutation.mutate(
        { id: product.id, data: { status: "REJECTED", reason } },
        {
          onSuccess: () => {
            toast({ title: `"${product.name}" rejected` });
            setRejectDialogProduct(null);
            setRejectReason("");
            setSelectedIds((prev) => {
              const next = new Set(prev);
              next.delete(product.id);
              return next;
            });
          },
          onError: () => {
            toast({ title: "Failed to reject product", variant: "destructive" });
          },
        }
      );
    },
    [approveMutation]
  );

  const bulkApprove = useCallback(
    (note: string) => {
      const idsToApprove = Array.from(selectedIds);
      let completed = 0;
      idsToApprove.forEach((id) => {
        approveMutation.mutate(
          { id, data: { status: "APPROVED", reason: note || undefined } },
          {
            onSettled: () => {
              completed++;
              if (completed === idsToApprove.length) {
                toast({ title: `${idsToApprove.length} product(s) approved` });
                setSelectedIds(new Set());
                setBulkApproveDialogOpen(false);
                setBulkApproveNote("");
              }
            },
          }
        );
      });
    },
    [selectedIds, approveMutation]
  );

  const bulkReject = useCallback(
    (reason: string) => {
      const idsToReject = Array.from(selectedIds);
      let completed = 0;
      idsToReject.forEach((id) => {
        approveMutation.mutate(
          { id, data: { status: "REJECTED", reason } },
          {
            onSettled: () => {
              completed++;
              if (completed === idsToReject.length) {
                toast({ title: `${idsToReject.length} product(s) rejected` });
                setSelectedIds(new Set());
                setBulkRejectDialogOpen(false);
                setBulkRejectReason("");
              }
            },
          }
        );
      });
    },
    [selectedIds, approveMutation]
  );

  // ---- loading ----
  if (isLoading) {
    return <ProductsSkeleton />;
  }

  // ---- render ----
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Product Approval Queue
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and manage product submissions from sellers.
          </p>
        </div>
      </div>

      {/* Tabs for status */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
      >
        <TabsList>
          <TabsTrigger value="all">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="PENDING">
            Pending ({counts.PENDING})
          </TabsTrigger>
          <TabsTrigger value="APPROVED">
            Approved ({counts.APPROVED})
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            Rejected ({counts.REJECTED})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2">
              <Filter className="hidden h-4 w-4 text-muted-foreground md:block" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Seller filter */}
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Sellers</option>
              {sellers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm font-medium">
              {selectedIds.size} product(s) selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => setBulkApproveDialogOpen(true)}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Bulk Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setBulkRejectDialogOpen(true)}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Bulk Reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product list */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              No products found
            </p>
            <p className="text-sm text-muted-foreground/70">
              Try adjusting your filters or search query.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Select all row */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select all visible ({filteredProducts.length})
            </span>
          </div>

          {/* Product cards */}
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                    />
                  </div>

                  {/* Product image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">
                          {product.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Seller: {product.seller?.name ?? "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Category: {product.category?.name ?? "Uncategorized"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {statusBadge(product.status)}
                        <span className="text-sm font-semibold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Submitted{" "}
                          {new Date(product.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReviewProduct(product)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Review
                      </Button>
                      {product.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={approveMutation.isPending}
                            onClick={() => {
                              approveProduct(product, "");
                            }}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={approveMutation.isPending}
                            onClick={() => setRejectDialogProduct(product)}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ================================================================
          Review Dialog (full product details)
          ================================================================ */}
      <Dialog
        open={!!reviewProduct}
        onOpenChange={(open) => {
          if (!open) {
            setReviewProduct(null);
            setApproveNote("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          {reviewProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{reviewProduct.name}</DialogTitle>
                <DialogDescription>
                  Product ID: {reviewProduct.id} &middot; Submitted{" "}
                  {new Date(reviewProduct.createdAt).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Image gallery area */}
                <div className="flex items-center justify-center rounded-lg border bg-muted p-2">
                  {reviewProduct.images?.[0] ? (
                    <img
                      src={reviewProduct.images[0]}
                      alt={reviewProduct.name}
                      className="max-h-64 rounded object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Package className="h-16 w-16 text-muted-foreground/50" />
                  )}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Seller
                    </p>
                    <p className="text-sm font-medium">
                      {reviewProduct.seller?.name ?? "Unknown"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Category
                    </p>
                    <p className="text-sm font-medium">
                      {reviewProduct.category?.name ?? "Uncategorized"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Price
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(reviewProduct.price)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Status
                    </p>
                    <div>{statusBadge(reviewProduct.status)}</div>
                  </div>
                </div>

                {/* Approve with notes */}
                {reviewProduct.status === "PENDING" && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Approve Notes (optional)
                    </p>
                    <Textarea
                      placeholder="Add notes for the seller (optional)..."
                      value={approveNote}
                      onChange={(e) => setApproveNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {reviewProduct.status === "PENDING" && (
                <DialogFooter>
                  <Button
                    variant="destructive"
                    disabled={approveMutation.isPending}
                    onClick={() => {
                      setReviewProduct(null);
                      setRejectDialogProduct(reviewProduct);
                    }}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    disabled={approveMutation.isPending}
                    onClick={() =>
                      approveProduct(reviewProduct, approveNote)
                    }
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Single Reject Dialog
          ================================================================ */}
      <Dialog
        open={!!rejectDialogProduct}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialogProduct(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          {rejectDialogProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">Reject Product</DialogTitle>
                <DialogDescription>
                  Provide a reason for rejecting &quot;{rejectDialogProduct.name}&quot;.
                  This will be sent to the seller.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">
                    The seller will be notified with the rejection reason.
                  </p>
                </div>
                <Textarea
                  placeholder="Enter rejection reason (required)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRejectDialogProduct(null);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={!rejectReason.trim() || approveMutation.isPending}
                  onClick={() =>
                    rejectProduct(rejectDialogProduct, rejectReason)
                  }
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Confirm Reject
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Bulk Approve Dialog
          ================================================================ */}
      <Dialog
        open={bulkApproveDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setBulkApproveDialogOpen(false);
            setBulkApproveNote("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pr-8">Bulk Approve Products</DialogTitle>
            <DialogDescription>
              Approve {selectedIds.size} selected product(s). All products will
              be set to &quot;Approved&quot; status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Approve Notes (optional)
            </p>
            <Textarea
              placeholder="Add a note to all approved products (optional)..."
              value={bulkApproveNote}
              onChange={(e) => setBulkApproveNote(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setBulkApproveDialogOpen(false);
                setBulkApproveNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={approveMutation.isPending}
              onClick={() => bulkApprove(bulkApproveNote)}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Approve {selectedIds.size} Product(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Bulk Reject Dialog
          ================================================================ */}
      <Dialog
        open={bulkRejectDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setBulkRejectDialogOpen(false);
            setBulkRejectReason("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pr-8">Bulk Reject Products</DialogTitle>
            <DialogDescription>
              Reject {selectedIds.size} selected product(s). All products will
              be set to &quot;Rejected&quot; status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-destructive" />
              <p className="text-sm text-destructive">
                All selected sellers will be notified with the rejection reason.
              </p>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Rejection Reason (required)
            </p>
            <Textarea
              placeholder="Enter rejection reason for all products..."
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setBulkRejectDialogOpen(false);
                setBulkRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!bulkRejectReason.trim() || approveMutation.isPending}
              onClick={() => bulkReject(bulkRejectReason)}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject {selectedIds.size} Product(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
