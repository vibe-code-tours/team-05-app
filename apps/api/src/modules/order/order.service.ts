import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "../../config/prisma.service";
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto } from "./dto/order.dto";

// Valid status transitions per role
const BUYER_CANCEL_STATUSES = [
  "PENDING_PAYMENT",
  "PAYMENT_SUBMITTED",
];

const SELLER_TRANSITIONS: Record<string, string[]> = {
  PAYMENT_CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKING", "CANCELLED"],
  PACKING: ["IN_CARGO"],
};

const ADMIN_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["CANCELLED"],
  PAYMENT_SUBMITTED: ["PAYMENT_CONFIRMED", "PAYMENT_REJECTED", "CANCELLED"],
  PAYMENT_CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKING", "CANCELLED"],
  PACKING: ["IN_CARGO"],
  IN_CARGO: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["COMPLETED", "CANCELLED"],
};

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate order number: ORD-YYYY-NNNNNN
   * Uses a database counter for sequential numbering within the year.
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;

    // Find the latest order number for this year
    const latest = await this.prisma.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });

    let seq = 1;
    if (latest) {
      const lastSeq = parseInt(latest.orderNumber.split("-")[2], 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(6, "0")}`;
  }

  /**
   * Create order(s) from cart — splits by seller for multi-vendor support.
   */
  async createOrder(buyerId: string, dto: CreateOrderDto) {
    // Get cart with items
    const cart = await this.prisma.cart.findUnique({
      where: { userId: buyerId },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    // Validate address
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId: buyerId },
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    // Validate stock and group items by seller
    const sellerGroups = new Map<
      string,
      Array<{
        productId: string;
        variantId?: string;
        name: string;
        price: number;
        quantity: number;
        sellerId: string;
      }>
    >();

    for (const item of cart.items) {
      if (item.product.status !== "APPROVED") {
        throw new BadRequestException(
          `Product "${item.product.name}" is no longer available`,
        );
      }

      // Check stock (use variant stock if applicable)
      let availableStock = item.product.stock;
      if (item.variantId && item.variant) {
        availableStock = item.variant.stock;
      }

      if (availableStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${item.product.name}". Available: ${availableStock}`,
        );
      }

      const price = Number(item.variant?.price || item.product.price);

      const orderItem = {
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        price,
        quantity: item.quantity,
        sellerId: item.product.sellerId,
      };

      const group = sellerGroups.get(item.product.sellerId) || [];
      group.push(orderItem);
      sellerGroups.set(item.product.sellerId, group);
    }

    // Create one order per seller in a transaction
    const orders = await this.prisma.$transaction(async (tx) => {
      const createdOrders = [];

      for (const [sellerId, items] of sellerGroups) {
        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shippingFee = 5000; // Fixed 5,000 MMK shipping per seller
        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + shippingFee + tax;

        const orderNumber = await this.generateOrderNumber();

        const order = await tx.order.create({
          data: {
            orderNumber,
            buyerId,
            sellerId,
            subtotal,
            shippingFee,
            tax,
            total,
            notes: dto.notes,
            addressId: dto.addressId,
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                variantId: i.variantId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
              })),
            },
          },
          include: {
            items: true,
            shippingAddress: true,
            seller: { select: { id: true, name: true } },
          },
        });

        // Deduct stock per item
        for (const item of items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        createdOrders.push(order);
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrders;
    });

    return {
      success: true,
      data: orders,
      message: `${orders.length} order(s) created`,
    };
  }

  /**
   * Get buyer's orders
   */
  async getMyOrders(buyerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { buyerId },
        include: {
          items: { take: 3 },
          seller: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where: { buyerId } }),
    ]);

    return {
      success: true,
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get seller's orders
   */
  async getSellerOrders(sellerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { sellerId },
        include: {
          items: { take: 3 },
          buyer: { select: { id: true, name: true, email: true } },
          shippingAddress: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where: { sellerId } }),
    ]);

    return {
      success: true,
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get order detail
   */
  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { slug: true } } } },
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true } },
        shippingAddress: true,
        payment: true,
        cargoTracking: true,
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Only buyer, seller, or admin can view
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException("Not authorized to view this order");
    }

    return { success: true, data: order };
  }

  /**
   * Update order status with optimistic locking.
   * Seller can advance through the fulfillment pipeline.
   */
  async updateStatus(sellerId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.sellerId !== sellerId) {
      throw new ForbiddenException("Not your order");
    }

    // Optimistic locking check
    if (order.version !== dto.version) {
      throw new ConflictException(
        `Order was modified by another request. Expected version ${dto.version}, found ${order.version}. Please retry.`,
      );
    }

    // Validate status transition
    const allowed = SELLER_TRANSITIONS[order.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId, version: dto.version },
      data: {
        status: dto.status,
        version: { increment: 1 },
      },
      include: { items: true },
    });

    return { success: true, data: updated };
  }

  /**
   * Buyer or Admin cancels an order with stock restoration.
   */
  async cancelOrder(userId: string, orderId: string, dto: CancelOrderDto, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Authorization check
    const isBuyer = order.buyerId === userId;
    const isAdmin = role === "ADMIN";

    if (!isBuyer && !isAdmin) {
      throw new ForbiddenException("Not authorized to cancel this order");
    }

    // Validate cancellation is allowed
    if (!BUYER_CANCEL_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order in ${order.status} status. Only orders in ${BUYER_CANCEL_STATUSES.join(" or ")} can be cancelled.`,
      );
    }

    // Restore stock and cancel in transaction
    const cancelled = await this.prisma.$transaction(async (tx) => {
      // Restore stock for each item
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Update order status
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          version: { increment: 1 },
          notes: dto.reason
            ? `${order.notes ? order.notes + "\n" : ""}Cancellation reason: ${dto.reason}`
            : order.notes,
        },
        include: { items: true },
      });
    });

    return { success: true, data: cancelled };
  }

  /**
   * Admin: Get all orders with optional status filter
   */
  async getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: { take: 3 },
          buyer: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
