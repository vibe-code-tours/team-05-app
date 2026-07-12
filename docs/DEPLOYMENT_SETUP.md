# Deployment Setup Guide

> Step-by-step guide to deploy CrossMart with free services.

---

## Step 1: Create Supabase Project

### 1.1 Sign Up

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up with GitHub
3. Verify your email

### 1.2 Create Project

1. Click "New Project"
2. Fill in:
   - **Organization:** Create new or select existing
   - **Project name:** `crossmart`
   - **Database password:** Generate a strong password (SAVE THIS!)
   - **Region:** Choose closest to Myanmar (e.g., `Southeast Asia - Singapore`)
3. Click "Create new project"
4. Wait 1-2 minutes for setup

### 1.3 Get Connection String

1. Go to **Settings** (gear icon) → **Database**
2. Scroll to **Connection string**
3. Click **URI** tab
4. Copy the full URI
5. Replace `[YOUR-PASSWORD]` with your database password

**Example:**
```
postgresql://postgres.xxxxxxxxxxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 1.4 Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (click to reveal)

---

## Step 2: Create Upstash Redis

### 2.1 Sign Up

1. Go to [upstash.com](https://upstash.com)
2. Click "Sign in with GitHub"

### 2.2 Create Database

1. Click "Create Database"
2. Fill in:
   - **Name:** `crossmart`
   - **Region:** Choose closest to you
   - **Type:** Regional (free)
3. Click "Create"

### 2.3 Get Redis URL

1. Go to your database
2. Click "Redis" tab
3. Copy the **Endpoint** (format: `redis://default:xxxxx@xxxxx.upstash.io:6379`)

---

## Step 3: Create Cloudflare R2 Bucket

### 3.1 Sign Up

1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up or log in

### 3.2 Enable R2

1. Go to **R2 Object Storage** in the dashboard
2. Click "Get started" if first time

### 3.3 Create Bucket

1. Click "Create bucket"
2. Fill in:
   - **Bucket name:** `crossmart-uploads`
   - **Location:** Auto (or closest to you)
3. Click "Create bucket"

### 3.4 Create API Token

1. Go to **Manage R2 API Tokens**
2. Click "Create API token"
3. Fill in:
   - **Token name:** `crossmart-api`
   - **Permissions:** Object Read & Write
   - **TTL:** Leave blank (no expiration)
4. Click "Create API Token"
5. **SAVE THE CREDENTIALS:**
   - Access Key ID
   - Secret Access Key

### 3.5 Get Account ID

1. Go to **Settings** on the right sidebar
2. Copy **Account ID**

### 3.6 Get Public URL

1. Go to your bucket → **Settings**
2. Enable **Public access**
3. Copy the **Public R2.dev URL**

---

## Step 4: Deploy Backend to Railway

### 4.1 Sign Up

1. Go to [railway.app](https://railway.app)
2. Click "Login" → Sign up with GitHub

### 4.2 Create Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Authorize Railway to access your repos
4. Select `team-05-app`
5. Click "Deploy"

### 4.3 Configure Service

1. Click on the service that was created
2. Go to **Settings**
3. Under **Build**:
   - **Root Directory:** `apps/api`
   - **Dockerfile Path:** `apps/api/Dockerfile`
4. Click "Save"

### 4.4 Add Environment Variables

1. Go to **Variables** tab
2. Add these variables:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=generate-a-random-64-char-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=crossmart-uploads
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
REDIS_URL=your-upstash-redis-url
CORS_ORIGINS=https://your-app.vercel.app
```

### 4.5 Get API URL

1. Go to **Settings** → **Networking**
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://crossmart-api.up.railway.app`)

---

## Step 5: Deploy Frontend to Vercel

### 5.1 Sign Up

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → Sign up with GitHub

### 5.2 Import Project

1. Click "Add New..." → "Project"
2. Import `team-05-app`
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### 5.3 Add Environment Variables

1. Click "Environment Variables"
2. Add:

```env
NEXT_PUBLIC_API_URL=https://crossmart-api.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Click "Visit" to see your app

### 5.5 Update CORS

1. Go back to Railway
2. Update `CORS_ORIGINS` variable with your Vercel URL
3. Redeploy the service

---

## Step 6: Run Database Migrations

### 6.1 Connect to Supabase

1. Go to Supabase Dashboard
2. Click **SQL Editor** in the left sidebar

### 6.2 Run Prisma Migrate

Option A: Using local CLI (if you have Docker running)
```bash
# Start local PostgreSQL
docker compose up -d postgres

# Update DATABASE_URL in .env to use Supabase
# Then run migration
npx prisma migrate dev --name init

# Push to Supabase
npx prisma migrate deploy
```

Option B: Using Supabase SQL Editor
1. Copy the SQL from your Prisma schema
2. Paste into SQL Editor
3. Click "Run"

### 6.3 Seed Database (Optional)

```bash
# If you have seed data
npm run db:seed
```

---

## Step 7: Verify Deployment

### 7.1 Check Backend

1. Open `https://crossmart-api.up.railway.app/docs`
2. You should see Swagger documentation
3. Test the health endpoint: `https://crossmart-api.up.railway.app/api/v1/health`

### 7.2 Check Frontend

1. Open your Vercel URL
2. The app should load
3. Check browser console for errors

### 7.3 Test Connection

1. Try to register/login
2. Check if data is saved to Supabase
3. Check Supabase Table Editor to see data

---

## Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` format
- Ensure Supabase project is active
- Check if IP is allowed (Supabase allows all by default)

### "CORS error"
- Ensure `CORS_ORIGINS` in Railway matches your Vercel URL
- Include `https://` prefix

### "Build failed on Railway"
- Check build logs in Railway dashboard
- Ensure Dockerfile path is correct
- Verify all dependencies are in package.json

### "JWT secret error"
- Ensure `JWT_SECRET` is set and long enough (64+ chars)
- Generate one: `openssl rand -hex 32`

---

## Generate JWT Secret

```bash
# Linux/Mac
openssl rand -hex 32

# Or online: https://www.grc.com/passwords.htm
```

---

## Environment Variables Summary

| Variable | Where to Get |
|----------|--------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |
| `REDIS_URL` | Upstash → Database → Redis → Endpoint |
| `R2_ACCOUNT_ID` | Cloudflare → Settings → Account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare → R2 → Manage R2 API Tokens |
| `R2_SECRET_ACCESS_KEY` | Cloudflare → R2 → Manage R2 API Tokens |
| `R2_PUBLIC_URL` | Cloudflare → R2 → Bucket → Settings → Public URL |
| `JWT_SECRET` | Generate with `openssl rand -hex 32` |
