'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import YandexMap from '@/components/YandexMap';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Property, SinglePropertyApiResponse, StrapiMedia } from '@/types'; // Import StrapiMedia
import PropertyDetailsSkeleton from '@/components/PropertyDetailsSkeleton';

// Client Component
export default function PropertyDetailsPage() {
  const params = useParams(); // Get route params
  const propertyId = params?.documentId as string | undefined; // Keep as string

  const [property, setProperty] = useState<Property | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null); // State for main image URL

  const { user } = useAuth(); // Only need user status
  const { isFavorited, addFavorite, removeFavorite, isLoading: favoritesLoading } = useFavorites(); // Use context

  const [localLoading, setLocalLoading] = useState(false); // Local loading state for button press
  const [favError, setFavError] = useState<string | null>(null); // Keep local error state for fav button

  // Effect to fetch property data
  useEffect(() => {
    if (!propertyId) {
      setPageError("Property ID not found in URL.");
      setPageLoading(false);
      return;
    }

    const fetchProperty = async () => {
      setPageLoading(true);
      setPageError(null);
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
      try {
        console.log(`[DEBUG] Fetching property with ID: ${propertyId}`);
        // Use populate=* for simplicity and to match working curl command
        const res = await fetch(`${strapiUrl}/api/properties/${propertyId}?populate=*`, { cache: 'no-store' });

        if (!res.ok) {
          if (res.status === 404) {
            setPageError('Property not found.');
          } else {
            throw new Error(`Failed to fetch property ${propertyId}: ${res.status} ${res.statusText}`);
          }
          setProperty(null);
        } else {
          const responseData: SinglePropertyApiResponse = await res.json();
          const fetchedProperty = responseData.data || null;
          setProperty(fetchedProperty);
          // Set initial selected image URL
          if (fetchedProperty?.images && fetchedProperty.images.length > 0) {
            const firstImage = fetchedProperty.images[0];
            setSelectedImageUrl(
              `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${firstImage.formats?.medium?.url || firstImage.url}`
            );
          } else {
            setSelectedImageUrl('/placeholder.png'); // Fallback if no images
          }
        }
      } catch (error: any) {
        console.error(`Error fetching property ${propertyId}:`, error);
        setPageError(error.message || 'Failed to load property data.');
        setProperty(null);
      } finally {
        setPageLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

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

  // Render loading state using skeleton
  if (pageLoading) {
    return <PropertyDetailsSkeleton />;
  }

  // Render error state
  if (pageError) {
    return <div className="container mx-auto p-4 text-center text-red-600">{pageError}</div>;
  }

  // Render property not found
  if (!property) {
    return <div className="container mx-auto p-4 text-center">Property not found.</div>;
  }

  // --- Render actual page content ---

  // Access data directly (flat structure)
  let mapCenter: [number, number] | undefined;
  let placemarkCoords: [number, number] | undefined;
  try {
    if (property.coordinates?.latitude && property.coordinates?.longitude) { // Use flat access
      mapCenter = [property.coordinates.latitude, property.coordinates.longitude];
      placemarkCoords = mapCenter;
    }
  } catch (e) {
    console.error("Error parsing coordinates:", e);
    mapCenter = [41.2995, 69.2401]; // Default to Tashkent center
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">{property.title}</h1> {/* Use flat access */}
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
          {/* Main Image Display - Use state for src */}
          <div className="w-full h-96 bg-gray-200 mb-4 rounded overflow-hidden">
            {selectedImageUrl ? (
              <img
                src={selectedImageUrl}
                alt={property.title || 'Property image'} // Use main title as fallback alt
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image Available</div>
            )}
          </div>

          {/* Thumbnail Gallery - Add onClick handler */}
          {property.images && property.images.length > 1 && (
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2"> {/* Add padding-bottom */}
              {property.images.map((image: StrapiMedia) => {
                const thumbnailUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${image.formats?.thumbnail?.url || image.url}`;
                const mainImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${image.formats?.medium?.url || image.url}`;
                const isSelected = selectedImageUrl === mainImageUrl;

                return (
                  <div
                    key={image.id}
                    className={`w-20 h-20 flex-shrink-0 rounded overflow-hidden cursor-pointer border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImageUrl(mainImageUrl)}
                  >
                   <img
                    src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${image.formats?.thumbnail?.url || image.url}`}
                    alt={image.alternativeText || `Thumbnail ${image.id}`}
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
            {property.description || 'No description available.'} {/* Use flat access */}
          </p>
        </div>
        <div className="md:col-span-1 border rounded p-4 shadow-md h-fit">
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <p className="text-xl font-medium text-blue-600 mb-3">
            {property.price.toLocaleString('en-US', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 })} {/* Use flat access */}
          </p>
          <div className="space-y-2 text-gray-700">
            <p><strong>Type:</strong> {property.listingType}</p>
            <p><strong>Status:</strong> {property.listingStatus}</p> {/* Use listingStatus */}
            <p><strong>Area:</strong> {property.area} sqm</p>
            {property.rooms && <p><strong>Rooms:</strong> {property.rooms}</p>}
            {property.floor && <p><strong>Floor:</strong> {property.floor}</p>} {/* Use flat access */}
            {property.address && <p><strong>Address:</strong> {property.address}</p>} {/* Use flat access */}
            {/* Access relations directly */}
            {property.category && <p><strong>Category:</strong> {property.category.name}</p>}
            {property.location && <p><strong>Location:</strong> {property.location.name}</p>}
            {/* TODO: Display Amenities */}
          </div>
        </div>
      </div>
    </div>
  );
}
