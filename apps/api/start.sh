#!/bin/sh
set -e

echo "Syncing database schema..."
# Use timeout so Render's port scan doesn't give up
# while Supabase free-tier DB cold-starts (can take 30+ seconds).
timeout 30 npx prisma db push --schema=./apps/api/prisma/schema.prisma --accept-data-loss \
  && echo "✅ Schema sync completed" \
  || echo "⚠️  Schema sync skipped (timeout or failure — continuing anyway)"

echo "Starting application..."
exec dumb-init node apps/api/dist/src/main.js
