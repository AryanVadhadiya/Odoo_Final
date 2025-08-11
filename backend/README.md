# GlobeTrotter Backend API

A comprehensive travel planning and community platform backend built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, profile management with public/private visibility
- **Trip Planning**: Create, manage, and share travel itineraries
- **Community Features**: Connect with other travelers, follow profiles, view public trips
- **Review System**: Rate and review trips with detailed feedback
- **Notification System**: Real-time updates for connections, trip invites, and more
- **File Uploads**: Image uploads for trip covers and profile pictures
- **Advanced Search**: Filter and sort trips, users, and cities with pagination

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, validated),
  password: String (required, 6+ chars, hashed),
  avatar: String (optional),
  bio: String (optional, max 200 chars),
  location: String (optional, max 100 chars),
  isProfilePublic: Boolean (default: false),
  profileVisibility: {
    email: Boolean (default: false),
    location: Boolean (default: true),
    bio: Boolean (default: true),
    trips: Boolean (default: true),
    stats: Boolean (default: true)
  },
  preferences: {
    language: String (en, es, fr, de, it, hi, zh, ja, ko, ar),
    currency: String (USD, EUR, GBP, JPY, CAD, AUD, INR, etc.),
    theme: String (light, dark, auto),
    timezone: String (default: UTC),
    notifications: { email: Boolean, push: Boolean, sms: Boolean }
  },
  socialLinks: { website, instagram, twitter, facebook, linkedin },
  stats: {
    totalTrips: Number,
    completedTrips: Number,
    totalDistance: Number,
    countriesVisited: Number,
    citiesVisited: Number,
    totalSpent: Number,
    averageRating: Number
  },
  accountType: String (free, premium, business),
  subscription: { plan, startDate, endDate, autoRenew }
}
```

### Trip Model
```javascript
{
  user: ObjectId (ref: User, required),
  name: String (required, max 100 chars),
  description: String (optional, max 500 chars),
  coverPhoto: String (optional),
  startDate: Date (required),
  endDate: Date (required),
  status: String (planning, active, completed, cancelled),
  isPublic: Boolean (default: false),
  publicUrl: String (unique, auto-generated),
  rating: {
    average: Number (0-5),
    count: Number,
    breakdown: { accommodation, food, activities, transportation, value, overall }
  },
  budget: {
    total: Number (min: 0),
    currency: String,
    breakdown: { accommodation, transportation, activities, food, other }
  },
  destinations: [{
    city: String (required),
    country: String (required),
    arrivalDate: Date (required),
    departureDate: Date (required),
    order: Number (required)
  }],
  tags: [String],
  collaborators: [{
    user: ObjectId (ref: User),
    role: String (viewer, editor, admin),
    addedAt: Date
  }],
  metadata: {
    totalDistance: Number,
    countriesCount: Number,
    citiesCount: Number,
    activitiesCount: Number,
    photosCount: Number,
    reviewsCount: Number
  }
}
```

### Review Model
```javascript
{
  user: ObjectId (ref: User, required),
  trip: ObjectId (ref: Trip, required),
  destination: { city: String, country: String },
  rating: Number (required, 1-5),
  title: String (required, 5-100 chars),
  content: String (required, 10-1000 chars),
  categories: [String] (accommodation, food, activities, transportation, value, overall),
  photos: [{ url: String, caption: String, uploadedAt: Date }],
  helpful: [{
    user: ObjectId (ref: User),
    helpful: Boolean,
    createdAt: Date
  }],
  isPublic: Boolean (default: true),
  isVerified: Boolean (default: false),
  tags: [String],
  language: String (default: 'en')
}
```

### Connection Model
```javascript
{
  follower: ObjectId (ref: User, required),
  following: ObjectId (ref: User, required),
  status: String (pending, accepted, blocked),
  createdAt: Date,
  acceptedAt: Date,
  notes: String (max 200 chars)
}
```

### Notification Model
```javascript
{
  user: ObjectId (ref: User, required),
  type: String (trip_invite, trip_update, connection_request, connection_accepted, review_received, trip_reminder, budget_alert, system_message),
  title: String (required, max 100 chars),
  message: String (required, max 500 chars),
  data: { tripId, userId, reviewId, connectionId, amount, date },
  isRead: Boolean (default: false),
  isArchived: Boolean (default: false),
  priority: String (low, medium, high, urgent),
  expiresAt: Date,
  actionUrl: String,
  actionText: String
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/profile/visibility` - Toggle profile visibility
- `GET /api/users/community` - Get public user profiles
- `GET /api/users/:id/public` - Get public user profile by ID
- `POST /api/users/connections/follow` - Follow a user
- `PUT /api/users/connections/:id` - Accept/reject connection request
- `GET /api/users/connections` - Get user connections

### Trips
- `GET /api/trips` - Get user trips (with search, filter, sort)
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip by ID
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `GET /api/trips/public/:publicUrl` - Get public trip

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/trip/:tripId` - Get trip reviews
- `GET /api/reviews/user/:userId` - Get user reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark review as helpful

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `PUT /api/notifications/:id/archive` - Archive notification
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/clear-read` - Clear read notifications
- `GET /api/notifications/settings` - Get notification settings
- `PUT /api/notifications/settings` - Update notification settings

### File Uploads
- `POST /api/uploads/image` - Upload image (max 5MB)

### Cities
- `GET /api/cities` - Get cities (with search, filter, sort)

### Activities
- `GET /api/activities` - Get trip activities
- `POST /api/activities` - Create activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Environment Variables
Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/globetrotter
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start

# Seed database with sample data
npm run seed
```

### Database Seeding
The seed file creates sample data including:
- 5 users with different profiles and preferences
- 3 cities (Paris, Tokyo, New York) with attractions
- 2 sample trips with activities
- Sample reviews and connections
- Sample notifications

Sample login credentials:
- `john@example.com` / `password123`
- `jane@example.com` / `password123`
- `carlos@example.com` / `password123`
- `yuki@example.com` / `password123`
- `priya@example.com` / `password123`

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Rate limiting (configurable)
- CORS protection
- Helmet security headers
- File upload validation

## 📊 Performance Features

- Database indexing for common queries
- Pagination for large datasets
- Efficient aggregation pipelines
- Connection pooling
- Response compression

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Documentation

The API follows RESTful conventions and returns consistent JSON responses:

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "count": 10,
  "total": 100,
  "pagination": {
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please include a valid email"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.
