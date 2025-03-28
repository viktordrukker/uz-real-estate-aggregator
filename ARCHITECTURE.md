# Architecture Overview: Uzbekistan Real Estate Aggregator

This document provides a high-level overview of the application architecture, deployment setup, and CI/CD pipeline for the Uzbekistan Real Estate Aggregator project.

## 1. System Components

The application consists of two main components:

1.  **Frontend:** A client-facing web application built with **Next.js** (React framework) and **TypeScript**. It allows users to browse, search, filter, view details, and favorite real estate properties. It interacts with the backend via a REST API.
2.  **Backend:** A headless Content Management System (CMS) built with **Strapi v5** and **TypeScript**. It provides:
    *   A REST API for the frontend to fetch property data, categories, locations, amenities, handle user authentication, and manage favorites.
    *   An administrative panel (`/admin`) for managing content (properties, categories, etc.).

## 2. Core Technologies

*   **Frontend:** Next.js 15+, React 18+, TypeScript, Tailwind CSS (implied by `globals.css` and typical Next.js setups)
*   **Backend:** Strapi v5+, Node.js 20+, TypeScript
*   **Database:** PostgreSQL (hosted on **Supabase** - Free Tier)
*   **Media Storage:** Google Cloud Storage (GCS)
*   **Containerization:** Docker
*   **Cloud Platform:** Google Cloud Platform (GCP)
*   **Hosting:** GCP Cloud Run (Serverless container hosting)
*   **Container Registry:** GCP Artifact Registry
*   **CI/CD:** GitHub Actions
*   **Authentication (CI/CD -> GCP):** GCP Workload Identity Federation (WIF)

## 3. Data Flow

```mermaid
graph LR
    User[User Browser] -- HTTPS --> FE[Frontend (Next.js on Cloud Run)];
    FE -- API Calls (HTTPS) --> BE[Backend (Strapi on Cloud Run)];
    BE -- SQL (SSL) --> DB[(Supabase PostgreSQL)];
    BE -- HTTPS --> GCS[Google Cloud Storage];
    CMSAdmin[CMS Admin Browser] -- HTTPS --> BE;

    subgraph GCP Project (uz-aggregator-show)
        FE;
        BE;
        GCS;
        AR[Artifact Registry];
        WIF[Workload Identity Pool/Provider];
        SA[Service Account];
    end

    subgraph External Services
        DB;
    end

    subgraph GitHub (viktordrukker/uz-real-estate-aggregator)
        Repo[Code Repository] -- Push --> Actions[GitHub Actions];
    end

    Actions -- Authenticate via WIF --> SA;
    Actions -- Build & Push --> AR;
    Actions -- Deploy Image --> FE;
    Actions -- Deploy Image --> BE;

    style User fill:#f9f,stroke:#333,stroke-width:2px;
    style CMSAdmin fill:#f9f,stroke:#333,stroke-width:2px;
    style DB fill:#ccf,stroke:#333,stroke-width:2px;
```

*   End users interact with the **Frontend** application hosted on Cloud Run.
*   The Frontend fetches data and performs actions by making API calls to the **Backend** service, also on Cloud Run.
*   The Backend interacts with the **Supabase PostgreSQL** database for storing and retrieving content data.
*   Media files (images) uploaded via the Strapi admin panel are stored in the **Google Cloud Storage** bucket.
*   CMS administrators access the Strapi admin panel via the **Backend** service URL (`/admin`).

## 4. Deployment Architecture & CI/CD

*   **Source Code:** Hosted on GitHub (`viktordrukker/uz-real-estate-aggregator`).
*   **CI/CD:** Managed by **GitHub Actions** workflows defined in `.github/workflows/`.
    *   Separate workflows exist for backend (`backend-deploy.yml`) and frontend (`frontend-deploy.yml`).
    *   Workflows trigger on pushes to the `main` branch affecting relevant paths, or manually via `workflow_dispatch`.
*   **Authentication:** GitHub Actions authenticate to GCP using **Workload Identity Federation**, impersonating a dedicated GCP **Service Account** (`github-actions-deployer@...`). This avoids storing static GCP keys in GitHub.
*   **Build Process:**
    1.  Code is checked out.
    2.  Authentication to GCP occurs via WIF.
    3.  Docker is configured to push to Artifact Registry.
    4.  The relevant Docker image (`backend` or `frontend`) is built using its `Dockerfile`. Build arguments (like API URLs) are passed to the frontend build.
    5.  The built image is tagged with the commit SHA and pushed to **GCP Artifact Registry**.
*   **Deployment Process:**
    1.  The `google-github-actions/deploy-cloudrun` action deploys the newly pushed image from Artifact Registry to the corresponding **GCP Cloud Run** service (`uz-rea-backend` or `uz-rea-frontend`) in the `europe-west1` region.
    2.  Environment variables (database credentials, secrets, etc.) required by the backend are injected into the Cloud Run service from **GitHub Secrets**.
*   **Secrets Management:** Sensitive configuration (database passwords, API keys, Strapi secrets) is stored securely as **GitHub Actions Secrets**.
*   **Public Access:**
    *   The frontend service (`uz-rea-frontend`) is configured for public, unauthenticated access.
    *   The backend service (`uz-rea-backend`) was *temporarily* configured for public access to allow initial CMS setup. **This should be secured (e.g., via IAP) for production.**

*For detailed setup steps and configuration specifics, refer to `DEPLOYMENT.md`.*

## 5. Key Configuration Points

*   **Backend Database:** Connection details are managed via environment variables injected into the Cloud Run service from GitHub Secrets (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SSL`). See `backend/config/env/production/database.ts`.
*   **Backend Media Storage:** Configured via `backend/config/env/production/plugins.ts` to use the `@3akram/strapi-provider-upload-google-cloud-storage` provider. Requires the `GCS_BUCKET_NAME` environment variable and relies on the Cloud Run service account having Storage Admin permissions (granted via WIF).
*   **Strapi Secrets:** `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET` are injected as environment variables from GitHub Secrets.
*   **Frontend API URLs:**
    *   `NEXT_PUBLIC_STRAPI_API_URL`: Passed as a build argument during the Docker build, sourced from the `NEXT_PUBLIC_STRAPI_API_URL_PROD` GitHub Secret.
    *   `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`: Passed as a build argument, sourced from the `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` GitHub Secret.
*   **Frontend Build Errors:** TypeScript and ESLint errors are currently ignored during the CI build process via settings in `frontend/next.config.ts`. This is temporary and should be reverted when code quality issues are addressed.
