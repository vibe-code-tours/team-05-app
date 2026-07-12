import { IsString, IsOptional, MinLength, IsBoolean } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "John Doe" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: "+95912345678" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.jpg" })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class CreateAddressDto {
  @ApiProperty({ example: "Home" })
  @IsString()
  name: string;

  @ApiProperty({ example: "+95912345678" })
  @IsString()
  phone: string;

  @ApiProperty({ example: "123 Main Street" })
  @IsString()
  street: string;

  @ApiProperty({ example: "Yangon" })
  @IsString()
  city: string;

  @ApiProperty({ example: "Thanlyin" })
  @IsString()
  district: string;

  @ApiPropertyOptional({ example: "Yangon Region" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: "11221" })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends CreateAddressDto {}
