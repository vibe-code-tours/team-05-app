import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  // ── Public Endpoints ────────────────────────────────────────────────────

  async getActiveBanners() {
    const now = new Date();

    const banners = await this.prisma.banner.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { order: "asc" },
    });

    return { success: true, data: banners };
  }

  // ── Admin Endpoints ─────────────────────────────────────────────────────

  async adminGetAllBanners(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      this.prisma.banner.findMany({
        skip,
        take: limit,
        orderBy: { order: "asc" },
      }),
      this.prisma.banner.count(),
    ]);

    return {
      success: true,
      data: banners,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminGetBannerById(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });

    if (!banner) {
      throw new NotFoundException("Banner not found");
    }

    return { success: true, data: banner };
  }

  async adminCreateBanner(dto: {
    title: string;
    image: string;
    link?: string;
    startDate: string;
    endDate: string;
    active?: boolean;
    order?: number;
  }) {
    const banner = await this.prisma.banner.create({
      data: {
        title: dto.title,
        image: dto.image,
        link: dto.link,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        active: dto.active ?? true,
        order: dto.order ?? 0,
      },
    });

    return { success: true, data: banner };
  }

  async adminUpdateBanner(
    id: string,
    dto: {
      title?: string;
      image?: string;
      link?: string;
      startDate?: string;
      endDate?: string;
      active?: boolean;
      order?: number;
    },
  ) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });

    if (!banner) {
      throw new NotFoundException("Banner not found");
    }

    const updated = await this.prisma.banner.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.link !== undefined && { link: dto.link }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.active !== undefined && { active: dto.active }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });

    return { success: true, data: updated };
  }

  async adminDeleteBanner(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });

    if (!banner) {
      throw new NotFoundException("Banner not found");
    }

    await this.prisma.banner.delete({ where: { id } });

    return { success: true };
  }
}
