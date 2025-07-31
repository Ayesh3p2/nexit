# Development stage
FROM node:18-alpine AS development

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Development command
CMD ["pnpm", "dev"]

# Production stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from builder stage
COPY --from=builder /usr/src/app/.next/standalone /usr/share/nginx/html
COPY --from=builder /usr/src/app/.next/static /usr/share/nginx/html/.next/static
COPY --from=builder /usr/src/app/public /usr/share/nginx/html/public

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
