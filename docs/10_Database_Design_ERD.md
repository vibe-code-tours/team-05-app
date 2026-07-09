# Database Design (ERD)

This document outlines the core Entity-Relationship Diagram for the CrossMart database, managed via Prisma and PostgreSQL.

## Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ PRODUCT : lists
    USER {
        int id PK
        string role "ADMIN, SELLER, CLIENT"
        string phone
        string name
        string email
        boolean isVerified
        string address
        datetime createdAt
    }

    PRODUCT ||--o{ ORDER_ITEM : included_in
    PRODUCT {
        int id PK
        int sellerId FK
        string title
        string description
        float price
        int stock
        string type "IN_STOCK, CARGO, PROMOTION"
        string status "PENDING, APPROVED, REJECTED"
        int categoryId FK
        datetime promotionEndTime
    }

    CATEGORY ||--o{ PRODUCT : categorizes
    CATEGORY {
        int id PK
        string name
        int parentId FK
    }

    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--o| PAYMENT : has
    ORDER {
        int id PK
        int clientId FK
        float totalAmount
        string status "PENDING_PAYMENT, PAYMENT_CONFIRMED, WAITING_PURCHASE, PACKED, BKK_WAREHOUSE, TRANSIT, DELIVERED"
        string trackingCode
        datetime createdAt
    }

    ORDER_ITEM {
        int id PK
        int orderId FK
        int productId FK
        int quantity
        float unitPrice
    }

    PAYMENT {
        int id PK
        int orderId FK
        string method "KPAY, WAVE, BANK_TRANSFER"
        string slipImageUrl
        string status "PENDING, VERIFIED, REJECTED"
        int verifiedByAdminId FK
    }
```

## Key Considerations
1. **User Role Separation:** A single `USER` table uses a `role` enum. Sellers are users with `role = SELLER`.
2. **Product Types:** The `PRODUCT` table utilizes a `type` enum to differentiate between standard stock and time-sensitive cargo/promotions.
3. **Order Status Tracking:** The `ORDER` table's `status` enum maps directly to the Cargo Tracking state machine.
