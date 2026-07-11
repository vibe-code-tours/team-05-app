import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { ProductService } from "./product.service";

@ApiTags("Products")
@Controller("products")
export class ProductController {
  constructor(private productService: ProductService) {}

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

  @Get(":slug")
  @ApiOperation({ summary: "Get product by slug" })
  findBySlug(@Param("slug") slug: string) {
    return this.productService.findBySlug(slug);
  }
}
