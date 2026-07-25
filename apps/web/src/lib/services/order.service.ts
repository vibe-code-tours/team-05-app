import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Types — mirror the actual Prisma schema
export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  /** Name snapshotted at order creation time */
  name: string;
  /** Price snapshotted at order creation time */
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  /** Matches backend OrderStatus enum */
  status:
    | "PENDING_PAYMENT"
    | "PAYMENT_SUBMITTED"
    | "PAYMENT_CONFIRMED"
    | "PAYMENT_REJECTED"
    | "PROCESSING"
    | "PACKING"
    | "IN_CARGO"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  notes?: string | null;
  /** Shipping address — field names match Prisma Address model */
  shippingAddress: {
    id: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    district: string;
    state?: string | null;
    postalCode?: string | null;
  };
  seller?: { id: string; name: string };
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
