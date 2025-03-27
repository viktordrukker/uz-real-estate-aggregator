import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import PaginationControls from '@/components/PaginationControls';
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton'; // Import skeleton
import qs from 'qs';
import { Property, PropertiesApiResponse } from '@/types';

// Remove local Property interface definition

interface GetPropertiesParams {
  listingType?: 'Buy' | 'Rent';
  categoryId?: number;
  locationId?: number;
  page?: number;
  pageSize?: number;
}

// Keep PaginationMetadata interface if not moved to shared types
interface PaginationMetadata {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// Update return type to use shared Property type
async function getProperties(params: GetPropertiesParams = {}): Promise<{ properties: Property[], pagination: PaginationMetadata }> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';

  const { page = 1, pageSize = 12, ...filtersParams } = params;

  const query = {
    filters: {} as any,
    populate: ['category', 'location', 'images'],
    pagination: {
      page,
      pageSize,
    },
    sort: ['createdAt:desc'],
  };

  if (filtersParams.listingType) {
    query.filters.listingType = { $eq: filtersParams.listingType };
  }
  if (filtersParams.categoryId) {
    query.filters.category = { id: { $eq: filtersParams.categoryId } };
  }
  if (filtersParams.locationId) {
    query.filters.location = { id: { $eq: filtersParams.locationId } };
  }

  if (Object.keys(query.filters).length === 0) {
    delete query.filters;
  }

  const queryString = qs.stringify(query, { encodeValuesOnly: true });
  const apiUrl = `${strapiUrl}/api/properties?${queryString}`;
  console.log("Fetching properties from:", apiUrl);

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch properties: ${res.status} ${res.statusText}`);
    // Use PropertiesApiResponse for type safety
    const responseData: PropertiesApiResponse = await res.json();
    console.log("Raw API Response:", JSON.stringify(responseData, null, 2));

    return {
      properties: responseData.data || [],
      pagination: responseData.meta?.pagination || { page: 1, pageSize, pageCount: 0, total: 0 }
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { properties: [], pagination: { page: 1, pageSize, pageCount: 0, total: 0 } };
  }
}

async function getTotalPropertyCount(): Promise<number> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  const query = qs.stringify({ pagination: { pageSize: 1 } }, { encodeValuesOnly: true });
  const apiUrl = `${strapiUrl}/api/properties?${query}`;

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch total count: ${res.status} ${res.statusText}`);
    const responseData = await res.json();
    return responseData.meta?.pagination?.total || 0;
  } catch (error) {
    console.error("Error fetching total property count:", error);
    return 0;
  }
}

interface HomePageProps {
  searchParams?: {
    listingType?: 'Buy' | 'Rent';
    categoryId?: string;
    locationId?: string;
    page?: string;
  };
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams?.page || '1', 10);
  const pageSize = 12;

  const filters: GetPropertiesParams = { page: currentPage, pageSize };
  if (resolvedSearchParams?.listingType) {
    filters.listingType = resolvedSearchParams.listingType;
  }
  if (resolvedSearchParams?.categoryId) {
    const categoryIdNum = parseInt(resolvedSearchParams.categoryId, 10);
    if (!isNaN(categoryIdNum)) filters.categoryId = categoryIdNum;
  }
  if (resolvedSearchParams?.locationId) {
    const locationIdNum = parseInt(resolvedSearchParams.locationId, 10);
    if (!isNaN(locationIdNum)) filters.locationId = locationIdNum;
  }

  // Fetch properties and total count concurrently
  // We need a way to handle loading state for server components.
  // Next.js Suspense is the idiomatic way, but requires restructuring.
  // For now, we'll fetch and pass loading state down, though this isn't ideal for RSC.
  // A better approach would involve Suspense boundaries.

  // Let's simulate loading for now to test skeleton
  const loading = false; // Set to true to test skeleton
  const { properties, pagination } = loading ? { properties: [], pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 } } : await getProperties(filters);
  const totalCount = loading ? 0 : await getTotalPropertyCount();


  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Property Listings</h1>
      <PropertyFilters />
      <p className="mb-4 text-gray-600">
        Showing {properties.length} properties (Page {pagination.page} of {pagination.pageCount}, Total matching filters: {pagination.total}, Overall total: {totalCount})
      </p>
      {/* Conditional rendering based on loading state */}
      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Render multiple skeletons */}
           {Array.from({ length: pageSize }).map((_, index) => (
             <PropertyCardSkeleton key={index} />
           ))}
         </div>
      ) : properties.length === 0 ? (
        <p>No properties found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Only show pagination if not loading and there are multiple pages */}
      {!loading && pagination.pageCount > 1 && (
        <PaginationControls
          currentPage={pagination.page}
          pageCount={pagination.pageCount}
          total={pagination.total}
          pageSize={pagination.pageSize}
        />
      )}
    </main>
  );
}
