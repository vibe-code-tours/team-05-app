# System Architecture

**Project:** Team-05 App  
**Version:** 1.0  
**Date:** 2026-07-10  
**Status:** Draft  

---

## 1. Architecture Principles

| Principle | Description |
|-----------|-------------|
| Modular Monolith | Single deployable unit with clearly separated internal modules. |
| Clean Architecture | Dependencies point inward: controllers -> services -> domain -> repository interfaces. |
| SOLID Principles | Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion. |
| Domain-Driven Design | Code is organized around business domains and bounded contexts. |
| Feature-First Structure | Directory structure groups code by feature/module, not by technical layer. |

---

## 2. High-Level Architecture Diagram

```
                                    +-----------------+
                                    |    Cloudflare   |
                                    |   (CDN/WAF/DNS) |
                                    +--------+--------+
                                             |
                                             v
                                 +-----------+-----------+
                                 |   Coolify (Docker)    |
                                 |  Reverse Proxy/TLS    |
                                 +-----------+-----------+
                                             |
                    +------------------------+------------------------+
                    |                                                 |
                    v                                                 v
        +-----------+-----------+                   +-----------------+
        |     Next.js (Frontend)|                   | NestJS (Backend) |
        |     App Router SSR    |  <-- REST/WS -->  |  Modular API     |
        +-----------------------+                   +--------+--------+
                                                              |
                                            +-----------------+-----------------+
                                            |                 |                 |
                                            v                 v                 v
                                   +--------+------+  +------+-------+  +------+-------+
                                   |   PostgreSQL   |  |    Redis    |  |  Meilisearch  |
                                   |  (Primary DB)  |  |  (Cache/    |  |  (Full-Text    |
                                   |  via Prisma    |  |   Queue/    |  |   Search)      |
                                   +----------------+  |   Sessions) |  +---------------+
                                                      +------+-------+
                                                             |
                                                             v
                                                      +------+-------+
                                                      |   BullMQ     |
                                                      |  (Background |
                                                      |   Workers)   |
                                                      +------+-------+
                                                             |
                                                             v
                                                      +------+-------+
                                                      | Cloudflare R2|
                                                      | (Object      |
                                                      |  Storage)    |
                                                      +--------------+
```

---

## 3. Module Structure

The backend is a modular monolith organized by bounded context. Each module encapsulates its own controllers, services, repositories, DTOs, and domain entities.

### 3.1 Module Dependency Map

```
src/
  modules/
    auth/                  # REQ-1 to REQ-5
      auth.controller.ts
      auth.service.ts
      auth.module.ts
      strategies/          # JWT, OTP strategies
      guards/              # RBAC guard, JWT guard
      dto/
    
    user/                  # REQ-6 to REQ-9
      user.controller.ts
      user.service.ts
      user.module.ts
      repository/          # Prisma user repository
      dto/
      entities/
    
    content/               # REQ-10 to REQ-12
      content.controller.ts
      content.service.ts
      content.module.ts
      repository/
      dto/
      entities/
    
    file/                  # REQ-11
      file.controller.ts
      file.service.ts
      file.module.ts
      storage/             # Cloudflare R2 adapter
    
    search/                # REQ-13 to REQ-14
      search.controller.ts
      search.service.ts
      search.module.ts
      indexer/             # Meilisearch sync logic
    
    notification/          # REQ-15 to REQ-16
      notification.controller.ts
      notification.service.ts
      notification.module.ts
      gateway/             # Socket.IO gateway
      events/
    
    queue/                 # REQ-17 to REQ-18
      queue.module.ts
      processors/          # Job processors
      producers/           # Job producers
    
    admin/                 # REQ-19
      admin.controller.ts
      admin.service.ts
      admin.module.ts
```

### 3.2 Bounded Contexts

| Bounded Context | Domain | Aggregates | External Dependencies |
|-----------------|--------|------------|----------------------|
| **Identity & Access** | Authentication, authorization, user identity | `User`, `Session`, `Token` | Redis (token blacklist) |
| **Content** | Domain entity CRUD, business logic | `Content`, `Version` | PostgreSQL, Meilisearch |
| **Media** | File upload, storage, retrieval | `File`, `UploadRecord` | Cloudflare R2 |
| **Notification** | Real-time events, push messages | `Notification`, `Event` | Redis (pub/sub), Socket.IO |
| **Search** | Indexing, querying, ranking | `Index`, `SearchResult` | Meilisearch |
| **Queue** | Async job processing | `Job`, `JobAttempt` | Redis (BullMQ) |

