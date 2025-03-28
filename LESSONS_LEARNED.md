SSo# Lessons Learned: Uzbekistan Real Estate Aggregator

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

**Date:** 2025-03-27

**Topic:** Strapi Admin Panel Errors (Property Type) - Resolution Confirmation

**Issue:** Persistent 400 errors when saving/creating `Property` content or modifying its schema via Content-Type Builder, suspected to be related to the reserved `status` field name.

**Resolution:** Confirmed by Product Manager that the root cause was indeed the conflict with the reserved `status` field name used during initial schema creation (even after renaming it in the schema file later). The issue is considered resolved now that the backend is stable, presumably after ensuring the type uses `listingStatus` and potentially recreating it cleanly via the Admin Panel or resolving internal inconsistencies.

**Decision:** Proceed with development assuming the Property type is stable in the Admin Panel.

---

**Date:** 2025-03-27

**Topic:** Favorites Context Initial Fetch Error

**Issue:** Runtime error "Error: Failed to fetch initial favorites" occurred in `FavoritesContext.tsx` when fetching the user's favorites list upon login/load. The fetch URL used was `/api/favorites?filters[user][id][$eq]=...&populate[property][fields][0]=id`.

**Investigation & Resolution:**
1.  Verified Authenticated role permissions for `Favorite` (find) and `User` (find/findOne) were correct.
2.  Modified the fetch query in `FavoritesContext.tsx` to use a simpler population strategy: `populate=property` instead of `populate[property][fields][0]=id`.
3.  After the code change, the user re-logged in and refreshed the page. The error no longer occurred.

**Outcome:** Fetching initial favorites now works correctly. The issue was likely related to the specific nested field population syntax (`populate[property][fields][0]=id`) or potentially a transient state issue resolved by re-login. Using the simpler `populate=property` is confirmed to work.

**Decision:** Keep the simplified `populate=property` query in `FavoritesContext.tsx`.

---

**Date:** 2025-03-28

**Topic:** CORS Errors After Cloud Run Deployment

**Issue:** After deploying the frontend and backend to Cloud Run, the frontend received CORS errors (`No 'Access-Control-Allow-Origin' header`) and 403 Forbidden errors when trying to fetch data from the backend API (`/api/categories`, `/api/locations`, etc.).

**Investigation:**
1.  Checked the browser console logs, confirming the CORS block and the specific origin making the request (`https://uz-rea-frontend-480221447899.europe-west1.run.app`).
2.  Examined the backend CORS configuration in `backend/config/middlewares.ts`. It initially only allowed `http://localhost:3000`.
3.  Attempted adding the generic backend URL (`https://uz-rea-frontend-m3kpztxi4a-ew.a.run.app`) to the `origin` array, but the error persisted.
4.  Realized the Cloud Run default URL includes the project ID (`480221447899` in this case) which was missing from the initially added origin.

**Resolution:**
1.  Updated the `origin` array in `backend/config/middlewares.ts` to explicitly include the correct frontend URL reported by the browser: `https://uz-rea-frontend-480221447899.europe-west1.run.app`. Also kept the other potential URL for robustness.
    ```javascript
    origin: [
      'http://localhost:3000',
      'https://uz-rea-frontend-480221447899.europe-west1.run.app', // From error
      'https://uz-rea-frontend-m3kpztxi4a-ew.a.run.app' // Other potential URL
    ],
    ```
2.  Committed the change and pushed, triggering a backend redeployment.
3.  After the backend redeployed, the frontend was able to successfully fetch data.

**Outcome:** CORS errors were resolved by ensuring the exact frontend Cloud Run URL (including the project ID) was listed in the backend's allowed origins. The 403 error was a side effect of the failed CORS preflight request.

**Decision:** Always verify the exact origin URL reported by the browser's CORS error message when configuring backend CORS policies, especially with auto-generated cloud service URLs.

---

**Date:** 2025-03-28

