import { Test, TestingModule } from "@nestjs/testing";
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { OtpService } from "./otp.service";
import { PrismaService } from "../../config/prisma.service";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn(),
}));

import * as bcrypt from "bcryptjs";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: Record<string, any>;
  let jwt: Record<string, any>;
  let otp: Record<string, any>;

  const mockUserId = "user-123";
  const mockEmail = "test@example.com";
  const mockPassword = "Password123!";

  const mockUser = {
    id: mockUserId,
    name: "Test User",
    email: mockEmail,
    phone: "+95912345678",
    password: "hashed-password",
    role: "CLIENT",
    status: "ACTIVE",
  };

  beforeEach(async () => {
    prisma = {
      dbConnected: true,
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue("mock-jwt-token"),
      verify: jest.fn(),
    };

    otp = {
      generate: jest.fn().mockResolvedValue("123456"),
      verify: jest.fn(),
      sendOtp: jest.fn().mockResolvedValue(undefined),
    };

    (bcrypt.hash as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (bcrypt.compare as jest.Mock).mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: OtpService, useValue: otp },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        name: "Test User",
        email: mockEmail,
        phone: "+95912345678",
        password: mockPassword,
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(otp.generate).toHaveBeenCalledWith(mockUserId, "VERIFY_EMAIL");
      expect(otp.sendOtp).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.requiresVerification).toBe(true);
    });

    it("should throw ConflictException for duplicate email", async () => {
      prisma.user.findFirst.mockResolvedValue({ ...mockUser, email: mockEmail });

      await expect(
        service.register({
          name: "Test User",
          email: mockEmail,
          phone: "+95912345678",
          password: mockPassword,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException for duplicate phone", async () => {
      prisma.user.findFirst.mockResolvedValue({ ...mockUser, email: "other@example.com" });

      await expect(
        service.register({
          name: "Test User",
          email: "new@example.com",
          phone: "+95912345678",
          password: mockPassword,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should login successfully and return tokens", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = (await service.login({
        email: mockEmail,
        password: mockPassword,
      })) as any;

      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe("mock-jwt-token");
      expect(result.data.refreshToken).toBe("mock-jwt-token");
    });

    it("should throw UnauthorizedException for wrong password", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockEmail, password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: mockEmail, password: mockPassword }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should return requiresVerification for pending user", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: "PENDING_VERIFICATION",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = (await service.login({
        email: mockEmail,
        password: mockPassword,
      })) as any;

      expect(result.success).toBe(false);
      expect(result.data.requiresVerification).toBe(true);
      expect(otp.generate).toHaveBeenCalled();
    });

    it("should throw for other non-active statuses", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: "SUSPENDED",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: mockEmail, password: mockPassword }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("verifyOtp", () => {
    it("should verify OTP and activate user", async () => {
      jwt.verify.mockReturnValue({ sub: mockUserId, purpose: "otp_verify" });
      otp.verify.mockResolvedValue({ success: true, message: "OTP verified" });
      prisma.user.update.mockResolvedValue({ ...mockUser, status: "ACTIVE" });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.verifyOtp({
        token: "valid-token",
        code: "123456",
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { status: "ACTIVE" },
      });
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe("mock-jwt-token");
    });

    it("should throw BadRequestException for invalid token", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("jwt error");
      });

      await expect(
        service.verifyOtp({ token: "bad-token", code: "123456" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for token without purpose claim", async () => {
      jwt.verify.mockReturnValue({ sub: mockUserId }); // no purpose

      await expect(
        service.verifyOtp({ token: "access-token", code: "123456" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for invalid OTP", async () => {
      jwt.verify.mockReturnValue({ sub: mockUserId, purpose: "otp_verify" });
      otp.verify.mockResolvedValue({
        success: false,
        message: "Invalid or expired OTP code",
      });

      await expect(
        service.verifyOtp({ token: "valid-token", code: "000000" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("resendOtp", () => {
    it("should resend OTP successfully", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.resendOtp(mockEmail);

      expect(otp.generate).toHaveBeenCalledWith(mockUserId, "VERIFY_EMAIL");
      expect(otp.sendOtp).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it("should return success even if user not found (no email leak)", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.resendOtp("unknown@example.com");

      expect(result.success).toBe(true);
      expect(otp.generate).not.toHaveBeenCalled();
    });
  });
});
