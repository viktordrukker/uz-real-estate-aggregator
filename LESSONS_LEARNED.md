# Lessons Learned: Uzbekistan Real Estate Aggregator

This document tracks key technical findings, decisions, and workarounds encountered during the development process.

---

**Date:** 2025-03-27

**Topic:** Strapi v5 Relational Filtering Investigation (WBS 1.1)

**Issue:** `PROJECT_SUMMARY.md` reported that relational filtering (by ID or nested attribute) failed with a 400 error, blocking advanced search functionality.

**Investigation:**
1.  Confirmed correct Strapi v5 filter syntax: `filters[relation][field][$operator]=value`.
2.  Attempted to fetch `/api/categories` and `/api/locations`, received 403 Forbidden.
3.  Checked Public role permissions in Admin Panel; `find` was disabled for Category and Location.
4.  Enabled `find` permission for Public role on Category and Location content types.
5.  Retested fetching categories/locations - Success (200 OK).
6.  Tested property filtering using `curl -g`:
    *   By Category ID (`filters[category][id][$eq]=16`): Success (200 OK).
    *   By Location ID (`filters[location][id][$eq]=16`): Success (200 OK).
    *   By Category Name (`filters[category][name][$eq]=Apartment`): Success (200 OK).
    *   By Location Name (`filters[location][name][$eq]=Tashkent`): Success (200 OK).

**Outcome:**
*   Relational filtering (by ID and nested attribute) **is functional** with Strapi v5.11.3 and SQLite using the correct syntax.
*   The initial 403 errors were due to missing Public role permissions.
*   The previously reported 400 error for filtering was likely due to incorrect syntax or the permission issue, not a fundamental blocker.

**Decision:** Proceed with implementing advanced filtering features (WBS 5.0) when prioritized. Documented the need to ensure Public permissions are correctly set for API endpoints.

---

**Date:** 2025-03-27

**Topic:** Favorites Feature Implementation & Debugging (WBS 2.0)

**Issue:** Implementing the `/favorites` page and ensuring consistent state across components. Encountered multiple issues:
    1. `403 Forbidden` errors when fetching/creating favorites.
    2. `entityService.findMany` in custom controller failed to populate `property` relation or return the `property` foreign key ID reliably, even with various `populate` or `fields` syntaxes.
    3. `Policy ... not found` errors when trying to apply `isAuthenticated` policy via route config, despite using documented syntaxes (`global::`, `plugin::`, no prefix).
    4. Frontend state inconsistencies between pages.

**Investigation & Resolution:**
1.  **403 Errors (Initial):** Resolved by ensuring the **Authenticated** role had `create`, `find`, `delete` permissions for the `Favorite` content type and `find`, `findOne` for the `User` content type (needed for filtering by user relation).
2.  **Population/FK Issue:** Attempts to fix population in the custom controller using `entityService` (`populate: { property: true }`, `populate: ['property']`, explicit `fields`) failed to return the property data or ID consistently. Using `strapi.db.query` also failed (`no such column: t0.property`), indicating the ORM layers weren't retrieving/exposing the foreign key as expected in this context.
3.  **Policy Errors:** Could not resolve the `Policy ... not found` errors when applying `plugin::users-permissions.isAuthenticated` in `favorite.routes.ts` using either `createCoreRouter` config or explicit route definitions. Removed policy config from routes and relied on checks within custom controller actions (`create`, `deleteByPropertyId`) and frontend filtering for the default `find` action.
4.  **Final Backend Approach:** Reverted controller to only override `create` (to add user ID) and `deleteByPropertyId` (for security/efficiency). Reverted routes to use default `find` handler and custom handlers for `create`/`deleteByPropertyId`, with policies removed from route config.
5.  **Final Frontend Approach:**
    *   Used standard REST API `GET /api/favorites?filters[user][id][$eq]=...&populate=property` for the `/favorites` page. This worked after fixing permissions, confirming the REST API handles filtering/population correctly, even if `entityService` had issues in the controller.
    *   Implemented `FavoritesContext` to manage a `Set<number>` of favorited property IDs.
    *   Context fetches initial IDs using `GET /api/favorites?filters[user][id][$eq]=...&populate[property][fields][0]=id`.
    *   Context provides `addFavorite`, `removeFavorite`, `isFavorited` functions.
    *   `PropertyCard` and Details Page use the context for displaying status and handling updates, ensuring UI consistency.

**Outcome:**
*   Favorites feature (add, remove, view list) is functional.
*   State synchronization across components is achieved using React Context.
*   Confirmed standard REST API with filters/population works for `GET /favorites`.
*   Persistent issues with applying `users-permissions` policies via route config in this environment.
*   `entityService` population/field selection for relations behaved unexpectedly within the custom controller context.

**Decision:** Proceeded with standard REST API for listing favorites and frontend context for state management. Documented policy resolution and `entityService` population issues.

---

**Date:** 2025-03-27

**Topic:** API Structure & Details Page Routing (WBS 3.0, 5.0)

