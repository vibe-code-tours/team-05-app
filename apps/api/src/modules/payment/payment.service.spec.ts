import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PrismaService } from "../../config/prisma.service";

describe("PaymentService", () => {
  let service: PaymentService;
  let prisma: Record<string, any>;

  const mockBuyerId = "buyer-123";
  const mockSellerId = "seller-123";
  const mockOrderId = "order-123";
  const mockPaymentId = "payment-123";

  const mockOrder = {
    id: mockOrderId,
    buyerId: mockBuyerId,
    sellerId: mockSellerId,
    status: "PENDING_PAYMENT",
    total: 36500,
  };

  const mockPayment = {
    id: mockPaymentId,
    orderId: mockOrderId,
    method: "KBZ_PAY",
    amount: 36500,
    slipUrl: "https://example.com/slip.jpg",
    status: "PENDING",
  };

  beforeEach(async () => {
    prisma = {
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      orderItem: {
        findMany: jest.fn(),
      },
      product: {
        update: jest.fn(),
      },
      productVariant: {
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("submitPayment", () => {
    it("should create a new payment", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue(mockPayment);
      prisma.order.update.mockResolvedValue({});

      const result = await service.submitPayment(mockBuyerId, {
        orderId: mockOrderId,
        method: "KBZ_PAY",
        slipUrl: "https://example.com/slip.jpg",
      });

      expect(result.success).toBe(true);
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: { status: "PAYMENT_SUBMITTED" },
      });
    });

    it("should update existing payment if not confirmed", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: "PENDING",
      });
      prisma.payment.update.mockResolvedValue(mockPayment);
      prisma.order.update.mockResolvedValue({});

      const result = await service.submitPayment(mockBuyerId, {
        orderId: mockOrderId,
        method: "AYA_PAY",
        slipUrl: "https://example.com/new-slip.jpg",
      });

      expect(result.success).toBe(true);
      expect(prisma.payment.update).toHaveBeenCalled();
    });

    it("should throw if order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.submitPayment(mockBuyerId, {
          orderId: "nonexistent",
          method: "KBZ_PAY",
          slipUrl: "https://example.com/slip.jpg",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if not buyer's order", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        buyerId: "other-user",
      });

      await expect(
        service.submitPayment(mockBuyerId, {
          orderId: mockOrderId,
          method: "KBZ_PAY",
          slipUrl: "https://example.com/slip.jpg",
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw if order not in payable status", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PROCESSING",
      });

      await expect(
        service.submitPayment(mockBuyerId, {
          orderId: mockOrderId,
          method: "KBZ_PAY",
          slipUrl: "https://example.com/slip.jpg",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if payment already confirmed", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: "CONFIRMED",
      });

      await expect(
        service.submitPayment(mockBuyerId, {
          orderId: mockOrderId,
          method: "KBZ_PAY",
          slipUrl: "https://example.com/slip.jpg",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw on duplicate slip URL", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        slipUrl: "https://example.com/slip.jpg",
      });

      await expect(
        service.submitPayment(mockBuyerId, {
          orderId: mockOrderId,
          method: "KBZ_PAY",
          slipUrl: "https://example.com/slip.jpg", // same URL
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getPayment", () => {
    it("should return payment for order (buyer)", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.getPayment(mockBuyerId, mockOrderId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPayment);
    });

    it("should return payment for order (seller)", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.getPayment(mockSellerId, mockOrderId);

      expect(result.success).toBe(true);
    });

    it("should throw if order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getPayment(mockBuyerId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if not authorized", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.getPayment("random-user", mockOrderId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("verifyPayment", () => {
    it("should confirm payment (seller)", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          payment: { update: jest.fn() },
          order: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.verifyPayment(
        mockSellerId,
        mockOrderId,
        { status: "CONFIRMED" },
        "SELLER",
      );

      expect(result.success).toBe(true);
    });

    it("should confirm payment (admin)", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          payment: { update: jest.fn() },
          order: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.verifyPayment(
        "admin-123",
        mockOrderId,
        { status: "CONFIRMED" },
        "ADMIN",
      );

      expect(result.success).toBe(true);
    });

    it("should reject payment and restore stock", async () => {
      const orderWithItems = {
        ...mockOrder,
        items: [
          { productId: "p1", variantId: null, quantity: 2 },
        ],
      };
      prisma.order.findUnique.mockResolvedValue(orderWithItems);
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          payment: { update: jest.fn() },
          order: { update: jest.fn() },
          orderItem: { findMany: jest.fn().mockResolvedValue(orderWithItems.items) },
          product: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.verifyPayment(
        mockSellerId,
        mockOrderId,
        { status: "REJECTED" },
        "SELLER",
      );

      expect(result.success).toBe(true);
    });

    it("should throw if not seller or admin", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.verifyPayment("random-user", mockOrderId, { status: "CONFIRMED" }, "CLIENT"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw if payment not found", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyPayment(mockSellerId, mockOrderId, { status: "CONFIRMED" }, "SELLER"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if payment already confirmed", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: "CONFIRMED",
      });

      await expect(
        service.verifyPayment(mockSellerId, mockOrderId, { status: "CONFIRMED" }, "SELLER"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getPendingPayments", () => {
    it("should return pending payments for seller", async () => {
      prisma.payment.findMany.mockResolvedValue([mockPayment]);

      const result = await service.getPendingPayments(mockSellerId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("requestRefund", () => {
    it("should allow refund request within 7 days", async () => {
      const recentOrder = {
        ...mockOrder,
        status: "COMPLETED",
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        payment: { status: "CONFIRMED" },
        notes: null,
      };
      prisma.order.findUnique.mockResolvedValue(recentOrder);
      prisma.order.update.mockResolvedValue({
        ...recentOrder,
        status: "REFUNDED",
      });

      const result = await service.requestRefund(mockBuyerId, mockOrderId, {
        reason: "Product damaged",
      });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe("REFUNDED");
    });

    it("should throw if order not in refundable status", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PROCESSING",
        payment: { status: "CONFIRMED" },
      });

      await expect(
        service.requestRefund(mockBuyerId, mockOrderId, { reason: "Test" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if refund window expired (7 days)", async () => {
      const oldOrder = {
        ...mockOrder,
        status: "COMPLETED",
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        payment: { status: "CONFIRMED" },
      };
      prisma.order.findUnique.mockResolvedValue(oldOrder);

      await expect(
        service.requestRefund(mockBuyerId, mockOrderId, { reason: "Test" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if no confirmed payment", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "COMPLETED",
        updatedAt: new Date(),
        payment: null,
      });

      await expect(
        service.requestRefund(mockBuyerId, mockOrderId, { reason: "Test" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if not buyer's order", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "COMPLETED",
        buyerId: "other-user",
        updatedAt: new Date(),
        payment: { status: "CONFIRMED" },
      });

      await expect(
        service.requestRefund(mockBuyerId, mockOrderId, { reason: "Test" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("processRefund", () => {
    it("should approve refund and restore stock", async () => {
      const refundedOrder = {
        ...mockOrder,
        status: "REFUNDED",
        items: [{ productId: "p1", variantId: null, quantity: 2 }],
      };
      prisma.order.findUnique.mockResolvedValue(refundedOrder);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          product: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.processRefund(
        mockSellerId,
        mockOrderId,
        { status: "APPROVED" },
        "SELLER",
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain("approved");
    });

    it("should reject refund", async () => {
      const refundedOrder = {
        ...mockOrder,
        status: "REFUNDED",
        items: [],
        notes: null,
      };
      prisma.order.findUnique.mockResolvedValue(refundedOrder);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          order: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.processRefund(
        mockSellerId,
        mockOrderId,
        { status: "REJECTED", notes: "Item used" },
        "SELLER",
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain("rejected");
    });

    it("should throw if order not in REFUNDED status", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "COMPLETED",
      });

      await expect(
        service.processRefund(mockSellerId, mockOrderId, { status: "APPROVED" }, "SELLER"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if not seller or admin", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "REFUNDED",
      });

      await expect(
        service.processRefund("random-user", mockOrderId, { status: "APPROVED" }, "CLIENT"),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
