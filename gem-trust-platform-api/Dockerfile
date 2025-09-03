# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip

# Set working directory
WORKDIR /app

# Copy package files
COPY hello-world/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Override the entrypoint to avoid conflicts
ENTRYPOINT []

# Start the HTTP server
CMD ["node", "hello-world/server.mjs"]
