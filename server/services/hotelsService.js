const axios = require('axios');
const HotelsCache = require('../models/HotelsCache');
const { sendErrorResponse } = require('../utils/response');

/**
 * Hotels service for provider-agnostic hotel search
 * Supports multiple providers: Amadeus, Booking.com, Google Places
 */

class HotelsService {
  constructor() {
    this.provider = process.env.HOTELS_API_PROVIDER || 'amadeus';
    this.apiKey = process.env.HOTELS_API_KEY;
    this.apiSecret = process.env.HOTELS_API_SECRET;

    // Provider configurations
    this.providers = {
      amadeus: {
        baseUrl: 'https://test.api.amadeus.com/v1',
        authUrl: 'https://test.api.amadeus.com/v1/security/oauth2/token',
        endpoints: {
          search: '/reference-data/locations/hotels/by-city',
          offers: '/shopping/hotel-offers',
        },
      },
      booking: {
        baseUrl: 'https://booking-com.p.rapidapi.com/v1',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
        },
        endpoints: {
          search: '/hotels/search',
          details: '/hotels/get-details',
        },
      },
      google: {
        baseUrl: 'https://maps.googleapis.com/maps/api',
        endpoints: {
          places: '/place/nearbysearch/json',
          details: '/place/details/json',
        },
      },
    };
  }

  /**
   * Search for hotels with pagination
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.cityId - City ID
   * @param {number} searchParams.lat - Latitude
   * @param {number} searchParams.lng - Longitude
   * @param {Date} searchParams.checkin - Check-in date
   * @param {Date} searchParams.checkout - Check-out date
   * @param {number} searchParams.guests - Number of guests
   * @param {string} searchParams.sort - Sort order (price, rating, distance)
   * @param {number} searchParams.page - Page number
   * @param {number} searchParams.limit - Items per page
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchHotels(searchParams) {
    try {
      const {
        cityId,
        lat,
        lng,
        checkin,
        checkout,
        guests = 2,
        sort = 'price',
        page = 1,
        limit = 20,
      } = searchParams;

      // Check cache first
      const cachedResults = await HotelsCache.findCached(searchParams);
      if (cachedResults) {
        console.log('Hotel search cache hit');
        return this.formatSearchResults(cachedResults.hotels, page, limit, cachedResults.totalResults);
      }

      // Search from provider
      const providerResults = await this.searchFromProvider(searchParams);

      // Cache results
      await HotelsCache.cacheResults(searchParams, providerResults.hotels, this.provider, 1);

      return this.formatSearchResults(providerResults.hotels, page, limit, providerResults.total);
    } catch (error) {
      console.error('Hotel search error:', error);
      throw new Error(`Hotel search failed: ${error.message}`);
    }
  }

  /**
   * Find nearest hotels to a location
   * @param {Object} searchParams - Search parameters
   * @param {number} searchParams.lat - Latitude
   * @param {number} searchParams.lng - Longitude
   * @param {number} searchParams.radiusMeters - Search radius in meters
   * @param {Date} searchParams.checkin - Check-in date
   * @param {Date} searchParams.checkout - Check-out date
   * @param {number} searchParams.guests - Number of guests
   * @param {number} searchParams.limit - Maximum number of results
   * @returns {Promise<Object>} Nearest hotels with distance and scoring
   */
  async findNearestHotels(searchParams) {
    try {
      const {
        lat,
        lng,
        radiusMeters = 5000,
        checkin,
        checkout,
        guests = 2,
        limit = 20,
      } = searchParams;

      // Check cache first
      const cacheKey = { ...searchParams, type: 'nearest' };
      const cachedResults = await HotelsCache.findCached(cacheKey);
      if (cachedResults) {
        console.log('Nearest hotels cache hit');
        return this.formatNearestResults(cachedResults.hotels, lat, lng);
      }

      // Search from provider
      const providerResults = await this.searchFromProvider({
        ...searchParams,
        radius: radiusMeters,
        sort: 'distance',
      });

      // Calculate distances and scores
      const hotelsWithScores = this.calculateHotelScores(providerResults.hotels, lat, lng);

      // Sort by combined score (price + rating + distance)
      const sortedHotels = hotelsWithScores.sort((a, b) => b.combinedScore - a.combinedScore);

      // Limit results
      const limitedHotels = sortedHotels.slice(0, limit);

      // Cache results
      await HotelsCache.cacheResults(cacheKey, limitedHotels, this.provider, 1);

      return this.formatNearestResults(limitedHotels, lat, lng);
    } catch (error) {
      console.error('Nearest hotels search error:', error);
      throw new Error(`Nearest hotels search failed: ${error.message}`);
    }
  }

  /**
   * Search hotels from the configured provider
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Provider search results
   */
  async searchFromProvider(searchParams) {
    try {
      switch (this.provider) {
        case 'amadeus':
          return await this.searchAmadeus(searchParams);
        case 'booking':
          return await this.searchBooking(searchParams);
        case 'google':
          return await this.searchGoogle(searchParams);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`Provider search error (${this.provider}):`, error);

      // Fallback to mock data if provider fails
      console.log('Falling back to mock data');
      return this.getMockHotelData(searchParams);
    }
  }

  /**
   * Search hotels using Amadeus API
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Amadeus search results
   */
  async searchAmadeus(searchParams) {
    try {
      // TODO: Implement Amadeus API call here
      // Example implementation:
      /*
      const authToken = await this.getAmadeusAuthToken();

      const response = await axios.get(`${this.providers.amadeus.baseUrl}${this.providers.amadeus.endpoints.offers}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        params: {
          cityCode: searchParams.cityId,
          checkInDate: searchParams.checkin,
          checkOutDate: searchParams.checkout,
          adults: searchParams.guests,
          radius: searchParams.radius || 5,
          radiusUnit: 'KM',
          includeClosed: false,
          bestRateOnly: true,
          view: 'FULL',
        },
      });

      return this.normalizeAmadeusResults(response.data);
      */

      // Placeholder implementation
      throw new Error('Amadeus API not implemented - add your API key and implement the call');
    } catch (error) {
      throw new Error(`Amadeus search failed: ${error.message}`);
    }
  }

  /**
   * Search hotels using Booking.com API
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Booking.com search results
   */
  async searchBooking(searchParams) {
    try {
      // TODO: Implement Booking.com API call here
      // Example implementation:
      /*
      const response = await axios.get(`${this.providers.booking.baseUrl}${this.providers.booking.endpoints.search}`, {
        headers: this.providers.booking.headers,
        params: {
          dest_id: searchParams.cityId,
          search_type: 'city',
          arrival_date: searchParams.checkin,
          departure_date: searchParams.checkout,
          adults: searchParams.guests,
          children: 0,
          room_number: 1,
          page_number: searchParams.page || 0,
          units: 'metric',
          currency: 'USD',
          locale: 'en-us',
        },
      });

      return this.normalizeBookingResults(response.data);
      */

      // Placeholder implementation
      throw new Error('Booking.com API not implemented - add your API key and implement the call');
    } catch (error) {
      throw new Error(`Booking.com search failed: ${error.message}`);
    }
  }

  /**
   * Search hotels using Google Places API
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Google Places search results
   */
  async searchGoogle(searchParams) {
    try {
      // TODO: Implement Google Places API call here
      // Example implementation:
      /*
      const response = await axios.get(`${this.providers.google.baseUrl}${this.providers.google.endpoints.places}`, {
        params: {
          location: `${searchParams.lat},${searchParams.lng}`,
          radius: searchParams.radius || 5000,
          type: 'lodging',
          key: this.apiKey,
        },
      });

      return this.normalizeGoogleResults(response.data);
      */

      // Placeholder implementation
      throw new Error('Google Places API not implemented - add your API key and implement the call');
    } catch (error) {
      throw new Error(`Google Places search failed: ${error.message}`);
    }
  }

  /**
   * Get mock hotel data for development/testing
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Mock hotel data
   */
  async getMockHotelData(searchParams) {
    // Generate mock hotels around the specified location
    const mockHotels = [];
    const baseLat = searchParams.lat || 40.7128;
    const baseLng = searchParams.lng || -74.0060;

    const hotelNames = [
      'Grand Plaza Hotel',
      'Seaside Resort & Spa',
      'Downtown Business Inn',
      'Mountain View Lodge',
      'Riverside Hotel',
      'City Center Suites',
      'Harbor View Hotel',
      'Garden Court Inn',
      'Executive Plaza',
      'Heritage Hotel',
    ];

    for (let i = 0; i < 20; i++) {
      const lat = baseLat + (Math.random() - 0.5) * 0.01;
      const lng = baseLng + (Math.random() - 0.5) * 0.01;

      mockHotels.push({
        id: `mock_${i + 1}`,
        name: hotelNames[i % hotelNames.length],
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
        price: {
          amount: Math.floor(Math.random() * 200 + 50), // $50 - $250
          currency: 'USD',
        },
        distanceMeters: Math.floor(Math.random() * 5000), // 0 - 5km
        location: { lat, lng },
        address: {
          street: `${Math.floor(Math.random() * 9999)} Main St`,
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
          formatted: `${Math.floor(Math.random() * 9999)} Main St, New York, NY 10001`,
        },
        amenities: this.getRandomAmenities(),
        photos: this.getMockPhotos(),
        bookingUrl: `https://example.com/book/${i + 1}`,
        source: 'mock',
        externalId: `mock_${i + 1}`,
      });
    }

    return {
      hotels: mockHotels,
      total: mockHotels.length,
      hasMore: false,
    };
  }

  /**
   * Get random amenities for mock hotels
   * @returns {Array} Array of amenities
   */
  getRandomAmenities() {
    const allAmenities = [
      'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service',
      'Free Breakfast', 'Parking', 'Airport Shuttle', 'Business Center',
      'Concierge', 'Laundry', 'Pet Friendly', 'Accessibility',
    ];

    const numAmenities = Math.floor(Math.random() * 8) + 3; // 3-10 amenities
    const shuffled = allAmenities.sort(() => 0.5 - Math.random());

    return shuffled.slice(0, numAmenities);
  }

  /**
   * Get mock photos for mock hotels
   * @returns {Array} Array of photo objects
   */
  getMockPhotos() {
    const photoUrls = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    ];

    return photoUrls.map((url, index) => ({
      url,
      caption: `Hotel room ${index + 1}`,
      width: 800,
      height: 600,
    }));
  }

  /**
   * Calculate hotel scores for nearest hotel ranking
   * @param {Array} hotels - Array of hotels
   * @param {number} lat - Reference latitude
   * @param {number} lng - Reference longitude
   * @returns {Array} Hotels with calculated scores
   */
  calculateHotelScores(hotels, lat, lng) {
    return hotels.map(hotel => {
      // Calculate distance if not provided
      let distance = hotel.distanceMeters;
      if (!distance && hotel.location) {
        distance = this.calculateHaversineDistance(
          lat, lng,
          hotel.location.lat, hotel.location.lng
        );
      }

      // Normalize values for scoring (0-1 scale)
      const priceScore = Math.max(0, 1 - (hotel.price.amount - 50) / 200); // $50 = 1, $250 = 0
      const ratingScore = (hotel.rating - 1) / 4; // 1 = 0, 5 = 1
      const distanceScore = Math.max(0, 1 - distance / 5000); // 0m = 1, 5km = 0

      // Combined score (weighted average)
      const combinedScore = (priceScore * 0.4 + ratingScore * 0.4 + distanceScore * 0.2);

      return {
        ...hotel,
        distanceMeters: distance,
        scores: {
          price: priceScore,
          rating: ratingScore,
          distance: distanceScore,
          combined: combinedScore,
        },
        combinedScore,
      };
    });
  }

  /**
   * Calculate Haversine distance between two points
   * @param {number} lat1 - Latitude 1
   * @param {number} lng1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lng2 - Longitude 2
   * @returns {number} Distance in meters
   */
  calculateHaversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format search results with pagination
   * @param {Array} hotels - Array of hotels
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   * @returns {Object} Formatted search results
   */
  formatSearchResults(hotels, page, limit, total) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHotels = hotels.slice(startIndex, endIndex);

    return {
      hotels: paginatedHotels,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || hotels.length,
        totalPages: total ? Math.ceil(total / limit) : Math.ceil(hotels.length / limit),
        hasNextPage: endIndex < (total || hotels.length),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Format nearest hotel results
   * @param {Array} hotels - Array of hotels with scores
   * @param {number} lat - Reference latitude
   * @param {number} lng - Reference longitude
   * @returns {Object} Formatted nearest hotel results
   */
  formatNearestResults(hotels, lat, lng) {
    return {
      hotels: hotels.map(hotel => ({
        ...hotel,
        distance: {
          meters: hotel.distanceMeters,
          kilometers: (hotel.distanceMeters / 1000).toFixed(2),
          miles: (hotel.distanceMeters / 1609.34).toFixed(2),
        },
      })),
      referencePoint: { lat, lng },
      searchRadius: Math.max(...hotels.map(h => h.distanceMeters)),
    };
  }

  /**
   * Get hotel details by ID
   * @param {string} hotelId - Hotel ID
   * @param {string} provider - Provider name
   * @returns {Promise<Object>} Hotel details
   */
  async getHotelDetails(hotelId, provider = null) {
    try {
      const targetProvider = provider || this.provider;

      // TODO: Implement provider-specific hotel details API calls
      // This would fetch detailed information like room types, availability, etc.

      throw new Error(`Hotel details not implemented for provider: ${targetProvider}`);
    } catch (error) {
      throw new Error(`Failed to get hotel details: ${error.message}`);
    }
  }

  /**
   * Clean expired cache entries
   * @returns {Promise<Object>} Cleanup result
   */
  async cleanExpiredCache() {
    try {
      const result = await HotelsCache.cleanExpired();
      console.log(`Cleaned ${result.deletedCount} expired hotel cache entries`);
      return result;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getCacheStats() {
    try {
      const stats = await HotelsCache.getStats();
      return stats[0] || {
        totalEntries: 0,
        totalHotels: 0,
        avgAccessCount: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      throw error;
    }
  }
}

module.exports = new HotelsService();
