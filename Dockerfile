# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server files
COPY --from=builder /app/server ./server
COPY --from=builder /app/server/node_modules ./server/node_modules

# Create uploads directory
RUN mkdir -p server/uploads

EXPOSE 3001

# Start server
CMD ["node", "server/server.js"]