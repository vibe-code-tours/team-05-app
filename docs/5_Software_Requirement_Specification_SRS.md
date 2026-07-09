# Software Requirement Specification (SRS)

## 1. Introduction
This Software Requirement Specification outlines the functional and non-functional requirements for the CrossMart e-commerce platform.

## 2. Functional Requirements

### 2.1 Authentication & Authorization
- **REQ-1:** The system shall allow users to register and login using Phone Number (OTP) or Email.
- **REQ-2:** The system shall implement Role-Based Access Control (RBAC) with three primary roles: Admin, Sales Person, Client.
- **REQ-3:** JWT shall be used for session management.

### 2.2 User Profile Management
- **REQ-4:** Clients shall be able to update their delivery addresses and view order history.
- **REQ-5:** Sellers shall have a public profile showing their ratings, successful order count, and active listings.

### 2.3 Product Management
- **REQ-6:** Sellers shall be able to create products with variants (e.g., size, color), images (uploaded via Cloudflare R2), and categorize them as In Stock, Cargo, or Promotion.
- **REQ-7:** The system shall automatically approve products from trusted sellers (based on business rules).
- **REQ-8:** Admins shall have an interface to manually approve/reject pending products.

### 2.4 Shopping & Checkout
- **REQ-9:** Clients shall be able to search products and filter by Category, Brand, and Product Type.
- **REQ-10:** Clients shall be able to add multiple items to a cart.
- **REQ-11:** During checkout, Clients must be able to upload a payment slip image (Phase 1 payment method).

### 2.5 Order & Cargo Management
- **REQ-12:** The system shall generate a unique Order ID for tracking.
- **REQ-13:** Sellers and Admins shall be able to update the order status through the defined Cargo milestones (e.g., Packed, Bangkok Warehouse, Yangon Warehouse).
- **REQ-14:** Clients shall receive notifications (in-app/email) when their order status changes.

### 2.6 Review System
- **REQ-15:** Clients can leave a 1-5 star rating and text review for a Seller only after an order is marked as 'Delivered'.

## 3. Non-Functional Requirements (NFRs)

### 3.1 Performance
- **NFR-1:** Web pages should load in under 2 seconds.
- **NFR-2:** API response times should be under 200ms for 95% of requests.
- **NFR-3:** Redis shall be used for caching product catalogs to handle high read volumes.

### 3.2 Security
- **NFR-4:** All API endpoints must be secured over HTTPS.
- **NFR-5:** Passwords and OTPs must be hashed securely.
- **NFR-6:** The system must protect against SQL injection (using Prisma ORM) and XSS (React/Next.js native protections).

### 3.3 Scalability
- **NFR-7:** The backend architecture (NestJS + BullMQ) must support horizontal scaling via Docker and container orchestration (Coolify/Cloudflare).
- **NFR-8:** Database (PostgreSQL) must support concurrent read/write scaling.

### 3.4 Reliability & Availability
- **NFR-9:** The system shall target 99.9% uptime.
- **NFR-10:** Automated daily backups of the PostgreSQL database must be maintained.
