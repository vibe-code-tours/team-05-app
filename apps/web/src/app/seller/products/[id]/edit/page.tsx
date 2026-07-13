"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X, Plus, Package } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
// formatPrice available from @/lib/utils if needed
import { mockSellerProducts } from "@/lib/mock-seller-data";

const categories = [
  "Fashion Accessories",
  "Clothing",
  "Home Decor",
  "Bags & Accessories",
  "Beauty & Health",
];

interface VariantOption {
  type: "size" | "color";
  value: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const product = mockSellerProducts.find((p) => p.id === productId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    sku: "",
  });

  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [variantType, setVariantType] = useState<"size" | "color">("size");
  const [variantValue, setVariantValue] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: "",
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        sku: product.sku,
      });
      if (product.image) {
        setImagePreviewUrls([product.image]);
      }
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    addImageFiles(files);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    addImageFiles(files);
  };

  const addImageFiles = (files: File[]) => {
    const newFiles = [...imageFiles, ...files].slice(0, 5);
    setImageFiles(newFiles);

    const newUrls = [
      ...imagePreviewUrls.filter((url) => !url.startsWith("blob:")),
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ].slice(0, 5);
    setImagePreviewUrls(newUrls);
  };

  const removeImage = (index: number) => {
    if (imagePreviewUrls[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    if (!variantValue.trim()) return;
    setVariants((prev) => [...prev, { type: variantType, value: variantValue.trim() }]);
    setVariantValue("");
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    router.push("/seller/products");
  };

  const handleCancel = () => {
    imagePreviewUrls.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    router.push("/seller/products");
  };

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold">Product not found</h2>
        <p className="text-sm text-muted-foreground">
          The product you are looking for does not exist.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/seller/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">
            Update details for &quot;{product.name}&quot;
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Thai Silk Scarf - Premium Collection"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your product features, materials, and dimensions..."
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="e.g., TSF-001"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (MMK) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Variant Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={variantType}
                    onChange={(e) =>
                      setVariantType(e.target.value as "size" | "color")
                    }
                    className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="size">Size</option>
                    <option value="color">Color</option>
                  </select>
                  <Input
                    value={variantValue}
                    onChange={(e) => setVariantValue(e.target.value)}
                    placeholder={
                      variantType === "size"
                        ? "e.g., S, M, L, XL"
                        : "e.g., Red, Blue, Green"
                    }
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addVariant();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addVariant}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {variants.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        <span className="text-xs text-muted-foreground">
                          {variant.type}:
                        </span>
                        {variant.value}
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {variants.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No variants added. Add sizes or colors for this product.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleImageDrop}
                >
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag & drop images here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    PNG, JPG up to 5MB (max 5 images)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    Choose Files
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>

                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full rounded-md object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Product Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Product Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sold</span>
                  <span className="font-medium">{product.sold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{product.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{product.updatedAt}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    <Package className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
