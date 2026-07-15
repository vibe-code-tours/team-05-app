# CrossMart — GCP Deployment Guide

## Architecture

```
Internet → :80/:443 Nginx (reverse proxy)
              ├── /api/*  → NestJS :3001 (internal)
              └── /*      → Next.js :3000 (internal)

Supabase (external) → PostgreSQL + Auth
```

---

## Step 1: Create GCP e2-small Instance

**Console:** Compute Engine → VM instances → Create Instance

| Field | Value |
|-------|-------|
| Name | `crossmart-prod` |
| Region | `asia-southeast1` (Singapore) |
| Zone | `asia-southeast1-a` |
| Machine type | `e2-small` (2 vCPU, 2GB RAM) |
| Boot disk | Ubuntu 22.04 LTS, 30GB SSD |
| Firewall | ✅ Allow HTTP traffic |
| Firewall | ✅ Allow HTTPS traffic |

### Startup Script (Advanced Options → Management)

```bash
#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose-v2 git nginx
systemctl enable docker
systemctl start docker
systemctl enable nginx
usermod -aG docker $USER
```

Click **Create**.

---

## Step 2: Reserve Static IP

**Console:** VPC network → IP addresses → Reserve external static IP

| Field | Value |
|-------|-------|
| Name | `crossmart-static-ip` |
| Network type | Premium |
| Region | asia-southeast1 |

Reserve → Go to VM instance → Edit → Network interface → External IP → Select `crossmart-static-ip`.

---

## Step 3: Firewall Rules

**Console:** VPC network → Firewall → Create firewall rule

Create these 3 rules:

### Rule 1: HTTP
| Field | Value |
|-------|-------|
| Name | `allow-http` |
| Direction | Ingress |
| Priority | `1000` |
| Targets | All instances |
| Source IP ranges | `0.0.0.0/0` |
| Protocols/ports | TCP: `80` |

### Rule 2: HTTPS
| Field | Value |
|-------|-------|
| Name | `allow-https` |
| Direction | Ingress |
| Priority | `1000` |
| Targets | All instances |
| Source IP ranges | `0.0.0.0/0` |
| Protocols/ports | TCP: `443` |

### Rule 3: SSH (if not using GCP browser SSH)
| Field | Value |
|-------|-------|
| Name | `allow-ssh` |
| Direction | Ingress |
| Priority | `1000` |
| Targets | All instances |
| Source IP ranges | `0.0.0.0/0` |
| Protocols/ports | TCP: `22` |

---

## Step 4: DNS Setup

At your domain registrar (Cloudflare, Namecheap, etc.):

| Type | Name | Value |
|------|------|-------|
| A | `@` | `YOUR_STATIC_IP` |
| A | `www` | `YOUR_STATIC_IP` |

Wait 5-10 minutes for DNS propagation.

---

## Step 5: SSH Into VM

### Option A: GCP Console
Click VM instance → SSH button

### Option B: Terminal
```bash
gcloud compute ssh crossmart-prod --zone=asia-southeast1-a
```

---

## Step 6: Clone & Configure

```bash
# Clone repo
git clone <your-repo-url> /app
cd /app

# Create production env file
cp .env.prod.example .env
nano .env
```

### Fill in `.env` values:

```env
# ─── App ────────────────────────────────────────────────
NODE_ENV=production
PORT=3001

# ─── Frontend ───────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://YOUR_DOMAIN_OR_IP

# ─── Supabase Database ─────────────────────────────────
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# ─── Auth ───────────────────────────────────────────────
JWT_SECRET=your_random_48_char_string_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── CORS ───────────────────────────────────────────────
CORS_ORIGINS=http://yourdomain.com,http://www.yourdomain.com
```

### Generate JWT_SECRET:

```bash
openssl rand -base64 48
```

---

## Step 7: Deploy

```bash
# Make scripts executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### What deploy.sh does:
1. Pulls latest code from `main`
2. Stops old containers
3. Builds new Docker images
4. Starts containers (Nginx, Next.js, NestJS)
5. Cleans up unused images

---

## Step 8: Verify

```bash
# Check running containers
docker compose -f docker-compose.prod.yml ps

# Test homepage
curl http://YOUR_DOMAIN_OR_IP

# Test API health
curl http://YOUR_DOMAIN_OR_IP/api/v1/health

# Test Swagger docs
curl http://YOUR_DOMAIN_OR_IP/docs
```

---

## Step 9: Setup SSL (HTTPS)

Run this **after** DNS is pointing to your server:

```bash
chmod +x setup-ssl.sh
sudo bash setup-ssl.sh yourdomain.com your@email.com
```

### What setup-ssl.sh does:
1. Installs certbot
2. Gets SSL certificate from Let's Encrypt
3. Updates nginx.conf with SSL config
4. Sets up auto-renewal cron job

---

## Useful Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f nginx

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop all
docker compose -f docker-compose.prod.yml down

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Check memory usage
docker stats --no-stream

# SSH into a container
docker exec -it crossmart-api sh
docker exec -it crossmart-web sh
```

---

## File Structure on VM

```
/app/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── nginx/
│   └── nginx.conf    # Reverse proxy config
├── docker-compose.prod.yml
├── deploy.sh
├── setup-ssl.sh
├── .env              # Your secrets (never commit this)
└── .env.prod.example
```

---

## Memory Budget (e2-small 2GB)

| Process | RAM |
|---------|-----|
| Ubuntu OS | ~300MB |
| Nginx | ~10MB |
| NestJS | ~150MB |
| Next.js | ~250MB |
| **Total** | **~700MB** |
| **Free** | **~1,300MB** ✅ |

---

## Troubleshooting

### Container won't start
```bash
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs web
```

### Out of memory
```bash
docker stats --no-stream
free -h
```

### Port 80/443 already in use
```bash
sudo lsof -i :80
sudo systemctl stop nginx  # if system nginx is running
```

### API can't reach Supabase
```bash
# Test connection from VM
docker exec -it crossmart-api sh
wget -qO- http://localhost:3001/api/v1/health
```

### SSL certificate failed
```bash
# Make sure DNS is pointing to your IP
dig yourdomain.com

# Make sure port 80 is open
curl -I http://yourdomain.com
```

---

## Update/Redeploy

After pushing new code to `main`:

```bash
# SSH into VM
cd /app
./deploy.sh
```

---

## Cost Estimate

| Service | Cost |
|---------|------|
| GCP e2-small | ~$12/mo |
| Supabase Free | $0 |
| Domain | ~$10/year |
| **Total** | **~$12/mo** |
