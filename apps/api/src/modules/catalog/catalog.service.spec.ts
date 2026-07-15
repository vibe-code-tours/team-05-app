import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { PrismaService } from "../../config/prisma.service";

describe("CatalogService", () => {
  let service: CatalogService;
  let prisma: Record<string, any>;

  const mockCategory = {
    id: "cat-123",
    name: "Electronics",
    slug: "electronics",
    image: "https://example.com/electronics.jpg",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBrand = {
    id: "brand-123",
    name: "Samsung",
    slug: "samsung",
    logo: "https://example.com/samsung.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
    dbConnected: true,
      category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      brand: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ─── Categories ──────────────────────────────────────

  describe("findAllCategories", () => {
    it("should return all categories", async () => {
      prisma.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAllCategories();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Electronics");
    });
  });

  describe("findCategoryBySlug", () => {
    it("should return a category by slug", async () => {
      prisma.category.findUnique.mockResolvedValue({
        ...mockCategory,
        parent: null,
        children: [],
        _count: { products: 10 },
      });

      const result = await service.findCategoryBySlug("electronics");

      expect(result.success).toBe(true);
      expect(result.data.slug).toBe("electronics");
    });

    it("should throw if category not found", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.findCategoryBySlug("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("createCategory", () => {
    it("should create a category", async () => {
      prisma.category.findUnique.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue(mockCategory);

      const result = await service.createCategory({
        name: "Electronics",
        slug: "electronics",
        image: "https://example.com/electronics.jpg",
      });

      expect(prisma.category.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Electronics");
    });

    it("should throw on duplicate slug", async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);

      await expect(
        service.createCategory({
          name: "Electronics 2",
          slug: "electronics",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateCategory", () => {
    it("should update a category", async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.update.mockResolvedValue({
        ...mockCategory,
        name: "Updated Electronics",
      });

      const result = await service.updateCategory("cat-123", {
        name: "Updated Electronics",
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Updated Electronics");
    });

    it("should throw if category not found", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCategory("nonexistent", { name: "New" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Brands ──────────────────────────────────────────

  describe("findAllBrands", () => {
    it("should return all brands", async () => {
      prisma.brand.findMany.mockResolvedValue([mockBrand]);

      const result = await service.findAllBrands();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Samsung");
    });
  });

  describe("findBrandBySlug", () => {
    it("should return a brand by slug", async () => {
      prisma.brand.findUnique.mockResolvedValue({
        ...mockBrand,
        products: [],
        _count: { products: 5 },
      });

      const result = await service.findBrandBySlug("samsung");

      expect(result.success).toBe(true);
      expect(result.data.slug).toBe("samsung");
    });

    it("should throw if brand not found", async () => {
      prisma.brand.findUnique.mockResolvedValue(null);

      await expect(
        service.findBrandBySlug("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("createBrand", () => {
    it("should create a brand", async () => {
      prisma.brand.findUnique.mockResolvedValue(null);
      prisma.brand.create.mockResolvedValue(mockBrand);

      const result = await service.createBrand({
        name: "Samsung",
        slug: "samsung",
        logo: "https://example.com/samsung.png",
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Samsung");
    });

    it("should throw on duplicate slug", async () => {
      prisma.brand.findUnique.mockResolvedValue(mockBrand);

      await expect(
        service.createBrand({
          name: "Samsung 2",
          slug: "samsung",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateBrand", () => {
    it("should update a brand", async () => {
      prisma.brand.findUnique.mockResolvedValue(mockBrand);
      prisma.brand.update.mockResolvedValue({
        ...mockBrand,
        name: "Samsung Electronics",
      });

      const result = await service.updateBrand("brand-123", {
        name: "Samsung Electronics",
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Samsung Electronics");
    });

    it("should throw if brand not found", async () => {
      prisma.brand.findUnique.mockResolvedValue(null);

      await expect(
        service.updateBrand("nonexistent", { name: "New" }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
