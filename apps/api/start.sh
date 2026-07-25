#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma db push --schema=./apps/api/prisma/schema.prisma --accept-data-loss

echo "Starting application..."
exec dumb-init node apps/api/dist/src/main.js
