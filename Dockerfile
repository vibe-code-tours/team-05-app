FROM node:20-alpine

WORKDIR /app

# Copy all files
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/api ./apps/api

# Install dependencies
WORKDIR /app
RUN npm install

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build
RUN npm run build

# Create non-root user and set ownership
RUN addgroup -g 1001 -S crossmart && \
    adduser -S crossmart -u 1001 && \
    chown -R crossmart:crossmart /app

# Switch to non-root user
USER crossmart

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/main.js"]
