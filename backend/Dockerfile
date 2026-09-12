# ==========================================
# STAGE 1: Build TypeScript Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source and SQL schema files
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# ==========================================
# STAGE 2: Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Copy database schema files for migrations
COPY src/database/schema.sql ./dist/database/schema.sql

# Non-root user for security
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
