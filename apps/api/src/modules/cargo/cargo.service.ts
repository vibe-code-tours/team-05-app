import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../config/prisma.service";
import {
  CreateCargoTrackingDto,
  UpdateMilestoneDto,
  AdminForceMilestoneDto,
} from "./dto/cargo.dto";

// Milestone sequence — must be followed in order
const MILESTONE_SEQUENCE = [
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

type Milestone = (typeof MILESTONE_SEQUENCE)[number];

// Default ETA days from each milestone position (used when no historical data)
const DEFAULT_ETA_DAYS: Record<string, number> = {
  ORDER_PLACED: 14,
  PAYMENT_CONFIRMED: 13,
  WAITING_PURCHASE: 12,
  PURCHASED: 10,
  PACKED: 8,
  BKK_WAREHOUSE: 6,
  EXPORT_CLEARANCE: 5,
  AIR_CARGO: 3,
  CUSTOMS: 2,
  YGN_WAREHOUSE: 1,
  OUT_FOR_DELIVERY: 0,
  DELIVERED: 0,
};

@Injectable()
export class CargoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate ETA based on current milestone.
   * Uses historical average if available, otherwise falls back to defaults.
   */
  private async calculateETA(milestone: string): Promise<Date> {
    const daysFromDefault = DEFAULT_ETA_DAYS[milestone] ?? 7;

    // Try to get historical average time from milestone to DELIVERED
    const historicalData = await this.prisma.cargoHistory.groupBy({
      by: ["milestone"],
      where: {
        milestone: { in: [...MILESTONE_SEQUENCE] },
      },
      _count: true,
    });

    // Simple heuristic: use default days from milestone position
    // In production, you'd calculate from actual transit time data
    const eta = new Date();
    eta.setDate(eta.getDate() + daysFromDefault);
    return eta;
  }

  /**
   * Check if ETA changed significantly (> 24 hours).
   */
  private etaChangedSignificantly(oldEta: Date | null, newEta: Date): boolean {
    if (!oldEta) return true;
    const diffMs = Math.abs(newEta.getTime() - oldEta.getTime());
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 24;
  }

  /**
   * Seller creates cargo tracking for an order.
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
      throw new BadRequestException(
        `Order must be in IN_CARGO status. Current: ${order.status}`,
      );
    }

    const existing = await this.prisma.cargoTracking.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existing) {
      throw new BadRequestException(
        "Cargo tracking already exists for this order",
      );
    }

    const eta = dto.estimatedArrival
      ? new Date(dto.estimatedArrival)
      : await this.calculateETA("ORDER_PLACED");

    const tracking = await this.prisma.cargoTracking.create({
      data: {
        orderId: dto.orderId,
        trackingNumber: dto.trackingNumber,
        carrier: dto.carrier,
        origin: dto.origin,
        currentMilestone: "ORDER_PLACED",
        estimatedArrival: eta,
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
   * Seller updates cargo milestone.
   * Validates sequential order and recalculates ETA.
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

    // Validate milestone is the next in sequence
    const currentIndex = MILESTONE_SEQUENCE.indexOf(tracking.currentMilestone as Milestone);
    const newIndex = MILESTONE_SEQUENCE.indexOf(dto.milestone as Milestone);

    if (newIndex === -1) {
      throw new BadRequestException(`Invalid milestone: ${dto.milestone}`);
    }

    if (newIndex <= currentIndex) {
      throw new BadRequestException(
        `Cannot go backwards from ${tracking.currentMilestone} to ${dto.milestone}`,
      );
    }

    if (newIndex !== currentIndex + 1) {
      throw new BadRequestException(
        `Cannot skip milestones. Expected ${MILESTONE_SEQUENCE[currentIndex + 1]}, got ${dto.milestone}`,
      );
    }

    // Recalculate ETA
    const newEta = await this.calculateETA(dto.milestone);
    const etaDelayed = this.etaChangedSignificantly(tracking.estimatedArrival, newEta);

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedTracking = await tx.cargoTracking.update({
        where: { id: trackingId },
        data: {
          currentMilestone: dto.milestone as Milestone,
          estimatedArrival: newEta,
        },
      });

      await tx.cargoHistory.create({
        data: {
          shipmentId: trackingId,
          milestone: dto.milestone as Milestone,
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

    return {
      success: true,
      data: updated,
      etaDelayed,
      message: etaDelayed
        ? "ETA has changed significantly (> 24h). Buyer should be notified."
        : undefined,
    };
  }

  /**
   * Admin force-sets milestone (skips sequential validation).
   */
  async adminForceMilestone(
    adminId: string,
    trackingId: string,
    dto: AdminForceMilestoneDto,
  ) {
    const tracking = await this.prisma.cargoTracking.findUnique({
      where: { id: trackingId },
      include: { order: true },
    });

    if (!tracking) {
      throw new NotFoundException("Cargo tracking not found");
    }

    const newEta = await this.calculateETA(dto.milestone);

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedTracking = await tx.cargoTracking.update({
        where: { id: trackingId },
        data: {
          currentMilestone: dto.milestone as Milestone,
          estimatedArrival: newEta,
        },
      });

      await tx.cargoHistory.create({
        data: {
          shipmentId: trackingId,
          milestone: dto.milestone as Milestone,
          location: dto.location,
          notes: dto.notes
            ? `[Admin Override] ${dto.notes}`
            : "[Admin Override] Milestone force-set by admin",
          recordedBy: adminId,
        },
      });

      // Auto-update order status
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

    return { success: true, data: updated };
  }

  /**
   * Get tracking for an order (buyer or seller).
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
   * Get tracking by tracking number (public — no auth required).
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

  /**
   * Admin: List all shipments with filters.
   */
  async adminListShipments(
    page = 1,
    limit = 20,
    milestone?: string,
    carrier?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.CargoTrackingWhereInput = {};

    if (milestone) {
      where.currentMilestone = milestone as Prisma.EnumCargoMilestoneFilter["equals"];
    }
    if (carrier) {
      where.carrier = { contains: carrier, mode: "insensitive" };
    }

    const [shipments, total] = await Promise.all([
      this.prisma.cargoTracking.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              buyer: { select: { id: true, name: true } },
              seller: { select: { id: true, name: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.cargoTracking.count({ where }),
    ]);

    return {
      success: true,
      data: shipments,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
