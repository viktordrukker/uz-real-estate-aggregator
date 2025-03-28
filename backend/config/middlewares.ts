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
      // and the deployed frontend URLs
      origin: [
        'http://localhost:3000',
        'https://uz-rea-frontend-480221447899.europe-west1.run.app', // From error
        'https://uz-rea-frontend-m3kpztxi4a-ew.a.run.app' // Other potential URL
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
