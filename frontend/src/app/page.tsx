// Define the structure of a Property based on the actual API response
// Strapi v5+ often returns a flatter structure by default
interface Property {
  id: number; // Keep the numerical ID if needed for keys, etc.
  documentId: string; // Add the documentId used for API lookups in v5
  title: string;
  description?: string | null; // Make optional fields nullable
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
  // We'll add relations like category, location, amenities later
  // Consider moving this interface to a shared types file
}

import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters'; // Import the filters component

interface GetPropertiesParams {
  locationId?: number; // Changed from location name to location ID
  listingType?: 'Buy' | 'Rent';
  // Add other filters like category, price range etc. later
}

// Function to fetch properties from Strapi API, now with filtering
async function getProperties(params: GetPropertiesParams = {}): Promise<Property[]> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  const queryParams = new URLSearchParams();

  // Add filters to query parameters
  // NOTE: Filtering by relation (locationId) seems problematic (400 error), needs investigation.
  // if (params.locationId) {
  //   queryParams.append('filters[location][$eq]', String(params.locationId));
  //   queryParams.append('populate', 'location');
  // }
  if (params.listingType) {
    // Filtering by a direct attribute
    queryParams.append('filters[listingType][$eq]', params.listingType);
  }

  // TODO: Add population for other relations if needed for display

  const queryString = queryParams.toString();
  const apiUrl = `${strapiUrl}/api/properties${queryString ? `?${queryString}` : ''}`;
  console.log("Fetching properties from:", apiUrl); // Log the final URL

  try {
    // Fetch data from Strapi API endpoint for properties
    const res = await fetch(apiUrl, { cache: 'no-store' }); // Use no-store for development

    if (!res.ok) {
      // Throw an error if the response is not successful
      throw new Error(`Failed to fetch properties: ${res.status} ${res.statusText}`);
    }

    const responseData = await res.json();
    console.log("Raw API Response:", JSON.stringify(responseData, null, 2)); // Log raw response

    const propertiesData = responseData.data || [];
    console.log("Extracted Properties Data:", JSON.stringify(propertiesData, null, 2)); // Log extracted data

    // Strapi wraps the data in a 'data' array
    return propertiesData;
  } catch (error) {
    console.error("Error fetching properties:", error);
    // Return an empty array or handle the error as appropriate
    return [];
  }
}


// Make the component async to use await for data fetching
// This page now needs access to searchParams to pass filters
interface HomePageProps {
  searchParams?: {
    listingType?: 'Buy' | 'Rent';
    locationId?: string; // Search params are strings
    // Add other potential search params here
  };
}

export default async function Home({ searchParams }: HomePageProps) {

  // Ensure searchParams is resolved before accessing its properties
  const resolvedSearchParams = await searchParams;

  // Prepare filters based on resolvedSearchParams
  const filters: GetPropertiesParams = {};
  if (resolvedSearchParams?.listingType) {
    filters.listingType = resolvedSearchParams.listingType;
  }
  // TODO: Add locationId filter once relational filtering is resolved
  // if (searchParams?.locationId) {
  //   filters.locationId = parseInt(searchParams.locationId, 10);
  // }

  // Fetch properties based on current filters
  const properties = await getProperties(filters);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Property Listings</h1>

      <PropertyFilters /> {/* Add the filter component */}

      {properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </main>
  );
}
