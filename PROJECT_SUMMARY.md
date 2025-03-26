# Project Summary & Handover Notes: Uzbekistan Real Estate Aggregator

**Date:** 2025-03-27

**Objective:** Build a web application for browsing, searching, and favoriting real estate listings in Uzbekistan, featuring a client frontend and a CMS backend.

**Current Status:** Foundational MVP structure established for both backend and frontend. Core display features are functional, but several Strapi v5 specific issues were encountered, requiring workarounds and deferral of some features/automation. Both development servers (Backend: Strapi on port 1337, Frontend: Next.js on port 3000) should be running for full functionality.

---

## I. Project Setup & Configuration

*   **Directory Structure:** Project root at `/mnt/vhd/uz-real-estate-aggregator/` containing:
    *   `backend/`: Strapi v5 CMS application.
    *   `frontend/`: Next.js client application.
*   **Version Control:** Git repository initialized at the project root, tracking both `backend` and `frontend`. Commits made incrementally.
*   **Environment:**
    *   Linux (Ubuntu via WSL likely).
    *   Node.js installed via NVM (v22.14.0).
    *   Essential build tools (`build-essential`, `git`, `curl`) installed.
    *   PostgreSQL server installed locally (but connection issues led to reverting to SQLite).
*   **Backend Database:** Currently using **SQLite** (`backend/.tmp/data.db`). Attempted switch to PostgreSQL failed due to persistent authentication errors (`SASL: SCRAM-SERVER-FIRST-MESSAGE`).
*   **Frontend API Keys:** Yandex Maps API Key stored in `frontend/.env.local` as `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`.
*   **CORS:** Strapi backend configured in `backend/config/middlewares.ts` to allow requests from `http://localhost:3000`.

---

## II. Completed Features & WBS Items

*   **Backend (Strapi v5.11.3):**
    *   **Installation:** Strapi installed successfully.
    *   **Core Content Types (WBS 2.1):** Schemas defined via files for:
        *   `Property`: Includes title, description, price, area, rooms, floor, address, listingType, status, images (media), coordinates (json), category (relation), location (relation). *Note: `amenities` relation removed due to seeding issues.*
        *   `Category`: Includes name.
        *   `Location`: Includes name.
        *   `Amenity`: Includes name. *Note: `properties` relation removed due to seeding issues.*
        *   `Favorite`: Includes user (relation), property (relation). Created as an alternative to extending the User model. *Note: `inversedBy` removed from user relation due to startup errors.*
    *   **API Files:** Core API files (routes, controllers, services) created/corrected using Strapi factories for Property, Category, Location, Amenity, Favorite.
    *   **API Permissions (WBS 2.2):** Public role granted `find` and `findOne` permissions for Property, Category, Location, Amenity via Admin Panel. `Favorite` permissions TBD. Public role granted `register` permission for Users-Permissions.
    *   **Sample Data:** Basic Categories, Locations, Amenities, and 40 randomized Properties (without amenities linked) successfully seeded using the **Strapi Console method** (pasting script block).
    *   **Documentation:** Basic `README.md` created.
*   **Frontend (Next.js 15.2.4):**
    *   **Installation:** Next.js project created with TypeScript, Tailwind CSS, App Router.
    *   **Basic Layout (WBS 3.1.3):** Header, Main, Footer structure implemented in `layout.tsx`. Header includes conditional Login/Register links.
    *   **Property List (WBS 3.2.1, 3.2.5):** Homepage (`/`) fetches properties from `/api/properties` and displays them using `PropertyCard` component.
    *   **Property Card (WBS 3.2.3):** Dedicated component created (`PropertyCard.tsx`) displaying key property details and linking to details page using `documentId`.
    *   **Property Details Page (WBS 3.2.2):** Dynamic route (`/properties/[documentId]`) created, fetches single property via `/api/properties/:documentId`, displays details. Handles `params` resolution correctly.
    *   **Map Integration (WBS 3.3.1, 3.3.2):** `YandexMap` component created and integrated into the details page, displaying property location via coordinates.
    *   **Basic Filtering (WBS 3.2.4):** `PropertyFilters` component created (Client Component). Filtering by `listingType` implemented using URL search parameters and updates correctly.
    *   **Loading State (WBS 3.5):** Basic `loading.tsx` implemented for the homepage route group (shows simple text).
    *   **Authentication UI:** Placeholder Login/Register pages created. Basic `LoginForm` and `RegisterForm` components created with UI placeholders for forgot password/social login.
    *   **Authentication Logic:** `AuthContext` and `AuthProvider` created using `localStorage`. Login/Registration API calls implemented in forms, updating context on success. Header UI updates based on login state. Logout implemented.
    *   **Documentation:** Basic `README.md` created.

