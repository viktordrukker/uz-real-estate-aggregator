'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext'; // Import useFavorites
import PropertyCard from '@/components/PropertyCard';
import Link from 'next/link';
import { stringify } from 'qs'; // Import qs for query string generation

// Define the structure for Property (matching PropertyCard)
interface Property {
    id: number;
    documentId: string;
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
    // Add other property fields as needed by PropertyCard
}


export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { favoriteIds, isLoading: favoritesLoading, removeFavorite } = useFavorites(); // Get IDs and loading state from context

  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true); // Local loading state for fetching property details
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch property details based on favoriteIds from context
  useEffect(() => {
    // Don't fetch if auth or favorites context is loading, or if user is not logged in
    if (authLoading || favoritesLoading || !user) {
      // If not loading but no user, clear properties and stop page loading
      if (!authLoading && !favoritesLoading && !user) {
        setFavoriteProperties([]);
        setPageLoading(false);
      }
      return;
    }

    const favoriteIdArray = Array.from(favoriteIds);

    if (favoriteIdArray.length === 0) {
      setFavoriteProperties([]); // Clear properties if no favorites
      setPageLoading(false);
      return;
    }

    const fetchFavoriteProperties = async () => {
      setPageLoading(true);
      setError(null);
      const apiUrlBase = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

      // Use qs to build the query for fetching multiple properties by ID
      const query = stringify({
        filters: {
          id: { $in: favoriteIdArray },
        },
        // Add any necessary population for PropertyCard here if needed later
        // populate: { category: true, location: true }
      }, { encodeValuesOnly: true });

      try {
        const response = await fetch(`${apiUrlBase}/api/properties?${query}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to fetch favorite properties');
        }

        const data = await response.json();
        setFavoriteProperties(data.data || []);

      } catch (err: any) {
        console.error("Fetch favorite properties error:", err);
        setError(err.message || 'An error occurred while fetching properties.');
        setFavoriteProperties([]);
      } finally {
        setPageLoading(false);
      }
    };

    fetchFavoriteProperties();
  }, [favoriteIds, user, authLoading, favoritesLoading]); // Rerun when favoriteIds or user changes

  // Handle combined loading states
  if (authLoading || favoritesLoading || pageLoading) {
    return <div className="container mx-auto p-4 text-center">Loading favorites...</div>;
  }

  // Handle not logged in state
  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Please <Link href="/login" className="text-blue-500 hover:underline">log in</Link> to view your favorites.</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      {favoriteProperties.length === 0 ? (
        <p>You haven't added any favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProperties.map((prop) => (
            // PropertyCard now gets its 'isFavorited' status directly from useFavorites hook internally
            <PropertyCard
              key={prop.id}
              property={prop}
              // No need for initialIsFavorited or onRemove here, context handles it
            />
          ))}
        </div>
      )}
    </div>
  );
}
