export default ({ env }) => ({
  upload: {
    config: {
      provider: '@3akram/strapi-provider-upload-google-cloud-storage',
      providerOptions: {
        bucketName: env('GCS_BUCKET_NAME'),
        publicFiles: env.bool('GCS_PUBLIC_FILES', true),
        uniform: env.bool('GCS_UNIFORM', false),
        serviceAccount: env('GCS_SERVICE_ACCOUNT_KEY_JSON', undefined), // Use JSON key content directly
        // Alternatively, if using GOOGLE_APPLICATION_CREDENTIALS env var pointing to a file:
        // keyFilename: env('GOOGLE_APPLICATION_CREDENTIALS', undefined),
        baseUrl: env('GCS_BASE_URL', `https://storage.googleapis.com/${env('GCS_BUCKET_NAME')}`),
        basePath: env('GCS_BASE_PATH', ''),
        // Enhanced image transformation settings
        enableTransformations: true,
        transformationsPath: 'formats',
        // Specify direct formats by name for better reliability
        formats: ['large', 'medium', 'small', 'thumbnail'],
        // Add caching headers to improve performance
        cacheMaxAge: 3600 * 24 * 7, // 7 days
        // Enable more verbose logging for troubleshooting
        debug: true,
      },
    },
  },
  // ... any other production-specific plugin configurations
});
