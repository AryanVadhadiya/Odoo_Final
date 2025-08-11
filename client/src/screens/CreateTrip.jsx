import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const CreateTrip = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Create New Trip"
        subtitle="Start planning your next adventure by creating a new trip"
        breadcrumbs={[
          { label: 'Trips', href: '/trips' },
          { label: 'Create New Trip' },
        ]}
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Create Trip Screen
          </h2>
          <p className="text-neutral-600">
            This screen will contain a form for creating new trips with fields for name, dates, description, and cover image.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
