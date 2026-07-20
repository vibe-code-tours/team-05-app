import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BannerService } from "./banner.service";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { CreateBannerDto, UpdateBannerDto } from "./dto/banner.dto";

@ApiTags("Banners")
@Controller("banners")
export class BannerController {
  constructor(private bannerService: BannerService) {}

  // ── Public Endpoints ────────────────────────────────────────────────────

  @Public()
  @Get("active")
  @ApiOperation({ summary: "Get active banners" })
  getActiveBanners() {
    return this.bannerService.getActiveBanners();
  }

  // ── Admin Endpoints ─────────────────────────────────────────────────────

  @Get("admin")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin: Get all banners" })
  adminGetAllBanners(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const take = Math.min(parseInt(limit) || 20, 100);
    return this.bannerService.adminGetAllBanners(
      page ? parseInt(page) : 1,
      take,
    );
  }

  @Get("admin/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin: Get banner by ID" })
  adminGetBannerById(@Param("id") id: string) {
    return this.bannerService.adminGetBannerById(id);
  }

  @Post("admin")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Admin: Create banner" })
  adminCreateBanner(@Body() dto: CreateBannerDto) {
    return this.bannerService.adminCreateBanner(dto);
  }

  @Put("admin/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin: Update banner" })
  adminUpdateBanner(@Param("id") id: string, @Body() dto: UpdateBannerDto) {
    return this.bannerService.adminUpdateBanner(id, dto);
  }

  @Delete("admin/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin: Delete banner" })
  adminDeleteBanner(@Param("id") id: string) {
    return this.bannerService.adminDeleteBanner(id);
  }
}
