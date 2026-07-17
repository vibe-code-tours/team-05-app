# Architecture: Role-Based Access Control & Portals

## Overview

Detailed architecture for implementing RBAC with 3 portals in CrossMart.

---

## 1. Backend Architecture

### 1.1 RolesGuard Implementation

**File:** `apps/api/src/common/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => {
  return SetMetadata(ROLES_KEY, roles);
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(' or ')}. Your role: ${user.role}`
      );
    }

    return true;
  }
}
```

### 1.2 Role Decorators

**File:** `apps/api/src/common/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Convenience decorators
export const AdminOnly = () => Roles(Role.ADMIN);
export const SellerOnly = () => Roles(Role.SELLER);
export const ClientOnly = () => Roles(Role.CLIENT);
export const SellerOrAdmin = () => Roles(Role.SELLER, Role.ADMIN);
```

### 1.3 Data Isolation Middleware

**File:** `apps/api/src/common/middleware/data-isolation.middleware.ts`

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DataIsolationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user;

    if (!user) {
      return next();
    }

    // Add data filter based on role
    switch (user.role) {
      case 'ADMIN':
        // Admin sees everything - no filter
        req.dataFilter = {};
        break;

      case 'SELLER':
        // Seller only sees own data
        req.dataFilter = { sellerId: user.id };
        break;

      case 'CLIENT':
        // Client only sees own data
        req.dataFilter = { buyerId: user.id };
        break;
    }

    next();
  }
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      dataFilter?: Record<string, any>;
    }
  }
}
```

### 1.4 JWT Token Structure

**Current structure in `auth.service.ts`:**
```typescript
const payload = { sub: userId, email, role };
const accessToken = this.jwt.sign(payload, { expiresIn: "15m" });
const refreshToken = this.jwt.sign(payload, { expiresIn: "7d" });
```

**Enhanced structure:**
```typescript
const payload = {
  sub: userId,
  email,
  role,
  iat: Math.floor(Date.now() / 1000),
  type: 'access' | 'refresh'
};
```

### 1.5 API Endpoint Structure

**Admin Endpoints:**
```
GET    /api/admin/users           - List all users
GET    /api/admin/users/:id       - Get user details
PATCH  /api/admin/users/:id/status - Suspend/ban user
PATCH  /api/admin/users/:id/role   - Change user role
GET    /api/admin/products        - List all products
PATCH  /api/admin/products/:id/approve - Approve product
GET    /api/admin/orders          - List all orders
POST   /api/admin/orders/:id/refund - Process refund
GET    /api/admin/reports/analytics - Platform analytics
```

**Seller Endpoints:**
```
GET    /api/seller/products       - List own products
POST   /api/seller/products       - Create product
GET    /api/seller/products/:id   - Get product details
PATCH  /api/seller/products/:id   - Update product
DELETE /api/seller/products/:id   - Delete product
GET    /api/seller/orders         - List own orders
PATCH  /api/seller/orders/:id/status - Update order status
GET    /api/seller/cargo          - Track own cargo
GET    /api/seller/reports        - Sales reports
```

**Client Endpoints:**
```
GET    /api/client/products       - Browse products
POST   /api/client/cart           - Add to cart
GET    /api/client/cart           - View cart
DELETE /api/client/cart/:id       - Remove from cart
POST   /api/client/checkout       - Checkout
GET    /api/client/orders         - Order history
GET    /api/client/orders/:id     - Order details
POST   /api/client/reviews        - Create review
GET    /api/client/wishlist       - View wishlist
POST   /api/client/wishlist       - Add to wishlist
DELETE /api/client/wishlist/:id   - Remove from wishlist
```

---

## 2. Frontend Architecture

### 2.1 Auth Context Provider

