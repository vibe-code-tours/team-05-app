// ─── Enums ─────────────────────────────────────────────
export enum Role {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CLIENT = "CLIENT",
}

export enum ProductType {
  IN_STOCK = "IN_STOCK",
  CARGO = "CARGO",
  PROMOTION = "PROMOTION",
  PREORDER = "PREORDER",
  LOCAL = "LOCAL",
  USED = "USED",
}

export enum ProductStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
}

export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAYMENT_SUBMITTED = "PAYMENT_SUBMITTED",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  PAYMENT_REJECTED = "PAYMENT_REJECTED",
  PROCESSING = "PROCESSING",
  PACKING = "PACKING",
  IN_CARGO = "IN_CARGO",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum CargoMilestone {
  ORDER_PLACED = "ORDER_PLACED",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  WAITING_PURCHASE = "WAITING_PURCHASE",
  PURCHASED = "PURCHASED",
  PACKED = "PACKED",
  BKK_WAREHOUSE = "BKK_WAREHOUSE",
  EXPORT_CLEARANCE = "EXPORT_CLEARANCE",
  AIR_CARGO = "AIR_CARGO",
  CUSTOMS = "CUSTOMS",
  YGN_WAREHOUSE = "YGN_WAREHOUSE",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
}

export enum PaymentMethod {
  KBZ_PAY = "KBZ_PAY",
  AYA_PAY = "AYA_PAY",
  WAVE = "WAVE",
  CB_PAY = "CB_PAY",
  CASH = "CASH",
  PROMPT_PAY = "PROMPT_PAY",
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  STRIPE = "STRIPE",
}

// ─── API Types ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    cursor?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  cursor?: string;
}

// ─── Product Types ─────────────────────────────────────

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  type: ProductType;
  status: ProductStatus;
  thumbnail?: string;
  seller: { id: string; name: string };
  avgRating?: number;
  reviewCount: number;
}

// ─── Order Types ───────────────────────────────────────

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
}
