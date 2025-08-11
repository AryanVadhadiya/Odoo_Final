import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Calendar, DollarSign, Star, Clock, Sparkles, Target, Users, Heart, Globe, X, Check, Edit3 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createTrip } from '../store/slices/tripSlice';
import { itineraryAPI, activityAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import CitySearch from '../components/common/CitySearch';

const CitySearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [tripData, setTripData] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [currentStep, setCurrentStep] = useState('city-selection'); // 'city-selection' or 'itinerary-planning'
  const [aiPreferences, setAIPreferences] = useState({
    budget: 'moderate',
    interests: [],
    duration: 7,
    startLocation: '',
    travelStyle: 'balanced',
    groupSize: 'couple',
    season: 'any'
  });
  const [itineraryData, setItineraryData] = useState({
    destinations: [],
    totalBudget: 0,
    estimatedDuration: 0
  });

  useEffect(() => {
    // Get trip data from localStorage or location state
    const storedTripData = localStorage.getItem('pendingTripData');
    if (storedTripData) {
      setTripData(JSON.parse(storedTripData));
    } else if (location.state?.tripData) {
      setTripData(location.state.tripData);
    } else {
      // Redirect back to trip creation if no data
      navigate('/trips/create');
      return;
    }

    // Initialize AI preferences based on trip data
    if (tripData) {
      const duration = Math.ceil((new Date(tripData.endDate) - new Date(tripData.startDate)) / (1000 * 60 * 60 * 24));
      setAIPreferences(prev => ({
        ...prev,
        duration: duration || 7,
        budget: tripData.budget?.total > 1000 ? 'luxury' : tripData.budget?.total > 500 ? 'moderate' : 'budget'
      }));
    }
  }, [navigate, location.state]);

  const handleCitySelect = (city) => {
    // Check if city is already selected
    if (selectedCities.find(c => c.name === city.name)) {
      toast.error(`${city.name} is already in your trip!`);
      return;
    }

    // Add city to selected cities with enhanced data
    const enhancedCity = {
      ...city,
      order: selectedCities.length + 1,
      arrivalDate: calculateArrivalDate(selectedCities.length),
      departureDate: calculateDepartureDate(selectedCities.length),
      estimatedCost: city.avgDailyCost || 50,
      attractions: city.attractions || [],
      activities: city.activities || []
    };

    setSelectedCities(prev => [...prev, enhancedCity]);
    toast.success(`${city.name} added to your trip!`);
  };

  const calculateArrivalDate = (cityIndex) => {
    if (!tripData?.startDate) return '';
    const startDate = new Date(tripData.startDate);
    const arrivalDate = new Date(startDate);
    arrivalDate.setDate(startDate.getDate() + (cityIndex * 2)); // 2 days per city
    return arrivalDate.toISOString().split('T')[0];
  };

  const calculateDepartureDate = (cityIndex) => {
    if (!tripData?.startDate) return '';
    const startDate = new Date(tripData.startDate);
    const departureDate = new Date(startDate);
    departureDate.setDate(startDate.getDate() + (cityIndex * 2) + 1); // 2 days per city + 1
    return departureDate.toISOString().split('T')[0];
  };

  const removeCity = (cityName) => {
    setSelectedCities(prev => {
      const filtered = prev.filter(c => c.name !== cityName);
      // Reorder remaining cities
      return filtered.map((city, index) => ({
        ...city,
        order: index + 1,
        arrivalDate: calculateArrivalDate(index),
        departureDate: calculateDepartureDate(index)
      }));
    });
    toast.success(`${cityName} removed from your trip`);
  };

  const updateCityDates = (cityName, field, value) => {
    setSelectedCities(prev => prev.map(city => 
      city.name === cityName ? { ...city, [field]: value } : city
    ));
  };

  const proceedToItineraryPlanning = () => {
    if (selectedCities.length === 0) {
      toast.error('Please select at least one city before proceeding');
      return;
    }

    // Calculate itinerary data
    const totalBudget = selectedCities.reduce((sum, city) => sum + (city.estimatedCost * 2), 0);
    const estimatedDuration = selectedCities.length * 2;

    setItineraryData({
      destinations: selectedCities,
      totalBudget,
      estimatedDuration
    });

    setCurrentStep('itinerary-planning');
  };

  const handleFinalSubmit = async () => {
    try {
      // Create the trip first
      const tripResponse = await dispatch(createTrip(tripData)).unwrap();
      const tripId = tripResponse.data?._id;

      if (!tripId) {
        throw new Error('Failed to create trip');
      }

      // Add all destinations to the itinerary
      for (const city of selectedCities) {
        await itineraryAPI.addDestination(tripId, {
          city: city.name,
          country: city.country,
          arrivalDate: city.arrivalDate,
          departureDate: city.departureDate,
          budget: city.estimatedCost,
          order: city.order
        });
      }

      // Clear localStorage
      localStorage.removeItem('pendingTripData');

      toast.success('Trip created successfully with all destinations!');
      
      // Redirect to itineraries page
      navigate('/itinerary', { 
        state: { 
          tripId,
          destinations: selectedCities,
          aiPreferences,
          step: 'planning-complete'
        }
      });

    } catch (error) {
      console.error('Failed to create trip:', error);
      toast.error('Failed to create trip. Please try again.');
    }
  };

  const goBackToCitySelection = () => {
    setCurrentStep('city-selection');
  };

  if (!tripData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/trips/create')}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Destination Discovery</h1>
            <p className="text-gray-600">Plan your {tripData.name} with intelligent city recommendations</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'city-selection' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'city-selection' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-medium">City Selection</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'itinerary-planning' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'itinerary-planning' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium">Itinerary Planning</span>
            </div>
          </div>
        </div>

        {currentStep === 'city-selection' ? (
          /* City Selection Step */
          <div className="space-y-8">
            {/* Trip Summary */}
            <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <div className="card-body">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{tripData.name}</div>
                    <div className="text-sm text-gray-600">Trip Name</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.ceil((new Date(tripData.endDate) - new Date(tripData.startDate)) / (1000 * 60 * 60 * 24))} days
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {tripData.budget?.currency || '$'}{tripData.budget?.total || 0}
                    </div>
                    <div className="text-sm text-gray-600">Budget</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI City Search */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center justify-center">
                  <Sparkles className="mr-2 text-purple-500" />
                  Discover Your Destinations
                </h2>
                <p className="text-sm text-gray-600 mt-2">Use AI to find the perfect cities for your trip</p>
              </div>
              <CitySearch
                onCitySelect={handleCitySelect}
                placeholder="Type any city name in the world (e.g., Paris, Tokyo, New York)..."
                showFilters={true}
                maxResults={8}
              />
            </div>

            {/* Selected Cities */}
            {selectedCities.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Selected Cities ({selectedCities.length})</h2>
                  <p className="text-sm text-gray-600">Review and adjust your destinations</p>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {selectedCities.map((city, index) => (
                      <div key={city.name} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              {city.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{city.name}, {city.country}</h3>
                              <p className="text-gray-600 text-sm mb-2">{city.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Order:</span>
                                  <span className="ml-1 font-medium">{city.order}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Daily Cost:</span>
                                  <span className="ml-1 font-medium">${city.estimatedCost}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Arrival:</span>
                                  <input
                                    type="date"
                                    value={city.arrivalDate}
                                    onChange={(e) => updateCityDates(city.name, 'arrivalDate', e.target.value)}
                                    className="ml-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                    min={tripData.startDate}
                                    max={tripData.endDate}
                                  />
                                </div>
                                <div>
                                  <span className="text-gray-500">Departure:</span>
                                  <input
                                    type="date"
                                    value={city.departureDate}
                                    onChange={(e) => updateCityDates(city.name, 'departureDate', e.target.value)}
                                    className="ml-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                    min={city.arrivalDate}
                                    max={tripData.endDate}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeCity(city.name)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button
                      onClick={proceedToItineraryPlanning}
                      className="btn-primary px-8 py-3 text-lg"
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Continue to Itinerary Planning
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Itinerary Planning Step */
          <div className="space-y-8">
            {/* Itinerary Overview */}
            <div className="card bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Target className="mr-2 text-green-500" />
                  Itinerary Overview
                </h2>
                <p className="text-sm text-gray-600">Review your trip plan before finalizing</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">{selectedCities.length}</div>
                    <div className="text-sm text-gray-600">Destinations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{itineraryData.estimatedDuration} days</div>
                    <div className="text-sm text-gray-600">Estimated Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {tripData.budget?.currency || '$'}{itineraryData.totalBudget}
                    </div>
                    <div className="text-sm text-gray-600">Estimated Cost</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={goBackToCitySelection}
                    className="btn-secondary mr-4"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Cities
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    className="btn-primary px-8 py-3"
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Create Trip & Go to Itinerary
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed Itinerary */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Detailed Itinerary</h2>
                <p className="text-sm text-gray-600">Your complete travel plan</p>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  {selectedCities.map((city, index) => (
                    <div key={city.name} className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {city.order}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{city.name}, {city.country}</h3>
                            <p className="text-gray-600">{city.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600">${city.estimatedCost}</div>
                          <div className="text-sm text-gray-500">per day</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            Arrival Date
                          </div>
                          <div className="font-medium">{city.arrivalDate}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            Departure Date
                          </div>
                          <div className="font-medium">{city.departureDate}</div>
                        </div>
                      </div>

                      {/* City Highlights */}
                      {city.highlights && city.highlights.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Highlights:</h4>
                          <div className="flex flex-wrap gap-2">
                            {city.highlights.slice(0, 5).map((highlight, idx) => (
                              <span key={idx} className="badge badge-accent text-xs">
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Estimated Budget for this city */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Estimated cost for this city:</span>
                          <span className="font-semibold text-blue-600">
                            {tripData.budget?.currency || '$'}{city.estimatedCost * 2}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySearchPage;
