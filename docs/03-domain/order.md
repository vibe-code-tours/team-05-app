# Order Domain

## Overview

The order domain manages the full lifecycle from product browsing through delivery and review. It covers cart management, checkout, payment processing, and fulfillment tracking.

---

## Order Lifecycle

The complete order flow follows these stages:

```
Browse --> Cart --> Checkout --> Payment --> Confirmed --> Processing --> Packing --> Cargo --> Delivery --> Review
```

### Stage Descriptions

| Stage | Description |
|-------|-------------|
| **Browse** | Customer discovers products via search and categories |
| **Cart** | Customer adds items to shopping cart |
| **Checkout** | Customer reviews cart, provides shipping address, selects delivery option |
| **Payment** | Customer submits payment (slip upload) |
| **Confirmed** | Payment verified by seller or admin; order is locked |
| **Processing** | Seller prepares items for shipment |
| **Packing** | Items are packed and labeled for cargo or local delivery |
| **Cargo** | Shipment enters cargo pipeline (see [Cargo Domain](./cargo.md)) |
| **Delivery** | Items delivered to customer's address |
| **Review** | Customer reviews products and seller experience |

---

## Cart Rules

| Rule | Value |
|------|-------|
| **Cart expiration** | 30 minutes of inactivity |
| **Minimum order** | 5,000 MMK |
| **Maximum order** | 10,000,000 MMK |
| **Max items per cart** | Defined by seller stock availability |

### Cart Behavior

- Items are reserved in the seller's inventory when added to cart
- Cart expiration triggers automatic release of reserved inventory
- Price changes by seller after cart addition are reflected at checkout
- Out-of-stock items are flagged when cart is opened
- Customers may update quantities within available stock limits

---

## Checkout

### Required Information

| Field | Description |
|-------|-------------|
| **Shipping address** | Full delivery address with city, district, and postal code |
| **Contact phone** | Phone number for delivery coordination |
| **Delivery option** | Local delivery or cargo delivery (if applicable) |
| **Payment method** | Selected from available payment methods (see [Payment Domain](./payment.md)) |

### Checkout Validation

- All items must be in stock at checkout time
- Cart total must fall within 5,000 MMK - 10,000,000 MMK range
- Shipping address must be within supported delivery areas
- Payment method must be valid and available

---

## Order Statuses

| Status | Owner | Description |
|--------|-------|-------------|
| **Pending Payment** | Customer | Awaiting payment slip upload |
| **Payment Submitted** | Customer | Slip uploaded, awaiting verification |
| **Payment Confirmed** | Admin/Seller | Payment verified; order locked |
| **Payment Rejected** | Admin/Seller | Payment verification failed; customer notified |
| **Processing** | Seller | Seller preparing order for shipment |
| **Packing** | Seller | Items being packed and labeled |
| **In Cargo** | Cargo Provider | Shipment in transit through cargo pipeline |
| **Out for Delivery** | Delivery Agent | Final-mile delivery in progress |
| **Delivered** | Delivery Agent | Items received by customer |
| **Completed** | System | Delivery confirmed and review window open |
| **Cancelled** | Customer/Seller/Admin | Order cancelled before shipment |
| **Refunded** | Admin | Order refunded per refund policy |

---

## Order Rules

- Orders cannot be modified after payment confirmation
- Customers may cancel orders before payment confirmation
- Sellers must process confirmed orders within the promised timeframe
- Cancellations after processing stage may incur penalties
- Order history is retained for 12 months
- Refund window is 7 days after delivery (see [Payment Domain](./payment.md))

---

## Multi-Vendor Orders

When a customer orders products from multiple sellers in a single checkout:

- The order is split into per-seller sub-orders
- Each sub-order has independent tracking and status
- Shipping is calculated per seller
- Payment is split across sellers at the marketplace level
- Customer receives separate tracking for each sub-order
