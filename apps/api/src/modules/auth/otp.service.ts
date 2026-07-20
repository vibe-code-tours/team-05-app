import { Injectable, ServiceUnavailableException, Logger } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { randomInt } from "crypto";

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a 6-digit OTP code for a user
   */
  async generate(userId: string, type: string = "VERIFY_EMAIL"): Promise<string> {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    // Invalidate any existing OTPs of this type for the user
    await this.prisma.otpCode.updateMany({
      where: { userId, type, used: false },
      data: { used: true },
    });

    // Generate 6-digit code
    const code = randomInt(100000, 999999).toString();

    // Store in DB with 10-minute expiry
    await this.prisma.otpCode.create({
      data: {
        userId,
        code,
        type,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    return code;
  }

  /**
   * Verify an OTP code
   */
  async verify(
    userId: string,
    code: string,
    type: string = "VERIFY_EMAIL"
  ): Promise<{ success: boolean; message: string }> {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    // Find the most recent unused OTP of this type
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return { success: false, message: "Invalid or expired OTP code" };
    }

    // Check if max attempts exceeded (5 attempts)
    const MAX_ATTEMPTS = 5;
    if (otp.attempts >= MAX_ATTEMPTS) {
      // Mark as used to prevent further attempts
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { used: true },
      });
      return { success: false, message: "OTP code locked due to too many failed attempts. Please request a new code." };
    }

    // Increment attempts
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });

    // Check if code matches
    if (otp.code !== code) {
      return { success: false, message: "Invalid OTP code" };
    }

    // Mark as used on success
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return { success: true, message: "OTP verified successfully" };
  }

  /**
   * Send OTP via email/SMS (placeholder - logs to console for now)
   */
  async sendOtp(identifier: string, code: string, channel: "email" | "sms" = "email"): Promise<void> {
    // TODO: Integrate with email/SMS provider (e.g., Twilio, SendGrid, Resend)
    // Only log OTP in development to prevent exposure in production logs
    if (process.env.NODE_ENV !== "production") {
      this.logger.log(`📧 OTP [${channel}] to ${identifier}: ${code}`);
    }
    }
  }
}
