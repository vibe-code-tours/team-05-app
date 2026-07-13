import { Module } from "@nestjs/common";
import { CouponController } from "./coupon.controller";
import { CouponService } from "./coupon.service";

@Module({
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
