import { useState, useEffect, useCallback } from 'react';
import { tripsAPI } from '../lib/api';

/**
 * Custom hook for managing trips
 */
export function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);

  /**
   * Fetch all trips
   */
  const fetchTrips = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripsAPI.getTrips(params);
      setTrips(response.data);
      return { success: true, trips: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch trips';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch single trip
   */
  const fetchTrip = useCallback(async (tripId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripsAPI.getTrip(tripId);
      const trip = response.data;
      
      setCurrentTrip(trip);
      return { success: true, trip };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new trip
   */
  const createTrip = useCallback(async (tripData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripsAPI.createTrip(tripData);
      const newTrip = response.data;
      
      setTrips(prev => [newTrip, ...prev]);
      setCurrentTrip(newTrip);
      
      return { success: true, trip: newTrip };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing trip
   */
  const updateTrip = useCallback(async (tripId, tripData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripsAPI.updateTrip(tripId, tripData);
      const updatedTrip = response.data;
      
      setTrips(prev => prev.map(trip => 
        trip.id === tripId ? updatedTrip : trip
      ));
      
      if (currentTrip?.id === tripId) {
        setCurrentTrip(updatedTrip);
      }
      
      return { success: true, trip: updatedTrip };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [currentTrip]);

  /**
   * Delete trip
   */
  const deleteTrip = useCallback(async (tripId) => {
    try {
      setLoading(true);
      setError(null);
      
      await tripsAPI.deleteTrip(tripId);
      
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      
      if (currentTrip?.id === tripId) {
        setCurrentTrip(null);
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [currentTrip]);

  /**
   * Share trip
   */
  const shareTrip = useCallback(async (tripId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripsAPI.shareTrip(tripId);
      const shareData = response.data;
      
      return { success: true, shareData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to share trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Copy trip
   */
  const copyTrip = useCallback(async (tripId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripsAPI.copyTrip(tripId);
      const copiedTrip = response.data;
      
      setTrips(prev => [copiedTrip, ...prev]);
      
      return { success: true, trip: copiedTrip };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to copy trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear current trip
   */
  const clearCurrentTrip = useCallback(() => {
    setCurrentTrip(null);
  }, []);

  return {
    trips,
    currentTrip,
    loading,
    error,
    fetchTrips,
    fetchTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    shareTrip,
    copyTrip,
    clearError,
    clearCurrentTrip,
  };
}

/**
 * Custom hook for managing trip itinerary
 */
export function useItinerary(tripId) {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch itinerary
   */
  const fetchItinerary = useCallback(async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripsAPI.getItinerary(tripId);
      setItinerary(response.data);
      return { success: true, itinerary: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch itinerary';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  /**
   * Update itinerary
   */
  const updateItinerary = useCallback(async (itineraryData) => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripsAPI.updateItinerary(tripId, itineraryData);
      const updatedItinerary = response.data;
      
      setItinerary(updatedItinerary);
      return { success: true, itinerary: updatedItinerary };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update itinerary';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    itinerary,
    loading,
    error,
    fetchItinerary,
    updateItinerary,
    clearError,
  };
} 