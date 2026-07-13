import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

const NOTIFICATION_TYPES = [
  "ORDER",
  "PAYMENT",
  "PRODUCT",
  "PROMOTION",
  "ACCOUNT",
  "SYSTEM",
] as const;

export class CreateNotificationDto {
  @ApiProperty({ example: "user-cuid-123" })
  @IsString()
  userId: string;

  @ApiProperty({ example: "Order Confirmed" })
  @IsString()
  title: string;

  @ApiProperty({ example: "Your order #ORD-001 has been confirmed." })
  @IsString()
  message: string;

  @ApiProperty({ enum: NOTIFICATION_TYPES })
  @IsIn(NOTIFICATION_TYPES)
  type: string;

  @ApiPropertyOptional({ description: "Additional data as JSON" })
  @IsOptional()
  data?: Record<string, any>;
}

export class NotificationQueryDto {
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

  @ApiPropertyOptional({ description: "Filter by read status" })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  read?: boolean;

  @ApiPropertyOptional({ enum: NOTIFICATION_TYPES, description: "Filter by type" })
  @IsOptional()
  @IsIn(NOTIFICATION_TYPES)
  type?: string;
}

export class AdminNotificationQueryDto extends NotificationQueryDto {
  @ApiPropertyOptional({ example: "user-cuid-123", description: "Filter by specific user" })
  @IsOptional()
  @IsString()
  userId?: string;
}
