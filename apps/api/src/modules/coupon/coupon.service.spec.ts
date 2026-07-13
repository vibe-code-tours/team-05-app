import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { PrismaService } from "../../config/prisma.service";

describe("CouponService", () => {
  let service: CouponService;
  let prisma: Record<string, any>;

  const mockCouponId = "coupon-123";

  const mockCoupon = {
    id: mockCouponId,
    code: "SUMMER20",
    discountType: "PERCENTAGE",
    value: 20,
    usageLimit: 100,
    usedCount: 10,
    minOrder: 50000,
    expiresAt: new Date("2026-12-31T23:59:59.999Z"),
    active: true,
    createdAt: new Date("2026-07-12T10:00:00.000Z"),
    updatedAt: new Date("2026-07-12T10:00:00.000Z"),
  };

  beforeEach(async () => {
    prisma = {
      coupon: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ── validateCoupon ──────────────────────────────────────────────────────

  describe("validateCoupon", () => {
    it("should validate a percentage coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);

      const result = await service.validateCoupon("SUMMER20", 100000);

      expect(result.success).toBe(true);
      expect(result.data.discount).toBe(20000);
      expect(result.data.finalTotal).toBe(80000);
    });

    it("should validate a flat coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        discountType: "FLAT",
        value: 15000,
      });

      const result = await service.validateCoupon("SUMMER20", 100000);

      expect(result.success).toBe(true);
      expect(result.data.discount).toBe(15000);
      expect(result.data.finalTotal).toBe(85000);
    });

    it("should throw if coupon not found", async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.validateCoupon("INVALID", 100000),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if coupon inactive", async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        active: false,
      });

      await expect(
        service.validateCoupon("SUMMER20", 100000),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if coupon expired", async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        expiresAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      await expect(
        service.validateCoupon("SUMMER20", 100000),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if usage limit reached", async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        usageLimit: 100,
        usedCount: 100,
      });

      await expect(
        service.validateCoupon("SUMMER20", 100000),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if min order not met", async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);

      await expect(
        service.validateCoupon("SUMMER20", 30000),
      ).rejects.toThrow(BadRequestException);
    });

    it("should not exceed order total for flat coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        discountType: "FLAT",
        value: 200000,
      });

      const result = await service.validateCoupon("SUMMER20", 100000);

      expect(result.data.discount).toBe(100000);
      expect(result.data.finalTotal).toBe(0);
    });
  });

  // ── adminGetAllCoupons ──────────────────────────────────────────────────

  describe("adminGetAllCoupons", () => {
    it("should return paginated coupons", async () => {
      prisma.coupon.findMany.mockResolvedValue([mockCoupon]);
      prisma.coupon.count.mockResolvedValue(1);

      const result = await service.adminGetAllCoupons(1, 20);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  // ── adminGetCouponById ──────────────────────────────────────────────────

  describe("adminGetCouponById", () => {
    it("should return a coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);

      const result = await service.adminGetCouponById(mockCouponId);

      expect(result.success).toBe(true);
      expect(result.data.code).toBe("SUMMER20");
    });

    it("should throw if coupon not found", async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.adminGetCouponById("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminCreateCoupon ───────────────────────────────────────────────────

  describe("adminCreateCoupon", () => {
    it("should create a coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);
      prisma.coupon.create.mockResolvedValue(mockCoupon);

      const result = await service.adminCreateCoupon({
        code: "SUMMER20",
        discountType: "PERCENTAGE",
        value: 20,
        usageLimit: 100,
        minOrder: 50000,
        expiresAt: "2026-12-31T23:59:59.999Z",
      });

      expect(result.success).toBe(true);
      expect(result.data.code).toBe("SUMMER20");
    });

    it("should throw if code already exists", async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);

      await expect(
        service.adminCreateCoupon({
          code: "SUMMER20",
          discountType: "PERCENTAGE",
          value: 20,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should uppercase the code", async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);
      prisma.coupon.create.mockResolvedValue(mockCoupon);

      await service.adminCreateCoupon({
        code: "summer20",
        discountType: "PERCENTAGE",
        value: 20,
      });

      expect(prisma.coupon.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ code: "SUMMER20" }),
        }),
      );
    });
  });

  // ── adminUpdateCoupon ───────────────────────────────────────────────────

  describe("adminUpdateCoupon", () => {
    it("should update a coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);
      prisma.coupon.update.mockResolvedValue({
        ...mockCoupon,
        value: 15,
      });

      const result = await service.adminUpdateCoupon(mockCouponId, {
        value: 15,
      });

      expect(result.success).toBe(true);
      expect(result.data.value).toBe(15);
    });

    it("should throw if coupon not found", async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.adminUpdateCoupon("nonexistent", { value: 15 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminDeleteCoupon ───────────────────────────────────────────────────

  describe("adminDeleteCoupon", () => {
    it("should delete a coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);
      prisma.coupon.delete.mockResolvedValue(mockCoupon);

      const result = await service.adminDeleteCoupon(mockCouponId);

      expect(result.success).toBe(true);
    });

    it("should throw if coupon not found", async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.adminDeleteCoupon("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminIncrementUsage ─────────────────────────────────────────────────

  describe("adminIncrementUsage", () => {
    it("should increment usage count", async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);
      prisma.coupon.update.mockResolvedValue({
        ...mockCoupon,
        usedCount: 11,
      });

      const result = await service.adminIncrementUsage("SUMMER20");

      expect(result.success).toBe(true);
    });

    it("should throw if coupon not found", async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.adminIncrementUsage("INVALID"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
