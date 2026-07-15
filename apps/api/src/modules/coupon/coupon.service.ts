import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { CreateCouponDto } from "./dto/coupon.dto";
import { UpdateCouponDto } from "./dto/coupon.dto";

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(private prisma: PrismaService) {}

  // ── Public: Validate coupon ─────────────────────────────────────────────

  async validateCoupon(code: string, orderTotal: number) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    if (!coupon.active) {
      throw new BadRequestException("Coupon is no longer active");
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException("Coupon has expired");
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException("Coupon usage limit reached");
    }

    if (coupon.minOrder && orderTotal < Number(coupon.minOrder)) {
      throw new BadRequestException(
        `Minimum order amount is ${coupon.minOrder}`,
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (orderTotal * Number(coupon.value)) / 100;
    } else {
      discount = Math.min(Number(coupon.value), orderTotal);
    }

    return {
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          value: Number(coupon.value),
        },
        discount: Math.round(discount * 100) / 100,
        finalTotal: Math.round((orderTotal - discount) * 100) / 100,
      },
    };
  }

  // ── Admin Endpoints ─────────────────────────────────────────────────────

  async adminGetAllCoupons(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.coupon.count(),
    ]);

    return {
      success: true,
      data: coupons.map((c) => ({
        ...c,
        value: Number(c.value),
        minOrder: c.minOrder ? Number(c.minOrder) : null,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminGetCouponById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    return {
      success: true,
      data: {
        ...coupon,
        value: Number(coupon.value),
        minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
      },
    };
  }

  async adminCreateCoupon(dto: CreateCouponDto) {
    // Check if code already exists
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException("Coupon code already exists");
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        discountType: dto.discountType,
        value: dto.value,
        usageLimit: dto.usageLimit,
        minOrder: dto.minOrder,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        active: dto.active ?? true,
      },
    });

    return {
      success: true,
      data: {
        ...coupon,
        value: Number(coupon.value),
        minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
      },
    };
  }

  async adminUpdateCoupon(
    id: string,
    dto: UpdateCouponDto,
  ) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    const updated = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.discountType !== undefined && { discountType: dto.discountType }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.minOrder !== undefined && { minOrder: dto.minOrder }),
        ...(dto.expiresAt !== undefined && {
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });

    return {
      success: true,
      data: {
        ...updated,
        value: Number(updated.value),
        minOrder: updated.minOrder ? Number(updated.minOrder) : null,
      },
    };
  }

  async adminDeleteCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    await this.prisma.coupon.delete({ where: { id } });

    return { success: true };
  }

  async adminIncrementUsage(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    await this.prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });

    return { success: true };
  }
}
