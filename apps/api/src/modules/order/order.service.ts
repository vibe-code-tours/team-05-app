import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/order.dto";

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create order from cart (checkout)
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

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems: Array<{
      productId: string;
      variantId?: string;
      name: string;
      price: number;
      quantity: number;
    }> = [];

    for (const item of cart.items) {
      if (item.product.status !== "APPROVED") {
        throw new BadRequestException(`Product "${item.product.name}" is no longer available`);
      }
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for "${item.product.name}"`);
      }

      const price = Number(item.variant?.price || item.product.price);
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        price,
        quantity: item.quantity,
      });
    }

    const shippingFee = 5.00; // Fixed shipping
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + shippingFee + tax;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          sellerId: cart.items[0].product.sellerId, // Assume single seller per order
          subtotal,
          shippingFee,
          tax,
          total,
          notes: dto.notes,
          addressId: dto.addressId,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          shippingAddress: true,
          seller: { select: { id: true, name: true } },
        },
      });

      // Deduct stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return { success: true, data: order };
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

    // Only buyer or seller can view
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException("Not authorized to view this order");
    }

    return { success: true, data: order };
  }

  /**
   * Seller updates order status
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

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING_PAYMENT: ["PAYMENT_CONFIRMED", "PAYMENT_REJECTED", "CANCELLED"],
      PAYMENT_SUBMITTED: ["PAYMENT_CONFIRMED", "PAYMENT_REJECTED"],
      PAYMENT_CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["PACKING", "CANCELLED"],
      PACKING: ["IN_CARGO"],
      IN_CARGO: ["OUT_FOR_DELIVERY"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
      DELIVERED: ["COMPLETED"],
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status as any },
      include: { items: true },
    });

    // TODO: Send notification to buyer about status change

    return { success: true, data: updated };
  }

  /**
   * Admin: Get all orders
   */
  async getAllOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

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
