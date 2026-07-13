import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { BannerService } from "./banner.service";
import { PrismaService } from "../../config/prisma.service";

describe("BannerService", () => {
  let service: BannerService;
  let prisma: Record<string, any>;

  const mockBannerId = "banner-123";

  const mockBanner = {
    id: mockBannerId,
    title: "Summer Sale",
    image: "https://example.com/banner.jpg",
    link: "/products/summer-sale",
    startDate: new Date("2026-07-01T00:00:00.000Z"),
    endDate: new Date("2026-07-31T23:59:59.999Z"),
    active: true,
    order: 0,
    createdAt: new Date("2026-07-12T10:00:00.000Z"),
    updatedAt: new Date("2026-07-12T10:00:00.000Z"),
  };

  beforeEach(async () => {
    prisma = {
      banner: {
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
        BannerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BannerService>(BannerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ── getActiveBanners ────────────────────────────────────────────────────

  describe("getActiveBanners", () => {
    it("should return active banners", async () => {
      prisma.banner.findMany.mockResolvedValue([mockBanner]);

      const result = await service.getActiveBanners();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it("should return empty array when no active banners", async () => {
      prisma.banner.findMany.mockResolvedValue([]);

      const result = await service.getActiveBanners();

      expect(result.data).toHaveLength(0);
    });
  });

  // ── adminGetAllBanners ──────────────────────────────────────────────────

  describe("adminGetAllBanners", () => {
    it("should return paginated banners", async () => {
      prisma.banner.findMany.mockResolvedValue([mockBanner]);
      prisma.banner.count.mockResolvedValue(1);

      const result = await service.adminGetAllBanners(1, 20);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  // ── adminGetBannerById ──────────────────────────────────────────────────

  describe("adminGetBannerById", () => {
    it("should return a banner", async () => {
      prisma.banner.findUnique.mockResolvedValue(mockBanner);

      const result = await service.adminGetBannerById(mockBannerId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBanner);
    });

    it("should throw if banner not found", async () => {
      prisma.banner.findUnique.mockResolvedValue(null);

      await expect(
        service.adminGetBannerById("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminCreateBanner ───────────────────────────────────────────────────

  describe("adminCreateBanner", () => {
    it("should create a banner", async () => {
      prisma.banner.create.mockResolvedValue(mockBanner);

      const result = await service.adminCreateBanner({
        title: "Summer Sale",
        image: "https://example.com/banner.jpg",
        link: "/products/summer-sale",
        startDate: "2026-07-01T00:00:00.000Z",
        endDate: "2026-07-31T23:59:59.999Z",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBanner);
    });
  });

  // ── adminUpdateBanner ───────────────────────────────────────────────────

  describe("adminUpdateBanner", () => {
    it("should update a banner", async () => {
      prisma.banner.findUnique.mockResolvedValue(mockBanner);
      prisma.banner.update.mockResolvedValue({
        ...mockBanner,
        title: "Updated Title",
      });

      const result = await service.adminUpdateBanner(mockBannerId, {
        title: "Updated Title",
      });

      expect(result.success).toBe(true);
      expect(result.data.title).toBe("Updated Title");
    });

    it("should throw if banner not found", async () => {
      prisma.banner.findUnique.mockResolvedValue(null);

      await expect(
        service.adminUpdateBanner("nonexistent", { title: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminDeleteBanner ───────────────────────────────────────────────────

  describe("adminDeleteBanner", () => {
    it("should delete a banner", async () => {
      prisma.banner.findUnique.mockResolvedValue(mockBanner);
      prisma.banner.delete.mockResolvedValue(mockBanner);

      const result = await service.adminDeleteBanner(mockBannerId);

      expect(result.success).toBe(true);
    });

    it("should throw if banner not found", async () => {
      prisma.banner.findUnique.mockResolvedValue(null);

      await expect(
        service.adminDeleteBanner("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
