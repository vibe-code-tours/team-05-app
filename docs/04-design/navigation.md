# Navigation Structure

## 1. Overview

CrossMart uses a responsive navigation pattern: **Bottom Navigation Bar on mobile** and **Fixed Sidebar on desktop**. Navigation items are role-based, showing only relevant links for the authenticated user's role.

## 2. Mobile Navigation (Bottom Nav)

Target: screens < 1024px width.

### 2.1 Layout

- Fixed bottom bar, full width
- Height: 64px, with safe-area-inset padding for iOS
- 4-5 navigation items, evenly spaced
- Glassmorphism backdrop: `backdrop-blur-md bg-background/80 border-t`
- Active state: rose accent icon + label (`#E11D48`)

### 2.2 Standard Items (All Roles)

| Icon | Label | Route |
|------|-------|-------|
| Home | Home | `/` |
| Search | Explore | `/explore` |
| ShoppingCart | Cart | `/cart` |
| Bell | Notifications | `/notifications` |
| User | Account | `/account` |

### 2.3 Role-Based Additions

**Seller items** replace or append to the standard set:

| Icon | Label | Route |
|------|-------|-------|
| Package | My Orders | `/seller/orders` |
| BarChart3 | Dashboard | `/seller/dashboard` |

**Admin items:**

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Admin Panel | `/admin` |
| Users | User Management | `/admin/users` |

## 3. Desktop Navigation (Sidebar)

Target: screens >= 1024px width.

### 3.1 Layout

- Fixed left sidebar, 256px width
- Collapsible to 64px (icon-only mode)
- Top: CrossMart logo + app name
- Middle: Navigation links (scrollable if needed)
- Bottom: User profile avatar + name + logout
- Background: `bg-background` with right border
- Active state: rose background tint (`bg-primary-light`) + rose text

### 3.2 Standard Items (All Roles)

| Icon | Label | Route |
|------|-------|-------|
| Home | Home | `/` |
| Search | Explore | `/explore` |
| ShoppingCart | Cart | `/cart` |
| Bell | Notifications | `/notifications` |
| Heart | Wishlist | `/wishlist` |
| User | My Account | `/account` |
| Package | Order History | `/orders` |

### 3.3 Seller Items (appended below standard)

| Icon | Label | Route |
|------|-------|-------|
| Store | Seller Dashboard | `/seller/dashboard` |
| Package | My Products | `/seller/products` |
| ClipboardList | Orders Received | `/seller/orders` |
| BarChart3 | Analytics | `/seller/analytics` |
| Settings | Store Settings | `/seller/settings` |

### 3.4 Admin Items (appended below seller)

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Admin Dashboard | `/admin` |
| Users | User Management | `/admin/users` |
| Package | Product Moderation | `/admin/products` |
| Truck | Cargo Management | `/admin/cargo` |
| Flag | Reports & Flags | `/admin/reports` |
| Settings | System Settings | `/admin/settings` |

## 4. Route Structure

```
/                           # Home (public)
/explore                    # Product listing (public)
/explore/:category          # Category filtered listing
/product/:id                # Product detail (public)
/search?q=                  # Search results

/cart                       # Shopping cart (auth required)
/checkout                   # Checkout flow (auth required)
/orders                     # Order history (auth required)
/orders/:id                 # Order detail + tracking (auth required)
/wishlist                   # Saved items (auth required)
/notifications              # Notification center (auth required)
/account                    # Profile settings (auth required)
/account/edit               # Edit profile

/seller/dashboard           # Seller overview
/seller/products            # Product management
/seller/products/new        # Create product
/seller/products/:id/edit   # Edit product
/seller/orders              # Incoming orders
/seller/analytics           # Sales analytics
/seller/settings            # Store configuration

/admin                      # Admin dashboard
/admin/users                # User management
/admin/products             # Product moderation
/admin/cargo                # Cargo/shipping management
/admin/reports              # Reports and flags
/admin/settings             # System settings

/auth/login                 # Login page
/auth/register              # Registration page
/auth/forgot-password       # Password reset
```

## 5. Authentication-Gated Navigation

- Unauthenticated users see only public routes + Login/Register
- Authenticated users see standard items
- Seller role sees seller items
- Admin role sees admin items
- Navigation items are conditionally rendered based on JWT claims
- Redirect to `/auth/login` if accessing protected route without auth

## 6. Responsive Transition

At the `lg` breakpoint (1024px):

- Bottom nav hides, sidebar appears
- Content area shifts right by sidebar width (256px)
- Sidebar collapse toggle available at all times
- No layout jump: content reflows smoothly via CSS grid or flexbox
