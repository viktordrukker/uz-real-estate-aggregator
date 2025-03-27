'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect
import { useRouter, useSearchParams } from 'next/navigation';

// Define interfaces for fetched data
interface Category {
  id: number;
  name: string;
}
interface Location {
  id: number;
  name: string;
}

const PropertyFilters: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL search params
  const [listingType, setListingType] = useState(searchParams.get('listingType') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [locationId, setLocationId] = useState(searchParams.get('locationId') || '');

  // State for dropdown options
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetching options

  // Fetch categories and locations on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const apiUrlBase = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
      try {
        const [catRes, locRes] = await Promise.all([
          fetch(`${apiUrlBase}/api/categories`),
          fetch(`${apiUrlBase}/api/locations`)
        ]);

        if (!catRes.ok || !locRes.ok) {
          throw new Error('Failed to fetch filter options');
        }

        const catData = await catRes.json();
        const locData = await locRes.json();

        setCategories(catData.data || []);
        setLocations(locData.data || []);

      } catch (error) {
        console.error("Error fetching filter options:", error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // Empty dependency array means run once on mount

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update local state
    if (name === 'listingType') setListingType(value);
    if (name === 'categoryId') setCategoryId(value);
    if (name === 'locationId') setLocationId(value);

    // Update URL
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) {
      currentParams.set(name, value);
    } else {
      currentParams.delete(name); // Remove filter if 'All' is selected
    }

    // Update URL query parameters without full page reload
    router.push(`/?${currentParams.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-6 p-4 border rounded shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Listing Type Filter */}
        <div>
          <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">
            Listing Type
          </label>
          <select
            id="listingType"
            name="listingType"
            value={listingType}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            <option value="Buy">Buy</option>
            <option value="Rent">Rent</option>
          </select>
        </div>

        {/* Placeholder for Location Filter */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="locationId"
            name="locationId" // Use locationId
            value={locationId}
            onChange={handleFilterChange}
            disabled={isLoading} // Disable while loading options
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId" // Use categoryId
            value={categoryId}
            onChange={handleFilterChange}
            disabled={isLoading} // Disable while loading options
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* TODO: Add Price Range, Rooms etc. filters later */}

      </div>
    </div>
  );
};

export default PropertyFilters;
