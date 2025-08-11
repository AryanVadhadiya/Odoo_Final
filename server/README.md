# GlobeTrotter Backend API

A production-ready Node.js + Express + MongoDB backend for the GlobeTrotter travel planning application. This API provides comprehensive travel planning features including AI-powered suggestions, hotel search, image management, and trip management.

## 🚀 Features

- **User Authentication & Management**: JWT-based auth with refresh tokens, role-based access control
- **Trip Planning**: Create, edit, and manage travel itineraries with stops and activities
- **AI Integration**: Google Gemini-powered city overviews, cost estimation, and personalized suggestions
- **Hotel Search**: Provider-agnostic hotel search with nearest hotel functionality
- **Image Management**: Cloudinary integration for profile avatars and trip cover images
- **Places Discovery**: Combined provider + AI suggestions for attractions and activities
- **Budget Tracking**: Comprehensive budget management with AI cost estimation
- **Collaboration**: Share trips and collaborate with other users
- **Caching**: Intelligent caching for hotels, places, and AI responses
- **Rate Limiting**: Comprehensive API protection and rate limiting
- **Cross-Platform**: Compatible with Windows, macOS, and Linux

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens)
- **File Uploads**: Multer + Cloudinary
- **AI Integration**: Google Gemini API
- **Validation**: Joi schema validation
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Morgan + custom error handling

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn package manager
- Cloudinary account (for image uploads)
- Google Gemini API key (for AI features)
- Hotel API provider keys (Amadeus, Booking.com, or Google Places)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd server
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/globetrotter

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# CORS
CORS_ORIGIN=http://localhost:5173

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Hotels API (choose one provider)
HOTELS_API_PROVIDER=amadeus
HOTELS_API_KEY=your_hotels_api_key_here
HOTELS_API_SECRET=your_hotels_api_secret_here
```

### 3. Start MongoDB

```bash
# Start MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Build and run
npm run build && npm start
```

The API will be available at `http://localhost:8080`

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: `http://localhost:8080/api/docs`
- **Health Check**: `http://localhost:8080/health`

## 🏗️ Project Structure

```
server/
├── config/           # Database and configuration
├── controllers/      # Request handlers and business logic
├── middleware/       # Authentication, validation, error handling
├── models/          # MongoDB schemas and models
├── routes/          # API route definitions
├── services/        # Business logic and external API integrations
├── utils/           # Helper functions and utilities
├── server.js        # Main application entry point
├── swagger.js       # API documentation configuration
└── package.json     # Dependencies and scripts
```

## 🔐 Authentication

The API uses JWT-based authentication with access and refresh tokens:

### Login Flow

```bash
# 1. Login to get tokens
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Response includes access and refresh tokens
{
  "ok": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

### Using Access Token

```bash
# Include in Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Example protected request
GET /api/users/me
Authorization: Bearer <access_token>
```

### Refresh Token

```bash
# When access token expires
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🖼️ Image Uploads

The API supports image uploads via Cloudinary for:

- **Profile Avatars**: `POST /api/users/me/avatar`
- **Trip Cover Images**: `POST /api/trips/:id/cover`

### Upload Example

```bash
# Upload profile avatar
curl -X POST http://localhost:8080/api/users/me/avatar \
  -H "Authorization: Bearer <access_token>" \
  -F "avatar=@profile.jpg"

# Response includes Cloudinary metadata
{
  "ok": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "globetrotter/avatars/user_123",
    "width": 400,
    "height": 400,
    "transformations": {
      "original": "https://...",
      "thumbnail": "https://...",
      "medium": "https://...",
      "large": "https://..."
    }
  }
}
```

## 🏨 Hotel Search

The API provides provider-agnostic hotel search:

### Search Hotels

```bash
GET /api/hotels/search?cityId=NYC&checkin=2024-01-15&checkout=2024-01-20&guests=2&page=1&limit=20
```

### Find Nearest Hotels

```bash
GET /api/hotels/nearest?lat=40.7128&lng=-74.0060&radiusMeters=5000&limit=10
```

