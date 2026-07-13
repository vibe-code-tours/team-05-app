import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiResponse } from "@/lib/api";

// Types
export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  shippingAddressId: string;
  note?: string;
}

// API calls
export const orderApi = {
  createOrder: (data: CreateOrderInput) =>
    api.post<Order>("/orders", data),

  getMyOrders: () =>
    api.get<Order[]>("/orders/my"),

  getOrderById: (id: string) =>
    api.get<Order>(`/orders/${id}`),

  cancelOrder: (id: string) =>
    api.patch<Order>(`/orders/${id}/cancel`),

  getSellerOrders: () =>
    api.get<Order[]>("/orders/seller"),

  updateOrderStatus: (id: string, status: string) =>
    api.put<Order>(`/orders/${id}/status`, { status }),

  getAdminOrders: () =>
    api.get<Order[]>("/orders/admin"),
};

// React Query hooks
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders", "my"],
    queryFn: orderApi.getMyOrders,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSellerOrders() {
  return useQuery({
    queryKey: ["orders", "seller"],
    queryFn: orderApi.getSellerOrders,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
