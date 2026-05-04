# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/ .

# Build the application for development (connects to Docker gateway on localhost:9080)
# This builds with environment.ts instead of environment.prod.ts
RUN npm run build -- --configuration=development

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application to nginx
COPY --from=build /app/dist/travel-management-frontend /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates
COPY frontend/ssl/ /etc/nginx/ssl/

# Expose ports for HTTP (redirect) and HTTPS
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]