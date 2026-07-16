import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { envValidationSchema } from "./config/env.validation";
import { PrismaModule } from "./config/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { ProductModule } from "./modules/product/product.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { SellerModule } from "./modules/seller/seller.module";
import { CartModule } from "./modules/cart/cart.module";
import { OrderModule } from "./modules/order/order.module";
import { CargoModule } from "./modules/cargo/cargo.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { ReviewModule } from "./modules/review/review.module";
import { SearchModule } from "./modules/search/search.module";
import { BannerModule } from "./modules/banner/banner.module";
import { CouponModule } from "./modules/coupon/coupon.module";
import { AdminModule } from "./modules/admin/admin.module";
import { HealthController } from "./config/health.controller";
import { DataIsolationMiddleware } from "./common/middleware/data-isolation.middleware";

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true, // Fail on first error
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UserModule,
    ProductModule,
    CatalogModule,
    SellerModule,
    CartModule,
    OrderModule,
    CargoModule,
    PaymentModule,
    NotificationModule,
    ReviewModule,
    SearchModule,
    BannerModule,
    CouponModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply data isolation middleware to all routes except auth
    consumer
      .apply(DataIsolationMiddleware)
      .exclude('auth/(.*)') // Exclude auth routes
      .forRoutes('*');
  }
}
