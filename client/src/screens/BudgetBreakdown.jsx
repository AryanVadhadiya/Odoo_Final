import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const BudgetBreakdown = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Budget & Cost Breakdown"
        subtitle="Track your travel expenses and manage your budget"
      />

      <div className="container-responsive py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Budget Breakdown Screen
          </h2>
          <p className="text-neutral-600">
            This screen will display budget KPIs, category breakdowns, and expense tracking with charts and alerts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetBreakdown;
