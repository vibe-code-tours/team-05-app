import { Test, TestingModule } from "@nestjs/testing";
import { OtpService } from "./otp.service";
import { PrismaService } from "../../config/prisma.service";

describe("OtpService", () => {
  let service: OtpService;
  let prisma: Record<string, any>;

  const mockUserId = "user-123";
  const mockOtpId = "otp-123";

  beforeEach(async () => {
    prisma = {
    dbConnected: true,
      otpCode: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("generate", () => {
    it("should create an OTP record and return the code", async () => {
      prisma.otpCode.create.mockResolvedValue({ id: mockOtpId });

      const code = await service.generate(mockUserId, "VERIFY_EMAIL");

      expect(prisma.otpCode.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, type: "VERIFY_EMAIL", used: false },
        data: { used: true },
      });
      expect(prisma.otpCode.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          code: expect.any(String),
          type: "VERIFY_EMAIL",
          expiresAt: expect.any(Date),
        },
      });
      expect(code).toMatch(/^\d{6}$/);
    });

    it("should invalidate previous OTPs before generating new one", async () => {
      prisma.otpCode.create.mockResolvedValue({ id: mockOtpId });

      await service.generate(mockUserId, "VERIFY_EMAIL");

      expect(prisma.otpCode.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, type: "VERIFY_EMAIL", used: false },
        data: { used: true },
      });
    });
  });

  describe("verify", () => {
    it("should verify a valid OTP", async () => {
      prisma.otpCode.findFirst.mockResolvedValue({
        id: mockOtpId,
        userId: mockUserId,
        code: "123456",
        type: "VERIFY_EMAIL",
        used: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      prisma.otpCode.update.mockResolvedValue({});

      const result = await service.verify(mockUserId, "123456", "VERIFY_EMAIL");

      expect(result.success).toBe(true);
      expect(prisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: mockOtpId },
        data: { used: true },
      });
    });

    it("should fail for expired OTP", async () => {
      prisma.otpCode.findFirst.mockResolvedValue(null);

      const result = await service.verify(mockUserId, "123456", "VERIFY_EMAIL");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid or expired OTP code");
    });

    it("should fail for already used OTP", async () => {
      prisma.otpCode.findFirst.mockResolvedValue(null);

      const result = await service.verify(mockUserId, "123456", "VERIFY_EMAIL");

      expect(result.success).toBe(false);
      expect(prisma.otpCode.update).not.toHaveBeenCalled();
    });

    it("should fail for wrong code", async () => {
      prisma.otpCode.findFirst.mockResolvedValue(null);

      const result = await service.verify(mockUserId, "999999", "VERIFY_EMAIL");

      expect(result.success).toBe(false);
    });
  });

  describe("sendOtp", () => {
    it("should send OTP via email in non-production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const loggerSpy = jest.spyOn((service as any).logger, "log").mockImplementation();

      await service.sendOtp("test@example.com", "123456", "email");

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("123456"),
      );
      loggerSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it("should send OTP via SMS in non-production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const loggerSpy = jest.spyOn((service as any).logger, "log").mockImplementation();

      await service.sendOtp("+95912345678", "123456", "sms");

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("123456"),
      );
      loggerSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it("should not log OTP in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const loggerSpy = jest.spyOn((service as any).logger, "log").mockImplementation();

      await service.sendOtp("test@example.com", "123456", "email");

      expect(loggerSpy).not.toHaveBeenCalled();
      loggerSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });
});
