import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Cart, AddToCartInput, UpdateCartItemInput } from "@/types/cart";

// API calls
export const cartApi = {
  getCart: () => api.get<Cart>("/cart"),

  addToCart: (data: AddToCartInput) =>
    api.post<Cart>("/cart/items", data),

  updateCartItem: (data: UpdateCartItemInput) =>
    api.put<Cart>(`/cart/items/${data.itemId}`, { quantity: data.quantity }),

  removeCartItem: (itemId: string) =>
    api.delete<Cart>(`/cart/items/${itemId}`),

  clearCart: () =>
    api.delete<Cart>("/cart"),
};

// React Query hooks
export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getCart,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.updateCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
