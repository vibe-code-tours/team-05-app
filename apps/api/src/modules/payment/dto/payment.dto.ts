import { IsString, IsOptional, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethod } from "@prisma/client";

const PAYMENT_METHODS = [
  "KBZ_PAY",
  "AYA_PAY",
  "WAVE",
  "CB_PAY",
  "CASH",
  "PROMPT_PAY",
  "VISA",
  "MASTERCARD",
  "STRIPE",
] as const;

const VERIFY_STATUSES = ["CONFIRMED", "REJECTED"] as const;

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsIn(PAYMENT_METHODS)
  method: PaymentMethod;

  @ApiProperty({ example: "https://example.com/slip.jpg" })
  @IsString()
  slipUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ enum: VERIFY_STATUSES })
  @IsIn(VERIFY_STATUSES)
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RequestRefundDto {
  @ApiProperty({ example: "Product was damaged" })
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidenceUrl?: string;
}

export class ProcessRefundDto {
  @ApiProperty({ enum: ["APPROVED", "REJECTED"] })
  @IsIn(["APPROVED", "REJECTED"])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
