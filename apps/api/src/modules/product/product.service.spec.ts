import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { PrismaService } from "../../config/prisma.service";

describe("ProductService", () => {
  let service: ProductService;
  let prisma: Record<string, any>;

  const mockSellerId = "seller-123";
  const mockProductId = "product-123";

  const mockProduct = {
    id: mockProductId,
    sellerId: mockSellerId,
    name: "Sony Alpha A7 IV",
    slug: "sony-alpha-a7-iv",
    description: "Full-frame mirrorless camera",
    price: 2499,
    type: "IN_STOCK",
    status: "APPROVED",
    stock: 15,
    categoryId: "cat-1",
    brandId: "brand-1",
    images: [],
    variants: [],
    category: { id: "cat-1", name: "Cameras", slug: "cameras" },
    brand: { id: "brand-1", name: "Sony", slug: "sony" },
    reviews: [],
  };

  beforeEach(async () => {
    prisma = {
      dbConnected: true,
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
      },
      brand: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated products", async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);
      prisma.product.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it("should apply category filter", async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20, category: "cameras" });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: "cameras" },
          }),
        }),
      );
    });

    it("should apply search filter", async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20, search: "sony" });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: "sony" }) }),
            ]),
          }),
        }),
      );
    });

    it("should return empty results when db not connected", async () => {
      prisma.dbConnected = false;

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it("should throw ServiceUnavailableException on db connection error", async () => {
      prisma.product.findMany.mockRejectedValue(
        new Error("Can't reach database"),
      );

      await expect(
        service.findAll({ page: 1, limit: 20 }),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe("findBySlug", () => {
    it("should return a product by slug", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findBySlug("sony-alpha-a7-iv");

      expect(result.success).toBe(true);
      expect(result.data.slug).toBe("sony-alpha-a7-iv");
    });

    it("should throw NotFoundException when product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ServiceUnavailableException when db not connected", async () => {
      prisma.dbConnected = false;

      await expect(service.findBySlug("sony-alpha-a7-iv")).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it("should throw ServiceUnavailableException on db connection error", async () => {
      prisma.product.findUnique.mockRejectedValue(
        new Error("Can't reach database"),
      );

      await expect(service.findBySlug("sony-alpha-a7-iv")).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe("create", () => {
    it("should create a product successfully", async () => {
      prisma.category.findUnique.mockResolvedValue({ id: "cat-1", slug: "cameras" });
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(mockSellerId, {
        name: "Sony Alpha A7 IV",
        description: "Full-frame mirrorless camera",
        price: 2499,
        type: "IN_STOCK",
        categorySlug: "cameras",
        stock: 15,
      });

      expect(prisma.product.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Sony Alpha A7 IV");
    });

    it("should throw BadRequestException for invalid category", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.create(mockSellerId, {
          name: "Test Product",
          description: "Test description here",
          price: 100,
          type: "IN_STOCK",
          categorySlug: "nonexistent",
          stock: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for duplicate slug", async () => {
      prisma.category.findUnique.mockResolvedValue({ id: "cat-1", slug: "cameras" });
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.create(mockSellerId, {
          name: "Sony Alpha A7 IV",
          description: "Full-frame mirrorless camera",
          price: 2499,
          type: "IN_STOCK",
          categorySlug: "cameras",
          stock: 15,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for invalid brand", async () => {
      prisma.category.findUnique.mockResolvedValue({ id: "cat-1", slug: "cameras" });
      prisma.brand.findUnique.mockResolvedValue(null);

      await expect(
        service.create(mockSellerId, {
          name: "Test Product",
          description: "Test description here",
          price: 100,
          type: "IN_STOCK",
          categorySlug: "cameras",
          brandSlug: "nonexistent",
          stock: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("update", () => {
    it("should update a product successfully", async () => {
      prisma.product.findUnique
        .mockResolvedValueOnce({ ...mockProduct, status: "PENDING" })
        .mockResolvedValueOnce(mockProduct);
      prisma.product.update.mockResolvedValue({ ...mockProduct, name: "Updated" });

      const result = await service.update(mockSellerId, mockProductId, {
        name: "Updated",
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Updated");
    });

    it("should throw NotFoundException when product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockSellerId, "nonexistent", { name: "Updated" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.update("other-seller", mockProductId, { name: "Updated" }),
      ).rejects.toThrow("You can only edit your own products");
    });

    it("should throw BadRequestException when editing approved product", async () => {
      prisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        status: "APPROVED",
      });

      await expect(
        service.update(mockSellerId, mockProductId, { name: "Updated" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("delete", () => {
    it("should delete a product successfully", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.delete.mockResolvedValue(mockProduct);

      const result = await service.delete(mockSellerId, mockProductId);

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: mockProductId },
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe("Product deleted");
    });

    it("should throw NotFoundException when product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.delete(mockSellerId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.delete("other-seller", mockProductId),
      ).rejects.toThrow("You can only delete your own products");
    });
  });
});
