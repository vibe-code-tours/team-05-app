# Role-Based Access Control & Portal Implementation Spec

## Overview

Implement role-based access control (RBAC) with 3 separate portals for CrossMart marketplace:
- **Admin Portal** — Full platform control
- **Seller Portal** — Seller-specific operations
- **Client Portal** — Customer-facing operations

---

## 1. User Roles & Permissions

### Role Hierarchy
```
ADMIN > SELLER > CLIENT
```

### Permission Matrix

| Feature | ADMIN | SELLER | CLIENT |
|---------|-------|--------|--------|
| **Users** | | | |
| View all users | ✅ | ❌ | ❌ |
| Suspend/ban users | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| **Products** | | | |
| View all products | ✅ | ❌ | ✅ (browse) |
| View own products | ✅ | ✅ | ❌ |
| Create products | ✅ | ✅ | ❌ |
| Edit products | ✅ | ✅ (own) | ❌ |
| Delete products | ✅ | ✅ (own) | ❌ |
| Approve products | ✅ | ❌ | ❌ |
| **Orders** | | | |
| View all orders | ✅ | ❌ | ❌ |
| View seller orders | ✅ | ✅ (own) | ❌ |
| View client orders | ✅ | ❌ | ✅ (own) |
| Update order status | ✅ | ✅ (own) | ❌ |
| Cancel orders | ✅ | ✅ (own) | ✅ (own) |
| **Payments** | | | |
| View all payments | ✅ | ❌ | ❌ |
| View own payments | ✅ | ✅ | ✅ |
| Process refunds | ✅ | ❌ | ❌ |
| Verify payments | ✅ | ✅ (own) | ❌ |
| **Cargo** | | | |
| View all cargo | ✅ | ❌ | ❌ |
| Track own cargo | ✅ | ✅ (own) | ✅ (own) |
| Update cargo status | ✅ | ✅ (own) | ❌ |
| **Reports** | | | |
| Platform analytics | ✅ | ❌ | ❌ |
| Seller analytics | ✅ | ✅ (own) | ❌ |
| Purchase history | ✅ | ❌ | ✅ |
| **System** | | | |
| System settings | ✅ | ❌ | ❌ |
| Manage banners | ✅ | ❌ | ❌ |
| Manage coupons | ✅ | ✅ (own) | ❌ |
| Manage notifications | ✅ | ✅ | ✅ |

---

## 2. User Stories

### Admin Portal

#### User Management
- **As an admin**, I want to view all users so that I can monitor platform activity
  - **Acceptance:**
    - Display paginated list of all users
    - Filter by role (ADMIN, SELLER, CLIENT)
    - Filter by status (ACTIVE, PENDING, SUSPENDED, BANNED)
    - Search by name, email, phone
    - View user details (profile, orders, activity)

- **As an admin**, I want to suspend or ban users so that I can enforce platform rules
  - **Acceptance:**
    - Suspend user (temporary, can be reversed)
    - Ban user (permanent, cannot be reversed)
    - Add reason for suspension/ban
    - Send notification to user
    - Log action in audit trail

- **As an admin**, I want to change user roles so that I can manage platform access
  - **Acceptance:**
    - Change CLIENT → SELLER (requires verification)
    - Change SELLER → CLIENT (with confirmation)
    - Change any role → ADMIN (requires super-admin)
    - Log role changes

#### Product Management
- **As an admin**, I want to view all products so that I can monitor marketplace
  - **Acceptance:**
    - View all products across all sellers
    - Filter by status, category, seller
    - Approve/reject pending products
    - Feature products on homepage

#### Order Management
- **As an admin**, I want to view all orders so that I can track platform activity
  - **Acceptance:**
    - View all orders with filters
    - Process refunds
    - Resolve disputes
    - Override order status

#### Reports & Analytics
- **As an admin**, I want to view platform analytics so that I can make business decisions
  - **Acceptance:**
    - Total users, orders, revenue
    - User growth trends
    - Top sellers, products
    - Conversion rates

