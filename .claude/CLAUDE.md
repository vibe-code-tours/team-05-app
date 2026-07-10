# CLAUDE.md — CrossMart AI Development Framework

> This is the single source of truth for every Claude Code session on this project.

---

## Project Identity

**Name:** CrossMart
**Tagline:** Myanmar's Most Trusted Cross-Border Marketplace
**Primary Market:** Myanmar (with cross-border from Thailand/Bangkok)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 15 (App Router) | Web application |
| UI Library | React 19 | Component rendering |
| Language | TypeScript (strict) | Type safety |
| Styling | TailwindCSS + shadcn/ui | Design system |
| Backend | NestJS | API server |
| ORM | Prisma | Database access |
| Database | PostgreSQL | Primary data store |
| Cache | Redis | Hot data caching |
| Queue | BullMQ | Async job processing |
| Storage | Cloudflare R2 | Object storage (images, files) |
| Auth | JWT + OTP | Authentication |
| Container | Docker & Docker Compose | Local dev + deployment |
| Deploy | Coolify | Self-hosted PaaS |
| CDN/DNS | Cloudflare | CDN, WAF, DNS |
| CI/CD | GitHub Actions | Continuous integration |
| Testing | Vitest + Jest + Playwright | Unit, integration, E2E |

---

## Architecture Principles

### Clean Architecture
- Separate business logic from infrastructure
- Domain layer has zero external dependencies
- Use cases orchestrate domain objects and infrastructure

### SOLID Principles
- **S**ingle Responsibility — one class, one job
- **O**pen/Closed — extend via interfaces, not modification
- **L**iskov Substitution — subtypes must be substitutable
- **I**nterface Segregation — small, focused interfaces
- **D**ependency Inversion — depend on abstractions, not concretions

### Domain-Driven Design
- Bounded contexts per feature module
- Aggregates enforce invariants
- Value objects for immutable concepts
- Domain events for cross-module communication

### Feature-First Structure
```
src/
├── modules/
│   ├── auth/
│   ├── product/
│   ├── order/
│   ├── cargo/
│   ├── payment/
│   └── ...
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── decorators/
├── config/
└── main.ts
```

---

## Rules

### NEVER
- ❌ Duplicate code — extract to shared utilities or modules
- ❌ Generate unnecessary abstraction — keep it simple
- ❌ Generate inline SQL — always use Prisma
- ❌ Commit secrets or `.env` — rotate immediately if leaked
- ❌ Push directly to `main` — always branch → PR → review → merge
- ❌ Self-merge PRs — require 1 approval from a teammate
- ❌ Use `any` type — define proper types
- ❌ Put business logic in controllers — use services
- ❌ Skip input validation — every endpoint must validate
- ❌ Ignore error handling — every async call needs error boundaries
- ❌ Hardcode configuration — use environment variables

### ALWAYS
- ✅ Use Prisma for all database operations
- ✅ Create DTOs for every API endpoint
- ✅ Validate all input with class-validator / Zod
- ✅ Write unit tests for services
- ✅ Use repository pattern for data access
- ✅ Follow NestJS module pattern (module → controller → service → DTO)
- ✅ Use Server Components in Next.js by default
- ✅ Add proper TypeScript types everywhere
- ✅ Handle loading and error states in UI
- ✅ Use proper HTTP status codes
- ✅ Log important operations
- ✅ Write meaningful commit messages

---

## Git Workflow

```
branch (feat/... | fix/... | chore/...)
  ↓
commit (small, focused, descriptive message)
  ↓
push to remote
  ↓
open PR (use PR template)
  ↓
CI passes (lint + test + build)
  ↓
1 teammate review (not the author)
  ↓
merge to main
```

**Branch naming:**
- `feat/user-authentication`
- `fix/cart-total-calculation`
- `chore/update-dependencies`
- `refactor/extract-payment-service`

**PR size:** < 300 lines ideally. Open Draft PRs early.

---

## Coding Standards

### TypeScript
- Strict mode enabled
- No `any` — use `unknown` and type guards
- Prefer `interface` over `type` for object shapes
- Use `as const` for literal types
- Exhaustive switch statements with `never` check

### NestJS Backend
- Modules: one feature per module
- Controllers: thin — only handle HTTP concerns
- Services: contain all business logic
- DTOs: validated with class-validator decorators
- Guards: authentication and authorization
- Interceptors: logging, transformation, caching
- Filters: centralized error handling

### Next.js Frontend
- App Router (`app/` directory)
- Server Components by default
- `'use client'` only when needed (hooks, browser APIs, interactivity)
- Data fetching in Server Components
- React Query for client-side data fetching
- Zustand for client state management
- shadcn/ui for UI components

### Database (Prisma)
- One model per database table
- Explicit relations with `@relation`
- Indexes on foreign keys and frequently queried fields
- `createdAt` and `updatedAt` on every model
- Migrations must be backward-compatible

### Testing
- Unit tests for services (Jest)
- Component tests for React (Vitest + React Testing Library)
- E2E tests for critical flows (Playwright)
- Test file co-located with source file
- Mock external dependencies, not internal logic

---

## Business Domain

### Product Types
- **In Stock** — items available in local warehouse
- **Cargo** — cross-border items from Bangkok
- **Promotion** — discounted/flash sale items

### User Roles
- **Admin** — full platform control
- **Sales Person** — manage products, orders, cargo
- **Client** — browse, purchase, track orders

### Key Entities
- User, Seller, Product, Category, Brand
- Order, OrderItem, Cart, CartItem
- Shipment, ShipmentTracking, Warehouse
- Payment, PaymentSlip, Refund
- Review, Wishlist, Coupon, Promotion
- Notification, AuditLog

### Cargo Milestones
```
ORDER_PLACED → PAYMENT_CONFIRMED → WAITING_PURCHASE → PURCHASED →
PACKED → BKK_WAREHOUSE → EXPORT_CLEARANCE → AIR_CARGO →
CUSTOMS → YGN_WAREHOUSE → OUT_FOR_DELIVERY → DELIVERED
```

---

## Role Context

When working on tasks, consider which role best fits:

| Task Type | Primary Role | Supporting Roles |
|---|---|---|
| New feature | business-analyst → architect → backend → frontend | database, qa |
| Bug fix | qa → code-reviewer | backend, frontend |
| API endpoint | backend | database, api-reviewer |
| UI component | frontend | uiux, shadcn |
| Database change | database | architect, migration-reviewer |
| Deployment | devops | security |
| Security issue | security | backend, qa |
| Performance | architect → database | backend, frontend |
| Documentation | documentation | business-analyst |

---

## File Paths

| Path | Contents |
|---|---|
| `.claude/CLAUDE.md` | This file — global project context |
| `.claude/agents/` | Agent definitions (role-based specialists) |
| `.claude/subagents/` | Review and automation subagents |
| `.claude/skills/` | Domain and technology skills (SKILL.md format) |
| `.claude/templates/` | Reusable templates for features, APIs, PRs |
| `.claude/workflows/` | Multi-step automation workflows |
| `.claude/prompts/` | Prompt templates for common tasks |
| `.claude/examples/` | Example outputs for reference |
| `.claude/memory/` | Persistent project memory |
| `docs/` | Business and technical documentation |
| `apps/` | Application source code |
| `packages/` | Shared packages and libraries |
