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
  updateTripStatus: (tripId, status) => api.patch(`/trips/${tripId}/status`, { status }),
  // Note: server mounts router at '/api/trips/public' and route path is '/public/:publicUrl'
  // So the effective path is '/api/trips/public/public/:publicUrl'
  getPublicTrip: (publicUrl) => api.get(`/trips/public/public/${publicUrl}`),
  getPublicFeed: (params) => api.get('/trips/public/public-feed', { params }),
  copyPublicTrip: (publicUrl) => api.post(`/trips/copy/${publicUrl}`),
  addCollaborator: (tripId, collaboratorData) => api.post(`/trips/${tripId}/collaborators`, collaboratorData),
};

// Itinerary API
export const itineraryAPI = {
  getItinerary: (tripId) => api.get(`/itinerary/${tripId}`),
  getPublicItinerary: (publicUrl) => api.get(`/itinerary/public/${publicUrl}`),
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

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPopularCities: () => api.get('/admin/cities/popular'),
  getPopularActivities: () => api.get('/admin/activities/popular'),
  getPopularPlaces: () => api.get('/admin/places/popular'),
  getDurationByBudget: () => api.get('/admin/trips/duration-by-budget'),
  getBudgetByDuration: () => api.get('/admin/trips/budget-by-duration'),
  getBudgetDistribution: () => api.get('/admin/trips/budget-distribution'),
  getMonthlyTrends: () => api.get('/admin/trends/monthly'),
  exportCSV: (type) => api.get(`/admin/export/csv?type=${type}`, { responseType: 'blob' }),
};

// Budget API
export const budgetAPI = {
  getBudget: (tripId) => api.get(`/budget/${tripId}`),
  updateBudget: (tripId, budgetData) => api.put(`/budget/${tripId}`, budgetData),
  getBudgetForecast: (tripId) => api.get(`/budget/${tripId}/forecast`),
  exportBudget: (tripId) => api.get(`/budget/${tripId}/export`),
};

// Suggestions (Gemini) API - Enhanced with city search and activity discovery
export const suggestionsAPI = {
  // Search for cities with comprehensive information
  searchCities: async (query, filters = {}) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing REACT_APP_GEMINI_API_KEY');
    
    const { country, region, costRange, popularity } = filters;
    let prompt = `Search for cities matching "${query}" and return a JSON array of 8-12 cities. `;
    
    if (country) prompt += `Focus on ${country}. `;
    if (region) prompt += `Include cities from ${region} region. `;
    if (costRange) prompt += `Consider ${costRange} cost range. `;
    if (popularity) prompt += `Include ${popularity} popularity level cities. `;
    
    prompt += `Each city must have: name, country, region, costIndex (1-10, 1=very cheap, 10=very expensive), popularity (1-10, 1=hidden gem, 10=very popular), description (<=150 chars), bestTimeToVisit (string), avgDailyCost (number in USD), climate (string), highlights (array of 3-5 attractions), imageUrl (placeholder URL).`;
    
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ 
            parts: [{ text: prompt }] 
          }] 
        }),
      });
      
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return JSON.parse(text);
    } catch (error) {
      console.error('City search error:', error);
      return [];
    }
  },

  // Get popular cities for recommendations
  getPopularCities: async (limit = 10, category = 'general') => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing REACT_APP_GEMINI_API_KEY');
    
    const prompt = `Return a JSON array of ${limit} popular cities for ${category} travel. Each city must have: name, country, region, costIndex (1-10), popularity (1-10), description (<=150 chars), bestTimeToVisit (string), avgDailyCost (USD), climate (string), highlights (array of 3-5 attractions), imageUrl (placeholder URL), whyVisit (<=100 chars).`;
    
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ 
            parts: [{ text: prompt }] 
          }] 
        }),
      });
      
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return JSON.parse(text);
    } catch (error) {
      console.error('Popular cities error:', error);
      return [];
    }
  },

  // Discover activities for a specific city
  discoverActivities: async (cityName, filters = {}) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing REACT_APP_GEMINI_API_KEY');
    
    const { type, costRange, duration, interests } = filters;
    let prompt = `Discover activities in ${cityName} and return a JSON array of 8-12 activities. `;
    
    if (type) prompt += `Focus on ${type} activities. `;
    if (costRange) prompt += `Consider ${costRange} cost range. `;
    if (duration) prompt += `Include ${duration} duration activities. `;
    if (interests) prompt += `Cater to ${interests} interests. `;
    
    prompt += `Each activity must have: title, description (<=200 chars), type (sightseeing/food/adventure/culture/shopping/relaxation/transport/other), cost (number in USD), duration (number in minutes), rating (0-5), location (string), bestTime (string), highlights (array of 3 features), imageUrl (placeholder URL), difficulty (easy/medium/hard), groupSize (solo/couple/family/group).`;
    
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ 
            parts: [{ text: prompt }] 
          }] 
        }),
      });
      
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return JSON.parse(text);
    } catch (error) {
      console.error('Activity discovery error:', error);
      return [];
    }
  },

  // Get activity categories and types
  getActivityCategories: async () => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing REACT_APP_GEMINI_API_KEY');
    
    const prompt = `Return a JSON array of activity categories for travel planning. Each category must have: name, description (<=100 chars), icon (emoji), subcategories (array of 3-5 types), avgCost (number in USD), avgDuration (number in minutes), bestFor (array of traveler types).`;
    
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ 
            parts: [{ text: prompt }] 
          }] 
        }),
      });
      
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return JSON.parse(text);
    } catch (error) {
      console.error('Activity categories error:', error);
      return [];
    }
  },

  // Get travel recommendations based on preferences
  getTravelRecommendations: async (preferences = {}) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing REACT_APP_GEMINI_API_KEY');
    
    const { budget, duration, interests, season, groupType } = preferences;
    let prompt = `Provide travel recommendations based on preferences and return a JSON array of 5-8 destinations. `;
    
    if (budget) prompt += `Budget: ${budget}. `;
    if (duration) prompt += `Duration: ${duration}. `;
    if (interests) prompt += `Interests: ${interests}. `;
    if (season) prompt += `Season: ${season}. `;
    if (groupType) prompt += `Group type: ${groupType}. `;
    
    prompt += `Each destination must have: name, country, region, description (<=150 chars), bestTimeToVisit (string), avgDailyCost (USD), highlights (array of 3-5 attractions), whyRecommended (<=100 chars), imageUrl (placeholder URL).`;
    
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ 
            parts: [{ text: prompt }] 
          }] 
        }),
      });
      
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return JSON.parse(text);
    } catch (error) {
      console.error('Travel recommendations error:', error);
      return [];
    }
  },

  // Legacy method for backward compatibility
  getTopPlaces: async (cityQuery) => {
    return this.discoverActivities(cityQuery);
  },
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 