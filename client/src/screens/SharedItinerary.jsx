import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const SharedItinerary = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Shared Itinerary"
        subtitle="View a shared travel plan"
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Shared Itinerary Screen
          </h2>
          <p className="text-neutral-600">
            This screen will display a read-only version of a shared itinerary with summary and copy trip functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedItinerary;
