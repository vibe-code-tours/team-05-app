FROM node:20-alpine

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json ./

# Copy API source
COPY apps/api ./apps/api

# Install all dependencies (including dev for build)
RUN npm install

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
WORKDIR /app
RUN npm prune --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S crossmart && \
    adduser -S crossmart -u 1001 && \
    chown -R crossmart:crossmart /app

USER crossmart

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
