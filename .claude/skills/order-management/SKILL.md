---
name: order-management
description: Order lifecycle, cart management, checkout flow, order status tracking, and order operations
---

# Order Management Skill

## Order Lifecycle

```
PENDING → PAYMENT_CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓            ↓                ↓
CANCELLED    REFUNDED         CANCELLED
```

---

## Core Entities

### Cart
- userId, productId, variantId, quantity
- One cart per user

### Order
- orderNo (unique, human-readable)
- userId, status, totalAmount
- items, payment, shipment

### OrderItem
- orderId, productId, variantId, quantity, price

---

## Business Rules

### Cart
- Cart expires after 30 min inactivity
- Min order: 5,000 MMK
- Max order: 10,000,000 MMK

### Checkout
- Verify stock availability
- Apply coupon if valid
- Create payment record
- Reserve stock

### Cancellation
- Allowed before PAYMENT_CONFIRMED
- Restore stock on cancellation
- Notify seller

---

## Rules

**Always:**
- Validate stock before order
- Create payment record
- Track order status
- Notify on status change

**Never:**
- Allow overselling
- Skip payment verification
- Allow cancellation after shipment
