# Product Domain

## Overview

Products are the core entities listed by sellers on the marketplace. Each product has a defined type, lifecycle status, optional variants, and supporting media stored on Cloudflare R2.

---

## Product Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique product identifier |
| `sellerId` | UUID | Reference to the listing seller |
| `name` | String | Product display name |
| `description` | String | Detailed product description (rich text) |
| `price` | Decimal | Base price in MMK |
| `type` | Enum | Product type classification |
| `status` | Enum | Current lifecycle status |
| `categoryId` | UUID | Reference to product category |
| `brandId` | UUID | Reference to product brand |

---

## Product Types

| Type | Description |
|------|-------------|
| **IN_STOCK** | Physically in seller's possession, ready for immediate fulfillment |
| **CARGO** | Sourced from overseas or domestic suppliers, subject to cargo delivery pipeline |
| **PROMOTION** | Listed as part of a promotional or discounted campaign |
| **PREORDER** | Available for advance booking before stock arrival |
| **LOCAL** | Sourced and delivered within the local market |
| **USED** | Pre-owned or second-hand products |

---

## Product Statuses

Products follow a defined status lifecycle:

| Status | Description |
|--------|-------------|
| **DRAFT** | Created but not yet submitted; editable by seller |
| **PENDING** | Submitted and awaiting admin review |
| **APPROVED** | Reviewed and approved; visible in marketplace search |
| **REJECTED** | Review failed; seller notified with rejection reason |
| **ARCHIVED** | Delisted by seller or admin; no longer visible to buyers |

### Status Flow

```
  DRAFT
    |
    v
  PENDING --> REJECTED (seller can resubmit)
    |
    v
  APPROVED
    |
    v
  ARCHIVED
```

---

## Variants

Products can have multiple variants to represent different sizes, colors, or configurations.

### Variant Fields

| Field | Type | Description |
|-------|------|-------------|
| `sku` | String | Stock Keeping Unit, unique per variant |
| `price` | Decimal | Variant-specific price override (falls back to base price) |
| `stock` | Integer | Available quantity for this variant |
| `attributes` | JSON | Key-value pairs for variant properties (e.g., color, size) |

### Variant Rules

- Each variant must have a unique SKU within the seller's product catalog
- Stock is decremented atomically on order placement
- If variant stock reaches zero, the variant is marked as unavailable
- Variant pricing overrides the base product price when set

---

## Product Images

| Rule | Value |
|------|-------|
| **Maximum images** | 10 per product |
| **Storage** | Cloudflare R2 (object storage) |
| **Formats** | JPEG, PNG, WebP |
| **Max file size** | 5 MB per image |
| **Recommended dimensions** | 1200 x 1200 px (square) |
| **First image** | Used as the primary/thumbnail image |

---

## Approval Flow

All product listings must pass admin review before appearing in the marketplace.

### Approval Steps

1. Seller creates product in **DRAFT** status
2. Seller completes all required fields and uploads images
3. Seller submits product (status changes to **PENDING**)
4. Admin reviews product for compliance, accuracy, and quality
5. Admin **APPROVES** or **REJECTS** the product
6. If rejected, seller receives notification with reason and can resubmit
7. If approved, product becomes visible in marketplace search results

### Rejection Reasons

| Reason | Description |
|--------|-------------|
| Incomplete listing | Missing required fields or images |
| Policy violation | Content violates marketplace terms or prohibited items |
| Misleading description | Inaccurate product information or pricing |
| Low image quality | Images below acceptable resolution or clarity |

---

## Product Rules

- Products must belong to one of the defined categories (see [Marketplace Domain](./marketplace.md))
- Pricing must be in MMK; international currency display is optional with conversion
- Product descriptions must not contain offensive, misleading, or prohibited content
- Sellers may archive and unarchive products at any time
- Approved products that violate policies post-publication may be removed by admin
