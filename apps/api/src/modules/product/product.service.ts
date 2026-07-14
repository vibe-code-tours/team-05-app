import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import {
  CreateProductDto,
  UpdateProductDto,
  ApproveProductDto,
} from "./dto/product.dto";

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Public ──────────────────────────────────────────

  async findAll(params: {
    page?: number;
    limit?: number;
    category?: string;
    type?: string;
    search?: string;
  }) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      return {
        success: true,
        data: [],
        meta: { page: params.page || 1, limit: params.limit || 20, total: 0, totalPages: 0 },
      };
    }

    try {
      const { page = 1, limit = 20, category, type, search } = params;
      const skip = (page - 1) * limit;

      const where: any = { status: "APPROVED" };
      if (category) where.category = { slug: category };
      if (type) where.type = type;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: {
            images: { take: 1, orderBy: { order: "asc" } },
            category: true,
            brand: true,
            seller: { select: { id: true, name: true } },
            reviews: { select: { rating: true } },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        success: true,
        data: products.map((p) => ({
          ...p,
          avgRating:
            p.reviews.length > 0
              ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
              : null,
          reviewCount: p.reviews.length,
          reviews: undefined,
        })),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch products: ${error.message}`);
      if (error.message?.includes("Can't reach database")) {
        throw new ServiceUnavailableException("Database temporarily unavailable");
      }
      throw error;
    }
  }

  async findBySlug(slug: string) {
    if (!this.prisma.dbConnected) {
      throw new ServiceUnavailableException("Database temporarily unavailable");
    }

    try {
      const product = await this.prisma.product.findUnique({
        where: { slug },
        include: {
          images: { orderBy: { order: "asc" } },
          variants: true,
          category: true,
          brand: true,
          seller: { select: { id: true, name: true, avatar: true } },
          reviews: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      return { success: true, data: product };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error(`Failed to fetch product: ${error.message}`);
      if (error.message?.includes("Can't reach database")) {
        throw new ServiceUnavailableException("Database temporarily unavailable");
      }
      throw error;
    }
  }

  // ─── Seller ──────────────────────────────────────────

  async findMyProducts(sellerId: string, page = 1, limit = 20) {
    if (!this.prisma.dbConnected) {
      throw new ServiceUnavailableException("Database temporarily unavailable");
    }

    try {
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: { sellerId },
          include: {
            images: { take: 1, orderBy: { order: "asc" } },
            category: true,
            brand: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.product.count({ where: { sellerId } }),
      ]);

      return {
        success: true,
        data: products,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      this.logger.error(`Failed to fetch seller products: ${error.message}`);
      if (error.message?.includes("Can't reach database")) {
        throw new ServiceUnavailableException("Database temporarily unavailable");
      }
      throw error;
    }
  }

  async create(sellerId: string, dto: CreateProductDto) {
    // Resolve category
    const category = await this.prisma.category.findUnique({
      where: { slug: dto.categorySlug },
    });
    if (!category) {
      throw new BadRequestException(`Category '${dto.categorySlug}' not found`);
    }

    // Resolve brand (optional)
    let brandId: string | undefined;
    if (dto.brandSlug) {
      const brand = await this.prisma.brand.findUnique({
        where: { slug: dto.brandSlug },
      });
      if (!brand) {
        throw new BadRequestException(`Brand '${dto.brandSlug}' not found`);
      }
      brandId = brand.id;
    }

    // Generate slug from name
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Product slug '${slug}' already exists`);
    }

    const product = await this.prisma.product.create({
      data: {
        sellerId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        type: dto.type as any,
        status: "PENDING",
        categoryId: category.id,
        brandId,
        stock: dto.stock,
        slug,
        images: dto.images
          ? { create: dto.images.map((img, i) => ({ url: img.url, alt: img.alt, order: img.order ?? i })) }
          : undefined,
        variants: dto.variants
          ? { create: dto.variants }
          : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
      },
    });

    return { success: true, data: product };
  }

  async update(sellerId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException("You can only edit your own products");
    }

    if (product.status === "APPROVED") {
      throw new BadRequestException("Cannot edit an approved product. Contact admin.");
    }

    // Resolve category if provided
    let categoryId: string | undefined;
    if (dto.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: dto.categorySlug },
      });
      if (!category) {
        throw new BadRequestException(`Category '${dto.categorySlug}' not found`);
      }
      categoryId = category.id;
    }

    // Resolve brand if provided
    let brandId: string | undefined;
    if (dto.brandSlug) {
      const brand = await this.prisma.brand.findUnique({
        where: { slug: dto.brandSlug },
      });
      if (!brand) {
        throw new BadRequestException(`Brand '${dto.brandSlug}' not found`);
      }
      brandId = brand.id;
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.type && { type: dto.type as any }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(categoryId && { categoryId }),
        ...(brandId && { brandId }),
        status: "PENDING", // Reset to pending on edit
      },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
      },
    });

    return { success: true, data: updated };
  }

  async delete(sellerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException("You can only delete your own products");
    }

    await this.prisma.product.delete({ where: { id: productId } });

    return { success: true, message: "Product deleted" };
  }

  // ─── Admin ───────────────────────────────────────────

  async findAllForAdmin(params: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { order: "asc" } },
          category: true,
          brand: true,
          seller: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async approveOrReject(productId: string, dto: ApproveProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (product.status !== "PENDING") {
      throw new BadRequestException("Only pending products can be approved/rejected");
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { status: dto.status as any },
      include: {
        category: true,
        brand: true,
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    // TODO: Send notification to seller about approval/rejection

    return { success: true, data: updated };
  }
}
