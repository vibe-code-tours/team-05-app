import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { PrismaService } from "../../config/prisma.service";

describe("UserService", () => {
  let service: UserService;
  let prisma: Record<string, any>;

  const mockUserId = "user-123";
  const mockAddressId = "addr-123";

  const mockUser = {
    id: mockUserId,
    email: "user@example.com",
    phone: "+95912345678",
    name: "Test User",
    role: "CLIENT",
    status: "ACTIVE",
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAddress = {
    id: mockAddressId,
    userId: mockUserId,
    label: "Home",
    recipientName: "Test User",
    phone: "+95912345678",
    street: "123 Main St",
    city: "Yangon",
    state: "Yangon Region",
    postalCode: "11111",
    country: "MM",
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
    dbConnected: true,
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      address: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ─── Profile ──────────────────────────────────────────

  describe("findById", () => {
    it("should return a user by id", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data.email).toBe("user@example.com");
    });

    it("should throw if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        name: "Updated Name",
      });

      const result = await service.updateProfile(mockUserId, {
        name: "Updated Name",
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Updated Name");
    });

    it("should throw if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile("nonexistent", { name: "New" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if phone is already in use", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.findFirst.mockResolvedValue({
        id: "other-user",
        phone: "+95999999999",
      });

      await expect(
        service.updateProfile(mockUserId, { phone: "+95999999999" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── Addresses ────────────────────────────────────────

  describe("getAddresses", () => {
    it("should return all addresses for a user", async () => {
      prisma.address.findMany.mockResolvedValue([mockAddress]);

      const result = await service.getAddresses(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].city).toBe("Yangon");
    });
  });

  describe("getAddress", () => {
    it("should return a specific address", async () => {
      prisma.address.findFirst.mockResolvedValue(mockAddress);

      const result = await service.getAddress(mockUserId, mockAddressId);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(mockAddressId);
    });

    it("should throw if address not found", async () => {
      prisma.address.findFirst.mockResolvedValue(null);

      await expect(
        service.getAddress(mockUserId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("createAddress", () => {
    it("should create a new address", async () => {
      prisma.address.create.mockResolvedValue(mockAddress);

      const result = await service.createAddress(mockUserId, {
        name: "Home",
        phone: "+95912345678",
        street: "123 Main St",
        city: "Yangon",
        district: "Downtown",
        state: "Yangon Region",
        postalCode: "11111",
      });

      expect(prisma.address.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.city).toBe("Yangon");
    });

    it("should unset other defaults when creating default address", async () => {
      prisma.address.updateMany.mockResolvedValue({ count: 1 });
      prisma.address.create.mockResolvedValue({
        ...mockAddress,
        isDefault: true,
      });

      const result = await service.createAddress(mockUserId, {
        name: "Work",
        phone: "+95912345678",
        street: "456 Work St",
        city: "Yangon",
        district: "Downtown",
        state: "Yangon Region",
        postalCode: "22222",
        isDefault: true,
      });

      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isDefault: true },
        data: { isDefault: false },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateAddress", () => {
    it("should update an address", async () => {
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.address.update.mockResolvedValue({
        ...mockAddress,
        city: "Mandalay",
      });

      const result = await service.updateAddress(
        mockUserId,
        mockAddressId,
        {
          name: "Home",
          phone: "+95912345678",
          street: "123 Main St",
          city: "Mandalay",
          district: "Downtown",
        },
      );

      expect(result.success).toBe(true);
      expect(result.data.city).toBe("Mandalay");
    });

    it("should throw if address not found", async () => {
      prisma.address.findFirst.mockResolvedValue(null);

      await expect(
        service.updateAddress(mockUserId, "nonexistent", {
          name: "Home",
          phone: "+95912345678",
          street: "123 Main St",
          city: "New",
          district: "Downtown",
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteAddress", () => {
    it("should delete an address", async () => {
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.address.delete.mockResolvedValue(mockAddress);

      const result = await service.deleteAddress(mockUserId, mockAddressId);

      expect(prisma.address.delete).toHaveBeenCalledWith({
        where: { id: mockAddressId },
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe("Address deleted");
    });

    it("should throw if address not found", async () => {
      prisma.address.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteAddress(mockUserId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("setDefaultAddress", () => {
    it("should set address as default", async () => {
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.address.updateMany.mockResolvedValue({ count: 0 });
      prisma.address.update.mockResolvedValue({
        ...mockAddress,
        isDefault: true,
      });

      const result = await service.setDefaultAddress(
        mockUserId,
        mockAddressId,
      );

      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isDefault: true },
        data: { isDefault: false },
      });
      expect(prisma.address.update).toHaveBeenCalledWith({
        where: { id: mockAddressId },
        data: { isDefault: true },
      });
      expect(result.success).toBe(true);
      expect(result.data.isDefault).toBe(true);
    });

    it("should throw if address not found", async () => {
      prisma.address.findFirst.mockResolvedValue(null);

      await expect(
        service.setDefaultAddress(mockUserId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
