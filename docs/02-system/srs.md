# Software Requirements Specification (SRS)

**Project:** Team-05 App  
**Version:** 1.0  
**Date:** 2026-07-10  
**Status:** Draft  

---

## 1. Introduction

### 1.1 Purpose

This document defines the software requirements for the Team-05 App, a modular monolith platform built with Next.js and NestJS. It specifies both functional and non-functional requirements that the system must satisfy.

### 1.2 Scope

The system is a full-stack web application supporting user management, content delivery, real-time communication, and search capabilities. A mobile client (Phase 2) will extend the platform to iOS and Android.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| RBAC | Role-Based Access Control |
| OTP | One-Time Password |
| JWT | JSON Web Token |
| DDD | Domain-Driven Design |
| P95 | 95th Percentile |
| RTO | Recovery Time Objective |
| RPO | Recovery Point Objective |

---

## 2. Overall Description

### 2.1 Product Perspective

The Team-05 App is a modular monolith following clean architecture and SOLID principles. It uses a feature-first directory structure organized around domain-driven bounded contexts. The system is deployed via Docker on Coolify with Cloudflare as the CDN and edge layer.

### 2.2 User Classes

| Role | Description |
|------|-------------|
| Anonymous User | Unauthenticated visitor; can view public content |
| Registered User | Authenticated user with standard permissions |
| Moderator | Can manage content and moderate user-generated data |
| Administrator | Full system access including user and configuration management |

### 2.3 Operating Environment

- **Browser:** Modern evergreen browsers (Chrome, Firefox, Safari, Edge -- last 2 major versions)
- **Mobile (Phase 2):** iOS 15+, Android 10+
- **Runtime:** Node.js 20 LTS
- **Database:** PostgreSQL 16
- **Cache:** Redis 7

---

## 3. Functional Requirements

### 3.1 Authentication and Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-1 | The system shall authenticate users via email/password with bcrypt hashing. | P0 |
| REQ-2 | The system shall support OTP-based authentication (email or SMS) as a secondary factor. | P0 |
| REQ-3 | The system shall issue JWT access tokens (short-lived, 15 min) and refresh tokens (long-lived, 7 days). | P0 |
| REQ-4 | The system shall enforce RBAC with roles: `admin`, `moderator`, `user`. Permissions are checked on every protected route. | P0 |
| REQ-5 | The system shall revoke refresh tokens on logout and support token blacklisting via Redis. | P1 |

### 3.2 User Management

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-6 | The system shall allow user self-registration with email verification (OTP). | P0 |
| REQ-7 | The system shall allow users to update their profile (name, avatar, preferences). | P1 |
| REQ-8 | The system shall allow administrators to list, suspend, and delete user accounts. | P1 |
| REQ-9 | The system shall support password reset via time-limited OTP link sent to registered email. | P0 |

### 3.3 Content and Data Management

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-10 | The system shall support CRUD operations on domain entities with optimistic locking to prevent race conditions. | P0 |
| REQ-11 | The system shall store file uploads (images, documents) in Cloudflare R2 with presigned URL generation. | P0 |
| REQ-12 | The system shall paginate list endpoints using cursor-based pagination with configurable page sizes. | P1 |

### 3.4 Search

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-13 | The system shall index searchable content in Meilisearch with near-real-time synchronization (<5s lag). | P1 |
| REQ-14 | The system shall support full-text search with typo tolerance, filtering, and sorting. | P1 |

### 3.5 Real-Time Communication

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-15 | The system shall provide WebSocket connections via Socket.IO for real-time notifications. | P1 |
| REQ-16 | The system shall support room-based broadcast (e.g., per-user or per-channel feeds). | P2 |

### 3.6 Background Processing

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-17 | The system shall process asynchronous tasks (email sending, file processing, data sync) via BullMQ job queues backed by Redis. | P1 |
| REQ-18 | The system shall support delayed, retried, and prioritized jobs with configurable retry strategies. | P1 |

### 3.7 Administration

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-19 | The system shall provide an admin dashboard for user management, system health monitoring, and configuration. | P2 |
| REQ-20 | The system shall expose a `/health` endpoint returning database, cache, and queue status. | P1 |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-P1 | Page load time (LCP) shall be under 2 seconds on a 4G connection. | <2s |
| NFR-P2 | API response time at the 95th percentile shall be under 200 milliseconds. | <200ms (P95) |
| NFR-P3 | Database queries shall complete within 50ms at P95 for standard CRUD operations. | <50ms (P95) |
| NFR-P4 | Search queries via Meilisearch shall return results within 100ms at P95. | <100ms (P95) |
| NFR-P5 | The system shall serve static assets via Cloudflare CDN with a global TTFB under 100ms. | <100ms TTFB |

