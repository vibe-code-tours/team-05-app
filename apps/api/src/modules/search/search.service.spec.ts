import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { SearchService } from "./search.service";
import { PrismaService } from "../../config/prisma.service";

// Mock meilisearch
jest.mock("meilisearch", () => {
  return {
    Meilisearch: jest.fn().mockImplementation(() => ({
      index: jest.fn().mockReturnValue({
        search: jest.fn().mockResolvedValue({
          hits: [],
          estimatedTotalHits: 0,
          nbHits: 0,
          processingTimeMs: 10,
        }),
        addDocuments: jest.fn().mockResolvedValue({ taskUid: 1 }),
        deleteDocument: jest.fn().mockResolvedValue({ taskUid: 2 }),
        getStats: jest.fn().mockResolvedValue({
          numberOfDocuments: 0,
          isIndexing: false,
        }),
      }),
    })),
  };
});

describe("SearchService", () => {
  let service: SearchService;
  let prisma: Record<string, any>;
  let config: Record<string, any>;

  const mockProduct = {
    id: "product-123",
    name: "Wireless Headphones",
    description: "High quality wireless headphones",
    slug: "wireless-headphones",
    price: 99.99,
    type: "IN_STOCK",
    status: "APPROVED",
    stock: 50,
    categoryId: "cat-123",
    brandId: "brand-123",
    sellerId: "seller-123",
    createdAt: new Date("2026-07-12T10:00:00.000Z"),
    images: [{ url: "https://example.com/image.jpg" }],
    category: { id: "cat-123", name: "Electronics", slug: "electronics" },
    brand: { id: "brand-123", name: "Sony", slug: "sony" },
    seller: { id: "seller-123", name: "Tech Store" },
    reviews: [{ rating: 5 }, { rating: 4 }],
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
      brand: {
        findMany: jest.fn(),
      },
    };

    config = {
      get: jest.fn().mockImplementation((key: string, defaultVal: string) => {
        const configMap: Record<string, string> = {
          MEILISEARCH_HOST: "http://localhost:7700",
          MEILISEARCH_API_KEY: "test-key",
        };
        return configMap[key] || defaultVal;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    // Trigger onModuleInit
    service.onModuleInit();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ── search ──────────────────────────────────────────────────────────────

  describe("search", () => {
    it("should return search results", async () => {
      const result = await service.search({ q: "headphones" });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it("should pass filters to Meilisearch", async () => {
      const result = await service.search({
        q: "headphones",
        categoryId: "cat-123",
        brandId: "brand-123",
        type: "IN_STOCK",
        minPrice: 50,
        maxPrice: 200,
      });

      expect(result.success).toBe(true);
    });

    it("should handle sort options", async () => {
      const result = await service.search({
        q: "headphones",
        sort: "price_asc",
      });

      expect(result.success).toBe(true);
    });
  });

  // ── autocomplete ────────────────────────────────────────────────────────

  describe("autocomplete", () => {
    it("should return autocomplete results", async () => {
      const result = await service.autocomplete({ q: "wire" });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should respect limit parameter", async () => {
      const result = await service.autocomplete({ q: "wire", limit: 3 });

      expect(result.success).toBe(true);
    });
  });

  // ── indexProduct ────────────────────────────────────────────────────────

  describe("indexProduct", () => {
    it("should index a product", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.indexProduct("product-123");

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should return failure if product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      const result = await service.indexProduct("nonexistent");

      expect(result.success).toBe(false);
    });
  });

  // ── removeProduct ───────────────────────────────────────────────────────

  describe("removeProduct", () => {
    it("should remove a product from index", async () => {
      const result = await service.removeProduct("product-123");

      expect(result.success).toBe(true);
    });
  });

  // ── reindexAll ──────────────────────────────────────────────────────────

  describe("reindexAll", () => {
    it("should reindex all data", async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);
      prisma.category.findMany.mockResolvedValue([]);
      prisma.brand.findMany.mockResolvedValue([]);

      const result = await service.reindexAll();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should reindex only products when specified", async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.reindexAll("products");

      expect(result.success).toBe(true);
      expect(result.data.products).toBeDefined();
    });
  });

  // ── getIndexStats ───────────────────────────────────────────────────────

  describe("getIndexStats", () => {
    it("should return index stats", async () => {
      const result = await service.getIndexStats();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
