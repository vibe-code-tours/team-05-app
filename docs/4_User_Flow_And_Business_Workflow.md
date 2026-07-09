# User Flow and Business Workflow

## 1. Client (Buyer) User Flow

```mermaid
graph TD
    A[Open App/Web] --> B[Browse Catalog]
    B --> C{Logged In?}
    C -->|No| D[Login/Register via OTP]
    D --> B
    C -->|Yes| E[View Product Details]
    E --> F[Add to Cart]
    F --> G[Checkout]
    G --> H[Upload Payment Slip]
    H --> I[Order Placed & Awaiting Confirmation]
    I --> J[Track Cargo/Delivery Status]
    J --> K[Receive Product]
    K --> L[Leave Review & Rating]
```

## 2. Sales Person (Seller) Workflow

```mermaid
graph TD
    A[Register as Seller] --> B[Submit ID & Details]
    B --> C[Admin Reviews & Approves]
    C --> D[Access Seller Dashboard]
    D --> E[Upload New Product/Promotion]
    E --> F{Auto-Approval Eligible?}
    F -->|No| G[Wait for Admin Approval]
    F -->|Yes| H[Product Goes Live]
    G --> H
    H --> I[Receive Client Order]
    I --> J[Verify Payment Slip]
    J --> K[Purchase/Pack Item]
    K --> L[Update Status to 'Packed'/'Sent to Cargo']
    L --> M[Monitor Delivery to Client]
```

## 3. Promotion / Pre-buy Special Workflow

```mermaid
graph TD
    A[Seller Spots Deal in BKK] --> B[Snap Photo & Create 'Promotion' Listing]
    B --> C[Set Short Time Limit]
    C --> D[Clients Place Orders]
    D --> E[Seller Collects Payments]
    E --> F[Seller Buys Item in BKK]
    F --> G[Seller Hands to Cargo]
    G --> H[Cargo Ships to Myanmar]
    H --> I[Delivery to Clients]
```

## 4. Cargo Tracking Flow
This is the detailed state machine for an order involving cross-border cargo.

```mermaid
stateDiagram-v2
    [*] --> OrderPlaced
    OrderPlaced --> PaymentConfirmed : Admin/Seller verifies
    PaymentConfirmed --> WaitingPurchase : If item needs sourcing
    PaymentConfirmed --> Packed : If In Stock
    WaitingPurchase --> Purchased : Seller buys item
    Purchased --> Packed
    Packed --> BkkWarehouse : Dispatched cross-border
    BkkWarehouse --> ExportClearance
    ExportClearance --> AirCargoTransit
    AirCargoTransit --> MyanmarCustoms
    MyanmarCustoms --> YangonWarehouse
    YangonWarehouse --> OutForDelivery
    OutForDelivery --> Delivered
    Delivered --> [*]
```
