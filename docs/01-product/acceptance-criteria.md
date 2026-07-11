# Acceptance Criteria

> **Project:** E-Commerce Marketplace Platform  
> **Version:** 1.0  
> **Last Updated:** 2026-07-10

---

## 1. Authentication and Registration

### 1.1 Client Registration

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-AUTH-001 | Required fields | Registration form requires: full name, email, phone number, password, confirm password |
| AC-AUTH-002 | Email format validation | Invalid email addresses are rejected with a clear error message |
| AC-AUTH-003 | Password strength | Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character |
| AC-AUTH-004 | Phone OTP verification | After entering phone number, an OTP is sent via SMS; account is not active until OTP is verified |
| AC-AUTH-005 | OTP expiry | OTP expires after 5 minutes; a new OTP can be requested after 60 seconds |
| AC-AUTH-006 | OTP max attempts | After 5 incorrect OTP attempts, the account is locked for 15 minutes |
| AC-AUTH-007 | Duplicate email | Registration with an already-registered email is rejected with "Email already in use" message |
| AC-AUTH-008 | Duplicate phone | Registration with an already-registered phone number is rejected with "Phone number already in use" message |
| AC-AUTH-009 | Success state | Upon successful registration, user is redirected to login page with a confirmation message |

### 1.2 Seller (Sales Person) Registration

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-AUTH-010 | NRC or Passport upload | Seller must upload a clear photo or scan of their NRC or Passport |
| AC-AUTH-011 | Document validation | Uploaded document must be an image (JPG, PNG, PDF) and under 5 MB |
| AC-AUTH-012 | Phone OTP verification | Phone number must be verified via OTP before proceeding to face verification |
| AC-AUTH-013 | Face verification | Seller must take a live selfie; system compares against NRC/Passport photo |
| AC-AUTH-014 | Face match threshold | Face match confidence must be >= 90% to pass verification |
| AC-AUTH-015 | Pending status | After submission, seller account status is "Pending Verification" until admin approval |
| AC-AUTH-016 | Admin review | Admin can view documents and face match results to approve or reject the seller |
| AC-AUTH-017 | Verification timeout | If admin does not review within 24 hours, a reminder notification is sent |
| AC-AUTH-018 | Rejection notification | If rejected, seller receives notification with reason and can resubmit after corrections |

### 1.3 Login

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-AUTH-019 | Email/password login | User can log in with registered email and password |
| AC-AUTH-020 | Phone/OTP login | User can log in with registered phone number and OTP |
| AC-AUTH-021 | Invalid credentials | Incorrect email/password shows "Invalid email or password" (no indication of which is wrong) |
| AC-AUTH-022 | Account lockout | After 5 consecutive failed login attempts, account is locked for 15 minutes |
| AC-AUTH-023 | Session management | Valid session is maintained for 30 days; user is redirected to login after expiry |
| AC-AUTH-024 | Password reset | User can request password reset via email or OTP; reset link expires after 1 hour |
| AC-AUTH-025 | Role-based redirect | After login, user is redirected to the appropriate dashboard based on role (Admin -> Admin Dashboard, Seller -> Seller Dashboard, Client -> Homepage) |

---

## 2. Product Management

### 2.1 Product Listing

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-PROD-001 | Required fields | Product creation requires: name, description, price, stock quantity, category, product type, at least 1 image |
| AC-PROD-002 | Product name length | Product name must be between 5 and 200 characters |
| AC-PROD-003 | Description length | Product description must be between 20 and 5000 characters |
| AC-PROD-004 | Price validation | Price must be a positive number with at most 2 decimal places; minimum price is $0.01 |
| AC-PROD-005 | Image upload | Seller can upload 1-10 images; first image is the primary; formats: JPG, PNG, WebP; max 5 MB each |
| AC-PROD-006 | Product type selection | Seller must select one of: In Stock, Cargo Item, Promotion Opportunity, Preorder, Local Marketplace |
| AC-PROD-007 | Cargo source | For Cargo items, seller must specify source location (Bangkok/China/Japan) and estimated lead time (in days) |
| AC-PROD-008 | Promotion notice | For Promotion Opportunity, a system-generated notice is added to the listing: "This item will be purchased upon order confirmation" |
| AC-PROD-009 | Preorder date | For Preorder, seller must provide expected release date; date must be in the future |
| AC-PROD-010 | Draft save | Seller can save a product as a draft and complete it later |
| AC-PROD-011 | Auto-save | Product form auto-saves every 30 seconds to prevent data loss |

