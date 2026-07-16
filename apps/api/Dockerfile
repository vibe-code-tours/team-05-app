FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init libc6-compat

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN npm install

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs && \
    chown -R nestjs:nodejs /app

WORKDIR /app
USER nestjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

CMD ["dumb-init", "node", "apps/api/dist/src/main.js"]
