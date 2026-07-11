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

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/main.js"]
