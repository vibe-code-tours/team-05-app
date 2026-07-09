# Core Modules Specification

## 1. Cargo Tracking Module
This module handles the core USP of CrossMart: transparent cross-border logistics tracking.

### 1.1 State Machine
The core entity is the `Order` which tracks a specific `Status`.
- **Pre-dispatch States:** `Pending Payment` -> `Payment Confirmed` -> `Waiting Purchase` (for promos) -> `Purchased`.
- **Logistics States:** `Packed` -> `Bangkok Warehouse` -> `Export Clearance` -> `Air/Land Transit` -> `Myanmar Customs` -> `Yangon Warehouse`.
- **Last Mile:** `Out for Delivery` -> `Delivered`.

### 1.2 Triggers
- **Seller Action:** Updates state up to `Packed` or `Sent to Cargo`.
- **Logistics Admin Action (Future):** Integrated cargo partners can update transit states. (For MVP, Seller or Admin manually updates these milestones).

## 2. Payment Module
Handles financial transactions securely.

### 2.1 Manual Payment Flow (Phase 1)
- At checkout, the system provides the Seller's or Platform's bank/wallet details (e.g., KPay QR Code).
- Client transfers the amount via their banking app.
- Client uploads the transaction screenshot/slip to the order.
- Seller/Admin reviews the uploaded image against their bank statement.
- Upon successful match, Seller/Admin clicks "Confirm Payment".

### 2.2 Future Integration (Phase 2)
- Direct integration with KBZPay, WavePay, or 2C2P for automated payment confirmation.

## 3. Notification Module
Ensures users are informed of critical events.

### 3.1 Channels
- **In-App Notifications:** Alert bell in the top navigation.
- **Email/SMS:** For critical events (e.g., OTP login, Payment Confirmation).

### 3.2 Key Notification Triggers
- **To Client:** Order confirmed, Payment rejected, Cargo status changed (e.g., Arrived in Yangon), Out for Delivery.
- **To Seller:** New order received, Payment slip uploaded, Product approved/rejected by Admin.
- **To Admin:** New seller registration pending review.

## 4. AI Features (Phase 2/3)
*Note: As per project planning, AI features are deferred to future phases. They are documented here for architectural foresight.*
- **Basic AI Product Description:** Integration with standard LLM APIs (e.g., OpenAI) to auto-generate engaging product descriptions based on a photo or simple keywords provided by the Seller.
- **AI Search & Recommendations:** Vector database integration to suggest related cross-border products based on browsing behavior.
