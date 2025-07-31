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

# Copy only production dependencies
RUN pnpm install --prod

# Copy built files from host
COPY dist ./dist

# Development command
CMD ["pnpm", "start"]

# Production stage
FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install production dependencies only
RUN pnpm install --prod

# Copy built files from development stage
COPY --from=development /usr/src/app/dist ./dist

# Production command
CMD ["node", "dist/main"]
