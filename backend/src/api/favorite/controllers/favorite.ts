/**
 * favorite controller
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

// Define types for context state if needed, or use 'any' for simplicity
interface AuthenticatedContext extends Context {
  state: {
    user?: {
      id: number;
      // other user properties if needed
    };
  };
  request: Context['request'] & {
    body?: any; // Define more specific type if possible
  };
  params: {
    propertyId?: string;
    // other params
  };
}

// Extend the core controller only for the actions we need to customize
export default factories.createCoreController('api::favorite.favorite', ({ strapi }) => ({
  // 'find' action will use the default core implementation

  /**
   * Create a favorite for the currently authenticated user.
   * POST /favorites
   * Expects { property: number } in the request body data
   */
  async create(ctx: AuthenticatedContext) {
    const user = ctx.state.user;
    // Access data within the 'data' object as per Strapi v4/v5 convention for POST/PUT
    const propertyId = ctx.request.body?.data?.property;

    if (!user) {
      return ctx.unauthorized('You must be logged in to add a favorite.');
    }

    if (!propertyId || typeof propertyId !== 'number') {
      return ctx.badRequest('Missing or invalid "property" ID in request body data.');
    }

    // Check if the favorite already exists for this user and property
    const existingFavorite = await strapi.entityService.findMany('api::favorite.favorite', {
      filters: {
        // @ts-ignore - Suppress TS error due to complex filter types
        user: user.id,
        // @ts-ignore - Suppress TS error due to complex filter types
        property: propertyId,
      },
      limit: 1,
    });

    if (existingFavorite && existingFavorite.length > 0) {
      // Return the existing favorite instead of an error, or handle as preferred
      // return ctx.badRequest('Property already favorited.');
      // Use transformResponse to format the output correctly
      const sanitized = await (this as any).sanitizeOutput(existingFavorite[0], ctx); // Use 'this as any' for type safety
      return (this as any).transformResponse(sanitized); // Indicate success, already exists
    }

    // Create the new favorite entry, associating it with the user
    const newFavorite = await strapi.entityService.create('api::favorite.favorite', {
      data: {
        user: user.id,
        property: propertyId,
        publishedAt: new Date(), // Manually set publishedAt if needed for immediate availability via API
      }
      // No need to populate here, just return the created entry
    });

    // Use transformResponse to format the output correctly
    const sanitizedFavorite = await (this as any).sanitizeOutput(newFavorite, ctx); // Use 'this as any' for type safety
    return (this as any).transformResponse(sanitizedFavorite);
  },

  /**
   * Delete a favorite for the currently authenticated user by property ID.
   * DELETE /favorites/property/:propertyId
   */
  async deleteByPropertyId(ctx: AuthenticatedContext) {
    const user = ctx.state.user;
    const propertyId = ctx.params.propertyId;

    if (!user) {
      return ctx.unauthorized('You must be logged in to remove a favorite.');
    }

    if (!propertyId) {
      return ctx.badRequest('Missing propertyId parameter.');
    }

    const propertyIdNum = parseInt(propertyId, 10);
    if (isNaN(propertyIdNum)) {
        return ctx.badRequest('Invalid propertyId parameter.');
    }

    // Find the specific favorite entry to delete
    const entriesToDelete = await strapi.entityService.findMany('api::favorite.favorite', {
      filters: {
        // @ts-ignore - Suppress TS error due to complex filter types
        user: user.id,
        // @ts-ignore - Suppress TS error due to complex filter types
        property: propertyIdNum,
      },
      limit: 1, // Should only be one
    });

    if (!entriesToDelete || entriesToDelete.length === 0) {
      return ctx.notFound('Favorite not found for this property and user.');
    }

    const favoriteToDelete = entriesToDelete[0];

    // Delete the favorite entry using its own ID
    const deletedFavorite = await strapi.entityService.delete('api::favorite.favorite', favoriteToDelete.id);

    // Use transformResponse to format the output correctly
    const sanitizedFavorite = await (this as any).sanitizeOutput(deletedFavorite, ctx); // Use 'this as any' for type safety
    return (this as any).transformResponse(sanitizedFavorite);
  },
}));