**Topic:** Environment Variable Naming Inconsistencies

**Issue:** The frontend application wasn't loading property data from the backend. The console showed errors: "NEXT_PUBLIC_STRAPI_URL environment variable is not set" despite the variable being set in the .env.local file.

**Investigation:**
1. Found inconsistent environment variable naming across the codebase:
   - Main page.tsx used `NEXT_PUBLIC_STRAPI_URL` 
   - PropertyFilters.tsx used `NEXT_PUBLIC_STRAPI_API_URL`
   - Property details page used a mix of both variables
   - The GitHub Actions workflow used `NEXT_PUBLIC_STRAPI_API_URL` for the Docker build argument
   - The Dockerfile had `NEXT_PUBLIC_STRAPI_URL` but was missing the additional variable

**Resolution:**
1. Standardized all code to use `NEXT_PUBLIC_STRAPI_URL` as the consistent environment variable name:
   - Updated PropertyFilters.tsx to use `NEXT_PUBLIC_STRAPI_URL`
   - Updated property details page to use `NEXT_PUBLIC_STRAPI_URL` throughout
   - Modified the GitHub Actions workflow to pass the value using the correct variable name
   - Updated the Dockerfile to handle both variable names for backward compatibility with CI/CD

**Outcome:** The frontend now correctly connects to the backend API, with properties loading on the homepage and property details pages.

**Decision:** Standardized on `NEXT_PUBLIC_STRAPI_URL` for all environment variable references. Added documentation to improve clarity for future development.

---

**Date:** 2025-03-28

**Topic:** Property Details Page Fetch Errors in Production

**Issue:** After standardizing the environment variables, the property details page still had fetch errors in production with `TypeError: Failed to fetch` errors occurring at the client-side fetch call in the property details page.

**Investigation:**
1. The property details page was using client-side fetching with the `useEffect` hook to load property data, which was causing the fetch error in the production environment.
2. In contrast, the main page was using server-side data fetching which was working correctly even in production.
3. The error occurred because the client-side fetching wasn't handling certain network conditions or CORS issues correctly in the production environment.

**Resolution:**
1. Refactored the property details page to use Next.js server-side data fetching pattern:
   - Created a server component in `[documentId]/page.tsx` that fetches the property data server-side
   - Moved the client-side interactive logic to a separate client component (`client.tsx`)
   - Passed the pre-fetched property data from the server component to the client component
   - Added better error handling for server-side fetch errors

2. The server component uses `fetch` with the following improvements:
   - Added proper headers
   - Used `cache: 'no-store'` to ensure fresh data
   - Implemented comprehensive error handling

**Outcome:** The property details page now reliably loads data in production without client-side fetch errors. This approach leverages Next.js built-in server components for better performance and reliability.

**Decision:** Adopt the server-side data fetching pattern for all routes that require reliable data loading, especially for critical page content. Use client components only for interactive elements that need access to browser APIs or React hooks.

---

**Date:** 2025-03-28

**Topic:** Google Cloud Storage (GCS) Image Upload Issues

**Issue:** Images uploaded through the Strapi admin panel were not being stored correctly in Google Cloud Storage. The upload operation would appear to succeed in the UI, but images would not be available through the API or visible in the bucket.

**Investigation:**
1. Examined the GCS provider configuration in `backend/config/env/production/plugins.ts` and found it was correctly implementing `@3akram/strapi-provider-upload-google-cloud-storage`.
2. Discovered that the GCS service account credentials were not being passed in the GitHub Actions workflow to the Cloud Run environment, despite having a `GCS_BUCKET_NAME` variable.
3. Checked the Cloud Run logs and found authentication errors indicating the service couldn't access the GCS bucket.
4. Reviewed the bucket permissions and identified potential CORS issues blocking browser-based uploads.

