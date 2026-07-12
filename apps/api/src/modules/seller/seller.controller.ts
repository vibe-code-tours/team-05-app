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
import { SellerService } from "./seller.service";
import { RegisterSellerDto, ApproveSellerDto } from "./dto/seller.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Sellers")
@Controller("sellers")
export class SellerController {
  constructor(private sellerService: SellerService) {}

  // ─── Client → Seller Application ─────────────────────

  @Post("apply")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("CLIENT")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Apply to become a seller (CLIENT only)" })
  registerAsSeller(
    @CurrentUser() user: { id: string },
    @Body() dto: RegisterSellerDto,
  ) {
    return this.sellerService.registerAsSeller(user.id, dto);
  }

  // ─── Admin: Manage Sellers ───────────────────────────

  @Get("pending")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List pending seller applications (admin only)" })
  getPendingSellers() {
    return this.sellerService.getPendingSellers();
  }

  @Get("all")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all sellers (admin only)" })
  getAllSellers() {
    return this.sellerService.getAllSellers();
  }

  @Put(":id/approve")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Approve or reject seller (admin only)" })
  approveOrReject(
    @Param("id") userId: string,
    @Body() dto: ApproveSellerDto,
  ) {
    return this.sellerService.approveOrReject(userId, dto);
  }

  // ─── Public ──────────────────────────────────────────

  @Get(":id")
  @ApiOperation({ summary: "Get seller public profile" })
  getSellerProfile(@Param("id") sellerId: string) {
    return this.sellerService.getSellerProfile(sellerId);
  }
}
