import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Users, Clock, Star, MapPin, Calendar, Plus, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { suggestionsAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { trips } = useSelector((state) => state.trips);
  const [recommendedDestinations, setRecommendedDestinations] = useState([]);
  const [popularAttractions, setPopularAttractions] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingAttractions, setLoadingAttractions] = useState(true);

  useEffect(() => {
    // Load recommended destinations and popular attractions
    loadRecommendedDestinations();
    loadPopularAttractions();
  }, []);

  const loadRecommendedDestinations = async () => {
    try {
      setLoadingDestinations(true);
      const destinations = await suggestionsAPI.getPopularCities(6, 'general');
      setRecommendedDestinations(destinations);
    } catch (error) {
      console.error('Failed to load recommended destinations:', error);
      // Fallback to default destinations
      setRecommendedDestinations([
        { name: 'Paris', country: 'France', rating: 4.8, visitors: '30M+', imageUrl: '/img/i1.jpg' },
        { name: 'Tokyo', country: 'Japan', rating: 4.7, visitors: '25M+', imageUrl: '/img/i2.jpg' },
        { name: 'New York', country: 'USA', rating: 4.6, visitors: '20M+', imageUrl: '/img/i3.jpg' },
        { name: 'Rome', country: 'Italy', rating: 4.8, visitors: '28M+', imageUrl: '/img/i4.jpg' },
        { name: 'Barcelona', country: 'Spain', rating: 4.5, visitors: '18M+', imageUrl: '/img/i5.jpg' },
        { name: 'Sydney', country: 'Australia', rating: 4.4, visitors: '15M+', imageUrl: '/img/i1.jpg' }
      ]);
    } finally {
      setLoadingDestinations(false);
    }
  };

  const loadPopularAttractions = async () => {
    try {
      setLoadingAttractions(true);
      // Get popular cities and then get their top attractions
      const cities = await suggestionsAPI.getPopularCities(3, 'general');
      const allAttractions = [];
      
      for (const city of cities) {
        try {
          const activities = await suggestionsAPI.discoverActivities(city.name, { type: 'sightseeing' });
          const topAttractions = activities.slice(0, 2).map(activity => ({
            ...activity,
            city: city.name,
            country: city.country
          }));
          allAttractions.push(...topAttractions);
        } catch (error) {
          console.error(`Failed to load attractions for ${city.name}:`, error);
        }
      }
      
      setPopularAttractions(allAttractions.slice(0, 6));
    } catch (error) {
      console.error('Failed to load popular attractions:', error);
      // Fallback to default attractions
      setPopularAttractions([
        { title: 'Eiffel Tower', city: 'Paris', country: 'France', rating: 4.8, visitors: '7M+', type: 'sightseeing' },
        { title: 'Sagrada Familia', city: 'Barcelona', country: 'Spain', rating: 4.7, visitors: '4M+', type: 'culture' },
        { title: 'Colosseum', city: 'Rome', country: 'Italy', rating: 4.9, visitors: '6M+', type: 'history' },
        { title: 'Times Square', city: 'New York', country: 'USA', rating: 4.5, visitors: '50M+', type: 'sightseeing' },
        { title: 'Shibuya Crossing', city: 'Tokyo', country: 'Japan', rating: 4.6, visitors: '3M+', type: 'culture' },
        { title: 'Sydney Opera House', city: 'Sydney', country: 'Australia', rating: 4.7, visitors: '2M+', type: 'culture' }
      ]);
    } finally {
      setLoadingAttractions(false);
    }
  };

  // Calculate financial statistics
  const financialStats = useMemo(() => {
    if (!trips || trips.length === 0) return {};

    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget?.total || 0), 0);
    const totalSpent = trips.reduce((sum, trip) => sum + (trip.budget?.spent || 0), 0);
    const remainingBudget = totalBudget - totalSpent;
    const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Calculate cost breakdown from trips
    const breakdown = {
      accommodation: 0,
      transportation: 0,
      activities: 0,
      food: 0,
      other: 0
    };

    // For now, we'll use placeholder values since detailed breakdown isn't available
    breakdown.accommodation = totalBudget * 0.4;
    breakdown.transportation = totalBudget * 0.25;
    breakdown.activities = totalBudget * 0.2;
    breakdown.food = totalBudget * 0.1;
    breakdown.other = totalBudget * 0.05;

    const averageBudget = trips.length > 0 ? totalBudget / trips.length : 0;

    return {
      totalBudget,
      totalSpent,
      remainingBudget,
      budgetUsage,
      breakdown,
      averageBudget
    };
  }, [trips]);

  // Chart data for cost breakdown
  const chartData = useMemo(() => {
    const { breakdown } = financialStats;
    if (!breakdown) return [];

    return [
      { label: 'Accommodation', value: breakdown.accommodation, color: 'bg-blue-500', icon: '🏨' },
      { label: 'Transportation', value: breakdown.transportation, color: 'bg-green-500', icon: '🚗' },
      { label: 'Activities', value: breakdown.activities, color: 'bg-yellow-500', icon: '🎯' },
      { label: 'Food', value: breakdown.food, color: 'bg-red-500', icon: '🍽️' },
      { label: 'Other', value: breakdown.other, color: 'bg-purple-500', icon: '📦' }
    ].filter(item => item.value > 0);
  }, [financialStats]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get recent trips (last 6)
  const recentTrips = useMemo(() => {
    if (!trips) return [];
    return trips.slice(0, 6);
  }, [trips]);

  // Get trip status counts
  const tripStatusCounts = useMemo(() => {
    if (!trips) return { planning: 0, active: 0, completed: 0 };
    
    return trips.reduce((counts, trip) => {
      const status = trip.status || 'planning';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, { planning: 0, active: 0, completed: 0 });
  }, [trips]);

  // Simple Chart Components
  const BudgetChart = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-gray-600">{item.label}</span>
                </div>
                <span className="font-medium text-gray-900">${item.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const TripStatusChart = ({ data }) => (
    <div className="space-y-3">
      {Object.entries(data).map(([status, count]) => {
        const statusConfig = {
          planning: { label: 'Planning', color: 'bg-blue-500', icon: '📋' },
          active: { label: 'Active', color: 'bg-green-500', icon: '✈️' },
          completed: { label: 'Completed', color: 'bg-purple-500', icon: '✅' }
        };
        
        const config = statusConfig[status] || statusConfig.planning;
        
        return (
          <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
              <span className="text-sm text-gray-600">{config.label}</span>
            </div>
            <span className="font-semibold text-gray-900">{count}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.name || 'Traveler'}! 👋</h1>
            <p className="text-blue-100 text-lg">Ready to plan your next adventure?</p>
          </div>
          <Link
            to="/trips/create"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Plan New Trip
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${financialStats.totalBudget?.toLocaleString() || '0'}</h3>
            <p className="text-gray-600">Total Budget</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{tripStatusCounts.active || 0}</h3>
            <p className="text-gray-600">Active Trips</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{tripStatusCounts.planning || 0}</h3>
            <p className="text-gray-600">Planning</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{trips?.length || 0}</h3>
            <p className="text-gray-600">Total Trips</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Trips */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Trips</h2>
                <Link
                  to="/trips"
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium flex items-center"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="card-body">
              {recentTrips.length > 0 ? (
                <div className="space-y-3">
                  {recentTrips.map((trip) => (
                    <Link
                      key={trip._id}
                      to={`/trips/${trip._id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{trip.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {trip.destinations?.length || 0} destinations
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trip.status === 'active' ? 'bg-green-100 text-green-800' :
                            trip.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {trip.status ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1) : 'Planning'}
                          </span>
                          {trip.budget?.total > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              ${trip.budget.total.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
                  <p className="text-gray-600 mb-4">Start planning your first adventure!</p>
                  <Link
                    to="/trips/create"
                    className="btn-primary inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Plan Your First Trip
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Budget Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Cost Breakdown</h3>
                  <BudgetChart data={chartData} />
                </div>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">${financialStats.totalBudget?.toLocaleString() || '0'}</div>
                    <div className="text-sm text-gray-600">Total Budget</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">${financialStats.averageBudget?.toLocaleString() || '0'}</div>
                    <div className="text-sm text-gray-600">Average per Trip</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trip Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Trip Status</h3>
            </div>
            <div className="card-body">
              <TripStatusChart data={tripStatusCounts} />
            </div>
          </div>

          {/* Recommended Destinations */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Recommended Destinations</h3>
            </div>
            <div className="card-body">
              {loadingDestinations ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedDestinations.map((destination, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {destination.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{destination.name}</h4>
                        <p className="text-sm text-gray-600">{destination.country}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-gray-700">{destination.rating || 4.5}</span>
                        </div>
                        <p className="text-xs text-gray-500">{destination.visitors || '1M+'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popular Attractions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Popular Attractions</h3>
            </div>
            <div className="card-body">
              {loadingAttractions ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {popularAttractions.map((attraction, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{attraction.title}</h4>
                        <span className="text-xs text-gray-500 capitalize">{attraction.type}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{attraction.city}, {attraction.country}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span className="text-gray-700">{attraction.rating || 4.5}</span>
                        </div>
                        <span className="text-gray-500">{attraction.visitors || '1M+'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;