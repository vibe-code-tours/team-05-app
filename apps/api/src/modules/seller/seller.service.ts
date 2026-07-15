import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { RegisterSellerDto, ApproveSellerDto } from "./dto/seller.dto";

@Injectable()
export class SellerService {
  private readonly logger = new Logger(SellerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * CLIENT applies to become a SELLER
   */
  async registerAsSeller(userId: string, dto: RegisterSellerDto) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role === "SELLER") {
      throw new BadRequestException("Already a seller");
    }

    if (user.role === "ADMIN") {
      throw new BadRequestException("Admins cannot register as sellers");
    }

    // Store seller application in a JSON field or separate table
    // For now, we'll use the user's metadata and change role to SELLER
    // In production, you'd have a SellerProfile table

    // Check if there's a pending application
    // For simplicity, we'll just upgrade the user to SELLER with PENDING status
    // A real app would have a separate SellerApplication table

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: "SELLER",
        status: "PENDING_VERIFICATION", // Reuse for seller approval
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return {
      success: true,
      message: "Seller application submitted. Waiting for admin approval.",
      data: updated,
    };
  }

  /**
   * ADMIN: List all pending seller applications
   */
  async getPendingSellers() {
    const sellers = await this.prisma.user.findMany({
      where: {
        role: "SELLER",
        status: "PENDING_VERIFICATION",
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: sellers };
  }

  /**
   * ADMIN: List all sellers
   */
  async getAllSellers() {
    const sellers = await this.prisma.user.findMany({
      where: { role: "SELLER" },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        status: true,
        createdAt: true,
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: sellers };
  }

  /**
   * ADMIN: Approve or reject a seller application
   */
  async approveOrReject(userId: string, dto: ApproveSellerDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role !== "SELLER") {
      throw new BadRequestException("User is not a seller applicant");
    }

    if (user.status !== "PENDING_VERIFICATION") {
      throw new BadRequestException("Seller application is not pending");
    }

    const newStatus = dto.status === "APPROVED" ? "ACTIVE" : "SUSPENDED";

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: newStatus as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    // TODO: Send notification to seller about approval/rejection

    return {
      success: true,
      message: `Seller ${dto.status.toLowerCase()} successfully`,
      data: updated,
    };
  }

  /**
   * Get seller public profile
   */
  async getSellerProfile(sellerId: string) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const seller = await this.prisma.user.findFirst({
      where: { id: sellerId, role: "SELLER", status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
        products: {
          where: { status: "APPROVED" },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: { take: 1, orderBy: { order: "asc" } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { products: true, reviews: true } },
      },
    });

    if (!seller) {
      throw new NotFoundException("Seller not found");
    }

    return { success: true, data: seller };
  }
}
