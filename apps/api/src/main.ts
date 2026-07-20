import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import type { IncomingMessage, ServerResponse } from "http";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log"] });

  // Security
  app.use(helmet());

  // CORS - use function to properly validate origins
  const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ];

  // Reject wildcard CORS origins for security
  if (allowedOrigins.includes("*")) {
    throw new Error("CORS_ORIGINS must not contain wildcard '*' - list explicit origins");
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check exact match first
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check Vercel preview deployments pattern
      if (origin.match(/^https:\/\/.*-.*\.vercel\.app$/)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
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

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

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
  httpAdapter.get("/", (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "ok", service: "crossmart-api" }));
  });
  httpAdapter.get("/health", (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "ok", service: "crossmart-api" }));
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