### 2.2 Product Approval

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-PROD-012 | Pending state | Newly submitted products are in "Pending" state and not visible in the public catalog |
| AC-PROD-013 | Admin notification | Admin receives a notification when a new product is submitted for review |
| AC-PROD-014 | Review interface | Admin can view all product details, images, and seller information in the review panel |
| AC-PROD-015 | Approve action | Upon approval, product status changes to "Active" and it becomes visible in the catalog |
| AC-PROD-016 | Reject action | Upon rejection, admin must provide a reason (min 10 characters); product status changes to "Rejected" |
| AC-PROD-017 | Seller notification | Seller is notified of approval or rejection within the platform and via email |
| AC-PROD-018 | Resubmit rejected | Seller can edit a rejected product and resubmit for approval |
| AC-PROD-019 | Approval SLA | Admin must review within 48 hours; escalation notification sent at 24 hours |
| AC-PROD-020 | Bulk actions | Admin can approve or reject multiple products at once |

### 2.3 Product Visibility

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-PROD-021 | Active products | Only products with "Active" status appear in the public catalog and search results |
| AC-PROD-022 | Out of stock | Products with 0 stock show as "Out of Stock" but remain visible; "Add to Cart" is disabled |
| AC-PROD-023 | Seller suspension | If a seller is suspended, all their products are hidden from the catalog |
| AC-PROD-024 | Product deletion | Seller can delete their own products; active products are soft-deleted and archived |

---

## 3. Order Management

### 3.1 Order Creation

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-ORD-001 | Cart validation | At checkout, cart is validated for stock availability; out-of-stock items are flagged |
| AC-ORD-002 | Address requirement | Checkout requires at least one shipping address on file or entry of a new one |
| AC-ORD-003 | Payment method | Checkout requires selection of a valid payment method |
| AC-ORD-004 | Order summary | Before payment, a full order summary is displayed: items, quantities, subtotal, shipping, taxes, total |
| AC-ORD-005 | Order number | Each order receives a unique order number (e.g., ORD-2026-000001) |
| AC-ORD-006 | Order confirmation | After successful payment, an order confirmation page is shown with order number and estimated delivery |
| AC-ORD-007 | Confirmation notification | Order confirmation notification is sent to both buyer and seller |
| AC-ORD-008 | Stock decrement | Upon order confirmation, stock quantity is decremented for the ordered items |

### 3.2 Order Status Flow

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-ORD-009 | Statuses | Order statuses follow the defined flow: Confirmed -> Processing -> Packed -> Cargo -> In Transit -> Out for Delivery -> Delivered |
| AC-ORD-010 | Seller update | Seller can update status from Confirmed through Packed; Cargo and beyond require cargo partner integration |
| AC-ORD-011 | Status history | All status changes are logged with timestamp and updated-by user |
| AC-ORD-012 | Buyer notification | Buyer receives a notification at every status change |
| AC-ORD-013 | Seller notification | Seller receives a notification when a new order is placed for their products |
| AC-ORD-014 | Delivery confirmation | Order can only be marked as "Delivered" by the cargo partner or by client confirmation |
| AC-ORD-015 | Auto-cancel | Orders not confirmed by seller within 72 hours are auto-cancelled and buyer is refunded |

### 3.3 Order Cancellation and Refund

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-ORD-016 | Client cancellation | Client can cancel an order before it is marked as "Packed" |
| AC-ORD-017 | Seller cancellation | Seller can cancel an order with a mandatory reason |
| AC-ORD-018 | Refund processing | Upon cancellation, refund is initiated to the original payment method within 5 business days |
| AC-ORD-019 | Cancellation notification | Both buyer and seller are notified of cancellation with reason |
| AC-ORD-020 | Stock restoration | Upon cancellation, stock quantity is restored for the cancelled items |

---

## 4. Cargo Tracking

