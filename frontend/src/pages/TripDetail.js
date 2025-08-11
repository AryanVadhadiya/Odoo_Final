import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Share, Calendar, MapPin, DollarSign } from 'lucide-react';

const TripDetail = () => {
  const { tripId } = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/trips"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paris Adventure</h1>
            <p className="text-gray-600">A week-long exploration of the City of Light</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary inline-flex items-center">
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
          <Link
            to={`/trips/${tripId}/edit`}
            className="btn-primary inline-flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Trip
          </Link>
        </div>
      </div>

      {/* Trip overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip info */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Trip Information</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Duration</p>
                    <p className="text-sm text-gray-600">Mar 15 - Mar 22, 2024 (7 days)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Destinations</p>
                    <p className="text-sm text-gray-600">1 city</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Budget</p>
                    <p className="text-sm text-gray-600">€2,500</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-600">P</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <p className="text-sm text-gray-600">Planning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Itinerary preview */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
                <Link
                  to={`/trips/${tripId}/itinerary`}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  View Full Itinerary
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-medium text-gray-900">Day 1 - Arrival in Paris</h3>
                  <p className="text-sm text-gray-600 mt-1">Check-in and explore the neighborhood</p>
                </div>
                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-medium text-gray-900">Day 2 - Eiffel Tower</h3>
                  <p className="text-sm text-gray-600 mt-1">Visit the iconic symbol of Paris</p>
                </div>
                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-medium text-gray-900">Day 3 - Louvre Museum</h3>
                  <p className="text-sm text-gray-600 mt-1">Explore the world's largest art museum</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <Link
                  to={`/trips/${tripId}/itinerary`}
                  className="block w-full text-left p-3 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                >
                  <h4 className="font-medium text-gray-900">Edit Itinerary</h4>
                  <p className="text-sm text-gray-600">Add activities and destinations</p>
                </Link>
                <Link
                  to={`/trips/${tripId}/budget`}
                  className="block w-full text-left p-3 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                >
                  <h4 className="font-medium text-gray-900">Manage Budget</h4>
                  <p className="text-sm text-gray-600">Track expenses and costs</p>
                </Link>
                <button className="block w-full text-left p-3 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
                  <h4 className="font-medium text-gray-900">Share Trip</h4>
                  <p className="text-sm text-gray-600">Invite friends and family</p>
                </button>
              </div>
            </div>
          </div>

          {/* Trip stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Trip Stats</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Activities Planned</span>
                  <span className="text-sm font-medium text-gray-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Budget Used</span>
                  <span className="text-sm font-medium text-gray-900">€1,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days Remaining</span>
                  <span className="text-sm font-medium text-gray-900">45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail; 