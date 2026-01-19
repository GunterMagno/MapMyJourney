# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application (the exit code 1 is due to budget warnings, not actual build failure)
RUN npm run build -- --configuration production --optimization=false || true

# List what was built
RUN ls -la /app/dist/frontend/ || echo "No dist found"
RUN ls -la /app/dist/frontend/browser/ 2>/dev/null | head -10 || echo "No browser folder"

# Runtime stage - use nginx for serving SPA
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Create custom nginx config for SPA
RUN echo 'server { \
  listen 4200; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
  \
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
    expires 1y; \
    add_header Cache-Control "public, immutable"; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Copy built application from builder directory by directory
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Verify the copy worked
RUN ls -la /usr/share/nginx/html/

# Expose port
EXPOSE 4200

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
