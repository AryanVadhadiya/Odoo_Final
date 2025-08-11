import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, DollarSign, Star, Clock, Filter, X, Plus, Globe } from 'lucide-react';
import { suggestionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CitySearch = ({ onCitySelect, placeholder = "Search for cities...", showFilters = true, maxResults = 10 }) => {
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

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
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

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchFilters = {
        country: selectedFilters.country || '',
        region: selectedFilters.region || '',
        costRange: selectedFilters.costRange || '',
        popularity: selectedFilters.popularity || ''
      };

      const results = await suggestionsAPI.searchCities(query, searchFilters);
      setCities(results.slice(0, maxResults));
      setShowResults(true);
    } catch (error) {
      console.error('City search error:', error);
      toast.error('Failed to search cities');
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
          className="input pl-10 pr-20 w-full"
          onFocus={() => {
            if (cities.length > 0) setShowResults(true);
          }}
        />
        
        {/* Filter Toggle Button */}
        {showFilters && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
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
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              Searching cities...
            </div>
          ) : cities.length > 0 ? (
            <div className="p-2">
              {cities.map((city, index) => (
                <div
                  key={index}
                  onClick={() => handleCitySelect(city)}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    {/* City Image Placeholder */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
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
                    
                    {/* Add Button */}
                    <button className="flex-shrink-0 p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              No cities found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CitySearch;
