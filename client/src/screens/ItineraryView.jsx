import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const ItineraryView = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Trip Itinerary"
        subtitle="View your complete trip plan and itinerary details"
        breadcrumbs={[
          { label: 'Trips', href: '/trips' },
          { label: 'Trip Name' },
        ]}
        actions={[
          {
            label: 'Edit Itinerary',
            variant: 'secondary',
            href: '/trips/1/edit',
          },
          {
            label: 'Share Trip',
            variant: 'ghost',
          },
        ]}
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Itinerary View Screen
          </h2>
          <p className="text-neutral-600">
            This screen will display the complete trip itinerary with day-by-day breakdown and activity details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;
