# Google Cloud Run optimized Dockerfile - follows official best practices
FROM node:18-alpine

# Install security updates and clean up in one layer
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build to minimize image size
RUN npm prune --production

# Create non-root user for security (Google Cloud Run requirement)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Change ownership of app directory to non-root user
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Google Cloud Run injects PORT environment variable
# Container must listen on this port (defaults to 8080)
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production

# Add health check as recommended by Google Cloud Run
HEALTHCHECK --interval=60s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use exec form to ensure proper signal handling (Cloud Run best practice)
CMD ["npm", "start"]
