import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsIn,
  IsDateString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCouponDto {
  @ApiProperty({ example: "SUMMER20" })
  @IsString()
  code: string;

  @ApiProperty({ enum: ["PERCENTAGE", "FLAT"] })
  @IsIn(["PERCENTAGE", "FLAT"])
  discountType: string;

  @ApiProperty({ example: 20, description: "Percentage or flat amount" })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 100, description: "Max usage count" })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: 50000, description: "Minimum order amount" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrder?: number;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.999Z" })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ enum: ["PERCENTAGE", "FLAT"] })
  @IsOptional()
  @IsIn(["PERCENTAGE", "FLAT"])
  discountType?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrder?: number;

  @ApiPropertyOptional({ example: "2027-06-30T23:59:59.999Z" })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class ValidateCouponDto {
  @ApiProperty({ example: "SUMMER20" })
  @IsString()
  code: string;

  @ApiProperty({ example: 150000, description: "Current order total" })
  @IsNumber()
  @Min(0)
  orderTotal: number;
}
