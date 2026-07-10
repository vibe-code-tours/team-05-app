---
name: marketplace
description: Marketplace domain knowledge — products, categories, brands, inventory, variants, wishlist, reviews, coupons, promotions
---

# Marketplace Skill

## Domain Overview

CrossMart is a **multi-vendor marketplace** where sellers list products and clients purchase them. The platform manages the full lifecycle from listing to delivery.

---

## Core Entities

### Product
- **Fields:** id, sellerId, name, description, price, type, status, categoryId, brandId
- **Types:** IN_STOCK, CARGO, PROMOTION
- **Statuses:** DRAFT, PENDING, APPROVED, REJECTED, ARCHIVED
- **Relations:** belongs to Seller, Category, Brand; has many Variants, Images, Reviews

### Category
- **Fields:** id, name, slug, parentId, sortOrder
- **Structure:** Hierarchical (max 3 levels deep)
- **Example:** Electronics → Phones → Smartphones

### Brand
- **Fields:** id, name, slug, logoUrl
- **Used for:** Product filtering and brand pages

### Variant
- **Fields:** id, productId, name, sku, price, stock, attributes
- **Example:** T-Shirt → Size: M, Color: Red, SKU: TS-M-RED

### Product Image
- **Fields:** id, productId, url, sortOrder
- **Storage:** Cloudflare R2
- **Limit:** Max 10 images per product

---

## Business Rules

### Listing Rules
- Sellers must be verified before listing
- Products require admin approval (unless trusted seller)
- Maximum 10 images per product
- Product descriptions max 5000 characters
- Categories max 3 levels deep
- Price must be > 0
- SKU must be unique across the platform

### Approval Flow
```
Seller creates product → Status: DRAFT
Seller submits → Status: PENDING
Admin reviews → Status: APPROVED or REJECTED
If approved → visible in marketplace
If rejected → seller notified with reason
```

### Search & Filtering
- Full-text search on name and description
- Filter by: Category, Brand, Type, Price Range, Rating
- Sort by: Price, Rating, Newest, Popular
- Pagination: 20 items per page

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/products | List products (with filters) |
| GET | /api/v1/products/:id | Get product detail |
| POST | /api/v1/products | Create product (Seller) |
| PATCH | /api/v1/products/:id | Update product |
| DELETE | /api/v1/products/:id | Soft delete product |
| GET | /api/v1/categories | List categories (tree) |
| GET | /api/v1/brands | List brands |
| POST | /api/v1/products/:id/reviews | Add review (Client) |
| GET | /api/v1/wishlist | Get wishlist |
| POST | /api/v1/wishlist/:productId | Add to wishlist |
| DELETE | /api/v1/wishlist/:productId | Remove from wishlist |
| POST | /api/v1/coupons/validate | Validate coupon code |

---

## Seller Dashboard Features
- Product management (CRUD)
- Order management (view, update status)
- Sales analytics
- Review management (respond to reviews)
- Profile management

---

## Admin Features
- Product approval/rejection
- Category management
- Brand management
- Seller verification
- Platform analytics
- User management

---

## Rules

**Always:**
- Validate product data before saving
- Check seller ownership before updates
- Create audit log for status changes
- Notify seller on approval/rejection
- Soft delete products (never hard delete)

**Never:**
- Allow unverified sellers to list
- Skip admin approval for new sellers
- Delete products with active orders
- Expose seller internal data to clients
