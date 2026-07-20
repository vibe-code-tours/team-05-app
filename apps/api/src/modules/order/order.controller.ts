import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { OrderService } from "./order.service";
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto } from "./dto/order.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Orders")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("orders")
export class OrderController {
  constructor(private orderService: OrderService) {}

  // ─── Buyer ───────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create order(s) from cart (splits by seller)" })
  createOrder(
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(user.id, dto);
  }

  @Get("my")
  @ApiOperation({ summary: "Get buyer's orders" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getMyOrders(
    @CurrentUser() user: { id: string },
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const take = Math.min(parseInt(limit) || 20, 100);
    return this.orderService.getMyOrders(
      user.id,
      page ? parseInt(page) : 1,
      take,
    );
  }

  @Patch(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel order (buyer or admin)" })
  cancelOrder(
    @CurrentUser() user: { id: string; role: string },
    @Param("id") orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.orderService.cancelOrder(user.id, orderId, dto, user.role);
  }

  // ─── Seller ──────────────────────────────────────────

  @Get("seller")
  @UseGuards(RolesGuard)
  @Roles("SELLER")
  @ApiOperation({ summary: "Get seller's orders" })
  getSellerOrders(
    @CurrentUser() user: { id: string },
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const take = Math.min(parseInt(limit) || 20, 100);
    return this.orderService.getSellerOrders(
      user.id,
      page ? parseInt(page) : 1,
      take,
    );
  }

  @Put(":id/status")
  @UseGuards(RolesGuard)
  @Roles("SELLER")
  @ApiOperation({ summary: "Update order status (seller only, with optimistic locking)" })
  updateStatus(
    @CurrentUser() user: { id: string },
    @Param("id") orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(user.id, orderId, dto);
  }

  // ─── Admin ───────────────────────────────────────────

  @Get("admin")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all orders (admin only)" })
  getAllOrders(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    const validStatuses = Object.values(OrderStatus);
    const orderStatus = status && validStatuses.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : undefined;
    const take = Math.min(parseInt(limit) || 20, 100);
    return this.orderService.getAllOrders(
      page ? parseInt(page) : 1,
      take,
      orderStatus,
    );
  }

  // ─── Detail ──────────────────────────────────────────

  @Get(":id")
  @ApiOperation({ summary: "Get order detail" })
  getOrder(
    @CurrentUser() user: { id: string },
    @Param("id") orderId: string,
  ) {
    return this.orderService.getOrder(user.id, orderId);
  }
}
