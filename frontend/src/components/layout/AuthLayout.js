import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 text-white items-center justify-center">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-8">
            <Globe className="w-16 h-16 mr-4" />
            <h1 className="text-4xl font-bold">GlobeTrotter</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4">
            Plan Your Perfect Journey
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed">
            Create personalized multi-city itineraries, discover amazing destinations, 
            and make your travel dreams come true with our comprehensive planning tools.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4">
            <MapPin className="w-5 h-5" />
            <span className="text-primary-100">Explore • Plan • Travel</span>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center">
              <Globe className="w-8 h-8 text-primary-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">GlobeTrotter</span>
            </Link>
          </div>

          {/* Auth content */}
          <div className="card">
            <div className="card-body">
              {children}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 GlobeTrotter. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 