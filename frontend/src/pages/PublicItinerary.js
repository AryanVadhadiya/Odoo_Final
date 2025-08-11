import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Share2, Copy, Download, Star, MapPin, Calendar, DollarSign, Hotel, Activity, Heart, Users, Globe, Clock, Tag, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { itineraryAPI, tripAPI } from '../services/api';

const PublicItinerary = () => {
  const { publicUrl } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        setLoading(true);
        const response = await itineraryAPI.getPublicItinerary(publicUrl);
        setTrip(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load itinerary');
      } finally {
        setLoading(false);
      }
    };

    if (publicUrl) {
      fetchPublicTrip();
    }
  }, [publicUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const downloadPDF = () => {
    // This would integrate with a PDF generation library
    toast.success('PDF download feature coming soon!');
  };

  const copyTrip = async () => {
    try {
      setCopying(true);
      await tripAPI.copyPublicTrip(publicUrl);
      toast.success('Trip copied successfully! Redirecting to your trips...');
      setTimeout(() => {
        navigate('/trips');
      }, 1500);
    } catch (error) {
      toast.error('Failed to copy trip. Please try again.');
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Itinerary Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This itinerary may be private or no longer available.'}</p>
          <Link to="/community" className="btn-primary">Browse Community</Link>
        </div>
      </div>
    );
  }

  const calculateTripDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalBudget = () => {
    return trip.budget?.total || 0;
  };

  const getDestinationCount = () => {
    return trip.destinations?.length || 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/community" className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{trip.name}</h1>
                <p className="text-sm text-gray-600">Public Itinerary</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={copyToClipboard}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Share'}
              </button>
              
              <button
                onClick={copyTrip}
                disabled={copying}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copying ? 'Copying...' : 'Copy Trip'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            {trip.coverPhoto && (
              <div className="relative h-64 rounded-xl overflow-hidden">
                <img 
                  src={trip.coverPhoto} 
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>
            )}

            {/* Trip Description */}
            {trip.description && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">About This Trip</h2>
                </div>
                <div className="card-body">
                  <p className="text-gray-700 leading-relaxed">{trip.description}</p>
                </div>
              </div>
            )}

            {/* Destinations */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Destinations</h2>
                <p className="text-sm text-gray-600">{getDestinationCount()} cities to explore</p>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {trip.destinations?.map((destination, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {destination.city}, {destination.country}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(destination.arrivalDate)} - {formatDate(destination.departureDate)}
                          </span>
                          {destination.budget > 0 && (
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {trip.budget?.currency} {destination.budget.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activities */}
            {trip.activities && trip.activities.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Planned Activities</h2>
                  <p className="text-sm text-gray-600">Things to do and see</p>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trip.activities.map((activity, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{activity.name}</h4>
                          {activity.cost > 0 && (
                            <span className="text-sm text-gray-600">
                              {trip.budget?.currency} {activity.cost}
                            </span>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {activity.duration && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.duration} min
                            </span>
                          )}
                          {activity.category && (
                            <span className="flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              {activity.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Stats */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Trip Overview</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{calculateTripDuration()} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Destinations</span>
                  <span className="font-medium">{getDestinationCount()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Budget</span>
                  <span className="font-medium text-green-600">
                    {trip.budget?.currency} {getTotalBudget().toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                    trip.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    trip.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trip Creator */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Created By</h3>
              </div>
              <div className="card-body">
                <div className="flex items-center space-x-3">
                  {trip.user?.profilePicture ? (
                    <img 
                      src={trip.user.profilePicture} 
                      alt={trip.user.firstName} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {trip.user?.firstName ? `${trip.user.firstName} ${trip.user.lastName}` : 'Traveler'}
                    </p>
                    {trip.user?.username && (
                      <p className="text-sm text-gray-600">@{trip.user.username}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Tags */}
            {trip.tags && trip.tags.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                </div>
                <div className="card-body">
                  <div className="flex flex-wrap gap-2">
                    {trip.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Budget Breakdown */}
            {trip.budget?.breakdown && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Budget Breakdown</h3>
                </div>
                <div className="card-body space-y-3">
                  {Object.entries(trip.budget.breakdown).map(([category, amount]) => (
                    amount > 0 && (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize">{category}</span>
                        <span className="font-medium">
                          {trip.budget.currency} {amount.toLocaleString()}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Inspired by this trip?</h2>
            <p className="text-gray-600 mb-6">
              Copy this itinerary to your account and customize it for your own adventure!
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={copyTrip}
                disabled={copying}
                className="btn-primary px-8 py-3 text-lg"
              >
                <Copy className="h-5 w-5 mr-2" />
                {copying ? 'Copying...' : 'Copy This Trip'}
              </button>
              <Link to="/community" className="btn-secondary px-8 py-3 text-lg">
                <Globe className="h-5 w-5 mr-2" />
                Browse More Trips
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicItinerary;
