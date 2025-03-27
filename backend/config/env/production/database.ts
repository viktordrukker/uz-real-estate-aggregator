// Use path import for compatibility, though not strictly needed here
// import path from 'path';

export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'), // Use Cloud SQL IP or Proxy path
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD'),
      // Ensure SSL is true for Supabase connection in production
      ssl: env.bool('DATABASE_SSL', true) ? { rejectUnauthorized: env.bool('DATABASE_REJECT_UNAUTHORIZED', false) } : false,
    },
    debug: false,
    // Use pool options for production performance
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
    },
  },
});
