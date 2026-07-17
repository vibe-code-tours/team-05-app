import { IsEmail, IsString, MinLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+95912345678" })
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: "phone must be a valid phone number (7-15 digits, optional + prefix)",
  })
  phone: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
    message: "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
  })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: "123456" })
  @IsString()
  @MinLength(6)
  code: string;

  @ApiProperty()
  @IsString()
  token: string;
}
