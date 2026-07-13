import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { PrismaService } from "../../config/prisma.service";

describe("ReviewService", () => {
  let service: ReviewService;
  let prisma: Record<string, any>;

  const mockUserId = "user-123";
  const mockProductId = "product-123";
  const mockReviewId = "review-123";

  const mockUser = {
    id: mockUserId,
    name: "Test User",
    email: "test@example.com",
  };

  const mockProduct = {
    id: mockProductId,
    name: "Test Product",
    slug: "test-product",
  };

  const mockReview = {
    id: mockReviewId,
    productId: mockProductId,
    userId: mockUserId,
    rating: 5,
    text: "Great product!",
    images: ["https://example.com/image1.jpg"],
    version: 0,
    createdAt: new Date("2026-07-12T10:00:00.000Z"),
    updatedAt: new Date("2026-07-12T10:00:00.000Z"),
    user: mockUser,
  };

  beforeEach(async () => {
    prisma = {
      review: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ── createReview ────────────────────────────────────────────────────────

  describe("createReview", () => {
    it("should create a review", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(mockReview);

      const result = await service.createReview(mockUserId, {
        productId: mockProductId,
        rating: 5,
        text: "Great product!",
        images: ["https://example.com/image1.jpg"],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReview);
    });

    it("should throw if product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.createReview(mockUserId, {
          productId: "nonexistent",
          rating: 5,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if user already reviewed this product", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findUnique.mockResolvedValue(mockReview);

      await expect(
        service.createReview(mockUserId, {
          productId: mockProductId,
          rating: 4,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should create review without images", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(mockReview);

      await service.createReview(mockUserId, {
        productId: mockProductId,
        rating: 5,
        text: "Great!",
      });

      expect(prisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ images: [] }),
        }),
      );
    });
  });

  // ── getProductReviews ───────────────────────────────────────────────────

  describe("getProductReviews", () => {
    it("should return paginated reviews", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findMany.mockResolvedValue([mockReview]);
      prisma.review.count.mockResolvedValue(1);
      prisma.review.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 1 }, _avg: { rating: 5 } },
      ]);

      const result = await service.getProductReviews(mockProductId, 1, 20);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.avgRating).toBe(5);
    });

    it("should throw if product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.getProductReviews("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should filter by rating", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findMany.mockResolvedValue([]);
      prisma.review.count.mockResolvedValue(0);
      prisma.review.groupBy.mockResolvedValue([]);

      await service.getProductReviews(mockProductId, 1, 20, 5);

      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ rating: 5 }),
        }),
      );
    });

    it("should return empty array when no reviews", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findMany.mockResolvedValue([]);
      prisma.review.count.mockResolvedValue(0);
      prisma.review.groupBy.mockResolvedValue([]);

      const result = await service.getProductReviews(mockProductId);

      expect(result.data).toHaveLength(0);
    });
  });

  // ── getReviewById ───────────────────────────────────────────────────────

  describe("getReviewById", () => {
    it("should return a review", async () => {
      prisma.review.findUnique.mockResolvedValue({
        ...mockReview,
        product: mockProduct,
      });

      const result = await service.getReviewById(mockReviewId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should throw if review not found", async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.getReviewById("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateReview ────────────────────────────────────────────────────────

  describe("updateReview", () => {
    it("should update a review", async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);
      prisma.review.update.mockResolvedValue({
        ...mockReview,
        rating: 4,
        version: 1,
      });

      const result = await service.updateReview(mockUserId, mockReviewId, {
        rating: 4,
      });

      expect(result.success).toBe(true);
      expect(result.data.rating).toBe(4);
    });

    it("should throw if review not found", async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.updateReview(mockUserId, "nonexistent", { rating: 4 }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if not owner", async () => {
      prisma.review.findUnique.mockResolvedValue({
        ...mockReview,
        userId: "other-user",
      });

      await expect(
        service.updateReview(mockUserId, mockReviewId, { rating: 4 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should increment version on update", async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);
      prisma.review.update.mockResolvedValue(mockReview);

      await service.updateReview(mockUserId, mockReviewId, { text: "Updated" });

      expect(prisma.review.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: { increment: 1 } }),
        }),
      );
    });
  });

  // ── deleteReview ────────────────────────────────────────────────────────

  describe("deleteReview", () => {
    it("should delete a review", async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);
      prisma.review.delete.mockResolvedValue(mockReview);

      const result = await service.deleteReview(mockUserId, mockReviewId);

      expect(result.success).toBe(true);
      expect(prisma.review.delete).toHaveBeenCalledWith({
        where: { id: mockReviewId },
      });
    });

    it("should throw if review not found", async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteReview(mockUserId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if not owner", async () => {
      prisma.review.findUnique.mockResolvedValue({
        ...mockReview,
        userId: "other-user",
      });

      await expect(
        service.deleteReview(mockUserId, mockReviewId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── getUserReviews ──────────────────────────────────────────────────────

  describe("getUserReviews", () => {
    it("should return user reviews", async () => {
      prisma.review.findMany.mockResolvedValue([
        { ...mockReview, product: mockProduct },
      ]);
      prisma.review.count.mockResolvedValue(1);

      const result = await service.getUserReviews(mockUserId, 1, 20);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it("should return empty array when no reviews", async () => {
      prisma.review.findMany.mockResolvedValue([]);
      prisma.review.count.mockResolvedValue(0);

      const result = await service.getUserReviews(mockUserId);

      expect(result.data).toHaveLength(0);
    });
  });
});
