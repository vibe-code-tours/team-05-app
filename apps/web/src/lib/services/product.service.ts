import { useQuery } from "@tanstack/react-query";
import { api, ApiResponse } from "@/lib/api";

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
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
  rating?: number;
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

// React Query hooks
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
