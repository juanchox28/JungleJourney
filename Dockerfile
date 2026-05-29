FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --force

# Copy source code
COPY . .

# Clean previous builds
RUN rm -rf dist

# Accept VITE_API_BASE_URL as build argument (set by Railway)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
