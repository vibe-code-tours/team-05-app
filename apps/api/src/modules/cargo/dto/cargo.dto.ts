import { IsString, IsOptional, IsEnum, IsDateString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCargoTrackingDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ example: "TH-2024-12345" })
  @IsString()
  trackingNumber: string;

  @ApiProperty({ example: "DHL Express" })
  @IsString()
  carrier: string;

  @ApiProperty({ example: "Bangkok, Thailand" })
  @IsString()
  origin: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  estimatedArrival?: string;
}

export class UpdateMilestoneDto {
  @ApiProperty({
    enum: [
      "ORDER_PLACED", "PAYMENT_CONFIRMED", "WAITING_PURCHASE", "PURCHASED",
      "PACKED", "BKK_WAREHOUSE", "EXPORT_CLEARANCE", "AIR_CARGO",
      "CUSTOMS", "YGN_WAREHOUSE", "OUT_FOR_DELIVERY", "DELIVERED",
    ],
  })
  @IsString()
  milestone: string;

  @ApiPropertyOptional({ example: "Cleared customs at Yangon" })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: "Package inspected and cleared" })
  @IsOptional()
  @IsString()
  notes?: string;
}
