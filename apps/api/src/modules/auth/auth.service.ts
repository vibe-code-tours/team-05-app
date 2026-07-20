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
import { randomBytes } from "crypto";
import { createHash } from "crypto";
import { PrismaService } from "../../config/prisma.service";
import { OtpService } from "./otp.service";
import { RegisterDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from "./dto/auth.dto";

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
        otpToken,
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

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account is locked. Try again in ${remainingMinutes} minute(s).`);
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      // Increment failed attempts
      const failedAttempts = user.failedAttempts + 1;
      const MAX_FAILED_ATTEMPTS = 5;
      const LOCKOUT_DURATION_MINUTES = 15;

      const updateData: { failedAttempts: number; lockedUntil?: Date } = {
        failedAttempts,
      };

      // Lock account after 5 failed attempts
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
        this.logger.warn(`Account ${user.email} locked after ${MAX_FAILED_ATTEMPTS} failed attempts`);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedException("Invalid email or password");
    }

    // Reset failed attempts on successful password validation
    if (user.failedAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    }

    if (user.status === "PENDING_VERIFICATION") {
      // Resend OTP if not verified
      const code = await this.otpService.generate(user.id, "VERIFY_EMAIL");
      await this.otpService.sendOtp(user.email, code, "email");

      // Sign OTP token with purpose claim
      const otpToken = this.jwt.sign(
        { sub: user.id, email: user.email, purpose: "otp_verify" },
        { expiresIn: "10m" }
      );

      return {
        success: false,
        message: "Please verify your email first. A new OTP has been sent.",
        data: { requiresVerification: true, email: user.email, otpToken },
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

  async refreshTokens(dto: RefreshTokenDto) {
    if (!this.prisma.dbConnected) {
      throw new ServiceUnavailableException("Database not available");
    }

    // Verify JWT signature and type
    let payload: { sub: string; email: string; role: string; type: string; jti: string };
    try {
      payload = this.jwt.verify(dto.refreshToken);
      if (payload.type !== "refresh") {
        throw new BadRequestException("Invalid token type");
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    // Look up session by token hash
    const tokenHash = createHash("sha256").update(dto.refreshToken).digest("hex");
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: tokenHash },
      include: { user: { select: { id: true, email: true, role: true, status: true } } },
    });

    if (!session || session.revokedAt) {
      throw new UnauthorizedException("Refresh token revoked or not found");
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }

    if (session.user.status !== "ACTIVE") {
      throw new UnauthorizedException("Account is not active");
    }

    // Revoke old session (token rotation)
    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    // Issue new token pair
    return this.generateTokens(session.user.id, session.user.email, session.user.role);
  }

  async logout(dto: RefreshTokenDto) {
    if (!this.prisma.dbConnected) {
      throw new ServiceUnavailableException("Database not available");
    }

    const tokenHash = createHash("sha256").update(dto.refreshToken).digest("hex");
    await this.prisma.session.updateMany({
      where: { refreshToken: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { success: true, message: "Logged out successfully" };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, { expiresIn: "15m" });

    // Generate refresh token with type claim and unique jti
    const jti = randomBytes(16).toString("hex");
    const refreshToken = this.jwt.sign(
      { ...payload, type: "refresh", jti },
      { expiresIn: "30d" }
    );

    // Store refresh token hash in Session table for revocation
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken: tokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

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