---

## 4. Layered Architecture (Per Module)

Each module follows a consistent internal layering:

```
+-----------------------------------------------------+
|  Presentation Layer (Controllers)                    |
|  - HTTP request/response handling                   |
|  - Input validation (class-validator)               |
|  - Serialization / DTOs                              |
+-----------------------------------------------------+
         |
         v
+-----------------------------------------------------+
|  Application Layer (Services)                        |
|  - Use case orchestration                            |
|  - Business rule enforcement                         |
|  - Transaction management                            |
+-----------------------------------------------------+
         |
         v
+-----------------------------------------------------+
|  Domain Layer (Entities / Value Objects)             |
|  - Core business types and interfaces                |
|  - Repository interfaces (ports)                     |
|  - Domain events                                     |
+-----------------------------------------------------+
         |
         v
+-----------------------------------------------------+
|  Infrastructure Layer (Repositories / Adapters)      |
|  - Prisma database access                            |
|  - Redis cache operations                            |
|  - External API clients (R2, Meilisearch)           |
+-----------------------------------------------------+
```

---

## 5. API Design Standards

### 5.1 RESTful Conventions

| Method | Path | Description | Status Codes |
|--------|------|-------------|--------------|
| `GET` | `/api/v1/{resource}` | List resources | 200, 500 |
| `GET` | `/api/v1/{resource}/:id` | Get single resource | 200, 404, 500 |
| `POST` | `/api/v1/{resource}` | Create resource | 201, 400, 401, 500 |
| `PATCH` | `/api/v1/{resource}/:id` | Partial update | 200, 400, 404, 409, 500 |
| `DELETE` | `/api/v1/{resource}/:id` | Delete resource | 204, 404, 500 |

### 5.2 Standard Response Envelope

```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "cursor": "eyJpZCI6MTB9"
  },
  "error": null
}
```

### 5.3 Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "must be a valid email address" }
    ]
  }
}
```

### 5.4 API Versioning

- URL-based: `/api/v1/...`
- Breaking changes require a new version (`v2`).
- Deprecated versions receive a `Sunset` header with a removal date.

### 5.5 Authentication Headers

```
Authorization: Bearer <access_token>
X-Request-ID: <uuid>       # Correlation ID for tracing
```

---

## 6. Data Flow Diagrams

### 6.1 Authentication Flow

```
Client                Backend               Redis              PostgreSQL
  |                     |                     |                    |
  |-- POST /auth/login ->|                     |                    |
  |                     |-- hash password ---->|                    |
  |                     |<-- hash match -------|                    |
  |                     |-- SET token (TTL) -->|                    |
  |                     |                      |-- INSERT session ->|
  |<-- 200 {tokens} ----|                      |                    |
  |                     |                      |                    |
  |-- GET /protected --->|                     |                    |
  |                     |-- GET token -------->|                    |
  |                     |<-- valid ------------|                    |
  |                     |-- check role ------->|                    |
  |<-- 200 {data} ------|                      |                    |
```

### 6.2 File Upload Flow

```
Client                Backend               Cloudflare R2         PostgreSQL
  |                     |                      |                    |
  |-- POST /files ----->|                      |                    |
  |                     |-- generate presigned->                    |
  |<-- {uploadUrl} -----|   URL                |                    |
  |                     |                      |                    |
  |-- PUT {uploadUrl} ----------------------->|                    |
  |<-- 200 OK ---------------------------------|                    |
  |                     |                      |                    |
  |-- POST /files/confirm ->|                  |                    |
  |                     |-- INSERT record ----------------------->|
  |<-- 201 {fileMeta} --|                      |                    |
```

### 6.3 Real-Time Notification Flow

```
User A             Backend            Redis Pub/Sub        Socket.IO         User B
  |                  |                    |                   |                |
  |-- emit event --->|                    |                   |                |
  |                  |-- PUBLISH -------->|                   |                |
  |                  |                    |-- SUBSCRIBE ----->|                |
  |                  |                    |                   |-- emit ------->|
  |                  |                    |                   |<-- ack --------|
