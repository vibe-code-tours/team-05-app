import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CatalogService } from "./catalog.service";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateBrandDto,
  UpdateBrandDto,
} from "./dto/catalog.dto";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Catalog")
@Controller("catalog")
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  // ─── Categories (Public) ─────────────────────────────

  @Get("categories")
  @ApiOperation({ summary: "List all categories" })
  findAllCategories() {
    return this.catalogService.findAllCategories();
  }

  @Get("categories/:slug")
  @ApiOperation({ summary: "Get category by slug" })
  findCategoryBySlug(@Param("slug") slug: string) {
    return this.catalogService.findCategoryBySlug(slug);
  }

  // ─── Categories (Admin) ──────────────────────────────

  @Post("categories")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create category (admin only)" })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @Put("categories/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update category (admin only)" })
  updateCategory(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(id, dto);
  }

  @Delete("categories/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete category (admin only)" })
  deleteCategory(@Param("id") id: string) {
    return this.catalogService.deleteCategory(id);
  }

  // ─── Brands (Public) ─────────────────────────────────

  @Get("brands")
  @ApiOperation({ summary: "List all brands" })
  findAllBrands() {
    return this.catalogService.findAllBrands();
  }

  @Get("brands/:slug")
  @ApiOperation({ summary: "Get brand by slug" })
  findBrandBySlug(@Param("slug") slug: string) {
    return this.catalogService.findBrandBySlug(slug);
  }

  // ─── Brands (Admin) ──────────────────────────────────

  @Post("brands")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create brand (admin only)" })
  createBrand(@Body() dto: CreateBrandDto) {
    return this.catalogService.createBrand(dto);
  }

  @Put("brands/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update brand (admin only)" })
  updateBrand(@Param("id") id: string, @Body() dto: UpdateBrandDto) {
    return this.catalogService.updateBrand(id, dto);
  }

  @Delete("brands/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete brand (admin only)" })
  deleteBrand(@Param("id") id: string) {
    return this.catalogService.deleteBrand(id);
  }
}
