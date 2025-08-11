const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Trip = require('./models/Trip');
const City = require('./models/City');
const Activity = require('./models/Activity');

// Sample cities data with real-life information
const cities = [
  {
    name: 'Paris',
    country: 'France',
    countryCode: 'FRA',
    region: 'Île-de-France',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    timezone: 'Europe/Paris',
    population: 2161000,
    costIndex: 85,
    currency: 'EUR',
    languages: ['French', 'English'],
    climate: {
      type: 'temperate',
      averageTemp: { summer: 20, winter: 5 },
      rainfall: 'moderate'
    },
    attractions: [
      {
        name: 'Eiffel Tower',
        type: 'landmark',
        description: 'Iconic iron lattice tower',
        rating: 4.5,
        cost: 26
      },
      {
        name: 'Louvre Museum',
        type: 'museum',
        description: 'World\'s largest art museum',
        rating: 4.7,
        cost: 17
      },
      {
        name: 'Notre-Dame Cathedral',
        type: 'historical',
        description: 'Medieval Catholic cathedral',
        rating: 4.6,
        cost: 0
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'Charles de Gaulle Airport',
        code: 'CDG'
      },
      publicTransport: 'excellent',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 8,
      notes: 'Generally safe, be aware of pickpockets in tourist areas'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1502602898534-47d6b7a83f8f',
        caption: 'Eiffel Tower at sunset',
        isPrimary: true
      }
    ],
    tags: ['romance', 'culture', 'food', 'art'],
    popularity: 95,
    isActive: true
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    countryCode: 'JPN',
    region: 'Kanto',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    timezone: 'Asia/Tokyo',
    population: 13960000,
    costIndex: 95,
    currency: 'JPY',
    languages: ['Japanese', 'English'],
    climate: {
      type: 'temperate',
      averageTemp: { summer: 25, winter: 5 },
      rainfall: 'moderate'
    },
    attractions: [
      {
        name: 'Senso-ji Temple',
        type: 'cultural',
        description: 'Ancient Buddhist temple',
        rating: 4.6,
        cost: 0
      },
      {
        name: 'Tokyo Skytree',
        type: 'landmark',
        description: 'Tallest tower in Japan',
        rating: 4.4,
        cost: 25
      },
      {
        name: 'Shibuya Crossing',
        type: 'landmark',
        description: 'World\'s busiest pedestrian crossing',
        rating: 4.3,
        cost: 0
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'Haneda Airport',
        code: 'HND'
      },
      publicTransport: 'excellent',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 9,
      notes: 'Very safe city with low crime rates'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
        caption: 'Tokyo cityscape',
        isPrimary: true
      }
    ],
    tags: ['technology', 'culture', 'food', 'shopping'],
    popularity: 92,
    isActive: true
  },
  {
    name: 'New York',
    country: 'United States',
    countryCode: 'USA',
    region: 'New York',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    timezone: 'America/New_York',
    population: 8336000,
    costIndex: 90,
    currency: 'USD',
    languages: ['English', 'Spanish'],
    climate: {
      type: 'temperate',
      averageTemp: { summer: 23, winter: 2 },
      rainfall: 'moderate'
    },
    attractions: [
      {
        name: 'Statue of Liberty',
        type: 'landmark',
        description: 'Iconic symbol of freedom',
        rating: 4.4,
        cost: 24
      },
      {
        name: 'Central Park',
        type: 'park',
        description: 'Urban oasis in Manhattan',
        rating: 4.7,
        cost: 0
      },
      {
        name: 'Times Square',
        type: 'entertainment',
        description: 'Famous commercial intersection',
        rating: 4.2,
        cost: 0
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'John F. Kennedy Airport',
        code: 'JFK'
      },
      publicTransport: 'excellent',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 7,
      notes: 'Generally safe, be cautious in certain areas at night'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
        caption: 'New York skyline',
        isPrimary: true
      }
    ],
    tags: ['business', 'culture', 'entertainment', 'shopping'],
    popularity: 94,
    isActive: true
  },
  {
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GBR',
    region: 'England',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    timezone: 'Europe/London',
    population: 8982000,
    costIndex: 88,
    currency: 'GBP',
    languages: ['English'],
    climate: {
      type: 'temperate',
      averageTemp: { summer: 18, winter: 6 },
      rainfall: 'high'
    },
    attractions: [
      {
        name: 'Big Ben',
        type: 'landmark',
        description: 'Famous clock tower',
        rating: 4.5,
        cost: 0
      },
      {
        name: 'British Museum',
        type: 'museum',
        description: 'World-famous museum',
        rating: 4.6,
        cost: 0
      },
      {
        name: 'Tower Bridge',
        type: 'landmark',
        description: 'Victorian bridge over Thames',
        rating: 4.4,
        cost: 12
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'Heathrow Airport',
        code: 'LHR'
      },
      publicTransport: 'excellent',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 8,
      notes: 'Generally safe, be aware of pickpockets in tourist areas'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
        caption: 'London skyline',
        isPrimary: true
      }
    ],
    tags: ['history', 'culture', 'royalty', 'shopping'],
    popularity: 93,
    isActive: true
  },
  {
    name: 'Rome',
    country: 'Italy',
    countryCode: 'ITA',
    region: 'Lazio',
    coordinates: { lat: 41.9028, lng: 12.4964 },
    timezone: 'Europe/Rome',
    population: 2873000,
    costIndex: 75,
    currency: 'EUR',
    languages: ['Italian', 'English'],
    climate: {
      type: 'temperate',
      averageTemp: { summer: 26, winter: 8 },
      rainfall: 'moderate'
    },
    attractions: [
      {
        name: 'Colosseum',
        type: 'historical',
        description: 'Ancient amphitheater',
        rating: 4.7,
        cost: 16
      },
      {
        name: 'Vatican Museums',
        type: 'museum',
        description: 'Art and history collections',
        rating: 4.6,
        cost: 17
      },
      {
        name: 'Trevi Fountain',
        type: 'landmark',
        description: 'Famous Baroque fountain',
        rating: 4.5,
        cost: 0
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'Leonardo da Vinci Airport',
        code: 'FCO'
      },
      publicTransport: 'good',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 7,
      notes: 'Generally safe, be aware of pickpockets in tourist areas'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1552832230-cb7a21004364',
        caption: 'Colosseum',
        isPrimary: true
      }
    ],
    tags: ['history', 'culture', 'food', 'religion'],
    popularity: 91,
    isActive: true
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    countryCode: 'ESP',
    region: 'Catalonia',
    coordinates: { lat: 41.3851, lng: 2.1734 },
    timezone: 'Europe/Madrid',
    population: 1620000,
    costIndex: 70,
    currency: 'EUR',
    languages: ['Spanish', 'Catalan', 'English'],
    climate: {
      type: 'temperate',
      averageTemp: { summer: 24, winter: 10 },
      rainfall: 'low'
    },
    attractions: [
      {
        name: 'Sagrada Familia',
        type: 'historical',
        description: 'Famous basilica by Gaudi',
        rating: 4.8,
        cost: 26
      },
      {
        name: 'Park Güell',
        type: 'park',
        description: 'Gaudi\'s colorful park',
        rating: 4.6,
        cost: 10
      },
      {
        name: 'La Rambla',
        type: 'entertainment',
        description: 'Famous pedestrian street',
        rating: 4.3,
        cost: 0
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'El Prat Airport',
        code: 'BCN'
      },
      publicTransport: 'excellent',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 7,
      notes: 'Generally safe, be aware of pickpockets in tourist areas'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded',
        caption: 'Sagrada Familia',
        isPrimary: true
      }
    ],
    tags: ['architecture', 'culture', 'beach', 'food'],
    popularity: 89,
    isActive: true
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    countryCode: 'NLD',
    region: 'North Holland',
    coordinates: { lat: 52.3676, lng: 4.9041 },
    timezone: 'Europe/Amsterdam',
    population: 821000,
    costIndex: 80,
    currency: 'EUR',
    languages: ['Dutch', 'English'],
    climate: {
      type: 'temperate',
      averageTemp: { summer: 18, winter: 3 },
      rainfall: 'moderate'
    },
    attractions: [
      {
        name: 'Anne Frank House',
        type: 'museum',
        description: 'Historical museum',
        rating: 4.6,
        cost: 14
      },
      {
        name: 'Van Gogh Museum',
        type: 'museum',
        description: 'Art museum',
        rating: 4.7,
        cost: 20
      },
      {
        name: 'Canal Cruise',
        type: 'activity',
        description: 'Boat tour through canals',
        rating: 4.5,
        cost: 25
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'Schiphol Airport',
        code: 'AMS'
      },
      publicTransport: 'excellent',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 8,
      notes: 'Very safe city with low crime rates'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1512470876302-972faa2c7156',
        caption: 'Amsterdam canals',
        isPrimary: true
      }
    ],
    tags: ['culture', 'history', 'canals', 'art'],
    popularity: 87,
    isActive: true
  },
  {
    name: 'Sydney',
    country: 'Australia',
    countryCode: 'AUS',
    region: 'New South Wales',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    timezone: 'Australia/Sydney',
    population: 5312000,
    costIndex: 85,
    currency: 'AUD',
    languages: ['English'],
    climate: {
      type: 'temperate',
      averageTemp: { summer: 23, winter: 12 },
      rainfall: 'moderate'
    },
    attractions: [
      {
        name: 'Sydney Opera House',
        type: 'landmark',
        description: 'Iconic performing arts center',
        rating: 4.7,
        cost: 42
      },
      {
        name: 'Sydney Harbour Bridge',
        type: 'landmark',
        description: 'Famous steel arch bridge',
        rating: 4.5,
        cost: 0
      },
      {
        name: 'Bondi Beach',
        type: 'beach',
        description: 'Famous surf beach',
        rating: 4.6,
        cost: 0
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'Sydney Airport',
        code: 'SYD'
      },
      publicTransport: 'good',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 8,
      notes: 'Very safe city with low crime rates'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
        caption: 'Sydney Opera House',
        isPrimary: true
      }
    ],
    tags: ['beach', 'nature', 'culture', 'outdoors'],
    popularity: 88,
    isActive: true
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'ARE',
    region: 'Dubai',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    timezone: 'Asia/Dubai',
    population: 3331000,
    costIndex: 75,
    currency: 'AED',
    languages: ['Arabic', 'English'],
    climate: {
      type: 'dry',
      averageTemp: { summer: 35, winter: 20 },
      rainfall: 'low'
    },
    attractions: [
      {
        name: 'Burj Khalifa',
        type: 'landmark',
        description: 'World\'s tallest building',
        rating: 4.6,
        cost: 35
      },
      {
        name: 'Palm Jumeirah',
        type: 'landmark',
        description: 'Artificial island',
        rating: 4.4,
        cost: 0
      },
      {
        name: 'Dubai Mall',
        type: 'shopping',
        description: 'World\'s largest mall',
        rating: 4.3,
        cost: 0
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'Dubai International Airport',
        code: 'DXB'
      },
      publicTransport: 'good',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 9,
      notes: 'Very safe city with strict laws'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
        caption: 'Burj Khalifa',
        isPrimary: true
      }
    ],
    tags: ['luxury', 'shopping', 'modern', 'desert'],
    popularity: 86,
    isActive: true
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    countryCode: 'SGP',
    region: 'Central Region',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    timezone: 'Asia/Singapore',
    population: 5850000,
    costIndex: 90,
    currency: 'SGD',
    languages: ['English', 'Mandarin', 'Malay', 'Tamil'],
    climate: {
      type: 'tropical',
      averageTemp: { summer: 28, winter: 26 },
      rainfall: 'high'
    },
    attractions: [
      {
        name: 'Marina Bay Sands',
        type: 'landmark',
        description: 'Iconic hotel and casino',
        rating: 4.5,
        cost: 0
      },
      {
        name: 'Gardens by the Bay',
        type: 'nature',
        description: 'Botanical gardens',
        rating: 4.7,
        cost: 28
      },
      {
        name: 'Sentosa Island',
        type: 'entertainment',
        description: 'Resort island',
        rating: 4.4,
        cost: 4
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'Changi Airport',
        code: 'SIN'
      },
      publicTransport: 'excellent',
      metro: true,
      bus: true,
      taxi: true
    },
    safety: {
      rating: 9,
      notes: 'Very safe city with strict laws'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
        caption: 'Marina Bay Sands',
        isPrimary: true
      }
    ],
    tags: ['modern', 'clean', 'shopping', 'food'],
    popularity: 90,
    isActive: true
  }
];

