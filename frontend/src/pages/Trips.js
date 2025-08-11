import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Search, Plus, Edit, Eye, Trash2, Play, CheckCircle, RotateCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrips, deleteTrip } from '../store/slices/tripSlice';
import { tripAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const Trips = () => {
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [statusFilter, setStatusFilter] = useState('all'); // all | ongoing | upcoming | completed
  const [sortBy, setSortBy] = useState('recent');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const dispatch = useDispatch();
  const { trips, loading, deleteLoading } = useSelector((state) => state.trips);

  useEffect(() => {
    if (!trips || trips.length === 0) {
      dispatch(fetchTrips({ limit: 50 }));
    }
  }, [dispatch]);

  const filteredTrips = useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = Array.isArray(trips) ? trips : [];
    let list = !q
      ? source
      : source.filter(
          (t) => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
        );
    if (statusFilter !== 'all') {
      // Map UI filters to backend statuses
      const statusMap = {
        ongoing: 'active',
        upcoming: 'planning',
        completed: 'completed',
      };
      list = list.filter((t) => t.status === statusMap[statusFilter]);
    }
    if (sortBy === 'recent') list = [...list].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [trips, search, statusFilter, sortBy]);

  const grouped = useMemo(() => {
    const mapping = { ongoing: [], upcoming: [], completed: [] };
    filteredTrips.forEach((t) => {
      if (t.status === 'active') mapping.ongoing.push(t);
      else if (t.status === 'planning') mapping.upcoming.push(t);
      else if (t.status === 'completed') mapping.completed.push(t);
    });
    return mapping;
  }, [filteredTrips]);

  const handleStatusUpdate = async (tripId, newStatus) => {
    try {
      setUpdatingStatus(tripId);
      await tripAPI.updateTripStatus(tripId, newStatus);
      // Refresh trips
      dispatch(fetchTrips({ limit: 50 }));
      toast.success('Trip status updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update trip status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        await dispatch(deleteTrip(tripId)).unwrap();
        toast.success('Trip deleted successfully');
      } catch (error) {
        toast.error(error || 'Failed to delete trip');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      planning: { label: 'Upcoming', className: 'badge-primary' },
      active: { label: 'Ongoing', className: 'badge-warning' },
      completed: { label: 'Completed', className: 'badge-success' },
      cancelled: { label: 'Cancelled', className: 'badge-secondary' }
    };
    
    const config = statusConfig[status] || statusConfig.planning;
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  const getStatusButton = (trip) => {
    const { status, _id } = trip;
    
    if (status === 'planning') {
      return (
        <button
          onClick={() => handleStatusUpdate(_id, 'active')}
          disabled={updatingStatus === _id}
          className="btn-success btn-sm inline-flex items-center"
        >
          <Play className="h-4 w-4 mr-1" />
          Start Trip
        </button>
      );
    } else if (status === 'active') {
      return (
        <button
          onClick={() => handleStatusUpdate(_id, 'completed')}
          disabled={updatingStatus === _id}
          className="btn-primary btn-sm inline-flex items-center"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Complete Trip
        </button>
      );
    } else if (status === 'completed') {
      return (
        <button
          onClick={() => handleStatusUpdate(_id, 'planning')}
          disabled={updatingStatus === _id}
          className="btn-secondary btn-sm inline-flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reactivate Trip
        </button>
      );
    }
    
    return null;
  };

  const TripCard = ({ trip }) => (
    <div className="card hover:shadow-medium transition-shadow duration-200">
      <div className="card-body">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{trip.name}</h3>
          <div className="flex items-center gap-2">
            {getStatusBadge(trip.status)}
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {trip.destinations?.length || 0} destination{(trip.destinations?.length || 0) > 1 ? 's' : ''}
          </div>
          {trip.budget?.total > 0 && (
            <div className="flex items-center">
              <span className="mr-2">💰</span>
              ${trip.budget.total.toLocaleString()} {trip.budget.currency}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {/* Status update button */}
          {getStatusButton(trip)}
          
          {/* Action buttons */}
          <div className="flex space-x-2">
            <Link to={`/trips/${trip._id}`} className="btn-secondary btn-sm flex-1 text-center flex items-center justify-center">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
            <Link to={`/trips/${trip._id}/edit`} className="btn-secondary btn-sm flex items-center justify-center">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
            <button 
              onClick={() => handleDeleteTrip(trip._id)}
              disabled={deleteLoading}
              className="btn-danger btn-sm flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600">Manage and organize your travel adventures</p>
        </div>
        <Link
          to="/trips/create"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Trip
        </Link>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips..."
              className="input pl-10 h-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input md:w-48" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="none">Group by: None</option>
            <option value="destination">Destination</option>
            <option value="month">Month</option>
          </select>
          <select className="input md:w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Filter: All</option>
            <option value="ongoing">Filter: Ongoing</option>
            <option value="upcoming">Filter: Upcoming</option>
            <option value="completed">Filter: Completed</option>
          </select>
          <select className="input md:w-48" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Sort by: Most Recent</option>
            <option value="name">Sort by: Name</option>
          </select>
        </div>
      </div>

      {/* Trip groups */}
      <div className="space-y-6">
        {/* Ongoing */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Ongoing</h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="grid grid-cols-1 gap-3">{[...Array(3)].map((_, i) => (<div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse"/>))}</div>
            ) : grouped.ongoing.length === 0 ? (
              <div className="text-gray-600">No ongoing trips.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grouped.ongoing.map((t) => (
                  <TripCard key={t._id} trip={t} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming</h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="grid grid-cols-1 gap-3">{[...Array(3)].map((_, i) => (<div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse"/>))}</div>
            ) : grouped.upcoming.length === 0 ? (
              <div className="text-gray-600">No upcoming trips.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grouped.upcoming.map((t) => (
                  <TripCard key={t._id} trip={t} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Completed</h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="grid grid-cols-1 gap-3">{[...Array(3)].map((_, i) => (<div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse"/>))}</div>
            ) : grouped.completed.length === 0 ? (
              <div className="text-gray-600">No completed trips.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grouped.completed.map((t) => (
                  <TripCard key={t._id} trip={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters to find your trips.</p>
          <Link
            to="/trips/create"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Trip
          </Link>
        </div>
      )}
    </div>
  );
};

export default Trips; 