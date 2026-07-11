---
name: auth
description: Authentication, authorization, JWT, OTP, RBAC, permissions, and session management
---

# Authentication Skill

## Domain Overview

CrossMart supports **Phone OTP** and **Email/Password** authentication with **Role-Based Access Control (RBAC)**.

---

## Authentication Methods

### Phone OTP
```
1. Customer enters phone number
2. System generates 6-digit OTP
3. OTP sent via SMS (5-minute expiry)
4. Customer enters OTP
5. System verifies and issues JWT
```

### Email/Password
```
1. User enters email + password
2. System validates credentials
3. Password verified (bcrypt)
4. System issues JWT
```

---

## JWT Token Structure

```typescript
{
  sub: "user-uuid",
  email: "user@example.com",
  role: "CLIENT" | "SELLER" | "ADMIN",
  permissions: ["products:read", "orders:write", ...],
  iat: 1234567890,
  exp: 1234568790  // 15 minutes
}
```

### Token Lifetimes
- **Access Token:** 15 minutes
- **Refresh Token:** 7 days
- **OTP:** 5 minutes

---

## RBAC Roles & Permissions

### Role Hierarchy
```
ADMIN (full access)
  ↓
SELLER (manage own products/orders)
  ↓
CLIENT (browse, purchase, review)
```

### Permission Matrix

| Action | ADMIN | SELLER | CLIENT |
|---|---|---|---|
| users:list | ✅ | ❌ | ❌ |
| users:read:own | ✅ | ✅ | ✅ |
| users:update:own | ✅ | ✅ | ✅ |
| products:create | ✅ | ✅ | ❌ |
| products:read | ✅ | ✅ | ✅ |
| products:update:own | ✅ | ✅ | ❌ |
| products:delete:own | ✅ | ✅ | ❌ |
| products:approve | ✅ | ❌ | ❌ |
| orders:create | ✅ | ❌ | ✅ |
| orders:read:own | ✅ | ✅ | ✅ |
| orders:update:own | ✅ | ✅ | ❌ |
| payments:verify | ✅ | ❌ | ❌ |
| payments:create | ✅ | ❌ | ✅ |
| shipments:update | ✅ | ✅ | ❌ |
| reviews:create | ✅ | ❌ | ✅ |
| reviews:delete | ✅ | ❌ | ❌ |
| reports:all | ✅ | ❌ | ❌ |
| reports:own | ✅ | ✅ | ❌ |

---

## Guard Implementation

### JwtAuthGuard
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

### RolesGuard
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login with email/password |
| POST | /api/v1/auth/otp/request | Request OTP |
| POST | /api/v1/auth/otp/verify | Verify OTP |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/logout | Logout (invalidate refresh) |

---

## Security Rules

**Always:**
- Hash passwords with bcrypt (12 rounds)
- Rate limit auth endpoints (1 req/sec)
- Expire OTP after 5 minutes
- Validate JWT on every request
- Log authentication events

**Never:**
- Store plain-text passwords
- Allow unlimited login attempts
- Skip token validation
- Expose user roles in public responses
- Use weak JWT secrets