### Supported Providers

- **Amadeus**: Professional travel API (requires API key)
- **Booking.com**: RapidAPI integration
- **Google Places**: Google Maps API integration
- **Mock Data**: Fallback for development/testing

## 🤖 AI Integration

The API integrates with Google Gemini for intelligent travel planning:

### City Overview

```bash
POST /api/cities/overview
{
  "cityData": {
    "name": "Paris",
    "country": "France"
  },
  "travelContext": {
    "season": "spring",
    "budget": "mid-range",
    "interests": ["culture", "food", "art"]
  }
}
```

### AI Suggestions

```bash
GET /api/cities/paris/overview/suggestions?page=1&limit=20&mode=creative
```

### Cost Estimation

```bash
POST /api/trips/estimate
{
  "tripData": {
    "stops": [...],
    "preferences": {...},
    "budget": {...}
  }
}
```

## 📊 Database Design

### Core Collections

- **Users**: User profiles, preferences, and authentication
- **Trips**: Trip data with stops, activities, and budget
- **HotelsCache**: Cached hotel search results (TTL: 1 hour)
- **PlacesCache**: Cached place/attraction data (TTL: 24 hours)

### Key Features

- **Hybrid Embedding**: Balance between embedding and referencing based on data characteristics
- **TTL Indexes**: Automatic cleanup of expired cache entries
- **Compound Indexes**: Optimized queries for common operations
- **Virtual Fields**: Computed properties like trip duration and progress

### Sample Aggregation Pipeline

```javascript
// Budget breakdown by category
db.trips.aggregate([
  { $match: { userId: ObjectId("...") } },
  { $unwind: "$budget.breakdown" },
  {
    $group: {
      _id: "$budget.breakdown.category",
      total: { $sum: "$budget.breakdown.amount" },
      count: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } }
])
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin restrictions
- **Helmet Security**: Security headers and protection
- **Account Locking**: Brute force protection
- **Token Refresh**: Secure token rotation

## 📈 Performance & Caching

- **Response Caching**: LLM responses cached for 24 hours
- **Hotel Cache**: Search results cached for 1 hour
- **Places Cache**: Discovery data cached for 24 hours
- **Database Indexes**: Optimized queries with compound indexes
- **Pagination**: Efficient data pagination for large datasets
- **Compression**: Response compression for better performance

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --grep "auth"
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT secrets
- [ ] Set up MongoDB connection string
- [ ] Configure CORS origins
- [ ] Set up environment variables
- [ ] Configure logging
- [ ] Set up monitoring and health checks

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables

```bash
# Production environment
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://production-db:27017/globetrotter
JWT_ACCESS_SECRET=<secure-secret>
JWT_REFRESH_SECRET=<secure-secret>
CORS_ORIGIN=https://yourdomain.com
```

## 🔧 Configuration

### Rate Limiting

```javascript
// Configure in .env
RATE_LIMIT_WINDOW_MS=900000      // 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      // 100 requests per window

// Different limits for different endpoints
AUTH_RATE_LIMIT=5                // 5 auth attempts per 15 minutes
DISCOVERY_RATE_LIMIT=10          // 10 discovery requests per minute
HOTELS_RATE_LIMIT=15             // 15 hotel searches per minute
```

### Cache TTL

```javascript
// Configure in .env
CACHE_TTL_HOTELS=3600           // 1 hour
CACHE_TTL_PLACES=86400          // 24 hours
CACHE_TTL_IMAGES=86400          // 24 hours
CACHE_TTL_LLM=86400             // 24 hours
```

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "ok": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: `http://localhost:8080/api/docs`
- **Issues**: Create an issue in the repository
- **Email**: support@globetrotter.com

## 🔮 Roadmap

- [ ] Redis integration for distributed caching
- [ ] GraphQL API support
- [ ] WebSocket support for real-time updates
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Integration with more travel providers
- [ ] Machine learning for personalized recommendations

---

**Built with ❤️ by the GlobeTrotter Team**
