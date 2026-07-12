import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { CargoService } from "./cargo.service";
import { PrismaService } from "../../config/prisma.service";

describe("CargoService", () => {
  let service: CargoService;
  let prisma: Record<string, any>;

  const mockSellerId = "seller-123";
  const mockAdminId = "admin-123";
  const mockTrackingId = "tracking-123";
  const mockOrderId = "order-123";

  const mockOrder = {
    id: mockOrderId,
    sellerId: mockSellerId,
    buyerId: "buyer-123",
    status: "IN_CARGO",
  };

  const mockTracking = {
    id: mockTrackingId,
    orderId: mockOrderId,
    trackingNumber: "TH-2024-12345",
    carrier: "DHL Express",
    origin: "Bangkok, Thailand",
    currentMilestone: "ORDER_PLACED",
    estimatedArrival: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    history: [],
  };

  beforeEach(async () => {
    prisma = {
      cargoTracking: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      cargoHistory: {
        create: jest.fn(),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CargoService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CargoService>(CargoService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createTracking", () => {
    it("should create cargo tracking with ETA", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.cargoTracking.findUnique.mockResolvedValue(null);
      prisma.cargoHistory.groupBy.mockResolvedValue([]);
      prisma.cargoTracking.create.mockResolvedValue({
        ...mockTracking,
        history: [{ milestone: "ORDER_PLACED" }],
      });

      const result = await service.createTracking(mockSellerId, {
        orderId: mockOrderId,
        trackingNumber: "TH-2024-12345",
        carrier: "DHL Express",
        origin: "Bangkok, Thailand",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(prisma.cargoTracking.create).toHaveBeenCalled();
    });

    it("should use provided ETA if given", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.cargoTracking.findUnique.mockResolvedValue(null);
      prisma.cargoHistory.groupBy.mockResolvedValue([]);
      prisma.cargoTracking.create.mockResolvedValue(mockTracking);

      const customEta = "2026-08-01T00:00:00.000Z";
      await service.createTracking(mockSellerId, {
        orderId: mockOrderId,
        trackingNumber: "TH-2024-12345",
        carrier: "DHL Express",
        origin: "Bangkok, Thailand",
        estimatedArrival: customEta,
      });

      const createCall = prisma.cargoTracking.create.mock.calls[0][0];
      expect(createCall.data.estimatedArrival).toEqual(new Date(customEta));
    });

    it("should throw if order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.createTracking(mockSellerId, {
          orderId: "nonexistent",
          trackingNumber: "TH-2024-12345",
          carrier: "DHL",
          origin: "Bangkok",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if not seller's order", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        sellerId: "other-seller",
      });

      await expect(
        service.createTracking(mockSellerId, {
          orderId: mockOrderId,
          trackingNumber: "TH-2024-12345",
          carrier: "DHL",
          origin: "Bangkok",
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw if order not in IN_CARGO status", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PROCESSING",
      });

      await expect(
        service.createTracking(mockSellerId, {
          orderId: mockOrderId,
          trackingNumber: "TH-2024-12345",
          carrier: "DHL",
          origin: "Bangkok",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if tracking already exists", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.cargoTracking.findUnique.mockResolvedValue(mockTracking);

      await expect(
        service.createTracking(mockSellerId, {
          orderId: mockOrderId,
          trackingNumber: "TH-2024-12345",
          carrier: "DHL",
          origin: "Bangkok",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateMilestone", () => {
    it("should update to next milestone with ETA recalculation", async () => {
      prisma.cargoTracking.findUnique.mockResolvedValue({
        ...mockTracking,
        order: mockOrder,
      });
      prisma.cargoHistory.groupBy.mockResolvedValue([]);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          cargoTracking: { update: jest.fn().mockResolvedValue(mockTracking) },
          cargoHistory: { create: jest.fn() },
          order: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.updateMilestone(mockSellerId, mockTrackingId, {
        milestone: "PAYMENT_CONFIRMED",
        location: "Bangkok",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should flag ETA delay if changed significantly", async () => {
      const oldEta = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      prisma.cargoTracking.findUnique.mockResolvedValue({
        ...mockTracking,
        estimatedArrival: oldEta,
        order: mockOrder,
      });
      prisma.cargoHistory.groupBy.mockResolvedValue([]);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          cargoTracking: {
            update: jest.fn().mockResolvedValue({
              ...mockTracking,
              estimatedArrival: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }),
          },
          cargoHistory: { create: jest.fn() },
          order: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.updateMilestone(mockSellerId, mockTrackingId, {
        milestone: "PAYMENT_CONFIRMED",
      });

      expect(result.etaDelayed).toBeDefined();
    });

    it("should throw if going backwards", async () => {
      prisma.cargoTracking.findUnique.mockResolvedValue({
        ...mockTracking,
        currentMilestone: "AIR_CARGO",
        order: mockOrder,
      });

      await expect(
        service.updateMilestone(mockSellerId, mockTrackingId, {
          milestone: "PACKED",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if skipping milestones", async () => {
      prisma.cargoTracking.findUnique.mockResolvedValue({
        ...mockTracking,
        currentMilestone: "ORDER_PLACED",
        order: mockOrder,
      });

      await expect(
        service.updateMilestone(mockSellerId, mockTrackingId, {
          milestone: "AIR_CARGO", // skips PAYMENT_CONFIRMED through PACKED
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if tracking not found", async () => {
      prisma.cargoTracking.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMilestone(mockSellerId, "nonexistent", {
          milestone: "PAYMENT_CONFIRMED",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if not authorized", async () => {
      prisma.cargoTracking.findUnique.mockResolvedValue({
        ...mockTracking,
        order: { ...mockOrder, sellerId: "other-seller" },
      });

      await expect(
        service.updateMilestone(mockSellerId, mockTrackingId, {
          milestone: "PAYMENT_CONFIRMED",
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should auto-update order status on OUT_FOR_DELIVERY", async () => {
      prisma.cargoTracking.findUnique.mockResolvedValue({
        ...mockTracking,
        currentMilestone: "YGN_WAREHOUSE",
        order: mockOrder,
      });
      prisma.cargoHistory.groupBy.mockResolvedValue([]);

      const mockTx = {
        cargoTracking: { update: jest.fn().mockResolvedValue(mockTracking) },
        cargoHistory: { create: jest.fn() },
        order: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      await service.updateMilestone(mockSellerId, mockTrackingId, {
        milestone: "OUT_FOR_DELIVERY",
      });

      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: { status: "OUT_FOR_DELIVERY" },
      });
    });

    it("should auto-update order status on DELIVERED", async () => {
      prisma.cargoTracking.findUnique.mockResolvedValue({
        ...mockTracking,
        currentMilestone: "OUT_FOR_DELIVERY",
        order: mockOrder,
      });
      prisma.cargoHistory.groupBy.mockResolvedValue([]);

      const mockTx = {
        cargoTracking: { update: jest.fn().mockResolvedValue(mockTracking) },
        cargoHistory: { create: jest.fn() },
        order: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      await service.updateMilestone(mockSellerId, mockTrackingId, {
        milestone: "DELIVERED",
      });

      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: { status: "DELIVERED" },
      });
    });
  });

  describe("adminForceMilestone", () => {
    it("should allow admin to force any milestone", async () => {
      prisma.cargoTracking.findUnique.mockResolvedValue({
        ...mockTracking,
        order: mockOrder,
      });
      prisma.cargoHistory.groupBy.mockResolvedValue([]);

      const mockTx = {
        cargoTracking: { update: jest.fn().mockResolvedValue(mockTracking) },
        cargoHistory: { create: jest.fn() },
        order: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      const result = await service.adminForceMilestone(mockAdminId, mockTrackingId, {
        milestone: "DELIVERED",
        notes: "Corrected milestone",
      });

      expect(result.success).toBe(true);
      expect(mockTx.cargoHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notes: "[Admin Override] Corrected milestone",
          }),
        }),
      );
    });

    it("should throw if tracking not found", async () => {
      prisma.cargoTracking.findUnique.mockResolvedValue(null);

      await expect(
        service.adminForceMilestone(mockAdminId, "nonexistent", {
          milestone: "DELIVERED",
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getTracking", () => {
    it("should return tracking for buyer", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.cargoTracking.findUnique.mockResolvedValue({
        ...mockTracking,
        history: [{ milestone: "ORDER_PLACED" }],
      });

      const result = await service.getTracking("buyer-123", mockOrderId);

      expect(result.success).toBe(true);
    });

    it("should return tracking for seller", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.cargoTracking.findUnique.mockResolvedValue(mockTracking);

      const result = await service.getTracking(mockSellerId, mockOrderId);

      expect(result.success).toBe(true);
    });

    it("should throw if not authorized", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.getTracking("random-user", mockOrderId),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw if order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getTracking("buyer-123", "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getByTrackingNumber", () => {
    it("should return tracking by number (public)", async () => {
      prisma.cargoTracking.findFirst.mockResolvedValue(mockTracking);

      const result = await service.getByTrackingNumber("TH-2024-12345");

      expect(result.success).toBe(true);
      expect(result.data.trackingNumber).toBe("TH-2024-12345");
    });

    it("should throw if not found", async () => {
      prisma.cargoTracking.findFirst.mockResolvedValue(null);

      await expect(
        service.getByTrackingNumber("INVALID"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("adminListShipments", () => {
    it("should return paginated shipments", async () => {
      prisma.cargoTracking.findMany.mockResolvedValue([mockTracking]);
      prisma.cargoTracking.count.mockResolvedValue(1);

      const result = await service.adminListShipments(1, 20);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it("should filter by milestone", async () => {
      prisma.cargoTracking.findMany.mockResolvedValue([]);
      prisma.cargoTracking.count.mockResolvedValue(0);

      await service.adminListShipments(1, 20, "AIR_CARGO");

      expect(prisma.cargoTracking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ currentMilestone: "AIR_CARGO" }),
        }),
      );
    });

    it("should filter by carrier", async () => {
      prisma.cargoTracking.findMany.mockResolvedValue([]);
      prisma.cargoTracking.count.mockResolvedValue(0);

      await service.adminListShipments(1, 20, undefined, "DHL");

      expect(prisma.cargoTracking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            carrier: { contains: "DHL", mode: "insensitive" },
          }),
        }),
      );
    });
  });
});
