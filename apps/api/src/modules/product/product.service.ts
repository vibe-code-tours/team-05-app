import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    category?: string;
    type?: string;
    search?: string;
  }) {
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
  }

  async findBySlug(slug: string) {
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
  }
}
