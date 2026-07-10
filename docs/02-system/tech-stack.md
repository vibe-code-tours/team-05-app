# Technology Stack

**Project:** Team-05 App  
**Version:** 1.0  
**Date:** 2026-07-10  
**Status:** Draft  

---

## 1. Stack Overview

The Team-05 App uses a TypeScript-first monorepo with a Next.js frontend, NestJS backend, PostgreSQL database, and supporting infrastructure services. All components are containerized with Docker and deployed via Coolify.

---

## 2. Frontend

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Next.js** | 15 | React meta-framework | App Router with server components, SSR/SSG, file-based routing, built-in optimization (images, fonts, scripts). Industry standard for production React apps. |
| **React** | 19 | UI library | Latest stable release with server components, actions, and improved rendering. Declarative, component-based architecture. |
| **TypeScript** | 5.x | Type safety | Catch errors at compile time, better IDE support, self-documenting interfaces. Used consistently across the entire stack. |
| **TailwindCSS** | 4.x | Utility-first CSS | Rapid UI development, consistent design system, small production bundle via purging. Eliminates custom CSS file management. |
| **shadcn/ui** | latest | Component library | Copies components into your project (no runtime dependency), built on Radix UI primitives, fully customizable with TailwindCSS. Avoids vendor lock-in. |
| **React Query / TanStack Query** | 5.x | Server state management | Caching, background refetching, optimistic updates, and pagination for API data. Reduces boilerplate for data-fetching logic. |
| **Zustand** | 5.x | Client state management | Lightweight, minimal boilerplate, no providers needed. Suitable for global UI state without Redux complexity. |
| **next-intl** | 4.x | Internationalization | Type-safe i18n for Next.js App Router with server component support. Enables multi-language content. |
| **next-themes** | latest | Theme management | Dark/light mode toggle with system preference detection. Minimal integration with Next.js. |

### 2.1 Frontend Build and Quality

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 9.x | Code linting with flat config |
| Prettier | 3.x | Code formatting |
| Storybook | 8.x | Component development and documentation |
| Playwright | latest | End-to-end testing |
| Vitest | 3.x | Unit and integration testing |

---

## 3. Backend

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **NestJS** | 11 | Node.js framework | Modular architecture, dependency injection, TypeScript native, decorators for routing/validation/guards. Scales well for modular monoliths. |
| **Prisma** | 6.x | ORM | Type-safe database access, auto-generated client from schema, built-in migrations, excellent TypeScript integration. Prevents SQL injection by design. |
| **PostgreSQL** | 16 | Primary database | ACID compliance, advanced indexing (GIN, GiST), JSON support, full-text search (fallback), proven reliability, rich ecosystem. |
| **Redis** | 7.x | Cache, sessions, queues | In-memory data store for caching, session storage, rate limiting, and as the backing store for BullMQ. Sub-millisecond latency. |
| **BullMQ** | 5.x | Job queue | Redis-backed job queue with support for delayed jobs, retries, rate limiting, priorities, and repeatable jobs. Native NestJS integration via `@nestjs/bullmq`. |
| **Socket.IO** | 4.x | Real-time communication | WebSocket abstraction with automatic fallback to long-polling, room/namespace support, reconnection handling. Used for push notifications. |
| **Meilisearch** | 1.x | Full-text search | Typo-tolerant, fast (<50ms queries), easy to set up, REST API, Synonyms, filters, and sorting. Lighter weight than Elasticsearch for this use case. |
| **Cloudflare R2** | - | Object storage | S3-compatible, zero egress fees, integrated with Cloudflare CDN. Stores uploaded files (images, documents). |
| **class-validator** | latest | Input validation | Decorator-based DTO validation. Integrates with NestJS pipes for automatic request validation. |
| **class-transformer** | latest | DTO transformation | Maps incoming JSON to typed DTOs, strips unknown properties, handles type conversion. |
| **@nestjs/swagger** | 8.x | API documentation | Auto-generates OpenAPI (Swagger) specification from NestJS decorators. Provides interactive API docs at `/docs`. |

### 3.1 Backend Authentication Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| `@nestjs/jwt` | 11.x | JWT token creation and verification |
| `@nestjs/passport` | 11.x | Authentication strategy framework |
| `passport-jwt` | latest | JWT strategy implementation |
| `bcrypt` | 5.x | Password hashing (cost factor >= 12) |
| `otplib` | 13.x | TOTP/HOTP OTP generation and verification |
| `helmet` | 8.x | Security headers middleware |
| `@nestjs/throttler` | 6.x | Rate limiting with Redis storage adapter |

### 3.2 Backend Testing

| Tool | Version | Purpose |
|------|---------|---------|
| Jest | 30.x | Unit and integration testing framework |
| supertest | 7.x | HTTP assertion library for API tests |
| testcontainers | 10.x | Spins up PostgreSQL, Redis in Docker for integration tests |

---

