# Architecture — CrossMart (Team-05 App)

> One page. Keep it true as the project grows. A teammate should be able to read
> this and find their way around in 5 minutes.

## What it does
CrossMart is a cross-border marketplace connecting Myanmar buyers with sellers from Thailand/Bangkok. It supports product listings, cargo tracking, payments, and multi-role portals (Admin, Seller, Client).

**Source Code:** [github.com/vibe-code-tours/team-05-app](https://github.com/vibe-code-tours/team-05-app)

## Diagram

```
[ Browser UI ] --> [ API / server ] --> [ data ]
                     |
                     v
               [ AI / LLM proxy ]
```

## Where things live
| Path | What |
|---|---|
| `apps/web/` | Next.js frontend (React 19, TailwindCSS, shadcn/ui) |
| `apps/api/` | NestJS backend (REST API, WebSocket) |
| `packages/shared/` | Shared TypeScript types and utilities |
| `docs/` | Architecture, deployment, decisions |
| `.github/workflows/` | CI + security |
| `.claude/` | AI development framework (agents, skills, workflows) |

## External services
| Service | Use | Required Env Vars |
|---|---|---|
| Supabase | PostgreSQL database + Auth | `DATABASE_URL`, `SUPABASE_*` |
| Upstash Redis | Cache + Queue + Sessions | `REDIS_URL` |
| Cloudflare R2 | Object storage (images, files) | `R2_*` |
| Vercel | Frontend hosting (Next.js) | `VERCEL_TOKEN` |
| Railway | Backend hosting (NestJS Docker) | — (dashboard config) |
| Cloudflare | CDN, DNS, WAF | `CLOUDFLARE_API_TOKEN` |

## Deployment

| Service | App | URL |
|---|---|---|
| **Vercel** (prod) | Frontend | `https://team-05-app.vercel.app` |
| **Render** (free) | Backend API | `https://crossmart-api-cdjd.onrender.com` |
| **Supabase** (free) | PostgreSQL | `aws-0-ap-southeast-1.pooler.supabase.com` |

### Vercel → Render connection
The frontend reads `NEXT_PUBLIC_API_URL` at **build time** (Next.js replaces it inline). If this env var changes, **redeploy** the frontend — a new build is required.

- **Production / Preview:** set in the Vercel dashboard (not in code)
- **Local:** set in `apps/web/.env.local`

### Schema sync (Render non-Docker mode)
Render runs `node apps/api/dist/src/main.js` directly (not via Docker), so `prisma db push` in `start.sh` is **not** executed automatically. When Prisma schema changes, you must either:

1. Run locally: `npx prisma db push --schema=apps/api/prisma/schema.prisma --accept-data-loss`
2. Or use Supabase SQL Editor to run the migration SQL

**Known gotcha:** Missing columns (`failedAttempts`, `lockedUntil`, `revokedAt`, `attempts`) cause **500 Internal Server Error** instead of a helpful message — the `dbConnected` flag is only checked in service methods, but Prisma's column-level queries crash before that check.

### CORS
Backend allows origins from `CORS_ORIGINS` env var. Currently configured:
- `http://localhost:3000`
- `https://team-05-app.vercel.app`
- Vercel preview deployments (`https://*-*.vercel.app` wildcard)

Must be set in both:
1. `apps/api/.env` (local dev)
2. **Render dashboard** → Environment Variables (production)

## How to run
See the [README](../README.md) Quickstart.