**File:** `apps/web/src/contexts/auth-context.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SELLER' | 'CLIENT';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSeller: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Validate token and get user info
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      // Call API to validate token and get user info
      const response = await fetch('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      setUser(data.data.user);

      // Redirect based on role
      redirectByRole(data.data.user.role);
    } else {
      throw new Error(data.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'SELLER':
        router.push('/seller');
        break;
      case 'CLIENT':
      default:
        router.push('/');
        break;
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER';
  const isClient = user?.role === 'CLIENT';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isSeller, isClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 2.2 Route Guards

**File:** `apps/web/src/components/auth/protected-route.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'SELLER' | 'CLIENT')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not logged in - redirect to login
      router.push('/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      // Wrong role - redirect to correct portal
      redirectByRole(user.role);
      return;
    }
  }, [user, loading, allowedRoles, router]);

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'SELLER':
        router.push('/seller');
        break;
      case 'CLIENT':
      default:
        router.push('/');
        break;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
```

### 2.3 Portal Layouts

**Admin Layout:** `apps/web/src/app/admin/layout.tsx`
```typescript
'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { AdminSidebar } from '@/components/admin/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
```

**Seller Layout:** `apps/web/src/app/seller/layout.tsx`
```typescript
'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { SellerSidebar } from '@/components/seller/sidebar';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <div className="flex min-h-screen">
        <SellerSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
```

**Client Layout:** `apps/web/src/app/layout.tsx`
```typescript
// Root layout - already exists, just add auth provider
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2.4 Zustand Stores

**Auth Store:** `apps/web/src/stores/auth-store.ts`
```typescript
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SELLER' | 'CLIENT';
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null });
  },
}));
```

---

## 3. Database Design

### 3.1 Existing User Model (No Changes Needed)

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  phone     String     @unique
  name      String
  password  String
  role      Role       @default(CLIENT)
  status    UserStatus @default(ACTIVE)
  avatar    String?
  version   Int        @default(0)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // Relations
  products         Product[]
  orders           Order[]           @relation("BuyerOrders")
  sellerOrders     Order[]           @relation("SellerOrders")
  reviews          Review[]
  notifications    Notification[]
}

