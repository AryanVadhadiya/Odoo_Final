import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle 401 errors without circular dependency
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/updatedetails', profileData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
};

// Trip API
export const tripAPI = {
  getTrips: (params) => api.get('/trips', { params }),
  getTrip: (tripId) => api.get(`/trips/${tripId}`),
  createTrip: (tripData) => api.post('/trips', tripData),
  updateTrip: (tripId, tripData) => api.put(`/trips/${tripId}`, tripData),
  deleteTrip: (tripId) => api.delete(`/trips/${tripId}`),
  // Note: server mounts router at '/api/trips/public' and route path is '/public/:publicUrl'
  // So the effective path is '/api/trips/public/public/:publicUrl'
  getPublicTrip: (publicUrl) => api.get(`/trips/public/public/${publicUrl}`),
  getPublicFeed: (params) => api.get('/trips/public/public-feed', { params }),
  addCollaborator: (tripId, collaboratorData) => api.post(`/trips/${tripId}/collaborators`, collaboratorData),
};

// Itinerary API
export const itineraryAPI = {
  getItinerary: (tripId) => api.get(`/itinerary/${tripId}`),
  addDestination: (tripId, destinationData) => api.post(`/itinerary/${tripId}/destinations`, destinationData),
  updateDestination: (tripId, destinationId, destinationData) => 
    api.put(`/itinerary/${tripId}/destinations/${destinationId}`, destinationData),
  deleteDestination: (tripId, destinationId) => 
    api.delete(`/itinerary/${tripId}/destinations/${destinationId}`),
  reorderDestinations: (tripId, destinationIds) => 
    api.put(`/itinerary/${tripId}/destinations/reorder`, { destinationIds }),
};

// Activity API
export const activityAPI = {
  getActivities: (params) => api.get('/activities', { params }),
  getActivity: (activityId) => api.get(`/activities/${activityId}`),
  createActivity: (activityData) => api.post('/activities', activityData),
  updateActivity: (activityId, activityData) => api.put(`/activities/${activityId}`, activityData),
  deleteActivity: (activityId) => api.delete(`/activities/${activityId}`),
  getActivityTypes: () => api.get('/activities/types'),
  createBulkActivities: (activities) => api.post('/activities/bulk', { activities }),
};

// City API
export const cityAPI = {
  searchCities: (params) => api.get('/cities', { params }),
  getCity: (cityId) => api.get(`/cities/${cityId}`),
  getPopularCities: (limit) => api.get('/cities/popular', { params: { limit } }),
  getCountries: () => api.get('/cities/countries'),
  getClimates: () => api.get('/cities/climates'),
  getNearbyCities: (lat, lng, radius, limit) => 
    api.get('/cities/nearby', { params: { lat, lng, radius, limit } }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  addSavedDestination: (destinationData) => api.post('/users/saved-destinations', destinationData),
  removeSavedDestination: (destinationId) => api.delete(`/users/saved-destinations/${destinationId}`),
  getUserStats: () => api.get('/users/stats'),
  deleteAccount: () => api.delete('/users/account'),
};

// Budget API
export const budgetAPI = {
  getBudget: (tripId) => api.get(`/budget/${tripId}`),
  updateBudget: (tripId, budgetData) => api.put(`/budget/${tripId}`, budgetData),
  getBudgetForecast: (tripId) => api.get(`/budget/${tripId}/forecast`),
  exportBudget: (tripId) => api.get(`/budget/${tripId}/export`),
};

// Suggestions (Gemini) API placeholder (client-side)
export const suggestionsAPI = {
  getTopPlaces: async (cityQuery) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing REACT_APP_GEMINI_API_KEY');
    const prompt = `Return a JSON array of top 15 places/activities in ${cityQuery}. Each item must have: title, details (<=200 chars), approxCost (number in USD), rating (0-5), timings (string).`;
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    try { return JSON.parse(text); } catch { return []; }
  },
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 