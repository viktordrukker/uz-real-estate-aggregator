# Uzbekistan Real Estate Aggregator - Backend (Strapi)

This directory contains the Strapi CMS backend for the application.

# Test trigger

## Setup

1.  Ensure Node.js (LTS recommended, check `.nvmrc` if available) and npm are installed.
2.  Navigate to this directory (`/mnt/vhd/uz-real-estate-aggregator/backend`).
3.  Install dependencies: `npm install`
4.  (Optional) Configure database settings in `config/database.ts` (defaults to SQLite).
5.  (Optional) Configure environment variables in `.env` (copy from `.env.example`).

## Development

To run the Strapi development server:

```bash
npm run develop
```

This will start the server (usually on `http://localhost:1337`) with auto-reloading. Access the admin panel at `http://localhost:1337/admin`.

## Building

To build the admin panel for production:

```bash
npm run build
```

## Starting in Production

To start the server in production mode (after building):

```bash
NODE_ENV=production npm run start
```

## Production Configuration

For production deployments (e.g., using Docker and GCP Cloud Run):

*   **Database:** Configure PostgreSQL connection details via environment variables (see `config/env/production/database.ts`). Required variables include `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and potentially `DATABASE_SSL`.
*   **Upload Provider:** Configure the Google Cloud Storage provider via environment variables (see `config/env/production/plugins.ts`). Required variables include `GCS_BUCKET_NAME` and authentication details (either `GCS_SERVICE_ACCOUNT_KEY_JSON` or setting `GOOGLE_APPLICATION_CREDENTIALS`).
*   **Strapi Variables:** Ensure essential Strapi environment variables (`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`) are set in the production environment.

## Seeding

A seed script is available at `scripts/seed.js`.

*   It clears existing data (Categories, Locations, Amenities, Properties) after a 60-second delay. **Use with caution!**
*   It seeds base data from JSON files in `data/seed/`.
*   It generates 40 random property listings.
*   It attempts to upload images from `public/mock-images/property_X` folders and link them.
*   **Recommendation:** Manually clear the database via the Admin Panel before running the script for the most reliable results, especially during development.

To run the seed script (ensure the development server is **not** running if using SQLite, or that the target database is accessible):

```bash
node scripts/seed.js
```

## Content Types

*   Property
*   Category
*   Location
*   Amenity
*   User (Users & Permissions Plugin - extended)
