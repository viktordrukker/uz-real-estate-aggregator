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
    *   `PropertyCard` and Details Page use the context for displaying status and triggering updates, ensuring UI consistency.

**Outcome:**
*   Favorites feature (add, remove, view list) is functional.
*   State synchronization across components is achieved using React Context.
*   Confirmed standard REST API with filters/population works for `GET /favorites`.
*   Persistent issues with applying `users-permissions` policies via route config in this environment.
*   `entityService` population/field selection for relations behaved unexpectedly within the custom controller context.

**Decision:** Proceeded with standard REST API for listing favorites and frontend context for state management. Documented policy resolution and `entityService` population issues.

---
