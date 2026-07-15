import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateBrandDto,
  UpdateBrandDto,
} from "./dto/catalog.dto";

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Categories ──────────────────────────────────────

  async findAllCategories() {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      return { success: true, data: [] };
    }

    const categories = await this.prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
        children: {
          include: { _count: { select: { products: true } } },
        },
      },
      where: { parentId: null },
      orderBy: { name: "asc" },
    });

    return { success: true, data: categories };
  }

  async findCategoryBySlug(slug: string) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return { success: true, data: category };
  }

  async createCategory(dto: CreateCategoryDto) {
    // Check slug uniqueness
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(`Category slug '${dto.slug}' already exists`);
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException("Parent category not found");
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        image: dto.image,
        parentId: dto.parentId,
      },
    });

    return { success: true, data: category };
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    // Prevent setting self as parent
    if (dto.parentId === id) {
      throw new BadRequestException("Category cannot be its own parent");
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    return { success: true, data: updated };
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (category._count.products > 0) {
      throw new BadRequestException("Cannot delete category with products. Move products first.");
    }

    if (category._count.children > 0) {
      throw new BadRequestException("Cannot delete category with subcategories. Delete children first.");
    }

    await this.prisma.category.delete({ where: { id } });

    return { success: true, message: "Category deleted" };
  }

  // ─── Brands ──────────────────────────────────────────

  async findAllBrands() {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      return { success: true, data: [] };
    }

    const brands = await this.prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });

    return { success: true, data: brands };
  }

  async findBrandBySlug(slug: string) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: "APPROVED" },
          include: {
            images: { take: 1, orderBy: { order: "asc" } },
            category: true,
          },
          take: 20,
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { products: true } },
      },
    });

    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    return { success: true, data: brand };
  }

  async createBrand(dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(`Brand slug '${dto.slug}' already exists`);
    }

    const brand = await this.prisma.brand.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        logo: dto.logo,
      },
    });

    return { success: true, data: brand };
  }

  async updateBrand(id: string, dto: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    const updated = await this.prisma.brand.update({
      where: { id },
      data: dto,
    });

    return { success: true, data: updated };
  }

  async deleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    if (brand._count.products > 0) {
      throw new BadRequestException("Cannot delete brand with products. Move products first.");
    }

    await this.prisma.brand.delete({ where: { id } });

    return { success: true, message: "Brand deleted" };
  }
}
