# Uzbekistan Real Estate Aggregator - Backend (Strapi)

This directory contains the Strapi CMS backend for the application.

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

## Content Types

*   Property
*   Category
*   Location
*   Amenity
*   User (Users & Permissions Plugin - extended)
