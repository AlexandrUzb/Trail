# ============================================================================
# AdvokatAI - Production Multi-Stage Dockerfile
# Optimized for Render (Docker Runtime), Railway, Fly.io, or VPS
# ============================================================================

# --- Stage 1: Build Frontend SPA ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests for workspace caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

RUN npm install

# Build frontend
COPY frontend ./frontend
RUN npm run build --prefix frontend

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm install --omit=dev

# Copy backend source code & legal knowledge base
COPY backend ./backend

# Copy built frontend bundle from builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist

# Create writable store directory
RUN mkdir -p /app/backend/data/store && chmod -R 777 /app/backend/data/store

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "backend/index.js"]
