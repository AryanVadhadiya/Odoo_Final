import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, MapPin, Calendar, Search } from 'lucide-react';
import { fetchTrips } from '../store/slices/tripSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Trips = () => {
  const dispatch = useDispatch();
  const { trips, loading, error } = useSelector((state) => state.trips);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchTrips({ search: searchQuery, status: statusFilter }));
  }, [dispatch, searchQuery, statusFilter]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      planning: 'badge badge-primary',
      active: 'badge badge-warning',
      completed: 'badge badge-success',
      cancelled: 'badge badge-danger'
    };
    return statusClasses[status] || 'badge badge-secondary';
  };
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
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <select 
            className="input md:w-48"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Trips grid */}
      {!loading && !error && trips && trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip._id} className="card hover:shadow-medium transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{trip.name}</h3>
                  <span className={getStatusBadge(trip.status)}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {trip.destinations?.length || 0} destination{trip.destinations?.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {trip.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {trip.description}
                  </p>
                )}
                <div className="flex space-x-2">
                  <Link
                    to={`/trips/${trip._id}`}
                    className="btn-secondary btn-sm flex-1 text-center"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/trips/${trip._id}/edit`}
                    className="btn-secondary btn-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && (!trips || trips.length === 0) && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter ? 'No trips found' : 'No trips yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter 
              ? 'Try adjusting your search criteria or filters.' 
              : 'Start planning your first adventure!'
            }
          </p>
          <Link
            to="/trips/create"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {searchQuery || statusFilter ? 'Create New Trip' : 'Create Your First Trip'}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Trips; 