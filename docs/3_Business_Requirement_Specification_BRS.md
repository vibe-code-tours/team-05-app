# Business Requirement Specification (BRS)

## 1. Introduction
This document defines the high-level business rules and workflows for CrossMart, ensuring alignment between business goals and the software implementation.

## 2. Business Workflows

### 2.1 Seller Onboarding Workflow
1. **Registration:** User signs up and applies to be a Sales Person. They must provide identity proof, contact info (Phone/Mail), and location.
2. **Review:** Admin reviews the submitted credentials.
3. **Approval:** Admin approves or rejects. Once approved, the Sales Person is verified and can access the Seller Dashboard.

### 2.2 Standard Order Workflow
1. **Browse & Cart:** Client finds a product, selects variants (if any), and adds to the cart.
2. **Checkout & Payment:** Client proceeds to checkout and submits payment (or payment proof).
3. **Confirmation:** Order is marked as "Payment Confirmed".
4. **Processing:** Seller processes the order, packs it, and dispatches it.
5. **Delivery & Review:** Client receives the item and submits a rating for the Seller.

### 2.3 Promotion / Pre-buy Workflow
1. **Discovery:** Seller discovers a limited-time promotion (e.g., at a mall in Bangkok).
2. **Listing:** Seller rapidly lists the item as a "Promotion Opportunity".
3. **Client Order:** Interested Clients place an order while the promotion is active.
4. **Purchase & Fulfillment:** Seller confirms orders, physically purchases the items, and routes them through the Cargo Workflow.

## 3. Cargo Tracking Module
The cross-border nature of CrossMart relies heavily on transparent tracking. The system must support the following milestones for Cargo items:
1. `Order Placed`
2. `Payment Confirmed`
3. `Waiting Purchase` (Seller is sourcing the item)
4. `Purchased`
5. `Packed`
6. `Bangkok Warehouse` (or origin country warehouse)
7. `Export Clearance`
8. `Air/Land Cargo Transit`
9. `Myanmar Customs`
10. `Yangon Warehouse`
11. `Out for Delivery`
12. `Delivered`

*Business Rule:* Clients must receive notifications at major milestones (e.g., Payment Confirmed, Cargo Transit, Out for Delivery).

## 4. Auto Approval Rules
To reduce administrative bottlenecks, the system will implement Auto Approval Business Rules:
- **Product Listing:** If a Verified Seller has a rating of > 4.5 and > 50 successful sales, their new product listings in "Safe Categories" (e.g., Clothing, Accessories) are automatically approved.
- **Manual Review:** New sellers or high-risk categories (e.g., Electronics, Cosmetics) require manual Admin approval before appearing on the public catalog.

## 5. Payment Workflow
- **Phase 1 Focus:** Clients upload payment slips (e.g., KPay/WavePay transfer screenshots) during checkout.
- **Verification:** Admin or Seller manually verifies the payment slip against bank statements and updates the order status to "Payment Confirmed".