**Issue:** Confusion and errors related to API response structure (flat vs. nested `attributes`) and the identifier used for the `findOne` property endpoint (`id` vs `documentId`).

**Investigation & Resolution:**
1.  **API Response Structure:** Console logs confirmed that the Strapi API (v5.11.3 with SQLite) is returning a **flat structure** for both `find` and `findOne` endpoints, even when populating relations. Fields like `title`, `price`, `category`, `images` are directly under the main data object, not nested within an `attributes` object.
2.  **`findOne` Identifier:** `curl` tests confirmed that the `findOne` endpoint (`/api/properties/:identifier`) requires the string **`documentId`** in the URL path, not the numeric `id`. Using the numeric `id` resulted in a 404 Not Found, while using the `documentId` returned the correct data (200 OK).
3.  **Frontend Code Correction:**
    *   The shared TypeScript interfaces in `types/index.ts` were updated to reflect the **flat structure**.
    *   All components (`PropertyCard.tsx`, `page.tsx`, `[documentId]/page.tsx`, `favorites/page.tsx`) were updated to access data directly (e.g., `property.title`, `property.images`) instead of through a non-existent `attributes` field.
    *   The `Link` component in `PropertyCard.tsx` was corrected to use `href={`/properties/${property.documentId}`}`.
    *   The `fetch` call in `[documentId]/page.tsx` was confirmed to correctly use the `documentId` extracted from the URL parameters. The previous 400 error was likely due to the component attempting to access non-existent `attributes` before the fix, or a temporary issue with the `populate` syntax during debugging (using `populate=*` now works reliably).

**Outcome:**
*   Frontend types and components now correctly match the flat API response structure.
*   Navigation to and fetching data for the property details page using `documentId` is functional.

**Decision:** Standardized on using the flat data structure and `documentId` for `findOne` routes. Updated documentation to reflect these findings.

---

**Date:** 2025-03-27

**Topic:** Loading States (WBS 3.5)

**Enhancement:** Implemented skeleton loading states for a better user experience during data fetching.

**Implementation:**
1.  Added `react-loading-skeleton` dependency.
2.  Created `PropertyCardSkeleton.tsx` and `PropertyDetailsSkeleton.tsx` components.
3.  Integrated skeletons into `page.tsx`, `[documentId]/page.tsx`, and `favorites/page.tsx` to display while data is loading.

**Date:** 2025-03-27

**Topic:** Strapi Admin Panel Errors (Property Type)

**Issue:** Unable to save new or existing `Property` entries via the Content Manager, and unable to modify the `Property` content type via the Content-Type Builder. Both actions result in a 400 Bad Request, sometimes with a "Invalid status: validation error" message, even when the `listingStatus` field (renamed from `status`) is explicitly set. Other collection types (Amenity, Location, Category, Favorite, TestProperty) function correctly in both the Content Manager and Content-Type Builder.

**Investigation:**
1.  Verified the `Property` schema (`schema.json`) for correct field types, required fields, default values, and relation definitions. The `listingStatus` field has `required: true` and `default: "Available"`.
2.  Confirmed no custom lifecycle hooks or significant custom logic in the default controller/service for `Property`.
3.  Temporarily setting `required: false` for `listingStatus` did not resolve the issue.
4.  Performing a clean build (`rm -rf .tmp build dist node_modules`, `npm install`, `npm run build`) did not resolve the issue.
5.  Manually creating a similar collection type ("TestProperty") *without* a field named `status` worked correctly, suggesting `status` is a reserved keyword causing conflicts, particularly with `draftAndPublish` enabled. Renaming `status` to `listingStatus` in the original `Property` schema *still* resulted in errors after a clean build.

**Outcome:**
*   The issue is specific to the `Property` collection type.
*   The root cause is strongly suspected to be related to the initial manual creation/modification of the `Property` schema files, potentially causing persistent inconsistencies or conflicts with Strapi v5's internal mechanisms or validation, possibly linked to the `draftAndPublish` feature or the originally used `status` field name, even after renaming. Clean builds did not resolve this specific type's issue.

**Next Steps (Deferred):**
*   Delete the entire `backend/src/api/property` directory.
*   Manually recreate the `Property` collection type *entirely* through the Admin Panel Content-Type Builder, using `listingStatus` instead of `status`.
*   Retest saving content and modifying the type.
*   Update frontend code if the newly generated schema differs significantly.

---

**Date:** 2025-03-27

**Topic:** Loading States (WBS 3.5)

**Enhancement:** Implemented skeleton loading states for a better user experience during data fetching.

**Implementation:**
1.  Added `react-loading-skeleton` dependency.
2.  Created `PropertyCardSkeleton.tsx` and `PropertyDetailsSkeleton.tsx` components.
3.  Integrated skeletons into `page.tsx`, `[documentId]/page.tsx`, and `favorites/page.tsx` to display while data is loading.

**Outcome:** Application now shows placeholder layouts instead of simple text or blank areas during loading, improving perceived performance.

---
