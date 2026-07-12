import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/order.dto";
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
  @ApiOperation({ summary: "Create order from cart (checkout)" })
  createOrder(
    @CurrentUser() user: { id: string },
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
    return this.orderService.getMyOrders(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
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
    return this.orderService.getSellerOrders(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Put(":id/status")
  @UseGuards(RolesGuard)
  @Roles("SELLER")
  @ApiOperation({ summary: "Update order status (seller only)" })
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
    return this.orderService.getAllOrders(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
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
