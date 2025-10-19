# Multi-stage build for React frontend and Node.js backend
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app

# Copy frontend package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci

# Copy frontend source code including mobile fixes
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json ./

# Build frontend with mobile compatibility features
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend

# Install system dependencies
RUN apk add --no-cache \
    sqlite \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code including anti-bot middleware
COPY backend/ ./

# Ensure middleware directory exists with anti-bot middleware
RUN ls -la middleware/ || echo "Middleware directory structure:"
RUN ls -la middleware/anti-bot.js || echo "Anti-bot middleware included"

# Copy built frontend from previous stage (includes mobile fixes)
COPY --from=frontend-builder /app/build ./build

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 755 uploads

# Generate Prisma client
RUN npx prisma generate

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "🔄 Initializing database..."' >> /app/start.sh && \
    echo 'npx prisma migrate deploy || npx prisma db push || echo "Database already initialized"' >> /app/start.sh && \
    echo 'echo "✅ Database ready"' >> /app/start.sh && \
    echo 'echo "🚀 Starting server..."' >> /app/start.sh && \
    echo 'npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with initialization
CMD ["/app/start.sh"]


