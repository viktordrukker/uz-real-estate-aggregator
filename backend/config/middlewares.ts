export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  // Configure CORS to allow requests from the frontend development server
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*', // Allow all headers
      // Allow requests from localhost:3000 (frontend dev server)
      // Add other origins (like your production frontend URL) later
      origin: ['http://localhost:3000'],
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
