import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CouponService } from "./coupon.service";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
} from "./dto/coupon.dto";

@ApiTags("Coupons")
@Controller("coupons")
export class CouponController {
  constructor(private couponService: CouponService) {}

  // ── Public: Validate coupon ─────────────────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("validate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Validate a coupon code" })
  validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.couponService.validateCoupon(dto.code, dto.orderTotal);
  }

  // ── Admin Endpoints ─────────────────────────────────────────────────────

  @Get("admin")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin: Get all coupons" })
  adminGetAllCoupons(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.couponService.adminGetAllCoupons(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get("admin/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin: Get coupon by ID" })
  adminGetCouponById(@Param("id") id: string) {
    return this.couponService.adminGetCouponById(id);
  }

  @Post("admin")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Admin: Create coupon" })
  adminCreateCoupon(@Body() dto: CreateCouponDto) {
    return this.couponService.adminCreateCoupon(dto);
  }

  @Put("admin/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin: Update coupon" })
  adminUpdateCoupon(@Param("id") id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.adminUpdateCoupon(id, dto);
  }

  @Delete("admin/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin: Delete coupon" })
  adminDeleteCoupon(@Param("id") id: string) {
    return this.couponService.adminDeleteCoupon(id);
  }

  @Post("admin/increment-usage")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin: Increment coupon usage" })
  adminIncrementUsage(@Body("code") code: string) {
    return this.couponService.adminIncrementUsage(code);
  }
}
