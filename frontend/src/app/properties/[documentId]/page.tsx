import React from 'react';
import YandexMap from '@/components/YandexMap'; // Import the map component

// Define the structure of a Property based on the actual API response
// Consider moving this interface to a shared types file
interface Property {
  id: number; // Keep the numerical ID if needed
  documentId: string; // Add the documentId used for API lookups in v5
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
  coordinates?: { latitude: number; longitude: number } | null; // Add coordinates type
  // TODO: Add populated relations (category, location, amenities, images) later
}

// Function to fetch a single property by Document ID from Strapi API
async function getPropertyByDocumentId(documentId: string): Promise<Property | null> {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  try {
    // Fetch data using documentId
    // Add populate=* to fetch relations later
    const res = await fetch(`${strapiUrl}/api/properties/${documentId}?populate=*`, { cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 404) {
        return null; // Property not found
      }
      // Throw an error for other non-successful responses
      throw new Error(`Failed to fetch property ${documentId}: ${res.status} ${res.statusText}`);
    }

    const responseData = await res.json();
    console.log(`Raw API Response for Document ID ${documentId}:`, JSON.stringify(responseData, null, 2));

    // Strapi wraps single entry data in a 'data' object
    const propertyData = responseData.data || null;
    console.log(`Extracted Property Data for Document ID ${documentId}:`, JSON.stringify(propertyData, null, 2));

    return propertyData;
  } catch (error) {
    console.error(`Error fetching property ${documentId}:`, error);
    return null; // Return null or handle the error as appropriate
  }
}

// Define the props for the page component, including URL parameters
interface PropertyDetailsPageProps {
  params: {
    documentId: string; // The [documentId] part of the URL
  };
}

// Make the component async to use await for data fetching
export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  // Ensure params is resolved before accessing documentId
  const resolvedParams = await params;
  const { documentId } = resolvedParams;

  // Fetch property data only if documentId is valid
  const property = documentId ? await getPropertyByDocumentId(documentId) : null;

  if (!property) {
    // TODO: Implement a proper 404 page later
    return <div className="container mx-auto p-4 text-center">Property not found.</div>;
  }

  // Parse coordinates safely
  let mapCenter: [number, number] | undefined;
  let placemarkCoords: [number, number] | undefined;
  try {
    if (property.coordinates?.latitude && property.coordinates?.longitude) {
      mapCenter = [property.coordinates.latitude, property.coordinates.longitude];
      placemarkCoords = mapCenter; // Use same coords for placemark
    }
  } catch (e) {
    console.error("Error parsing coordinates:", e);
    // Use a default center if coordinates are invalid/missing
    mapCenter = [41.2995, 69.2401]; // Default to Tashkent center
  }

  // TODO: Add image display
  // TODO: Display relations (Category, Location, Amenities)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Image Placeholder */}
          {/* Image Placeholder */}
          <div className="w-full h-96 bg-gray-300 flex items-center justify-center text-gray-500 mb-4 rounded">
            Image Placeholder
          </div>

          {/* Map Section */}
          <h2 className="text-2xl font-semibold mt-6 mb-2">Location</h2>
          {mapCenter ? (
            <YandexMap center={mapCenter} placemarkCoords={placemarkCoords} zoom={15} />
          ) : (
            <p>Coordinates not available for map display.</p>
          )}

          <h2 className="text-2xl font-semibold mt-6 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {property.description || 'No description available.'}
          </p>
        </div>
        <div className="md:col-span-1 border rounded p-4 shadow-md h-fit">
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <p className="text-xl font-medium text-blue-600 mb-3">
            {property.price.toLocaleString()} UZS
          </p>
          <div className="space-y-2 text-gray-700">
            <p><strong>Type:</strong> {property.listingType}</p>
            <p><strong>Status:</strong> {property.status}</p>
            <p><strong>Area:</strong> {property.area} sqm</p>
            {property.rooms && <p><strong>Rooms:</strong> {property.rooms}</p>}
            {property.floor && <p><strong>Floor:</strong> {property.floor}</p>}
            {property.address && <p><strong>Address:</strong> {property.address}</p>}
            {/* TODO: Display Category, Location, Amenities */}
          </div>
        </div>
      </div>
    </div>
  );
}
