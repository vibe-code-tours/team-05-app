# PR #114 — Medium & Low Priority Fixes (Backlog)

> Generated from 4 parallel review agents on 2026-07-16
> PR: https://github.com/vibe-code-tours/team-05-app/pull/114
> Branch: `feat/banner-coupon-module`

---

## 🟡 MEDIUM Priority (18 issues)

### Security (3)

| # | Issue | File | Status | Fix |
|---|-------|------|--------|-----|
| M1 | DataIsolationMiddleware runs globally but nothing reads `req.dataFilter` — unnecessary overhead on every request | `apps/api/src/common/middleware/data-isolation.middleware.ts`, `apps/api/src/app.module.ts:74-79` | PRESENT | Remove middleware from `AppModule.configure()` and delete file + type declaration, OR implement actual data filtering in services |
| M2 | No auth-specific rate limiting on OTP endpoints — global 100 req/min is too generous for `verify-otp` and `resend-otp` | `apps/api/src/modules/auth/auth.controller.ts:33-49` | PRESENT | Apply `@Throttle({ default: { limit: 5, ttl: 60000 } })` to `verify-otp` and `resend-otp` endpoints |
| M3 | CORS wildcard `https://*.vercel.app` fallback allows any Vercel deployment to make authenticated cross-origin requests | `apps/api/src/main.ts:16` | PRESENT | Replace wildcard with explicit origins, or require `CORS_ORIGINS` env var (no fallback) |

### Auth (4)

| # | Issue | File | Status | Fix |
|---|-------|------|--------|-----|
| M4 | No proactive token refresh — users get silent 401 errors mid-session, `refreshToken()` is a no-op | `apps/web/src/contexts/auth-context.tsx:106-109` | PRESENT | Implement token refresh interceptor or `setInterval` before expiry |
| M5 | `console.error('Login error:', error)` leaks auth internals in production; `console.log` stubs on social login buttons | `apps/web/src/app/login/page.tsx:72,339,366` | PRESENT | Remove or replace with structured logger (Sentry); remove console.log stubs |
| M6 | Login error handling doesn't distinguish network errors from 401/429/500 — all show same generic message | `apps/web/src/app/login/page.tsx:66-76` | PRESENT | Check error type and HTTP status, show distinct messages per case |
| M7 | Hardcoded notification counts (5 admin, 3 seller) in layouts | `apps/web/src/app/admin/layout.tsx:62`, `apps/web/src/app/seller/layout.tsx:69` | PRESENT | Fetch from `GET /notifications/unread-count` API |

### UI/UX (8)

