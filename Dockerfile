# Production Dockerfile for Google Cloud Run
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy build artifacts and data dependencies
COPY dist ./dist
COPY server/data ./dist/server/data
COPY server/data ./dist/data

# Cloud Run injects PORT, default to 8080
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Run Express server
CMD ["node", "dist/server/server.js"]
