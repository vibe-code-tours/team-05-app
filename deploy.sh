#!/bin/bash
set -e

echo "🚀 CrossMart Production Deploy"

# Check .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Copy .env.prod.example to .env and fill in values."
  exit 1
fi

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Stop old containers
echo "🛑 Stopping old containers..."
docker compose -f docker-compose.prod.yml down

# Build and start
echo "🔨 Building and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Clean up unused images
echo "🧹 Cleaning up..."
docker image prune -f

echo "✅ Deploy complete!"
docker compose -f docker-compose.prod.yml ps
