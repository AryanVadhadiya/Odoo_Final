import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
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

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // TODO: Implement refresh token logic when backend is ready
      // const refreshToken = localStorage.getItem('refreshToken');
      // if (refreshToken) {
      //   try {
      //     const response = await api.post('/auth/refresh', { refreshToken });
      //     localStorage.setItem('accessToken', response.data.accessToken);
      //     return api(originalRequest);
      //   } catch (refreshError) {
      //     // Redirect to login
      //     localStorage.removeItem('accessToken');
      //     localStorage.removeItem('refreshToken');
      //     window.location.href = '/login';
      //   }
      // }

      // For now, just redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => {
    const token = localStorage.getItem('accessToken');
    return api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Trips API functions
export const tripsAPI = {
  getTrips: (params) => api.get('/trips', { params }),
  getTrip: (id) => api.get(`/trips/${id}`),
  createTrip: (tripData) => api.post('/trips', tripData),
  updateTrip: (id, tripData) => api.put(`/trips/${id}`, tripData),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  getTripItinerary: (id) => api.get(`/trips/${id}/itinerary`),
  updateTripItinerary: (id, itineraryData) => api.put(`/trips/${id}/itinerary`, itineraryData),
  shareTrip: (id, shareData) => api.post(`/trips/${id}/share`, shareData),
  getPublicTrip: (shareId) => api.get(`/trips/public/${shareId}`),
};

// Cities API functions
export const citiesAPI = {
  searchCities: (query, filters) => api.get('/cities/search', { params: { query, ...filters } }),
  getCity: (id) => api.get(`/cities/${id}`),
  getPopularCities: () => api.get('/cities/popular'),
  getCitiesByCountry: (countryCode) => api.get(`/cities/country/${countryCode}`),
};

// Activities API functions
export const activitiesAPI = {
  searchActivities: (filters) => api.get('/activities/search', { params: filters }),
  getActivity: (id) => api.get(`/activities/${id}`),
  getActivitiesByCity: (cityId) => api.get(`/activities/city/${cityId}`),
  getActivityTypes: () => api.get('/activities/types'),
};

// Budget API functions
export const budgetAPI = {
  getTripBudget: (tripId) => api.get(`/budget/trip/${tripId}`),
  updateTripBudget: (tripId, budgetData) => api.put(`/budget/trip/${tripId}`, budgetData),
  getBudgetBreakdown: (tripId) => api.get(`/budget/trip/${tripId}/breakdown`),
  addExpense: (tripId, expenseData) => api.post(`/budget/trip/${tripId}/expenses`, expenseData),
  updateExpense: (tripId, expenseId, expenseData) => api.put(`/budget/trip/${tripId}/expenses/${expenseId}`, expenseData),
  deleteExpense: (tripId, expenseId) => api.delete(`/budget/trip/${tripId}/expenses/${expenseId}`),
};

// User API functions
export const userAPI = {
  getSavedDestinations: () => api.get('/user/saved-destinations'),
  addSavedDestination: (destinationData) => api.post('/user/saved-destinations', destinationData),
  removeSavedDestination: (id) => api.delete(`/user/saved-destinations/${id}`),
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),
  getNotifications: () => api.get('/user/notifications'),
  markNotificationRead: (id) => api.put(`/user/notifications/${id}/read`),
};

// Admin API functions (optional)
export const adminAPI = {
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemStats: () => api.get('/admin/system-stats'),
};

// Export the main api instance for custom requests
export default api;
