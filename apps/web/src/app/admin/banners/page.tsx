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
import { mockBanners } from "@/lib/mock-admin-data";
import type { AdminBanner, BannerStatus } from "@/types/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  href: string;
  position: "hero" | "promo" | "sidebar";
  status: BannerStatus;
  startDate: string;
  endDate: string;
}

const emptyForm: BannerFormData = {
  title: "",
  subtitle: "",
  imageUrl: "",
  href: "",
  position: "hero",
  status: "active",
  startDate: "",
  endDate: "",
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
        {banner.subtitle && !isMobile && (
          <p className="mt-0.5 text-xs text-white/80">
            {banner.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdminBannersPage() {
  // ---- state ----
  const [banners, setBanners] = useState<AdminBanner[]>(mockBanners);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BannerStatus>("all");
  const [positionFilter, setPositionFilter] = useState("all");

  // dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(emptyForm);

  const [deleteDialogBanner, setDeleteDialogBanner] =
    useState<AdminBanner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<AdminBanner | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );

  // toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ---- derived ----
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      if (
        searchQuery &&
        !b.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !b.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (positionFilter !== "all" && b.position !== positionFilter)
        return false;
      return true;
    });
  }, [banners, searchQuery, statusFilter, positionFilter]);

  const counts = useMemo(
    () => ({
      all: banners.length,
      active: banners.filter((b) => b.status === "active").length,
      inactive: banners.filter((b) => b.status === "inactive").length,
      scheduled: banners.filter((b) => b.status === "scheduled").length,
    }),
    [banners]
  );

  // ---- helpers ----
  function showToast(
    message: string,
    type: "success" | "error" = "success"
  ) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreateForm() {
    setEditingBanner(null);
    setFormData({ ...emptyForm });
    setFormOpen(true);
  }

  function openEditForm(banner: AdminBanner) {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      href: banner.href,
      position: banner.position,
      status: banner.status,
      startDate: banner.startDate,
      endDate: banner.endDate,
    });
    setFormOpen(true);
  }

  function handleFormSubmit() {
    if (!formData.title.trim()) return;

    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBanner.id
            ? { ...b, ...formData }
            : b
        )
      );
      showToast(`"${formData.title}" updated successfully`);
    } else {
      const newBanner: AdminBanner = {
        id: `banner-${Date.now()}`,
        ...formData,
      };
      setBanners((prev) => [...prev, newBanner]);
      showToast(`"${formData.title}" created successfully`);
    }

    setFormOpen(false);
    setFormData(emptyForm);
    setEditingBanner(null);
  }

  function deleteBanner(banner: AdminBanner) {
    setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    showToast(`"${banner.title}" deleted`, "error");
    setDeleteDialogBanner(null);
  }

  const toggleStatus = useCallback(
    (banner: AdminBanner) => {
      const newStatus: BannerStatus =
        banner.status === "active" ? "inactive" : "active";
      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, status: newStatus } : b
        )
      );
      showToast(`"${banner.title}" set to ${newStatus}`);
    },
    [showToast]
  );

  const moveBanner = useCallback(
    (bannerId: string, direction: "up" | "down") => {
      setBanners((prev) => {
        const idx = prev.findIndex((b) => b.id === bannerId);
        if (idx === -1) return prev;
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= prev.length) return prev;
        const next = [...prev];
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        return next;
      });
    },
    []
  );

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
        <Button onClick={openCreateForm}>
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
                      disabled={index === 0}
                      onClick={() => moveBanner(banner.id, "up")}
                      title="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === filteredBanners.length - 1}
                      onClick={() => moveBanner(banner.id, "down")}
                      title="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Banner image preview */}
                  <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector(".fallback-icon")) {
                          const icon = document.createElement("div");
                          icon.className =
                            "fallback-icon absolute inset-0 flex items-center justify-center";
                          icon.innerHTML =
                            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-muted-foreground/50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                          parent.appendChild(icon);
                        }
                      }}
                    />
                  </div>

                  {/* Banner info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">
                          {banner.title}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                          {banner.subtitle}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {statusBadge(banner.status)}
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
                      {banner.href && (
                        <span className="truncate max-w-[200px]">
                          Link: {banner.href}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(banner)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(banner)}
                      >
                        {banner.status === "active" ? (
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
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialogBanner(banner)}
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
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditingBanner(null);
            setFormData(emptyForm);
          }
        }}
      >
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="banner-subtitle">Description</Label>
              <Textarea
                id="banner-subtitle"
                placeholder="e.g. Up to 50% off on all cargo items"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subtitle: e.target.value,
                  }))
                }
                rows={2}
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
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: checked ? "active" : "inactive",
                      }))
                    }
                  />
                  <span className="text-sm font-medium">
                    {formData.status === "active" ? "Active" : "Inactive"}
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
            <Button
              variant="ghost"
              onClick={() => {
                setFormOpen(false);
                setEditingBanner(null);
                setFormData(emptyForm);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={!formData.title.trim()}
            >
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
        onOpenChange={(open) => {
          if (!open) setPreviewBanner(null);
        }}
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
                    subtitle: previewBanner.subtitle,
                    imageUrl: previewBanner.imageUrl,
                    href: previewBanner.href,
                    position: previewBanner.position,
                    status: previewBanner.status,
                    startDate: previewBanner.startDate,
                    endDate: previewBanner.endDate,
                  }}
                  mode={previewMode}
                />
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Status: </span>
                  {statusBadge(previewBanner.status)}
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
                  <span className="truncate">{previewBanner.href || "None"}</span>
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
        onOpenChange={(open) => {
          if (!open) setDeleteDialogBanner(null);
        }}
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
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteBanner(deleteDialogBanner)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete Banner
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
