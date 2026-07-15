#!/bin/bash
set -e

# Run this ONCE after DNS is pointed to your server
# Usage: sudo bash setup-ssl.sh yourdomain.com

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: sudo bash setup-ssl.sh yourdomain.com your@email.com"
  exit 1
fi

echo "🔐 Setting up SSL for $DOMAIN"

# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Install certbot
apt-get update && apt-get install -y certbot

# Get certificate
certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# Update nginx.conf for SSL
cat > nginx/nginx.conf << 'CONF'
upstream nextjs {
    server web:3000;
}

upstream nestjs {
    server api:3001;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;

    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    client_max_body_size 10M;

    location /api {
        proxy_pass http://nestjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /docs {
        proxy_pass http://nestjs;
        proxy_set_header Host $host;
    }

    location /health {
        proxy_pass http://nestjs;
    }

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /_next/static {
        proxy_pass http://nextjs;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
CONF

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/nginx.conf

# Restart with SSL
docker compose -f docker-compose.prod.yml up -d nginx

# Set up auto-renewal
echo "0 0,12 * * * root certbot renew --quiet && docker compose -f /app/docker-compose.prod.yml restart nginx" > /etc/cron.d/certbot-renew

echo "✅ SSL setup complete for $DOMAIN"
