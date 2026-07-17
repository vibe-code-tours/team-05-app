import { IsString, IsOptional, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// ─── Category DTOs ───────────────────────────────────

export class CreateCategoryDto {
  @ApiProperty({ example: "Camera" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: "camera" })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiPropertyOptional({ example: "https://example.com/camera.jpg" })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;
}

// ─── Brand DTOs ───────────────────────────────────────

export class CreateBrandDto {
  @ApiProperty({ example: "Sony" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: "sony" })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiPropertyOptional({ example: "https://example.com/sony.png" })
  @IsOptional()
  @IsString()
  logo?: string;
}

export class UpdateBrandDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;
}
