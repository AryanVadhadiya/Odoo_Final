import React, { useState, useEffect } from 'react';
import { Search, Plus, ShoppingCart, Clock, DollarSign, Star, MapPin, Filter, X, Sparkles } from 'lucide-react';
import { suggestionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const PlaceSearch = ({ cityName, onPlacesSelected, onProceedToItinerary }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    costRange: '',
    duration: '',
    rating: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Cost range options
  const costRanges = [
    { value: 'free', label: 'Free', icon: '🆓' },
    { value: 'budget', label: 'Budget ($0-25)', icon: '💰' },
    { value: 'moderate', label: 'Moderate ($25-75)', icon: '💵' },
    { value: 'premium', label: 'Premium ($75+)', icon: '💎' }
  ];

  // Duration options
  const durationOptions = [
    { value: 'short', label: 'Short (< 2 hours)', icon: '⏰' },
    { value: 'medium', label: 'Medium (2-4 hours)', icon: '🕐' },
    { value: 'long', label: 'Long (4+ hours)', icon: '🕙' }
  ];

  // Rating options
  const ratingOptions = [
    { value: '4.5+', label: '4.5+ Stars', icon: '⭐⭐⭐⭐⭐' },
    { value: '4.0+', label: '4.0+ Stars', icon: '⭐⭐⭐⭐' },
    { value: '3.5+', label: '3.5+ Stars', icon: '⭐⭐⭐' }
  ];

  useEffect(() => {
    if (cityName) {
      discoverPlaces();
    }
  }, [cityName, filters]);

  const discoverPlaces = async () => {
    if (!cityName) return;

    setLoading(true);
    try {
      // Get both attractions and activities for comprehensive place discovery
      const [attractions, activities] = await Promise.all([
        suggestionsAPI.discoverActivities(cityName, { type: 'attractions', ...filters }),
        suggestionsAPI.discoverActivities(cityName, { type: 'activities', ...filters })
      ]);

      // Combine and format places
      const allPlaces = [
        ...attractions.map(attraction => ({
          ...attraction,
          type: 'attraction',
          category: 'attraction'
        })),
        ...activities.map(activity => ({
          ...activity,
          type: 'activity',
          category: 'activity'
        }))
      ];

      // Limit to top 15 places
      setPlaces(allPlaces.slice(0, 15));
      
      if (allPlaces.length === 0) {
        toast.info('No places found for this city. Try adjusting your filters or search for a different location.');
      }
    } catch (error) {
      console.error('Place discovery error:', error);
      
      // Check if it's a rate limit error
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        toast.error('API is temporarily busy. Using fallback data for now. Please try again in a few minutes.');
      } else {
        toast.error('Failed to discover places. Using fallback data instead.');
      }
      
      // The API service should now return fallback data automatically
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      costRange: '',
      duration: '',
      rating: ''
    });
  };

  const togglePlaceSelection = (place) => {
    setSelectedPlaces(prev => {
      const isSelected = prev.find(p => p.title === place.title);
      if (isSelected) {
        return prev.filter(p => p.title !== place.title);
      } else {
        return [...prev, place];
      }
    });
  };

  const isPlaceSelected = (place) => {
    return selectedPlaces.find(p => p.title === place.title);
  };

  const getCostColor = (cost) => {
    if (cost === 0) return 'text-green-600';
    if (cost <= 25) return 'text-blue-600';
    if (cost <= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDurationColor = (duration) => {
    if (duration <= 120) return 'text-green-600';
    if (duration <= 240) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-yellow-600';
    if (rating >= 4.0) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getPlaceImage = (place) => {
    // Use dummy images based on place type
    const dummyImages = {
      attraction: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      activity: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      culture: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      food: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };

    return place.imageUrl || dummyImages[place.type] || dummyImages.attraction;
  };

  const handleProceedToItinerary = () => {
    if (selectedPlaces.length === 0) {
      toast.error('Please select at least one place before proceeding');
      return;
    }
    onPlacesSelected(selectedPlaces);
    onProceedToItinerary();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Discover Amazing Places in {cityName}
        </h2>
        <p className="text-gray-600">
          Select the places you'd like to visit and add them to your itinerary
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Place Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input text-sm"
              >
                <option value="">All Types</option>
                <option value="attraction">Attractions</option>
                <option value="activity">Activities</option>
                <option value="culture">Culture</option>
                <option value="food">Food & Dining</option>
                <option value="nature">Nature & Outdoors</option>
              </select>
            </div>

            {/* Cost Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Range</label>
              <select
                value={filters.costRange}
                onChange={(e) => handleFilterChange('costRange', e.target.value)}
                className="input text-sm"
              >
                <option value="">Any Cost</option>
                {costRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.icon} {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
                className="input text-sm"
              >
                <option value="">Any Duration</option>
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="input text-sm"
              >
                <option value="">Any Rating</option>
                {ratingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {Object.values(filters).some(f => f) && (
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm text-gray-600">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => (
              value && (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
                >
                  {key}: {value}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Selected Places Summary */}
      {selectedPlaces.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedPlaces.length} place{selectedPlaces.length !== 1 ? 's' : ''} selected
                </h3>
                <p className="text-sm text-gray-600">
                  Total estimated cost: ${selectedPlaces.reduce((sum, place) => sum + (place.cost || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleProceedToItinerary}
              className="btn-primary px-6 py-2"
            >
              Proceed to Itinerary Maker
            </button>
          </div>
        </div>
      )}

      {/* Places Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Discovering amazing places in {cityName}...</p>
          <p className="text-xs text-gray-400 mt-1">Powered by AI</p>
        </div>
      ) : places.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                isPlaceSelected(place) 
                  ? 'border-primary-500 ring-2 ring-primary-100' 
                  : 'border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => togglePlaceSelection(place)}
            >
              {/* Place Image */}
              <div className="relative">
                <img
                  src={getPlaceImage(place)}
                  alt={place.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                  }}
                />
                
                {/* Selection Indicator */}
                {isPlaceSelected(place) && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white">
                    <Plus className="h-5 w-5" />
                  </div>
                )}

                {/* Place Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 shadow-sm">
                    {place.type === 'attraction' ? '🏛️' : '🎯'} {place.type}
                  </span>
                </div>
              </div>

              {/* Place Info */}
              <div className="p-4">
                {/* Title and Description */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {place.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {place.description}
                </p>

                {/* Stats Row */}
                <div className="space-y-2 mb-3">
                  {/* Cost */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Cost:</span>
                    <span className={`font-medium ${getCostColor(place.cost)}`}>
                      ${place.cost || 0}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className={`font-medium ${getDurationColor(place.duration)}`}>
                      {place.duration || 60} min
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Rating:</span>
                    <span className={`font-medium ${getRatingColor(place.rating)} flex items-center`}>
                      <Star className="h-3 w-3 mr-1" />
                      {place.rating || 4.0}/5
                    </span>
                  </div>
                </div>

                {/* Location */}
                {place.location && (
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {place.location}
                  </div>
                )}

                {/* Highlights */}
                {place.highlights && place.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {place.highlights.slice(0, 3).map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlaceSelection(place);
                  }}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isPlaceSelected(place)
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isPlaceSelected(place) ? (
                    <>
                      <X className="h-4 w-4 inline mr-2" />
                      Remove
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 inline mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search for a different city
          </p>
          <button
            onClick={clearFilters}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Proceed Button (if places selected) */}
      {selectedPlaces.length > 0 && (
        <div className="sticky bottom-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {selectedPlaces.length} place{selectedPlaces.length !== 1 ? 's' : ''} in your cart
                </p>
                <p className="text-sm text-gray-600">
                  Ready to build your itinerary?
                </p>
              </div>
            </div>
            <button
              onClick={handleProceedToItinerary}
              className="btn-primary px-8 py-3 text-lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Proceed to Itinerary Maker
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;
