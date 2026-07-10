---
name: product-management
description: Product CRUD, variants, images, categories, brands, and product lifecycle management
---

# Product Management Skill

## Core Entities

### Product
- id, sellerId, name, description, price, type, status, categoryId, brandId
- Types: IN_STOCK, CARGO, PROMOTION
- Statuses: DRAFT, PENDING, APPROVED, REJECTED, ARCHIVED

### Variant
- id, productId, name, sku, price, stock, attributes

### Product Image
- id, productId, url, sortOrder
- Storage: Cloudflare R2
- Max 10 images per product

---

## Business Rules

### Listing
- Sellers must be verified
- Products require admin approval
- Max 10 images per product
- Max 5000 character description
- Price > 0, SKU unique

### Approval Flow
```
DRAFT → PENDING → APPROVED/REJECTED
```

---

## Rules

**Always:**
- Validate product data
- Check seller ownership
- Soft delete products
- Notify on status change

**Never:**
- Allow unverified sellers
- Skip admin approval
- Delete products with active orders
