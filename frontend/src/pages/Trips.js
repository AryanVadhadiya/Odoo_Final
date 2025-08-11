import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Calendar, Search } from 'lucide-react';

const Trips = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600">Manage and organize your travel adventures</p>
        </div>
        <Link
          to="/trips/create"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Trip
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips..."
                className="input pl-10"
              />
            </div>
          </div>
          <select className="input md:w-48">
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Trips grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample trip cards */}
        <div className="card hover:shadow-medium transition-shadow duration-200">
          <div className="card-body">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Paris Adventure</h3>
              <span className="badge badge-primary">Planning</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Mar 15 - Mar 22, 2024
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                1 destination
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              A week-long exploration of the City of Light
            </p>
            <div className="flex space-x-2">
              <Link
                to="/trips/1"
                className="btn-secondary btn-sm flex-1 text-center"
              >
                View Details
              </Link>
              <Link
                to="/trips/1/edit"
                className="btn-secondary btn-sm"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-medium transition-shadow duration-200">
          <div className="card-body">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tokyo Discovery</h3>
              <span className="badge badge-success">Completed</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Apr 10 - Apr 18, 2024
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                1 destination
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Exploring the fascinating blend of tradition and technology
            </p>
            <div className="flex space-x-2">
              <Link
                to="/trips/2"
                className="btn-secondary btn-sm flex-1 text-center"
              >
                View Details
              </Link>
              <Link
                to="/trips/2/edit"
                className="btn-secondary btn-sm"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-medium transition-shadow duration-200">
          <div className="card-body">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">New York City</h3>
              <span className="badge badge-warning">Active</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                May 5 - May 12, 2024
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                1 destination
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              The city that never sleeps - exploring Manhattan
            </p>
            <div className="flex space-x-2">
              <Link
                to="/trips/3"
                className="btn-secondary btn-sm flex-1 text-center"
              >
                View Details
              </Link>
              <Link
                to="/trips/3/edit"
                className="btn-secondary btn-sm"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
        <p className="text-gray-600 mb-4">Start planning your first adventure!</p>
        <Link
          to="/trips/create"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Trip
        </Link>
      </div>
    </div>
  );
};

export default Trips; 