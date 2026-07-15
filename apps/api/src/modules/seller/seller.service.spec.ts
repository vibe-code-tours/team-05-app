import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SellerService } from "./seller.service";
import { PrismaService } from "../../config/prisma.service";

describe("SellerService", () => {
  let service: SellerService;
  let prisma: Record<string, any>;

  const mockUserId = "user-123";

  const mockSellerUser = {
    id: mockUserId,
    email: "seller@example.com",
    phone: "+95912345678",
    name: "Test Seller",
    role: "SELLER",
    status: "PENDING_VERIFICATION",
    createdAt: new Date(),
  };

  const mockApprovedSeller = {
    ...mockSellerUser,
    status: "ACTIVE",
  };

  beforeEach(async () => {
    prisma = {
    dbConnected: true,
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SellerService>(SellerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("registerAsSeller", () => {
    it("should register a client as seller", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockSellerUser,
        role: "CLIENT",
      });
      prisma.user.update.mockResolvedValue(mockSellerUser);

      const result = await service.registerAsSeller(mockUserId, {
        shopName: "My Shop",
        description: "We sell electronics from Bangkok",
        phone: "+95912345678",
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: {
          role: "SELLER",
          status: "PENDING_VERIFICATION",
        },
        select: expect.any(Object),
      });
      expect(result.success).toBe(true);
      expect(result.data.role).toBe("SELLER");
    });

    it("should throw if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.registerAsSeller("nonexistent", {
          shopName: "Shop",
          description: "A test shop description",
          phone: "+95912345678",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if user is already a seller", async () => {
      prisma.user.findUnique.mockResolvedValue(mockSellerUser);

      await expect(
        service.registerAsSeller(mockUserId, {
          shopName: "Shop",
          description: "A test shop description",
          phone: "+95912345678",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if user is an admin", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockSellerUser,
        role: "ADMIN",
      });

      await expect(
        service.registerAsSeller(mockUserId, {
          shopName: "Shop",
          description: "A test shop description",
          phone: "+95912345678",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getSellerProfile", () => {
    it("should return seller profile", async () => {
      prisma.user.findFirst.mockResolvedValue({
        ...mockApprovedSeller,
        products: [],
        _count: { products: 5, reviews: 10 },
      });

      const result = await service.getSellerProfile(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Test Seller");
    });

    it("should throw if seller not found", async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.getSellerProfile("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("approveOrReject", () => {
    it("should approve a seller", async () => {
      prisma.user.findUnique.mockResolvedValue(mockSellerUser);
      prisma.user.update.mockResolvedValue(mockApprovedSeller);

      const result = await service.approveOrReject(mockUserId, {
        status: "APPROVED",
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { status: "ACTIVE" },
        select: expect.any(Object),
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain("approved");
    });

    it("should reject a seller", async () => {
      prisma.user.findUnique.mockResolvedValue(mockSellerUser);
      prisma.user.update.mockResolvedValue({
        ...mockSellerUser,
        status: "SUSPENDED",
      });

      const result = await service.approveOrReject(mockUserId, {
        status: "REJECTED",
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { status: "SUSPENDED" },
        select: expect.any(Object),
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain("rejected");
    });

    it("should throw if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.approveOrReject("nonexistent", { status: "APPROVED" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if user is not a seller", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockSellerUser,
        role: "CLIENT",
      });

      await expect(
        service.approveOrReject(mockUserId, { status: "APPROVED" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if seller application is not pending", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockSellerUser,
        status: "ACTIVE",
      });

      await expect(
        service.approveOrReject(mockUserId, { status: "APPROVED" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getAllSellers", () => {
    it("should return all sellers", async () => {
      prisma.user.findMany.mockResolvedValue([mockApprovedSeller]);

      const result = await service.getAllSellers();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("getPendingSellers", () => {
    it("should return pending sellers", async () => {
      prisma.user.findMany.mockResolvedValue([mockSellerUser]);

      const result = await service.getPendingSellers();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe("PENDING_VERIFICATION");
    });
  });
});
