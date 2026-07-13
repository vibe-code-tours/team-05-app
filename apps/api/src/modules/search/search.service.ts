import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MeiliSearch } from "meilisearch";
import { PrismaService } from "../../config/prisma.service";

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;

  // Index names
  readonly INDEX_PRODUCTS = "products";
  readonly INDEX_CATEGORIES = "categories";
  readonly INDEX_BRANDS = "brands";

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const host = this.config.get("MEILISEARCH_HOST", "http://localhost:7700");
    const apiKey = this.config.get("MEILISEARCH_API_KEY", "");

    this.client = new MeiliSearch({ host, apiKey });
    this.logger.log(`Meilisearch client initialized: ${host}`);
  }

  // ── Search Endpoints ────────────────────────────────────────────────────

  async search(query: {
    q: string;
    page?: number;
    limit?: number;
    categoryId?: string;
    brandId?: string;
    type?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const { q, page = 1, limit = 20, categoryId, brandId, type, sort, minPrice, maxPrice } = query;

    const index = this.client.index(this.INDEX_PRODUCTS);

    // Build filters
    const filters: string[] = ["status = APPROVED"];
    if (categoryId) filters.push(`categoryId = "${categoryId}"`);
    if (brandId) filters.push(`brandId = "${brandId}"`);
    if (type) filters.push(`type = "${type}"`);
    if (minPrice !== undefined) filters.push(`price >= ${minPrice}`);
    if (maxPrice !== undefined) filters.push(`price <= ${maxPrice}`);

    // Build sort
    let sortArray: string[] | undefined;
    if (sort) {
      switch (sort) {
        case "price_asc":
          sortArray = ["price:asc"];
          break;
        case "price_desc":
          sortArray = ["price:desc"];
          break;
        case "rating":
          sortArray = ["avgRating:desc"];
          break;
        case "newest":
          sortArray = ["createdAt:desc"];
          break;
      }
    }

    const result = await index.search(q, {
      filter: filters.join(" AND "),
      sort: sortArray,
      limit,
      offset: (page - 1) * limit,
      attributesToHighlight: ["name"],
      attributesToCrop: ["description"],
    });

    return {
      success: true,
      data: result.hits,
      meta: {
        page,
        limit,
        total: result.estimatedTotalHits ?? result.nbHits ?? 0,
        totalPages: Math.ceil((result.estimatedTotalHits ?? result.nbHits ?? 0) / limit),
        processingTimeMs: result.processingTimeMs,
      },
    };
  }

  async autocomplete(query: { q: string; limit?: number }) {
    const { q, limit = 5 } = query;

    const index = this.client.index(this.INDEX_PRODUCTS);

    const result = await index.search(q, {
      limit,
      attributesToHighlight: ["name"],
      attributesToRetrieve: ["id", "name", "slug", "price", "images"],
      filter: "status = APPROVED",
    });

    return {
      success: true,
      data: result.hits,
      meta: {
        processingTimeMs: result.processingTimeMs,
      },
    };
  }

  // ── Indexing Endpoints ──────────────────────────────────────────────────

  async indexProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { select: { url: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true } },
        reviews: { select: { rating: true } },
      },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        : 0;

    const indexDoc = {
      id: product.id,
      name: product.name,
      description: product.description,
      slug: product.slug,
      price: Number(product.price),
      type: product.type,
      status: product.status,
      stock: product.stock,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      brandId: product.brandId,
      brandName: product.brand?.name,
      sellerId: product.sellerId,
      sellerName: product.seller?.name,
      image: product.images[0]?.url,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
      createdAt: product.createdAt.toISOString(),
    };

    const index = this.client.index(this.INDEX_PRODUCTS);
    await index.addDocuments([indexDoc]);

    this.logger.log(`Indexed product: ${productId}`);
    return { success: true, data: indexDoc };
  }

  async removeProduct(productId: string) {
    const index = this.client.index(this.INDEX_PRODUCTS);
    await index.deleteDocument(productId);
    this.logger.log(`Removed product from index: ${productId}`);
    return { success: true };
  }

  async reindexAll(type?: string) {
    const results: { products?: number; categories?: number; brands?: number } = {};

    if (!type || type === "products") {
      const count = await this.reindexProducts();
      results.products = count;
    }

    if (!type || type === "categories") {
      const count = await this.reindexCategories();
      results.categories = count;
    }

    if (!type || type === "brands") {
      const count = await this.reindexBrands();
      results.brands = count;
    }

    return { success: true, data: results };
  }

  private async reindexProducts(): Promise<number> {
    const products = await this.prisma.product.findMany({
      where: { status: "APPROVED" },
      include: {
        images: { select: { url: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true } },
        reviews: { select: { rating: true } },
      },
    });

    const docs = products.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        slug: p.slug,
        price: Number(p.price),
        type: p.type,
        status: p.status,
        stock: p.stock,
        categoryId: p.categoryId,
        categoryName: p.category?.name,
        brandId: p.brandId,
        brandName: p.brand?.name,
        sellerId: p.sellerId,
        sellerName: p.seller?.name,
        image: p.images[0]?.url,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
        createdAt: p.createdAt.toISOString(),
      };
    });

    const index = this.client.index(this.INDEX_PRODUCTS);
    await index.addDocuments(docs);
    this.logger.log(`Reindexed ${docs.length} products`);
    return docs.length;
  }

  private async reindexCategories(): Promise<number> {
    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
    });

    const index = this.client.index(this.INDEX_CATEGORIES);
    await index.addDocuments(categories);
    this.logger.log(`Reindexed ${categories.length} categories`);
    return categories.length;
  }

  private async reindexBrands(): Promise<number> {
    const brands = await this.prisma.brand.findMany({
      select: { id: true, name: true, slug: true },
    });

    const index = this.client.index(this.INDEX_BRANDS);
    await index.addDocuments(brands);
    this.logger.log(`Reindexed ${brands.length} brands`);
    return brands.length;
  }

  // ── Index Stats ─────────────────────────────────────────────────────────

  async getIndexStats() {
    const productsIndex = this.client.index(this.INDEX_PRODUCTS);
    const stats = await productsIndex.getStats();

    return {
      success: true,
      data: {
        products: {
          numberOfDocuments: stats.numberOfDocuments,
          isIndexing: stats.isIndexing,
        },
      },
    };
  }
}
