import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, VerifyOtpDto } from "./dto/auth.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new client account" })
  @ApiResponse({ status: 201, description: "Account created, OTP sent to email" })
  @ApiResponse({ status: 409, description: "Email or phone already in use" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials or not verified" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify OTP code to activate account" })
  @ApiResponse({ status: 200, description: "Account activated, tokens returned" })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post("resend-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend OTP code to email" })
  @ApiResponse({ status: 200, description: "OTP resent (if user exists)" })
  resendOtp(@Body() body: { email: string }) {
    return this.authService.resendOtp(body.email);
  }
}
