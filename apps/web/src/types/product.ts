/**
 * Shared product types used across the application.
 */
import type { ProductImage } from "@/lib/services/product.service";

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  type: string;
  stock: number;
  price?: number;
  sku?: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  category: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
  seller: { id: string; name: string; avatar?: string };
  variants: ProductVariant[];
  reviews: ProductReview[];
  stock: number;
  type: "IN_STOCK" | "CARGO" | "PROMOTION";
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "APPROVED";
  avgRating?: number | null;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}
