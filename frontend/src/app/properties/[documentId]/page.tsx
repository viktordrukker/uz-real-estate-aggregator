'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import YandexMap from '@/components/YandexMap';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Property, SinglePropertyApiResponse, StrapiMedia } from '@/types';
import PropertyDetailsSkeleton from '@/components/PropertyDetailsSkeleton';

// Client Component
export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params?.documentId as string | undefined;

  const [property, setProperty] = useState<Property | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const { user } = useAuth();
  const { isFavorited, addFavorite, removeFavorite, isLoading: favoritesLoading } = useFavorites();

  const [localLoading, setLocalLoading] = useState(false);
  const [favError, setFavError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track index for modal navigation

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

          if (fetchedProperty?.images && fetchedProperty.images.length > 0) {
            const firstImage = fetchedProperty.images[0];
            const imageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${firstImage.formats?.medium?.url || firstImage.url}`;
            setSelectedImageUrl(imageUrl);
            setCurrentImageIndex(0); // Reset index
          } else {
            setSelectedImageUrl('/placeholder.png');
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

  // Favorite toggle handler
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

  // Modal Image Navigation
  const handlePreviousImage = () => {
    if (!property?.images || property.images.length <= 1) return;
    const newIndex = (currentImageIndex - 1 + property.images.length) % property.images.length;
    const newImage = property.images[newIndex];
    const newImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${newImage.formats?.medium?.url || newImage.url}`;
    setSelectedImageUrl(newImageUrl);
    setCurrentImageIndex(newIndex);
  };

  const handleNextImage = () => {
    if (!property?.images || property.images.length <= 1) return;
    const newIndex = (currentImageIndex + 1) % property.images.length;
    const newImage = property.images[newIndex];
    const newImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${newImage.formats?.medium?.url || newImage.url}`;
    setSelectedImageUrl(newImageUrl);
    setCurrentImageIndex(newIndex);
  };


  const isLoading = localLoading || favoritesLoading;

  // Render loading state
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

  // Prepare map data
  let mapCenter: [number, number] | undefined;
  let placemarkCoords: [number, number] | undefined;
  try {
    if (property.coordinates?.latitude && property.coordinates?.longitude) {
      mapCenter = [property.coordinates.latitude, property.coordinates.longitude];
      placemarkCoords = mapCenter;
    }
  } catch (e) {
    console.error("Error parsing coordinates:", e);
    mapCenter = [41.2995, 69.2401]; // Default to Tashkent center
  }

  // Determine if multiple images exist for modal buttons
  const hasMultipleImages = property && property.images && property.images.length > 1;

  // Render page content
  return (
    <div className="container mx-auto p-4">
      {/* Header with Title and Favorite Button */}
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">{property.title}</h1>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Images, Map, Description) */}
        <div className="md:col-span-2">
          {/* Main Image - Make clickable */}
          <div
            className="w-full h-96 bg-gray-200 mb-4 rounded overflow-hidden cursor-pointer"
            onClick={() => selectedImageUrl && selectedImageUrl !== '/placeholder.png' && setIsModalOpen(true)} // Open modal on click if image exists
          >
            {selectedImageUrl ? (
              <img
                src={selectedImageUrl}
                alt={property.title || 'Property image'}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image Available</div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {property.images && property.images.length > 1 && (
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
              {property.images.map((image: StrapiMedia) => {
                const thumbnailUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${image.formats?.thumbnail?.url || image.url}`;
                const mainImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${image.formats?.medium?.url || image.url}`;
                const isSelected = selectedImageUrl === mainImageUrl;
                const imageIndex = property.images.findIndex(img => img.id === image.id); // Find index for setting currentImageIndex
                return (
                  <div
                    key={image.id}
                    className={`w-20 h-20 flex-shrink-0 rounded overflow-hidden cursor-pointer border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => {
                        setSelectedImageUrl(mainImageUrl);
                        setCurrentImageIndex(imageIndex); // Update index when thumbnail clicked
                    }}
                  >
                    <img
                      src={thumbnailUrl}
                      alt={image.alternativeText || `Thumbnail ${image.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Map */}
          <h2 className="text-2xl font-semibold mt-6 mb-2">Location</h2>
          {mapCenter ? (
            // Pass placemark data as an array to the 'placemarks' prop, including documentId
            <YandexMap
              center={mapCenter}
              placemarks={placemarkCoords ? [{ id: property.id, documentId: property.documentId, coords: placemarkCoords }] : []}
              zoom={15}
            />
          ) : (
            <p>Coordinates not available for map display.</p>
          )}

          {/* Description */}
          <h2 className="text-2xl font-semibold mt-6 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {property.description || 'No description available.'}
          </p>
        </div>

        {/* Right Column (Details) */}
        <div className="md:col-span-1 border rounded p-4 shadow-md h-fit">
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <p className="text-xl font-medium text-blue-600 mb-3">
            {property.price.toLocaleString('en-US', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 })}
          </p>
          <div className="space-y-2 text-gray-700">
            <p><strong>Type:</strong> {property.listingType}</p>
            <p><strong>Status:</strong> {property.listingStatus}</p>
            <p><strong>Area:</strong> {property.area} sqm</p>
            {property.rooms && <p><strong>Rooms:</strong> {property.rooms}</p>}
            {property.floor && <p><strong>Floor:</strong> {property.floor}</p>}
            {property.address && <p><strong>Address:</strong> {property.address}</p>}
            {property.category && <p><strong>Category:</strong> {property.category.name}</p>}
            {property.location && <p><strong>Location:</strong> {property.location.name}</p>}

            {/* Display Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Amenities:</h3>
                <ul className="list-disc list-inside">
                  {property.amenities.map((amenity) => (
                    <li key={amenity.id}>{amenity.name}</li> // Reverted to standard implicit return
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal - Moved inside the main return div */}
      {isModalOpen && selectedImageUrl && selectedImageUrl !== '/placeholder.png' && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" // Slightly darker bg, padding
          onClick={() => setIsModalOpen(false)} // Close modal on background click
        >
          {/* Close Button */}
          <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-50" // Improved position & padding
              aria-label="Close image modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>

          {/* Previous Button */}
          {property && property.images && property.images!.length > 1 && ( // Re-apply non-null assertion
             <button
              onClick={(e) => { e.stopPropagation(); handlePreviousImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-50"
              aria-label="Previous image"
            >
               <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                 <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
               </svg>
            </button>
          )}

          {/* Image Container */}
          <div className="relative max-w-screen-lg max-h-[90vh]" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking image */}
            <img
              src={selectedImageUrl.replace(/\/medium_|\/small_|\/thumbnail_/, '/large_') || selectedImageUrl} // Attempt to load large format
              alt={property.title || 'Property image enlarged'}
              className="max-w-full max-h-[90vh] object-contain rounded" // Added rounded corners
            />
          </div>

           {/* Next Button */}
           {property && property.images && property.images!.length > 1 && ( // Re-apply non-null assertion
             <button
              onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-50"
              aria-label="Next image" // Corrected label
            >
               {/* Heroicon: chevron-right (Corrected Icon) */}
               <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                 <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
               </svg>
             </button> // Corrected closing tag location
           )}
        </div> // This closes the modal div
      )}
    </div> // This closes the main component div
  );
}
