# Development Roadmap

This document outlines the agile development plan for Phase 1 of CrossMart, broken down into 2-week sprints over a 12-week MVP timeline (6 Sprints total for Phase 1 core).

## Sprint 1: Foundation & Authentication
- **Goal:** Project setup, database schemas, and secure user authentication.
- **Deliverables:**
  - Initialize Next.js, NestJS, Prisma, PostgreSQL monorepo.
  - Setup CI/CD pipelines (GitHub Actions, Docker).
  - Implement OTP Authentication.
  - Build basic User and RBAC structure.

## Sprint 2: Core Catalog & Seller Verification
- **Goal:** Enable sellers to join and products to be listed.
- **Deliverables:**
  - Build Seller Registration & Admin Approval workflow.
  - Implement Category management.
  - Build Product creation endpoints (Image upload via Cloudflare R2).
  - Develop basic Auto-approval logic for products.

## Sprint 3: Client Experience & Search
- **Goal:** Allow buyers to browse and find items easily.
- **Deliverables:**
  - Home page UI with Premium Aesthetics.
  - Search and Filter engine (by Type, Category, Keyword).
  - Product Detail Pages (PDP).
  - Shopping Cart functionality (Local state + DB sync).

## Sprint 4: Order & Payment Pipeline
- **Goal:** End-to-end checkout flow.
- **Deliverables:**
  - Secure Checkout page.
  - Payment Slip upload integration.
  - Order creation and inventory deduction.
  - Admin/Seller interface for verifying payments.

## Sprint 5: Cargo Tracking & Seller Dashboard
- **Goal:** The core USP - cross-border tracking.
- **Deliverables:**
  - Seller Dashboard for processing orders.
  - State Machine implementation for Order Milestones (Cargo Workflow).
  - Client-facing Visual Tracking bar for their active orders.
  - Email/In-app Notification triggers.

## Sprint 6: Polish, UAT & Launch Preparation
- **Goal:** Finalize the MVP for production.
- **Deliverables:**
  - Review & Rating system.
  - Admin Analytics Dashboard.
  - UI/UX polish (micro-animations, responsive checks).
  - User Acceptance Testing (UAT) with pilot sellers.
  - Production deployment (Coolify/Cloudflare).

*Note: Phase 2 (Mobile Apps, AI features, Multi-currency) will be planned from Sprint 7 onwards.*