enum Role {
  ADMIN
  SELLER
  CLIENT
}
```

### 3.2 Data Isolation Queries

**Seller sees only own products:**
```typescript
const products = await prisma.product.findMany({
  where: {
    sellerId: user.id, // Data isolation
    // ...other filters
  },
});
```

**Client sees only own orders:**
```typescript
const orders = await prisma.order.findMany({
  where: {
    buyerId: user.id, // Data isolation
    // ...other filters
  },
});
```

**Admin sees everything:**
```typescript
const products = await prisma.product.findMany({
  where: {
    // No data isolation filter
    // ...other filters
  },
});
```

---

## 4. File Structure

### Backend
```
apps/api/src/
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts      (exists)
│   │   └── roles.guard.ts         (NEW)
│   ├── decorators/
│   │   ├── roles.decorator.ts     (NEW)
│   │   └── current-user.decorator.ts (NEW)
│   ├── middleware/
│   │   └── data-isolation.middleware.ts (NEW)
│   └── interceptors/
│       └── role-based.interceptor.ts (NEW)
├── modules/
│   ├── admin/                     (NEW module)
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   ├── admin.module.ts
│   │   └── dto/
│   ├── seller/                    (NEW module)
│   │   ├── seller.controller.ts
│   │   ├── seller.service.ts
│   │   ├── seller.module.ts
│   │   └── dto/
│   └── client/                    (NEW module)
│       ├── client.controller.ts
│       ├── client.service.ts
│       ├── client.module.ts
│       └── dto/
```

### Frontend
```
apps/web/src/
├── contexts/
│   └── auth-context.tsx           (NEW)
├── components/
│   ├── auth/
│   │   ├── protected-route.tsx    (NEW)
│   │   └── role-guard.tsx         (NEW)
│   ├── admin/
│   │   ├── sidebar.tsx            (NEW)
│   │   └── user-table.tsx         (NEW)
│   ├── seller/
│   │   ├── sidebar.tsx            (NEW)
│   │   └── product-grid.tsx       (NEW)
│   └── client/
│       ├── product-card.tsx       (exists)
│       └── cart-sidebar.tsx       (exists)
├── stores/
│   ├── auth-store.ts              (NEW)
│   └── cart-store.ts              (exists)
├── app/
│   ├── admin/                     (EXISTS - enhance)
│   │   ├── layout.tsx             (UPDATE - add ProtectedRoute)
│   │   ├── page.tsx               (UPDATE - add dashboard)
│   │   └── users/page.tsx         (UPDATE - add RBAC)
│   ├── seller/                    (EXISTS - enhance)
│   │   ├── layout.tsx             (UPDATE - add ProtectedRoute)
│   │   └── page.tsx               (UPDATE - add dashboard)
│   └── (client)/                  (EXISTS - enhance)
│       ├── layout.tsx             (UPDATE - add AuthProvider)
│       └── page.tsx               (UPDATE - enhance UI)
```

---

## 5. Implementation Phases

### Phase 1: Backend Guards (Day 1-2)
1. Create `roles.guard.ts`
2. Create `roles.decorator.ts`
3. Create `current-user.decorator.ts`
4. Test guards with existing controllers

### Phase 2: Frontend Auth (Day 3-4)
1. Create `auth-context.tsx`
2. Create `protected-route.tsx`
3. Update root layout with AuthProvider
4. Test login/logout flow

### Phase 3: Route Guards (Day 5)
1. Update admin layout with ProtectedRoute
2. Update seller layout with ProtectedRoute
3. Test role-based redirects
4. Fix bug: "BUYER" → "CLIENT" in registration

### Phase 4: Admin Portal (Day 6-8)
1. Create admin module (backend)
2. Create user management endpoints
3. Create user management UI
4. Add admin dashboard

### Phase 5: Seller Portal (Day 9-11)
1. Create seller module (backend)
2. Add data isolation to existing endpoints
3. Enhance seller UI
4. Add seller dashboard

### Phase 6: Client Portal (Day 12-14)
1. Create client module (backend)
2. Add data isolation to existing endpoints
3. Enhance client UI
4. Improve product browsing

### Phase 7: UI/UX Enhancement (Day 15-18)
1. Update design system (colors, typography)
2. Add loading states
3. Add error handling
4. Add animations
5. Mobile responsiveness

---

## 6. Bug Fix: Registration Role

**Issue:** Frontend uses "BUYER" but backend expects "CLIENT"

**Fix:** Update registration page to use "CLIENT" instead of "BUYER"

**File:** `apps/web/src/app/register/page.tsx`

```typescript
// Change this:
const role = 'BUYER';

// To this:
const role = 'CLIENT';
```

---

## 7. Security Considerations

### JWT Best Practices
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Role in token payload (verified on each request)
- Token type field (access/refresh) to prevent misuse

### Role Escalation Protection
- Never trust client-side role checks
- Always verify role on server
- Use guards on every protected endpoint
- Log role change attempts

### Session Management
- Store tokens in httpOnly cookies (production)
- Use localStorage for development
- Implement token refresh
- Logout = clear all tokens

---

## 8. Testing Strategy

### Unit Tests
- RolesGuard tests
- Data isolation middleware tests
- Auth context tests

### Integration Tests
- Role-based API access tests
- Portal redirect tests
- Data isolation tests

### E2E Tests
- Login → redirect to correct portal
- Wrong role → redirect to correct portal
- CRUD operations with role checks

---

## 9. Success Criteria

- [ ] Admin can access all portals and manage users
- [ ] Seller can only access seller portal and see own data
- [ ] Client can only access client portal and see own data
- [ ] Wrong role redirects to correct portal
- [ ] All API endpoints are protected
- [ ] No security vulnerabilities
- [ ] UI/UX is modern and responsive
- [ ] All tests pass
