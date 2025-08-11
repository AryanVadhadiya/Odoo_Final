import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const TripCalendar = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Trip Calendar"
        subtitle="View your travel plans in a calendar or timeline format"
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Trip Calendar Screen
          </h2>
          <p className="text-neutral-600">
            This screen will display trips in calendar grid or timeline format with drag-and-drop reordering capabilities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripCalendar;
