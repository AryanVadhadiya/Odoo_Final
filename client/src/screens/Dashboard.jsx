import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTrips } from '../hooks/useTrips';
import { useFadeIn } from '../hooks/useFadeIn';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card, { TripCard } from '../components/ui/Card';
import { useShowToast } from '../components/ui/Toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { trips, loading, getUpcomingTrips, getCurrentTrips, getTripStats } = useTrips();
  const { showError } = useShowToast();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Fade-in animations
  const heroRef = useFadeIn({ delay: 100 });
  const statsRef = useFadeIn({ delay: 200 });
  const tripsRef = useFadeIn({ delay: 300 });
  const actionsRef = useFadeIn({ delay: 400 });

  // Load trips on mount
  useEffect(() => {
    // TODO: Implement trip fetching when backend is ready
    // fetchTrips();
  }, []);

  // Get trip data
  const upcomingTrips = getUpcomingTrips();
  const currentTrips = getCurrentTrips();
  const tripStats = getTripStats();

  // Quick action buttons
  const quickActions = [
    {
      title: 'Plan New Trip',
      description: 'Start planning your next adventure',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      href: '/trips/create',
      variant: 'primary',
    },
    {
      title: 'Explore Cities',
      description: 'Discover amazing destinations',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/cities',
      variant: 'secondary',
    },
    {
      title: 'View Budget',
      description: 'Track your travel expenses',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      href: '/budget',
      variant: 'secondary',
    },
  ];

  // Recommended destinations (placeholder data)
  const recommendedDestinations = [
    {
      id: 1,
      name: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898652-9e00e4b0b2a9?w=400&h=300&fit=crop',
      country: 'France',
      costIndex: 'High',
      popularity: 'Very Popular',
    },
    {
      id: 2,
      name: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      country: 'Japan',
      costIndex: 'High',
      popularity: 'Popular',
    },
    {
      id: 3,
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
      country: 'Indonesia',
      costIndex: 'Medium',
      popularity: 'Very Popular',
    },
    {
      id: 4,
      name: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
      country: 'USA',
      costIndex: 'High',
      popularity: 'Popular',
    },
  ];

  // Handle trip actions
  const handleViewTrip = (trip) => {
    // TODO: Navigate to trip view
    console.log('View trip:', trip);
  };

  const handleEditTrip = (trip) => {
    // TODO: Navigate to trip edit
    console.log('Edit trip:', trip);
  };

  const handleDeleteTrip = (trip) => {
    // TODO: Implement delete confirmation
    console.log('Delete trip:', trip);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div ref={heroRef.ref} className="bg-gradient-to-br from-brand-midnight via-brand-ocean to-brand-sky text-white">
        <div className="container-responsive py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, {user?.name || 'Traveler'}! 👋
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Ready to plan your next adventure? Let's make your travel dreams come true.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{tripStats.total}</div>
                <div className="text-sm text-white/80">Total Trips</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{tripStats.upcoming}</div>
                <div className="text-sm text-white/80">Upcoming</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{tripStats.current}</div>
                <div className="text-sm text-white/80">Active</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{tripStats.past}</div>
                <div className="text-sm text-white/80">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-12">
        {/* Quick Actions */}
        <div ref={actionsRef.ref} className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 group">
                  <div className="text-center p-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200 ${
                      action.variant === 'primary' ? 'bg-brand-ocean' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {action.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {action.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Trips */}
        <div ref={tripsRef.ref} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Your Trips</h2>
            <Link to="/trips">
              <Button variant="ghost" size="sm">
                View All Trips
              </Button>
            </Link>
          </div>

          {/* Trip Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Upcoming ({upcomingTrips.length})
              </button>
              <button
                onClick={() => setActiveTab('current')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'current'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Active ({currentTrips.length})
              </button>
            </div>
          </div>

          {/* Trip Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-neutral-200 rounded-t-lg mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                    <div className="h-3 bg-neutral-200 rounded w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : activeTab === 'upcoming' && upcomingTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.slice(0, 3).map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onView={handleViewTrip}
                  onEdit={handleEditTrip}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          ) : activeTab === 'current' && currentTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTrips.slice(0, 3).map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onView={handleViewTrip}
                  onEdit={handleEditTrip}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {activeTab === 'upcoming' ? 'No upcoming trips' : 'No active trips'}
              </h3>
              <p className="text-neutral-600 mb-4">
                {activeTab === 'upcoming'
                  ? 'Start planning your next adventure by creating a new trip.'
                  : 'You don\'t have any trips in progress right now.'
                }
              </p>
              <Link to="/trips/create">
                <Button variant="primary">
                  Plan Your First Trip
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Recommended Destinations */}
        <div ref={statsRef.ref} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Recommended Destinations</h2>
            <Link to="/cities">
              <Button variant="ghost" size="sm">
                Explore More
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedDestinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <div className="relative h-32 mb-4">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {destination.name}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    {destination.country}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      destination.costIndex === 'High'
                        ? 'bg-red-100 text-red-800'
                        : destination.costIndex === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {destination.costIndex} Cost
                    </span>
                    <span className="text-neutral-500">
                      {destination.popularity}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Budget Overview</h2>
            <Link to="/budget">
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mb-1">$2,450</div>
              <div className="text-sm text-neutral-600">Total Budget</div>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mb-1">$1,280</div>
              <div className="text-sm text-neutral-600">Spent</div>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mb-1">$1,170</div>
              <div className="text-sm text-neutral-600">Remaining</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
