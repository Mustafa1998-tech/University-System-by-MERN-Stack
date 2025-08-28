# Backend Dockerfile
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    python3 \
    make \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs certificates

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=development

# Start the application in development mode
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base AS prod-deps

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM base AS production

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p uploads logs certificates && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Start the application
CMD ["npm", "start"]