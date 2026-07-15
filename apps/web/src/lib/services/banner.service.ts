import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  position: "hero" | "promo" | "sidebar";
  startDate: string;
  endDate: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface CreateBannerInput {
  title: string;
  image: string;
  link?: string;
  position: "hero" | "promo" | "sidebar";
  startDate: string;
  endDate: string;
  active?: boolean;
  order?: number;
}

export type UpdateBannerInput = Partial<CreateBannerInput>;

// ── API calls ──────────────────────────────────────────────────────────────
export const bannerApi = {
  getActive: () => api.get<Banner[]>("/banners/active"),
  getAdminBanners: () => api.get<Banner[]>("/banners/admin"),
  create: (data: CreateBannerInput) => api.post<Banner>("/banners/admin", data),
  update: (id: string, data: UpdateBannerInput) => api.put<Banner>(`/banners/admin/${id}`, data),
  delete: (id: string) => api.delete<void>(`/banners/admin/${id}`),
};

// ── React Query hooks ──────────────────────────────────────────────────────
export function useActiveBanners() {
  return useQuery({ queryKey: ["banners", "active"], queryFn: bannerApi.getActive });
}

export function useAdminBanners() {
  return useQuery({ queryKey: ["banners", "admin"], queryFn: bannerApi.getAdminBanners });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bannerApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerInput }) => bannerApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bannerApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}
