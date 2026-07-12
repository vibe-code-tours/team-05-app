# Migration Guide — When Railway Free Tier Ends

> Your $5 Railway trial runs out after ~2-4 weeks. Here's how to migrate.

---

## Current Free Stack

```
Frontend  → Vercel      → FREE (permanent)
Backend   → Railway     → $5 trial (ends in ~2-4 weeks)
Database  → Supabase    → FREE (permanent)
Storage   → Cloudflare  → FREE (permanent)
Cache     → Upstash     → FREE (permanent)
```

---

## Migration Options (Ranked)

### Option 1: Fly.io (Recommended)

**Why:** Always-on, Docker-native, generous free tier.

| Feature | Free Tier |
|---------|-----------|
| VMs | 3 shared-cpu-1x (256MB RAM each) |
| Storage | 3GB persistent volumes |
| Bandwidth | 100GB/mo |
| Always on | ✅ Yes (no cold starts) |

**Migration Steps:**

```bash
# 1. Install flyctl
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Launch from apps/api
cd apps/api
fly launch

# 4. Set secrets
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set JWT_SECRET="..."
fly secrets set REDIS_URL="..."
fly secrets set R2_ACCOUNT_ID="..."
fly secrets set R2_ACCESS_KEY_ID="..."
fly secrets set R2_SECRET_ACCESS_KEY="..."
fly secrets set SUPABASE_URL="..."
fly secrets set SUPABASE_ANON_KEY="..."

# 5. Deploy
fly deploy

# 6. Update frontend
# In Vercel, change NEXT_PUBLIC_API_URL to your Fly.io URL
```

**Time:** ~30 minutes

---

### Option 2: Render.com (Easiest)

**Why:** Simple setup, GitHub auto-deploy.

| Feature | Free Tier |
|---------|-----------|
| Web Services | 750 hrs/mo |
| RAM | 512 MB |
| Always on | ❌ No (cold starts ~30s) |

**Migration Steps:**

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. New → Web Service → Connect repo
3. Configure:
   - Name: `crossmart-api`
   - Runtime: `Docker`
   - Dockerfile: `apps/api/Dockerfile`
   - Port: `3001`
4. Add environment variables (same as Railway)
5. Deploy
6. Update `NEXT_PUBLIC_API_URL` in Vercel

**Time:** ~15 minutes

---

### Option 3: Koyeb

**Why:** Always-on free tier, no cold starts.

| Feature | Free Tier |
|---------|-----------|
| Nano instance | 512MB RAM, 1 vCPU |
| Always on | ✅ Yes |
| Bandwidth | 100GB/mo |

**Migration Steps:**

1. Go to [koyeb.com](https://koyeb.com) → Sign up
2. New → App → Docker
3. Connect GitHub repo
4. Set build command: `docker build -f apps/api/Dockerfile .`
5. Set run command: `node dist/main.js`
6. Add environment variables
7. Deploy

**Time:** ~20 minutes

---

### Option 4: VPS (Best Value Long-Term)

**Why:** Full control, cheapest long-term.

| Provider | Cost | RAM | CPU |
|----------|------|-----|-----|
| Hetzner CX22 | €4/mo (~$4.50) | 4GB | 2 vCPU |
| DigitalOcean | $6/mo | 1GB | 1 vCPU |
| Vultr | $6/mo | 1GB | 1 vCPU |

**Migration Steps:**

```bash
# 1. Create VPS (e.g., Hetzner)
# 2. SSH into server
ssh root@your-server-ip

# 3. Install Docker
curl -fsSL https://get.docker.com | sh

# 4. Clone your repo
git clone <your-repo>
cd team-05-app

# 5. Set environment
cp .env.example .env
nano .env  # Add your credentials

# 6. Start services
docker compose -f docker-compose.prod.yml up -d

# 7. Install Coolify (optional, for web UI)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

**Time:** ~1 hour

---

## Database Migration (Not Needed!)

Your database is on **Supabase**, not Railway. No migration needed!

Just make sure your `DATABASE_URL` points to Supabase in all environments.

---

## Checklist

- [ ] Export environment variables from Railway
- [ ] Choose new platform
- [ ] Deploy backend to new platform
- [ ] Update `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Test API endpoints
- [ ] Update CORS_ORIGINS if needed
- [ ] (Optional) Update custom domain DNS

---

## Environment Variables to Copy

```bash
# From Railway Dashboard → Variables tab
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=crossmart-uploads
R2_PUBLIC_URL=https://...
REDIS_URL=redis://...
CORS_ORIGINS=https://your-app.vercel.app
```

---

## Timeline

```
Week 1-4:   Railway trial (build and test)
Week 5:     Migrate to Fly.io/Render/Koyeb
Month 2+:   $0/month on free tier
            OR $4-5/mo on VPS (best value)
```
