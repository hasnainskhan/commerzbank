# Multi-stage build for React frontend and Node.js backend
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app

# Copy frontend package files
COPY package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json ./

# Build frontend
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

# Copy backend source code
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/build ./build

# Create uploads directory
RUN mkdir -p uploads

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]


