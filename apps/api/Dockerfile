# ─── Build Stage ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY package.json ./
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

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

# Copy built application
COPY --from=builder --chown=crossmart:crossmart /app/apps/api/dist ./dist
COPY --from=builder --chown=crossmart:crossmart /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=crossmart:crossmart /app/apps/api/package.json ./
COPY --from=builder --chown=crossmart:crossmart /app/apps/api/prisma ./prisma

# Generate Prisma client for production
RUN npx prisma generate

# Switch to non-root user
USER crossmart

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["dumb-init", "node", "dist/main.js"]
