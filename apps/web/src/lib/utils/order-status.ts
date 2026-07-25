import type { OrderStatus } from "@/types/order";

/**
 * Maps the backend OrderStatus enum to the unified UI OrderStatus.
 * Never use .toUpperCase() directly — UI labels don't always match the backend enum.
 */
export function mapBackendToUiStatus(raw: string): OrderStatus {
  const upper = raw.toUpperCase();
  
  if (["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "PAYMENT_REJECTED"].includes(upper)) return "pending";
  if (upper === "PAYMENT_CONFIRMED") return "confirmed";
  if (upper === "PROCESSING") return "processing";
  if (upper === "PACKING") return "packing";
  if (["IN_CARGO", "OUT_FOR_DELIVERY"].includes(upper)) return "shipped";
  if (["DELIVERED", "COMPLETED"].includes(upper)) return "delivered";
  if (["CANCELLED", "REFUNDED"].includes(upper)) return "cancelled";
  
  return "pending";
}

/**
 * Maps the unified UI OrderStatus back to the real backend OrderStatus enum value.
 */
export const STATUS_MAP_UI_TO_BACKEND: Record<OrderStatus, string> = {
  pending:    "PENDING_PAYMENT",     // not directly sent; here for completeness
  confirmed:  "PAYMENT_CONFIRMED",
  processing: "PROCESSING",
  packing:    "PACKING",
  shipped:    "IN_CARGO",
  delivered:  "DELIVERED",
  cancelled:  "CANCELLED",
};
