import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { CreatePaymentDto, VerifyPaymentDto } from "./dto/payment.dto";

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Buyer submits payment slip
   */
  async submitPayment(buyerId: string, dto: CreatePaymentDto) {
    // Verify order exists and belongs to buyer
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
      throw new BadRequestException(`Order cannot accept payment in status: ${order.status}`);
    }

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingPayment && existingPayment.status === "CONFIRMED") {
      throw new BadRequestException("Payment already confirmed");
    }

    // Create or update payment
    const payment = existingPayment
      ? await this.prisma.payment.update({
          where: { orderId: dto.orderId },
          data: {
            method: dto.method as any,
            slipUrl: dto.slipUrl,
            transactionId: dto.transactionId,
            status: "PENDING",
          },
        })
      : await this.prisma.payment.create({
          data: {
            orderId: dto.orderId,
            method: dto.method as any,
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
   * Get payment for an order
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
   * Seller/Admin verifies payment
   */
  async verifyPayment(verifierId: string, orderId: string, dto: VerifyPaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.sellerId !== verifierId) {
      throw new ForbiddenException("Not your order");
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

    const newOrderStatus = dto.status === "CONFIRMED" ? "PAYMENT_CONFIRMED" : "PAYMENT_REJECTED";

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
        data: { status: newOrderStatus as any },
      });

      // Restore stock if rejected
      if (dto.status === "REJECTED") {
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    // TODO: Send notification to buyer

    return { success: true, message: `Payment ${dto.status.toLowerCase()}` };
  }

  /**
   * Seller: Get all pending payments
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
}