```

---

## 7. Database Schema Overview

### 7.1 Core Entities (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  avatar    String?
  version   Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions    Session[]
  contents    Content[]
  files       File[]
  notifications Notification[]
}

enum Role {
  ADMIN
  MODERATOR
  USER
}

model Content {
  id        String   @id @default(cuid())
  title     String
  body      String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  version   Int      @default(0)
  status    ContentStatus @default(DRAFT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
  @@index([status])
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model File {
  id          String   @id @default(cuid())
  key         String   @unique
  filename    String
  mimeType    String
  size        Int
  uploader    User     @relation(fields: [uploaderId], references: [id])
  uploaderId  String
  createdAt   DateTime @default(now())

  @@index([uploaderId])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  userAgent    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

---

## 8. Caching Strategy

| Layer | What is Cached | Strategy | TTL |
|-------|---------------|----------|-----|
| API Response | GET /resource and GET /resource/:id | Cache-aside | 5 minutes |
| User Session | Auth token validation | Write-through | 15 minutes |
| Search Results | Meilisearch query results | Cache-aside | 2 minutes |
| Rate Limiter | Request counts per IP | Write-through | 1 minute sliding window |
| Token Blacklist | Revoked JWTs | Write-through | Token TTL (15 min) |

---

## 9. Scalability Checklist

- [ ] Stateless application servers (no in-memory session)
- [ ] Database connection pooling (Prisma connection pool or PgBouncer)
- [ ] Redis used for caching, sessions, rate limiting, and queues
- [ ] Horizontal scaling: add instances behind Coolify reverse proxy
- [ ] CDN (Cloudflare) for static assets and edge caching
- [ ] Background workers scale independently (BullMQ)
- [ ] Database read replicas (if read-heavy pattern emerges)
- [ ] Search index (Meilisearch) runs as a separate service
- [ ] File storage offloaded to Cloudflare R2 (no local disk)
- [ ] Monitoring and alerting for resource utilization thresholds

---

## 10. Deployment Architecture

```
                    +-----------------+
                    |    Cloudflare   |
                    | (DNS, CDN, WAF) |
                    +--------+--------+
                             |
                             v
                    +--------+--------+
                    |     Coolify     |
                    | (Docker Host)   |
                    +--------+--------+
                             |
              +--------------+--------------+
              |              |              |
              v              v              v
      +-------+-------+ +--+--------+ +---+--------+
      |  Next.js App   | | NestJS    | | Workers    |
      |  (SSR/SSG)     | | API Server| | (BullMQ)   |
      |  Port: 3000    | | Port: 3001| | Port: 3002 |
      +-------+-------+ +--+--------+ +---+--------+
              |              |              |
              v              v              v
      +-------+-------+ +--+--------+ +---+--------+
      | PostgreSQL     | | Redis     | | Meilisearch|
      | Port: 5432     | | Port: 6379| | Port: 7700 |
      +----------------+ +-----------+ +------------+
```

| Service | Port | Docker Image | Notes |
|---------|------|--------------|-------|
| Next.js Frontend | 3000 | `node:20-alpine` | SSR + static export |
| NestJS API | 3001 | `node:20-alpine` | REST + WebSocket |
| BullMQ Workers | 3002 | `node:20-alpine` | Separate process |
| PostgreSQL | 5432 | `postgres:16-alpine` | Primary database |
| Redis | 6379 | `redis:7-alpine` | Cache + queue + sessions |
| Meilisearch | 7700 | `getmeili/meilisearch:v1.x` | Full-text search |

---

## 11. Security Architecture

| Control | Implementation |
|---------|---------------|
| Transport | TLS 1.2+ via Cloudflare edge |
| Authentication | JWT (access + refresh tokens) with bcrypt password hashing |
| Authorization | RBAC guard applied to routes via `@Roles()` decorator |
| Input Validation | `class-validator` + `class-transformer` in DTOs |
| SQL Injection | Prisma ORM parameterized queries only |
| XSS | Content Security Policy headers, input sanitization |
| Rate Limiting | Redis-backed `@nestjs/throttler` per-IP and per-user |
| CORS | Restricted to configured origins |
| Secrets | Environment variables, never committed to VCS |

---

## 12. Monitoring and Observability

| Concern | Tool/Approach |
|---------|---------------|
| Application Logging | Structured JSON logs (pino/winston) |
| Error Tracking | Sentry or equivalent (Phase 2) |
| Metrics | Prometheus + Grafana (Phase 2) |
| Health Checks | `/health` (detailed) and `/health/live` (liveness probe) |
| Request Tracing | Correlation ID (`X-Request-ID`) propagated through all layers |
| Uptime | External monitoring (e.g., UptimeRobot, Betterstack) |
