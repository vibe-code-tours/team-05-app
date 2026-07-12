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
| Deploy (Frontend) | Vercel | Free tier (100GB bandwidth) |
| Deploy (Backend) | Railway | Free trial ($5 credit, ~2-4 weeks) |
| Database | Supabase | Free tier (500MB PostgreSQL) |
| Auth | Supabase Auth | Free tier (50k MAU) |
| Cache | Upstash Redis | Free tier (10k cmds/day) |
| Storage | Cloudflare R2 | Free tier (10GB) |
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

## Automatic Routing Rules

> **IMPORTANT:** When you receive a task, automatically determine which agents, skills, and subagents to use based on these rules. Do NOT wait for the user to specify — route yourself.

### Agent Routing (Auto-invoke based on task)

| Task Keywords / Pattern | Agent to Use | Why |
|---|---|---|
| "architecture", "scalability", "system design", "folder structure", "ADR" | `architect` | System-level decisions |
| "user story", "PRD", "requirements", "acceptance criteria", "feature spec" | `business-analyst` | Requirements analysis |
| "API endpoint", "controller", "service", "NestJS", "BullMQ", "Redis cache" | `backend` | Server-side implementation |
| "page", "component", "React", "Next.js", "Tailwind", "shadcn", "UI" | `frontend` | Client-side implementation |
| "database", "schema", "migration", "Prisma", "ERD", "index", "query" | `database` | Data layer |
| "security", "JWT", "OTP", "RBAC", "OWASP", "vulnerability", "auth" | `security` | Security concerns |
| "test", "bug", "regression", "E2E", "Playwright", "coverage" | `qa` | Quality assurance |
| "Docker", "CI/CD", "GitHub Actions", "deploy", "Coolify", "production" | `devops` | Infrastructure |
| "React Native", "mobile", "iOS", "Android", "Expo" | `mobile` | Mobile development |
| "design", "wireframe", "accessibility", "WCAG", "color", "spacing" | `uiux` | Design system |
| "sprint", "backlog", "release", "priority", "estimation" | `product-owner` | Product management |

### Skill Routing (Load relevant SKILL.md for domain context)

| Task Keywords / Pattern | Skill to Load | Context Provided |
|---|---|---|
| "product", "listing", "category", "brand", "seller" | `marketplace` | Marketplace domain rules |
| "cargo", "shipment", "tracking", "warehouse", "customs" | `cargo-tracking` | Cargo domain rules |
| "payment", "refund", "invoice", "slip", "verify" | `payment` | Payment domain rules |
| "register", "login", "OTP", "JWT", "role", "permission" | `auth` | Authentication rules |
| "module", "controller", "service", "DTO", "guard" | `nestjs` | NestJS coding rules |
| "page", "layout", "App Router", "Server Component" | `nextjs` | Next.js conventions |
| "schema", "model", "relation", "migration" | `prisma` | Prisma ORM rules |
| "PostgreSQL", "index", "query", "connection pool" | `postgres` | Database rules |
| "cache", "TTL", "invalidation" | `redis` | Caching strategies |
| "queue", "job", "worker", "async" | `bullmq` | Job queue rules |
| "Dockerfile", "container", "image" | `docker` | Container rules |
| "component", "Button", "Card", "Dialog" | `shadcn` | UI component rules |
| "className", "responsive", "breakpoint" | `tailwind` | Styling rules |
| "unit test", "integration test", "mock" | `testing` | Test patterns |
| "seller", "onboarding", "verification" | `seller-management` | Seller domain rules |
| "customer", "address", "profile" | `customer-management` | Customer domain rules |
| "stock", "inventory", "variant" | `inventory` | Inventory rules |
| "order", "cart", "checkout" | `order-management` | Order domain rules |
| "coupon", "discount", "flash sale" | `promotion` | Promotion rules |
| "notification", "email", "SMS" | `notification` | Notification rules |
| "admin", "dashboard", "management" | `admin-panel` | Admin panel rules |

### Subagent Routing (Auto-invoke for review/validation)

| Task Pattern | Subagent | When |
|---|---|---|
| After implementing a feature | `product-reviewer` | Verify business rules met |
| After creating/modifying API endpoints | `api-reviewer` | Check REST conventions |
| Before merging any PR | `code-reviewer` | SOLID, clean code, performance |
| After database schema changes | `migration-reviewer` | Validate migration safety |
| After bug fix or new feature | `test-writer` | Generate/update tests |
| When docs are needed | `documentation` | Generate/maintain docs |

### Workflow Routing (Auto-trigger multi-step processes)

| User Request | Workflow | Steps |
|---|---|---|
| "build [feature]", "implement [feature]", "create [feature]" | `feature-workflow` | Business → Architecture → DB → API → Frontend → Test → Review |
| "fix [bug]", "bug in [area]" | `bug-workflow` | Reproduce → Root Cause → Fix → Test → Review |
| "release", "deploy", "ship" | `release-workflow` | Plan → Test → Docs → Version → Deploy → Verify |

### Speckit Routing (Specification-Driven Development)

| Task Pattern | Action |
|---|---|
| "spec for [feature]", "write spec" | Load `speckit` skill → use `spec.md` template |
| "implement from spec" | Read spec → route to agents via spec sections |
| Complex feature (multi-module) | Auto-trigger `speckit-workflow` |
| Simple fix / config change | Skip speckit, use direct agents |

**Speckit Flow:** Spec → Validate → Plan → Generate → Verify → Deliver

**Spec Section → Agent Mapping:**
| Spec Section | Agent | Skill |
|---|---|---|
| API | backend | nestjs |
| Database | database | prisma, postgres |
| UI | frontend | nextjs, shadcn, tailwind |
| Rules | backend | (domain skill) |
| Testing | qa | testing |

### Routing Decision Tree

```
1. READ the task description
2. IDENTIFY keywords and patterns
3. IF complex feature → use speckit-workflow (spec-first)
4. IF simple task → direct agent routing
5. MATCH against routing tables above
6. INVOKE primary agent(s) for the task
7. LOAD relevant skill(s) for domain context
8. AFTER implementation, invoke reviewer subagent(s)
9. IF multi-step, follow the matching workflow
```

**Example:**
> User: "Implement cargo tracking API endpoint"

**Auto-route:**
1. Skill: `cargo-tracking` (domain context) + `nestjs` (coding rules)
2. Agent: `backend` (implementation)
3. Subagent: `api-reviewer` (after API is created)
4. Subagent: `code-reviewer` (before merge)

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
