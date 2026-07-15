import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";

const CART_EXPIRY_MINUTES = 30;
const MIN_ORDER_AMOUNT = 5000;
const MAX_ORDER_AMOUNT = 10_000_000;

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Check if cart has expired (30 min inactivity).
   * If expired, clear all items and refresh lastActivityAt.
   */
  private async handleCartExpiration(cartId: string, lastActivityAt: Date): Promise<boolean> {
    const now = new Date();
    const diffMs = now.getTime() - lastActivityAt.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes > CART_EXPIRY_MINUTES) {
      await this.prisma.cartItem.deleteMany({ where: { cartId } });
      await this.prisma.cart.update({
        where: { id: cartId },
        data: { lastActivityAt: now },
      });
      return true; // cart was expired
    }
    return false;
  }

  /**
   * Touch the cart's lastActivityAt timestamp.
   */
  private async touchCart(cartId: string): Promise<void> {
    await this.prisma.cart.update({
      where: { id: cartId },
      data: { lastActivityAt: new Date() },
    });
  }

  async getCart(userId: string) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      return {
        success: true,
        data: {
          id: null,
          userId,
          items: [],
          subtotal: 0,
          itemCount: 0,
          hasOutOfStockItems: false,
          expired: false,
        },
      };
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                stock: true,
                status: true,
                images: { take: 1, orderBy: { order: "asc" } },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  stock: true,
                  status: true,
                  images: { take: 1, orderBy: { order: "asc" } },
                },
              },
              variant: true,
            },
          },
        },
      });
      return {
        success: true,
        data: {
          ...cart,
          items: [],
          subtotal: 0,
          itemCount: 0,
          hasOutOfStockItems: false,
          expired: false,
        },
      };
    }

    // Check cart expiration
    const expired = await this.handleCartExpiration(cart.id, cart.lastActivityAt);

    if (expired) {
      return {
        success: true,
        data: {
          ...cart,
          items: [],
          subtotal: 0,
          itemCount: 0,
          hasOutOfStockItems: false,
          expired: true,
        },
      };
    }

    // Calculate totals and flag out-of-stock items
    const items = cart.items.map((item) => {
      const price = item.variant?.price || item.product.price;
      const itemTotal = Number(price) * item.quantity;
      const availableStock = item.variant ? item.variant.stock : item.product.stock;
      const isOutOfStock = item.product.status !== "APPROVED" || availableStock < item.quantity;

      return {
        ...item,
        itemTotal,
        isOutOfStock,
        availableStock,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const hasOutOfStockItems = items.some((item) => item.isOutOfStock);

    return {
      success: true,
      data: {
        ...cart,
        items,
        subtotal,
        itemCount,
        hasOutOfStockItems,
        expired: false,
      },
    };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    // Verify product exists and is available
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (product.status !== "APPROVED") {
      throw new BadRequestException("Product is not available");
    }

    // Check stock (use variant stock if variantId provided)
    let availableStock = product.stock;
    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.variantId },
      });

      if (!variant || variant.productId !== dto.productId) {
        throw new NotFoundException("Product variant not found");
      }

      availableStock = variant.stock;
    }

    if (availableStock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${availableStock}`,
      );
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // Check if cart has expired
    await this.handleCartExpiration(cart.id, cart.lastActivityAt);

    // Check if item already in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId || null,
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + dto.quantity;
      if (newQty > availableStock) {
        throw new BadRequestException(
          `Cannot add more. Stock: ${availableStock}, in cart: ${existingItem.quantity}`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });
    }

    // Touch cart to reset expiration timer
    await this.touchCart(cart.id);

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    // Check cart expiration
    await this.handleCartExpiration(cart.id, cart.lastActivityAt);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true, variant: true },
    });

    if (!item) {
      throw new NotFoundException("Cart item not found");
    }

    // Check stock
    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (dto.quantity > availableStock) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${availableStock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    // Touch cart to reset expiration timer
    await this.touchCart(cart.id);

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException("Cart item not found");
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    // Touch cart to reset expiration timer
    await this.touchCart(cart.id);

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    if (!this.prisma.dbConnected) {
      this.logger.warn("Database not connected, returning empty results");
      throw new ServiceUnavailableException("Database not available");
    }

    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Touch cart to reset expiration timer
    await this.touchCart(cart.id);

    return { success: true, message: "Cart cleared" };
  }
}
