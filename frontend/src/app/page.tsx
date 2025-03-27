import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import PaginationControls from '@/components/PaginationControls';
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton';
import YandexMap from '@/components/YandexMap'; // Import the map component
import qs from 'qs';
import { Property, PropertiesApiResponse } from '@/types';
import { Suspense } from 'react'; // Import Suspense

interface GetPropertiesParams {
  listingType?: 'Buy' | 'Rent';
  categoryId?: number;
  locationId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  page?: number;
  pageSize?: number;
}

interface PaginationMetadata {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// Fetches paginated properties for the list view
async function getProperties(params: GetPropertiesParams = {}): Promise<{ properties: Property[], pagination: PaginationMetadata }> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  const { page = 1, pageSize = 12, categoryId, locationId, listingType, minPrice, maxPrice, minRooms } = params;

  const query = {
    filters: {} as any,
    populate: ['category', 'location', 'images', 'amenities'],
    pagination: { page, pageSize },
    sort: ['createdAt:desc'],
  };

  // Build filters dynamically
  if (listingType) query.filters.listingType = { $eq: listingType };
  if (categoryId) query.filters.category = { id: { $eq: categoryId } };
  if (locationId) query.filters.location = { id: { $eq: locationId } };
  if (minPrice || maxPrice) {
    query.filters.price = {};
    if (minPrice) query.filters.price.$gte = minPrice;
    if (maxPrice) query.filters.price.$lte = maxPrice;
  }
  if (minRooms) query.filters.rooms = { $gte: minRooms };

  if (Object.keys(query.filters).length === 0) delete query.filters;

  const queryString = qs.stringify(query, { encodeValuesOnly: true });
  const apiUrl = `${strapiUrl}/api/properties?${queryString}`;
  console.log("Fetching properties from:", apiUrl);

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch properties: ${res.status} ${res.statusText}`);
    const responseData: PropertiesApiResponse = await res.json();
    console.log("Raw API Response (Paginated):", JSON.stringify(responseData, null, 2).substring(0, 300) + '...'); // Log snippet

    return {
      properties: responseData.data || [],
      pagination: responseData.meta?.pagination || { page: 1, pageSize, pageCount: 0, total: 0 }
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { properties: [], pagination: { page: 1, pageSize, pageCount: 0, total: 0 } };
  }
}

// Function to fetch coordinates and IDs for ALL filtered properties (for map) using iterative fetching
async function getFilteredPropertiesForMap(params: Omit<GetPropertiesParams, 'page' | 'pageSize'>): Promise<Pick<Property, 'id' | 'documentId' | 'coordinates'>[]> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  const { categoryId, locationId, listingType, minPrice, maxPrice, minRooms } = params;
  const PAGE_SIZE_FOR_MAP = 100; // Fetch in chunks of 100

  const baseQuery = {
    filters: {} as any,
    fields: ['id', 'documentId', 'coordinates'],
    populate: [],
  };

  // Build filters dynamically (same logic as getProperties)
  if (listingType) baseQuery.filters.listingType = { $eq: listingType };
  if (categoryId) baseQuery.filters.category = { id: { $eq: categoryId } };
  if (locationId) baseQuery.filters.location = { id: { $eq: locationId } };
  if (minPrice || maxPrice) {
    baseQuery.filters.price = {};
    if (minPrice) baseQuery.filters.price.$gte = minPrice;
    if (maxPrice) baseQuery.filters.price.$lte = maxPrice;
  }
  if (minRooms) baseQuery.filters.rooms = { $gte: minRooms };

  if (Object.keys(baseQuery.filters).length === 0) delete baseQuery.filters;

  let allProperties: Pick<Property, 'id' | 'documentId' | 'coordinates'>[] = [];
  let currentPage = 1;
  let pageCount = 1; // Assume at least one page initially

  console.log("Fetching all map properties iteratively...");

  try {
    do {
      const query = {
        ...baseQuery,
        pagination: {
          page: currentPage,
          pageSize: PAGE_SIZE_FOR_MAP,
        },
      };
      const queryString = qs.stringify(query, { encodeValuesOnly: true });
      const apiUrl = `${strapiUrl}/api/properties?${queryString}`;
      // console.log(` Fetching map page ${currentPage}...`);

      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to fetch map properties page ${currentPage}: ${res.status} ${res.statusText}`);

      const responseData: PropertiesApiResponse = await res.json();

      if (responseData.data && responseData.data.length > 0) {
        allProperties = allProperties.concat(responseData.data);
      }

      // Update pageCount from the first response, then increment currentPage
      if (currentPage === 1) {
        pageCount = responseData.meta?.pagination?.pageCount || 1;
      }
      currentPage++;

    } while (currentPage <= pageCount);

    console.log(`Fetched ${allProperties.length} total properties for map across ${pageCount} page(s).`);
    return allProperties;

  } catch (error) {
    console.error("Error fetching map properties:", error);
    return []; // Return empty array on error
  }
}


