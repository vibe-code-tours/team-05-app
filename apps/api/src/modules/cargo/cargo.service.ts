import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { CreateCargoTrackingDto, UpdateMilestoneDto } from "./dto/cargo.dto";

@Injectable()
export class CargoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Seller creates cargo tracking for an order
   */
  async createTracking(sellerId: string, dto: CreateCargoTrackingDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.sellerId !== sellerId) {
      throw new ForbiddenException("Not your order");
    }

    if (order.status !== "IN_CARGO") {
      throw new BadRequestException(`Order must be in IN_CARGO status. Current: ${order.status}`);
    }

    const existing = await this.prisma.cargoTracking.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existing) {
      throw new BadRequestException("Cargo tracking already exists for this order");
    }

    const tracking = await this.prisma.cargoTracking.create({
      data: {
        orderId: dto.orderId,
        trackingNumber: dto.trackingNumber,
        carrier: dto.carrier,
        origin: dto.origin,
        currentMilestone: "ORDER_PLACED",
        estimatedArrival: dto.estimatedArrival ? new Date(dto.estimatedArrival) : null,
        history: {
          create: {
            milestone: "ORDER_PLACED",
            location: dto.origin,
            notes: "Shipment created",
            recordedBy: sellerId,
          },
        },
      },
      include: { history: true },
    });

    return { success: true, data: tracking };
  }

  /**
   * Update cargo milestone
   */
  async updateMilestone(userId: string, trackingId: string, dto: UpdateMilestoneDto) {
    const tracking = await this.prisma.cargoTracking.findUnique({
      where: { id: trackingId },
      include: { order: true },
    });

    if (!tracking) {
      throw new NotFoundException("Cargo tracking not found");
    }

    if (tracking.order.sellerId !== userId) {
      throw new ForbiddenException("Not authorized");
    }

    // Validate milestone order
    const milestones = [
      "ORDER_PLACED", "PAYMENT_CONFIRMED", "WAITING_PURCHASE", "PURCHASED",
      "PACKED", "BKK_WAREHOUSE", "EXPORT_CLEARANCE", "AIR_CARGO",
      "CUSTOMS", "YGN_WAREHOUSE", "OUT_FOR_DELIVERY", "DELIVERED",
    ];

    const currentIndex = milestones.indexOf(tracking.currentMilestone);
    const newIndex = milestones.indexOf(dto.milestone);

    if (newIndex <= currentIndex) {
      throw new BadRequestException(`Cannot go backwards from ${tracking.currentMilestone} to ${dto.milestone}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedTracking = await tx.cargoTracking.update({
        where: { id: trackingId },
        data: { currentMilestone: dto.milestone as any },
      });

      await tx.cargoHistory.create({
        data: {
          shipmentId: trackingId,
          milestone: dto.milestone as any,
          location: dto.location,
          notes: dto.notes,
          recordedBy: userId,
        },
      });

      // Auto-update order status based on milestone
      if (dto.milestone === "OUT_FOR_DELIVERY") {
        await tx.order.update({
          where: { id: tracking.orderId },
          data: { status: "OUT_FOR_DELIVERY" },
        });
      } else if (dto.milestone === "DELIVERED") {
        await tx.order.update({
          where: { id: tracking.orderId },
          data: { status: "DELIVERED" },
        });
      }

      return updatedTracking;
    });

    // TODO: Send notification to buyer about milestone update

    return { success: true, data: updated };
  }

  /**
   * Get tracking for an order (buyer or seller)
   */
  async getTracking(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException("Not authorized");
    }

    const tracking = await this.prisma.cargoTracking.findUnique({
      where: { orderId },
      include: {
        history: { orderBy: { timestamp: "asc" } },
      },
    });

    return { success: true, data: tracking };
  }

  /**
   * Get tracking by tracking number (public)
   */
  async getByTrackingNumber(trackingNumber: string) {
    const tracking = await this.prisma.cargoTracking.findFirst({
      where: { trackingNumber },
      include: {
        history: { orderBy: { timestamp: "asc" } },
      },
    });

    if (!tracking) {
      throw new NotFoundException("Tracking not found");
    }

    return { success: true, data: tracking };
  }
}