// Sample activities data
const activities = [
  {
    name: 'City Walking Tour',
    description: 'Explore the city on foot with a knowledgeable guide',
    category: 'Cultural',
    duration: 120,
    cost: 25,
    rating: 4.5,
    tags: ['culture', 'history', 'walking'],
    isActive: true
  },
  {
    name: 'Museum Visit',
    description: 'Discover art, history, and culture in local museums',
    category: 'Cultural',
    duration: 180,
    cost: 15,
    rating: 4.3,
    tags: ['culture', 'art', 'history'],
    isActive: true
  },
  {
    name: 'Food Tasting',
    description: 'Sample local cuisine and traditional dishes',
    category: 'Food',
    duration: 90,
    cost: 35,
    rating: 4.6,
    tags: ['food', 'culture', 'local'],
    isActive: true
  },
  {
    name: 'Boat Tour',
    description: 'See the city from the water',
    category: 'Adventure',
    duration: 60,
    cost: 30,
    rating: 4.4,
    tags: ['adventure', 'nature', 'water'],
    isActive: true
  },
  {
    name: 'Shopping Spree',
    description: 'Explore local markets and shopping districts',
    category: 'Shopping',
    duration: 120,
    cost: 0,
    rating: 4.2,
    tags: ['shopping', 'local', 'culture'],
    isActive: true
  }
];

