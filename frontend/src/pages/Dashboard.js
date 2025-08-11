import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Search } from 'lucide-react';
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

  useEffect(() => {
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-soft">
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)`, width: `${banners.length * 100}%` }}
      >
        {banners.map((b) => (
          <div key={b.id} className="w-full shrink-0">
            {b.src ? (
              <img
                src={b.src}
                alt={`banner ${b.id}`}
                className="h-56 md:h-72 w-full object-cover"
              />
            ) : (
              <div className="h-56 md:h-72 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-lg font-semibold">
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

const Dashboard = () => {
  const dispatch = useDispatch();
  const { trips, loading } = useSelector((state) => state.trips);

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
    // groupBy is visual only for now – backend to come later
    return list;
  }, [trips, search, filter, sortBy]);

  const popularAttractions = [
    { title: 'Museums', desc: 'Art, history and science' },
    { title: 'Parks', desc: 'Green escapes and hikes' },
    { title: 'Cafes', desc: 'Local brews and bites' },
    { title: 'Markets', desc: 'Street food and souvenirs' },
    { title: 'Landmarks', desc: 'Iconic sights' },
    { title: 'Beaches', desc: 'Sun and sand' },
  ];

  return (
    <div className="space-y-8">
      {/* Scrolling banner */}
      <BannerCarousel />

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

      {/* Top regional selections / popular local attractions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Regional Selections</h2>
          <Link to="/trips" className="text-sm text-primary-600 hover:text-primary-500 font-medium">Explore trips</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularAttractions.map((item) => (
            <button key={item.title} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
              <div className="h-10 w-10 rounded-md bg-primary-100 mb-3" />
              <div className="font-medium text-gray-900">{item.title}</div>
              <div className="text-xs text-gray-600">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Previous trips of current user */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Previous Trips</h2>
          <Link to="/trips" className="text-sm text-primary-600 hover:text-primary-500 font-medium">View all</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-40 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : previousTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default Dashboard;