import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private _dbConnected = false;

  get dbConnected(): boolean {
    return this._dbConnected;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this._dbConnected = true;
      console.log("✅ Database connected");
    } catch (error) {
      this._dbConnected = false;
      console.error("❌ Database connection failed:", error.message);
      console.log("⚠️  Starting without database — some features may be unavailable");
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Check if the database is reachable. Returns true if healthy.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      this._dbConnected = true;
      return true;
    } catch {
      this._dbConnected = false;
      return false;
    }
  }
}
