import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Calendar, Compass, DollarSign, Image as ImageIcon, AlignLeft, Globe, X, Star } from 'lucide-react';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { createTrip } from '../store/slices/tripSlice';
import { itineraryAPI, activityAPI, suggestionsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import CitySearch from '../components/common/CitySearch';

const TripCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createLoading } = useSelector((state) => state.trips);

  const [tripName, setTripName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedActivityCards, setSelectedActivityCards] = useState([]); // indices

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const canSubmit = Boolean(tripName.trim() && startDate && endDate);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    // Auto-fetch activity suggestions for the selected city
    if (city) {
      fetchActivitySuggestions(city.name);
    }
  };

  const fetchActivitySuggestions = async (cityName) => {
    if (!cityName) return;
    try {
      setSuggestionsLoading(true);
      const activities = await suggestionsAPI.discoverActivities(cityName, {});
      setSuggestions(activities.slice(0, 15));
    } catch (e) {
      console.error('Failed to fetch activity suggestions:', e);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      const tripData = {
        name: tripName.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        coverPhoto: coverPhoto || undefined,
        isPublic,
        budget: {
          total: budgetTotal ? Number(budgetTotal) : 0,
          currency,
        },
        // Optionally seed first destination when selectedCity present
        destinations: selectedCity ? [{ 
          city: selectedCity.name, 
          country: selectedCity.country, 
          arrivalDate: startDate, 
          departureDate: endDate, 
          order: 1,
          budget: selectedCity.avgDailyCost || 0
        }] : undefined,
      };
      const res = await dispatch(createTrip(tripData)).unwrap();
      const newTripId = res.data?._id;
      
      // Seed initial destination if a city was selected
      if (newTripId && selectedCity) {
        try {
          await itineraryAPI.addDestination(newTripId, {
            city: selectedCity.name,
            country: selectedCity.country,
            arrivalDate: startDate,
            departureDate: endDate,
            budget: selectedCity.avgDailyCost || 0,
          });
          
          // If user selected activities suggestions, add them now
          if (selectedActivityCards.length > 0) {
            const activities = selectedActivityCards.map((idx, i) => ({
              trip: newTripId,
              title: suggestions[idx]?.title || `Suggested Activity #${idx + 1}`,
              description: suggestions[idx]?.description || `Auto-added from suggestions for ${selectedCity.name}`,
              type: suggestions[idx]?.type || 'sightseeing',
              destination: { city: selectedCity.name, country: selectedCity.country },
              date: startDate,
              startTime: `${String(9 + i).padStart(2, '0')}:00`,
              endTime: `${String(10 + i).padStart(2, '0')}:30`,
              location: { name: suggestions[idx]?.location || selectedCity.name },
              cost: { 
                amount: Number(suggestions[idx]?.cost || 0), 
                currency 
              },
              duration: suggestions[idx]?.duration || 60,
              rating: suggestions[idx]?.rating || 4,
            }));
            try {
              await activityAPI.createBulkActivities(activities);
            } catch (e) {
              console.error('Failed to create bulk activities:', e);
            }
          }
        } catch (e) {
          console.error('Failed to add initial destination:', e);
        }
      }
      
      toast.success('Trip created successfully!');
      navigate(`/trips/${newTripId}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create trip');
    }
  };

  const toggleActivitySelection = (index) => {
    setSelectedActivityCards((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/trips"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
            <p className="text-gray-600">Plan your next adventure with detailed itinerary and budget</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Trip Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Trip Details</h2>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g., European Adventure 2024"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input w-full"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your trip, what you're looking forward to, or any special requirements..."
                  rows={3}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={budgetTotal}
                      onChange={(e) => setBudgetTotal(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="input pl-10 w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Make this trip public</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* City Selection */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Destination</h2>
              <p className="text-sm text-gray-600">Search and select your primary destination city</p>
            </div>
            <div className="card-body">
              <CitySearch
                onCitySelect={handleCitySelect}
                placeholder="Search for cities to visit..."
                showFilters={true}
                maxResults={8}
              />
              
              {selectedCity && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {selectedCity.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedCity.name}, {selectedCity.country}</h3>
                        <p className="text-sm text-gray-600">{selectedCity.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Cost Index: {selectedCity.costIndex}/10</span>
                          <span>Popularity: {selectedCity.popularity}/10</span>
                          <span>${selectedCity.avgDailyCost}/day</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCity(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Suggestions */}
          {selectedCity && suggestions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Activity Suggestions</h2>
                <p className="text-sm text-gray-600">
                  Select activities you'd like to include in your trip to {selectedCity.name}
                </p>
              </div>
              <div className="card-body">
                {suggestionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading activity suggestions...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedActivityCards.includes(index)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleActivitySelection(index)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                          <input
                            type="checkbox"
                            checked={selectedActivityCards.includes(index)}
                            onChange={() => toggleActivitySelection(index)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>${suggestion.cost || 0}</span>
                          <span>{suggestion.duration || 60} min</span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            {suggestion.rating || 4}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/trips"
              className="btn-secondary px-6 py-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || createLoading}
              className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripCreate; 