# CrossMart — Free Infrastructure Setup

> 100% free deployment stack for MVP development.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FREE DEPLOYMENT STACK                     │
├─────────────────┬───────────────────┬───────────────────────┤
│ Layer           │ Service           │ Free Tier             │
├─────────────────┼───────────────────┼───────────────────────┤
│ Frontend        │ Vercel            │ ✅ Permanent free      │
│ Backend API     │ Render            │ ✅ 750 hrs/mo free     │
│ Database        │ Supabase          │ ✅ Permanent free      │
│ Auth            │ Supabase Auth     │ ✅ Permanent free      │
│ Storage         │ Cloudflare R2     │ ✅ Permanent free      │
│ Cache           │ Upstash Redis     │ ✅ Permanent free      │
│ CDN/DNS         │ Cloudflare        │ ✅ Permanent free      │
│ CI/CD           │ GitHub Actions    │ ✅ Permanent free      │
├─────────────────┴───────────────────┴───────────────────────┤
│ Total Cost: $0                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Frontend — Vercel (Free)

### Setup Steps

1. **Push code to GitHub**
2. **Go to [vercel.com](https://vercel.com)** → Sign up with GitHub
3. **Import repository** → Select `team-05-app`
4. **Configure project:**
   - Framework Preset: `Next.js`
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
   ```
6. **Deploy**

### Free Tier Limits

| Feature | Limit |
|---------|-------|
| Bandwidth | 100 GB/mo |
| Builds | 1,000 min/mo |
| Serverless Functions | 100 GB-hours |
| Projects | Unlimited |
| Custom Domains | Unlimited |
| SSL | Automatic |

### Vercel CLI (Optional)

```bash
npm i -g vercel
vercel login
vercel dev        # Local development
vercel --prod     # Deploy to production
```

---

## 2. Backend — Render (Free)

### Setup Steps

1. **Go to [render.com](https://render.com)** → Sign up with GitHub
2. **New Web Service** → Deploy from GitHub repo
3. **Select repository** → `team-05-app`
4. **Configure service:**
   - Name: `crossmart-api`
   - Runtime: Docker
   - Dockerfile: `./apps/api/Dockerfile`
   - Region: Singapore
5. **Add Environment Variables** (see Section 6)
6. **Service will be live at:** `https://crossmart-api-cdjd.onrender.com`

### Free Tier Limits

| Feature | Limit |
|---------|-------|
| Runtime | 750 hrs/mo |
| RAM | 512 MB |
| CPU | Shared |
| Disk | Free tier included |
| Cold Start | ~30s after idle |

### Superseded: Railway Migration

| Platform | Free Tier | Cold Start | Best For |
|----------|-----------|------------|----------|
| **Render.com** | 750 hrs/mo | ~30s | Simple apps |
| **Fly.io** | 3 shared VMs | None | Always-on apps |
| **Koyeb** | 1 free nano | None | Always-on apps |
| **Hetzner VPS** | €4/mo | None | Full control |

---

## 3. Database — Supabase (Free)

### Setup Steps

1. **Go to [supabase.com](https://supabase.com)** → Sign up with GitHub
2. **New Project** → Name: `crossmart`
3. **Choose region** → Closest to your users (e.g., `Southeast Asia`)
4. **Set database password** → Save securely
5. **Get connection string:**
   - Go to Settings → Database → Connection string
   - Copy the `URI` under "Transaction" mode
   - Replace `[YOUR-PASSWORD]` with your password

### Free Tier Limits

| Feature | Limit |
|---------|-------|
| Database | 500 MB |
| Storage | 1 GB |
| Auth MAU | 50,000 |
| Edge Functions | 500k invocations/mo |
| Realtime | 200 concurrent |
| Projects | 2 active |

### Prisma Configuration

```prisma
// apps/api/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Run Migrations on Supabase

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Or create migration
npx prisma migrate dev --name init
npx prisma migrate deploy
```

---

## 4. Auth — Supabase Auth (Free)

Supabase Auth is included free. You can use either:

### Option A: Supabase Auth (Recommended for free stack)

```typescript
// Frontend
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### Option B: Keep NestJS JWT Auth

Your existing NestJS auth still works. Just connect to Supabase PostgreSQL:

```typescript
// apps/api/src/config/prisma.service.ts
// No changes needed - Prisma connects to Supabase the same way
```

---

## 5. Storage — Cloudflare R2 (Free)

### Setup Steps

1. **Go to [Cloudflare Dashboard](https://dash.cloudflare.com)**
2. **R2 Object Storage** → Create bucket: `crossmart-uploads`
3. **Manage R2 API Tokens** → Create API token
4. **Copy credentials:**
   - Access Key ID
   - Secret Access Key
   - Account ID

### Free Tier Limits

| Feature | Limit |
|---------|-------|
| Storage | 10 GB |
| Class A ops (writes) | 1M/mo |
| Class B ops (reads) | 10M/mo |
| Egress | FREE (no charge) |

### R2 Configuration

```typescript
// apps/api/src/modules/file/file.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})
```

---

## 6. Cache — Upstash Redis (Free)

### Setup Steps

1. **Go to [upstash.com](https://upstash.com)** → Sign up with GitHub
2. **Create Redis Database** → Region: Closest to you
3. **Copy the Redis URL** from the console

### Free Tier Limits

| Feature | Limit |
|---------|-------|
| Commands | 10k/day |
| Storage | 256 MB |
| Connections | 20 max |

### BullMQ with Upstash

```typescript
// apps/api/src/modules/queue/queue.module.ts
import { BullModule } from '@nestjs/bullmq'

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL, // Upstash URL
      },
    }),
  ],
})
export class QueueModule {}
```

---

## 7. Environment Variables Summary

### Render (Backend)

Set these in Render Dashboard → Environment:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
JWT_SECRET=your-random-64-char-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=crossmart-uploads
R2_PUBLIC_URL=https://pub-xxx.r2.dev
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
CORS_ORIGINS=https://your-app.vercel.app
```

