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
import { Throttle } from "@nestjs/throttler";
import { CargoService } from "./cargo.service";
import {
  CreateCargoTrackingDto,
  UpdateMilestoneDto,
  AdminForceMilestoneDto,
} from "./dto/cargo.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Cargo Tracking")
@Controller("cargo")
export class CargoController {
  constructor(private cargoService: CargoService) {}

  // ─── Seller ──────────────────────────────────────────

  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create cargo tracking (seller only)" })
  createTracking(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCargoTrackingDto,
  ) {
    return this.cargoService.createTracking(user.id, dto);
  }

  @Put(":id/milestone")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update milestone (seller, sequential only)" })
  updateMilestone(
    @CurrentUser() user: { id: string },
    @Param("id") trackingId: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    return this.cargoService.updateMilestone(user.id, trackingId, dto);
  }

  // ─── Admin ───────────────────────────────────────────

  @Put(":id/milestone/admin")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Force milestone update (admin, skips validation)" })
  adminForceMilestone(
    @CurrentUser() user: { id: string },
    @Param("id") trackingId: string,
    @Body() dto: AdminForceMilestoneDto,
  ) {
    return this.cargoService.adminForceMilestone(user.id, trackingId, dto);
  }

  @Get("admin")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all shipments (admin)" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "milestone", required: false })
  @ApiQuery({ name: "carrier", required: false })
  adminListShipments(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("milestone") milestone?: string,
    @Query("carrier") carrier?: string,
  ) {
    const take = Math.min(parseInt(limit) || 20, 100);
    return this.cargoService.adminListShipments(
      page ? parseInt(page) : 1,
      take,
      milestone,
      carrier,
    );
  }

  // ─── Buyer / Seller ──────────────────────────────────

  @Get("order/:orderId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get tracking for an order" })
  getTracking(
    @CurrentUser() user: { id: string },
    @Param("orderId") orderId: string,
  ) {
    return this.cargoService.getTracking(user.id, orderId);
  }

  // ─── Public ──────────────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get("track/:trackingNumber")
  @ApiOperation({ summary: "Track by tracking number (public)" })
  getByTrackingNumber(@Param("trackingNumber") trackingNumber: string) {
    return this.cargoService.getByTrackingNumber(trackingNumber);
  }
}
