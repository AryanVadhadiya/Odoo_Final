import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const UserProfile = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="User Profile"
        subtitle="Manage your account settings and preferences"
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            User Profile Screen
          </h2>
          <p className="text-neutral-600">
            This screen will allow users to edit their profile, manage settings, and view saved destinations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
