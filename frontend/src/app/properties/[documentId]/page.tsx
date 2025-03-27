'use client'; // Convert to Client Component

import React, { useState, useEffect } from 'react'; // Keep useState for local loading/error
import { useParams } from 'next/navigation';
import YandexMap from '@/components/YandexMap';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext'; // Import useFavorites

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
        const res = await fetch(`${strapiUrl}/api/properties/${documentId}?populate=*`, { cache: 'no-store' });

        if (!res.ok) {
          if (res.status === 404) {
            setPageError('Property not found.');
          } else {
            throw new Error(`Failed to fetch property ${documentId}: ${res.status} ${res.statusText}`);
          }
          setProperty(null);
        } else {
          const responseData = await res.json();
          const propertyData = responseData.data || null;
          setProperty(propertyData);
          // No need to fetch initial favorite status here anymore, context handles it
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

  // Parse coordinates safely (can stay outside useEffect as it depends on fetched 'property')
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
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        {/* Favorite Button */}
        {user && (
          <button
            onClick={handleFavoriteToggle}
            disabled={isLoading} // Use combined loading state
            className={`p-2 rounded-full text-white ${
              isFavorited(property.id) ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 hover:bg-gray-500' // Use context state
            } transition-colors disabled:opacity-50`}
            aria-label={isFavorited(property.id) ? 'Remove from favorites' : 'Add to favorites'} // Use context state
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
