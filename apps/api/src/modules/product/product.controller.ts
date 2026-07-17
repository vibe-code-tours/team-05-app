import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { ProductService } from "./product.service";
import {
  CreateProductDto,
  UpdateProductDto,
  ApproveProductDto,
} from "./dto/product.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Products")
@Controller("products")
export class ProductController {
  constructor(private productService: ProductService) {}

  // ─── Public ──────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: "List products with filters" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "type", required: false })
  @ApiQuery({ name: "search", required: false })
  findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("category") category?: string,
    @Query("type") type?: string,
    @Query("search") search?: string,
  ) {
    return this.productService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      category,
      type,
      search,
    });
  }

  @Get("my")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get seller's own products" })
  findMyProducts(
    @CurrentUser() user: { id: string },
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.productService.findMyProducts(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get("admin")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all products for admin" })
  @ApiQuery({ name: "status", required: false })
  findAllForAdmin(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    return this.productService.findAllForAdmin({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  @Public()
  @Get(":slug")
  @ApiOperation({ summary: "Get product by slug" })
  findBySlug(@Param("slug") slug: string) {
    return this.productService.findBySlug(slug);
  }

  // ─── Seller CRUD ─────────────────────────────────────

  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new product (seller only)" })
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(user.id, dto);
  }

  @Put(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a product (seller only)" })
  update(
    @CurrentUser() user: { id: string },
    @Param("id") productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(user.id, productId, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a product (seller only)" })
  delete(
    @CurrentUser() user: { id: string },
    @Param("id") productId: string,
  ) {
    return this.productService.delete(user.id, productId);
  }

  // ─── Admin Approval ──────────────────────────────────

  @Put(":id/approve")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Approve or reject a product (admin only)" })
  approveOrReject(
    @Param("id") productId: string,
    @Body() dto: ApproveProductDto,
  ) {
    return this.productService.approveOrReject(productId, dto);
  }
}
