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
  getCommunityUsers: () => api.get('/users/community'),
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
    if (!apiKey) {
      console.warn('Missing REACT_APP_GEMINI_API_KEY, using fallback data');
      return getFallbackCities(query);
    }
    
    const { country, region, costRange, popularity } = filters;
    let prompt = `Search for cities matching "${query}" and return a JSON array of 8-12 cities. `;
    
    if (country) prompt += `Focus on ${country}. `;
    if (region) prompt += `Include cities from ${region} region. `;
    if (costRange) prompt += `Consider ${costRange} cost range. `;
    if (popularity) prompt += `Include ${popularity} popularity level cities. `;
    
    prompt += `Each city must have: name, country, region, costIndex (1-10, 1=very cheap, 10=very expensive), popularity (1-10, 1=hidden gem, 10=very popular), description (<=150 chars), bestTimeToVisit (string), avgDailyCost (number in USD), climate (string), highlights (array of 3-5 attractions), imageUrl (placeholder URL).`;
    
    try {
      console.log('🔍 Searching for cities with query:', query);
      
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ 
            parts: [{ text: prompt }] 
          }] 
        }),
      });
      
      if (resp.status === 429) {
        console.warn('Gemini API rate limited, using fallback data');
        const fallbackData = getFallbackCities(query);
        console.log('📊 Returning fallback data:', fallbackData);
        return fallbackData;
      }
      
      if (!resp.ok) {
        throw new Error(`API responded with status: ${resp.status}`);
      }
      
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const parsedResults = JSON.parse(text);
      
      console.log('✅ API returned results:', parsedResults);
      return parsedResults;
    } catch (error) {
      console.error('City search error:', error);
      console.warn('Using fallback data due to API error');
      const fallbackData = getFallbackCities(query);
      console.log('📊 Returning fallback data due to error:', fallbackData);
      return fallbackData;
    }
  },

  // Get popular cities for recommendations
  getPopularCities: async (limit = 10, category = 'general') => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Missing REACT_APP_GEMINI_API_KEY, using fallback data');
      return getFallbackPopularCities(limit, category);
    }
    
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
      
      if (resp.status === 429) {
        console.warn('Gemini API rate limited, using fallback data');
        return getFallbackPopularCities(limit, category);
      }
      
      if (!resp.ok) {
        throw new Error(`API responded with status: ${resp.status}`);
      }
      
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return JSON.parse(text);
    } catch (error) {
      console.error('Popular cities error:', error);
      console.warn('Using fallback data due to API error');
      return getFallbackPopularCities(limit, category);
    }
  },

  // Discover activities for a specific city
  discoverActivities: async (cityName, filters = {}) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Missing REACT_APP_GEMINI_API_KEY, using fallback data');
      return getFallbackActivities(cityName, filters);
    }
    
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
      
      if (resp.status === 429) {
        console.warn('Gemini API rate limited, using fallback data');
        return getFallbackActivities(cityName, filters);
      }
      
      if (!resp.ok) {
        throw new Error(`API responded with status: ${resp.status}`);
      }
      
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return JSON.parse(text);
    } catch (error) {
      console.error('Activity discovery error:', error);
      console.warn('Using fallback data due to API error');
      return getFallbackActivities(cityName, filters);
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

// Fallback data functions
const getFallbackCities = (query) => {
  const queryLower = query.toLowerCase();
  
  console.log('🔍 Using fallback data for query:', query);
  
  // India-specific fallback data
  if (queryLower.includes('delhi') || queryLower.includes('india')) {
    const delhiCities = [
      {
        name: 'Delhi',
        country: 'India',
        region: 'North India',
        costIndex: 4,
        popularity: 9,
        description: 'Historic capital with rich culture, monuments, and vibrant street life',
        bestTimeToVisit: 'October to March',
        avgDailyCost: 45,
        climate: 'Tropical',
        highlights: ['Red Fort', 'Taj Mahal', 'Qutub Minar', 'India Gate', 'Humayun\'s Tomb'],
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      },
      {
        name: 'Mumbai',
        country: 'India',
        region: 'West India',
        costIndex: 6,
        popularity: 8,
        description: 'Financial capital with beaches, Bollywood, and colonial architecture',
        bestTimeToVisit: 'November to February',
        avgDailyCost: 55,
        climate: 'Tropical',
        highlights: ['Gateway of India', 'Marine Drive', 'Juhu Beach', 'Elephanta Caves', 'Colaba Causeway'],
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      },
      {
        name: 'Jaipur',
        country: 'India',
        region: 'Rajasthan',
        costIndex: 3,
        popularity: 7,
        description: 'Pink City known for palaces, forts, and traditional handicrafts',
        bestTimeToVisit: 'October to March',
        avgDailyCost: 35,
        climate: 'Desert',
        highlights: ['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Nahargarh Fort'],
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      }
    ];
    
    console.log('🇮🇳 Returning India fallback cities:', delhiCities);
    return delhiCities;
  }
  
  // Generic fallback data
  const genericCities = [
    {
      name: 'Paris',
      country: 'France',
      region: 'Île-de-France',
      costIndex: 8,
      popularity: 10,
      description: 'City of Light with iconic landmarks, art, and romantic atmosphere',
      bestTimeToVisit: 'April to October',
      avgDailyCost: 120,
      climate: 'Temperate',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Arc de Triomphe', 'Champs-Élysées'],
      imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Kanto',
      costIndex: 9,
      popularity: 9,
      description: 'Modern metropolis blending technology with traditional culture',
      bestTimeToVisit: 'March to May and September to November',
      avgDailyCost: 150,
      climate: 'Temperate',
      highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Skytree', 'Tsukiji Market', 'Meiji Shrine'],
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    }
  ];
  
  console.log('🌍 Returning generic fallback cities:', genericCities);
  return genericCities;
};

const getFallbackPopularCities = (limit, category) => {
  const cities = [
    {
      name: 'Bali',
      country: 'Indonesia',
      region: 'Lesser Sunda Islands',
      costIndex: 4,
      popularity: 9,
      description: 'Tropical paradise with beaches, temples, and spiritual retreats',
      bestTimeToVisit: 'April to October',
      avgDailyCost: 50,
      climate: 'Tropical',
      highlights: ['Ubud Sacred Monkey Forest', 'Tanah Lot Temple', 'Rice Terraces', 'Beach Clubs', 'Volcano Tours'],
      imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      whyVisit: 'Perfect blend of culture, nature, and relaxation'
    },
    {
      name: 'Santorini',
      country: 'Greece',
      region: 'Cyclades',
      costIndex: 7,
      popularity: 9,
      description: 'Stunning volcanic island with white architecture and blue domes',
      bestTimeToVisit: 'June to September',
      avgDailyCost: 100,
      climate: 'Mediterranean',
      highlights: ['Oia Sunset Views', 'Fira Town', 'Red Beach', 'Wine Tours', 'Caldera Cruises'],
      imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      whyVisit: 'Iconic Greek island with breathtaking views and romantic atmosphere'
    }
  ];
  
  return cities.slice(0, limit);
};

const getFallbackActivities = (cityName, filters) => {
  const cityLower = cityName.toLowerCase();
  
  // Delhi-specific activities
  if (cityLower.includes('delhi')) {
    return [
      {
        title: 'Visit Red Fort',
        description: 'Explore the magnificent 17th-century Mughal fort, a UNESCO World Heritage site',
        type: 'sightseeing',
        cost: 15,
        duration: 180,
        rating: 4.8,
        location: 'Old Delhi',
        bestTime: 'Early morning to avoid crowds',
        highlights: ['Historical significance', 'Beautiful architecture', 'Museum exhibits'],
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        difficulty: 'easy',
        groupSize: 'family'
      },
      {
        title: 'Explore Chandni Chowk',
        description: 'Experience the bustling old market with street food, shopping, and cultural heritage',
        type: 'food',
        cost: 25,
        duration: 240,
        rating: 4.6,
        location: 'Old Delhi',
        bestTime: 'Morning for shopping, evening for food',
        highlights: ['Street food paradise', 'Traditional shopping', 'Cultural experience'],
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        difficulty: 'medium',
        groupSize: 'group'
      },
      {
        title: 'Qutub Minar Complex',
        description: 'Marvel at the tallest brick minaret in the world and surrounding historical monuments',
        type: 'culture',
        cost: 10,
        duration: 120,
        rating: 4.7,
        location: 'Mehrauli',
        bestTime: 'Sunrise or sunset for best photos',
        highlights: ['UNESCO site', 'Ancient architecture', 'Historical importance'],
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        difficulty: 'easy',
        groupSize: 'couple'
      },
      {
        title: 'Humayun\'s Tomb',
        description: 'Visit the stunning Mughal tomb that inspired the Taj Mahal design',
        type: 'sightseeing',
        cost: 8,
        duration: 90,
        rating: 4.5,
        location: 'Nizamuddin',
        bestTime: 'Early morning for peaceful experience',
        highlights: ['Beautiful gardens', 'Architectural marvel', 'Less crowded'],
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        difficulty: 'easy',
        groupSize: 'family'
      },
      {
        title: 'India Gate & Rajpath',
        description: 'Walk along the ceremonial boulevard and visit the war memorial',
        type: 'sightseeing',
        cost: 0,
        duration: 60,
        rating: 4.3,
        location: 'Central Delhi',
        bestTime: 'Evening for cooler weather and lighting',
        highlights: ['Free attraction', 'Historical significance', 'Great for photos'],
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        difficulty: 'easy',
        groupSize: 'solo'
      }
    ];
  }
  
  // Generic fallback activities
  return [
    {
      title: 'City Walking Tour',
      description: 'Explore the city on foot with a knowledgeable local guide',
      type: 'sightseeing',
      cost: 30,
      duration: 180,
      rating: 4.5,
      location: 'City Center',
      bestTime: 'Morning or late afternoon',
      highlights: ['Local insights', 'Hidden gems', 'Historical context'],
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      difficulty: 'easy',
      groupSize: 'group'
    },
    {
      title: 'Local Food Experience',
      description: 'Taste authentic local cuisine at popular restaurants and street vendors',
      type: 'food',
      cost: 40,
      duration: 120,
      rating: 4.7,
      location: 'Various locations',
      bestTime: 'Lunch or dinner time',
      highlights: ['Authentic flavors', 'Cultural experience', 'Local recommendations'],
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      difficulty: 'easy',
      groupSize: 'couple'
    }
  ];
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 