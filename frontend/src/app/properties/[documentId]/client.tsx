'use client';

import React, { useState, useEffect } from 'react';
import PropertyDetailsSkeleton from '@/components/PropertyDetailsSkeleton';
import YandexMap from '@/components/YandexMap';
import { Property, StrapiMedia } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

interface ClientPropertyDetailsProps {
  initialProperty: Property | null;
  documentId: string;
}

export default function ClientPropertyDetails({ 
  initialProperty, 
  documentId 
}: ClientPropertyDetailsProps) {
  const [property, setProperty] = useState<Property | null>(initialProperty);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // A base64 encoded SVG placeholder image
  const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjQwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzQ0NDQ0NCI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";

  const { user } = useAuth();
  const { isFavorited, addFavorite, removeFavorite, isLoading: favoritesLoading } = useFavorites();

  // Helper function to construct proper image URL
  const getImageUrl = (image: any) => {
    if (!image) return placeholderImage;
    
    // Select the best available format
    const imageUrl = image.formats?.medium?.url || 
                    image.formats?.small?.url || 
                    image.formats?.thumbnail?.url || 
                    image.url;
    
    // If URL is already absolute, use it directly, otherwise prepend the API base URL
    return imageUrl?.startsWith('http') 
           ? imageUrl 
           : imageUrl ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${imageUrl}` : placeholderImage;
  };

  useEffect(() => {
    // Set initial property from props
    if (initialProperty) {
      setProperty(initialProperty);
      
      // Set initial selected image if images exist
      if (initialProperty.images && initialProperty.images.length > 0) {
        const firstImage = initialProperty.images[0];
        const imageUrl = getImageUrl(firstImage);
        
        console.log(`Setting initial image URL: ${imageUrl}`);
        setSelectedImageUrl(imageUrl);
      }
    } else {
      setError('Property not found.');
    }
  }, [initialProperty]);

  const handleFavoriteToggle = async () => {
    if (!user || !property || isLoading || favoritesLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isFavorited(property.id)) {
        await removeFavorite(property.id);
      } else {
        await addFavorite(property.id);
      }
    } catch (err: any) {
      console.error("Favorite toggle error:", err);
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (index: number) => {
    if (!property?.images) return;
    const image = property.images[index];
    const imageUrl = getImageUrl(image);
    
    console.log(`Opening modal with image: ${imageUrl}`);
    setSelectedImageUrl(imageUrl);
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImageUrl(null); // Clear selected image when closing modal
  };

  const showNextImage = () => {
    if (!property?.images) return;
    const newIndex = (currentImageIndex + 1) % property.images.length;
    const newImage = property.images[newIndex];
    const newImageUrl = getImageUrl(newImage);
    
    console.log(`Navigating to next image: ${newImageUrl}`);
    setSelectedImageUrl(newImageUrl);
    setCurrentImageIndex(newIndex);
  };

  const showPrevImage = () => {
    if (!property?.images) return;
    const newIndex = (currentImageIndex - 1 + property.images.length) % property.images.length;
    const newImage = property.images[newIndex];
    const newImageUrl = getImageUrl(newImage);
    
    console.log(`Navigating to previous image: ${newImageUrl}`);
    setSelectedImageUrl(newImageUrl);
    setCurrentImageIndex(newIndex);
  };

  if (isLoading && !property) {
    return <PropertyDetailsSkeleton />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-600">{error}</div>;
  }

  if (!property) {
    return <div className="container mx-auto p-4 text-center">Property not found.</div>;
  }

  // Determine if favorited using context
  const currentIsFavorited = isFavorited(property.id);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Image Gallery Section */}
        <div className="relative">
          {selectedImageUrl ? (
            <img
              src={selectedImageUrl}
              alt={property.title || 'Property image'}
              className="w-full h-96 object-cover cursor-pointer"
              onClick={() => openModal(currentImageIndex)}
              onError={(e) => { 
                console.error(`Failed to load image: ${selectedImageUrl}`);
                (e.target as HTMLImageElement).src = placeholderImage; 
              }}
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
          {/* Thumbnails */}
          {property.images && property.images.length > 1 && (
            <div className="flex space-x-2 p-2 bg-gray-100 overflow-x-auto">
              {property.images.map((image: StrapiMedia, index: number) => {
                // Get thumbnail and main image URLs using our helper function
                const thumbnailUrl = getImageUrl({
                  formats: {
                    thumbnail: { url: image.formats?.thumbnail?.url },
                    small: { url: image.formats?.small?.url }
                  },
                  url: image.url
                });
                
                const mainImageUrl = getImageUrl({
                  formats: {
                    medium: { url: image.formats?.medium?.url },
                    small: { url: image.formats?.small?.url }
                  },
                  url: image.url
                });
                
                const isSelected = selectedImageUrl === mainImageUrl;
                
                return (
                  <img
                    key={image.id}
                    src={thumbnailUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-20 h-20 object-cover cursor-pointer rounded ${isSelected ? 'ring-2 ring-blue-500' : 'opacity-75 hover:opacity-100'}`}
                    onClick={() => {
                      setSelectedImageUrl(mainImageUrl);
                      setCurrentImageIndex(index); // Update index when thumbnail is clicked
                    }}
                    onError={(e) => { 
                      console.error(`Failed to load thumbnail: ${thumbnailUrl}`);
                      (e.target as HTMLImageElement).style.display = 'none'; 
                    }}
                  />
                );
              })}
            </div>
          )}
           {/* Favorite Button */}
           {user && (
            <button
              onClick={handleFavoriteToggle}
              disabled={isLoading || favoritesLoading}
              className={`absolute top-4 right-4 p-2 rounded-full text-white ${
                currentIsFavorited ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
              } transition-colors disabled:opacity-50 z-10`}
              aria-label={currentIsFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Details Section */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <p className="text-2xl font-semibold text-blue-600 mb-4">
            {property.price.toLocaleString('en-US', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 })}
          </p>
          <p className="text-gray-700 mb-4">{property.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div><span className="font-semibold">Type:</span> {property.listingType}</div>
            <div><span className="font-semibold">Status:</span> {property.listingStatus}</div>
            <div><span className="font-semibold">Area:</span> {property.area} sqm</div>
            {property.rooms && <div><span className="font-semibold">Rooms:</span> {property.rooms}</div>}
            {property.floor && <div><span className="font-semibold">Floor:</span> {property.floor}</div>}
            {property.category && <div><span className="font-semibold">Category:</span> {property.category.name}</div>}
            {property.location && <div><span className="font-semibold">Location:</span> {property.location.name}</div>}
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Amenities</h3>
              <ul className="list-disc list-inside space-y-1">
                {property.amenities.map(amenity => (
                  <li key={amenity.id}>{amenity.name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Map Section */}
          {property.coordinates?.latitude && property.coordinates?.longitude && (
            <div className="mb-6 h-64">
              <h3 className="text-lg font-semibold mb-2">Location on Map</h3>
              <YandexMap
                center={[property.coordinates.latitude, property.coordinates.longitude]}
                zoom={15}
                placemarks={[{
                  id: property.id,
                  documentId: property.documentId,
                  coords: [property.coordinates.latitude, property.coordinates.longitude]
                }]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && selectedImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImageUrl}
              alt={property.title || 'Property image'}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              aria-label="Close image viewer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
             {/* Navigation Buttons */}
             {property.images && property.images.length > 1 && (
               <>
                <button
                    onClick={showPrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                    aria-label="Previous image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    onClick={showNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                    aria-label="Next image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
               </>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
