'use client'; // Mark this as a Client Component

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PropertyFilters: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize state from URL search params
  const [listingType, setListingType] = useState(searchParams.get('listingType') || '');

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update the local state to reflect the dropdown change immediately
    if (name === 'listingType') {
      setListingType(value);
    }
    // Add similar logic here if other filters are added

    // Update the URL search parameters
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
            Location (Coming Soon)
          </label>
          <select
            id="location"
            name="location"
            disabled // Disabled for now
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-100 cursor-not-allowed"
          >
            <option value="">All</option>
            {/* Options will be populated later */}
          </select>
        </div>

        {/* Placeholder for Price Range Filter */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price Range (Coming Soon)
          </label>
          {/* Input fields or slider will go here */}
          <input
            type="text"
            disabled
            placeholder="Min - Max"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
