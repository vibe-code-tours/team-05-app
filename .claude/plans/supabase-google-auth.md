# Supabase Google Auth Implementation Plan

## Overview

Add Google OAuth login via Supabase Auth alongside the existing email/password system. Users can sign in with Google, and the system creates/links their account in the local database.

## Architecture Flow

```
User clicks "Sign in with Google"
        ↓
Frontend → supabase.auth.signInWithOAuth({ provider: 'google' })
        ↓
User authenticates with Google popup/redirect
        ↓
Supabase returns session (access_token)
        ↓
Frontend sends session to POST /api/v1/auth/supabase
        ↓
Backend verifies Supabase JWT via supabaseAdmin.getUser()
        ↓
Backend finds or creates local user (matched by email)
        ↓
Backend issues standard CrossMart JWT (same format as email login)
        ↓
Frontend stores token in Zustand + cookie (same as email login)
```

## Changes

### 1. Backend — Install dependency
- `npm install @supabase/supabase-js`

### 2. Backend — Create SupabaseAuthService
- **File:** `apps/api/src/modules/auth/supabase-auth.service.ts`
- Initializes a Supabase admin client using `SUPABASE_SERVICE_ROLE_KEY`
- `verifyToken(supabaseToken)` — calls `supabaseAdmin.auth.getUser(token)` to verify
- `findOrCreateUser(email, name)` — queries user by email, creates one if not found (status: ACTIVE, no password, phone placeholder)

### 3. Backend — Create SupabaseAuth DTO
- **File:** `apps/api/src/modules/auth/dto/supabase-auth.dto.ts`
- `SupabaseAuthDto { accessToken: string }`

### 4. Backend — Update auth.controller.ts
- Add `POST /auth/supabase` endpoint (public)
- Calls supabaseAuthService → authService.generateTokens()

### 5. Backend — Update auth.module.ts
- Register SupabaseAuthService in providers

### 6. Frontend — Install dependency
- `npm install @supabase/supabase-js`

### 7. Frontend — Create Supabase client
- **File:** `apps/web/src/lib/supabase.ts`
- Single supabase client from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Note:** Need to add these env vars to `apps/web/.env.local`

### 8. Frontend — Update login page
- Wire up the existing "Google" button to call `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Use `signInWithOAuth` with redirectTo for the callback

### 9. Frontend — Create auth callback page
- **File:** `apps/web/src/app/auth/callback/page.tsx` (or route handler)
- Handles the OAuth redirect from Supabase
- Extracts session, calls `/auth/supabase` on backend
- Stores tokens and redirects user

### 10. Frontend — Add web env vars
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

## Supabase Dashboard Setup (manual step)
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Configure Google Cloud Console OAuth credentials
4. Add redirect URLs (e.g., `http://localhost:3000/auth/callback`)

## What Stays Unchanged
✅ Email/password login  
✅ Registration flow (OTP still works if needed)  
✅ JWT token format  
✅ Middleware role checks  
✅ Auth store (Zustand + cookie)  
✅ All existing auth guards  

## Edge Cases Handled
- **First-time Google login** → Creates new user (ACTIVE, role: CLIENT)  
- **Existing user (same email)** → Links to existing account, issues JWT  
- **Supabase session invalid** → Returns 401 Unauthorized  
- **Google email already registered with password** → Returns conflict message  
