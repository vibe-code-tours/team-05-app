import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────
export interface SellerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  shopName: string;
  shopDescription: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rating: number;
  totalSales: number;
  joinedAt: string;
}

export interface SellerProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
  images: string[];
  category: { id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  status: string;
  items: {
    id: string;
    product: { id: string; name: string; slug: string; price: number; images: string[] };
    quantity: number;
    totalPrice: number;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: { name: string; phone: string; address: string; city: string; state: string; zipCode: string };
  createdAt: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  type: string;
  images?: string[];
  variants?: { type: string; value: string; price?: number; stock?: number }[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

// ── API calls ──────────────────────────────────────────────────────────────
export const sellerApi = {
  // Products
  getMyProducts: () => api.get<SellerProduct[]>("/products/my"),
  createProduct: (data: CreateProductInput) => api.post<SellerProduct>("/products", data),
  updateProduct: (id: string, data: UpdateProductInput) => api.put<SellerProduct>(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete<void>(`/products/${id}`),

  // Orders
  getSellerOrders: () => api.get<SellerOrder[]>("/orders/seller"),
  updateOrderStatus: (id: string, status: string, version?: number) =>
    api.put<SellerOrder>(`/orders/${id}/status`, { status, version }),
};

// ── React Query hooks ──────────────────────────────────────────────────────

// Products
export function useMyProducts() {
  return useQuery({ queryKey: ["seller", "products"], queryFn: sellerApi.getMyProducts });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sellerApi.createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) => sellerApi.updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sellerApi.deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "products"] }),
  });
}

// Orders
export function useSellerOrders() {
  return useQuery({ queryKey: ["seller", "orders"], queryFn: sellerApi.getSellerOrders });
}

export function useUpdateSellerOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, version }: { id: string; status: string; version?: number }) =>
      sellerApi.updateOrderStatus(id, status, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "orders"] }),
  });
}
