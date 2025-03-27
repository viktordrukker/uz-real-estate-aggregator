import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PropertyDetailsSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      {/* Title Skeleton */}
      <Skeleton width={`60%`} height={36} className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Main Image Skeleton */}
          <Skeleton height={384} className="mb-4" /> {/* Corresponds to h-96 */}

          {/* Thumbnail Gallery Skeleton (Optional, can add later if needed) */}
          {/* <div className="flex space-x-2 mb-4">
            <Skeleton width={80} height={80} />
            <Skeleton width={80} height={80} />
            <Skeleton width={80} height={80} />
          </div> */}

          {/* Map Section Skeleton */}
          <Skeleton width={150} height={28} className="mt-6 mb-2" />
          <Skeleton height={300} />

          {/* Description Skeleton */}
          <Skeleton width={180} height={28} className="mt-6 mb-2" />
          <Skeleton count={5} />
        </div>
        <div className="md:col-span-1 border rounded p-4 shadow-md h-fit">
          {/* Details Sidebar Skeleton */}
          <Skeleton width={100} height={28} className="mb-4" />
          <Skeleton width={`60%`} height={24} className="mb-3" />
          <div className="space-y-2">
            <Skeleton width={`50%`} />
            <Skeleton width={`40%`} />
            <Skeleton width={`70%`} />
            <Skeleton width={`60%`} />
            <Skeleton width={`55%`} />
            <Skeleton width={`65%`} />
            <Skeleton width={`50%`} />
            <Skeleton width={`45%`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsSkeleton;
