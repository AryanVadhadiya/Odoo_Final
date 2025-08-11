const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

// Sample users data with community-friendly details
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Adventure seeker and travel enthusiast. Love exploring new cultures and trying local cuisines.',
    preferences: {
      language: 'en',
      currency: 'USD',
      theme: 'light'
    },
    savedDestinations: [
      { city: 'Paris', country: 'France' },
      { city: 'Tokyo', country: 'Japan' },
      { city: 'New York', country: 'USA' }
    ],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    bio: 'Luxury traveler and food lover. Always looking for the best dining experiences around the world.',
    preferences: {
      language: 'en',
      currency: 'EUR',
      theme: 'dark'
    },
    savedDestinations: [
      { city: 'Rome', country: 'Italy' },
      { city: 'Barcelona', country: 'Spain' },
      { city: 'Amsterdam', country: 'Netherlands' }
    ],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    name: 'Mike Wilson',
    email: 'mike@example.com',
    password: 'password123',
    bio: 'Budget backpacker exploring the world on a shoestring. Love meeting fellow travelers.',
    preferences: {
      language: 'en',
      currency: 'USD',
      theme: 'light'
    },
    savedDestinations: [
      { city: 'Bangkok', country: 'Thailand' },
      { city: 'Hanoi', country: 'Vietnam' },
      { city: 'Kuala Lumpur', country: 'Malaysia' }
    ],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    bio: 'Family traveler with kids. Finding kid-friendly destinations and activities worldwide.',
    preferences: {
      language: 'en',
      currency: 'USD',
      theme: 'light'
    },
    savedDestinations: [
      { city: 'Sydney', country: 'Australia' },
      { city: 'Vancouver', country: 'Canada' },
      { city: 'Copenhagen', country: 'Denmark' }
    ],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    name: 'David Brown',
    email: 'david@example.com',
    password: 'password123',
    bio: 'Business traveler and culture enthusiast. Combining work trips with cultural exploration.',
    preferences: {
      language: 'en',
      currency: 'GBP',
      theme: 'dark'
    },
    savedDestinations: [
      { city: 'London', country: 'United Kingdom' },
      { city: 'Singapore', country: 'Singapore' },
      { city: 'Dubai', country: 'United Arab Emirates' }
    ],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    isActive: true
  }
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/globetrotter');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create users
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    console.log('\nDatabase seeded successfully!');
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
seedUsers();
