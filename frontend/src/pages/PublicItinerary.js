import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, Copy, Download, Star, MapPin, Calendar, DollarSign, Hotel, Activity, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { itineraryAPI } from '../services/api';

const PublicItinerary = () => {
  const { publicUrl } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

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

  const copyTrip = () => {
    // This would redirect to trip creation with pre-filled data
    toast.success('Redirecting to create trip...');
    // In a real implementation, you'd redirect to trip creation page
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
          <Link to="/" className="btn-primary">Go Home</Link>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                GlobeTrotter
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={copyToClipboard}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                  copied ? 'bg-green-50 text-green-700 border-green-300' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={downloadPDF}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
                {trip.rating?.overall > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-600 fill-current" />
                    <span className="text-sm font-medium text-yellow-800">
                      {trip.rating.overall.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              
              {trip.description && (
                <p className="text-gray-600 text-lg mb-4">{trip.description}</p>
              )}
              
              {/* Trip Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">{calculateTripDuration()} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Destinations</p>
                    <p className="font-medium text-gray-900">{getDestinationCount()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium text-gray-900">
                      ${getTotalBudget().toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-gray-900 capitalize">{trip.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyTrip}
              className="btn-primary inline-flex items-center"
            >
              <Heart className="h-4 w-4 mr-2" />
              Copy Trip
            </button>
          </div>
        </div>

        {/* Itinerary Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Destinations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Itinerary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {trip.destinations?.map((destination, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {destination.city}, {destination.country}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(destination.arrivalDate).toLocaleDateString()} - {new Date(destination.departureDate).toLocaleDateString()}
                          </p>
                          
                          {/* Hotel Information */}
                          {destination.hotel?.name && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Hotel className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-gray-900">Hotel</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{destination.hotel.name}</p>
                              {destination.hotel.address && (
                                <p className="text-sm text-gray-600">{destination.hotel.address}</p>
                              )}
                              {destination.hotel.roomType && (
                                <p className="text-sm text-gray-600">Room: {destination.hotel.roomType}</p>
                              )}
                              {destination.hotel.cost > 0 && (
                                <p className="text-sm text-gray-600">Cost: ${destination.hotel.cost.toLocaleString()}</p>
                              )}
                            </div>
                          )}

                          {/* Destination Rating */}
                          {destination.rating > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= destination.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-2">
                                {destination.rating.toFixed(1)}
                              </span>
                            </div>
                          )}

                          {/* Destination Review */}
                          {destination.review && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{destination.review}"</p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Stop {index + 1}</div>
                          {destination.budget > 0 && (
                            <div className="text-sm font-medium text-gray-900 mt-1">
                              ${destination.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trip Reviews */}
            {trip.rating?.reviews && trip.rating.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {trip.rating.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{review.rating}/5</span>
                        </div>
                        {review.review && (
                          <p className="text-sm text-gray-700">{review.review}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Start Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(trip.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">End Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {calculateTripDuration()} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Destinations</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getDestinationCount()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Budget</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${getTotalBudget().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Breakdown */}
            {trip.budget?.breakdown && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(trip.budget.breakdown).map(([category, amount]) => {
                    if (amount > 0) {
                      return (
                        <div key={category} className="flex justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {category}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            ${amount.toLocaleString()}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            {trip.tags && trip.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {trip.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicItinerary;