---

### Seller Portal

#### Product Management
- **As a seller**, I want to manage my products so that I can sell items
  - **Acceptance:**
    - Create new products with images, description, price
    - Edit existing products
    - Delete products (only if no pending orders)
    - Set inventory levels
    - Mark as IN_STOCK or CARGO

- **As a seller**, I want to track my inventory so that I don't oversell
  - **Acceptance:**
    - View current stock levels
    - Low stock alerts
    - Update inventory
    - Stock history

#### Order Management
- **As a seller**, I want to view my orders so that I can fulfill them
  - **Acceptance:**
    - View orders containing my products
    - Filter by status
    - Update order status (processing, shipped, delivered)
    - View order details (buyer info, items, payment)

- **As a seller**, I want to handle cargo orders so that I can manage cross-border shipments
  - **Acceptance:**
    - Track cargo status
    - Update cargo milestones
    - View shipping details
    - Handle customs clearance

#### Reports
- **As a seller**, I want to view my sales reports so that I can track performance
  - **Acceptance:**
    - Total sales, revenue
    - Top products
    - Sales trends
    - Order fulfillment rates

---

### Client Portal

#### Product Browsing
- **As a client**, I want to browse products so that I can find items to buy
  - **Acceptance:**
    - View product catalog
    - Search by name, category
    - Filter by price, type, seller
    - View product details, images, reviews

- **As a client**, I want to save products so that I can buy later
  - **Acceptance:**
    - Add to wishlist
    - Remove from wishlist
    - View wishlist
    - Move wishlist to cart

#### Shopping Cart & Checkout
- **As a client**, I want to add products to cart so that I can buy multiple items
  - **Acceptance:**
    - Add/remove items
    - Update quantities
    - View cart total
    - Apply coupons

- **As a client**, I want to checkout so that I can complete my purchase
  - **Acceptance:**
    - Select shipping address
    - Choose payment method
    - Upload payment slip
    - Confirm order
    - Receive order confirmation

#### Order Management
- **As a client**, I want to view my orders so that I can track purchases
  - **Acceptance:**
    - View order history
    - View order details
    - Track shipment status
    - Cancel pending orders

- **As a client**, I want to track my cargo so that I know when my order arrives
  - **Acceptance:**
    - View cargo milestones
    - Real-time tracking
    - Delivery notifications

#### Reviews
- **As a client**, I want to review products so that I can help other buyers
  - **Acceptance:**
    - Rate products (1-5 stars)
    - Write review text
    - Only review purchased products
    - Edit/delete own reviews

---

## 3. Technical Implementation

### Backend (NestJS)

#### Auth Guards
```typescript
// Roles guard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController { ... }

// Seller guard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@Controller('seller')
export class SellerController { ... }

// Client guard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
@Controller('client')
export class ClientController { ... }
```

#### Data Access Rules
- **Admin:** Can query all data
- **Seller:** Can only query data where `sellerId = user.id`
- **Client:** Can only query data where `buyerId = user.id`

#### API Endpoints

**Admin Endpoints:**
- `GET /admin/users` — List all users
- `PATCH /admin/users/:id/status` — Suspend/ban user
- `PATCH /admin/users/:id/role` — Change user role
- `GET /admin/products` — List all products
- `PATCH /admin/products/:id/approve` — Approve product
- `GET /admin/orders` — List all orders
- `POST /admin/orders/:id/refund` — Process refund
- `GET /admin/reports/analytics` — Platform analytics

**Seller Endpoints:**
- `GET /seller/products` — List own products
- `POST /seller/products` — Create product
- `PATCH /seller/products/:id` — Update product
- `DELETE /seller/products/:id` — Delete product
- `GET /seller/orders` — List own orders
- `PATCH /seller/orders/:id/status` — Update order status
- `GET /seller/cargo` — Track own cargo
- `GET /seller/reports` — Sales reports

