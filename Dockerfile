# ============================================================================
# AdvokatAI - Production Multi-Stage Dockerfile
# Optimized for Railway, Render (Docker Runtime), Fly.io, or VPS
# ============================================================================

# --- Stage 1: Build Frontend SPA ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend bundle from builder
COPY --from=builder /app/dist ./dist

# Copy backend server code and data
COPY server ./server
COPY public ./public

# Create writable store directory
RUN mkdir -p /app/server/data/store && chmod -R 777 /app/server/data/store

EXPOSE 5000

CMD ["node", "server/index.js"]
