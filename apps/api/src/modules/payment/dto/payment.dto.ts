import { IsString, IsOptional, IsEnum } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ enum: ["KBZ_PAY", "AYA_PAY", "WAVE", "CB_PAY", "CASH", "PROMPT_PAY", "VISA", "MASTERCARD", "STRIPE"] })
  @IsString()
  method: string;

  @ApiProperty({ example: "https://example.com/slip.jpg" })
  @IsString()
  slipUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ enum: ["CONFIRMED", "REJECTED"] })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