### Vercel (Frontend)

Set these in Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://crossmart-api-cdjd.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 8. Free Tier Limits Summary

| Service | Free Limit | Upgrade Path |
|---------|-----------|--------------|
| **Vercel** | 100GB bandwidth/mo | Pro $20/mo |
| **Render** | 750 hrs/mo | Starter $7/mo |
| **Supabase** | 500MB DB, 50k MAU | Pro $25/mo |
| **Cloudflare R2** | 10GB storage | Pay-as-you-go |
| **Upstash Redis** | 10k cmds/day | Pay-as-you-go |
| **Cloudflare** | Free plan | Pro $20/mo |
| **GitHub Actions** | 2,000 min/mo | Free for public repos |

---

## 9. Migration Path (If Render Free Tier Exceeds)

```
┌─────────────────────────────────────────────────────────────┐
│                    MIGRATION OPTIONS                          │
├─────────────────┬───────────┬──────────┬────────────────────┤
│ Platform        │ Free Tier │ Always On│ Docker Support     │
├─────────────────┼───────────┼──────────┼────────────────────┤
│ Render Starter  │ None      │ ✅ Yes   │ ✅ Yes ($7/mo)     │
│ Fly.io          │ 3 VMs     │ ✅ Yes   │ ✅ Yes (native)    │
│ Koyeb           │ 1 nano    │ ✅ Yes   │ ✅ Yes             │
│ Hetzner VPS     │ None      │ ✅ Yes   │ ✅ Yes             │
│ DigitalOcean    │ None      │ ✅ Yes   │ ✅ Yes             │
└─────────────────┴───────────┴──────────┴────────────────────┘
```

---

## 10. Quick Start Commands

```bash
# 1. Clone and install
git clone <repo-url>
cd team-05-app
npm install

# 2. Set up local development
cp .env.example .env
# Edit .env with your Supabase + R2 + Upstash credentials

# 3. Start Docker services (PostgreSQL, Redis, Meilisearch)
docker compose up -d

# 4. Run database migrations
npm run db:generate
npm run db:push

# 5. Start development
npm run dev

# 6. Deploy frontend to Vercel
cd apps/web
vercel --prod

# 7. Deploy backend to Render
# Push to GitHub → Render auto-deploys
git push origin main
```

---

## 11. Cost Timeline

```
Month 1+:    $0 (Render free tier 750 hrs/mo + all other free tiers)
If exceeded: $7/mo (Render Starter) or migrate to Fly.io/Koyeb
```
