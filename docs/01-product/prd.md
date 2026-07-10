# Product Requirements Document (PRD)

> **Project:** E-Commerce Marketplace Platform  
> **Version:** 1.0  
> **Status:** Draft  
> **Last Updated:** 2026-07-10

---

## 1. Overview

This document defines the product requirements for an e-commerce marketplace platform that supports multiple product types (in-stock, cargo, promotion, preorder), multiple user roles (admin, seller, client), and end-to-end order fulfillment including cargo tracking and delivery. The platform connects sellers with clients while providing administrators full control over catalog, approvals, and operations.

## 2. Goals and Objectives

| Goal | Objective | Success Metric |
|------|-----------|----------------|
| Enable multi-role marketplace | Support Admin, Sales Person, and Client roles with distinct permissions | 100% of core role actions work without privilege escalation |
| Diverse product types | Support In Stock, Cargo, Promotion Opportunity, Preorder, Local Marketplace, and Used Items | At least 5 product types available at launch |
| End-to-end order flow | Handle the full lifecycle from browse to delivery and review | Order completion rate >= 85% |
| Cargo visibility | Provide real-time cargo tracking for cross-border shipments (Bangkok, China, Japan) | Tracking updates available within 30 minutes of status change |
| Seller onboarding | Allow verified sellers to list and manage products | Seller verification completion rate >= 90% |
| Customer satisfaction | Deliver a smooth shopping experience with search, filter, cart, and checkout | Average user satisfaction >= 4.0/5.0 |

## 3. User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Platform administrator with full control over all features, users, products, and settings | Full control -- manage users, approve products, configure banners, generate reports, manage coupons |
| **Sales Person (Seller)** | Verified seller who can list and sell products. Must complete identity verification (NRC/Passport, Phone OTP, Face Verification) | Manage own products, view orders, process orders, manage cargo, view sales dashboard |
| **Client (Buyer)** | End user who browses, purchases, and reviews products | Browse catalog, search/filter, add to cart, checkout, track orders, write reviews, manage wishlist |

## 4. Product Types

| Product Type | Description | Typical Source |
|-------------|-------------|----------------|
| **In Stock** | Product physically held by the seller and ready to ship | Local inventory |
| **Cargo Item** | Imported item sourced from Bangkok, China, or Japan and shipped to the buyer via cargo | Bangkok, China, Japan |
| **Promotion Opportunity** | Product the seller has not yet purchased; the seller will buy it upon receiving a customer order | Varies per seller |
| **Preorder** | Product not yet released; the seller lists it in advance and fulfills upon release | Upcoming releases |
| **Local Marketplace** | Local product listed for sale within a defined geographic area | Local sellers |
| **Used Item** | Pre-owned product listed for resale (planned for future release) | Existing inventory |

## 5. Feature List

### 5.1 Client-Facing Features

| Feature | Description |
|---------|-------------|
| Product Catalog | Display all approved products with images, descriptions, pricing, and type badges |
| Search | Full-text search across product titles, descriptions, and categories |
| Filter | Filter products by type, price range, seller, category, availability, and location |
| Product Detail | Individual product page with full info, reviews, seller info, and related items |
| Shopping Cart | Add/remove/update products before checkout |
| Checkout | Address entry, shipping method selection, payment initiation |
| Order Confirmation | Post-payment order summary with estimated delivery |
| Cargo Tracking | Real-time tracking for cargo-type orders with status timeline |
| Wishlist | Save products for later viewing or purchase |
| Reviews and Ratings | Submit star ratings and text reviews for purchased products |
| Notifications | Receive updates on order status, cargo movement, and promotions |

### 5.2 Seller-Facing Features

| Feature | Description |
|---------|-------------|
| Seller Dashboard | Overview of products, orders, sales metrics, and performance |
| Product Management | Create, edit, and delete product listings (subject to admin approval) |
| Order Processing | View incoming orders, confirm, pack, and mark for cargo/delivery |
| Cargo Management | Initiate cargo shipments, update tracking status, manage cargo partners |
| Promotion Listings | Create promotion opportunity listings for products not yet in inventory |
| Notifications | Receive alerts on new orders, stock requests, and platform announcements |
| Reports | View sales reports, revenue breakdowns, and product performance |

### 5.3 Admin-Facing Features

| Feature | Description |
|---------|-------------|
| Admin Dashboard | Platform-wide overview of users, orders, revenue, and activity |
| User Management | View, verify, suspend, or remove sellers and clients |
| Product Approval | Review and approve/reject new product listings |
| Banner CMS | Create, schedule, and manage promotional banners |
| Coupon Management | Create, distribute, and track discount coupons |
| Reports | Generate platform-wide reports on revenue, users, orders, and sellers |
| Notifications | Manage system-wide notification templates and broadcasts |
| Settings | Configure platform parameters, shipping rules, and payment gateways |

## 6. Core Flows

### 6.1 Standard Order Flow

```
Browse -> Search -> Filter -> Product Detail -> Add to Cart -> Checkout
  -> Payment -> Order Confirmed -> Seller Processing -> Packing
  -> Cargo -> Delivery -> Review
```

### 6.2 Promotion Flow

```
Seller finds promotion -> Creates listing -> Customer orders
  -> Seller purchases item -> Warehouse receiving -> Cargo -> Delivery
```

## 7. Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Order completion rate | >= 85% | Confirmed orders / Total initiated orders |
| Seller verification rate | >= 90% | Verified sellers / Total registered sellers |
| Cargo tracking accuracy | >= 95% | Matching status reports vs actual delivery |
| Average delivery time | <= 14 days (domestic), <= 30 days (cargo) | Order confirmed to delivery confirmed |
| Customer satisfaction | >= 4.0 / 5.0 | Post-delivery review average |
| Product approval turnaround | <= 48 hours | Time from submission to admin decision |
| Platform uptime | >= 99.5% | Monthly uptime monitoring |
| Cart abandonment rate | <= 60% | Abandoned carts / Initiated checkouts |

## 8. Constraints and Assumptions

- Sellers must complete full identity verification (NRC/Passport + Phone OTP + Face Verification) before listing products.
- All products require admin approval before becoming visible in the catalog.
- Cargo tracking must provide real-time or near-real-time status updates.
- Payment processing is handled via a third-party gateway (integration required).
- The platform will support multiple languages (starting with Myanmar and English).

## 9. Out of Scope (v1.0)

- Used Item listings (planned for future release)
- Mobile native applications (web-first approach)
- Multi-vendor warehousing
- International seller registration (v1.0 is domestic-focused)

## 10. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which cargo partners will be integrated at launch? | Product | Pending |
| 2 | What payment gateways are supported for the target market? | Engineering | Pending |
| 3 | Is there a maximum number of products per seller? | Business | Pending |
| 4 | What is the return/refund policy for cargo items? | Legal | Pending |
