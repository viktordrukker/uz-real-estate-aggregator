'use client'; // Convert to Client Component

import React, { useState } from 'react'; // Keep useState for local loading/error
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext'; // Import useFavorites

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
  initialIsFavorited?: boolean;
  onRemove?: (propertyId: number) => void; // Add optional callback for removal
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, initialIsFavorited = false, onRemove }) => {
  // Basic check in case property data is somehow incomplete
  if (!property || !property.title) {
    return null;
  }

  // TODO: Add image display when 'images' relation is populated
  // const imageUrl = property.images?.data?.[0]?.attributes?.url
  //   ? `http://localhost:1337${property.images.data[0].attributes.url}`
  //   : '/placeholder.png'; // Placeholder image path

  const { user } = useAuth(); // Only need user status to show button
  const { isFavorited, addFavorite, removeFavorite, isLoading: favoritesLoading } = useFavorites(); // Use context

  const [localLoading, setLocalLoading] = useState(false); // Local loading state for button press
  const [error, setError] = useState<string | null>(null);

  const currentIsFavorited = isFavorited(property.id); // Get status from context

  const handleFavoriteToggle = async () => {
    if (!user || localLoading || favoritesLoading) return; // Check local and context loading

    setLocalLoading(true);
    setError(null);

    try {
      if (currentIsFavorited) {
        await removeFavorite(property.id);
        // Call onRemove immediately if provided (for FavoritesPage)
        onRemove?.(property.id);
      } else {
        await addFavorite(property.id);
      }
    } catch (err: any) {
      console.error("Favorite toggle error:", err);
      setError(err.message || 'An error occurred.');
      // Optional: Revert UI state on error? Depends on desired UX.
    } finally {
      setLocalLoading(false);
    }
  };

  // Determine combined loading state
  const isLoading = localLoading || favoritesLoading;

  return (
    <div className="relative border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      {/* Favorite Button */}
      {user && (
        <button
          onClick={handleFavoriteToggle}
          disabled={isLoading} // Use combined loading state
          className={`absolute top-2 right-2 p-1.5 rounded-full text-white ${
            currentIsFavorited ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600' // Use status from context
          } transition-colors disabled:opacity-50 z-10`}
          aria-label={currentIsFavorited ? 'Remove from favorites' : 'Add to favorites'} // Use status from context
        >
          {/* Simple Heart Icon (replace with SVG later if desired) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </button>
      )}

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
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default PropertyCard;
