---
name: security
description: Security rules — OWASP compliance, input validation, authentication security, and vulnerability prevention
---

# Security Skill

## OWASP Top 10 Prevention

| # | Vulnerability | Prevention |
|---|---|---|
| A01 | Broken Access Control | RBAC guards, resource ownership checks |
| A02 | Cryptographic Failures | bcrypt (12 rounds), JWT signing |
| A03 | Injection | Prisma ORM (parameterized queries) |
| A04 | Insecure Design | Threat modeling, secure patterns |
| A05 | Security Misconfiguration | Environment variables |
| A06 | Vulnerable Components | Dependabot scanning |
| A07 | Auth Failures | Rate limiting, OTP expiration |
| A08 | Data Integrity Failures | Signed URLs, validation |
| A09 | Logging Failures | Audit logs, security events |
| A10 | SSRF | Input validation, URL whitelisting |

---

## Input Validation

### Backend (class-validator)
```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsNumber()
  @Min(0)
  @Max(10000000)
  price: number;

  @IsEnum(ProductType)
  type: ProductType;
}
```

### Frontend (Zod)
```typescript
const productSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().min(0).max(10000000),
  type: z.enum(['IN_STOCK', 'CARGO', 'PROMOTION']),
});
```

---

## Authentication Security

### Password Hashing
```typescript
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
```

### JWT Best Practices
- Short expiry (15 min access, 7 days refresh)
- Strong secret (RS256 for production)
- Validate on every request
- Revocation support

### Rate Limiting
```typescript
@Throttle({ short: { ttl: 1000, limit: 3 } })
async login() { ... }
```

---

## File Upload Security

- Validate MIME type
- Check file size (max 5MB)
- Scan for malware
- Use signed URLs for access
- Isolate storage (R2 bucket)

---

## Rules

**Always:**
- Validate all input
- Use parameterized queries (Prisma)
- Hash passwords with bcrypt
- Rate limit auth endpoints
- Log security events
- Use HTTPS

**Never:**
- Store secrets in code
- Skip input validation
- Use weak passwords
- Allow unlimited login attempts
- Expose sensitive data in errors
