import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { PrismaService } from "../../config/prisma.service";

describe("CartService", () => {
  let service: CartService;
  let prisma: Record<string, any>;

  const mockUserId = "user-123";
  const mockCartId = "cart-123";
  const mockProductId = "product-123";
  const mockItemId = "item-123";

  const mockProduct = {
    id: mockProductId,
    name: "Test Product",
    slug: "test-product",
    price: 15000,
    stock: 10,
    status: "APPROVED",
  };

  const mockCart = {
    id: mockCartId,
    userId: mockUserId,
    lastActivityAt: new Date(),
    updatedAt: new Date(),
    items: [],
  };

  beforeEach(async () => {
    prisma = {
    dbConnected: true,
      cart: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      cartItem: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
      productVariant: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getCart", () => {
    it("should create a new cart if none exists", async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      prisma.cart.create.mockResolvedValue({
        ...mockCart,
        items: [],
      });

      const result = await service.getCart(mockUserId);

      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { userId: mockUserId },
        include: expect.any(Object),
      });
      expect(result.success).toBe(true);
      expect(result.data.items).toEqual([]);
      expect(result.data.subtotal).toBe(0);
    });

    it("should return existing cart with calculated totals", async () => {
      const cartWithItems = {
        ...mockCart,
        items: [
          {
            id: mockItemId,
            quantity: 2,
            product: { ...mockProduct, images: [] },
            variant: null,
          },
        ],
      };
      prisma.cart.findUnique.mockResolvedValue(cartWithItems);

      const result = await service.getCart(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].itemTotal).toBe(30000); // 15000 * 2
      expect(result.data.subtotal).toBe(30000);
      expect(result.data.itemCount).toBe(2);
    });

    it("should flag out-of-stock items", async () => {
      const cartWithItems = {
        ...mockCart,
        items: [
          {
            id: mockItemId,
            quantity: 5,
            product: { ...mockProduct, stock: 3 }, // stock < quantity
            variant: null,
          },
        ],
      };
      prisma.cart.findUnique.mockResolvedValue(cartWithItems);

      const result = await service.getCart(mockUserId);

      expect(result.data.items[0].isOutOfStock).toBe(true);
      expect(result.data.hasOutOfStockItems).toBe(true);
    });

    it("should clear expired cart (30 min inactivity)", async () => {
      const expiredCart = {
        ...mockCart,
        lastActivityAt: new Date(Date.now() - 31 * 60 * 1000), // 31 min ago
        items: [{ id: "old-item" }],
      };
      prisma.cart.findUnique.mockResolvedValue(expiredCart);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.getCart(mockUserId);

      expect(result.data.expired).toBe(true);
      expect(result.data.items).toEqual([]);
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: mockCartId },
      });
    });
  });

  describe("addItem", () => {
    beforeEach(() => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.findFirst.mockResolvedValue(null);
      prisma.cartItem.create.mockResolvedValue({});
      prisma.cart.update.mockResolvedValue(mockCart);
    });

    it("should add a new item to cart", async () => {
      prisma.cart.findUnique
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce({ ...mockCart, items: [] });

      const result = await service.addItem(mockUserId, {
        productId: mockProductId,
        quantity: 1,
      });

      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: mockCartId,
          productId: mockProductId,
          variantId: undefined,
          quantity: 1,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should increment quantity if item already in cart", async () => {
      const existingItem = {
        id: mockItemId,
        quantity: 2,
        productId: mockProductId,
        variantId: null,
      };
      prisma.cartItem.findFirst.mockResolvedValue(existingItem);

      await service.addItem(mockUserId, {
        productId: mockProductId,
        quantity: 1,
      });

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: mockItemId },
        data: { quantity: 3 }, // 2 + 1
      });
    });

    it("should throw if product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addItem(mockUserId, {
          productId: "nonexistent",
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if product not approved", async () => {
      prisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        status: "DRAFT",
      });

      await expect(
        service.addItem(mockUserId, {
          productId: mockProductId,
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if insufficient stock", async () => {
      await expect(
        service.addItem(mockUserId, {
          productId: mockProductId,
          quantity: 20, // stock is only 10
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if adding more than available stock", async () => {
      const existingItem = {
        id: mockItemId,
        quantity: 8,
        productId: mockProductId,
        variantId: null,
      };
      prisma.cartItem.findFirst.mockResolvedValue(existingItem);

      await expect(
        service.addItem(mockUserId, {
          productId: mockProductId,
          quantity: 5, // 8 + 5 = 13 > 10 stock
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should use variant stock when variantId provided", async () => {
      const mockVariant = {
        id: "variant-123",
        productId: mockProductId,
        stock: 3,
        price: 20000,
      };
      prisma.productVariant.findUnique.mockResolvedValue(mockVariant);

      await expect(
        service.addItem(mockUserId, {
          productId: mockProductId,
          variantId: "variant-123",
          quantity: 5,
        }),
      ).rejects.toThrow(BadRequestException); // 5 > 3 stock
    });
  });

  describe("updateItem", () => {
    it("should update item quantity", async () => {
      const cartWithItem = {
        ...mockCart,
        lastActivityAt: new Date(),
      };
      const item = {
        id: mockItemId,
        cartId: mockCartId,
        product: { stock: 10 },
        variant: null,
      };
      prisma.cart.findUnique.mockResolvedValue(cartWithItem);
      prisma.cartItem.findFirst.mockResolvedValue(item);
      prisma.cartItem.update.mockResolvedValue({});

      const result = await service.updateItem(mockUserId, mockItemId, {
        quantity: 3,
      });

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: mockItemId },
        data: { quantity: 3 },
      });
      expect(result.success).toBe(true);
    });

    it("should throw if cart not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(
        service.updateItem(mockUserId, mockItemId, { quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if item not found in cart", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        service.updateItem(mockUserId, mockItemId, { quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if insufficient stock", async () => {
      const cartWithItem = {
        ...mockCart,
        lastActivityAt: new Date(),
      };
      const item = {
        id: mockItemId,
        cartId: mockCartId,
        product: { stock: 2 },
        variant: null,
      };
      prisma.cart.findUnique.mockResolvedValue(cartWithItem);
      prisma.cartItem.findFirst.mockResolvedValue(item);

      await expect(
        service.updateItem(mockUserId, mockItemId, { quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("removeItem", () => {
    it("should remove an item from cart", async () => {
      const cartWithItem = {
        ...mockCart,
        lastActivityAt: new Date(),
      };
      prisma.cart.findUnique.mockResolvedValue(cartWithItem);
      prisma.cartItem.findFirst.mockResolvedValue({ id: mockItemId });
      prisma.cartItem.delete.mockResolvedValue({});

      const result = await service.removeItem(mockUserId, mockItemId);

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: mockItemId },
      });
      expect(result.success).toBe(true);
    });

    it("should throw if cart not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(
        service.removeItem(mockUserId, mockItemId),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if item not in cart", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        service.removeItem(mockUserId, mockItemId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("clearCart", () => {
    it("should clear all items from cart", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.clearCart(mockUserId);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: mockCartId },
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe("Cart cleared");
    });

    it("should throw if cart not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(service.clearCart(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
