# Use an official Node.js runtime as a parent image (Choose LTS version, e.g., 20)
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
# Use --frozen-lockfile for reproducible installs
RUN npm ci --frozen-lockfile

# Copy the rest of the application code
COPY . .

# --- Build Stage ---
FROM base AS build

# Set build-time environment variables (can be overridden at build time)
ARG NEXT_PUBLIC_STRAPI_URL=http://localhost:1337 # Match code variable name
ARG NEXT_PUBLIC_YANDEX_MAPS_API_KEY

# Set environment variables for the build process
ENV NODE_ENV=production
ENV NEXT_PUBLIC_STRAPI_URL=${NEXT_PUBLIC_STRAPI_URL} # Match code variable name
ENV NEXT_PUBLIC_YANDEX_MAPS_API_KEY=${NEXT_PUBLIC_YANDEX_MAPS_API_KEY}

# Build the Next.js application
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from the build stage
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Expose the Next.js port (default 3000)
EXPOSE 3000

# Set the host to listen on all interfaces within the container
ENV HOSTNAME "0.0.0.0"

# Start the Next.js application using the standalone output
CMD ["node", "server.js"]
