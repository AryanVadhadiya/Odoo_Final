import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useFadeIn } from '../../hooks/useFadeIn';
import PageHeader from '../layout/PageHeader';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, MapPin, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const fadeInRef = useFadeIn();

  // Mock data - will be replaced with real API calls
  const upcomingTrips = [
    {
      id: 1,
      name: 'Paris Adventure',
      destination: 'Paris, France',
      startDate: '2024-06-15',
      endDate: '2024-06-22',
      image: 'https://images.unsplash.com/photo-1502602898535-0c2d0c0c0c0c?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Tokyo Explorer',
      destination: 'Tokyo, Japan',
      startDate: '2024-07-10',
      endDate: '2024-07-20',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop'
    }
  ];

  const quickStats = [
    { label: 'Total Trips', value: '12', icon: MapPin, color: 'text-blue-600' },
    { label: 'Upcoming', value: '3', icon: Calendar, color: 'text-green-600' },
    { label: 'Total Spent', value: '$2,450', icon: DollarSign, color: 'text-purple-600' },
    { label: 'Friends', value: '8', icon: Users, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'Traveler'}!`}
        subtitle="Ready to plan your next adventure?"
        actions={
          <Button variant="primary" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Plan New Trip
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div ref={fadeInRef} data-fade>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} variant="glass" className="text-center p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Upcoming Trips */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Trips</h2>
              <Button variant="outline" size="md">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.map((trip) => (
                <Card key={trip.id} variant="trip-card" className="overflow-hidden">
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={trip.image}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Upcoming
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{trip.name}</h3>
                    <p className="text-gray-600 mb-3">{trip.destination}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{trip.startDate}</span>
                      <span>to</span>
                      <span>{trip.endDate}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass" className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Explore Destinations</h3>
                  <p className="text-gray-600">Discover new places to visit</p>
                </div>
              </div>
              <Button variant="outline" size="md" fullWidth>
                Start Exploring
              </Button>
            </Card>

            <Card variant="glass" className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">View Analytics</h3>
                  <p className="text-gray-600">Track your travel spending</p>
                </div>
              </div>
              <Button variant="outline" size="md" fullWidth>
                View Reports
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 