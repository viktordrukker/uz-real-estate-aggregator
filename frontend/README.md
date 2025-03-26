# Uzbekistan Real Estate Aggregator - Frontend (Next.js)

This directory contains the Next.js frontend for the application.

## Setup

1.  Ensure Node.js (LTS recommended, check `.nvmrc` if available) and npm are installed.
2.  Navigate to this directory (`/mnt/vhd/uz-real-estate-aggregator/frontend`).
3.  Install dependencies: `npm install`
4.  Create a `.env.local` file (copy from `.env.example` if it exists) and add necessary environment variables:
    *   `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`: Your API key for Yandex Maps.
    *   `STRAPI_URL` (Optional): The URL of the backend Strapi server (defaults to `http://localhost:1337`).

## Development

To run the Next.js development server:

```bash
npm run dev
```

This will start the server (usually on `http://localhost:3000`) with Fast Refresh enabled.

## Building

To build the application for production:

```bash
npm run build
```

## Starting in Production

To start the server in production mode (after building):

```bash
npm run start
```

## Key Features Implemented

*   Property List display
*   Property Details display
*   Basic Listing Type filter
*   Yandex Map display on details page
*   Placeholder Login/Register pages