### 4.1 Cargo Shipment Initiation

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-CARGO-001 | Eligible orders | Cargo tracking applies only to orders with product type "Cargo Item" |
| AC-CARGO-002 | Tracking number | Seller must provide a valid tracking number and carrier name when initiating shipment |
| AC-CARGO-003 | Carrier integration | Platform supports at least 3 cargo carriers at launch |
| AC-CARGO-004 | Shipment record | A cargo shipment record is created linking order, tracking number, carrier, and origin |

### 4.2 Tracking Status Updates

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-CARGO-005 | Status checkpoints | Tracking status includes: Picked Up, In Transit, Arrived at Hub, Customs Clearance, Out for Delivery, Delivered |
| AC-CARGO-006 | Update frequency | Tracking status must be updated at least every 24 hours by the cargo partner |
| AC-CARGO-007 | Real-time sync | Tracking updates from the cargo partner are synced to the platform within 30 minutes |
| AC-CARGO-008 | Status timeline | Buyer sees a visual timeline with all checkpoints, timestamps, and current location |
| AC-CARGO-009 | Estimated delivery | Estimated delivery date is updated as the shipment progresses |
| AC-CARGO-010 | Delay notification | If a shipment is delayed beyond the estimated delivery date, buyer and seller are notified |
| AC-CARGO-011 | Customs hold | If a shipment is held at customs, status is displayed as "Customs Hold" with relevant notes |

### 4.3 Tracking Display

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-CARGO-012 | Order detail | Tracking information is accessible from the order detail page |
| AC-CARGO-013 | Tracking page | A dedicated tracking page shows full shipment history with map visualization |
| AC-CARGO-014 | Share tracking | Buyer can share tracking information via a unique link (no login required) |
| AC-CARGO-015 | Mobile responsive | Tracking page is fully responsive and works on mobile devices |

---

## 5. Payment

### 5.1 Payment Processing

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-PAY-001 | Payment gateways | Platform supports at least 2 payment gateways (e.g., mobile money, bank transfer) |
| AC-PAY-002 | Secure processing | All payment data is encrypted and processed via PCI-compliant payment gateway |
| AC-PAY-003 | Payment confirmation | Payment status is confirmed within 60 seconds of submission |
| AC-PAY-004 | Failed payment | Failed payment shows an error message and allows retry without re-entering cart details |
| AC-PAY-005 | Payment receipt | A digital receipt is generated and stored with the order record |

### 5.2 Refund Processing

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-PAY-006 | Refund trigger | Refund is triggered on order cancellation or dispute resolution |
| AC-PAY-007 | Refund method | Refund is processed to the original payment method |
| AC-PAY-008 | Refund timeline | Refund is completed within 5 business days of cancellation approval |
| AC-PAY-009 | Refund notification | Buyer receives notification when refund is initiated and when it is completed |
| AC-PAY-010 | Partial refund | Admin can issue partial refunds for partial order cancellations |

### 5.3 Payment Security

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-PAY-011 | No card storage | Credit/debit card numbers are never stored on the platform; tokenization is used |
| AC-PAY-012 | Transaction logging | All payment transactions (success, failure, refund) are logged with amount, timestamp, and gateway response |
| AC-PAY-013 | Fraud detection | Suspicious payment patterns (multiple rapid attempts, unusual amounts) trigger a review hold |
| AC-PAY-014 | PCI compliance | Payment processing complies with PCI DSS requirements |

---

## 6. Search and Filtering

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-SRCH-001 | Full-text search | Search matches against product name, description, category, and seller name |
| AC-SRCH-002 | Autocomplete | Search shows suggestions after 3+ characters are typed |
| AC-SRCH-003 | Typo tolerance | Search handles common typos and returns relevant results |
| AC-SRCH-004 | Filter options | Available filters: product type, price range, category, seller, location, availability |
| AC-SRCH-005 | Combined filters | Multiple filters can be applied simultaneously with AND logic |
| AC-SRCH-006 | Active filter display | Applied filters are shown as removable chips above results |
| AC-SRCH-007 | Result count | Total matching result count is displayed and updates when filters change |
| AC-SRCH-008 | Sort options | Results can be sorted by: relevance, price (low to high / high to low), newest, top rated |
| AC-SRCH-009 | Pagination | Results are paginated with 20 items per page |
| AC-SRCH-010 | No results | Empty results show "No products found" with suggestions to adjust filters or search terms |
| AC-SRCH-011 | Search history | Logged-in users' recent searches are saved and accessible from the search bar |
| AC-SRCH-012 | Performance | Search results return within 2 seconds for queries up to 100,000 products |

