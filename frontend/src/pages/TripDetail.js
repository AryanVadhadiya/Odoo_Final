import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Edit, Share, Calendar, MapPin, DollarSign, Clock } from 'lucide-react';
import { fetchTrip } from '../store/slices/tripSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TripDetail = () => {
  const { tripId } = useParams();
  const dispatch = useDispatch();
  const { currentTrip: trip, tripLoading: loading, tripError: error } = useSelector((state) => state.trips);

  useEffect(() => {
    if (tripId) {
      dispatch(fetchTrip(tripId));
    }
  }, [dispatch, tripId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-600',
      active: 'bg-yellow-100 text-yellow-600',
      completed: 'bg-green-100 text-green-600',
      cancelled: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Trip</h3>
          <p className="text-red-700">{error}</p>
          <Link to="/trips" className="btn-secondary mt-4 inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Trip Not Found</h3>
        <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist or has been deleted.</p>
        <Link to="/trips" className="btn-secondary inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Trips
        </Link>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
            {trip.description && (
              <p className="text-gray-600">{trip.description}</p>
            )}
            <div className="flex items-center mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary inline-flex items-center">
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
          <Link
            to={`/trips/${tripId}/calendar`}
            className="btn-secondary inline-flex items-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Link>
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
                    <p className="text-sm text-gray-600">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)} 
                      ({getDaysBetween(trip.startDate, trip.endDate)} days)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Destinations</p>
                    <p className="text-sm text-gray-600">
                      {trip.destinations?.length || 0} destination{trip.destinations?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {trip.budget?.total > 0 && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Budget</p>
                      <p className="text-sm text-gray-600">
                        {trip.budget.currency} {trip.budget.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(trip.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Destinations and Activities */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Destinations & Activities</h2>
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/trips/${tripId}/calendar`}
                    className="text-sm text-primary-600 hover:text-primary-500 font-medium inline-flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Calendar View
                  </Link>
                  <Link
                    to={`/trips/${tripId}/itinerary`}
                    className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {trip.destinations && trip.destinations.length > 0 ? (
                  trip.destinations.map((destination, index) => (
                    <div key={destination._id || index} className="border-l-4 border-primary-500 pl-4">
                      <h3 className="font-medium text-gray-900">
                        {destination.city}, {destination.country}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(destination.arrivalDate)} - {formatDate(destination.departureDate)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No destinations added yet</p>
                    <Link
                      to={`/trips/${tripId}/itinerary`}
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                    >
                      Add destinations
                    </Link>
                  </div>
                )}
                
                {trip.activities && trip.activities.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recent Activities</h4>
                    <div className="space-y-2">
                      {trip.activities.slice(0, 3).map((activity, index) => (
                        <div key={activity._id || index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{activity.title}</span>
                        </div>
                      ))}
                      {trip.activities.length > 3 && (
                        <p className="text-xs text-gray-500 pl-4">
                          +{trip.activities.length - 3} more activities
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
                  <span className="text-sm font-medium text-gray-900">
                    {trip.activities?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Budget</span>
                  <span className="text-sm font-medium text-gray-900">
                    {trip.budget?.total ? `${trip.budget.currency} ${trip.budget.total.toLocaleString()}` : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Trip Duration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getDaysBetween(trip.startDate, trip.endDate)} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Destinations</span>
                  <span className="text-sm font-medium text-gray-900">
                    {trip.destinations?.length || 0}
                  </span>
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