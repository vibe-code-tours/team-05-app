---
name: cargo-tracking
description: Cargo tracking, shipment workflow, warehouse operations, order timeline, and cross-border logistics
---

# Cargo Tracking Skill

## Domain Overview

CrossMart supports **cross-border cargo** from Bangkok to Yangon. Every cargo order goes through a defined milestone chain with tracking updates.

---

## Shipment Status Milestones

```
ORDER_PLACED
    ↓
PAYMENT_CONFIRMED
    ↓
WAITING_PURCHASE        (awaiting supplier purchase)
    ↓
PURCHASED               (item bought from supplier)
    ↓
PACKED                  (packed at Bangkok warehouse)
    ↓
BKK_WAREHOUSE           (arrived at Bangkok warehouse)
    ↓
EXPORT_CLEARANCE        (customs export in Thailand)
    ↓
AIR_CARGO               (in transit via air)
    ↓
CUSTOMS                 (customs clearance in Myanmar)
    ↓
YGN_WAREHOUSE           (arrived at Yangon warehouse)
    ↓
OUT_FOR_DELIVERY        (out for last-mile delivery)
    ↓
DELIVERED               (delivered to customer)
```

---

## Core Entities

### Shipment
- **Fields:** id, orderId, trackingNo, status, warehouseId, estimatedArr, notes
- **One per order**
- **Status updates:** create ShipmentTracking record

### ShipmentTracking
- **Fields:** id, shipmentId, status, location, notes, timestamp
- **Immutable:** history cannot be deleted
- **Ordered by timestamp**

### Warehouse
- **Fields:** id, name, location, type
- **Types:** BANGKOK, YANGON, TRANSIT

---

## Business Rules

### Tracking Rules
- Every status change creates a ShipmentTracking record
- Tracking history **cannot be deleted or modified**
- Each update must include location and timestamp
- Customer can view full timeline
- Sellers update status at their responsibility points

### Timeline Rules
- Estimated arrival calculated based on status
- Customs clearance may add 3-7 business days
- Air cargo transit: 1-3 days
- Last-mile delivery: 1-3 days

### Warehouse Rules
- Bangkok warehouse receives packed items
- Items scanned at each warehouse checkpoint
- Yangon warehouse handles customs + last-mile

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/shipments/:orderId | Get shipment for order |
| GET | /api/v1/tracking/:trackingNo | Public tracking lookup |
| POST | /api/v1/tracking/update | Update tracking status |
| GET | /api/v1/warehouses | List warehouses |

---

## Customer-Facing Timeline UI

```
┌─────────────────────────────────────────┐
│  📦 Order #CM-2024-001                  │
│  Status: In Transit (Air Cargo)         │
│  Estimated Arrival: Jan 25, 2024        │
├─────────────────────────────────────────┤
│  ✅ Order Placed        Jan 10, 10:00  │
│  ✅ Payment Confirmed   Jan 10, 14:30  │
│  ✅ Purchased           Jan 12, 09:00  │
│  ✅ Packed              Jan 14, 16:00  │
│  ✅ BKK Warehouse       Jan 15, 08:00  │
│  ✅ Export Clearance    Jan 16, 10:00  │
│  🔄 Air Cargo           Jan 17, 06:00  │
│  ⏳ Customs             Pending        │
│  ⏳ YGN Warehouse       Pending        │
│  ⏳ Out for Delivery    Pending        │
│  ⏳ Delivered           Pending        │
└─────────────────────────────────────────┘
```

---

## Rules

**Always:**
- Create audit log for every status update
- Notify customer on status change
- Calculate estimated arrival dynamically
- Include location with each tracking update

**Never:**
- Delete tracking history
- Allow status skip (must follow order)
- Update status without location
- Show internal warehouse details to customer
