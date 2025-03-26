// Define the structure of a Property based on the actual API response
// Strapi v5+ often returns a flatter structure by default
interface Property {
  id: number;
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

import PropertyCard from '@/components/PropertyCard'; // Assuming default alias setup or adjust path

// Function to fetch properties from Strapi API
async function getProperties(): Promise<Property[]> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  try {
    // Fetch data from Strapi API endpoint for properties
    // We previously enabled public 'find' access
    const res = await fetch(`${strapiUrl}/api/properties`, { cache: 'no-store' }); // Use no-store for development to see changes

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
export default async function Home() {
  const properties = await getProperties();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Property Listings</h1>

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
