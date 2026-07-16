import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Types
export interface ProductImage {
  url: string;
  alt?: string;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
  };
  stock: number;
  type: "IN_STOCK" | "CARGO" | "PROMOTION";
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  avgRating?: number | null;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
}

// Catalog types
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  _count?: { products: number };
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  _count?: { products: number };
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  order: number;
}

// API calls
export const productApi = {
  getProducts: (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return api.get<Product[]>(`/products${query ? `?${query}` : ""}`);
  },

  getProductBySlug: (slug: string) =>
    api.get<Product>(`/products/${slug}`),

  getMyProducts: () =>
    api.get<Product[]>("/products/my"),

  getAdminProducts: () =>
    api.get<Product[]>("/products/admin"),
};

// React Query hooks - Products
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productApi.getProducts(filters),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productApi.getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useMyProducts() {
  return useQuery({
    queryKey: ["products", "my"],
    queryFn: productApi.getMyProducts,
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ["products", "admin"],
    queryFn: productApi.getAdminProducts,
  });
}

// React Query hooks - Catalog
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<Category[]>("/catalog/categories"),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => api.get<Brand[]>("/catalog/brands"),
  });
}

// React Query hooks - Banners
export function useActiveBanners() {
  return useQuery({
    queryKey: ["banners", "active"],
    queryFn: () => api.get<Banner[]>("/banners/active"),
  });
}
