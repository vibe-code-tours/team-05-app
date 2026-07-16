import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "./prisma.service";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Health check" })
  async check() {
    const db = await this.prisma.$queryRaw`SELECT 1`.then(() => "ok").catch(() => "error");

    return {
      status: db === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        database: db,
      },
    };
  }

  @Public()
  @Get("live")
  @ApiOperation({ summary: "Liveness probe" })
  live() {
    return { status: "ok" };
  }
}
