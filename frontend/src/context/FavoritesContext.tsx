'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Assuming AuthContext is in the same folder or adjust path

interface FavoritesContextType {
  favoriteIds: Set<number>; // Store only the IDs of favorited properties
  isLoading: boolean;
  addFavorite: (propertyId: number) => Promise<void>;
  removeFavorite: (propertyId: number) => Promise<void>;
  isFavorited: (propertyId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, jwt, isLoading: authLoading } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true); // Loading state for favorites

  // Fetch all favorite IDs when user logs in or auth state loads
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true); // Ensure loading state while auth is resolving
      return;
    }
    if (!user || !jwt) {
      setFavoriteIds(new Set()); // Clear favorites if user logs out
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const apiUrlBase = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    // Fetch favorite entries, filtering by user and populating the property relation.
    const filterByUser = `filters[user][id][$eq]=${user.id}`;
    const populateProperty = 'populate=property'; // Populate the whole property object
    const queryString = `${filterByUser}&${populateProperty}`;

    fetch(`${apiUrlBase}/api/favorites?${queryString}`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
      cache: 'no-store',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch initial favorites');
        return res.json();
      })
      .then(data => {
        const ids = new Set<number>(
          (data?.data || [])
            // Now the property object with its ID should be populated
            .map((fav: any) => fav.property?.id) // Access the id within the populated property object
            .filter((id: any) => typeof id === 'number')
        );
        console.log('[DEBUG] Initial favorite property IDs fetched:', ids); // DEBUG LOG
        setFavoriteIds(ids);
      })
      .catch(error => {
        console.error("Error fetching initial favorite IDs:", error);
        // Handle error appropriately, maybe show a notification
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [user, jwt, authLoading]);

  const addFavorite = useCallback(async (propertyId: number) => {
    if (!user || !jwt) throw new Error("User not authenticated");

    const apiUrlBase = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    const response = await fetch(`${apiUrlBase}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data: { property: propertyId } }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to add favorite');
    }

    // Update local state immediately
    setFavoriteIds(prevIds => new Set(prevIds).add(propertyId));

  }, [user, jwt]);

  const removeFavorite = useCallback(async (propertyId: number) => {
    if (!user || !jwt) throw new Error("User not authenticated");

    // Note: Using the custom DELETE endpoint
    const apiUrlBase = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    const response = await fetch(`${apiUrlBase}/api/favorites/property/${propertyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to remove favorite');
    }

    // Update local state immediately
    setFavoriteIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.delete(propertyId);
      return newIds;
    });

  }, [user, jwt]);

  const isFavorited = useCallback((propertyId: number): boolean => {
    return favoriteIds.has(propertyId);
  }, [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isLoading, addFavorite, removeFavorite, isFavorited }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use the FavoritesContext
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
