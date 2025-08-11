import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const ActivitySearch = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Find Activities"
        subtitle="Discover exciting things to do at your destination"
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Activity Search Screen
          </h2>
          <p className="text-neutral-600">
            This screen will allow users to search for activities with filters for type, cost, duration, and location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivitySearch;
