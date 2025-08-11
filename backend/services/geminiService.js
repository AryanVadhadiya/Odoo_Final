const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
  }

  async generateCityRecommendations(preferences) {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const { budget, interests, duration, startLocation, travelStyle } = preferences;
    
    const prompt = `As a travel expert, recommend 5-8 cities for a ${duration}-day trip with the following preferences:
    - Budget: ${budget}
    - Interests: ${interests?.join(', ') || 'general travel'}
    - Starting from: ${startLocation || 'flexible'}
    - Travel style: ${travelStyle || 'balanced'}
    
    For each city, provide:
    1. City name and country
    2. Estimated daily cost (USD)
    3. Best activities (3-4 items)
    4. Best time to visit
    5. Why it matches their preferences
    6. Suggested duration of stay
    
    Format as JSON array with this structure:
    {
      "recommendations": [
        {
          "city": "City Name",
          "country": "Country",
          "dailyCost": 50,
          "activities": ["Activity 1", "Activity 2", "Activity 3"],
          "bestTime": "March-May",
          "reasoning": "Why this city matches",
          "suggestedDays": 3,
          "highlights": ["Highlight 1", "Highlight 2"]
        }
      ]
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if no JSON found
      return { recommendations: [], rawResponse: text };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  async generateItinerary(cities, preferences) {
    if (!this.genAI) {
      throw new Error('Gemini AI not configured');
    }

    const { duration, budget, interests, travelPace } = preferences;
    
    const prompt = `Create a detailed ${duration}-day itinerary for these cities: ${cities.map(c => `${c.name}, ${c.country}`).join('; ')}.
    
    Preferences:
    - Total budget: ${budget}
    - Interests: ${interests?.join(', ') || 'general tourism'}
    - Travel pace: ${travelPace || 'moderate'}
    
    For each day, include:
    1. Location/city
    2. Morning activity (9 AM - 12 PM)
    3. Afternoon activity (1 PM - 5 PM)
    4. Evening activity (6 PM - 9 PM)
    5. Estimated daily cost
    6. Transportation details
    7. Accommodation suggestions
    
    Format as JSON:
    {
      "itinerary": [
        {
          "day": 1,
          "date": "2024-XX-XX",
          "city": "City Name",
          "activities": [
            {
              "time": "9:00 AM",
              "title": "Activity Title",
              "description": "Activity description",
              "cost": 25,
              "duration": "3 hours",
              "category": "sightseeing"
            }
          ],
          "transportation": "Details about getting around",
          "accommodation": "Hotel/area suggestions",
          "totalCost": 75
        }
      ],
      "totalEstimatedCost": 1500,
      "tips": ["Tip 1", "Tip 2"]
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { itinerary: [], rawResponse: text };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate itinerary');
    }
  }

  async generateActivityRecommendations(city, preferences) {
    if (!this.genAI) {
      throw new Error('Gemini AI not configured');
    }

    const { interests, budget, duration, travelStyle } = preferences;
    
    const prompt = `Recommend activities in ${city.name}, ${city.country} for ${duration} days.
    
    Preferences:
    - Interests: ${interests?.join(', ') || 'general tourism'}
    - Daily budget: ${budget}
    - Travel style: ${travelStyle || 'balanced'}
    
    Provide 10-15 activities with:
    1. Activity name
    2. Category (sightseeing, food, adventure, culture, nightlife, shopping, nature)
    3. Cost estimate (USD)
    4. Duration
    5. Description
    6. Best time to visit
    7. Difficulty level (easy, moderate, challenging)
    
    Format as JSON:
    {
      "activities": [
        {
          "name": "Activity Name",
          "category": "sightseeing",
          "cost": 15,
          "duration": "2-3 hours",
          "description": "Activity description",
          "bestTime": "Morning",
          "difficulty": "easy",
          "rating": 4.5,
          "tips": ["Tip 1", "Tip 2"]
        }
      ]
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { activities: [], rawResponse: text };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate activity recommendations');
    }
  }

  async generateBudgetBreakdown(tripDetails) {
    if (!this.genAI) {
      throw new Error('Gemini AI not configured');
    }

    const { cities, duration, travelStyle, groupSize } = tripDetails;
    
    const prompt = `Create a detailed budget breakdown for a ${duration}-day trip to: ${cities.map(c => c.name).join(', ')}.
    
    Details:
    - Travel style: ${travelStyle || 'mid-range'}
    - Group size: ${groupSize || 1} person(s)
    - Duration: ${duration} days
    
    Provide breakdown for:
    1. Accommodation (per night)
    2. Food (breakfast, lunch, dinner)
    3. Transportation (flights, local transport)
    4. Activities and attractions
    5. Shopping and miscellaneous
    6. Emergency fund (10-15%)
    
    Format as JSON:
    {
      "budgetBreakdown": {
        "accommodation": {
          "perNight": 80,
          "totalNights": 7,
          "total": 560
        },
        "food": {
          "breakfast": 15,
          "lunch": 25,
          "dinner": 40,
          "dailyTotal": 80,
          "total": 560
        },
        "transportation": {
          "flights": 400,
          "localTransport": 200,
          "total": 600
        },
        "activities": {
          "attractions": 300,
          "tours": 200,
          "total": 500
        },
        "miscellaneous": {
          "shopping": 200,
          "emergencyFund": 240,
          "total": 440
        }
      },
      "grandTotal": 2660,
      "dailyAverage": 380,
      "tips": ["Budget tip 1", "Budget tip 2"]
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { budgetBreakdown: {}, rawResponse: text };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate budget breakdown');
    }
  }

  async generateCityData(cityName) {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const prompt = `Generate comprehensive data for the city "${cityName}" in the following JSON format. Use real, accurate information and include EXACTLY 15 ATTRACTIONS with detailed descriptions, costs, and ratings:

    {
      "name": "City Name",
      "country": "Country Name",
      "countryCode": "3-letter ISO code",
      "region": "State/Province/Region",
      "coordinates": {
        "lat": 0.0,
        "lng": 0.0
      },
      "timezone": "Timezone",
      "population": 0,
      "costIndex": 0,
      "currency": "Currency code",
      "languages": ["Language1", "Language2"],
      "climate": {
        "type": "climate type (tropical, dry, temperate, continental, polar)",
        "averageTemp": {
          "summer": 0,
          "winter": 0
        },
        "rainfall": "low, moderate, or high"
      },
      "attractions": [
        {
          "name": "Attraction name",
          "type": "landmark, museum, park, beach, mountain, shopping, entertainment, cultural, historical, or natural",
          "description": "Detailed description of the attraction",
          "rating": 0.0,
          "cost": 0,
          "costCurrency": "USD",
          "bestTimeToVisit": "Best time to visit this attraction",
          "visitDuration": "Recommended time to spend (e.g., 2-3 hours)",
          "highlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3"]
        }
      ],
      "transportation": {
        "airport": {
          "hasInternational": true/false,
          "name": "Airport name",
          "code": "Airport code"
        },
        "publicTransport": "excellent, good, fair, or poor",
        "metro": true/false,
        "bus": true/false,
        "taxi": true/false
      },
      "safety": {
        "rating": 0,
        "notes": "Safety notes"
      },
      "images": [
        {
          "url": "https://images.unsplash.com/photo-example",
          "caption": "Image caption",
          "isPrimary": true
        }
      ],
      "tags": ["tag1", "tag2", "tag3"],
      "popularity": 0,
      "isActive": true
    }

    CRITICAL REQUIREMENTS:
    1. Generate EXACTLY 15 attractions - no more, no less
    2. For Indian cities (like Delhi, Mumbai, Jaipur), use costs in Indian Rupees (INR) and set costCurrency to "INR"
    3. For other cities, use costs in USD and set costCurrency to "USD"
    4. Each attraction must have realistic costs based on the city's economy
    5. Include the most famous and popular attractions for the city
    6. Use accurate coordinates, population, and factual information
    7. Cost index should be 0-100 (0=very cheap, 100=very expensive)
    8. Popularity should be 0-100 based on tourism popularity
    9. Include relevant tags describing the city's character
    10. Use real Unsplash photo URLs that would show the city
    11. Safety rating 1-10 (10=very safe)
    12. Make sure all data is realistic and helpful for travelers
    13. For attractions, include famous landmarks, museums, parks, shopping areas, and cultural sites
    14. Each attraction should have a detailed description explaining why it's worth visiting
    15. Include best time to visit and recommended duration for each attraction`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const cityData = JSON.parse(jsonMatch[0]);
        
        // Add MongoDB-style ObjectIds for nested objects
        if (cityData.attractions) {
          cityData.attractions = cityData.attractions.map((attraction, index) => ({
            ...attraction,
            _id: `ai_attraction_${Date.now()}_${index}`
          }));
        }
        
        if (cityData.images) {
          cityData.images = cityData.images.map((image, index) => ({
            ...image,
            _id: `ai_image_${Date.now()}_${index}`
          }));
        }
        
        // Add metadata
        cityData._id = `ai_city_${Date.now()}`;
        cityData.createdAt = new Date().toISOString();
        cityData.updatedAt = new Date().toISOString();
        cityData.__v = 0;
        
        return cityData;
      }
      
      return { error: 'Failed to parse city data', rawResponse: text };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate city data');
    }
  }
}

module.exports = new GeminiService();
