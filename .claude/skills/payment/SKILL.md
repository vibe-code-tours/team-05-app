---
name: payment
description: Payment processing, refund management, invoice generation, payment slip verification, and financial operations
---

# Payment Skill

## Domain Overview

CrossMart uses **manual payment slip upload** as the primary payment method (Phase 1). Sellers/Admins verify payment slips before confirming orders.

---

## Core Entities

### Payment
- **Fields:** id, orderId, amount, method, slipUrl, status, verifiedBy, notes
- **Statuses:** PENDING, VERIFIED, REJECTED, REFUNDED

### Payment Slip
- **Storage:** Cloudflare R2
- **Allowed types:** JPEG, PNG, PDF
- **Max size:** 5MB

### Refund
- **Fields:** id, paymentId, amount, reason, status, processedBy
- **Window:** 7 days after delivery

---

## Payment Flow

```
Customer places order
    ↓
Payment record created (status: PENDING)
    ↓
Customer uploads payment slip
    ↓
Seller/Admin reviews slip
    ↓
├── Verified → Order confirmed → Processing begins
└── Rejected → Customer notified → Can re-upload
```

---

## Business Rules

### Payment Rules
- Payment slip must be uploaded within 24 hours of order
- Manual verification required for all payments
- Amounts > 500,000 MMK require admin verification
- Payment verified → Order status changes to PAYMENT_CONFIRMED
- Payment rejected → Customer can re-upload within 24 hours

### Refund Rules
- Refund window: 7 days after delivery
- Partial refunds supported for multi-item orders
- Refunds processed within 5-7 business days
- Admin approval required for refunds > 100,000 MMK

### Invoice Rules
- Auto-generated on payment verification
- Contains: order details, items, amounts, tax
- PDF format for download

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/orders/:id/payment | Upload payment slip |
| GET | /api/v1/payments/:id | Get payment details |
| PATCH | /api/v1/payments/:id/verify | Verify payment (Admin) |
| PATCH | /api/v1/payments/:id/reject | Reject payment (Admin) |
| POST | /api/v1/payments/:id/refund | Request refund |
| GET | /api/v1/invoices/:orderId | Download invoice |

---

## Rules

**Always:**
- Create payment record when order is placed
- Validate slip file type and size
- Notify customer on verification/rejection
- Create audit log for all payment actions
- Generate invoice on payment verification

**Never:**
- Auto-verify payments (always manual)
- Allow payment after 24-hour window
- Process refunds without admin approval for large amounts
- Expose payment details to other customers