// Sample users data
const users = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    bio: 'Adventure seeker and travel enthusiast',
    preferences: {
      interests: ['adventure', 'culture', 'food'],
      budget: 'moderate',
      travelStyle: 'balanced'
    },
    isActive: true,
    createdAt: new Date('2023-01-15')
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
    bio: 'Luxury traveler and food lover',
    preferences: {
      interests: ['luxury', 'food', 'culture'],
      budget: 'luxury',
      travelStyle: 'slow'
    },
    isActive: true,
    createdAt: new Date('2023-02-20')
  },
  {
    username: 'mike_wilson',
    email: 'mike@example.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Wilson',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    bio: 'Budget backpacker exploring the world',
    preferences: {
      interests: ['adventure', 'budget', 'nature'],
      budget: 'budget',
      travelStyle: 'fast'
    },
    isActive: true,
    createdAt: new Date('2023-03-10')
  },
  {
    username: 'sarah_jones',
    email: 'sarah@example.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Jones',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    bio: 'Family traveler with kids',
    preferences: {
      interests: ['family', 'nature', 'culture'],
      budget: 'moderate',
      travelStyle: 'balanced'
    },
    isActive: true,
    createdAt: new Date('2023-04-05')
  },
  {
    username: 'david_brown',
    email: 'david@example.com',
    password: 'password123',
    firstName: 'David',
    lastName: 'Brown',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    bio: 'Business traveler and culture enthusiast',
    preferences: {
      interests: ['business', 'culture', 'food'],
      budget: 'luxury',
      travelStyle: 'balanced'
    },
    isActive: true,
    createdAt: new Date('2023-05-12')
  },
  {
    username: 'emma_davis',
    email: 'emma@example.com',
    password: 'password123',
    firstName: 'Emma',
    lastName: 'Davis',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    bio: 'Solo female traveler',
    preferences: {
      interests: ['solo', 'adventure', 'culture'],
      budget: 'moderate',
      travelStyle: 'slow'
    },
    isActive: true,
    createdAt: new Date('2023-06-18')
  },
  {
    username: 'alex_chen',
    email: 'alex@example.com',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Chen',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    bio: 'Photography enthusiast and nature lover',
    preferences: {
      interests: ['photography', 'nature', 'adventure'],
      budget: 'moderate',
      travelStyle: 'balanced'
    },
    isActive: true,
    createdAt: new Date('2023-07-22')
  },
  {
    username: 'lisa_wang',
    email: 'lisa@example.com',
    password: 'password123',
    firstName: 'Lisa',
    lastName: 'Wang',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    bio: 'Food blogger and culinary explorer',
    preferences: {
      interests: ['food', 'culture', 'local'],
      budget: 'moderate',
      travelStyle: 'slow'
    },
    isActive: true,
    createdAt: new Date('2023-08-30')
  },
  {
    username: 'tom_rodriguez',
    email: 'tom@example.com',
    password: 'password123',
    firstName: 'Tom',
    lastName: 'Rodriguez',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    bio: 'Sports and adventure traveler',
    preferences: {
      interests: ['sports', 'adventure', 'nature'],
      budget: 'budget',
      travelStyle: 'fast'
    },
    isActive: true,
    createdAt: new Date('2023-09-14')
  },
  {
    username: 'anna_kowalski',
    email: 'anna@example.com',
    password: 'password123',
    firstName: 'Anna',
    lastName: 'Kowalski',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
    bio: 'History buff and museum lover',
    preferences: {
      interests: ['history', 'culture', 'museums'],
      budget: 'moderate',
      travelStyle: 'slow'
    },
    isActive: true,
    createdAt: new Date('2023-10-08')
  }
];

