import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log("✅ Database connected");
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      console.log("⚠️  Starting without database — some features may be unavailable");
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
