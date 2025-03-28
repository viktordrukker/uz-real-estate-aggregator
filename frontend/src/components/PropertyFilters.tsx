'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Import useEffect and useCallback
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
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRooms, setMinRooms] = useState(searchParams.get('minRooms') || '');

  // State for dropdown options
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetching options

  // Fetch categories and locations on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const apiUrlBase = process.env.NEXT_PUBLIC_STRAPI_API_URL;
      if (!apiUrlBase) {
        console.error("Error: NEXT_PUBLIC_STRAPI_URL environment variable is not set.");
        setIsLoading(false); // Stop loading if URL is missing
        return; // Exit if URL is missing
      }
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

  // Debounce function
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Function to update URL parameters
  const updateUrlParams = (updatedFilters: Record<string, string>) => {
    const currentParams = new URLSearchParams();
    // Add existing non-empty filters first
    if (listingType) currentParams.set('listingType', listingType);
    if (categoryId) currentParams.set('categoryId', categoryId);
    if (locationId) currentParams.set('locationId', locationId);
    if (minPrice) currentParams.set('minPrice', minPrice);
    if (maxPrice) currentParams.set('maxPrice', maxPrice);
    if (minRooms) currentParams.set('minRooms', minRooms);

    // Apply updates from the changed input
    for (const key in updatedFilters) {
        if (updatedFilters[key]) {
            currentParams.set(key, updatedFilters[key]);
        } else {
            currentParams.delete(key);
        }
    }

    // Reset page to 1 when filters change
    currentParams.delete('page');

    router.push(`/?${currentParams.toString()}`, { scroll: false });
  };

  // Debounced version of URL update for text/number inputs
  const debouncedUpdateUrlParams = useCallback(debounce(updateUrlParams, 500), [listingType, categoryId, locationId, minPrice, maxPrice, minRooms, router]); // Include all state dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFilters = { [name]: value };

    // Update local state immediately
    if (name === 'listingType') setListingType(value);
    else if (name === 'categoryId') setCategoryId(value);
    else if (name === 'locationId') setLocationId(value);
    else if (name === 'minPrice') setMinPrice(value);
    else if (name === 'maxPrice') setMaxPrice(value);
    else if (name === 'minRooms') setMinRooms(value);

    // Update URL immediately for selects, debounce for inputs
    if (e.target.tagName === 'SELECT') {
        updateUrlParams(updatedFilters);
    } else {
        debouncedUpdateUrlParams(updatedFilters);
    }
  };

  return (
    <div className="mb-6 p-4 border rounded shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end"> {/* Adjusted grid columns and alignment */}
        {/* Listing Type Filter */}
        <div>
          <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">
            Listing Type
          </label>
          <select
            id="listingType"
            name="listingType"
            value={listingType}
            onChange={handleInputChange} // Use unified handler
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Types</option>
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
            name="locationId"
            value={locationId}
            onChange={handleInputChange} // Use unified handler
            disabled={isLoading}
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
            name="categoryId"
            value={categoryId}
            onChange={handleInputChange} // Use unified handler
            disabled={isLoading}
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

        {/* Min Price Filter */}
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Min Price (UZS)
          </label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            value={minPrice}
            onChange={handleInputChange} // Use unified handler
            placeholder="e.g., 50000"
            min="0"
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price (UZS)
          </label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            value={maxPrice}
            onChange={handleInputChange} // Use unified handler
            placeholder="e.g., 200000"
            min="0"
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>

         {/* Min Rooms Filter */}
         <div>
          <label htmlFor="minRooms" className="block text-sm font-medium text-gray-700 mb-1">
            Min Rooms
          </label>
          <input
            type="number"
            id="minRooms"
            name="minRooms"
            value={minRooms}
            onChange={handleInputChange} // Use unified handler
            placeholder="e.g., 2"
            min="1"
            step="1"
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>

      </div>
    </div>
  );
};

export default PropertyFilters;
