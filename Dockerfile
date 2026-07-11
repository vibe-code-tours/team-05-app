# ─── Build Stage ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files (needed for package-lock.json)
COPY package.json package-lock.json ./

# Copy API package.json
COPY apps/api/package.json ./apps/api/

# Install all dependencies
RUN npm ci

# Copy API source code
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ─── Production Stage ────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S crossmart && \
    adduser -S crossmart -u 1001

# Copy workspace root files
COPY package.json package-lock.json ./

# Copy API package.json
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Generate Prisma client for production
WORKDIR /app/apps/api
RUN npx prisma generate

# Switch to non-root user
USER crossmart

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["dumb-init", "node", "apps/api/dist/main.js"]
