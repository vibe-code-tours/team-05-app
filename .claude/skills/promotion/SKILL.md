---
name: promotion
description: Coupons, discounts, flash sales, promotional campaigns, and marketing rules
---

# Promotion Skill

## Core Entities

### Coupon
- code, discount, type (FIXED/PERCENTAGE), minPurchase, maxDiscount
- usageLimit, usedCount, startsAt, expiresAt, isActive

### Promotion
- name, description, discount, type, startsAt, expiresAt, isActive

---

## Business Rules

### Coupon Rules
- Unique code (case-insensitive)
- Valid date range
- Usage limit enforced
- Min purchase amount
- Max discount cap

### Flash Sale
- Time-limited discounts
- Limited quantity
- First-come-first-served

---

## Rules

**Always:**
- Validate coupon before applying
- Check date range
- Check usage limit
- Create audit log

**Never:**
- Allow expired coupons
- Skip usage limit check
- Apply multiple coupons