## 4. Infrastructure and DevOps

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Docker** | 27.x | Containerization | Consistent environments across development, staging, production. Single-image deploys. |
| **Docker Compose** | 3.x | Local development | Multi-service local environment (app, DB, Redis, Meilisearch) with a single `docker-compose.yml`. |
| **Coolify** | latest | Deployment platform | Self-hosted PaaS. Manages Docker deployments, SSL certificates, domain configuration, environment variables. Simpler than Kubernetes for a modular monolith. |
| **Cloudflare** | - | CDN, DNS, WAF, DDoS protection | Global edge network for static asset delivery, DNS management, Web Application Firewall, and DDoS mitigation. |
| **GitHub Actions** | - | CI/CD | Automated testing, linting, building, and deployment on push/PR. |

---

## 5. Version Summary

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | 20 LTS |
| Frontend | Next.js | 15 |
| Frontend | React | 19 |
| Frontend | TypeScript | 5.x |
| Frontend | TailwindCSS | 4.x |
| Frontend | shadcn/ui | latest |
| Backend | NestJS | 11 |
| Backend | Prisma | 6.x |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7.x |
| Queue | BullMQ | 5.x |
| Realtime | Socket.IO | 4.x |
| Search | Meilisearch | 1.x |
| Auth | bcrypt | 5.x |
| Auth | OTP | 13.x |
| Storage | Cloudflare R2 | S3-compatible |
| Container | Docker | 27.x |
| Platform | Coolify | latest |
| CDN/WAF | Cloudflare | latest |
| Testing | Jest | 30.x |
| Testing | Playwright | latest |

---

## 6. Decision Log

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| **Modular monolith over microservices** | Microservices, serverless | Simpler deployment, lower operational overhead, still allows future extraction if needed. Fits team size and project scale. |
| **NestJS over Express/Fastify** | Express, Fastify, tRPC | Built-in DI, modular architecture, Swagger integration, guards/pipes/interceptors, enterprise-grade patterns. |
| **Prisma over Drizzle/TypeORM** | Drizzle ORM, TypeORM, raw SQL | Best TypeScript DX, auto-generated client, schema-first migrations, strong community, prevents SQL injection. |
| **PostgreSQL over MySQL/MongoDB** | MySQL, MongoDB, CockroachDB | ACID, advanced types (JSON, arrays), full-text search fallback, extensions ecosystem, proven at scale. |
| **Redis over Memcached** | Memcached, in-memory | Supports multiple data structures, pub/sub, Lua scripting, persistence options, BullMQ requirement. |
| **Meilisearch over Elasticsearch** | Elasticsearch, Algolia, Typesense | Lightweight, fast setup, typo tolerance out of the box, self-hosted, lower resource usage than Elasticsearch. |
| **BullMQ over custom queue** | Bull (v3), RabbitMQ, AWS SQS | Active maintenance, Redis-backed, TypeScript support, delay/retry/priority features, NestJS integration. |
| **Cloudflare R2 over S3** | AWS S3, MinIO, Google Cloud Storage | Zero egress fees, S3-compatible API (easy migration), integrated with Cloudflare CDN and DNS. |
| **Coolify over Kubernetes** | Kubernetes, Railway, Render, Fly.io | Self-hosted PaaS with Docker, simpler than K8s, SSL/domain management built-in, good enough for monolith deployment. |
| **TailwindCSS + shadcn/ui over MUI** | Material UI, Chakra UI, Ant Design | No runtime CSS-in-JS overhead, fully customizable, copy-paste components, smaller bundle, no vendor lock-in. |
| **Socket.IO over raw WebSockets** | ws, Socket.IO, Pusher, Ably | Auto-reconnection, room/namespace support, long-polling fallback, mature ecosystem, NestJS gateway support. |

---

## 7. Package Dependencies (Key)

### 7.1 Frontend (`package.json` highlights)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "next-intl": "^4.0.0",
    "next-themes": "^0.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "tailwindcss": "^4.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0",
    "@playwright/test": "^1.50.0",
    "vitest": "^3.0.0",
    "storybook": "^8.0.0"
  }
}
```

### 7.2 Backend (`package.json` highlights)

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/swagger": "^8.0.0",
    "@nestjs/throttler": "^6.0.0",
    "@nestjs/platform-socket.io": "^11.0.0",
    "@prisma/client": "^6.0.0",
    "bullmq": "^5.0.0",
    "bcrypt": "^5.1.0",
    "otplib": "^13.0.0",
    "helmet": "^8.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "prisma": "^6.0.0",
    "jest": "^30.0.0",
    "@nestjs/testing": "^11.0.0",
    "supertest": "^7.0.0",
    "testcontainers": "^10.0.0"
  }
}
```

---

## 8. Environment Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/app?schema=public` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for JWT signing | (generate 64-char random string) |
| `JWT_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `R2_ACCOUNT_ID` | Cloudflare account ID | (from Cloudflare dashboard) |
| `R2_ACCESS_KEY_ID` | R2 access key | (from R2 API tokens) |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | (from R2 API tokens) |
| `R2_BUCKET_NAME` | R2 bucket name | `team05-uploads` |
| `R2_PUBLIC_URL` | Public URL for R2 files | `https://pub-xxx.r2.dev` |
| `MEILISEARCH_HOST` | Meilisearch server URL | `http://localhost:7700` |
| `MEILISEARCH_API_KEY` | Meilisearch master key | (set during Meilisearch init) |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `PORT` | Backend server port | `3001` |
