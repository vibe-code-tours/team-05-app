import { IsString, IsOptional, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterSellerDto {
  @ApiProperty({ example: "My Shop Name" })
  @IsString()
  @MinLength(3)
  shopName: string;

  @ApiProperty({ example: "We sell electronics from Bangkok" })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: "+95912345678" })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: "https://example.com/shop-logo.png" })
  @IsOptional()
  @IsString()
  logo?: string;
}

export class ApproveSellerDto {
  @ApiProperty({ enum: ["APPROVED", "REJECTED"] })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
