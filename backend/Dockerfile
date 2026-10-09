# ============================================================================
# AdvokatAI - Backend Production Dockerfile
# Optimized for Render (Docker Runtime), Railway, Fly.io, or VPS
# ============================================================================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source code & legal knowledge base
COPY . .

# Ensure storage directory exists with write permissions
RUN mkdir -p /app/data/store && chmod -R 777 /app/data/store

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "index.js"]
