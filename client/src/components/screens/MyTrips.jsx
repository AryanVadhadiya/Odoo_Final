import React from 'react';
import PageHeader from '../layout/PageHeader';

const MyTrips = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="My Trips"
        subtitle="Manage your travel plans"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Trips List</h2>
          <p className="text-gray-600">This screen will display a list of user's trips with filtering and sorting options.</p>
        </div>
      </div>
    </div>
  );
};

export default MyTrips; 