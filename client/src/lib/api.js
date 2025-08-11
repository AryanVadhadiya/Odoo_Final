import axios from 'axios';

/**
 * API client configuration for GlobeTrotter
 * Configured with Axios and JWT interceptors
 */

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // TODO: Implement refresh token logic when backend is ready
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await axios.post('/auth/refresh', { refreshToken });
        // localStorage.setItem('accessToken', response.data.accessToken);
        // originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        // return api(originalRequest);
        
        // For now, just redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API endpoints
 */
export const authAPI = {
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Logout user
  logout: () => api.post('/auth/logout'),
  
  // Refresh access token
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  
  // Get current user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

/**
 * Trips API endpoints
 */
export const tripsAPI = {
  // Get all trips for current user
  getTrips: (params = {}) => api.get('/trips', { params }),
  
  // Get single trip by ID
  getTrip: (tripId) => api.get(`/trips/${tripId}`),
  
  // Create new trip
  createTrip: (tripData) => api.post('/trips', tripData),
  
  // Update existing trip
  updateTrip: (tripId, tripData) => api.put(`/trips/${tripId}`, tripData),
  
  // Delete trip
  deleteTrip: (tripId) => api.delete(`/trips/${tripId}`),
  
  // Get trip itinerary
  getItinerary: (tripId) => api.get(`/trips/${tripId}/itinerary`),
  
  // Update trip itinerary
  updateItinerary: (tripId, itineraryData) => api.put(`/trips/${tripId}/itinerary`, itineraryData),
  
  // Share trip (make public)
  shareTrip: (tripId) => api.post(`/trips/${tripId}/share`),
  
  // Get public trip
  getPublicTrip: (shareId) => api.get(`/trips/public/${shareId}`),
  
  // Copy trip
  copyTrip: (tripId) => api.post(`/trips/${tripId}/copy`),
};

/**
 * Cities API endpoints
 */
export const citiesAPI = {
  // Search cities
  searchCities: (query, params = {}) => api.get('/cities/search', { 
    params: { q: query, ...params } 
  }),
  
  // Get city details
  getCity: (cityId) => api.get(`/cities/${cityId}`),
  
  // Get popular cities
  getPopularCities: (limit = 10) => api.get('/cities/popular', { params: { limit } }),
  
  // Get cities by country
  getCitiesByCountry: (countryCode) => api.get(`/cities/country/${countryCode}`),
  
  // Get city cost index
  getCityCostIndex: (cityId) => api.get(`/cities/${cityId}/cost-index`),
};

/**
 * Activities API endpoints
 */
export const activitiesAPI = {
  // Search activities
  searchActivities: (params = {}) => api.get('/activities/search', { params }),
  
  // Get activity details
  getActivity: (activityId) => api.get(`/activities/${activityId}`),
  
  // Get activities by city
  getActivitiesByCity: (cityId, params = {}) => api.get(`/activities/city/${cityId}`, { params }),
  
  // Get activities by category
  getActivitiesByCategory: (category, params = {}) => api.get(`/activities/category/${category}`, { params }),
  
  // Get popular activities
  getPopularActivities: (limit = 10) => api.get('/activities/popular', { params: { limit } }),
  
  // Add activity to trip
  addActivityToTrip: (tripId, activityData) => api.post(`/trips/${tripId}/activities`, activityData),
  
  // Remove activity from trip
  removeActivityFromTrip: (tripId, activityId) => api.delete(`/trips/${tripId}/activities/${activityId}`),
  
  // Update activity in trip
  updateActivityInTrip: (tripId, activityId, activityData) => api.put(`/trips/${tripId}/activities/${activityId}`, activityData),
};

/**
 * Budget API endpoints
 */
export const budgetAPI = {
  // Get trip budget
  getTripBudget: (tripId) => api.get(`/trips/${tripId}/budget`),
  
  // Update trip budget
  updateTripBudget: (tripId, budgetData) => api.put(`/trips/${tripId}/budget`, budgetData),
  
  // Get budget breakdown by category
  getBudgetBreakdown: (tripId) => api.get(`/trips/${tripId}/budget/breakdown`),
  
  // Get budget alerts
  getBudgetAlerts: (tripId) => api.get(`/trips/${tripId}/budget/alerts`),
  
  // Get cost estimates
  getCostEstimates: (cityId, duration) => api.get('/budget/estimates', { 
    params: { cityId, duration } 
  }),
};

/**
 * User preferences and settings
 */
export const userAPI = {
  // Get user preferences
  getPreferences: () => api.get('/user/preferences'),
  
  // Update user preferences
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),
  
  // Get saved destinations
  getSavedDestinations: () => api.get('/user/saved-destinations'),
  
  // Save destination
  saveDestination: (destinationData) => api.post('/user/saved-destinations', destinationData),
  
  // Remove saved destination
  removeSavedDestination: (destinationId) => api.delete(`/user/saved-destinations/${destinationId}`),
  
  // Change password
  changePassword: (passwordData) => api.put('/user/change-password', passwordData),
  
  // Delete account
  deleteAccount: () => api.delete('/user/account'),
};

/**
 * Analytics and reporting (admin only)
 */
export const analyticsAPI = {
  // Get user statistics
  getUserStats: (params = {}) => api.get('/analytics/users', { params }),
  
  // Get trip statistics
  getTripStats: (params = {}) => api.get('/analytics/trips', { params }),
  
  // Get popular destinations
  getPopularDestinations: (params = {}) => api.get('/analytics/destinations', { params }),
  
  // Get revenue statistics
  getRevenueStats: (params = {}) => api.get('/analytics/revenue', { params }),
  
  // Export data
  exportData: (type, params = {}) => api.get(`/analytics/export/${type}`, { 
    params,
    responseType: 'blob'
  }),
};

/**
 * File upload API
 */
export const uploadAPI = {
  // Upload trip cover image
  uploadTripCover: (tripId, file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return api.post(`/trips/${tripId}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Upload user profile picture
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('picture', file);
    return api.post('/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Upload activity images
  uploadActivityImages: (activityId, files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    return api.post(`/activities/${activityId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

/**
 * Utility functions
 */
export const apiUtils = {
  // Check if response has error
  hasError: (response) => response?.data?.error || response?.status >= 400,
  
  // Get error message from response
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    return error.message || 'An unexpected error occurred';
  },
  
  // Handle API errors
  handleError: (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    return {
      error: true,
      message: apiUtils.getErrorMessage(error) || defaultMessage,
      status: error.response?.status,
    };
  },
  
  // Create query string from object
  createQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
};

// Export the main api instance
export default api; 