import React from 'react';
import PageHeader from '../layout/PageHeader';

const CitySearch = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Explore Cities"
        subtitle="Discover amazing destinations"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">City Search</h2>
          <p className="text-gray-600">This screen will contain the city search functionality with filters and results display.</p>
        </div>
      </div>
    </div>
  );
};

export default CitySearch; 