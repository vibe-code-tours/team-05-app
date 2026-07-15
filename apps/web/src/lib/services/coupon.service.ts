import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder?: number;
  usageLimit?: number;
  expiresAt?: string;
  active?: boolean;
}

export type UpdateCouponInput = Partial<CreateCouponInput>;

// ── API calls ──────────────────────────────────────────────────────────────
export const couponApi = {
  validate: (code: string, orderTotal: number) =>
    api.post<{ valid: boolean; discount: number; discountType: string }>("/coupons/validate", { code, orderTotal }),
  getAdminCoupons: () => api.get<Coupon[]>("/coupons/admin"),
  create: (data: CreateCouponInput) => api.post<Coupon>("/coupons/admin", data),
  update: (id: string, data: UpdateCouponInput) => api.put<Coupon>(`/coupons/admin/${id}`, data),
  delete: (id: string) => api.delete<void>(`/coupons/admin/${id}`),
};

// ── React Query hooks ──────────────────────────────────────────────────────
export function useAdminCoupons() {
  return useQuery({ queryKey: ["coupons", "admin"], queryFn: couponApi.getAdminCoupons });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponInput }) => couponApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}