### 4.2 Security

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-S1 | All traffic shall be served over HTTPS (TLS 1.2+). | Enforced at Cloudflare edge |
| NFR-S2 | Passwords shall be hashed with bcrypt (cost factor >= 12). | Prisma schema + application layer |
| NFR-S3 | The system shall prevent SQL injection via Prisma ORM parameterized queries. | No raw SQL without parameterization |
| NFR-S4 | The system shall prevent XSS attacks via Content Security Policy headers and input sanitization. | Next.js + helmet middleware |
| NFR-S5 | Rate limiting shall be applied to authentication endpoints (max 10 attempts per minute per IP). | Redis-backed rate limiter |
| NFR-S6 | CORS shall be restricted to configured origins. | Application-level configuration |
| NFR-S7 | Secrets (API keys, database URLs) shall not be committed to version control. | `.env` excluded via `.gitignore` |

### 4.3 Scalability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-SC1 | The system shall support horizontal scaling by adding stateless application instances behind a load balancer. | Session state in Redis, not in-memory |
| NFR-SC2 | The database shall support connection pooling (PgBouncer or Prisma Accelerate). | Up to 100 concurrent connections |
| NFR-SC3 | Redis shall be used for session storage, caching, and rate limiting to reduce database load. | Cache-aside pattern for hot data |
| NFR-SC4 | Background job workers shall scale independently from web request handlers. | BullMQ distributed workers |

### 4.4 Reliability and Availability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-R1 | The system shall maintain 99.9% uptime (excluding planned maintenance). | ~8.76 hours downtime/year |
| NFR-R2 | Database backups shall run daily with point-in-time recovery capability. | RPO: 1 hour, RTO: 15 minutes |
| NFR-R3 | Failed background jobs shall be retried up to 3 times with exponential backoff. | BullMQ retry configuration |
| NFR-R4 | The system shall implement graceful shutdown: drain in-flight requests, close DB connections, exit cleanly. | NestJS lifecycle hooks |
| NFR-R5 | Health check endpoints shall report status of all dependencies (DB, Redis, queue, search). | `/health` and `/health/live` |

### 4.5 Maintainability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-M1 | The codebase shall follow modular monolith architecture with feature-first directory structure. | SOLID, DDD, clean architecture |
| NFR-M2 | All API endpoints shall have OpenAPI/Swagger documentation auto-generated from code. | `@nestjs/swagger` |
| NFR-M3 | The system shall have unit test coverage >= 80% for business logic. | Jest |
| NFR-M4 | The system shall have integration test coverage for all critical user flows. | Jest + test containers |
| NFR-M5 | Database migrations shall be version-controlled and idempotent. | Prisma Migrate |

### 4.6 Compatibility

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-C1 | The frontend shall be responsive and function on viewports from 320px to 2560px. | TailwindCSS responsive utilities |
| NFR-C2 | The API shall be versioned (e.g., `/api/v1/`) to support backward compatibility. | URL-based versioning |
| NFR-C3 | The mobile app (Phase 2) shall consume the same REST API as the web frontend. | React Native + Expo |

---

## 5. System Constraints

| Constraint | Description |
|------------|-------------|
| Technology | TypeScript across the entire stack (frontend, backend, mobile). |
| Architecture | Modular monolith; microservices only if clear scaling bottleneck is identified. |
| Deployment | Docker containers managed by Coolify; no Kubernetes requirement in Phase 1. |
| License | Open-source dependencies must use MIT, Apache 2.0, or BSD licenses. |

---

## 6. Acceptance Criteria Summary

| Feature | Acceptance Criteria |
|---------|---------------------|
| Authentication | User can register, log in via email/password, receive OTP, and log out with token revocation. |
| RBAC | Admin can promote/demote users; unauthorized users receive 403 on protected routes. |
| CRUD | Create, read, update, and delete operations work correctly with optimistic locking. |
| File Upload | Files are uploaded to R2; presigned URLs are returned; files are accessible via public URL. |
| Search | Indexed content is searchable within 5s of creation; results support typo tolerance. |
| Real-Time | WebSocket connections are established; users receive push notifications for relevant events. |
| Background Jobs | Async tasks are enqueued, processed, and retried on failure; status is queryable. |
| Health | `/health` returns 200 when all dependencies are healthy; returns 503 with details on failure. |

---

## 7. Appendices

### Appendix A: Requirement Traceability Matrix

| Requirement ID | Module | Test Coverage Target |
|----------------|--------|----------------------|
| REQ-1 to REQ-5 | Auth | Unit + Integration |
| REQ-6 to REQ-9 | User Management | Unit + Integration |
| REQ-10 to REQ-12 | Content / Data | Unit + Integration |
| REQ-13 to REQ-14 | Search | Integration |
| REQ-15 to REQ-16 | Real-Time | Integration + E2E |
| REQ-17 to REQ-18 | Background Jobs | Unit + Integration |
| REQ-19 to REQ-20 | Admin / Health | E2E |
| NFR-P1 to NFR-P5 | Performance | Load testing |
| NFR-S1 to NFR-S7 | Security | Security audit + automated scanning |

### Appendix B: Glossary

- **Bounded Context:** A logical boundary within which a particular domain model applies.
- **Optimistic Locking:** A concurrency control method using version fields to detect conflicting updates.
- **Cursor-Based Pagination:** A pagination technique using opaque cursors instead of offset/limit for stable, performant traversal.