async function getTotalPropertyCount(): Promise<number> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  // This function should fetch the overall total, independent of filters applied to the list/map
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
    minPrice?: string;
    maxPrice?: string;
    minRooms?: string;
    page?: string;
  };
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams?.page || '1', 10);
  const pageSize = 12;

  // Prepare filters for both paginated list and full map data
  const filters: GetPropertiesParams = { page: currentPage, pageSize };
  const mapFilters: Omit<GetPropertiesParams, 'page' | 'pageSize'> = {};

  if (resolvedSearchParams?.listingType) {
    filters.listingType = resolvedSearchParams.listingType;
    mapFilters.listingType = resolvedSearchParams.listingType;
  }
  if (resolvedSearchParams?.categoryId) {
    const categoryIdNum = parseInt(resolvedSearchParams.categoryId, 10);
    if (!isNaN(categoryIdNum)) {
        filters.categoryId = categoryIdNum;
        mapFilters.categoryId = categoryIdNum;
    }
  }
  if (resolvedSearchParams?.locationId) {
    const locationIdNum = parseInt(resolvedSearchParams.locationId, 10);
    if (!isNaN(locationIdNum)) {
        filters.locationId = locationIdNum;
        mapFilters.locationId = locationIdNum;
    }
  }
  if (resolvedSearchParams?.minPrice) {
    const minPriceNum = parseFloat(resolvedSearchParams.minPrice);
    if (!isNaN(minPriceNum)) {
        filters.minPrice = minPriceNum;
        mapFilters.minPrice = minPriceNum;
    }
  }
  if (resolvedSearchParams?.maxPrice) {
    const maxPriceNum = parseFloat(resolvedSearchParams.maxPrice);
    if (!isNaN(maxPriceNum)) {
        filters.maxPrice = maxPriceNum;
        mapFilters.maxPrice = maxPriceNum;
    }
  }
  if (resolvedSearchParams?.minRooms) {
    const minRoomsNum = parseInt(resolvedSearchParams.minRooms, 10);
    if (!isNaN(minRoomsNum)) {
        filters.minRooms = minRoomsNum;
        mapFilters.minRooms = minRoomsNum;
    }
  }

  // Fetch data concurrently
  const loading = false; // Keep loading simulation if needed for testing skeletons
  const [propertiesResult, totalCount, mapProperties] = await Promise.all([
    loading ? Promise.resolve({ properties: [], pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 } }) : getProperties(filters),
    loading ? Promise.resolve(0) : getTotalPropertyCount(),
    loading ? Promise.resolve([]) : getFilteredPropertiesForMap(mapFilters) // Fetch all coordinates matching filters
  ]);

  const { properties, pagination } = propertiesResult;

  // Prepare placemarks using the complete filtered list
  console.log(`[DEBUG] mapProperties count: ${mapProperties.length}`); // Log count fetched for map
  const placemarks = mapProperties
    .filter(p => p.coordinates?.latitude && p.coordinates?.longitude)
    .map(p => ({
      id: p.id,
      documentId: p.documentId, // Include documentId for linking
      coords: [p.coordinates!.latitude, p.coordinates!.longitude] as [number, number],
    }));
  console.log("[DEBUG] Placemarks array for map:", placemarks); // Log the final placemarks array

  const defaultMapCenter: [number, number] = [41.2995, 69.2401]; // Tashkent center

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Property Listings</h1>
      <PropertyFilters />

      {/* Map Section */}
      <div className="mb-6 h-96">
        <YandexMap
          center={defaultMapCenter}
          zoom={10}
          placemarks={placemarks} // Pass all placemarks
        />
      </div>

      <p className="mb-4 text-gray-600">
        Showing {properties.length} properties on this page (Page {pagination.page} of {pagination.pageCount}, Total matching filters: {pagination.total}, Overall total: {totalCount})
      </p>

      {/* Property List */}
      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Pagination */}
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
