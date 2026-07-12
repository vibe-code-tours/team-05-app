import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
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
    }

    // Calculate totals
    const items = cart.items.map((item) => {
      const price = item.variant?.price || item.product.price;
      const itemTotal = Number(price) * item.quantity;
      return {
        ...item,
        itemTotal,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      success: true,
      data: {
        ...cart,
        items,
        subtotal,
        itemCount,
      },
    };
  }

  async addItem(userId: string, dto: AddToCartDto) {
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

    if (product.stock < dto.quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

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
      if (newQty > product.stock) {
        throw new BadRequestException(`Cannot add more. Stock: ${product.stock}, in cart: ${existingItem.quantity}`);
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

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException("Cart item not found");
    }

    if (dto.quantity > item.product.stock) {
      throw new BadRequestException(`Insufficient stock. Available: ${item.product.stock}`);
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
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

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { success: true, message: "Cart cleared" };
  }
}
