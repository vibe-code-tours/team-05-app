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

## How to run
See the [README](../README.md) Quickstart.
