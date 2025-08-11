import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const MyTrips = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="My Trips"
        subtitle="Manage and organize all your travel plans in one place"
        actions={[
          {
            label: 'Create New Trip',
            variant: 'primary',
            href: '/trips/create',
          },
        ]}
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            My Trips Screen
          </h2>
          <p className="text-neutral-600">
            This screen will display a list of all user trips with filtering, sorting, and management options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