| # | Issue | File | Status | Fix |
|---|-------|------|--------|-----|
| M8 | Inconsistent design tokens — login/register use hardcoded colors (`blue-600`, `gray-50`) instead of CSS variables (`primary`, `muted`) | `apps/web/src/app/login/page.tsx`, `apps/web/src/app/register/page.tsx` | PRESENT | Replace hardcoded Tailwind colors with design tokens for dark mode support |
| M9 | Duplicated spinner SVG — identical inline SVG in login and register | `apps/web/src/app/login/page.tsx:308-310`, `apps/web/src/app/register/page.tsx:592-594` | PRESENT | Extract to shared `<Spinner />` component in `components/ui/spinner.tsx` |
| M10 | Duplicated CrossMart logo — 4 copies across 2 pages (desktop + mobile each) | `apps/web/src/app/login/page.tsx:98-107,170-177`, `apps/web/src/app/register/page.tsx:186-195,249-256` | PRESENT | Extract to shared `<CrossMartLogo variant="desktop" \| "mobile" />` |
| M11 | Duplicated `validateEmail` function — identical in both pages | `apps/web/src/app/login/page.tsx:35-38`, `apps/web/src/app/register/page.tsx:57-60` | PRESENT | Extract to `lib/utils/validation.ts` |
| M12 | Duplicated search input in header — two separate `<form>` elements for desktop/mobile | `apps/web/src/components/layout/header.tsx:117-164,249-260` | PRESENT | Extract to `<SearchBar />` component with responsive wrapper |
| M13 | `formatPrice` recreated on every render — new `Intl.NumberFormat` instance each time | `apps/web/src/components/home/product-card.tsx:45-51` | PRESENT | Move to module-level constant or wrap in `useMemo` |
| M14 | Password strength not memoized — recalculates on every render | `apps/web/src/app/register/page.tsx:85` | PRESENT | Wrap in `useMemo(() => ..., [formData.password])` |
| M15 | Missing `focus-visible` styles on navigation links — no keyboard focus indicators | `apps/web/src/components/layout/header.tsx:109,272,282` | PRESENT | Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` |

### Performance (3)

| # | Issue | File | Status | Fix |
|---|-------|------|--------|-----|
| M13 | `formatPrice` recreated on every render | `apps/web/src/components/home/product-card.tsx:45-51` | PRESENT | Move outside component or `useMemo` |
| M14 | `getPasswordStrength` not memoized | `apps/web/src/app/register/page.tsx:85` | PRESENT | `useMemo` wrapper |
| M15 | Missing `focus-visible` on nav links | `apps/web/src/components/layout/header.tsx` | PRESENT | Add focus ring styles |

---

## 🔵 LOW Priority (12 issues)

| # | Issue | File | Fix |
|---|-------|------|-----|
| L1 | `console.log('Google login')` / `console.log('Facebook login')` placeholder handlers | `apps/web/src/app/login/page.tsx:339,366` | Disable buttons with "Coming Soon" tooltip or remove |
| L2 | Nav link "Categories" links to `/products?category=electronics` instead of categories listing | `apps/web/src/components/layout/header.tsx:21` | Change href to `/categories` |
| L3 | Testimonials trust indicators use hardcoded strings (`10,000+`, `4.8/5`) | `apps/web/src/components/home/testimonials.tsx:177-181` | Extract to config constants or fetch from API |
| L4 | CTA links in why-choose-us use raw `<a>` instead of Next.js `<Link>` — causes full page reloads | `apps/web/src/components/home/why-choose-us.tsx:91-102` | Import `Link` from `next/link`, replace `<a>` |
| L5 | WhyChooseUs has `'use client'` but uses no hooks/state — unnecessary client component | `apps/web/src/components/home/why-choose-us.tsx:1` | Remove `'use client'` directive |
| L6 | Inconsistent role display — admin shows `replace("_", " ")` + capitalize, seller shows raw enum | `apps/web/src/app/admin/layout.tsx:~100`, `apps/web/src/app/seller/layout.tsx:~100` | Create shared `formatRole()` utility |
| L7 | `rememberMe` field is dead code — checkbox exists but value is never sent or used | `apps/web/src/app/login/page.tsx:14,28,283-285` | Implement persistent session or remove field entirely |
| L8 | Hardcoded notification counts (5, 3) in admin/seller layouts | `apps/web/src/app/admin/layout.tsx:66`, `apps/web/src/app/seller/layout.tsx:62` | Fetch from API or hide badge until real data |
| L9 | `allowedRoles` array reference instability — inline `['ADMIN']` creates new ref each render | `apps/web/src/app/admin/layout.tsx`, `apps/web/src/app/seller/layout.tsx` | Extract to module-level `const ADMIN_ROLES = ['ADMIN'] as const` |
| L10 | CORS wildcard `https://*.vercel.app` fallback is overly permissive | `apps/api/src/main.ts:16` | Require explicit `CORS_ORIGINS` env var |
| L11 | Swagger docs publicly accessible without auth — exposes full API surface | `apps/api/src/main.ts` | Add auth guard to `/docs` route or disable in production |
| L12 | `console.error` in auth-context leaks token details in production | `apps/web/src/contexts/auth-context.tsx` | Use structured logger or strip in production builds |

---

## ✅ Already Fixed (1)

| # | Issue | File | Commit |
|---|-------|------|--------|
| F1 | setTimeout memory leak in ProductCard | `apps/web/src/components/home/product-card.tsx` | `00aefe8` |

---

## 📊 Summary

| Priority | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| 🔴 CRITICAL | 6 | 6 | 0 |
| 🟠 HIGH | 12 | 12 | 0 |
| 🟡 MEDIUM | 18 | 1 | 17 |
| 🔵 LOW | 12 | 0 | 12 |
| **Total** | **48** | **19** | **29** |

---

## 🎯 Recommended Fix Order

### Sprint 1 (Quick Wins — ~2 hours)
1. L4: `<a>` → `<Link>` in why-choose-us (5 min)
2. L5: Remove `'use client'` from why-choose-us (2 min)
3. L1: Remove console.log stubs or disable social buttons (10 min)
4. L2: Fix Categories nav link href (2 min)
5. L7: Remove dead `rememberMe` field (10 min)
6. L9: Extract `allowedRoles` to module constants (5 min)
7. M11: Extract `validateEmail` to shared utility (10 min)
8. M9: Extract spinner to shared component (15 min)
9. M10: Extract CrossMart logo to shared component (20 min)

### Sprint 2 (Security Hardening — ~3 hours)
1. M2: Add rate limiting to OTP endpoints (30 min)
2. M3: Fix CORS wildcard fallback (15 min)
3. M4: Implement token refresh interceptor (1 hr)
4. M5: Remove console.error / use structured logger (30 min)
5. M6: Improve login error handling (30 min)
6. L10: Require CORS_ORIGINS env var (15 min)

### Sprint 3 (Code Quality — ~3 hours)
1. M1: Remove unused DataIsolationMiddleware (30 min)
2. M8: Standardize design tokens in login/register (1 hr)
3. M12: Extract SearchBar component (30 min)
4. M13: Memoize formatPrice (10 min)
5. M14: Memoize password strength (10 min)
6. M15: Add focus-visible styles (20 min)
7. L6: Standardize role display formatting (15 min)
8. L3: Extract testimonials constants (15 min)
9. L8: Fetch notification counts from API (30 min)

---

*Last updated: 2026-07-16*
