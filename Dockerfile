# Use a Node.js image as the builder
FROM --platform=linux/amd64 node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --force

# Copy all source code
COPY . .

# Build the SSR app
ENV NODE_OPTIONS=--max_old_space_size=2048
RUN npm run dev

# Production image
FROM --platform=linux/amd64 node:20-alpine

# Set working directory
WORKDIR /app

# Copy built app from builder
COPY --from=builder /app .

# Copy environment file
COPY .env.dev .env

# Expose the SSR port
EXPOSE 3006

# Run the SSR server
CMD ["node", "dist/server.cjs"]