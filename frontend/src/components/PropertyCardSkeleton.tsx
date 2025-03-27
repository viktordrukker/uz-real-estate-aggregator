import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import skeleton styles

const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      {/* Image Skeleton */}
      <Skeleton height={192} /> {/* Corresponds to h-48 */}
      <div className="p-4">
        {/* Title Skeleton */}
        <Skeleton width={`80%`} height={24} className="mb-2" />
        {/* Price Skeleton */}
        <Skeleton width={`50%`} height={20} className="mb-2" />
        {/* Details Skeleton */}
        <div className="text-sm text-gray-600 space-y-1">
          <Skeleton width={`60%`} />
          <Skeleton width={`70%`} />
          <Skeleton width={`50%`} />
          <Skeleton width={`40%`} />
        </div>
        {/* Button Skeleton */}
        <Skeleton width={100} height={36} className="mt-4" />
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;
