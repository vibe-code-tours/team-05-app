import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────
export const CARGO_MILESTONES = [
  "ORDER_PLACED",
  "PAYMENT_CONFIRMED",
  "WAITING_PURCHASE",
  "PURCHASED",
  "PACKED",
  "BKK_WAREHOUSE",
  "EXPORT_CLEARANCE",
  "AIR_CARGO",
  "CUSTOMS",
  "YGN_WAREHOUSE",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export type CargoMilestone = (typeof CARGO_MILESTONES)[number];

export interface CargoShipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  milestone: CargoMilestone;
  status: "PREPARING" | "IN_TRANSIT" | "CUSTOMS" | "DELIVERED";
  origin: string;
  destination: string;
  estimatedArrival: string;
  milestones: {
    milestone: CargoMilestone;
    timestamp: string;
    notes?: string;
  }[];
  createdAt: string;
}

// ── API calls ──────────────────────────────────────────────────────────────
export const cargoApi = {
  getSellerShipments: () => api.get<CargoShipment[]>("/cargo"),
  getByOrder: (orderId: string) => api.get<CargoShipment>(`/cargo/order/${orderId}`),
  getByTracking: (trackingNumber: string) => api.get<CargoShipment>(`/cargo/track/${trackingNumber}`),
  createTracking: (data: { orderId: string; carrier: string; trackingNumber: string }) =>
    api.post<CargoShipment>("/cargo", data),
  updateMilestone: (id: string, milestone: CargoMilestone, notes?: string) =>
    api.put<CargoShipment>(`/cargo/${id}/milestone`, { milestone, notes }),
};

// ── React Query hooks ──────────────────────────────────────────────────────
export function useSellerShipments() {
  return useQuery({ queryKey: ["cargo", "seller"], queryFn: cargoApi.getSellerShipments });
}

export function useCargoByOrder(orderId: string) {
  return useQuery({
    queryKey: ["cargo", "order", orderId],
    queryFn: () => cargoApi.getByOrder(orderId),
    enabled: !!orderId,
  });
}

export function useCreateTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cargoApi.createTracking,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cargo"] }),
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, milestone, notes }: { id: string; milestone: CargoMilestone; notes?: string }) =>
      cargoApi.updateMilestone(id, milestone, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cargo"] }),
  });
}
