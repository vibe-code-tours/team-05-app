# CrossMart

> Myanmar's most trusted Cross-Border Marketplace Platform.

![ci](../../actions/workflows/ci.yml/badge.svg) ![security](../../actions/workflows/security.yml/badge.svg)

**CrossMart** is a comprehensive e-commerce platform tailored for the Myanmar market. It unifies Facebook-based seller markets into a standardized, trustworthy platform. It supports distinct product types including **In Stock**, **Cargo items** (e.g., cross-border from Bangkok), and **Promotion items**, ensuring transparent tracking from order placement to final delivery.

---

## Quickstart

```bash
git clone <your-repo-url> && cd <repo>
cp .env.example .env        # fill in real values LOCALLY — never commit .env

# We use Next.js (Frontend) and NestJS (Backend)
npm install && npm run dev
```

## Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, TailwindCSS, shadcn/ui
- **Backend:** NestJS, PostgreSQL, Prisma, BullMQ
- **Caching & Storage:** Redis, MinIO/AWS S3
- **Deployment:** Docker, Coolify, Cloudflare

## Project Documentation

We have thoroughly documented the business and technical requirements of CrossMart. Please refer to the `docs/` folder for detailed specifications:

- **[Phase 1] Core Strategy:** [Executive Summary & BMC](docs/1_Executive_Summary_And_BMC.md) | [PRD](docs/2_Product_Requirement_Document_PRD.md) | [BRS](docs/3_Business_Requirement_Specification_BRS.md)
- **[Phase 2] System Specs:** [User & Business Flow](docs/4_User_Flow_And_Business_Workflow.md) | [SRS](docs/5_Software_Requirement_Specification_SRS.md) | [User Stories](docs/6_User_Stories.md)
- **[Phase 3] Modules:** [Portal Specs](docs/7_Portal_Specifications.md) | [Core Modules (Cargo/Payment)](docs/8_Core_Modules.md)
- **[Phase 4] Architecture:** [System Architecture](docs/9_System_Architecture.md) | [Database ERD](docs/10_Database_Design_ERD.md) | [API Spec](docs/11_API_Specification.md)
- **[Phase 5] Project Mgmt:** [Roadmap (Sprints 1-12)](docs/12_Development_Roadmap.md) | [UI/UX Guidelines](docs/13_UI_UX_Guidelines.md)

## Team & Operations

- **Working Agreement:** Read the [Team Working Agreement](./working-agreement.md) for GitHub flow, PR reviews, and team roles.
- **Code Owners:** Managed via `.github/CODEOWNERS`.

**Git rule:** branch → PR → 1 teammate review → merge. No push to `main`, no self-merge.
