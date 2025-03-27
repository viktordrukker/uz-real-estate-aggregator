export default ({ env }) => ({
  'strapi-import-export': { // Try using the full package name as the key
    enabled: true,
    config: {
      // Add any plugin configuration options here if needed later
      // For example:
      // log: true, // Enable logging
      // allowedFileTypes: ['json'], // Restrict file types
    },
  },
});