**Resolution:**
1. Updated GitHub Actions workflow to include all required GCS environment variables:
   ```yaml
   env_vars: |
     GCS_BUCKET_NAME=${{ secrets.GCS_BUCKET_NAME }}
     GCS_SERVICE_ACCOUNT_KEY_JSON=${{ secrets.GCS_SERVICE_ACCOUNT_KEY_JSON }}
     GCS_PUBLIC_FILES=true
     GCS_UNIFORM=false
   ```
2. Created a setup script (`setup-gcs-bucket.sh`) to configure the bucket with proper permissions and CORS settings:
   - Set CORS to allow uploads from any origin (`*`)
   - Made bucket objects publicly readable
   - Granted the service account full access to bucket objects
3. Created comprehensive documentation (STORAGE_SETUP.md) for setting up GCS integration, including:
   - Service account creation and key generation
   - Adding the credentials to GitHub Secrets
   - Running the setup script
   - Verifying the configuration

**Outcome:** Images uploaded through the Strapi admin panel are now correctly stored in GCS and accessible through the API. The bucket CORS configuration allows browser-based uploads, and the service account has the necessary permissions to write to the bucket.

**Decision:** Standardized GCS configuration and documented the setup process in detail to prevent similar issues in the future. Added the service account key instructions to the deployment guide.

---

**Date:** 2025-03-28

**Topic:** Image Processing and Thumbnail Generation Issues in Strapi

**Issue:** While the original images were being successfully uploaded to Google Cloud Storage, the thumbnails and image transformations were not being generated, resulting in 404 errors when trying to access them.

**Investigation:**
1. Analyzed the Docker configuration and found it was using Alpine-based Node.js images, which lack many of the necessary system dependencies for image processing with Sharp.
2. Reviewed the Cloud Run logs and found errors related to image processing libraries.
3. Examined the frontend components and found they were not properly handling missing image formats, leading to broken images in the UI.
4. Checked the GCS provider configuration and found it didn't have explicit settings for transformations.

**Resolution:**
1. Updated the Dockerfile to:
   - Switch from Alpine to Debian-based Node.js images
   - Install essential image processing dependencies (build-essential, libvips, libpng, etc.)
   - Ensure both build and production stages have the necessary libraries

2. Enhanced the GCS provider configuration:
   - Explicitly enabled transformations with `enableTransformations: true`
   - Specified the transformations path with `transformationsPath: 'formats'`
   - Added caching headers for better performance
   - Enabled debug mode for troubleshooting

3. Improved frontend image handling:
   - Added better fallback logic in PropertyCard and property details components
   - Implemented a cascading format selection (trying medium → small → thumbnail → original)
   - Added more robust error handling with console logging
   - Ensured all image components had proper fallback options

**Outcome:** After these changes, the image processing is now working correctly in the production environment. Thumbnails are being generated and displayed properly in the frontend, with graceful fallbacks when certain formats are unavailable.

**Decision:** Always use full Debian-based images for Node.js applications that require image processing capabilities, and ensure proper fallback mechanisms in the frontend for handling partial or missing image transformations.

---

**Date:** 2025-03-28

**Topic:** URL Construction Issues in Frontend Image Rendering

**Issue:** Images were not displaying in the frontend, with errors showing malformed URLs like `https://uz-rea-backend-480221447899.europe-west1.run.apphttps://storage.googleapis.com/uz-aggregator-show-strapi-media/large_interior_3_bd412fe52b.jpeg` - the backend URL was being concatenated with the storage URL without any separator.

**Investigation:**
1. Examined browser console errors and found references to malformed image URLs with two domains concatenated.
2. Reviewed the `PropertyCard.tsx` and `client.tsx` components, which were constructing image URLs incorrectly.
3. Found that the code was assuming all image URLs were relative paths and always prefixing them with the Strapi backend URL.
4. Determined that the image URLs returned from the Strapi API were sometimes absolute URLs (starting with `http(s)://`) but were still being prefixed.

