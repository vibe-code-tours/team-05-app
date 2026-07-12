import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log"] });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "https://*.vercel.app",
    ],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("api/v1");

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("CrossMart API")
    .setDescription("CrossMart E-Commerce Marketplace API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  // Root + /health handlers for Render health checks (outside /api/v1 prefix)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get("/", (req: any, res: any) => {
    res.json({ status: "ok", service: "crossmart-api" });
  });
  httpAdapter.get("/health", (req: any, res: any) => {
    res.json({ status: "ok", service: "crossmart-api" });
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 CrossMart API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error("❌ Fatal error during startup:", err);
  process.exit(1);
});
