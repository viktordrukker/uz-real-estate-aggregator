// Define the structure for a Strapi Media object
export interface StrapiMediaFormat {
  url: string;
  // Add other format properties if needed (width, height, size, etc.)
}

export interface StrapiMedia {
  id: number;
  attributes: {
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
    // Add other media attributes if needed (mime, size, width, height, etc.)
    createdAt: string;
    updatedAt: string;
  };
}

// Define the structure of a Property
export interface Property {
  id: number;
  attributes: { // Strapi v4/v5 wraps attributes
    documentId: string; // Keep documentId if needed, though usually accessed via top-level id for relations
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
    coordinates?: { latitude: number; longitude: number } | null;
    // Define structure for populated relations (nested under attributes)
    category?: { data: { id: number; attributes: { name: string; } } | null };
    location?: { data: { id: number; attributes: { name: string; } } | null };
    images?: { data: StrapiMedia[] | null };
    // TODO: Add amenities later
  };
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
