FROM node:20-alpine

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json ./

# Copy API source
COPY apps/api ./apps/api

# Install all dependencies
RUN npm install

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Create non-root user and set ownership
RUN addgroup -g 1001 -S crossmart && \
    adduser -S crossmart -u 1001 && \
    chown -R crossmart:crossmart /app

USER crossmart

EXPOSE 3001

WORKDIR /app/apps/api
CMD ["node", "dist/src/main.js"]
