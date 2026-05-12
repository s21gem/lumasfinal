# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source and prisma
COPY . .

# Generate Prisma Client (to the custom output path src/generated/prisma)
RUN npx prisma generate

# Build frontend
RUN npm run build

# Final stage
FROM node:20-slim

WORKDIR /app

# Install runtime dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy built assets and necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Expose port
EXPOSE 3001

# Command to run the server
CMD ["npx", "tsx", "server.ts"]
