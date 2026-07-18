import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "CLIENT" | "SELLER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
  images: string[];
  category: { id: string; name: string };
  seller: { id: string; name: string };
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  totalAmount: number;
  customerName?: string;
  user?: { name: string };
  createdAt: string;
}

export interface AdminSeller {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  _count?: { products: number };
}

export interface AdminNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface PlatformMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingApprovals: number;
}

// ── API calls ──────────────────────────────────────────────────────────────
export const adminApi = {
  // Products
  getAdminProducts: (status?: string) =>
    api.get<AdminProduct[]>(`/products/admin${status ? `?status=${status}` : ""}`),
  approveProduct: (id: string, data: { status: "APPROVED" | "REJECTED"; reason?: string }) =>
    api.put<AdminProduct>(`/products/${id}/approve`, data),

  // Orders
  getAdminOrders: (status?: string) =>
    api.get<AdminOrder[]>(`/orders/admin${status ? `?status=${status}` : ""}`),

  // Sellers
  getPendingSellers: () => api.get<AdminSeller[]>("/sellers/pending"),
  getAllSellers: () => api.get<AdminSeller[]>("/sellers/all"),
  approveSeller: (id: string, data: { status: "APPROVED" | "REJECTED"; reason?: string }) =>
    api.put<{ success: boolean; message: string }>(`/sellers/${id}/approve`, data),

  // Notifications (admin)
  createNotification: (data: { userId: string; type: string; title: string; message: string }) =>
    api.post<{ success: boolean; data: AdminNotification }>("/notifications/admin", data),
  getAdminNotifications: (params?: { userId?: string; read?: boolean; type?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return api.get<AdminNotification[]>(`/notifications/admin${qs}`);
  },
};

// ── React Query hooks ──────────────────────────────────────────────────────

// Products
export function useAdminProducts(status?: string) {
  return useQuery({
    queryKey: ["admin", "products", status],
    queryFn: () => adminApi.getAdminProducts(status),
  });
}

export function useApproveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: "APPROVED" | "REJECTED"; reason?: string } }) =>
      adminApi.approveProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

// Orders
export function useAdminOrders(status?: string) {
  return useQuery({
    queryKey: ["admin", "orders", status],
    queryFn: () => adminApi.getAdminOrders(status),
  });
}

// Sellers
export function usePendingSellers() {
  return useQuery({ queryKey: ["admin", "sellers", "pending"], queryFn: adminApi.getPendingSellers });
}

export function useAllSellers() {
  return useQuery({ queryKey: ["admin", "sellers"], queryFn: adminApi.getAllSellers });
}

export function useApproveSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: "APPROVED" | "REJECTED"; reason?: string } }) =>
      adminApi.approveSeller(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "sellers"] }),
  });
}
