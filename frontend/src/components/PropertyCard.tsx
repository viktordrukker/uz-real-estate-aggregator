'use client'; // Convert to Client Component

import React, { useState } from 'react'; // Keep useState for local loading/error
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Property } from '@/types'; // Import shared Property type

interface PropertyCardProps {
  property: Property;
  initialIsFavorited?: boolean;
  onRemove?: (propertyId: number) => void; // Add optional callback for removal
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, initialIsFavorited = false, onRemove }) => {
  // Basic check using flat structure
  if (!property || !property.title) {
    console.warn("PropertyCard received invalid property data:", property);
    return null;
  }

  // Get the URL for the primary image (using flat structure)
  const firstImage = property.images?.[0];
  const imageUrl = firstImage
    ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${firstImage.formats?.small?.url || firstImage.url}`
    : '/placeholder.png';

  const { user } = useAuth();
  const { isFavorited, addFavorite, removeFavorite, isLoading: favoritesLoading } = useFavorites(); // Use context

  const [localLoading, setLocalLoading] = useState(false); // Local loading state for button press
  const [error, setError] = useState<string | null>(null);

  // Use property ID for context checks/actions
  const propertyId = property.id;
  const currentIsFavorited = isFavorited(propertyId);

  const handleFavoriteToggle = async () => {
    if (!user || localLoading || favoritesLoading) return;

    setLocalLoading(true);
    setError(null);

    try {
      if (currentIsFavorited) {
        await removeFavorite(propertyId);
        onRemove?.(propertyId); // Call onRemove if provided
      } else {
        await addFavorite(propertyId);
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

      {/* Image Display */}
      <div className="w-full h-48 bg-gray-200">
        <img
          src={imageUrl}
          alt={firstImage?.alternativeText || property.title || 'Property image'}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 truncate" title={property.title}>
          {property.title}
        </h2>
        <p className="text-lg font-medium text-blue-600 mb-2">
          {property.price.toLocaleString('en-US', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 })}
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Type: {property.listingType}</p>
          <p>Status: {property.listingStatus}</p> {/* Use listingStatus */}
          <p>Area: {property.area} sqm</p>
          {property.rooms && <p>Rooms: {property.rooms}</p>}
          {property.floor && <p>Floor: {property.floor}</p>}
          {property.category && <p>Category: {property.category.name}</p>}
          {property.location && <p>Location: {property.location.name}</p>}
        </div>
        {/* Link using documentId */}
        <Link href={`/properties/${property.documentId}`} className="text-blue-500 hover:underline mt-4 inline-block">
          View Details
        </Link>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default PropertyCard;
