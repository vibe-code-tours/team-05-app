# User Stories

> **Project:** E-Commerce Marketplace Platform  
> **Version:** 1.0  
> **Last Updated:** 2026-07-10

---

## 1. Admin User Stories

### US-A01: User Management

**As an** Admin,  
**I want to** view, verify, suspend, and remove all registered users (sellers and clients),  
**So that** I can maintain a trusted and compliant marketplace.

**Acceptance Criteria:**
- Admin can view a paginated list of all users with search and filter by role and status.
- Admin can view individual user profiles including verification status and activity.
- Admin can suspend or remove a user account with a confirmation prompt.
- Admin can verify a seller's identity documents.
- Changes to user status take effect immediately and the affected user is notified.

---

### US-A02: Product Approval

**As an** Admin,  
**I want to** review and approve or reject new product listings submitted by sellers,  
**So that** only legitimate and compliant products appear in the catalog.

**Acceptance Criteria:**
- Admin receives a notification when a new product is submitted.
- Admin can view product details, images, and seller information before making a decision.
- Admin can approve (product goes live) or reject (with a reason) a listing.
- Rejected products are removed from the seller's pending list and the seller is notified with the rejection reason.
- Approval turnaround must be within 48 hours.

---

### US-A03: Banner CMS Management

**As an** Admin,  
**I want to** create, schedule, and manage promotional banners on the platform,  
**So that** I can highlight deals, events, and important announcements to all users.

**Acceptance Criteria:**
- Admin can create a banner with an image, title, link, and schedule (start/end date).
- Admin can edit or delete an existing banner.
- Scheduled banners automatically appear and disappear based on their date range.
- Admin can preview a banner before publishing.
- A maximum number of active banners can be configured in settings.

---

### US-A04: Coupon Management

**As an** Admin,  
**I want to** create, distribute, and track discount coupons,  
**So that** I can run promotional campaigns and incentivize purchases.

**Acceptance Criteria:**
- Admin can create a coupon with a code, discount type (% or flat), value, usage limit, and expiry date.
- Admin can view coupon usage statistics (total uses, remaining uses, total discount given).
- Admin can deactivate a coupon at any time.
- A coupon cannot be applied after it has expired or reached its usage limit.
- Admin can bulk-generate coupon codes.

---

### US-A05: Reports and Analytics

**As an** Admin,  
**I want to** generate platform-wide reports on revenue, orders, users, and sellers,  
**So that** I can make data-driven decisions about platform operations.

**Acceptance Criteria:**
- Admin can generate reports by date range, user role, product type, and order status.
- Reports include key metrics: total revenue, total orders, new users, active sellers, average order value.
- Admin can export reports in CSV and PDF formats.
- Dashboard displays real-time summary widgets with trend indicators.

---

## 2. Seller (Sales Person) User Stories

### US-S01: Seller Registration and Verification

**As a** Sales Person,  
**I want to** register as a seller and complete identity verification,  
**So that** I can list and sell products on the platform.

**Acceptance Criteria:**
- Registration requires name, email, phone number, and business information.
- Identity verification requires upload of NRC or Passport document.
- Phone number must be verified via OTP.
- Face verification is required (selfie match against NRC/Passport photo).
- Seller account is marked as "Pending Verification" until all steps are completed.
- Upon verification, seller receives a confirmation notification and can begin listing products.
- Verification is completed within 24 hours of submission.

---

### US-S02: Create Product Listing

**As a** Sales Person,  
**I want to** create a product listing with all required details,  
**So that** my product can be reviewed and made available for purchase.

**Acceptance Criteria:**
- Seller can enter product name, description, price, stock quantity, category, and product type.
- Seller must upload at least one product image (max 10 images).
- Seller must specify the product type (In Stock, Cargo, Promotion Opportunity, Preorder, Local Marketplace).
- For Cargo items, seller must specify source location (Bangkok/China/Japan) and estimated lead time.
- For Promotion Opportunity, seller must indicate the product has not yet been purchased.
- Listing is submitted as "Pending Approval" and requires admin review.
- Seller receives a notification when the listing is approved or rejected.

---

### US-S03: Manage Orders

**As a** Sales Person,  
**I want to** view and process incoming orders,  
**So that** I can fulfill customer purchases and maintain good service.

**Acceptance Criteria:**
- Seller can view a list of all orders for their products with status filters.
- Seller can view full order details including buyer info, shipping address, and product details.
- Seller can update order status: Confirmed, Processing, Packed, Shipped, Delivered.
- Each status update triggers a notification to the buyer.
- Seller can add internal notes to an order.
- Seller cannot mark an order as delivered; delivery is confirmed by the cargo partner or client.

---

### US-S04: Cargo Management

**As a** Sales Person,  
**I want to** initiate cargo shipments and update tracking status,  
**So that** buyers can track their cargo orders in real time.

**Acceptance Criteria:**
- Seller can select an order and initiate a cargo shipment.
- Seller must provide cargo tracking number and carrier information.
- Seller can update cargo status at each checkpoint (picked up, in transit, customs, out for delivery).
- Each status update is reflected in the buyer's tracking view within 30 minutes.
- Seller can view a list of all active cargo shipments with current status.

---

### US-S05: Seller Dashboard

**As a** Sales Person,  
**I want to** view a dashboard with my sales metrics and performance,  
**So that** I can understand my business performance and make informed decisions.

**Acceptance Criteria:**
- Dashboard displays total sales, total orders, average order value, and top-selling products.
- Dashboard includes a date range selector for filtering metrics.
- Dashboard shows a chart of sales over time (daily, weekly, monthly).
- Dashboard shows pending orders count and items requiring attention.
- Dashboard loads within 3 seconds.

