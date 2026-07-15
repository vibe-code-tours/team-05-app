import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBannerDto {
  @ApiProperty({ example: "Summer Sale" })
  @IsString()
  title: string;

  @ApiProperty({ example: "https://example.com/banner.jpg" })
  @IsString()
  image: string;

  @ApiPropertyOptional({ example: "/products/summer-sale" })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ example: "2026-07-01T00:00:00.000Z" })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: "2026-07-31T23:59:59.999Z" })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateBannerDto {
  @ApiPropertyOptional({ example: "Updated Title" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: "https://example.com/new-banner.jpg" })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: "/products/new-sale" })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ example: "2026-07-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: "2026-07-31T23:59:59.999Z" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
