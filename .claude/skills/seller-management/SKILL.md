---
name: seller-management
description: Seller onboarding, verification, profiles, dashboards, and seller-specific operations
---

# Seller Management Skill

## Core Entities

### Seller Profile
- Linked to User (SELLER role)
- Business name, description, logo
- Verification status
- Rating, successful orders count

---

## Business Rules

### Onboarding
- User registers → Role: CLIENT
- Applies to become seller → Submits business info
- Admin reviews application
- Approved → Role upgraded to SELLER
- Can now list products

### Verification Levels
- **Basic:** Can list In Stock items
- **Verified:** Can list Cargo items (after 10 successful orders)
- **Trusted:** Auto-approved products (after 50 successful orders)

---

## Seller Dashboard Features
- Product management (CRUD)
- Order management (view, update status)
- Sales analytics (orders, revenue, ratings)
- Review management (respond to reviews)
- Profile management

---

## Rules

**Always:**
- Verify seller before allowing product listing
- Track seller rating
- Notify seller on order status changes
- Log all seller actions

**Never:**
- Allow unverified sellers to list products
- Skip admin approval for seller applications
