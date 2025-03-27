/**
 * favorite router
 */

export default {
  routes: [
    // == Core Routes (Manually Defined) ==
    {
      method: 'GET',
      path: '/favorites',
      handler: 'favorite.find', // Default core find action
      // config: {
      //   // Remove policy config - rely on frontend filtering for find
      // },
    },
    {
      method: 'POST',
      path: '/favorites',
      handler: 'favorite.create', // Custom create action (overridden in controller)
      // config: {
      //   // Remove policy config - handled in controller
      // },
    },
    // We are not using the default delete by favorite ID, so it's omitted.
    // {
    //   method: 'DELETE',
    //   path: '/favorites/:id',
    //   handler: 'favorite.delete',
    //   config: {
    //     policies: ['plugin::users-permissions.isAuthenticated'], // Add ownership policy here too
    //   },
    // },
    // findOne and update are also omitted for now

    // == Custom Routes ==
    {
      method: 'DELETE',
      path: '/favorites/property/:propertyId', // Custom path for deleting by property ID
      handler: 'favorite.deleteByPropertyId', // Custom controller action
      // config: {
      //   // Remove policy config - handled in controller
      // },
    },
  ],
};
