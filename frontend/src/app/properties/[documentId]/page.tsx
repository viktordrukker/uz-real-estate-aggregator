import { Property, StrapiMedia } from '@/types';
import ClientPropertyDetails from './client';

// Server component to fetch the property data
async function getProperty(documentId: string): Promise<Property | null> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!strapiUrl) {
    console.error("Error: NEXT_PUBLIC_STRAPI_URL environment variable is not set.");
    throw new Error("API URL configuration error.");
  }
  
  const apiUrl = `${strapiUrl}/api/properties/${documentId}?populate=*`;
  console.log("Server: Fetching property details from:", apiUrl);

  try {
    const res = await fetch(apiUrl, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch property: ${res.status} ${res.statusText}`);
    }
    
    const responseData = await res.json();
    return responseData.data || null;
  } catch (error) {
    console.error("Error fetching property details:", error);
    throw error;
  }
}

// The main server component
export default async function PropertyDetailsPage({ 
  params 
}: { 
  params: { documentId: string } 
}) {
  const { documentId } = params;
  
  try {
    const property = await getProperty(documentId);
    
    // Pass the pre-fetched property data to the client component
    return <ClientPropertyDetails initialProperty={property} documentId={documentId} />;
  } catch (error) {
    // Return an error state for server-side errors
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        Failed to load property details. Please try again later.
      </div>
    );
  }
}