---

## 7. Reviews and Ratings

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-REV-001 | Eligibility | Client can only review products they have purchased and received |
| AC-REV-002 | One review per order | Client can submit one review per product per order |
| AC-REV-003 | Rating required | Review must include a star rating (1-5 stars) |
| AC-REV-004 | Text length | Review text is optional but if provided must be between 10 and 1000 characters |
| AC-REV-005 | Image upload | Client can upload up to 5 images with a review (JPG, PNG; max 5 MB each) |
| AC-REV-006 | Edit/delete | Client can edit or delete their own review at any time |
| AC-REV-007 | Average calculation | Product average rating is calculated from all reviews and updated in real time |
| AC-REV-008 | Display sorting | Reviews on product page are sorted by newest first by default; can be sorted by rating |
| AC-REV-009 | Moderation | Admin can remove reviews that violate platform policies |
| AC-REV-010 | Review notification | Seller is notified when a new review is posted on their product |

---

## 8. Notifications

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-NOTIF-001 | In-app notifications | All notifications are displayed in the in-app notification center |
| AC-NOTIF-002 | Push notifications | Push notifications are sent for critical events (order status, payment, verification) |
| AC-NOTIF-003 | Email notifications | Email notifications are sent for account-related events and order confirmations |
| AC-NOTIF-004 | Notification types | Supported types: order status, payment, product approval/rejection, promotion, account, system |
| AC-NOTIF-005 | Read/unread | Users can mark notifications as read; unread count is shown on the notification icon |
| AC-NOTIF-006 | Preferences | Users can enable/disable notifications per type and channel (in-app, push, email) |
| AC-NOTIF-007 | Notification history | All past notifications are accessible and searchable |
| AC-NOTIF-008 | Bulk notifications | Admin can send platform-wide notifications and announcements |

---

## 9. Banner CMS

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-BANNER-001 | Create banner | Admin can create a banner with image, title, description, target URL, and schedule |
| AC-BANNER-002 | Image requirements | Banner image must be between 1200x400 and 1920x600 pixels; max 2 MB; formats: JPG, PNG |
| AC-BANNER-003 | Scheduling | Admin sets start date/time and end date/time for banner display |
| AC-BANNER-004 | Auto activation | Banner automatically appears on the homepage at the scheduled start time |
| AC-BANNER-005 | Auto deactivation | Banner automatically stops displaying at the scheduled end time |
| AC-BANNER-006 | Edit/delete | Admin can edit or delete an active banner; changes take effect within 5 minutes |
| AC-BANNER-007 | Preview | Admin can preview a banner before publishing |
| AC-BANNER-008 | Max active banners | System enforces a configurable maximum number of simultaneously active banners (default: 5) |
| AC-BANNER-009 | Click tracking | Banner impressions and clicks are tracked for analytics |

---

## 10. Coupons

| # | Criterion | Expected Behavior |
|---|-----------|-------------------|
| AC-COUPON-001 | Create coupon | Admin creates a coupon with: code, discount type (% or flat), value, usage limit, expiry date |
| AC-COUPON-002 | Code uniqueness | Coupon codes must be unique (case-insensitive) |
| AC-COUPON-003 | Discount validation | Percentage discount is capped at 100%; flat discount cannot exceed the order total |
| AC-COUPON-004 | Usage limit | Coupon cannot be used more times than its defined usage limit |
| AC-COUPON-005 | Expiry enforcement | Expired coupons are rejected at checkout with "This coupon has expired" message |
| AC-COUPON-006 | Single use per order | Each coupon can be applied once per order |
| AC-COUPON-007 | Usage statistics | Admin can view per-coupon stats: total uses, remaining uses, total discount amount |
| AC-COUPON-008 | Deactivate | Admin can deactivate a coupon at any time; existing uses are preserved |
| AC-COUPON-009 | Bulk generation | Admin can bulk-generate up to 1000 coupon codes with a common configuration |
| AC-COUPON-010 | Checkout display | Available coupons are suggested at checkout; client can enter a code manually |
