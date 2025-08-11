import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const CitySearch = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Explore Cities"
        subtitle="Discover amazing destinations around the world"
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            City Search Screen
          </h2>
          <p className="text-neutral-600">
            This screen will allow users to search and explore cities with filters, cost information, and popularity data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CitySearch;
