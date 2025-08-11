const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Trip = require('./models/Trip');
const City = require('./models/City');
const Activity = require('./models/Activity');

// Sample cities data
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
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'Narita International Airport',
        code: 'NRT'
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
    popularity: 90,
    isActive: true
  },
  {
    name: 'New York',
    country: 'United States',
    countryCode: 'USA',
    region: 'New York',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    timezone: 'America/New_York',
    population: 8337000,
    costIndex: 100,
    currency: 'USD',
    languages: ['English', 'Spanish'],
    climate: {
      type: 'temperate',
      averageTemp: { summer: 25, winter: 0 },
      rainfall: 'moderate'
    },
    attractions: [
      {
        name: 'Statue of Liberty',
        type: 'landmark',
        description: 'Iconic symbol of freedom',
        rating: 4.5,
        cost: 18
      },
      {
        name: 'Central Park',
        type: 'park',
        description: 'Urban oasis in Manhattan',
        rating: 4.7,
        cost: 0
      }
    ],
    transportation: {
      airport: {
        hasInternational: true,
        name: 'John F. Kennedy International Airport',
        code: 'JFK'
      },
      publicTransport: 'good',
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
        caption: 'New York City skyline',
        isPrimary: true
      }
    ],
    tags: ['business', 'culture', 'food', 'entertainment'],
    popularity: 92,
    isActive: true
  }
];

// Sample users data
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Travel enthusiast and adventure seeker',
    preferences: {
      language: 'en',
      currency: 'USD',
      theme: 'light'
    },
    savedDestinations: [
      { city: 'Paris', country: 'France' },
      { city: 'Tokyo', country: 'Japan' }
    ]
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    bio: 'Food lover and culture explorer',
    preferences: {
      language: 'en',
      currency: 'EUR',
      theme: 'light'
    },
    savedDestinations: [
      { city: 'Paris', country: 'France' },
      { city: 'New York', country: 'United States' }
    ]
  }
];

// Sample trips data
const trips = [
  {
    name: 'Paris Adventure',
    description: 'A week-long exploration of the City of Light',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-22'),
    status: 'planning',
    isPublic: true,
    budget: {
      total: 2500,
      currency: 'EUR',
      breakdown: {
        accommodation: 800,
        transportation: 300,
        activities: 600,
        food: 600,
        other: 200
      }
    },
    destinations: [
      {
        city: 'Paris',
        country: 'France',
        arrivalDate: new Date('2024-03-15'),
        departureDate: new Date('2024-03-22'),
        order: 0
      }
    ],
    tags: ['culture', 'romance', 'food']
  },
  {
    name: 'Tokyo Discovery',
    description: 'Exploring the fascinating blend of tradition and technology',
    startDate: new Date('2024-04-10'),
    endDate: new Date('2024-04-18'),
    status: 'planning',
    isPublic: false,
    budget: {
      total: 3000,
      currency: 'USD',
      breakdown: {
        accommodation: 1000,
        transportation: 400,
        activities: 800,
        food: 600,
        other: 200
      }
    },
    destinations: [
      {
        city: 'Tokyo',
        country: 'Japan',
        arrivalDate: new Date('2024-04-10'),
        departureDate: new Date('2024-04-18'),
        order: 0
      }
    ],
    tags: ['technology', 'culture', 'food']
  }
];

// Sample activities data
const activities = [
  {
    title: 'Visit Eiffel Tower',
    description: 'Iconic symbol of Paris with stunning city views',
    type: 'sightseeing',
    date: new Date('2024-03-16'),
    startTime: '09:00',
    endTime: '11:00',
    duration: 120,
    location: {
      name: 'Eiffel Tower',
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
      coordinates: { lat: 48.8584, lng: 2.2945 }
    },
    cost: {
      amount: 26,
      currency: 'EUR',
      perPerson: true
    },
    booking: {
      required: true,
      confirmed: true,
      reference: 'ET-2024-001'
    },
    priority: 'high',
    tags: ['landmark', 'views', 'photography']
  },
  {
    title: 'Louvre Museum Tour',
    description: 'Explore the world\'s largest art museum',
    type: 'culture',
    date: new Date('2024-03-17'),
    startTime: '14:00',
    endTime: '17:00',
    duration: 180,
    location: {
      name: 'Louvre Museum',
      address: 'Rue de Rivoli, 75001 Paris, France',
      coordinates: { lat: 48.8606, lng: 2.3376 }
    },
    cost: {
      amount: 17,
      currency: 'EUR',
      perPerson: true
    },
    booking: {
      required: false,
      confirmed: false
    },
    priority: 'medium',
    tags: ['art', 'museum', 'culture']
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