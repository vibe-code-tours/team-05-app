import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class SearchQueryDto {
  @ApiProperty({ example: "wireless headphones" })
  @IsString()
  q: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: "Filter by category ID" })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Filter by brand ID" })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({
    enum: ["IN_STOCK", "CARGO", "PROMOTION", "PREORDER", "LOCAL", "USED"],
    description: "Filter by product type",
  })
  @IsOptional()
  @IsIn(["IN_STOCK", "CARGO", "PROMOTION", "PREORDER", "LOCAL", "USED"])
  type?: string;

  @ApiPropertyOptional({
    enum: ["price_asc", "price_desc", "rating", "newest"],
    description: "Sort results",
  })
  @IsOptional()
  @IsIn(["price_asc", "price_desc", "rating", "newest"])
  sort?: string;

  @ApiPropertyOptional({ description: "Minimum price" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;
}

export class AutocompleteQueryDto {
  @ApiProperty({ example: "wire" })
  @IsString()
  q: string;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;
}

export class IndexProductDto {
  @ApiProperty({ description: "Product ID to index" })
  @IsString()
  productId: string;
}

export class ReindexAllDto {
  @ApiPropertyOptional({ description: "Specific index to reindex, or all if omitted" })
  @IsOptional()
  @IsIn(["products", "categories", "brands"])
  index?: string;
}
