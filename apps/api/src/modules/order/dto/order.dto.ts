import { IsString, IsOptional, IsNumber, Min, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAYMENT_SUBMITTED",
  "PAYMENT_CONFIRMED",
  "PAYMENT_REJECTED",
  "PROCESSING",
  "PACKING",
  "IN_CARGO",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

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
  @ApiProperty({ enum: ORDER_STATUSES })
  @IsIn(ORDER_STATUSES)
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: "Optimistic locking version", required: true })
  @IsNumber()
  version: number;
}

export class CancelOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