**Resolution:**
1. Added a URL construction helper function `getImageUrl()` in both components that:
   - Checks if URLs already start with "http" and leaves them as-is
   - Only prepends the backend URL if the path is relative
   - Handles empty or missing values with a base64 encoded SVG placeholder
2. Implemented a proper inline SVG placeholder to ensure a fallback is always available
3. Refactored all image URL construction to use this helper function

**Outcome:** Images now display correctly throughout the application. The code properly handles both absolute and relative URLs from the API, eliminating the malformed URL errors.

**Decision:** Always check if a URL is absolute before prepending a domain, and use inline SVG data URIs for placeholder images rather than relative paths to ensure they're always available.

---

**Date:** 2025-03-28

**Topic:** Content Security Policy (CSP) Configuration for Google Cloud Storage Images

**Issue:** While the original images stored in Google Cloud Storage were accessible through direct URLs, the frontend application still had difficulty displaying them due to Content Security Policy restrictions in Strapi.

**Investigation:**
1. Found that Strapi's default security middleware was blocking image loading from external domains including Google Cloud Storage.
2. Discovered that even with correct URL construction, images would be blocked by the browser's security policies.
3. Examined Strapi's middleware configuration in `backend/config/middlewares.ts` and found that CSP settings needed adjustments.
4. Determined that a specific production middleware configuration would provide more control.

**Resolution:**
1. Updated the security middleware configuration to explicitly allow content from Google Cloud Storage:
   ```javascript
   {
     name: 'strapi::security',
     config: {
       contentSecurityPolicy: {
         directives: {
           'connect-src': ["'self'", 'https:'],
           'img-src': ["'self'", 'data:', 'blob:', 'storage.googleapis.com'],
           'media-src': ["'self'", 'data:', 'blob:', 'storage.googleapis.com'],
           upgradeInsecureRequests: null,
         },
       },
     },
   }
   ```
2. Created a production-specific middleware configuration to ensure these settings were applied in the Cloud Run environment.
3. Explicitly added `sharp` dependency (v0.32.6) to ensure proper image processing capabilities.
4. Cleaned up conflicting and duplicate GCS provider dependencies.

**Outcome:** Images from Google Cloud Storage now load correctly in both the Strapi admin panel and the frontend application, with proper security policies in place.

**Decision:** Always configure Content Security Policy settings when using external storage providers like Google Cloud Storage, and maintain separate development/production configurations when needed.

---

**IMPORTANT!!! General Project Rules & Notes:**

*   **Initial State:** Assume both backend (Strapi) and frontend (Next.js) servers are initially down. They need to be started manually (e.g., `npm run develop` / `npm run dev`).
*   **Strapi Version:** This project uses Strapi v5. Be mindful of breaking changes from v4. Refer to official documentation if needed: [https://github.com/strapi/documentation](https://github.com/strapi/documentation) (Git/GH CLI are available).
*   **Command Chaining:** When chaining commands in `execute_command`, ensure `&&` is used, not `&&`. Double-check commands before execution.
*   **Troubleshooting Loops:** If encountering persistent errors or loops (e.g., repeated failed attempts at a task), consider refactoring the approach or using alternative tools (like `write_to_file` instead of `replace_in_file` after multiple failures).
*   **Check VS Code Problems:** Regularly check the "Problems" tab in VS Code for TypeScript or linter errors after modifying files. Address these errors promptly.
*   **Strapi Reload Time:** Allow sufficient time (e.g., 60+ seconds) for the Strapi server to fully restart after schema changes or significant data operations (like clearing content types) before executing dependent scripts (like seeding). Rushing can lead to race conditions or errors.
*   **Strapi Modifications:** Prioritize using the Strapi API (REST or GraphQL) for creating, updating, or deleting content and configurations. Only resort to direct code modification (e.g., editing schema files, controllers, services) after exhausting API options, checking documentation, and confirming it's the necessary approach.

---
