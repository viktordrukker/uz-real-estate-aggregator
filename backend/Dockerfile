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

# Build the Strapi admin panel
# Set NODE_ENV to production for build optimizations
ENV NODE_ENV=production
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS production

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
