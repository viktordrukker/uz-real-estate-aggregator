# Project Summary & Handover Notes: Uzbekistan Real Estate Aggregator

**Date:** 2025-03-28

**Objective:** Build a web application for browsing, searching, and favoriting real estate listings in Uzbekistan, featuring a client frontend and a CMS backend.

**Current Status:**
*   Core MVP features implemented (property list/details, filtering, pagination, favorites, authentication).
*   Backend stabilized: Property-Amenity relation fixed, seed script improved (generates 40 properties, reuses images, sequential deletion, 60s delay - requires manual execution after clearing DB).
*   Frontend enhancements: Advanced filters (price, rooms), improved pagination controls, image modal with navigation, list view map with clickable placemarks.
*   CI/CD foundation laid: Dockerfiles created, production configs added (DB, GCS Upload Provider), GitHub Actions workflow skeletons generated.
*   Development servers (Backend: Strapi on port 1337, Frontend: Next.js on port 3000) should be running for local testing.

---

## I. Project Setup & Configuration

*   **Directory Structure:** Project root at `/mnt/vhd/uz-real-estate-aggregator/` containing:
    *   `backend/`: Strapi v5 CMS application.
    *   `frontend/`: Next.js client application.
    *   `.github/workflows/`: GitHub Actions CI/CD workflow files.
*   **Version Control:** Git repository initialized at the project root, tracking both `backend` and `frontend`. Commits made incrementally.
*   **Environment:**
    *   Linux (Ubuntu via WSL likely).
    *   Node.js installed via NVM (v22.14.0).
    *   Essential build tools (`build-essential`, `git`, `curl`) installed.
*   **Backend Database:** Currently using **SQLite** (`backend/.tmp/data.db`) for development. Migration to PostgreSQL (Cloud SQL) is planned for production deployment.
*   **Frontend API Keys:** Yandex Maps API Key stored in `frontend/.env.local` as `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`.
*   **CORS:** Strapi backend configured in `backend/config/middlewares.ts` to allow requests from `http://localhost:3000`.
*   **Docker:** Dockerfiles created for both `backend` and `frontend`. `.dockerignore` files added.
*   **Production Config:**
    *   Backend: `config/env/production/database.ts` (for PostgreSQL) and `config/env/production/plugins.ts` (for GCS upload provider) created.
    *   Frontend: `next.config.ts` updated with `output: 'standalone'`.

---

## II. Completed Features & WBS Items

*   **Backend (Strapi v5.11.3):**
    *   **Installation:** Strapi installed successfully.
    *   **Core Content Types (WBS 2.1):** Schemas updated to correctly define Property-Amenity many-to-many relationship. **DONE**.
    *   **API Files:** Core API files created/corrected. **DONE**.
    *   **API Permissions (WBS 2.2):** Public and Authenticated roles configured. **DONE**.
    *   **Sample Data:** Seed script (`scripts/seed.js`) updated to generate 40 properties, reuse images, link relations, and use sequential deletion (requires manual execution after DB clear). **DONE** (Script created, manual run pending).
    *   **Favorites API (WBS 2.0):** Custom controllers/routes implemented. **DONE**.
    *   **GCS Upload Provider:** `@3akram/strapi-provider-upload-google-cloud-storage` installed. **DONE**.
    *   **Documentation:** Basic `README.md` created. `LESSONS_LEARNED.md` updated. **DONE**.
