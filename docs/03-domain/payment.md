# Payment Domain

## Overview

The payment domain handles all financial transactions on the platform, including payment method selection, slip-based verification, and refund processing. Payments support both domestic (Myanmar) and international methods.

---

## Payment Methods

### Myanmar (Domestic)

| Method | Type | Description |
|--------|------|-------------|
| **KBZ Pay** | Mobile Wallet | Popular mobile payment service in Myanmar |
| **AYA Pay** | Mobile Wallet | AYA Bank's mobile payment platform |
| **Wave** | Mobile Wallet | Wave Money mobile payment service |
| **CB Pay** | Mobile Wallet | CB Bank's mobile payment service |
| **Cash** | Cash on Delivery | Payment upon physical delivery of goods |

### Thailand

| Method | Type | Description |
|--------|------|-------------|
| **PromptPay** | Bank Transfer | Thai interbank instant payment system |

### International

| Method | Type | Description |
|--------|------|-------------|
| **Visa** | Credit/Debit Card | Visa card payment processing |
| **Mastercard** | Credit/Debit Card | Mastercard payment processing |
| **Stripe** | Payment Gateway | International payment processing via Stripe |

---

## Payment Flow

The payment process follows these steps:

```
Order Placed
      |
      v
Payment Record Created
      |
      v
Customer Uploads Payment Slip
      |
      v
Seller/Admin Verifies Slip
      |
      v
Confirmed or Rejected
```

### Step-by-Step Process

| Step | Actor | Action |
|------|-------|--------|
| 1 | **System** | Order is created and payment record is generated |
| 2 | **Customer** | Selects payment method and uploads payment slip/screenshot |
| 3 | **Seller/Admin** | Reviews the uploaded slip against bank records |
| 4 | **Seller/Admin** | Confirms payment (order proceeds to processing) or Rejects (customer notified) |
| 5 | **System** | If confirmed, order status updates and inventory is locked |

---

## Payment Verification

### Verification Process

| Aspect | Description |
|--------|-------------|
| **Slip upload** | Customer uploads image or screenshot of payment confirmation |
| **Manual review** | Seller or admin verifies amount, reference number, and timestamp |
| **Confirmation window** | Payment must be verified within 24 hours of slip upload |
| **Auto-rejection** | Slips older than 24 hours without verification are auto-rejected |
| **Dispute** | Customer can dispute rejection with additional proof |

### Verification Rules

- Payment amount must match the order total exactly
- Payment date must be within the valid payment window
- Duplicate slips for the same order are rejected
- Suspected fraudulent slips are flagged for admin review

---

## Refund Policy

| Rule | Value |
|------|-------|
| **Refund window** | 7 days after delivery |
| **Refund method** | Original payment method or bank transfer |
| **Processing time** | 3-5 business days after approval |
| **Partial refund** | Supported for partial order cancellations |

### Refund Eligibility

| Scenario | Eligible |
|----------|----------|
| Product not received | Yes |
| Product damaged in transit | Yes |
| Product does not match listing | Yes |
| Change of mind (unopened) | Yes (within 7 days) |
| Change of mind (opened) | No |
| Custom/personalized items | No |

### Refund Flow

```
Customer Requests Refund (within 7 days)
            |
            v
Seller/Admin Reviews Request
            |
            v
Approved or Rejected
            |
            v
Refund Processed (3-5 business days)
            |
            v
Customer Receives Refund
```

---

## Payment Rules

- All payments are recorded with full audit trail
- Currency conversion rates are displayed at checkout for international payments
- Marketplace commission is deducted from seller payout at settlement
- Failed payments do not create order records
- Customer payment information is never stored directly; processed via payment providers
- Payment disputes are resolved within 7 business days
