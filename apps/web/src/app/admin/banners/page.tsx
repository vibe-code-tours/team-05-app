"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Image,
  ArrowUp,
  ArrowDown,
  Eye,
  Monitor,
  Smartphone,
  X,
  CheckCircle2,
  XCircle,
  Upload,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from "@/lib/services/banner.service";
import type {
  Banner as ApiBanner,
  CreateBannerInput,
} from "@/lib/services/banner.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BannerStatus = "active" | "inactive" | "scheduled";

interface BannerFormData {
  title: string;
  imageUrl: string;
  href: string;
  position: "hero" | "promo" | "sidebar";
  active: boolean;
  startDate: string;
  endDate: string;
  order: number;
}

const emptyForm: BannerFormData = {
  title: "",
  imageUrl: "",
  href: "",
  position: "hero",
  active: true,
  startDate: "",
  endDate: "",
  order: 0,
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

function deriveStatus(banner: ApiBanner): BannerStatus {
  if (!banner.active) return "inactive";
  const now = new Date();
  const start = new Date(banner.startDate);
  const end = new Date(banner.endDate);
  if (now < start) return "scheduled";
  if (now > end) return "inactive";
  return "active";
}

function statusBadge(status: BannerStatus) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    case "scheduled":
      return <Badge variant="warning">Scheduled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function positionLabel(position: string) {
  switch (position) {
    case "hero":
      return "Hero Banner";
    case "promo":
      return "Promo Section";
    case "sidebar":
      return "Sidebar";
    default:
      return position;
  }
}

// ---------------------------------------------------------------------------
// Banner Preview Component
// ---------------------------------------------------------------------------

function BannerPreview({
  banner,
  mode,
}: {
  banner: BannerFormData;
  mode: "desktop" | "mobile";
}) {
  const width = mode === "desktop" ? "w-full" : "w-48";
  const height = mode === "desktop" ? "h-48" : "h-28";
  const isMobile = mode === "mobile";

  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-muted ${width} ${height}`}
    >
      {banner.imageUrl ? (
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Image className={`text-muted-foreground/50 ${isMobile ? "h-8 w-8" : "h-12 w-12"}`} />
        </div>
      )}

      {/* Overlay with text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className={`absolute bottom-0 left-0 p-3 ${isMobile ? "right-0" : "right-1/4"}`}>
        <p className={`font-bold text-white ${isMobile ? "text-xs" : "text-sm"}`}>
          {banner.title || "Banner Title"}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdminBannersPage() {
  // ---- data ----
  const { data: apiResponse, isLoading } = useAdminBanners();
  const banners: ApiBanner[] = useMemo(() => apiResponse?.data ?? [], [apiResponse]);
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const isMutating = createBanner.isPending || updateBanner.isPending || deleteBanner.isPending;

  // ---- state ----
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BannerStatus>("all");
  const [positionFilter, setPositionFilter] = useState("all");

  // dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<ApiBanner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(emptyForm);

  const [deleteDialogBanner, setDeleteDialogBanner] = useState<ApiBanner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<ApiBanner | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // ---- derived ----
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      if (
        searchQuery &&
        !b.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      const status = deriveStatus(b);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (positionFilter !== "all" && b.position !== positionFilter) return false;
      return true;
    });
  }, [banners, searchQuery, statusFilter, positionFilter]);

  const counts = useMemo(() => {
    const all = banners.length;
    let active = 0;
    let inactive = 0;
    let scheduled = 0;
    for (const b of banners) {
      const s = deriveStatus(b);
      if (s === "active") active++;
      else if (s === "inactive") inactive++;
      else scheduled++;
    }
    return { all, active, inactive, scheduled };
  }, [banners]);

  // ---- helpers ----
  function openCreateForm() {
    setEditingBanner(null);
    setFormData({ ...emptyForm });
    setFormOpen(true);
  }

  function openEditForm(banner: ApiBanner) {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.image,
      href: banner.link ?? "",
      position: banner.position,
      active: banner.active,
      startDate: banner.startDate,
      endDate: banner.endDate,
      order: banner.order,
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingBanner(null);
    setFormData(emptyForm);
  }

  function handleFormSubmit() {
    if (!formData.title.trim()) return;

    const payload: CreateBannerInput = {
      title: formData.title.trim(),
      image: formData.imageUrl,
      link: formData.href || undefined,
      position: formData.position,
      startDate: formData.startDate,
      endDate: formData.endDate,
      active: formData.active,
      order: formData.order,
    };

    if (editingBanner) {
      updateBanner.mutate(
        { id: editingBanner.id, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Banner updated", description: `"${formData.title}" has been updated.` });
            closeForm();
          },
          onError: (err) => {
            toast({ title: "Update failed", description: err.message ?? "Something went wrong.", variant: "destructive" });
          },
        }
      );
    } else {
      createBanner.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Banner created", description: `"${formData.title}" has been created.` });
          closeForm();
        },
        onError: (err) => {
          toast({ title: "Creation failed", description: err.message ?? "Something went wrong.", variant: "destructive" });
        },
      });
    }
  }

  function handleDeleteBanner() {
    if (!deleteDialogBanner) return;
    const id = deleteDialogBanner.id;
    const title = deleteDialogBanner.title;
    deleteBanner.mutate(id, {
      onSuccess: () => {
        toast({ title: "Banner deleted", description: `"${title}" has been removed.` });
        setDeleteDialogBanner(null);
      },
      onError: (err) => {
        toast({ title: "Delete failed", description: err.message ?? "Something went wrong.", variant: "destructive" });
        setDeleteDialogBanner(null);
      },
    });
  }

  const toggleStatus = useCallback(
    (banner: ApiBanner) => {
      updateBanner.mutate(
        { id: banner.id, data: { active: !banner.active } },
        {
          onSuccess: () => {
            const newStatus = !banner.active ? "active" : "inactive";
            toast({ title: "Status updated", description: `"${banner.title}" set to ${newStatus}.` });
          },
          onError: (err) => {
            toast({ title: "Update failed", description: err.message ?? "Something went wrong.", variant: "destructive" });
          },
        }
      );
    },
    [updateBanner]
  );

  const moveBanner = useCallback(
    (bannerId: string, direction: "up" | "down") => {
      const idx = filteredBanners.findIndex((b) => b.id === bannerId);
      if (idx === -1) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= filteredBanners.length) return;
      const a = filteredBanners[idx];
      const b = filteredBanners[swapIdx];
      // Swap order values and persist both
      updateBanner.mutate({ id: a.id, data: { order: b.order } });
      updateBanner.mutate({ id: b.id, data: { order: a.order } });
    },
    [filteredBanners, updateBanner]
  );

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
          <h1 className="text-2xl font-bold tracking-tight">Banner Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage promotional banners for the storefront.
          </p>
        </div>
        <Button onClick={openCreateForm} disabled={isMutating}>
          <Plus className="mr-1 h-4 w-4" />
          Create Banner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: counts.all },
          { label: "Active", value: counts.active },
          { label: "Inactive", value: counts.inactive },
          { label: "Scheduled", value: counts.scheduled },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for status filter */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as "all" | BannerStatus)}
      >
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({counts.inactive})</TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({counts.scheduled})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search banners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Positions</option>
              <option value="hero">Hero</option>
              <option value="promo">Promo</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Banner list */}
      {filteredBanners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Image className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              No banners found
            </p>
            <p className="text-sm text-muted-foreground/70">
              Try adjusting your filters or create a new banner.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBanners.map((banner, index) => (
            <Card key={banner.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Order controls */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === 0 || isMutating}
                      onClick={() => moveBanner(banner.id, "up")}
                      title="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-bold text-muted-foreground">
                      #{banner.order ?? index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === filteredBanners.length - 1 || isMutating}
                      onClick={() => moveBanner(banner.id, "down")}
                      title="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Banner image preview */}
                  <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {banner.image ? (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Banner info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">
                          {banner.title}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {statusBadge(deriveStatus(banner))}
                        <span className="text-xs text-muted-foreground">
                          {positionLabel(banner.position)}
                        </span>
                      </div>
                    </div>

                    {/* Dates and link */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                      </span>
                      {banner.link && (
                        <span className="truncate max-w-[200px]">
                          Link: {banner.link}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(banner)}
                        disabled={isMutating}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(banner)}
                        disabled={isMutating}
                      >
                        {banner.active ? (
                          <>
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewBanner(banner)}
                        disabled={isMutating}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialogBanner(banner)}
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
          ))}
        </div>
      )}

      {/* ================================================================
          Create / Edit Banner Dialog
          ================================================================ */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {editingBanner ? "Edit Banner" : "Create New Banner"}
            </DialogTitle>
            <DialogDescription>
              {editingBanner
                ? `Editing "${editingBanner.title}"`
                : "Fill in the details below to create a new promotional banner."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="banner-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="banner-title"
                placeholder="e.g. CrossMart Mega Sale"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-32 w-56 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                  {formData.imageUrl ? (
                    <>
                      <img
                        src={formData.imageUrl}
                        alt="Banner preview"
                        className="h-full w-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-5 w-5"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, imageUrl: "" }))
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                      <Upload className="h-6 w-6 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/70">
                        No image
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Paste image URL or upload"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200x400px for hero banners, 800x400px for
                    promo.
                  </p>
                </div>
              </div>
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label htmlFor="banner-link">Link URL</Label>
              <Input
                id="banner-link"
                placeholder="e.g. /products?promo=mega-sale"
                value={formData.href}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, href: e.target.value }))
                }
              />
            </div>

            {/* Position & Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-position">Position</Label>
                <select
                  id="banner-position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: e.target.value as BannerFormData["position"],
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="hero">Hero Banner</option>
                  <option value="promo">Promo Section</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, active: checked }))
                    }
                  />
                  <span className="text-sm font-medium">
                    {formData.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-start">Start Date</Label>
                <Input
                  id="banner-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-end">End Date</Label>
                <Input
                  id="banner-end"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeForm} disabled={isMutating}>
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={!formData.title.trim() || isMutating}
            >
              {createBanner.isPending || updateBanner.isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : null}
              {editingBanner ? "Save Changes" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Preview Dialog
          ================================================================ */}
      <Dialog
        open={!!previewBanner}
        onOpenChange={(open) => { if (!open) setPreviewBanner(null); }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="pr-8">Banner Preview</DialogTitle>
            <DialogDescription>
              {previewBanner?.title} &mdash; {positionLabel(previewBanner?.position ?? "")}
            </DialogDescription>
          </DialogHeader>

          {previewBanner && (
            <div className="space-y-4">
              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={previewMode === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("desktop")}
                >
                  <Monitor className="mr-1 h-3.5 w-3.5" />
                  Desktop
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Smartphone className="mr-1 h-3.5 w-3.5" />
                  Mobile
                </Button>
              </div>

              {/* Preview */}
              <div className="flex justify-center rounded-lg border bg-background p-4">
                <BannerPreview
                  banner={{
                    title: previewBanner.title,
                    imageUrl: previewBanner.image,
                    href: previewBanner.link ?? "",
                    position: previewBanner.position,
                    active: previewBanner.active,
                    startDate: previewBanner.startDate,
                    endDate: previewBanner.endDate,
                    order: previewBanner.order,
                  }}
                  mode={previewMode}
                />
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Status: </span>
                  {statusBadge(deriveStatus(previewBanner))}
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Position: </span>
                  {positionLabel(previewBanner.position)}
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Active: </span>
                  {formatDate(previewBanner.startDate)} - {formatDate(previewBanner.endDate)}
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Link: </span>
                  <span className="truncate">{previewBanner.link || "None"}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Delete Confirmation Dialog
          ================================================================ */}
      <Dialog
        open={!!deleteDialogBanner}
        onOpenChange={(open) => { if (!open) setDeleteDialogBanner(null); }}
      >
        <DialogContent className="max-w-md">
          {deleteDialogBanner && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">Delete Banner</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{deleteDialogBanner.title}&quot;?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteDialogBanner(null)}
                  disabled={deleteBanner.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteBanner}
                  disabled={deleteBanner.isPending}
                >
                  {deleteBanner.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1 h-4 w-4" />
                  )}
                  Delete Banner
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
