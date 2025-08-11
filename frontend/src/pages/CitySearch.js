import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  Filter,
  Sparkles,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { searchCities, getAIRecommendations, aiSearchCity } from '../store/slices/citySlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CitySearch = () => {
  const dispatch = useDispatch();
  const { cities, loading, aiRecommendations, error, aiSearchResult } = useSelector(state => state.cities);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    costMin: '',
    costMax: '',
    popularity: ''
  });
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPreferences, setAIPreferences] = useState({
    budget: 'moderate',
    interests: [],
    duration: 7,
    startLocation: '',
    travelStyle: 'balanced'
  });

  const interests = [
    'Culture & History', 'Food & Cuisine', 'Adventure Sports', 'Nightlife',
    'Nature & Wildlife', 'Beach & Relaxation', 'Shopping', 'Art & Museums',
    'Photography', 'Local Experiences', 'Architecture', 'Festivals'
  ];

  const budgetOptions = [
    { value: 'budget', label: 'Budget ($20-50/day)' },
    { value: 'moderate', label: 'Moderate ($50-100/day)' },
    { value: 'luxury', label: 'Luxury ($100+/day)' }
  ];

  const travelStyles = [
    { value: 'slow', label: 'Slow Travel - Deep immersion' },
    { value: 'balanced', label: 'Balanced - Mix of everything' },
    { value: 'fast', label: 'Fast-paced - See everything' }
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        // Use AI search for any city name
        dispatch(aiSearchCity(searchQuery.trim()));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // First try normal search
    if (searchQuery.trim().length > 0) {
      // Try AI search for any city name
      dispatch(aiSearchCity(searchQuery.trim()));
    } else {
      dispatch(searchCities({ search: searchQuery, ...filters }));
    }
  };

  const handleAIRecommendations = async () => {
    try {
      await dispatch(getAIRecommendations(aiPreferences));
      setShowAIDialog(false);
    } catch (error) {
      console.error('AI recommendations error:', error);
    }
  };

  const toggleInterest = (interest) => {
    setAIPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
            Discover Your Perfect Destination
          </h1>
          <p className="text-lg text-gray-600">
            Search cities worldwide or let AI recommend the perfect destinations for your next adventure
          </p>
        </div>

        {/* Search and AI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI-Powered Search */}
          <div className="lg:col-span-2">
            <div className="card card-gradient p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Search className="mr-2 text-primary-600" />
                AI-Powered City Search
              </h2>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Type any city name in the world (e.g., Paris, Tokyo, New York)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
                
                <div className="text-sm text-gray-600 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-secondary-500" />
                  AI will generate comprehensive city data for any location you search
                </div>

                <button type="submit" className="btn-primary">
                  <Search className="mr-2 h-4 w-4" />
                  Search Cities
                </button>
              </form>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="lg:col-span-1">
            <div className="card card-gradient p-6 h-full">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles className="mr-2 text-secondary-600" />
                AI Recommendations
              </h2>
              
              <p className="text-gray-600 mb-4">
                Let our AI suggest perfect destinations based on your preferences
              </p>
              
              <button
                onClick={() => setShowAIDialog(true)}
                className="btn-secondary w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Suggestions
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 mb-6">
            <p className="text-danger-800">{error}</p>
          </div>
        )}

        {/* AI Recommendations Results */}
        {aiRecommendations?.recommendations && aiRecommendations.recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Sparkles className="mr-2 text-secondary-600" />
              AI Recommended Destinations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiRecommendations.recommendations.map((city, index) => (
                <div key={index} className="card card-gradient p-6 group hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{city.city}</h3>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {city.country}
                      </p>
                    </div>
                    <div className="flex items-center bg-secondary-100 px-2 py-1 rounded-full">
                      <Sparkles className="h-4 w-4 text-secondary-600 mr-1" />
                      <span className="text-sm font-medium text-secondary-700">AI Pick</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Daily Cost:</span>
                      <span className="font-semibold text-primary-600">${city.dailyCost}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Suggested Days:</span>
                      <span className="font-semibold">{city.suggestedDays} days</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Best Time:</span>
                      <span className="font-semibold">{city.bestTime}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Top Activities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {city.activities?.slice(0, 3).map((activity, idx) => (
                        <span key={idx} className="badge badge-primary text-xs">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-600 italic">"{city.reasoning}"</p>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button className="btn-primary flex-1 text-sm">
                      Add to Trip
                    </button>
                    <button className="btn-secondary text-sm">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {cities && cities.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Search Results ({cities.length} cities)</h2>
              {aiSearchResult && (
                <div className="flex items-center text-sm text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full">
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI Generated Data
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <div key={city._id} className="card card-gradient p-6 group hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{city.name}</h3>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {city.country}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-accent-500 mr-1" />
                      <span className="font-medium">{city.popularity || 85}/100</span>
                    </div>
                  </div>

                  {/* City Image */}
                  {city.images && city.images[0] && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={city.images[0].url} 
                        alt={city.images[0].caption}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost Index:</span>
                      <span className="font-semibold text-primary-600">${city.costIndex || 50}/day</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Climate:</span>
                      <span className="font-semibold">{city.climate?.type || 'Moderate'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Population:</span>
                      <span className="font-semibold">{(city.population || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Attractions */}
                  {city.attractions && city.attractions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Top Attractions:</h4>
                      <div className="space-y-1">
                        {city.attractions.slice(0, 3).map((attraction, idx) => (
                          <div key={idx} className="text-xs text-gray-600 flex items-center justify-between">
                            <span>{attraction.name}</span>
                            <span className="text-primary-600 font-medium">${attraction.cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {city.tags && city.tags.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {city.tags.slice(0, 4).map((tag, idx) => (
                          <span key={idx} className="badge badge-primary text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex gap-2">
                    <button className="btn-primary flex-1 text-sm">
                      Add to Trip
                    </button>
                    <button className="btn-secondary text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && cities && cities.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No cities found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or let AI help you discover new destinations</p>
            <button
              onClick={() => setShowAIDialog(true)}
              className="btn-secondary mt-4"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Suggestions
            </button>
          </div>
        )}
      </div>

      {/* AI Preferences Modal */}
      {showAIDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Sparkles className="mr-2 text-secondary-600" />
                  AI Travel Preferences
                </h2>
                <button
                  onClick={() => setShowAIDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Trip Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={aiPreferences.duration}
                    onChange={(e) => setAIPreferences(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="input w-full"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Budget Range
                  </label>
                  <select
                    value={aiPreferences.budget}
                    onChange={(e) => setAIPreferences(prev => ({ ...prev, budget: e.target.value }))}
                    className="input w-full"
                  >
                    {budgetOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Travel Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TrendingUp className="inline h-4 w-4 mr-1" />
                    Travel Style
                  </label>
                  <select
                    value={aiPreferences.travelStyle}
                    onChange={(e) => setAIPreferences(prev => ({ ...prev, travelStyle: e.target.value }))}
                    className="input w-full"
                  >
                    {travelStyles.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Starting Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Starting Location (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., New York, London, or 'flexible'"
                    value={aiPreferences.startLocation}
                    onChange={(e) => setAIPreferences(prev => ({ ...prev, startLocation: e.target.value }))}
                    className="input w-full"
                  />
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Star className="inline h-4 w-4 mr-1" />
                    Interests (select multiple)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {interests.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`text-sm px-3 py-2 rounded-lg border transition-all duration-200 ${
                          aiPreferences.interests.includes(interest)
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAIDialog(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIRecommendations}
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySearch;
