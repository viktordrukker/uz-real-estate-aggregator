// Define the structure for a Strapi Media object (Flat Structure)
export interface StrapiMediaFormat {
  url: string;
  // Add other format properties if needed (width, height, size, etc.)
}

export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  url: string; // Default URL
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
  createdAt: string;
  updatedAt: string;
  // Removed attributes wrapper
}

// Define the structure of a Property (Flat Structure)
export interface Property {
  id: number;
  documentId: string; // Still present at top level
  title: string;
  description?: string | null;
  price: number;
  area: number;
  rooms?: number | null;
  floor?: number | null;
  address?: string | null;
  listingType: 'Buy' | 'Rent';
  listingStatus: 'Available' | 'Sold' | 'Rented'; // Renamed from status
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  coordinates?: { latitude: number; longitude: number } | null;
  // Define structure for populated relations (flat)
  category?: { id: number; name: string; } | null; // Assuming flat relation data
  location?: { id: number; name: string; } | null; // Assuming flat relation data
  images?: StrapiMedia[] | null; // Assuming flat array of media objects
  amenities?: { id: number; name: string; }[] | null; // Assuming flat array of amenity objects
  // Removed attributes wrapper
}

// Type for the API response containing multiple properties
export interface PropertiesApiResponse {
  data: Property[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Type for the API response containing a single property
export interface SinglePropertyApiResponse {
  data: Property | null;
  meta: {};
}
