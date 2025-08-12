import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Shield } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this area. Admin privileges are required.
          </p>
          <div className="flex items-center justify-center text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">Contact your administrator if you believe this is an error.</span>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