**Client Endpoints:**
- `GET /client/products` — Browse products
- `POST /client/cart` — Add to cart
- `GET /client/cart` — View cart
- `POST /client/checkout` — Checkout
- `GET /client/orders` — Order history
- `GET /client/orders/:id` — Order details
- `POST /client/reviews` — Create review
- `GET /client/wishlist` — View wishlist

---

### Frontend (Next.js)

#### Portal Structure
```
/app
├── /admin                    # Admin Portal
│   ├── /users                # User management
│   ├── /products             # Product management
│   ├── /orders               # Order management
│   ├── /banners              # Banner management
│   ├── /coupons              # Coupon management
│   ├── /reports              # Analytics
│   └── /settings             # System settings
│
├── /seller                   # Seller Portal
│   ├── /products             # Product management
│   │   ├── /new              # Create product
│   │   └── /[id]/edit        # Edit product
│   ├── /orders               # Order management
│   ├── /cargo                # Cargo tracking
│   ├── /reports              # Sales reports
│   └── /profile              # Seller profile
│
├── / (client)                # Client Portal
│   ├── /products             # Browse products
│   ├── /cart                 # Shopping cart
│   ├── /checkout             # Checkout
│   ├── /orders               # Order history
│   ├── /wishlist             # Wishlist
│   └── /profile              # Client profile
│
├── /login                    # Login page
├── /register                 # Registration
└── /verify-otp               # OTP verification
```

#### Auth Flow
```
1. User logs in → JWT with role
2. Redirect to portal based on role:
   - ADMIN → /admin
   - SELLER → /seller
   - CLIENT → /
3. Portal checks role on each page
4. Wrong role → redirect to correct portal
```

#### UI/UX Requirements

**General:**
- Clean, modern design
- Responsive (mobile-first)
- Consistent navigation
- Loading states
- Error handling
- Toast notifications

**Admin Portal:**
- Dashboard with key metrics
- Sidebar navigation
- Data tables with filters
- Modal dialogs for actions
- Confirmation dialogs for destructive actions

**Seller Portal:**
- Dashboard with sales overview
- Product management grid
- Order list with status badges
- Cargo tracking timeline
- Reports with charts

**Client Portal:**
- Product grid with images
- Shopping cart sidebar
- Checkout wizard
- Order tracking timeline
- Review forms

---

## 4. Implementation Phases

### Phase 1: Backend Guards (Week 1)
- [ ] Create RolesGuard
- [ ] Create role-based decorators
- [ ] Add guards to existing controllers
- [ ] Test role-based access

### Phase 2: Admin Portal (Week 2)
- [ ] User management endpoints
- [ ] User management UI
- [ ] Product approval endpoints
- [ ] Product approval UI
- [ ] Admin dashboard

### Phase 3: Seller Portal (Week 3)
- [ ] Seller data isolation
- [ ] Product CRUD endpoints
- [ ] Product management UI
- [ ] Order management endpoints
- [ ] Order management UI

### Phase 4: Client Portal (Week 4)
- [ ] Client data isolation
- [ ] Enhanced product browsing
- [ ] Improved cart/checkout
- [ ] Order tracking UI
- [ ] Review system

### Phase 5: UI/UX Enhancement (Week 5)
- [ ] Design system updates
- [ ] Responsive improvements
- [ ] Loading states
- [ ] Error handling
- [ ] Animations

---

## 5. Success Criteria

- [ ] Admin can manage all users
- [ ] Sellers can only see their own data
- [ ] Clients can only see their own data
- [ ] Wrong role redirects to correct portal
- [ ] All portals are responsive
- [ ] UI/UX is modern and intuitive
- [ ] No security vulnerabilities
- [ ] All tests pass

---

## 6. Out of Scope

- Multi-admin roles (super-admin, admin, moderator)
- API rate limiting per role
- Role-based UI component visibility
- Audit logging (can be added later)
- 2FA for admin (can be added later)
