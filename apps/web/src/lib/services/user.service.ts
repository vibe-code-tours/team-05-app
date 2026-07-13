import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiResponse } from "@/lib/api";

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "ADMIN" | "SELLER" | "CLIENT";
  avatar?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface CreateAddressInput {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

// API calls
export const userApi = {
  getProfile: () => api.get<UserProfile>("/users/me"),

  updateProfile: (data: UpdateProfileInput) =>
    api.put<UserProfile>("/users/me", data),

  getAddresses: () => api.get<Address[]>("/users/me/addresses"),

  getAddressById: (id: string) =>
    api.get<Address>(`/users/me/addresses/${id}`),

  createAddress: (data: CreateAddressInput) =>
    api.post<Address>("/users/me/addresses", data),

  updateAddress: (id: string, data: CreateAddressInput) =>
    api.put<Address>(`/users/me/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    api.delete(`/users/me/addresses/${id}`),

  setDefaultAddress: (id: string) =>
    api.put(`/users/me/addresses/${id}/default`),
};

// React Query hooks
export function useProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: userApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ["user", "addresses"],
    queryFn: userApi.getAddresses,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAddressInput }) =>
      userApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    },
  });
}
