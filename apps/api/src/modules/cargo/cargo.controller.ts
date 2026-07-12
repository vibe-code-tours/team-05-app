import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CargoService } from "./cargo.service";
import { CreateCargoTrackingDto, UpdateMilestoneDto } from "./dto/cargo.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Cargo Tracking")
@Controller("cargo")
export class CargoController {
  constructor(private cargoService: CargoService) {}

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
  @ApiOperation({ summary: "Update milestone (seller only)" })
  updateMilestone(
    @CurrentUser() user: { id: string },
    @Param("id") trackingId: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    return this.cargoService.updateMilestone(user.id, trackingId, dto);
  }

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

  @Get("track/:trackingNumber")
  @ApiOperation({ summary: "Track by tracking number (public)" })
  getByTrackingNumber(@Param("trackingNumber") trackingNumber: string) {
    return this.cargoService.getByTrackingNumber(trackingNumber);
  }
}
