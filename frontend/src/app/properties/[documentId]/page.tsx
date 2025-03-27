'use client'; // Convert to Client Component

import React, { useState, useEffect } from 'react'; // Keep useState for local loading/error
import { useParams } from 'next/navigation';
import YandexMap from '@/components/YandexMap';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Property, SinglePropertyApiResponse } from '@/types'; // Import shared types

// Remove local Property interface definition

// Client Component
export default function PropertyDetailsPage() {
  const params = useParams(); // Get route params
  const documentId = params?.documentId as string | undefined; // Extract documentId

  const [property, setProperty] = useState<Property | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const { user } = useAuth(); // Only need user status
  const { isFavorited, addFavorite, removeFavorite, isLoading: favoritesLoading } = useFavorites(); // Use context

  const [localLoading, setLocalLoading] = useState(false); // Local loading state for button press
  const [favError, setFavError] = useState<string | null>(null); // Keep local error state for fav button

  // Effect to fetch property data (initial favorite status is now handled by context)
  useEffect(() => {
    if (!documentId) {
      setPageError("Property ID not found in URL.");
      setPageLoading(false);
      return;
    }

    const fetchProperty = async () => {
      setPageLoading(true);
      setPageError(null);
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'; // Use NEXT_PUBLIC_ prefix
      try {
        // Populate all relations needed
        const res = await fetch(`${strapiUrl}/api/properties/${documentId}?populate[category]=*&populate[location]=*&populate[images]=*`, { cache: 'no-store' });

        if (!res.ok) {
          if (res.status === 404) {
            setPageError('Property not found.');
          } else {
            throw new Error(`Failed to fetch property ${documentId}: ${res.status} ${res.statusText}`);
          }
          setProperty(null);
        } else {
          // Use SinglePropertyApiResponse for type safety
          const responseData: SinglePropertyApiResponse = await res.json();
          setProperty(responseData.data || null);
        }
      } catch (error: any) {
        console.error(`Error fetching property ${documentId}:`, error);
        setPageError(error.message || 'Failed to load property data.');
        setProperty(null);
      } finally {
        setPageLoading(false);
      }
    };

    fetchProperty();
  }, [documentId]); // Only depends on documentId now

  // Favorite toggle handler using context functions
  const handleFavoriteToggle = async () => {
    if (!user || localLoading || favoritesLoading || !property) return;

    setLocalLoading(true);
    setFavError(null);
    const currentIsFavorited = isFavorited(property.id);

    try {
      if (currentIsFavorited) {
        await removeFavorite(property.id);
      } else {
        await addFavorite(property.id);
      }
    } catch (err: any) {
      console.error("Favorite toggle error:", err);
      setFavError(err.message || 'An error occurred.');
    } finally {
      setLocalLoading(false);
    }
  };

  // Determine combined loading state
  const isLoading = localLoading || favoritesLoading;

  // Render loading state
  if (pageLoading) {
    return <div className="container mx-auto p-4 text-center">Loading property details...</div>;
  }

  // Render error state
  if (pageError) {
    return <div className="container mx-auto p-4 text-center text-red-600">{pageError}</div>;
  }

  // Render property not found
  if (!property) {
    // This case might be redundant if pageError handles 404, but good for clarity
    return <div className="container mx-auto p-4 text-center">Property not found.</div>;
  }

  // --- Render actual page content ---

  // Access data via property.attributes
  let mapCenter: [number, number] | undefined;
  let placemarkCoords: [number, number] | undefined;
  try {
    if (property.attributes.coordinates?.latitude && property.attributes.coordinates?.longitude) {
      mapCenter = [property.attributes.coordinates.latitude, property.attributes.coordinates.longitude];
      placemarkCoords = mapCenter;
    }
  } catch (e) {
    console.error("Error parsing coordinates:", e);
    mapCenter = [41.2995, 69.2401]; // Default to Tashkent center
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">{property.attributes.title}</h1>
        {user && (
          <button
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            className={`p-2 rounded-full text-white ${
              isFavorited(property.id) ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 hover:bg-gray-500'
            } transition-colors disabled:opacity-50`}
            aria-label={isFavorited(property.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
       {favError && <p className="text-red-500 text-sm mb-2 -mt-2">{favError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Main Image Display */}
          <div className="w-full h-96 bg-gray-200 mb-4 rounded overflow-hidden">
            {property.attributes.images?.data && property.attributes.images.data.length > 0 ? (
              <img
                src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${property.attributes.images.data[0].attributes.formats?.medium?.url || property.attributes.images.data[0].attributes.url}`}
                alt={property.attributes.images.data[0].attributes.alternativeText || property.attributes.title || 'Property image'}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image Available</div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {property.attributes.images?.data && property.attributes.images.data.length > 1 && (
            <div className="flex space-x-2 mb-4 overflow-x-auto">
              {property.attributes.images.data.map((image) => (
                <div key={image.id} className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                   <img
                    src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${image.attributes.formats?.thumbnail?.url || image.attributes.url}`}
                    alt={image.attributes.alternativeText || `Thumbnail ${image.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Map Section */}
          <h2 className="text-2xl font-semibold mt-6 mb-2">Location</h2>
          {mapCenter ? (
            <YandexMap center={mapCenter} placemarkCoords={placemarkCoords} zoom={15} />
          ) : (
            <p>Coordinates not available for map display.</p>
          )}

          <h2 className="text-2xl font-semibold mt-6 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {property.attributes.description || 'No description available.'}
          </p>
        </div>
        <div className="md:col-span-1 border rounded p-4 shadow-md h-fit">
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <p className="text-xl font-medium text-blue-600 mb-3">
            {property.attributes.price.toLocaleString('en-US', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 })}
          </p>
          <div className="space-y-2 text-gray-700">
            <p><strong>Type:</strong> {property.attributes.listingType}</p>
            <p><strong>Status:</strong> {property.attributes.status}</p>
            <p><strong>Area:</strong> {property.attributes.area} sqm</p>
            {property.attributes.rooms && <p><strong>Rooms:</strong> {property.attributes.rooms}</p>}
            {property.attributes.floor && <p><strong>Floor:</strong> {property.attributes.floor}</p>}
            {property.attributes.address && <p><strong>Address:</strong> {property.attributes.address}</p>}
            {property.attributes.category?.data && <p><strong>Category:</strong> {property.attributes.category.data.attributes.name}</p>}
            {property.attributes.location?.data && <p><strong>Location:</strong> {property.attributes.location.data.attributes.name}</p>}
            {/* TODO: Display Amenities */}
          </div>
        </div>
      </div>
    </div>
  );
}
