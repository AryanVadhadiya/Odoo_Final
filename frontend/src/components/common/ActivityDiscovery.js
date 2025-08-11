import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, DollarSign, Clock, Star, Plus, X, Activity, Camera, Utensils, Mountain, Building, ShoppingBag, Heart, Users } from 'lucide-react';
import { suggestionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const ActivityDiscovery = ({ cityName, onActivitySelect, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    costRange: '',
    duration: '',
    interests: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  // Activity type icons
  const activityTypeIcons = {
    sightseeing: <Building className="h-4 w-4" />,
    food: <Utensils className="h-4 w-4" />,
    adventure: <Mountain className="h-4 w-4" />,
    culture: <Activity className="h-4 w-4" />,
    shopping: <ShoppingBag className="h-4 w-4" />,
    relaxation: <Heart className="h-4 w-4" />,
    transport: <MapPin className="h-4 w-4" />,
    other: <Activity className="h-4 w-4" />
  };

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

  // Interest options
  const interestOptions = [
    { value: 'history', label: 'History & Culture', icon: '🏛️' },
    { value: 'nature', label: 'Nature & Outdoors', icon: '🌲' },
    { value: 'food', label: 'Food & Dining', icon: '🍽️' },
    { value: 'adventure', label: 'Adventure & Sports', icon: '🏃' },
    { value: 'relaxation', label: 'Relaxation & Wellness', icon: '🧘' },
    { value: 'shopping', label: 'Shopping & Markets', icon: '🛍️' }
  ];

  useEffect(() => {
    if (cityName) {
      discoverActivities();
    }
  }, [cityName, filters]);

  const discoverActivities = async () => {
    if (!cityName) return;

    setLoading(true);
    try {
      const results = await suggestionsAPI.discoverActivities(cityName, filters);
      setActivities(results);
    } catch (error) {
      console.error('Activity discovery error:', error);
      toast.error('Failed to discover activities');
      setActivities([]);
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
      interests: ''
    });
    setSelectedType('');
  };

  const getCostColor = (cost) => {
    if (cost === 0) return 'text-green-600';
    if (cost <= 25) return 'text-blue-600';
    if (cost <= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGroupSizeIcon = (groupSize) => {
    switch (groupSize?.toLowerCase()) {
      case 'solo': return <Users className="h-3 w-3" />;
      case 'couple': return <Users className="h-3 w-3" />;
      case 'family': return <Users className="h-3 w-3" />;
      case 'group': return <Users className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const handleActivitySelect = (activity) => {
    onActivitySelect(activity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Discover Activities in {cityName}</h2>
            <p className="text-sm text-gray-600">Find exciting things to do and add them to your itinerary</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input text-sm"
                >
                  <option value="">All Types</option>
                  {Object.entries(activityTypeIcons).map(([type, icon]) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
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

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                <select
                  value={filters.interests}
                  onChange={(e) => handleFilterChange('interests', e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Any Interest</option>
                  {interestOptions.map(option => (
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

        {/* Activities List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Discovering activities in {cityName}...</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Activity Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                        {activityTypeIcons[activity.type] || activityTypeIcons.other}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-xs text-gray-500 capitalize">{activity.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleActivitySelect(activity)}
                      className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3">{activity.description}</p>

                  {/* Activity Stats */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className={getCostColor(activity.cost)}>
                          ${activity.cost || 0}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{activity.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400" />
                        <span className="text-gray-600">{activity.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 text-xs text-gray-500">
                    {activity.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                    
                    {activity.bestTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Best: {activity.bestTime}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      {activity.difficulty && (
                        <span className={getDifficultyColor(activity.difficulty)}>
                          {activity.difficulty}
                        </span>
                      )}
                      {activity.groupSize && (
                        <span className="flex items-center space-x-1">
                          {getGroupSizeIcon(activity.groupSize)}
                          <span>{activity.groupSize}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Highlights */}
                  {activity.highlights && activity.highlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {activity.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No activities found for the selected filters</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-primary-600 hover:text-primary-500 underline"
              >
                Try clearing some filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDiscovery;
