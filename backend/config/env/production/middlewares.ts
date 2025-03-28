// Production-specific middleware configuration that overrides the default config
export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'storage.googleapis.com', 'https://storage.googleapis.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'storage.googleapis.com', 'https://storage.googleapis.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // Configure CORS to allow requests from the frontend production URLs
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*', // Allow all headers
      origin: [
        'https://uz-rea-frontend-480221447899.europe-west1.run.app',
        'https://uz-rea-frontend-m3kpztxi4a-ew.a.run.app'
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      credentials: true, // Allow cookies/auth headers
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