---

### US-S06: Promotion Opportunity Listing

**As a** Sales Person,  
**I want to** create a promotion opportunity listing for a product I have not yet purchased,  
**So that** I can gauge customer interest before committing to buying inventory.

**Acceptance Criteria:**
- Seller can create a listing marked as "Promotion Opportunity" with product details and estimated pricing.
- Listing clearly indicates the item is not yet in stock and will be purchased upon order.
- Estimated delivery timeline must be provided and clearly communicated.
- Customer is informed at checkout that this is a promotion item with a longer fulfillment window.
- Seller has a defined window (e.g., 72 hours) to purchase the item after receiving an order, or the order is auto-cancelled.

---

## 3. Client (Buyer) User Stories

### US-C01: Browse and Search Products

**As a** Client,  
**I want to** browse the product catalog and search for specific items,  
**So that** I can find products I am interested in purchasing.

**Acceptance Criteria:**
- Homepage displays featured products, new arrivals, and promotional banners.
- Search supports full-text queries across product titles, descriptions, and categories.
- Search results are paginated and show product image, name, price, seller name, and product type badge.
- Search supports autocomplete suggestions after typing 3 or more characters.
- Results load within 2 seconds.

---

### US-C02: Filter Products

**As a** Client,  
**I want to** filter products by various criteria,  
**So that** I can narrow down results to find exactly what I need.

**Acceptance Criteria:**
- Filter options include: product type, price range (min/max), category, seller, location, and availability.
- Filters can be applied in combination.
- Active filters are displayed as removable chips/tags above results.
- Product count updates dynamically as filters are applied.
- A "Clear All" option resets all filters.

---

### US-C03: View Product Detail

**As a** Client,  
**I want to** view a detailed product page,  
**So that** I can make an informed purchase decision.

**Acceptance Criteria:**
- Product detail page shows: images (with zoom), name, description, price, seller info, stock status, and product type.
- For Cargo items, estimated delivery time and source location are displayed.
- For Promotion Opportunity, a clear notice explains the item will be purchased upon order.
- For Preorder, the expected release date is shown.
- Reviews and ratings are displayed below the product info.
- Related/recommended products are shown.
- An "Add to Cart" button is prominently displayed.

---

### US-C04: Add to Cart and Checkout

**As a** Client,  
**I want to** add products to my cart and complete checkout with payment,  
**So that** I can purchase items.

**Acceptance Criteria:**
- Cart shows all added items with quantity controls, price, and remove option.
- Cart total is calculated in real time including item subtotals.
- Checkout requires: shipping address, contact information, and payment method selection.
- Checkout displays order summary before payment confirmation.
- After payment, order confirmation is shown with order number and estimated delivery.
- Cart is persisted across sessions (requires login).
- Out-of-stock items cannot be added to cart; existing cart items that go out of stock are flagged.

---

### US-C05: Track Order

**As a** Client,  
**I want to** track my order status from confirmation through delivery,  
**So that** I know when to expect my purchase.

**Acceptance Criteria:**
- Orders page shows all orders with current status and date.
- Status timeline is displayed for each order: Confirmed, Processing, Packed, Cargo, In Transit, Out for Delivery, Delivered.
- For cargo orders, real-time tracking shows location and checkpoint updates.
- Client receives push/email notifications at each status change.
- Client can view estimated delivery date at each stage.

---

### US-C06: Write Reviews and Ratings

**As a** Client,  
**I want to** rate and review products I have purchased,  
**So that** I can share my experience and help other buyers.

**Acceptance Criteria:**
- Client can submit a review only for products they have purchased and received.
- Review includes a star rating (1-5) and optional text (min 10 characters, max 1000 characters).
- Client can upload up to 5 images with a review.
- Client can edit or delete their own review.
- Reviews are displayed on the product detail page sorted by date (newest first) or rating.
- Average rating is calculated and displayed on the product card and detail page.

---

### US-C07: Wishlist

**As a** Client,  
**I want to** save products to a wishlist,  
**So that** I can keep track of items I want to purchase later.

**Acceptance Criteria:**
- Client can add/remove products to/from wishlist from the product card or detail page.
- Wishlist page shows all saved products with current price and availability.
- Client is notified if a wishlist item changes price or goes out of stock.
- Wishlist is accessible from the main navigation.
- Client can move a wishlist item directly to the cart.

---

### US-C08: Client Registration and Login

**As a** Client,  
**I want to** register and log in to the platform,  
**So that** I can make purchases, track orders, and manage my account.

**Acceptance Criteria:**
- Registration requires name, email, phone number, and password.
- Phone number must be verified via OTP.
- Client can log in with email/password or phone/OTP.
- Session expires after 30 days of inactivity.
- Client can reset their password via email or OTP.
- Profile page allows editing name, email, phone, and shipping addresses.

---

## 4. Cross-Role Stories

### US-X01: Notifications System

**As any** user,  
**I want to** receive timely notifications about relevant events,  
**So that** I stay informed about my activities on the platform.

**Acceptance Criteria:**
- Notifications are delivered via in-app, push, and email (configurable per user).
- Notification types: order status changes, new messages, product approval/rejection, promotional announcements, account changes.
- Users can view a notification center with all past notifications.
- Users can mark notifications as read/unread.
- Notification preferences can be configured per type.

---

### US-X02: Search and Discovery

**As any** user,  
**I want to** find products and information quickly through search and navigation,  
**So that** I can efficiently use the platform.

**Acceptance Criteria:**
- Global search is accessible from all pages.
- Search suggestions appear as the user types.
- Search supports typo tolerance and partial matching.
- No results found shows a helpful message with suggested actions.
- Recent search history is saved for logged-in users.
