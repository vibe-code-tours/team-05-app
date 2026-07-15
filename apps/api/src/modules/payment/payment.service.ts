import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "../../config/prisma.service";
import {
  CreatePaymentDto,
  VerifyPaymentDto,
  RequestRefundDto,
  ProcessRefundDto,
} from "./dto/payment.dto";

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Buyer submits payment slip.
   * Validates: order exists, belongs to buyer, correct status, no duplicate confirmed payment.
   */
  async submitPayment(buyerId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.buyerId !== buyerId) {
      throw new ForbiddenException("Not your order");
    }

    if (order.status !== "PENDING_PAYMENT" && order.status !== "PAYMENT_SUBMITTED") {
      throw new BadRequestException(
        `Order cannot accept payment in status: ${order.status}`,
      );
    }

    // Check for existing confirmed payment
    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingPayment && existingPayment.status === "CONFIRMED") {
      throw new BadRequestException("Payment already confirmed");
    }

    // Check for duplicate slip URL
    if (existingPayment && existingPayment.slipUrl === dto.slipUrl) {
      throw new BadRequestException("Duplicate payment slip detected");
    }

    // Create or update payment
    const payment = existingPayment
      ? await this.prisma.payment.update({
          where: { orderId: dto.orderId },
          data: {
            method: dto.method,
            slipUrl: dto.slipUrl,
            transactionId: dto.transactionId,
            status: "PENDING",
          },
        })
      : await this.prisma.payment.create({
          data: {
            orderId: dto.orderId,
            method: dto.method,
            amount: order.total,
            slipUrl: dto.slipUrl,
            transactionId: dto.transactionId,
            status: "PENDING",
          },
        });

    // Update order status
    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { status: "PAYMENT_SUBMITTED" },
    });

    return { success: true, data: payment };
  }

  /**
   * Get payment for an order (buyer, seller, or admin).
   */
  async getPayment(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException("Not authorized");
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    return { success: true, data: payment };
  }

  /**
   * Seller or Admin verifies payment.
   * CONFIRMED → order moves to PAYMENT_CONFIRMED
   * REJECTED → order moves to PAYMENT_REJECTED, stock restored
   */
  async verifyPayment(verifierId: string, orderId: string, dto: VerifyPaymentDto, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Only seller of the order or admin can verify
    const isSeller = order.sellerId === verifierId;
    const isAdmin = role === "ADMIN";

    if (!isSeller && !isAdmin) {
      throw new ForbiddenException("Not authorized to verify this payment");
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status === "CONFIRMED") {
      throw new BadRequestException("Payment already confirmed");
    }

    const newOrderStatus: OrderStatus = dto.status === "CONFIRMED" ? "PAYMENT_CONFIRMED" : "PAYMENT_REJECTED";

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: dto.status,
          verifiedBy: verifierId,
          verifiedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: newOrderStatus },
      });

      // Restore stock if rejected
      if (dto.status === "REJECTED") {
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
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
      }
    });

    return { success: true, message: `Payment ${dto.status.toLowerCase()}` };
  }

  /**
   * Seller: Get all pending payments for their orders.
   */
  async getPendingPayments(sellerId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: "PENDING",
        order: { sellerId },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            buyer: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: payments };
  }

  /**
   * Buyer requests a refund (within 7 days of delivery).
   */
  async requestRefund(buyerId: string, orderId: string, dto: RequestRefundDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.buyerId !== buyerId) {
      throw new ForbiddenException("Not your order");
    }

    // Only COMPLETED or DELIVERED orders can be refunded
    if (!["COMPLETED", "DELIVERED"].includes(order.status)) {
      throw new BadRequestException(
        `Cannot request refund for order in ${order.status} status`,
      );
    }

    // Check 7-day refund window
    if (order.status === "COMPLETED" || order.status === "DELIVERED") {
      const deliveredAt = order.updatedAt;
      const daysSinceDelivery = Math.floor(
        (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceDelivery > 7) {
        throw new BadRequestException(
          "Refund window has expired (7 days after delivery)",
        );
      }
    }

    // Check if payment exists and is confirmed
    if (!order.payment || order.payment.status !== "CONFIRMED") {
      throw new BadRequestException("No confirmed payment to refund");
    }

    // Check if refund already requested
    if (order.status === "REFUNDED") {
      throw new BadRequestException("Refund already processed");
    }

    // Update order status to REFUNDED
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REFUNDED",
        notes: `${order.notes ? order.notes + "\n" : ""}Refund requested: ${dto.reason}`,
      },
      include: { payment: true },
    });

    // TODO: Send notification to seller about refund request

    return { success: true, data: updated };
  }

  /**
   * Seller/Admin processes a refund request (approve or reject).
   */
  async processRefund(verifierId: string, orderId: string, dto: ProcessRefundDto, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const isSeller = order.sellerId === verifierId;
    const isAdmin = role === "ADMIN";

    if (!isSeller && !isAdmin) {
      throw new ForbiddenException("Not authorized to process this refund");
    }

    if (order.status !== "REFUNDED") {
      throw new BadRequestException("Order is not awaiting refund processing");
    }

    await this.prisma.$transaction(async (tx) => {
      if (dto.status === "APPROVED") {
        // Restore stock on approved refund
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
      } else {
        // Rejected — revert to COMPLETED
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "COMPLETED",
            notes: `${order.notes ? order.notes + "\n" : ""}Refund rejected: ${dto.notes || "No reason provided"}`,
          },
        });
      }
    });

    // TODO: Send notification to buyer about refund decision

    return {
      success: true,
      message: `Refund ${dto.status.toLowerCase()}`,
    };
  }
}
