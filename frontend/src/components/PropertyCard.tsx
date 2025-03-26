import React from 'react';
import Link from 'next/link'; // Import Link

// Define the structure of a Property based on the actual API response
// (Same interface as in page.tsx - consider moving to a shared types file later)
interface Property {
  id: number; // Keep the numerical ID if needed for keys, etc.
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
  // We'll add relations like category, location, amenities later
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  // Basic check in case property data is somehow incomplete
  if (!property || !property.title) {
    return null;
  }

  // TODO: Add image display when 'images' relation is populated
  // const imageUrl = property.images?.data?.[0]?.attributes?.url
  //   ? `http://localhost:1337${property.images.data[0].attributes.url}`
  //   : '/placeholder.png'; // Placeholder image path

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      {/* Placeholder for Image */}
      <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500">
        {/* <img src={imageUrl} alt={property.title} className="w-full h-full object-cover"/> */}
        Image Placeholder
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 truncate" title={property.title}>
          {property.title}
        </h2>
        <p className="text-lg font-medium text-blue-600 mb-2">
          {/* TODO: Format price properly */}
          {property.price.toLocaleString()} UZS
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Type: {property.listingType}</p>
          <p>Area: {property.area} sqm</p>
          {property.rooms && <p>Rooms: {property.rooms}</p>}
          {property.floor && <p>Floor: {property.floor}</p>}
          {/* TODO: Add Category/Location display when populated */}
          {/* <p>Category: {property.category?.data?.attributes?.name}</p> */}
          {/* <p>Location: {property.location?.data?.attributes?.name}</p> */}
        </div>
        {/* Link using documentId for Strapi v5 */}
        <Link href={`/properties/${property.documentId}`} className="text-blue-500 hover:underline mt-4 inline-block">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
