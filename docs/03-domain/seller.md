# Seller Domain

## Overview

Sellers are verified vendors who list and sell products on the marketplace. The seller lifecycle covers registration, identity verification, tiered trust levels, and ongoing dashboard management.

---

## Registration

### Required Information

| Step | Data Collected | Description |
|------|----------------|-------------|
| 1 | **NRC / Passport** | National Registration Card or passport for identity verification |
| 2 | **Selfie Verification** | Live selfie photo matched against NRC/Passport image |
| 3 | **Phone OTP** | One-time password sent to registered phone number |
| 4 | **Email Verification** | Verification link sent to email address |
| 5 | **Address** | Business or residential address for logistics and compliance |
| 6 | **Bank / Wallet Info** | Bank account or mobile wallet details for payout processing |

### Registration Flow

```
NRC/Passport Upload
        |
        v
Selfie Verification
        |
        v
Phone OTP Verification
        |
        v
Email Verification
        |
        v
Address Input
        |
        v
Bank/Wallet Info
        |
        v
Account Created (Basic Level)
```

---

## Verification Levels

Sellers progress through verification tiers based on order volume and account standing:

| Level | Requirements | Permissions | Description |
|-------|-------------|-------------|-------------|
| **Basic** | Completed registration | List In Stock products | Entry-level access for new sellers |
| **Verified** | 10+ completed orders, no violations | List In Stock and Cargo products | Proven track record of successful transactions |
| **Trusted** | 50+ completed orders, no violations | Auto-approval on listings, priority support | Elite sellers with established reputation |

### Verification Progression Rules

- Level upgrades are automatic when order thresholds are met
- Account violations (cancellations, complaints, policy breaches) reset or freeze progress
- Trusted sellers bypass manual listing approval for most product types
- Verification status is displayed on seller profile for buyer transparency

---

## Seller Dashboard

### Features

| Feature | Description |
|---------|-------------|
| **Product Upload** | Create and publish product listings with images, descriptions, and pricing |
| **Inventory Management** | Track stock levels, set reorder alerts, manage variants |
| **Order Management** | View incoming orders, update order status, process shipments |
| **Cargo Update** | Update cargo milestones and tracking information for shipped orders |
| **Promotion Listing** | Create and manage promotional offers and discount campaigns |
| **Analytics** | View sales reports, revenue trends, conversion rates, and performance metrics |

### Dashboard Capabilities

- Real-time order notifications and status updates
- Batch product upload via CSV or API
- Inventory sync across multiple product variants
- Revenue and payout history with downloadable reports
- Customer message inbox for buyer-seller communication
- Performance scorecard based on fulfillment rate, response time, and ratings

---

## Seller Policies

- Sellers must fulfill orders within the promised delivery timeframe
- Product listings must be accurate; misleading descriptions result in penalties
- Sellers are responsible for responding to buyer inquiries within 24 hours
- Returns and refunds are handled per marketplace policy (see [Order Domain](./order.md))
- Account suspension occurs after repeated policy violations
- Payouts are processed weekly after order confirmation and completion
