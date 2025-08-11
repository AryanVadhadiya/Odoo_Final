import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Search, Plus, TrendingUp, DollarSign, Users, Clock, Star } from 'lucide-react';
import { fetchTrips } from '../store/slices/tripSlice';

const BannerCarousel = () => {
  // Autoload images from src/pages/img named i1..i5 (any common extension)
  let imageMap = {};
  try {
    const req = require.context('./img', false, /\.(png|jpe?g|webp|svg)$/);
    req.keys().forEach((k) => {
      const base = k.replace('./', '').split('.')[0];
      imageMap[base] = req(k);
    });
  } catch (e) {
    imageMap = {};
  }

  const banners = [1, 2, 3, 4, 5].map((i) => ({ id: i, src: imageMap[`i${i}`] }));

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const [naturalWidth, setNaturalWidth] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  // Recalculate container width on resize based on image natural width
  useEffect(() => {
    const recalc = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.parentElement?.clientWidth || 0;
      const targetWidth = naturalWidth ? Math.min(naturalWidth, parentWidth) : parentWidth;
      setContainerWidth(targetWidth);
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [naturalWidth]);

  const handleImageLoad = (e) => {
    const nw = e?.target?.naturalWidth;
    if (nw && !naturalWidth) {
      setNaturalWidth(nw);
    }
  };

  // Pixel-based width for accurate slide sizing
  const trackWidth = containerWidth ? containerWidth * banners.length : '100%';
  const translateX = containerWidth ? -(index * containerWidth) : `-${index * 100}%`;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-gray-200 shadow-soft mx-auto z-0"
      style={containerWidth ? { width: `${containerWidth}px` } : undefined}
    >
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(${translateX}${typeof translateX === 'string' ? '' : 'px'})`, width: typeof trackWidth === 'number' ? `${trackWidth}px` : trackWidth }}
      >
        {banners.map((b) => (
          <div
            key={b.id}
            className="shrink-0 flex items-center justify-center"
            style={containerWidth ? { width: `${containerWidth}px` } : { width: '100%' }}
          >
            {b.src ? (
              <img
                src={b.src}
                alt={`banner ${b.id}`}
                className="h-auto max-h-72 w-auto max-w-full object-contain"
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="h-56 md:h-72 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-lg font-semibold w-full">
                Add image src/pages/img/i{b.id}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`h-2 w-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/60'}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

// Simple Chart Components
const BudgetChart = ({ budgetData }) => {
  const total = budgetData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="space-y-3">
      {budgetData.map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900">${item.value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${item.color}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TripStatusChart = ({ trips }) => {
  const statusCounts = trips.reduce((acc, trip) => {
    acc[trip.status] = (acc[trip.status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    planning: 'bg-blue-500',
    active: 'bg-yellow-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-500'
  };

  const statusLabels = {
    planning: 'Planning',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  return (
    <div className="space-y-3">
      {Object.entries(statusCounts).map(([status, count]) => (
        <div key={status} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
            <span className="text-sm text-gray-600">{statusLabels[status]}</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{count}</span>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { trips, loading } = useSelector((state) => state.trips);
  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    dispatch(fetchTrips({ limit: 12 }));
  }, [dispatch]);

  const previousTrips = useMemo(() => {
    const base = [...trips];
    let list = base.filter((t) =>
      (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase())
    );
    if (filter !== 'all') {
      list = list.filter((t) => t.status === filter);
    }
    if (sortBy === 'recent') list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    if (sortBy === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list.slice(0, 6); // Show only 6 recent trips
  }, [trips, search, filter, sortBy]);

  // Calculate budget statistics
  const budgetStats = useMemo(() => {
    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget?.total || 0), 0);
    const totalSpent = trips.reduce((sum, trip) => sum + (trip.budget?.spent || 0), 0);
    const averageBudget = trips.length > 0 ? totalBudget / trips.length : 0;
    
    return { totalBudget, totalSpent, averageBudget };
  }, [trips]);

  // Budget breakdown data for chart
  const budgetBreakdown = useMemo(() => {
    const breakdown = {
      accommodation: 0,
      transportation: 0,
      activities: 0,
      food: 0,
      other: 0
    };

    trips.forEach(trip => {
      if (trip.budget?.breakdown) {
        Object.keys(breakdown).forEach(key => {
          breakdown[key] += trip.budget.breakdown[key] || 0;
        });
      }
    });

    return [
      { label: 'Accommodation', value: breakdown.accommodation, color: 'bg-blue-500' },
      { label: 'Transportation', value: breakdown.transportation, color: 'bg-green-500' },
      { label: 'Activities', value: breakdown.activities, color: 'bg-yellow-500' },
      { label: 'Food', value: breakdown.food, color: 'bg-red-500' },
      { label: 'Other', value: breakdown.other, color: 'bg-purple-500' }
    ].filter(item => item.value > 0);
  }, [trips]);

  const popularAttractions = [
    { title: 'Museums', desc: 'Art, history and science', icon: '🏛️' },
    { title: 'Parks', desc: 'Green escapes and hikes', icon: '🌳' },
    { title: 'Cafes', desc: 'Local brews and bites', icon: '☕' },
    { title: 'Markets', desc: 'Street food and souvenirs', icon: '🛍️' },
    { title: 'Landmarks', desc: 'Iconic sights', icon: '🗽' },
    { title: 'Beaches', desc: 'Sun and sand', icon: '🏖️' },
  ];

  const recommendedDestinations = [
    { name: 'Paris, France', rating: 4.8, visitors: '30M+', image: '🗼' },
    { name: 'Tokyo, Japan', rating: 4.9, visitors: '25M+', image: '🗾' },
    { name: 'New York, USA', rating: 4.7, visitors: '50M+', image: '🗽' },
    { name: 'Rome, Italy', rating: 4.8, visitors: '20M+', image: '🏛️' },
    { name: 'Barcelona, Spain', rating: 4.6, visitors: '15M+', image: '🏰' },
    { name: 'Sydney, Australia', rating: 4.7, visitors: '12M+', image: '🏖️' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.name || 'Traveler'}! 👋</h1>
            <p className="text-primary-100 text-lg">Ready to plan your next adventure?</p>
          </div>
          <Link
            to="/trips/create"
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Plan New Trip
          </Link>
        </div>
      </div>

      {/* Scrolling banner */}
      <BannerCarousel />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${budgetStats.totalBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Trips</p>
              <p className="text-2xl font-bold text-gray-900">{trips.filter(t => t.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Planning</p>
              <p className="text-2xl font-bold text-gray-900">{trips.filter(t => t.status === 'planning').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + group + filter + sort toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="input pl-10"
              placeholder="Search city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input md:w-48" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="none">Group by: None</option>
            <option value="country">Country</option>
            <option value="climate">Climate</option>
          </select>
          <select className="input md:w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Filter: All</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input md:w-48" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Sort by: Most Recent</option>
            <option value="name">Sort by: Name</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Trips and Budget */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Trips */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Trips</h2>
              <Link to="/trips" className="text-sm text-primary-600 hover:text-primary-500 font-medium">View all</Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-40 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : previousTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {previousTrips.map((trip) => (
                  <div key={trip._id} className="card hover:shadow-medium transition-shadow duration-200">
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{trip.name}</h3>
                        <span className={`badge ${trip.status === 'completed' ? 'badge-success' : trip.status === 'active' ? 'badge-warning' : 'badge-primary'}`}>{trip.status}</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</div>
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{trip.destinations?.length || 0} destinations</div>
                        {trip.budget?.total > 0 && (
                          <div className="flex items-center"><DollarSign className="h-4 w-4 mr-2" />${trip.budget.total.toLocaleString()}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/trips/${trip._id}`} className="btn-secondary btn-sm flex-1 text-center">View</Link>
                        <Link to={`/trips/${trip._id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-4">Start planning your first adventure!</p>
                <Link to="/trips/create" className="btn-primary inline-flex items-center">Create New Trip</Link>
              </div>
            )}
          </div>

          {/* Budget Highlights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
              <Link to="/budget" className="text-sm text-primary-600 hover:text-primary-500 font-medium">View Details</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">Budget Breakdown</h3>
                <BudgetChart budgetData={budgetBreakdown} />
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Average Budget per Trip</h4>
                  <p className="text-2xl font-bold text-gray-900">${budgetStats.averageBudget.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Total Spent</h4>
                  <p className="text-2xl font-bold text-gray-900">${budgetStats.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Charts and Recommendations */}
        <div className="space-y-6">
          {/* Trip Status Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Status</h3>
            <TripStatusChart trips={trips} />
          </div>

          {/* Recommended Destinations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Destinations</h3>
            <div className="space-y-3">
              {recommendedDestinations.map((dest, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl">{dest.image}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{dest.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                        {dest.rating}
                      </div>
                      <span>•</span>
                      <span>{dest.visitors}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Regional Selections */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Attractions</h3>
            <div className="grid grid-cols-2 gap-3">
              {popularAttractions.map((item) => (
                <button key={item.title} className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;