import React from 'react';
import PageHeader from '../layout/PageHeader';

const UserProfile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="User Profile"
        subtitle="Manage your account settings"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Profile & Settings</h2>
          <p className="text-gray-600">This screen will contain user profile editing, preferences, and account settings.</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 