# Product Requirement Document (PRD)

## 1. Product Overview
**CrossMart** is a comprehensive e-commerce platform tailored for the Myanmar market, specifically designed to handle local inventory as well as cross-border cargo and pre-orders. It integrates the fragmented Facebook-based seller market into a standardized, trustworthy platform.

## 2. Target Users & Roles
1. **Admin:** System Management, verifying sellers, resolving disputes, managing categories, and overseeing overall platform health.
2. **Sales Person (Seller):** Verified vendors who can list products. They require strict registration to ensure reliability. They manage their listings, process orders, and handle packing/cargo forwarding.
3. **Client (Buyer):** End-users who browse, search, and purchase products. Their profile focuses on contact info, delivery address, and tracking active orders.

## 3. Core Product Types
To support the unique cross-border model, the platform categorizes listings as follows:
- **In Stock:** Items currently available in the seller's local inventory for immediate dispatch.
- **Cargo Product (From BKK or other countries):** Items that require cross-border shipping. Buyers expect longer lead times and detailed tracking.
- **Promotion Opportunity (Pre-buy):** Time-sensitive deals where a seller physically spots a promotion (e.g., in Bangkok) and lists it. Buyers can order it, and the seller purchases it on the spot before shipping.
- **Future Types:** Local Marketplace (C2C), Used Items.

## 4. Key Features (Phase 1 - Web App)
- **Authentication & RBAC:** Secure login with OTP, JWT, and distinct roles (Admin, Seller, Client).
- **Seller Verification System:** Strict approval pipeline before a seller can list items.
- **Catalog & Search:** Robust category and brand filtering, plus search functionality.
- **Shopping Cart & Checkout:** Standard e-commerce flow with wishlist support.
- **Order Management & Cargo Tracking:** The core USP. Detailed milestone tracking for cross-border orders.
- **Auto Approval Rules:** Streamlining product listing approvals based on seller trust score or predefined categories.
- **Reviews & Ratings:** Building a trusted seller ecosystem.
- **Admin & Seller Dashboards:** Reporting, order processing, and product management.
- **Notifications & Payment Records:** Keeping users informed and managing offline/online payment proofs.

## 5. Success Metrics
- **Seller Acquisition:** 1,000+ Verified Sellers onboarded.
- **Catalog Size:** 50,000+ Active Products.
- **Fulfillment & Transparency:** 95% of orders actively trackable.
- **Operational Efficiency:** < 24-hour turnaround for Seller Verification and Product Approvals.
- **Customer Satisfaction:** > 4.8 average Customer Rating.

## 6. Out of Scope (Phase 1)
- Android / Mobile Apps (Planned for Phase 2)
- AI-based Recommendations & AI Search (Planned for Phase 2/3)
- Multi-currency & International Sellers (Phase 3)
- Public APIs (Phase 3)
