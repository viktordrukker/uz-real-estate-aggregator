# Use an official Node.js runtime as a parent image (Choose LTS version, e.g., 20)
# Switching from alpine to the debian-based image which has better support for image processing
FROM node:20 AS base

# Set working directory
WORKDIR /app

# Install dependencies needed for image processing (Sharp)
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    autoconf \
    automake \
    zlib1g-dev \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libtiff-dev \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
# Use --frozen-lockfile for reproducible installs
RUN npm ci --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Strapi admin panel
# Set NODE_ENV to production for build optimizations
ENV NODE_ENV=production
RUN npm run build

# --- Production Stage ---
FROM node:20 AS production

# Install dependencies needed for image processing in production
RUN apt-get update && apt-get install -y \
    build-essential \
    libvips-dev \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libtiff-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy built artifacts and necessary files from the base stage
COPY --from=base /app/package.json /app/package-lock.json* ./
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Expose the Strapi port
EXPOSE 1337

# Start the Strapi application in production mode
CMD ["npm", "run", "start"]

# Healthcheck (Optional but recommended)
# HEALTHCHECK --interval=15s --timeout=5s --start-period=30s CMD curl -f http://localhost:1337/_health || exit 1
