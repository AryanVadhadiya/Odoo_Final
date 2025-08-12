import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Calendar, DollarSign, Star, Clock, Sparkles, Target, Users, Heart, Globe, X, Check, Edit3, Building, Compass } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createTrip } from '../store/slices/tripSlice';
import { itineraryAPI, activityAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import CitySearch from '../components/common/CitySearch';
import PlaceSearch from '../components/common/PlaceSearch';
import ItineraryBuilder from '../components/common/ItineraryBuilder';

const CitySearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [tripData, setTripData] = useState(null);
  const [currentStep, setCurrentStep] = useState('city-selection'); // 'city-selection', 'place-selection', 'itinerary-building'
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [currentCity, setCurrentCity] = useState(null);
  const [aiPreferences, setAIPreferences] = useState({
    budget: 'moderate',
    interests: [],
    duration: 7,
    startLocation: '',
    travelStyle: 'balanced',
    groupSize: 'couple',
    season: 'any'
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

  const proceedToPlaceSelection = (city) => {
    setCurrentCity(city);
    setCurrentStep('place-selection');
  };

  const handlePlacesSelected = (places) => {
    setSelectedPlaces(places);
    setCurrentStep('itinerary-building');
  };

  const handleProceedToItinerary = () => {
    setCurrentStep('itinerary-building');
  };

  const handleAddAnotherCity = () => {
    setCurrentStep('city-selection');
    setCurrentCity(null);
    setSelectedPlaces([]);
  };

  const handleBackToPlaceSearch = () => {
    setCurrentStep('place-selection');
  };

  const handleSaveItinerary = async (itineraryData) => {
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

      toast.success('Trip created successfully with complete itinerary!');
      
      // Redirect to itineraries page
      navigate('/itinerary', { 
        state: { 
          tripId,
          destinations: selectedCities,
          aiPreferences,
          step: 'planning-complete',
          itineraryData
        }
      });

    } catch (error) {
      console.error('Failed to create trip:', error);
      toast.error('Failed to create trip. Please try again.');
    }
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
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Trip Planning</h1>
            <p className="text-gray-600">Plan your {tripData.name} with intelligent recommendations</p>
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
            <div className={`flex items-center space-x-2 ${currentStep === 'place-selection' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'place-selection' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium">Place Discovery</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'itinerary-building' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'itinerary-building' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-medium">Itinerary Builder</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'city-selection' && (
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
              
              {/* API Status Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-800">AI-Powered Discovery</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      If the AI service is temporarily busy, we'll show you curated fallback data to keep your planning going!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      console.log('🧪 Testing fallback data...');
                      const testData = [
                        {
                          name: 'Delhi',
                          country: 'India',
                          region: 'North India',
                          costIndex: 4,
                          popularity: 9,
                          description: 'Historic capital with rich culture, monuments, and vibrant street life',
                          bestTimeToVisit: 'October to March',
                          avgDailyCost: 45,
                          climate: 'Tropical',
                          highlights: ['Red Fort', 'Taj Mahal', 'Qutub Minar', 'India Gate', 'Humayun\'s Tomb'],
                          imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                        }
                      ];
                      console.log('🧪 Test data:', testData);
                      toast.success('Test data loaded! Check console for details.');
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200 transition-colors"
                  >
                    Test Data
                  </button>
                </div>
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
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => proceedToPlaceSelection(city)}
                              className="btn-primary text-sm px-4 py-2"
                            >
                              <Building className="h-4 w-4 mr-1" />
                              Discover Places
                            </button>
                            <button
                              onClick={() => removeCity(city.name)}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setCurrentStep('place-selection')}
                      className="btn-primary px-8 py-3 text-lg"
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Continue to Place Discovery
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'place-selection' && currentCity && (
          <div className="space-y-6">
            {/* City Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white">
                    <Building className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Discovering {currentCity.name}</h2>
                    <p className="text-gray-600">Select the places you'd like to visit in this amazing city</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep('city-selection')}
                  className="btn-secondary"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cities
                </button>
              </div>
            </div>

            {/* Place Search Component */}
            <PlaceSearch
              cityName={currentCity.name}
              onPlacesSelected={handlePlacesSelected}
              onProceedToItinerary={handleProceedToItinerary}
            />
          </div>
        )}

        {currentStep === 'itinerary-building' && (
          <div className="space-y-6">
            {/* Itinerary Builder Component */}
            <ItineraryBuilder
              tripData={tripData}
              selectedPlaces={selectedPlaces}
              onAddAnotherCity={handleAddAnotherCity}
              onSaveItinerary={handleSaveItinerary}
              onBackToPlaceSearch={handleBackToPlaceSearch}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySearchPage;
