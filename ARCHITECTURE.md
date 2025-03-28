# Architecture: Uzbekistan Real Estate Aggregator

This document outlines the architecture, design decisions, and best practices implemented in the project.

## System Architecture

The application follows a modern web architecture with the following components:

### Frontend
- **Framework**: Next.js (App Router)
- **UI Components**: React with TailwindCSS
- **State Management**: React Context API
- **Deployment**: Google Cloud Run via Docker containers

### Backend
- **Framework**: Strapi v5 (Headless CMS)
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT via Strapi's users-permissions plugin
- **Deployment**: Google Cloud Run via Docker containers

### Infrastructure
- **Cloud Provider**: Google Cloud Platform
- **CI/CD**: GitHub Actions
- **Container Registry**: Google Artifact Registry
- **Hosting**: Cloud Run (serverless containers)

## Data Flow

1. Frontend requests data from Strapi API endpoints
2. Strapi processes requests, applies permissions, and queries the database
3. Data is returned to the frontend for rendering
4. Authentication tokens are stored in browser storage
5. Protected routes and features are gated by authentication status

## Security Considerations

- CORS is configured to only allow specific origins
- Authentication is handled via JWT tokens
- Role-based permissions in Strapi control data access
- Environment variables are securely managed in CI/CD and runtime

## Frontend Architecture

### Component Structure

The frontend follows a clear component hierarchy:

1. **Page Components**: Top-level components defined in the app directory
2. **Shared Components**: Reusable UI elements in the components directory
3. **Context Providers**: Global state management via React Context API

### Data Fetching Strategy

The application uses a mixed approach to data fetching:

1. **Server Components**: For initial page load data (faster rendering, better SEO)
   - Used for property listings, property details, and other static content
   - Implements proper error handling for server-side fetching failures

2. **Client Components**: For interactive features and dynamic content
   - Used for favoriting, filtering, user authentication, etc.
   - Employ React hooks for state management

### Responsiveness and Performance

- TailwindCSS for responsive design
- Skeleton loaders during data fetching operations
- Optimized image loading with different formats based on device
- Server-side rendering for improved SEO and initial page load

## Backend Architecture

### Content Types

Strapi organizes data into structured content types:

1. **Property**: Core entity representing real estate listings
2. **Category**: Property classifications (Apartment, House, Commercial, etc.)
3. **Location**: Geographic areas and regions
4. **Amenity**: Features and facilities
5. **Favorite**: User-saved properties (relational with Users)

### API Structure

The API follows REST principles with:

- Standard CRUD endpoints for each content type
- Relational data fetching with population
- Filtering, sorting, and pagination support
- Custom controllers for complex operations

### Authentication and Authorization

- JWT-based authentication via Strapi's users-permissions plugin
- Role-based access control:
  - Public role for anonymous users
  - Authenticated role for registered users
  - Administrative role for content management

## Best Practices

### Next.js Patterns

1. **Server Components**: Use for stable, non-interactive content that requires server-side data fetching
2. **Client Components**: Use for interactive elements that require hooks and browser APIs
3. **Route Handlers**: For API endpoints needed on the frontend
4. **Layout Components**: For shared UI elements across multiple pages

### Data Fetching

1. **Server-Side Fetching**: For critical page content
   - Use in server components for improved reliability and SEO
   - Implement proper error handling at the server level
   - Enable caching for static content where appropriate

2. **Client-Side Fetching**: For dynamic, user-specific data
   - Use for interactive features that depend on user state
   - Handle loading states with skeleton components
   - Implement proper error boundaries and retry mechanisms

### Deployment and Operations

1. **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions
2. **Environment Configuration**: Separate environment configs for development and production
3. **Docker Containers**: Consistent environments across development and production
4. **Cloud Run**: Scalable, serverless container hosting

## Improvement Areas

1. **Testing Strategy**: Implement comprehensive unit and integration tests
2. **Monitoring and Logging**: Add structured logging and monitoring
3. **Caching Strategy**: Implement Redis or similar for backend caching
4. **Performance Optimization**: Further optimize image loading and processing
5. **Internationalization**: Add multi-language support for the Uzbekistan market
