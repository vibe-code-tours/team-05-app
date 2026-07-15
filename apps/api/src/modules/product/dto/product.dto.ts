import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProductType, ProductStatus } from "@prisma/client";

export class CreateProductDto {
  @ApiProperty({ example: "Sony Alpha A7 IV" })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: "Full-frame mirrorless camera with 33MP sensor" })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 2499.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty({ example: "camera" })
  @IsString()
  categorySlug: string;

  @ApiPropertyOptional({ example: "sony" })
  @IsOptional()
  @IsString()
  brandSlug?: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: "sony-alpha-a7-iv" })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}

export class CreateProductImageDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateProductVariantDto {
  @ApiProperty()
  @IsString()
  sku: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty()
  attributes: Record<string, any>;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stock?: number;
}

export class ApproveProductDto {
  @ApiProperty({ enum: ProductStatus })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
