import React from 'react';
import PageHeader from '../layout/PageHeader';

const CreateTrip = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Create New Trip"
        subtitle="Plan your next adventure"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Trip Form</h2>
          <p className="text-gray-600">This screen will contain the trip creation form with date picker, image upload, and other components.</p>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip; 