// Sample trips data with realistic patterns
const trips = [
  {
    name: 'European Adventure',
    description: 'Exploring the best of Europe',
    startDate: new Date('2024-06-15'),
    endDate: new Date('2024-06-30'),
    status: 'planning',
    isPublic: true,
    budget: {
      total: 3000,
      currency: 'EUR',
      breakdown: {
        accommodation: 1200,
        transportation: 800,
        activities: 600,
        food: 300,
        other: 100
      }
    },
    destinations: [
      {
        city: 'Paris',
        country: 'France',
        arrivalDate: new Date('2024-06-15'),
        departureDate: new Date('2024-06-20'),
        order: 1,
        budget: 600
      },
      {
        city: 'Rome',
        country: 'Italy',
        arrivalDate: new Date('2024-06-20'),
        departureDate: new Date('2024-06-25'),
        order: 2,
        budget: 600
      },
      {
        city: 'Barcelona',
        country: 'Spain',
        arrivalDate: new Date('2024-06-25'),
        departureDate: new Date('2024-06-30'),
        order: 3,
        budget: 600
      }
    ],
    tags: ['europe', 'culture', 'history'],
    createdAt: new Date('2024-01-15')
  },
  {
    name: 'Tokyo & Kyoto Experience',
    description: 'Japanese culture and tradition',
    startDate: new Date('2024-07-10'),
    endDate: new Date('2024-07-20'),
    status: 'planning',
    isPublic: false,
    budget: {
      total: 2500,
      currency: 'USD',
      breakdown: {
        accommodation: 1000,
        transportation: 600,
        activities: 500,
        food: 300,
        other: 100
      }
    },
    destinations: [
      {
        city: 'Tokyo',
        country: 'Japan',
        arrivalDate: new Date('2024-07-10'),
        departureDate: new Date('2024-07-17'),
        order: 1,
        budget: 1500
      },
      {
        city: 'Kyoto',
        country: 'Japan',
        arrivalDate: new Date('2024-07-17'),
        departureDate: new Date('2024-07-20'),
        order: 2,
        budget: 1000
      }
    ],
    tags: ['japan', 'culture', 'tradition'],
    createdAt: new Date('2024-02-20')
  },
  {
    name: 'New York City Break',
    description: 'Weekend in the Big Apple',
    startDate: new Date('2024-05-03'),
    endDate: new Date('2024-05-06'),
    status: 'completed',
    isPublic: true,
    budget: {
      total: 1200,
      currency: 'USD',
      breakdown: {
        accommodation: 600,
        transportation: 200,
        activities: 200,
        food: 150,
        other: 50
      }
    },
    destinations: [
      {
        city: 'New York',
        country: 'United States',
        arrivalDate: new Date('2024-05-03'),
        departureDate: new Date('2024-05-06'),
        order: 1,
        budget: 1200
      }
    ],
    tags: ['usa', 'city', 'culture'],
    createdAt: new Date('2024-03-10')
  },
  {
    name: 'London & Paris',
    description: 'Classic European cities',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-08-10'),
    status: 'active',
    isPublic: true,
    budget: {
      total: 2800,
      currency: 'GBP',
      breakdown: {
        accommodation: 1200,
        transportation: 400,
        activities: 600,
        food: 400,
        other: 200
      }
    },
    destinations: [
      {
        city: 'London',
        country: 'United Kingdom',
        arrivalDate: new Date('2024-08-01'),
        departureDate: new Date('2024-08-05'),
        order: 1,
        budget: 1400
      },
      {
        city: 'Paris',
        country: 'France',
        arrivalDate: new Date('2024-08-05'),
        departureDate: new Date('2024-08-10'),
        order: 2,
        budget: 1400
      }
    ],
    tags: ['europe', 'culture', 'history'],
    createdAt: new Date('2024-04-15')
  },
  {
    name: 'Dubai Luxury',
    description: 'Luxury experience in Dubai',
    startDate: new Date('2024-09-20'),
    endDate: new Date('2024-09-25'),
    status: 'planning',
    isPublic: false,
    budget: {
      total: 5000,
      currency: 'USD',
      breakdown: {
        accommodation: 2500,
        transportation: 500,
        activities: 1000,
        food: 800,
        other: 200
      }
    },
    destinations: [
      {
        city: 'Dubai',
        country: 'United Arab Emirates',
        arrivalDate: new Date('2024-09-20'),
        departureDate: new Date('2024-09-25'),
        order: 1,
        budget: 5000
      }
    ],
    tags: ['luxury', 'modern', 'desert'],
    createdAt: new Date('2024-05-20')
  },
  {
    name: 'Singapore & Malaysia',
    description: 'Southeast Asian adventure',
    startDate: new Date('2024-10-15'),
    endDate: new Date('2024-10-25'),
    status: 'planning',
    isPublic: true,
    budget: {
      total: 1800,
      currency: 'SGD',
      breakdown: {
        accommodation: 800,
        transportation: 400,
        activities: 300,
        food: 200,
        other: 100
      }
    },
    destinations: [
      {
        city: 'Singapore',
        country: 'Singapore',
        arrivalDate: new Date('2024-10-15'),
        departureDate: new Date('2024-10-20'),
        order: 1,
        budget: 900
      },
      {
        city: 'Kuala Lumpur',
        country: 'Malaysia',
        arrivalDate: new Date('2024-10-20'),
        departureDate: new Date('2024-10-25'),
        order: 2,
        budget: 900
      }
    ],
    tags: ['asia', 'culture', 'food'],
    createdAt: new Date('2024-06-25')
  },
  {
    name: 'Amsterdam Weekend',
    description: 'Quick trip to the Netherlands',
    startDate: new Date('2024-04-12'),
    endDate: new Date('2024-04-15'),
    status: 'completed',
    isPublic: true,
    budget: {
      total: 800,
      currency: 'EUR',
      breakdown: {
        accommodation: 400,
        transportation: 150,
        activities: 150,
        food: 80,
        other: 20
      }
    },
    destinations: [
      {
        city: 'Amsterdam',
        country: 'Netherlands',
        arrivalDate: new Date('2024-04-12'),
        departureDate: new Date('2024-04-15'),
        order: 1,
        budget: 800
      }
    ],
    tags: ['europe', 'culture', 'canals'],
    createdAt: new Date('2024-03-01')
  },
  {
    name: 'Sydney Summer',
    description: 'Australian summer adventure',
    startDate: new Date('2024-12-20'),
    endDate: new Date('2025-01-05'),
    status: 'planning',
    isPublic: true,
    budget: {
      total: 3500,
      currency: 'AUD',
      breakdown: {
        accommodation: 1500,
        transportation: 800,
        activities: 600,
        food: 400,
        other: 200
      }
    },
    destinations: [
      {
        city: 'Sydney',
        country: 'Australia',
        arrivalDate: new Date('2024-12-20'),
        departureDate: new Date('2025-01-05'),
        order: 1,
        budget: 3500
      }
    ],
    tags: ['australia', 'summer', 'beach'],
    createdAt: new Date('2024-07-10')
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/globetrotter');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Trip.deleteMany({});
    await City.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing data');

    // Create cities
    const createdCities = await City.insertMany(cities);
    console.log(`Created ${createdCities.length} cities`);

    // Create users
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create trips with user references
    const tripsWithUsers = trips.map((trip, index) => ({
      ...trip,
      user: createdUsers[index % createdUsers.length]._id
    }));
    const createdTrips = await Trip.insertMany(tripsWithUsers);
    console.log(`Created ${createdTrips.length} trips`);

    // Create activities with trip references
    const activitiesWithTrips = activities.map((activity, index) => ({
      ...activity,
      trip: createdTrips[index % createdTrips.length]._id,
      destination: {
        city: 'Paris',
        country: 'France'
      }
    }));
    const createdActivities = await Activity.insertMany(activitiesWithTrips);
    console.log(`Created ${createdActivities.length} activities`);

    console.log('Database seeded successfully!');
    console.log('\nSample data created:');
    console.log(`- ${createdCities.length} cities`);
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdTrips.length} trips`);
    console.log(`- ${createdActivities.length} activities`);

    console.log('\nSample user credentials:');
    createdUsers.forEach(user => {
      console.log(`Email: ${user.email}, Password: password123`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedDatabase(); 