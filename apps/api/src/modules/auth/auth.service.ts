import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../config/prisma.service";
import { OtpService } from "./otp.service";
import { RegisterDto, LoginDto, VerifyOtpDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private otpService: OtpService
  ) {}

  async register(dto: RegisterDto) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? "Email already in use"
          : "Phone number already in use"
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role: "CLIENT",
        status: "PENDING_VERIFICATION",
      },
    });

    // Generate and send OTP
    const code = await this.otpService.generate(user.id, "VERIFY_EMAIL");
    await this.otpService.sendOtp(user.email, code, "email");

    // Issue a dedicated, short-lived token for OTP verification
    const otpToken = this.jwt.sign(
      { sub: user.id, email: user.email, purpose: "otp_verify" },
      { expiresIn: "10m" }
    );

    return {
      success: true,
      message: "Account created. Please verify your email with the OTP code sent.",
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        requiresVerification: true,
        otpToken,
      },
    };
  }

  async login(dto: LoginDto) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.status === "PENDING_VERIFICATION") {
      // Resend OTP if not verified
      const code = await this.otpService.generate(user.id, "VERIFY_EMAIL");
      await this.otpService.sendOtp(user.email, code, "email");

      return {
        success: false,
        message: "Please verify your email first. A new OTP has been sent.",
        data: { requiresVerification: true, email: user.email },
      };
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async verifyOtp(dto: VerifyOtpDto) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    // Find user by the token (JWT payload contains userId)
    let userId: string;
    try {
      const payload = this.jwt.verify(dto.token);
      // Reject if this isn't an OTP-specific token
      if (payload.purpose !== "otp_verify") {
        throw new BadRequestException("Invalid token type");
      }
      userId = payload.sub;
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException("Invalid or expired token");
    }

    const result = await this.otpService.verify(userId, dto.code, "VERIFY_EMAIL");

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    // Activate user
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async resendOtp(email: string) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { success: true, message: "If the email exists, an OTP has been sent." };
    }

    const code = await this.otpService.generate(user.id, "VERIFY_EMAIL");
    await this.otpService.sendOtp(user.email, code, "email");

    // Issue a new dedicated OTP verification token
    const otpToken = this.jwt.sign(
      { sub: user.id, email: user.email, purpose: "otp_verify" },
      { expiresIn: "10m" }
    );

    return { success: true, message: "If the email exists, an OTP has been sent.", data: { otpToken } };
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.jwt.sign(payload, { expiresIn: "7d" });

    return {
      success: true,
      data: {
        user: { id: userId, email, role },
        accessToken,
        refreshToken,
      },
    };
  }
}
