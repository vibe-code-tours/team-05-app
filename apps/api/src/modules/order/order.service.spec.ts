import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { PrismaService } from "../../config/prisma.service";

describe("OrderService", () => {
  let service: OrderService;
  let prisma: Record<string, any>;

  const mockBuyerId = "buyer-123";
  const mockSellerId = "seller-123";
  const mockOrderId = "order-123";
  const mockAddressId = "address-123";
  const mockProductId = "product-123";

  const mockProduct = {
    id: mockProductId,
    name: "Test Product",
    price: 15000,
    stock: 10,
    status: "APPROVED",
    sellerId: mockSellerId,
  };

  const mockCart = {
    id: "cart-123",
    userId: mockBuyerId,
    items: [
      {
        productId: mockProductId,
        variantId: null,
        quantity: 2,
        product: mockProduct,
        variant: null,
      },
    ],
  };

  const mockAddress = {
    id: mockAddressId,
    userId: mockBuyerId,
    name: "Test User",
    phone: "0912345678",
    street: "123 Main St",
    city: "Yangon",
    district: "Kamayut",
  };

  const mockOrder = {
    id: mockOrderId,
    orderNumber: "ORD-2026-000001",
    buyerId: mockBuyerId,
    sellerId: mockSellerId,
    status: "PENDING_PAYMENT",
    subtotal: 30000,
    shippingFee: 5000,
    tax: 1500,
    total: 36500,
    version: 0,
    items: [],
  };

  beforeEach(async () => {
    prisma = {
      order: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      cart: {
        findUnique: jest.fn(),
      },
      cartItem: {
        deleteMany: jest.fn(),
      },
      address: {
        findFirst: jest.fn(),
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
        OrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createOrder", () => {
    it("should create a single order from cart", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.order.findFirst.mockResolvedValue(null); // no existing orders this year
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue({
              ...mockOrder,
              items: [{ id: "item-1" }],
              shippingAddress: mockAddress,
              seller: { id: mockSellerId, name: "Test Seller" },
            }),
          },
          product: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          cartItem: { deleteMany: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.createOrder(mockBuyerId, {
        addressId: mockAddressId,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(prisma.cart.findUnique).toHaveBeenCalled();
      expect(prisma.address.findFirst).toHaveBeenCalled();
    });

    it("should throw if cart is empty", async () => {
      prisma.cart.findUnique.mockResolvedValue({ ...mockCart, items: [] });

      await expect(
        service.createOrder(mockBuyerId, { addressId: mockAddressId }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if cart not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrder(mockBuyerId, { addressId: mockAddressId }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if address not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.address.findFirst.mockResolvedValue(null);

      await expect(
        service.createOrder(mockBuyerId, { addressId: "wrong-address" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if product is not approved", async () => {
      const cart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            product: { ...mockProduct, status: "DRAFT" },
          },
        ],
      };
      prisma.cart.findUnique.mockResolvedValue(cart);
      prisma.address.findFirst.mockResolvedValue(mockAddress);

      await expect(
        service.createOrder(mockBuyerId, { addressId: mockAddressId }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if insufficient stock (atomic guard)", async () => {
      const cart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 20,
          },
        ],
      };
      prisma.cart.findUnique.mockResolvedValue(cart);
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue({
              ...mockOrder,
              items: [{ id: "item-1" }],
              shippingAddress: mockAddress,
              seller: { id: mockSellerId, name: "Test Seller" },
            }),
          },
          product: {
            updateMany: jest.fn().mockResolvedValue({ count: 0 }), // stock guard failed
          },
          cartItem: { deleteMany: jest.fn() },
        };
        return fn(tx);
      });

      await expect(
        service.createOrder(mockBuyerId, { addressId: mockAddressId }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should check variant stock atomically when variantId is present", async () => {
      const cart = {
        ...mockCart,
        items: [
          {
            productId: mockProductId,
            variantId: "variant-123",
            quantity: 5,
            product: mockProduct,
            variant: { stock: 3 },
          },
        ],
      };
      prisma.cart.findUnique.mockResolvedValue(cart);
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue({
              ...mockOrder,
              items: [{ id: "item-1" }],
              shippingAddress: mockAddress,
              seller: { id: mockSellerId, name: "Test Seller" },
            }),
          },
          productVariant: {
            updateMany: jest.fn().mockResolvedValue({ count: 0 }), // stock guard failed
          },
          cartItem: { deleteMany: jest.fn() },
        };
        return fn(tx);
      });

      await expect(
        service.createOrder(mockBuyerId, { addressId: mockAddressId }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getMyOrders", () => {
    it("should return paginated buyer orders", async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(1);

      const result = await service.getMyOrders(mockBuyerId, 1, 20);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe("getSellerOrders", () => {
    it("should return paginated seller orders", async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(1);

      const result = await service.getSellerOrders(mockSellerId, 1, 20);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("getOrder", () => {
    it("should return order detail for buyer", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        buyer: { id: mockBuyerId, name: "Buyer" },
        seller: { id: mockSellerId, name: "Seller" },
        shippingAddress: mockAddress,
        payment: null,
        cargoTracking: null,
      });

      const result = await service.getOrder(mockBuyerId, mockOrderId);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(mockOrderId);
    });

    it("should return order detail for seller", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        buyer: { id: mockBuyerId, name: "Buyer" },
        seller: { id: mockSellerId, name: "Seller" },
        shippingAddress: mockAddress,
        payment: null,
        cargoTracking: null,
      });

      const result = await service.getOrder(mockSellerId, mockOrderId);

      expect(result.success).toBe(true);
    });

    it("should throw if order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getOrder(mockBuyerId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if not authorized", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        buyer: { id: mockBuyerId },
        seller: { id: mockSellerId },
        shippingAddress: mockAddress,
        payment: null,
        cargoTracking: null,
      });

      await expect(
        service.getOrder("unauthorized-user", mockOrderId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("updateStatus", () => {
    it("should update status with valid transition", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PAYMENT_CONFIRMED",
        version: 0,
      });
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: "PROCESSING",
        version: 1,
      });

      const result = await service.updateStatus(mockSellerId, mockOrderId, {
        status: "PROCESSING",
        version: 0,
      });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe("PROCESSING");
    });

    it("should throw on version conflict", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PAYMENT_CONFIRMED",
        version: 1,
      });

      await expect(
        service.updateStatus(mockSellerId, mockOrderId, {
          status: "PROCESSING",
          version: 0, // stale version
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw on invalid status transition", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PENDING_PAYMENT",
        version: 0,
      });

      await expect(
        service.updateStatus(mockSellerId, mockOrderId, {
          status: "DELIVERED", // skip intermediate states
          version: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if not seller's order", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        sellerId: "other-seller",
        version: 0,
      });

      await expect(
        service.updateStatus(mockSellerId, mockOrderId, {
          status: "PROCESSING",
          version: 0,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw if order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(mockSellerId, "nonexistent", {
          status: "PROCESSING",
          version: 0,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("cancelOrder", () => {
    it("should cancel order and restore stock (buyer)", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PENDING_PAYMENT",
        items: [
          { productId: mockProductId, variantId: null, quantity: 2 },
        ],
      });
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          product: { update: jest.fn() },
          order: {
            update: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: "CANCELLED",
            }),
          },
        };
        return fn(tx);
      });

      const result = await service.cancelOrder(mockBuyerId, mockOrderId, {
        reason: "Changed my mind",
      }, "CLIENT");

      expect(result.success).toBe(true);
      expect(result.data.status).toBe("CANCELLED");
    });

    it("should cancel order and restore variant stock", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PAYMENT_SUBMITTED",
        items: [
          { productId: mockProductId, variantId: "variant-123", quantity: 1 },
        ],
      });
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          productVariant: { update: jest.fn() },
          order: {
            update: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: "CANCELLED",
            }),
          },
        };
        return fn(tx);
      });

      const result = await service.cancelOrder(mockBuyerId, mockOrderId, {}, "CLIENT");

      expect(result.success).toBe(true);
    });

    it("should allow admin to cancel", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        buyerId: "other-buyer",
        status: "PENDING_PAYMENT",
        items: [],
      });
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          product: { update: jest.fn() },
          order: {
            update: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: "CANCELLED",
            }),
          },
        };
        return fn(tx);
      });

      const result = await service.cancelOrder("admin-123", mockOrderId, {}, "ADMIN");

      expect(result.success).toBe(true);
    });

    it("should throw if order not in cancellable status", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PROCESSING",
        items: [],
      });

      await expect(
        service.cancelOrder(mockBuyerId, mockOrderId, {}, "CLIENT"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if not buyer or admin", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: "PENDING_PAYMENT",
        items: [],
      });

      await expect(
        service.cancelOrder("random-user", mockOrderId, {}, "CLIENT"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw if order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelOrder(mockBuyerId, "nonexistent", {}, "CLIENT"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getAllOrders", () => {
    it("should return all orders for admin", async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(1);

      const result = await service.getAllOrders(1, 20);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it("should filter by status", async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      const result = await service.getAllOrders(1, 20, "DELIVERED");

      expect(result.success).toBe(true);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "DELIVERED" },
        }),
      );
    });
  });
});
