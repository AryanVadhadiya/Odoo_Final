import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const ItineraryBuilder = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Itinerary Builder"
        subtitle="Plan your trip day by day with detailed activities and schedules"
        breadcrumbs={[
          { label: 'Trips', href: '/trips' },
          { label: 'Trip Name', href: '/trips/1' },
          { label: 'Edit Itinerary' },
        ]}
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Itinerary Builder Screen
          </h2>
          <p className="text-neutral-600">
            This screen will allow users to build detailed itineraries with stops, activities, and scheduling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItineraryBuilder;
