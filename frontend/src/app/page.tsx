// Define the structure of a Property based on the actual API response
interface Property {
  id: number;
  documentId: string;
  title: string;
  description?: string | null;
  price: number;
  area: number;
  rooms?: number | null;
  floor?: number | null;
  address?: string | null;
  listingType: 'Buy' | 'Rent';
  status: 'Available' | 'Sold' | 'Rented';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  category?: { id: number; name: string; } | null;
  location?: { id: number; name: string; } | null;
  images?: {
      id: number;
      name: string;
      alternativeText?: string | null;
      caption?: string | null;
      url: string;
      formats?: {
        thumbnail?: { url: string };
        small?: { url: string };
        medium?: { url: string };
        large?: { url: string };
      } | null;
    }[] | null;
}

import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import PaginationControls from '@/components/PaginationControls'; // Import PaginationControls
import qs from 'qs';

interface GetPropertiesParams {
  listingType?: 'Buy' | 'Rent';
  categoryId?: number;
  locationId?: number;
  page?: number;
  pageSize?: number;
}

interface PaginationMetadata {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface PropertiesApiResponse {
  properties: Property[];
  pagination: PaginationMetadata;
}

// Function to fetch properties with filters and pagination
async function getProperties(params: GetPropertiesParams = {}): Promise<PropertiesApiResponse> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';

  const { page = 1, pageSize = 12, ...filtersParams } = params; // Default page 1, pageSize 12

  const query = {
    filters: {} as any,
    populate: ['category', 'location', 'images'],
    pagination: {
      page,
      pageSize,
    },
    sort: ['createdAt:desc'], // Optional: sort by creation date
  };

  // Add filters conditionally
  if (filtersParams.listingType) {
    query.filters.listingType = { $eq: filtersParams.listingType };
  }
  if (filtersParams.categoryId) {
    query.filters.category = { id: { $eq: filtersParams.categoryId } };
  }
  if (filtersParams.locationId) {
    query.filters.location = { id: { $eq: filtersParams.locationId } };
  }

  // Remove filters object if it's empty
  if (Object.keys(query.filters).length === 0) {
    delete query.filters;
  }

  const queryString = qs.stringify(query, { encodeValuesOnly: true });
  const apiUrl = `${strapiUrl}/api/properties?${queryString}`;
  console.log("Fetching properties from:", apiUrl);

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch properties: ${res.status} ${res.statusText}`);
    const responseData = await res.json();
    return {
      properties: responseData.data || [],
      pagination: responseData.meta?.pagination || { page: 1, pageSize, pageCount: 0, total: 0 }
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { properties: [], pagination: { page: 1, pageSize, pageCount: 0, total: 0 } };
  }
}

// Function to fetch the total count of all properties
async function getTotalPropertyCount(): Promise<number> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  const query = qs.stringify({ pagination: { pageSize: 1 } }, { encodeValuesOnly: true }); // Fetch only 1 to get metadata
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
    page?: string; // Page number from URL
  };
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams?.page || '1', 10);
  const pageSize = 12; // Or make this configurable

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
  const [{ properties, pagination }, totalCount] = await Promise.all([
    getProperties(filters),
    getTotalPropertyCount()
  ]);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Property Listings</h1>

      <PropertyFilters />

      {/* Display the count */}
      <p className="mb-4 text-gray-600">
        Showing {properties.length} properties (Page {pagination.page} of {pagination.pageCount}, Total matching filters: {pagination.total}, Overall total: {totalCount})
      </p>

      {properties.length === 0 ? (
        <p>No properties found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* TODO: Add PaginationControls component here */}
      {/* <PaginationControls
          currentPage={pagination.page}
          pageCount={pagination.pageCount}
          total={pagination.total} // Total matching filters
          pageSize={pagination.pageSize}
       /> */}

      {/* Add Pagination Controls if there are multiple pages */}
      {pagination.pageCount > 1 && (
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
