import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { CreateReviewDto } from "./dto/review.dto";
import { UpdateReviewDto } from "./dto/review.dto";

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(private prisma: PrismaService) {}

  // ── User Endpoints ──────────────────────────────────────────────────────

  async createReview(
    userId: string,
    dto: CreateReviewDto,
  ) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    // Check product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Check if user already reviewed this product
    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId: dto.productId, userId } },
    });
    if (existing) {
      throw new BadRequestException("You have already reviewed this product");
    }

    // Verify user purchased and received this product
    const deliveredOrder = await this.prisma.order.findFirst({
      where: {
        buyerId: userId,
        status: { in: ["DELIVERED", "COMPLETED"] },
        items: {
          some: { productId: dto.productId },
        },
      },
    });
    if (!deliveredOrder) {
      throw new ForbiddenException(
        "You can only review products you have purchased and received",
      );
    }

    const review = await this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId,
        rating: dto.rating,
        text: dto.text,
        images: dto.images ?? [],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return { success: true, data: review };
  }

  async getProductReviews(
    productId: string,
    page = 1,
    limit = 20,
    rating?: number,
  ) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      return {
        success: true,
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          avgRating: 0,
          ratingBreakdown: [1, 2, 3, 4, 5].map((r) => ({ rating: r, count: 0 })),
        },
      };
    }

    // Check product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { productId };
    if (rating) where.rating = rating;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    // Get rating stats
    const stats = await this.prisma.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
      _avg: { rating: true },
    });

    const avgRating = stats.length > 0
      ? stats.reduce((sum, s) => sum + (s._avg.rating ?? 0) * s._count.rating, 0) /
        stats.reduce((sum, s) => sum + s._count.rating, 0)
      : 0;

    const ratingBreakdown = [1, 2, 3, 4, 5].map((r) => ({
      rating: r,
      count: stats.find((s) => s.rating === r)?._count.rating ?? 0,
    }));

    return {
      success: true,
      data: reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        avgRating: Math.round(avgRating * 10) / 10,
        ratingBreakdown,
      },
    };
  }

  async getReviewById(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    return { success: true, data: review };
  }

  async updateReview(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("You can only update your own reviews");
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.text !== undefined && { text: dto.text }),
        ...(dto.images !== undefined && { images: dto.images }),
        version: { increment: 1 },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return { success: true, data: updated };
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("You can only delete your own reviews");
    }

    await this.prisma.review.delete({ where: { id: reviewId } });

    return { success: true };
  }

  async getUserReviews(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, slug: true, images: true } },
        },
      }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return {
      success: true,
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
