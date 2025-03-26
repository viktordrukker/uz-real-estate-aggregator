// Define the structure of a Property based on our Strapi model
interface PropertyAttributes {
  title: string;
  description: string;
  price: number;
  area: number;
  rooms?: number;
  floor?: number;
  address?: string;
  listingType: 'Buy' | 'Rent';
  status: 'Available' | 'Sold' | 'Rented';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  // We'll add relations like category, location, amenities later
}

interface Property {
  id: number;
  attributes: PropertyAttributes;
}

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

    // Strapi wraps the data in a 'data' array
    return responseData.data || [];
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
            <div key={property.id} className="border rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold mb-2">{property.attributes.title}</h2>
              {/* Display price - consider formatting later */}
              <p className="text-lg font-medium text-blue-600 mb-2">
                Price: {property.attributes.price} UZS {/* Assuming UZS, adjust as needed */}
              </p>
              <p className="text-gray-700 mb-1">Type: {property.attributes.listingType}</p>
              <p className="text-gray-700 mb-1">Area: {property.attributes.area} sqm</p>
              {/* Add more details as needed */}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
