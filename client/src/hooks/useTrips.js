import { useState, useEffect, useCallback } from 'react';
import { tripsAPI } from '../lib/api';

export const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    search: '',
  });

  // Fetch trips
  const fetchTrips = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripsAPI.getTrips({ ...filters, ...params });
      setTrips(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch trips';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create new trip
  const createTrip = useCallback(async (tripData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripsAPI.createTrip(tripData);
      const newTrip = response.data;

      setTrips(prev => [newTrip, ...prev]);
      return { success: true, trip: newTrip };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update trip
  const updateTrip = useCallback(async (tripId, tripData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripsAPI.updateTrip(tripId, tripData);
      const updatedTrip = response.data;

      setTrips(prev => prev.map(trip =>
        trip.id === tripId ? updatedTrip : trip
      ));

      return { success: true, trip: updatedTrip };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete trip
  const deleteTrip = useCallback(async (tripId) => {
    try {
      setLoading(true);
      setError(null);

      await tripsAPI.deleteTrip(tripId);

      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single trip
  const getTrip = useCallback(async (tripId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripsAPI.getTrip(tripId);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch trip';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get trip itinerary
  const getTripItinerary = useCallback(async (tripId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripsAPI.getTripItinerary(tripId);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch itinerary';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update trip itinerary
  const updateTripItinerary = useCallback(async (tripId, itineraryData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripsAPI.updateTripItinerary(tripId, itineraryData);
      return { success: true, itinerary: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update itinerary';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Share trip
  const shareTrip = useCallback(async (tripId, shareData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripsAPI.shareTrip(tripId, shareData);
      return { success: true, shareLink: response.data.shareLink };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to share trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get filtered trips
  const getFilteredTrips = useCallback(() => {
    let filtered = [...trips];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(trip => trip.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(trip =>
        trip.name.toLowerCase().includes(searchLower) ||
        trip.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(trip => {
        const tripStart = new Date(trip.startDate);
        const tripEnd = new Date(trip.endDate);

        if (start && end) {
          return tripStart >= start && tripEnd <= end;
        } else if (start) {
          return tripStart >= start;
        } else if (end) {
          return tripEnd <= end;
        }
        return true;
      });
    }

    return filtered;
  }, [trips, filters]);

  // Get upcoming trips
  const getUpcomingTrips = useCallback(() => {
    const now = new Date();
    return trips.filter(trip => new Date(trip.startDate) > now);
  }, [trips]);

  // Get past trips
  const getPastTrips = useCallback(() => {
    const now = new Date();
    return trips.filter(trip => new Date(trip.endDate) < now);
  }, [trips]);

  // Get current trips
  const getCurrentTrips = useCallback(() => {
    const now = new Date();
    return trips.filter(trip => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      return start <= now && end >= now;
    });
  }, [trips]);

  // Get trip statistics
  const getTripStats = useCallback(() => {
    const total = trips.length;
    const upcoming = getUpcomingTrips().length;
    const current = getCurrentTrips().length;
    const past = getPastTrips().length;

    return {
      total,
      upcoming,
      current,
      past,
    };
  }, [trips, getUpcomingTrips, getCurrentTrips, getPastTrips]);

  return {
    // State
    trips,
    loading,
    error,
    filters,

    // Actions
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    getTrip,
    getTripItinerary,
    updateTripItinerary,
    shareTrip,
    updateFilters,
    clearError,

    // Computed values
    getFilteredTrips,
    getUpcomingTrips,
    getCurrentTrips,
    getPastTrips,
    getTripStats,
  };
};
