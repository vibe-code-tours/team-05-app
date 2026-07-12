import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CartService } from "./cart.service";
import { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Cart")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("cart")
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get current user's cart" })
  getCart(@CurrentUser() user: { id: string }) {
    return this.cartService.getCart(user.id);
  }

  @Post("items")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add item to cart" })
  addItem(
    @CurrentUser() user: { id: string },
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(user.id, dto);
  }

  @Put("items/:id")
  @ApiOperation({ summary: "Update cart item quantity" })
  updateItem(
    @CurrentUser() user: { id: string },
    @Param("id") itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, dto);
  }

  @Delete("items/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove item from cart" })
  removeItem(
    @CurrentUser() user: { id: string },
    @Param("id") itemId: string,
  ) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Clear entire cart" })
  clearCart(@CurrentUser() user: { id: string }) {
    return this.cartService.clearCart(user.id);
  }
}