---

## III. Key Learnings & Unresolved Issues / Deferred Items

*   **Strapi v5 Breaking Changes:**
    *   **`documentId` vs `id`:** `findOne` API endpoints use `documentId`. (Handled)
    *   **Flat API Response:** Default API responses lack `attributes` nesting. (Handled)
    *   **`mappedBy` vs `inversedBy`:** v5 prefers `mappedBy`. (Partially addressed, caused warnings/errors).
*   **Strapi Plugin/Core Issues (Suspected):**
    *   **`users-permissions` Instability:** Extending the core User model caused fatal startup errors (`Undefined attribute level operator id`). **Workaround:** Removed extension, using dedicated `Favorite` model instead. Favorites feature implementation pending.
    *   **API Token `Create` Permissions (403 Error):** API tokens failed for `POST` requests despite correct permissions. **Workaround:** Used `strapi console` for seeding. Automated seeding via API/script is deferred.
    *   **Relational Filtering (400 Error):** Filtering by related field attributes (e.g., `location.name`) failed. Filtering by relation ID also failed. **Workaround:** Deferred complex relational filtering; only direct attribute filtering (`listingType`) is currently functional.
    *   **Many-to-Many Seeding (`joinColumn` Error):** Seeding script failed when assigning many-to-many (`amenities`) relation. **Workaround:** Removed amenity assignment from seed data/script.
*   **Strapi Scripting Issues:**
    *   `strapi exec`: Command not found.
    *   Manual Bootstrap (`node script.js`): Failed (`strapiFactory is not a function`, config loading errors). **Workaround:** Used `strapi console` for seeding.
*   **Next.js:**
    *   Async Server Components require `await` before accessing `params` or `searchParams`. (Handled).
    *   Using client-side hooks (`useAuth`) required converting `RootLayout` to a Client Component (`'use client';`).

---

## IV. Remaining WBS Items & Next Steps (High Level):

1.  **Favorites Feature:** Implement frontend UI (button), backend API (custom controller/service for create/delete favorites based on authenticated user), and `/favorites` page.
2.  **Frontend Refinements:** Populate/display relations (Category, Location), implement image upload/display, improve error handling, format data, enhance loading states.
3.  **Advanced Filtering:** Resolve relational filtering issue (potentially requires PostgreSQL or Strapi update/bugfix) and implement UI/logic.
4.  **Map Enhancements:** List view map.
5.  **Backend:** Customize Admin Panel, add validation.
6.  **CI/CD & Deployment:** PostgreSQL setup, Docker, Pipeline config.
7.  **Testing & Docs:** Add tests, expand READMEs.

---

## V. How to Run Current State:

1.  **Terminal 1 (Backend):** `cd /mnt/vhd/uz-real-estate-aggregator/backend && npm run develop`
2.  **Terminal 2 (Frontend):** `cd /mnt/vhd/uz-real-estate-aggregator/frontend && npm run dev`
3.  Access Frontend: `http://localhost:3000`
4.  Access Strapi Admin: `http://localhost:1337/admin` (Requires creating admin user if DB was reset).
5.  **Seeding (If needed):** Stop Strapi server, run `npm run strapi console`, paste seed script block (from conversation history or `scripts/seed.js` after adapting it for console).
