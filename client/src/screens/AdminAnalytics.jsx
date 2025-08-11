import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const AdminAnalytics = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Admin Analytics"
        subtitle="View system statistics and manage users"
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Admin Analytics Screen
          </h2>
          <p className="text-neutral-600">
            This screen will display admin statistics, user management, and system analytics with charts and tables.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
