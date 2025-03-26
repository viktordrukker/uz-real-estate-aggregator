import React from 'react';

export default function Loading() {
  // Simple loading text for now
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Loading Property Listings...</h1>
      {/* You can add more sophisticated skeleton loaders here later */}
    </main>
  );
}
