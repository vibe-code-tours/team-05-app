---
name: nextjs
description: Next.js 15 App Router rules — Server Components, layouts, pages, data fetching, routing conventions
---

# Next.js Skill

## App Router Structure

```
app/
├── (auth)/                    # Auth route group
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (main)/                    # Main route group
│   ├── page.tsx               # Homepage
│   ├── products/
│   │   ├── page.tsx           # Product listing
│   │   └── [id]/page.tsx      # Product detail
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   └── layout.tsx
├── (seller)/                  # Seller route group
│   ├── dashboard/page.tsx
│   └── layout.tsx
├── (admin)/                   # Admin route group
│   ├── dashboard/page.tsx
│   └── layout.tsx
├── layout.tsx                 # Root layout
├── not-found.tsx              # 404 page
├── error.tsx                  # Error boundary
└── loading.tsx                # Loading UI
```

---

## Server vs Client Components

### Server Components (Default)
```tsx
// This is a Server Component by default
import { db } from '@/lib/db';

export default async function ProductsPage() {
  const products = await db.product.findMany();
  return <ProductList products={products} />;
}
```

### Client Components (When Needed)
```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### When to Use 'use client'
- Using React hooks (useState, useEffect, etc.)
- Browser APIs (window, document)
- Event handlers (onClick, onSubmit)
- Interactive UI (modals, dropdowns, forms)

---

## Data Fetching

### Server Component (Recommended)
```tsx
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }, // ISR: revalidate every hour
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductList products={products} />;
}
```

### Route Handlers
```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';

  const products = await fetchProducts(page);
  return NextResponse.json(products);
}
```

---

## Route Conventions

| File | Purpose |
|---|---|
| `page.tsx` | Route UI |
| `layout.tsx` | Shared layout |
| `loading.tsx` | Loading UI (Suspense) |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 UI |
| `template.tsx` | Re-renders on navigation |
| `default.tsx` | Parallel routes fallback |

---

## Route Groups
- `(auth)` — grouping without affecting URL
- `(main)` — main app routes
- `(seller)` — seller-specific routes
- `(admin)` — admin-specific routes

## Dynamic Routes
- `[id]` — dynamic segment
- `[...slug]` — catch-all
- `[[...slug]]` — optional catch-all

---

## Rules

**Always:**
- Server Components by default
- Use `next/image` for images
- Use `next/link` for navigation
- Handle loading and error states
- Use route groups for organization

**Never:**
- `'use client'` without reason
- Fetch data in `useEffect` when Server Component works
- Use Pages Router (`pages/`)
- Hardcode image paths
- Skip error boundaries
