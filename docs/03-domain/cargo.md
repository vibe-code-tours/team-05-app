# Cargo Domain

## Overview

The cargo domain manages the shipment lifecycle for products imported from overseas or shipped through logistics providers. It tracks items from order placement through final delivery, with immutable milestone records and dynamic arrival estimation.

---

## Cargo Milestones

The cargo pipeline follows a defined sequence of milestones:

```
ORDER_PLACED
      |
      v
PAYMENT_CONFIRMED
      |
      v
WAITING_PURCHASE
      |
      v
PURCHASED
      |
      v
PACKED
      |
      v
BKK_WAREHOUSE
      |
      v
EXPORT_CLEARANCE
      |
      v
AIR_CARGO
      |
      v
CUSTOMS
      |
      v
YGN_WAREHOUSE
      |
      v
OUT_FOR_DELIVERY
      |
      v
DELIVERED
```

### Milestone Descriptions

| Milestone | Description |
|-----------|-------------|
| **ORDER_PLACED** | Customer order has been submitted and recorded |
| **PAYMENT_CONFIRMED** | Payment has been verified and order is confirmed |
| **WAITING_PURCHASE** | Seller is sourcing or purchasing the product from supplier |
| **PURCHASED** | Product has been acquired by the seller or supplier |
| **PACKED** | Product has been packed and prepared for shipment |
| **BKK_WAREHOUSE** | Product has arrived at Bangkok warehouse (Thailand) |
| **EXPORT_CLEARANCE** | Export documentation and customs clearance processed in Thailand |
| **AIR_CARGO** | Product is in transit via air freight |
| **CUSTOMS** | Product has arrived in Myanmar and is clearing customs |
| **YGN_WAREHOUSE** | Product has arrived at Yangon warehouse (Myanmar) |
| **OUT_FOR_DELIVERY** | Product is out for final-mile delivery to customer |
| **DELIVERED** | Product has been delivered to customer's address |

---

## Tracking History

### Immutability Rule

All tracking history entries are **immutable**. Once a milestone record is created, it cannot be modified or deleted. This ensures:

- Complete audit trail for every shipment
- Dispute resolution with verifiable timeline data
- Transparency for customers, sellers, and logistics providers

### Tracking Record Fields

| Field | Type | Description |
|-------|------|-------------|
| `milestone` | Enum | The cargo milestone reached |
| `timestamp` | DateTime | UTC timestamp when milestone was recorded |
| `location` | String | Physical location or warehouse where milestone occurred |
| `notes` | String | Optional notes from logistics provider |
| `recordedBy` | UUID | System or user ID that recorded the milestone |

---

## Warehouses

### Bangkok Warehouse (BKK)

| Property | Description |
|----------|-------------|
| **Location** | Bangkok, Thailand |
| **Role** | Receive and consolidate goods from Thai suppliers |
| **Function** | Quality check, repacking, export documentation |

### Yangon Warehouse (YGN)

| Property | Description |
|----------|-------------|
| **Location** | Yangon, Myanmar |
| **Role** | Receive imported goods and process domestic customs |
| **Function** | Customs clearance, sorting, final-mile dispatch |

---

## Dynamic Arrival Estimation

Estimated arrival time (ETA) is calculated dynamically based on:

| Factor | Description |
|--------|-------------|
| **Current milestone** | Which stage the shipment is currently at |
| **Historical transit times** | Average duration between milestones from past shipments |
| **Customs processing time** | Estimated time for import/export clearance |
| **Route congestion** | Current shipping volume and route availability |
| **Warehouse processing** | Time to sort and dispatch from each warehouse |

### ETA Display

- ETA is shown to customers at each milestone update
- ETA is recalculated whenever a milestone is recorded
- Customer receives notifications when ETA changes significantly (+/- 24 hours)

---

## Cargo Rules

- Sellers must update cargo milestones within 24 hours of status change
- Failure to update milestones for 72 hours triggers automatic escalation
- Customers can view full tracking history on the order detail page
- Logistics providers record milestones directly via API integration
- Cargo claims for lost or damaged items must be filed within 7 days of delivery
