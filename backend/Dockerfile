# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && \
    npm cache clean --force

# Stage 2: Production
FROM node:20-alpine
LABEL maintainer="Address Map"
LABEL description="Backend server for real-time address mapping"

# Create app directory
WORKDIR /app

# Copy production dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source
COPY src ./src
COPY package.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/server.js"]
