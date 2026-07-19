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

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return { success: false, message: "Invalid or expired OTP code" };
    }

    // Mark as used
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
    if (process.env.NODE_ENV !== "production") {
      console.log(`📧 OTP [${channel}] to ${identifier}: ${code}`);
    }
  }
}