*   **Frontend (Next.js 15.2.4):**
    *   **Installation & Config:** Next.js project created. `next.config.ts` updated for standalone output. **DONE**.
    *   **Basic Layout (WBS 3.1.3):** Implemented. **DONE**.
    *   **Property List (WBS 3.2.1, 3.2.5):** Implemented. **DONE**.
    *   **Property Card (WBS 3.2.3):** Implemented. **DONE**.
    *   **Property Details Page (WBS 3.2.2):** Implemented. **DONE**.
    *   **Map Integration (WBS 3.3.1, 3.3.2):** `YandexMap` component integrated into details page. **DONE**.
    *   **Filtering & Pagination (WBS 5.0):**
        *   `PropertyFilters` component updated with Price Range and Min Rooms. **DONE**.
        *   Homepage (`page.tsx`) updated to apply all filters. **DONE**.
        *   `PaginationControls.tsx` enhanced with page numbers. **DONE**.
    *   **Loading State (WBS 3.5):** Skeleton loading implemented. **DONE**.
    *   **Authentication UI & Logic:** Implemented. **DONE**.
    *   **Favorites Feature (WBS 2.0):** Implemented using Context API. **DONE**.
    *   **Image Gallery (WBS 4.0):** Basic modal with navigation added to details page. **DONE**.
    *   **Map Enhancements (WBS 5.0):** List view map implemented on homepage, showing all filtered properties as clickable markers. **DONE**.
    *   **Documentation:** Basic `README.md` created. **DONE**.

---

## III. Key Learnings & Unresolved Issues / Deferred Items

*   Refer to `LESSONS_LEARNED.md` for detailed findings on Strapi v5 API structure, plugin issues (User Permissions extension, Policies, entityService), seeding challenges, and frontend adjustments.
*   **Seeding Script:** The `clearContentType` function in `scripts/seed.js` might still be unreliable due to potential race conditions with Strapi restarts/DB operations. Manual DB clearing before running the script is the current recommendation. Idempotent seeding remains a potential future improvement.
*   **Backend Issues:** Lower priority items like customizing the Admin Panel, adding backend validation rules, and fully resolving Policy/entityService issues remain.
*   **Testing:** Comprehensive automated tests (unit, integration, e2e) need to be added (Phase 4).

---

## IV. CI/CD & Deployment (Phase 3 - Setup Required)

*   **Infrastructure:** Google Cloud Platform (GCP)
    *   **Compute:** Cloud Run (for Backend & Frontend)
    *   **Database:** Cloud SQL for PostgreSQL
    *   **Storage:** Cloud Storage (for media uploads)
    *   **Registry:** Artifact Registry (for Docker images)
*   **CI/CD Tool:** GitHub Actions
*   **Workflow Files:**
    *   `.github/workflows/backend-deploy.yml`
    *   `.github/workflows/frontend-deploy.yml`
*   **Prerequisites (Manual Setup Required):**
    *   Create GCP Project & Enable APIs (Cloud Run, Cloud SQL, Cloud Storage, Artifact Registry, IAM).
    *   Provision Cloud SQL PostgreSQL instance (note connection details).
    *   Create Cloud Storage bucket (note bucket name).
    *   Create Artifact Registry Docker repositories (note region/names).
    *   Create GCP Service Account with necessary roles (Cloud Run Admin, Storage Admin, Cloud SQL Client, Artifact Registry Writer) & download JSON key.
    *   Configure GitHub Repository Secrets (GCP credentials, DB credentials, Strapi secrets, API keys).
    *   Update placeholder values (Region, Service Names, Repo Names) in the `.github/workflows/*.yml` files.
*   **Next Steps:** Complete the manual GCP/GitHub setup, then trigger the workflows by pushing to the `main` branch to test the deployment.

---

## V. How to Run Locally (Development):

1.  **Terminal 1 (Backend):** `cd /mnt/vhd/uz-real-estate-aggregator/backend && npm run develop`
2.  **Terminal 2 (Frontend):** `cd /mnt/vhd/uz-real-estate-aggregator/frontend && npm run dev`
3.  Access Frontend: `http://localhost:3000`
4.  Access Strapi Admin: `http://localhost:1337/admin` (Requires creating admin user if DB was reset).
5.  **Seeding (Optional):** Manually clear DB content via Admin Panel, then run `node uz-real-estate-aggregator/backend/scripts/seed.js` (allow 60s delay).
