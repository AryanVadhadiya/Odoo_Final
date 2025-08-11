const axios = require('axios');
const { sendErrorResponse } = require('../utils/response');

/**
 * Google Gemini AI service for travel planning
 * Provides city overviews, cost estimation, and paginated suggestions
 */

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.endpoint = process.env.GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.model = 'gemini-pro';

    // Cache for LLM responses to avoid repeated calls
    this.responseCache = new Map();
    this.cacheTTL = parseInt(process.env.CACHE_TTL_LLM) || 86400; // 24 hours
  }

  /**
   * Generate city overview with AI insights
   * @param {Object} cityData - City information
   * @param {string} cityData.name - City name
   * @param {string} cityData.country - Country name
   * @param {string} cityData.description - Basic city description
   * @param {Object} cityData.coordinates - City coordinates
   * @param {Object} travelContext - Travel context
   * @param {string} travelContext.season - Travel season
   * @param {string} travelContext.budget - Budget range
   * @param {string} travelContext.duration - Trip duration
   * @param {Array} travelContext.interests - Travel interests
   * @returns {Promise<Object>} AI-generated city overview
   */
  async generateCityOverview(cityData, travelContext = {}) {
    try {
      const cacheKey = `city_overview_${cityData.name}_${JSON.stringify(travelContext)}`;
      const cached = this.getCachedResponse(cacheKey);
      if (cached) return cached;

      const prompt = this.buildCityOverviewPrompt(cityData, travelContext);
      const response = await this.callGeminiAPI(prompt);

      const overview = this.parseCityOverviewResponse(response);

      // Cache the response
      this.cacheResponse(cacheKey, overview);

      return overview;
    } catch (error) {
      console.error('City overview generation error:', error);
      throw new Error(`Failed to generate city overview: ${error.message}`);
    }
  }

  /**
   * Generate paginated AI suggestions for places and activities
   * @param {Object} cityData - City information
   * @param {Object} travelContext - Travel context
   * @param {Object} pagination - Pagination parameters
   * @param {number} pagination.page - Page number
   * @param {number} pagination.limit - Items per page
   * @param {string} pagination.mode - Generation mode (deterministic|creative)
   * @returns {Promise<Object>} Paginated AI suggestions
   */
  async generatePaginatedSuggestions(cityData, travelContext = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20, mode = 'deterministic' } = pagination;

      // Generate more items than requested to allow for pagination
      const maxItems = Math.max(limit * 3, 50); // At least 50 items for good pagination

      const cacheKey = `suggestions_${cityData.name}_${JSON.stringify(travelContext)}_${mode}_${maxItems}`;
      const cached = this.getCachedResponse(cacheKey);

      let suggestions;
      if (cached) {
        suggestions = cached;
      } else {
        const prompt = this.buildSuggestionsPrompt(cityData, travelContext, maxItems, mode);
        const response = await this.callGeminiAPI(prompt);
        suggestions = this.parseSuggestionsResponse(response);

        // Cache the full response
        this.cacheResponse(cacheKey, suggestions);
      }

      // Paginate the cached results
      return this.paginateSuggestions(suggestions, page, limit);
    } catch (error) {
      console.error('AI suggestions generation error:', error);
      throw new Error(`Failed to generate AI suggestions: ${error.message}`);
    }
  }

  /**
   * Estimate trip costs using AI
   * @param {Object} tripData - Trip information
   * @param {Array} tripData.stops - Trip stops
   * @param {Object} tripData.preferences - Travel preferences
   * @param {Object} tripData.budget - Budget constraints
   * @returns {Promise<Object>} AI cost estimation with breakdown
   */
  async estimateTripCosts(tripData) {
    try {
      const cacheKey = `cost_estimation_${JSON.stringify(tripData)}`;
      const cached = this.getCachedResponse(cacheKey);
      if (cached) return cached;

      const prompt = this.buildCostEstimationPrompt(tripData);
      const response = await this.callGeminiAPI(prompt);

      const estimation = this.parseCostEstimationResponse(response);

      // Cache the response
      this.cacheResponse(cacheKey, estimation);

      return estimation;
    } catch (error) {
      console.error('Cost estimation error:', error);
      throw new Error(`Failed to estimate trip costs: ${error.message}`);
    }
  }

  /**
   * Generate AI-powered travel recommendations
   * @param {Object} userProfile - User profile and preferences
   * @param {Object} tripContext - Trip context
   * @param {number} maxRecommendations - Maximum number of recommendations
   * @returns {Promise<Object>} AI travel recommendations
   */
  async generateTravelRecommendations(userProfile, tripContext, maxRecommendations = 20) {
    try {
      const cacheKey = `recommendations_${JSON.stringify(userProfile)}_${JSON.stringify(tripContext)}`;
      const cached = this.getCachedResponse(cacheKey);
      if (cached) return cached;

      const prompt = this.buildRecommendationsPrompt(userProfile, tripContext, maxRecommendations);
      const response = await this.callGeminiAPI(prompt);

      const recommendations = this.parseRecommendationsResponse(response);

      // Cache the response
      this.cacheResponse(cacheKey, recommendations);

      return recommendations;
    } catch (error) {
      console.error('Travel recommendations error:', error);
      throw new Error(`Failed to generate travel recommendations: ${error.message}`);
    }
  }

  /**
   * Build prompt for city overview generation
   * @param {Object} cityData - City information
   * @param {Object} travelContext - Travel context
   * @returns {string} Formatted prompt
   */
  buildCityOverviewPrompt(cityData, travelContext) {
    const { name, country, description, coordinates } = cityData;
    const { season, budget, duration, interests = [] } = travelContext;

    return `You are a knowledgeable travel expert. Provide a comprehensive overview of ${name}, ${country}.

City Information:
- Name: ${name}
- Country: ${country}
- Description: ${description || 'No description provided'}
- Coordinates: ${coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'Not specified'}

Travel Context:
- Season: ${season || 'Not specified'}
- Budget: ${budget || 'Not specified'}
- Duration: ${duration || 'Not specified'}
- Interests: ${interests.join(', ') || 'General travel'}

Please provide a structured response in the following JSON format:
{
  "overview": {
    "summary": "Brief city description",
    "highlights": ["Key attractions", "Cultural significance", "Unique features"],
    "bestTimeToVisit": "Optimal travel period",
    "weather": "Climate information",
    "culture": "Cultural aspects and local customs"
  },
  "attractions": {
    "mustSee": ["Top attractions", "Famous landmarks"],
    "hiddenGems": ["Lesser-known spots", "Local favorites"],
    "culturalSites": ["Museums", "Historical sites", "Religious places"]
  },
  "practicalInfo": {
    "language": "Primary languages",
    "currency": "Local currency",
    "transportation": "Getting around options",
    "safety": "Safety considerations",
    "costLevel": "Overall cost level (1-5 scale)"
  },
  "travelTips": {
    "seasonalAdvice": "Season-specific recommendations",
    "budgetTips": "Cost-saving suggestions",
    "localInsights": "Insider knowledge",
    "whatToPack": "Essential items to bring"
  }
}

Make the response informative, practical, and tailored to the travel context provided.`;
  }

  /**
   * Build prompt for AI suggestions generation
   * @param {Object} cityData - City information
   * @param {Object} travelContext - Travel context
   * @param {number} maxItems - Maximum number of items to generate
   * @param {string} mode - Generation mode
   * @returns {string} Formatted prompt
   */
  buildSuggestionsPrompt(cityData, travelContext, maxItems, mode) {
    const { name, country } = cityData;
    const { season, budget, duration, interests = [] } = travelContext;

    const modeDescription = mode === 'creative'
      ? 'Be creative and suggest unique, off-the-beaten-path experiences'
      : 'Focus on well-known, reliable recommendations';

    return `You are a travel expert specializing in ${name}, ${country}. Generate ${maxItems} diverse suggestions for places to visit and activities to do.

Travel Context:
- Season: ${season || 'Any season'}
- Budget: ${budget || 'Any budget'}
- Duration: ${duration || 'Any duration'}
- Interests: ${interests.join(', ') || 'General travel'}

Generation Mode: ${modeDescription}

Please provide a structured response in the following JSON format:
{
  "suggestions": [
    {
      "id": "unique_identifier",
      "title": "Place/Activity name",
      "category": "attraction|restaurant|shopping|entertainment|outdoor|cultural|other",
      "estimatedCost": {
        "amount": 25,
        "currency": "USD",
        "costType": "per_person|per_group|fixed"
      },
      "timeRequiredMinutes": 120,
      "shortDescription": "Brief description (2-3 sentences)",
      "longDescription": "Detailed description with tips and insights",
      "bestTimeToVisit": "Optimal time of day/season",
      "location": {
        "area": "Neighborhood or district",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "practicalInfo": {
        "openingHours": "Operating hours",
        "reservationRequired": false,
        "accessibility": "Accessibility information",
        "crowdLevel": "Typical crowd level (low|medium|high)"
      },
      "tags": ["tag1", "tag2", "tag3"],
      "isLLM": true,
      "source": "ai_generated",
      "confidence": 0.85
    }
  ]
}

Requirements:
1. Include a mix of different categories
2. Provide realistic cost estimates in USD
3. Include both popular and unique suggestions
4. Consider the travel context (season, budget, interests)
5. Make suggestions practical and actionable
6. Include location information when possible
7. Set confidence scores based on how well-known the suggestion is

Focus on quality over quantity. Each suggestion should be valuable and well-researched.`;
  }

  /**
   * Build prompt for cost estimation
   * @param {Object} tripData - Trip information
   * @returns {string} Formatted prompt
   */
  buildCostEstimationPrompt(tripData) {
    const { stops, preferences, budget } = tripData;

    const stopsInfo = stops.map(stop =>
      `- ${stop.cityName}: ${stop.arrivalDate} to ${stop.departureDate}`
    ).join('\n');

    return `You are a travel cost estimation expert. Analyze the following trip and provide a detailed cost breakdown.

Trip Information:
${stopsInfo}

Travel Preferences:
- Style: ${preferences.travelStyle || 'Not specified'}
- Pace: ${preferences.pace || 'Not specified'}
- Budget Range: ${budget?.min ? `$${budget.min}` : 'Not specified'} - ${budget?.max ? `$${budget.max}` : 'Not specified'}

Please provide a structured response in the following JSON format:
{
  "totalEstimate": {
    "amount": 2500,
    "currency": "USD",
    "confidence": 0.85,
    "range": {
      "low": 2000,
      "high": 3000
    }
  },
  "breakdown": {
    "accommodation": {
      "total": 800,
      "perNight": 100,
      "breakdown": [
        {
          "city": "City name",
          "nights": 3,
          "estimatedCost": 300,
          "notes": "Mid-range hotel"
        }
      ]
    },
    "transportation": {
      "total": 600,
      "breakdown": [
        {
          "type": "flight|train|bus|car|other",
          "from": "Origin",
          "to": "Destination",
          "estimatedCost": 200,
          "notes": "Economy class"
        }
      ]
    },
    "activities": {
      "total": 400,
      "breakdown": [
        {
          "name": "Activity name",
          "estimatedCost": 50,
          "perPerson": true,
          "notes": "Entry fee + guide"
        }
      ]
    },
    "food": {
      "total": 500,
      "perDay": 50,
      "notes": "Mix of restaurants and casual dining"
    },
    "other": {
      "total": 200,
      "breakdown": [
        {
          "category": "Shopping|Souvenirs|Insurance|Other",
          "estimatedCost": 100,
          "notes": "Description"
        }
      ]
    }
  },
  "costSavingTips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "budgetRiskFactors": [
    "Factor 1",
    "Factor 2"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}

Provide realistic estimates based on current market conditions. Consider the travel style and preferences when estimating costs.`;
  }

  /**
   * Build prompt for travel recommendations
   * @param {Object} userProfile - User profile
   * @param {Object} tripContext - Trip context
   * @param {number} maxRecommendations - Maximum recommendations
   * @returns {string} Formatted prompt
   */
  buildRecommendationsPrompt(userProfile, tripContext, maxRecommendations) {
    const { interests, travelStyle, budget, previousTrips } = userProfile;
    const { destination, duration, season } = tripContext;

    return `You are a personalized travel advisor. Based on the user's profile and trip context, generate ${maxRecommendations} personalized travel recommendations.

User Profile:
- Interests: ${interests.join(', ')}
- Travel Style: ${travelStyle}
- Budget: ${budget}
- Previous Trips: ${previousTrips?.join(', ') || 'None'}

Trip Context:
- Destination: ${destination}
- Duration: ${duration}
- Season: ${season}

Please provide a structured response in the following JSON format:
{
  "recommendations": [
    {
      "id": "unique_identifier",
      "type": "attraction|restaurant|activity|accommodation|transportation|other",
      "title": "Recommendation title",
      "description": "Why this is recommended for this user",
      "personalization": "How it matches user preferences",
      "estimatedCost": {
        "amount": 50,
        "currency": "USD"
      },
      "timeRequired": "Estimated time needed",
      "priority": "high|medium|low",
      "tags": ["tag1", "tag2"],
      "alternatives": [
        {
          "title": "Alternative option",
          "reason": "Why it's an alternative"
        }
      ]
    }
  ],
  "summary": {
    "theme": "Overall theme of recommendations",
    "budgetAlignment": "How well recommendations fit budget",
    "interestCoverage": "How well interests are covered"
  }
}

Make recommendations highly personalized based on the user's profile and preferences. Explain why each recommendation is suitable for this specific user.`;
  }

  /**
   * Call Gemini API with the given prompt
   * @param {string} prompt - Prompt to send to Gemini
   * @returns {Promise<Object>} API response
   */
  async callGeminiAPI(prompt) {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const requestData = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await axios.post(
        `${this.endpoint}?key=${this.apiKey}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (!response.data.candidates || !response.data.candidates[0]) {
        throw new Error('Invalid response from Gemini API');
      }

      const content = response.data.candidates[0].content;
      if (!content.parts || !content.parts[0]) {
        throw new Error('No content in Gemini response');
      }

      return content.parts[0].text;
    } catch (error) {
      console.error('Gemini API call error:', error);

      if (error.response) {
        throw new Error(`Gemini API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      }

      throw new Error(`Gemini API call failed: ${error.message}`);
    }
  }

  /**
   * Parse city overview response from Gemini
   * @param {string} response - Raw API response
   * @returns {Object} Parsed city overview
   */
  parseCityOverviewResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.overview || !parsed.attractions || !parsed.practicalInfo) {
        throw new Error('Invalid response structure');
      }

      return parsed;
    } catch (error) {
      console.error('City overview parsing error:', error);
      throw new Error(`Failed to parse city overview: ${error.message}`);
    }
  }

  /**
   * Parse suggestions response from Gemini
   * @param {string} response - Raw API response
   * @returns {Object} Parsed suggestions
   */
  parseSuggestionsResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error('Invalid suggestions structure');
      }

      // Add metadata to each suggestion
      const suggestionsWithMetadata = parsed.suggestions.map(suggestion => ({
        ...suggestion,
        isLLM: true,
        source: 'ai_generated',
        createdAt: new Date().toISOString(),
      }));

      return {
        suggestions: suggestionsWithMetadata,
        total: suggestionsWithMetadata.length,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Suggestions parsing error:', error);
      throw new Error(`Failed to parse suggestions: ${error.message}`);
    }
  }

  /**
   * Parse cost estimation response from Gemini
   * @param {string} response - Raw API response
   * @returns {Object} Parsed cost estimation
   */
  parseCostEstimationResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.totalEstimate || !parsed.breakdown) {
        throw new Error('Invalid cost estimation structure');
      }

      return parsed;
    } catch (error) {
      console.error('Cost estimation parsing error:', error);
      throw new Error(`Failed to parse cost estimation: ${error.message}`);
    }
  }

  /**
   * Parse recommendations response from Gemini
   * @param {string} response - Raw API response
   * @returns {Object} Parsed recommendations
   */
  parseRecommendationsResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid recommendations structure');
      }

      return parsed;
    } catch (error) {
      console.error('Recommendations parsing error:', error);
      throw new Error(`Failed to parse recommendations: ${error.message}`);
    }
  }

  /**
   * Paginate suggestions for frontend consumption
   * @param {Object} suggestions - Full suggestions object
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Paginated suggestions with metadata
   */
  paginateSuggestions(suggestions, page, limit) {
    const { suggestions: allSuggestions, total, generatedAt } = suggestions;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSuggestions = allSuggestions.slice(startIndex, endIndex);

    return {
      suggestions: paginatedSuggestions,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: endIndex < total,
        hasPrevPage: page > 1,
      },
      generatedAt,
    };
  }

  /**
   * Get cached response if available and not expired
   * @param {string} key - Cache key
   * @returns {Object|null} Cached response or null
   */
  getCachedResponse(key) {
    const cached = this.responseCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL * 1000) {
      this.responseCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache response with timestamp
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  cacheResponse(key, data) {
    this.responseCache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    this.cleanupCache();
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    const maxAge = this.cacheTTL * 1000;

    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.responseCache.delete(key);
      }
    }
  }

  /**
   * Clear all cached responses
   */
  clearCache() {
    this.responseCache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    const maxAge = this.cacheTTL * 1000;

    let expiredCount = 0;
    let validCount = 0;

    for (const value of this.responseCache.values()) {
      if (now - value.timestamp > maxAge) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      totalEntries: this.responseCache.size,
      validEntries: validCount,
      expiredEntries: expiredCount,
      cacheTTL: this.cacheTTL,
    };
  }
}

module.exports = new GeminiService();
