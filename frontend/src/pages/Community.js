import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, MapPin, ShieldCheck, ShieldOff, Calendar, DollarSign, Heart, Share2, Copy, Eye, Filter, Globe, TrendingUp, Star, MapPin as MapPinIcon } from 'lucide-react';
import { tripAPI, userAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const CommunityUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getCommunityUsers();
        setUsers(response.data?.data || []);
      } catch (error) {
        console.error('Failed to load community users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Community Members</h2>
        </div>
        <div className="card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Community Members</h2>
        </div>
        <div className="card-body text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No community members yet</h3>
          <p className="text-gray-600">Be the first to join our travel community!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900">Community Members</h2>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  {user.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                  )}
                </div>
              </div>
              
              {user.savedDestinations && user.savedDestinations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    Saved Destinations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user.savedDestinations.slice(0, 3).map((dest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {dest.city}, {dest.country}
                      </span>
                    ))}
                    {user.savedDestinations.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{user.savedDestinations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                {user.preferences?.language && (
                  <span className="uppercase">{user.preferences.language}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LatestPublicTrips = ({ searchQuery, selectedFilter, selectedSort }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredTrips, setFilteredTrips] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await tripAPI.getPublicFeed({ limit: 50 });
        setTrips(res.data?.data || []);
      } catch (e) {
        setTrips([]);
        toast.error('Failed to load public trips');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter and sort trips
  useEffect(() => {
    let filtered = [...trips];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(trip => 
        trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedFilter && selectedFilter !== 'all') {
      filtered = filtered.filter(trip => 
        trip.tags?.some(tag => tag.toLowerCase() === selectedFilter.toLowerCase())
      );
    }

    // Apply sorting
    if (selectedSort === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (selectedSort === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedSort === 'budget') {
      filtered.sort((a, b) => (b.budget?.total || 0) - (a.budget?.total || 0));
    } else if (selectedSort === 'duration') {
      filtered.sort((a, b) => {
        const aDuration = new Date(a.endDate) - new Date(a.startDate);
        const bDuration = new Date(b.endDate) - new Date(b.startDate);
        return bDuration - aDuration;
      });
    }

    setFilteredTrips(filtered);
  }, [trips, searchQuery, selectedFilter, selectedSort]);

  const copyTrip = async (publicUrl) => {
    try {
      await tripAPI.copyPublicTrip(publicUrl);
      toast.success('Trip copied successfully! Check your trips.');
    } catch (error) {
      toast.error('Failed to copy trip. Please try again.');
    }
  };

  const shareTrip = async (publicUrl) => {
    try {
      const shareUrl = `${window.location.origin}/public-trip/${publicUrl}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Trip link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Latest Public Trips</h2>
        </div>
        <div className="card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredTrips.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Latest Public Trips</h2>
        </div>
        <div className="card-body text-center py-12">
          <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No trips found</p>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900">Latest Public Trips</h2>
        <p className="text-sm text-gray-600">Discover amazing trips from our community</p>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div key={trip._id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
              {/* Trip Cover Image */}
              {trip.coverPhoto && (
                <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${trip.coverPhoto})` }} />
              )}
              
              <div className="p-4">
                {/* Trip Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{trip.name}</h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => shareTrip(trip.publicUrl)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Share trip"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => copyTrip(trip.publicUrl)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Copy trip"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Trip Description */}
                {trip.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{trip.description}</p>
                )}

                {/* Trip Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{trip.destinations?.length || 0} destinations</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{trip.budget?.currency} {Number(trip.budget?.total || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Trip Tags */}
                {trip.tags && trip.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {trip.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {trip.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{trip.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Trip Creator */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center">
                    {trip.user?.profilePicture ? (
                      <img 
                        src={trip.user.profilePicture} 
                        alt={trip.user.firstName} 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                        <Users className="h-3 w-3 text-gray-600" />
                      </div>
                    )}
                    <span className="text-sm text-gray-600">
                      {trip.user?.firstName ? `${trip.user.firstName} ${trip.user.lastName}` : 'Traveler'}
                    </span>
                  </div>
                  
                  <a 
                    href={`/public-trip/${trip.publicUrl}`}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Community = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');

  const filterOptions = [
    { value: 'all', label: 'All Trips' },
    { value: 'culture', label: 'Culture' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'food', label: 'Food & Cuisine' },
    { value: 'nature', label: 'Nature' },
    { value: 'beach', label: 'Beach' },
    { value: 'city', label: 'City Break' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'budget', label: 'Budget' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'budget', label: 'Highest Budget' },
    { value: 'duration', label: 'Longest Duration' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600">Discover and get inspired by amazing trips from our community</p>
        </div>
        <button
          onClick={() => navigate('/trips/create')}
          className="btn-primary"
        >
          Create Your Trip
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trips, destinations, or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="input"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="input"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="card-body text-center">
            <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">1,234</div>
            <div className="text-sm text-blue-700">Public Trips</div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="card-body text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">567</div>
            <div className="text-sm text-green-700">Active Travelers</div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="card-body text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">89</div>
            <div className="text-sm text-purple-700">Countries Visited</div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="card-body text-center">
            <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">4.8</div>
            <div className="text-sm text-orange-700">Community Rating</div>
          </div>
        </div>
      </div>

      {/* Community Users */}
      <CommunityUsers />

      {/* Public Trips */}
      <LatestPublicTrips 
        searchQuery={search}
        selectedFilter={selectedFilter}
        selectedSort={selectedSort}
      />
    </div>
  );
};

export default Community;


