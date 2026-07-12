import { IsString, IsOptional, IsNumber, IsEnum, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  addressId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ["PROCESSING", "PACKING", "IN_CARGO", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED"] })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
