import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, DollarSign, Star, Clock, Filter, X, Plus, Globe, Sparkles, TrendingUp, Users, Calendar, Heart, Camera, Compass, Info, Zap, Target } from 'lucide-react';
import { suggestionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CitySearch = ({ onCitySelect, placeholder = "Search for cities...", showFilters = true, maxResults = 10, showAIDialog = false }) => {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    region: '',
    costRange: '',
    popularity: ''
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showAIPreferences, setShowAIPreferences] = useState(false);
  const [aiPreferences, setAIPreferences] = useState({
    budget: 'moderate',
    interests: [],
    duration: 7,
    startLocation: '',
    travelStyle: 'balanced',
    groupSize: 'couple',
    season: 'any'
  });
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedCityForAI, setSelectedCityForAI] = useState(null);
  const [showCityAIInsights, setShowCityAIInsights] = useState(false);
  const searchRef = useRef(null);

  // Cost range options
  const costRanges = [
    { value: 'budget', label: 'Budget (1-3)', icon: '💰' },
    { value: 'moderate', label: 'Moderate (4-6)', icon: '💵' },
    { value: 'luxury', label: 'Luxury (7-10)', icon: '💎' }
  ];

  // Popularity options
  const popularityLevels = [
    { value: 'hidden', label: 'Hidden Gems (1-3)', icon: '🔍' },
    { value: 'popular', label: 'Popular (4-7)', icon: '⭐' },
    { value: 'famous', label: 'Famous (8-10)', icon: '🌟' }
  ];

  // Interests for AI recommendations
  const interests = [
    'Culture & History', 'Food & Cuisine', 'Adventure Sports', 'Nightlife', 'Nature & Wildlife',
    'Beach & Relaxation', 'Shopping', 'Art & Museums', 'Photography', 'Local Experiences',
    'Architecture', 'Festivals', 'Wellness & Spa', 'Family Activities', 'Romantic Getaways'
  ];

  const budgetOptions = [
    { value: 'budget', label: 'Budget ($20-50/day)', range: '$20-50' },
    { value: 'moderate', label: 'Moderate ($50-100/day)', range: '$50-100' },
    { value: 'luxury', label: 'Luxury ($100+/day)', range: '$100+' }
  ];

  const travelStyles = [
    { value: 'slow', label: 'Slow Travel - Deep immersion', icon: '🐌' },
    { value: 'balanced', label: 'Balanced - Mix of everything', icon: '⚖️' },
    { value: 'fast', label: 'Fast-paced - See everything', icon: '🚀' }
  ];

  const groupSizes = [
    { value: 'solo', label: 'Solo Traveler', icon: '👤' },
    { value: 'couple', label: 'Couple/Romantic', icon: '💑' },
    { value: 'family', label: 'Family with Kids', icon: '👨‍👩‍👧‍👦' },
    { value: 'group', label: 'Group of Friends', icon: '👥' }
  ];

  const seasons = [
    { value: 'any', label: 'Any Season', icon: '🌍' },
    { value: 'spring', label: 'Spring (Mar-May)', icon: '🌸' },
    { value: 'summer', label: 'Summer (Jun-Aug)', icon: '☀️' },
    { value: 'autumn', label: 'Autumn (Sep-Nov)', icon: '🍂' },
    { value: 'winter', label: 'Winter (Dec-Feb)', icon: '❄️' }
  ];

  // Debounced search with AI integration
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performAISearch();
      } else {
        setCities([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, selectedFilters]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performAISearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchFilters = {
        country: selectedFilters.country || '',
        region: selectedFilters.region || '',
        costRange: selectedFilters.costRange || '',
        popularity: selectedFilters.popularity || ''
      };

      // Use AI-powered city search
      const results = await suggestionsAPI.searchCities(query, searchFilters);
      setCities(results.slice(0, maxResults));
      setShowResults(true);
    } catch (error) {
      console.error('AI city search error:', error);
      toast.error('Failed to search cities with AI');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    onCitySelect(city);
    setQuery('');
    setShowResults(false);
    setCities([]);
  };

  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setFilters({
      country: '',
      region: '',
      costRange: '',
      popularity: ''
    });
  };

  const toggleInterest = (interest) => {
    setAIPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest) 
        : [...prev.interests, interest]
    }));
  };

  const handleAIRecommendations = async () => {
    try {
      setAiLoading(true);
      const recommendations = await suggestionsAPI.getTravelRecommendations(aiPreferences);
      setAiRecommendations({ recommendations });
      setShowAIPreferences(false);
      toast.success('AI recommendations generated! Check out your personalized destinations below.');
    } catch (error) {
      console.error('AI recommendations error:', error);
      toast.error('Failed to generate AI recommendations');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCityAIInsights = async (city) => {
    try {
      setAiLoading(true);
      setSelectedCityForAI(city);
      
      // Get comprehensive city insights including attractions and activities
      const [attractions, activities] = await Promise.all([
        suggestionsAPI.discoverActivities(city.name, { type: 'attractions' }),
        suggestionsAPI.discoverActivities(city.name, { type: 'activities' })
      ]);

      // Enhance city data with AI insights
      const enhancedCity = {
        ...city,
        attractions: attractions.slice(0, 10),
        activities: activities.slice(0, 8),
        aiInsights: {
          bestTimeToVisit: city.bestTimeToVisit || 'Year-round',
          estimatedDailyCost: city.avgDailyCost || 50,
          recommendedDuration: Math.ceil(city.popularity / 2) + 2, // Smart duration calculation
          travelTips: generateTravelTips(city, aiPreferences),
          budgetBreakdown: generateBudgetBreakdown(city, aiPreferences)
        }
      };

      setSelectedCityForAI(enhancedCity);
      setShowCityAIInsights(true);
      setAiLoading(false);
    } catch (error) {
      console.error('City AI insights error:', error);
      toast.error('Failed to generate city insights');
      setAiLoading(false);
    }
  };

  const generateTravelTips = (city, preferences) => {
    const tips = [];
    
    if (city.costIndex <= 3) tips.push('Great for budget travelers!');
    if (city.costIndex >= 8) tips.push('Consider luxury accommodations and fine dining.');
    if (city.popularity >= 8) tips.push('Book attractions in advance to avoid crowds.');
    if (city.climate?.type === 'Tropical') tips.push('Pack light clothing and stay hydrated.');
    if (preferences.interests.includes('Food & Cuisine')) tips.push('Don\'t miss local food markets and street food!');
    if (preferences.interests.includes('Culture & History')) tips.push('Visit museums early morning for fewer crowds.');
    
    return tips.length > 0 ? tips : ['Explore local neighborhoods for authentic experiences'];
  };

  const generateBudgetBreakdown = (city, preferences) => {
    const dailyCost = city.avgDailyCost || 50;
    const duration = preferences.duration || 7;
    
    return {
      accommodation: Math.round(dailyCost * 0.4),
      food: Math.round(dailyCost * 0.3),
      activities: Math.round(dailyCost * 0.2),
      transport: Math.round(dailyCost * 0.1),
      total: dailyCost * duration
    };
  };

  const getCostIndexColor = (costIndex) => {
    if (costIndex <= 3) return 'text-green-600';
    if (costIndex <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPopularityColor = (popularity) => {
    if (popularity <= 3) return 'text-blue-600';
    if (popularity <= 7) return 'text-orange-600';
    return 'text-purple-600';
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-10 pr-24 w-full"
          onFocus={() => {
            if (cities.length > 0) setShowResults(true);
          }}
        />
        
        {/* AI Recommendations Button */}
        <button
          onClick={() => setShowAIPreferences(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          title="Get Smart AI Travel Recommendations"
        >
          <Sparkles className="h-4 w-4" />
        </button>

        {/* Filter Toggle Button */}
        {showFilters && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
              Object.keys(selectedFilters).length > 0
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        )}

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setCities([]);
              setShowResults(false);
            }}
            className="absolute right-20 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* AI Info Banner */}
      <div className="mt-2 bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg border border-pink-200">
        <p className="text-pink-800 text-sm font-medium flex items-center">
          <Zap className="h-4 w-4 mr-2 text-purple-500" />
          🚀 AI will generate comprehensive city data with attractions, costs, and detailed recommendations for any location you search!
        </p>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Search Filters</h4>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                placeholder="e.g., Italy, Japan"
                value={selectedFilters.country || ''}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="input text-sm"
              />
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <input
                type="text"
                placeholder="e.g., Tuscany, Kansai"
                value={selectedFilters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="input text-sm"
              />
            </div>

            {/* Cost Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Range</label>
              <select
                value={selectedFilters.costRange || ''}
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

            {/* Popularity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popularity</label>
              <select
                value={selectedFilters.popularity || ''}
                onChange={(e) => handleFilterChange('popularity', e.target.value)}
                className="input text-sm"
              >
                <option value="">Any Popularity</option>
                {popularityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.icon} {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations Results */}
      {aiRecommendations?.recommendations && aiRecommendations.recommendations.length > 0 && (
        <div className="mt-6 mb-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-700">
            <Sparkles className="mr-2 text-purple-500" />
            AI Recommended Destinations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiRecommendations.recommendations.map((city, index) => (
              <div key={index} className="bg-white border border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 group">
                {/* City Image */}
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img 
                    src={city.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'} 
                    alt={city.city} 
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                    }}
                  />
                </div>
                
                {/* City Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{city.city}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-secondary text-xs">{city.country}</span>
                      {city.bestTimeToVisit && (
                        <span className="badge badge-primary text-xs">Best: {city.bestTimeToVisit}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center bg-purple-100 px-2 py-1 rounded-full">
                    <Sparkles className="h-3 w-3 text-purple-600 mr-1" />
                    <span className="text-xs font-medium text-purple-700">AI Pick</span>
                  </div>
                </div>
                
                {/* City Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Daily Cost:</span>
                    <span className="font-semibold text-primary-600">${city.avgDailyCost}</span>
                  </div>
                  {city.whyRecommended && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{city.whyRecommended}</p>
                  )}
                </div>
                
                {/* Highlights */}
                {city.highlights && city.highlights.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Highlights:</h5>
                    <div className="flex flex-wrap gap-1">
                      {city.highlights.slice(0, 3).map((highlight, idx) => (
                        <span key={idx} className="badge badge-accent text-xs">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCitySelect(city)}
                    className="flex-1 btn-primary text-sm py-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add to Trip
                  </button>
                  <button 
                    onClick={() => handleCityAIInsights(city)}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    title="Get AI Insights"
                  >
                    <Target className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-sm">AI is searching cities...</p>
              <p className="text-xs text-gray-400 mt-1">Powered by Gemini AI</p>
            </div>
          ) : cities.length > 0 ? (
            <div className="p-2">
              {cities.map((city, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    {/* City Image */}
                    {city.imageUrl ? (
                      <img 
                        src={city.imageUrl} 
                        alt={city.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm ${city.imageUrl ? 'hidden' : ''}`}>
                      {city.name.charAt(0)}
                    </div>
                    
                    {/* City Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{city.name}</h4>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{city.country}</span>
                        {city.region && (
                          <>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{city.region}</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{city.description}</p>
                      
                      {/* City Stats */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span className={getCostIndexColor(city.costIndex)}>
                            Cost: {city.costIndex}/10
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span className={getPopularityColor(city.popularity)}>
                            Popularity: {city.popularity}/10
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>${city.avgDailyCost}/day</span>
                        </div>
                      </div>
                      
                      {/* Highlights */}
                      {city.highlights && city.highlights.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {city.highlights.slice(0, 3).map((highlight, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              <MapPin className="h-2 w-2 mr-1" />
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleCitySelect(city)}
                        className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Add to Trip"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleCityAIInsights(city)}
                        className="p-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors"
                        title="Get AI Insights"
                      >
                        <Target className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No cities found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or use AI recommendations</p>
            </div>
          ) : null}
        </div>
      )}

      {/* AI Preferences Modal */}
      {showAIPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center text-purple-700">
                  <Sparkles className="mr-2 text-purple-500" />
                  Smart AI Travel Preferences
                </h2>
                <button 
                  onClick={() => setShowAIPreferences(false)} 
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
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
                          {style.icon} {style.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Group Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="inline h-4 w-4 mr-1" />
                      Group Size
                    </label>
                    <select
                      value={aiPreferences.groupSize}
                      onChange={(e) => setAIPreferences(prev => ({ ...prev, groupSize: e.target.value }))}
                      className="input w-full"
                    >
                      {groupSizes.map(size => (
                        <option key={size.value} value={size.value}>
                          {size.icon} {size.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Season */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Preferred Season
                    </label>
                    <select
                      value={aiPreferences.season}
                      onChange={(e) => setAIPreferences(prev => ({ ...prev, season: e.target.value }))}
                      className="input w-full"
                    >
                      {seasons.map(season => (
                        <option key={season.value} value={season.value}>
                          {season.icon} {season.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
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
                      <Heart className="inline h-4 w-4 mr-1" />
                      Interests (select multiple)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {interests.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`text-sm px-3 py-2 rounded-lg border transition-all duration-200 ${
                            aiPreferences.interests.includes(interest)
                              ? 'bg-purple-500 text-white border-purple-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Preview */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      What AI will provide:
                    </h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Personalized destination recommendations</li>
                      <li>• Estimated costs and budget breakdown</li>
                      <li>• Best time to visit each location</li>
                      <li>• Top attractions and activities</li>
                      <li>• Travel tips based on your preferences</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowAIPreferences(false)} 
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAIRecommendations} 
                  className="btn-primary flex-1"
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Smart Recommendations...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get AI Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* City AI Insights Modal */}
      {showCityAIInsights && selectedCityForAI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center text-purple-700">
                  <Target className="mr-2 text-purple-500" />
                  AI Insights for {selectedCityForAI.name}
                </h2>
                <button 
                  onClick={() => setShowCityAIInsights(false)} 
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* City Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">${selectedCityForAI.aiInsights?.estimatedDailyCost}</div>
                    <div className="text-sm text-gray-600">Estimated Daily Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{selectedCityForAI.aiInsights?.recommendedDuration} days</div>
                    <div className="text-sm text-gray-600">Recommended Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{selectedCityForAI.attractions?.length || 0}</div>
                    <div className="text-sm text-gray-600">Top Attractions</div>
                  </div>
                </div>
              </div>

              {/* Budget Breakdown */}
              {selectedCityForAI.aiInsights?.budgetBreakdown && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="mr-2 text-green-500" />
                    Budget Breakdown for {aiPreferences.duration} Days
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedCityForAI.aiInsights.budgetBreakdown).map(([category, amount]) => (
                      <div key={category} className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                        <div className="text-lg font-bold text-primary-600">
                          ${category === 'total' ? amount : amount * aiPreferences.duration}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {category === 'total' ? 'Total Trip' : category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Tips */}
              {selectedCityForAI.aiInsights?.travelTips && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="mr-2 text-blue-500" />
                    AI Travel Tips
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCityForAI.aiInsights.travelTips.map((tip, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2"></div>
                        <span className="text-sm text-blue-800">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Attractions */}
              {selectedCityForAI.attractions && selectedCityForAI.attractions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="mr-2 text-yellow-500" />
                    Top Attractions in {selectedCityForAI.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCityForAI.attractions.map((attraction, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900 mb-2">{attraction.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{attraction.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>${attraction.cost || 0}</span>
                          <span>{attraction.duration || 60} min</span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            {attraction.rating || 4}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Activities */}
              {selectedCityForAI.activities && selectedCityForAI.activities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Zap className="mr-2 text-orange-500" />
                    Popular Activities in {selectedCityForAI.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCityForAI.activities.map((activity, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900 mb-2">{activity.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>${activity.cost || 0}</span>
                          <span>{activity.duration || 60} min</span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            {activity.rating || 4}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowCityAIInsights(false)} 
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    handleCitySelect(selectedCityForAI);
                    setShowCityAIInsights(false);
                  }}
                  className="btn-primary flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add {selectedCityForAI.name} to Trip
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
