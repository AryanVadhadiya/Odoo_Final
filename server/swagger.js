const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GlobeTrotter API',
      version: '1.0.0',
      description: 'Backend API for GlobeTrotter travel planning application',
      contact: {
        name: 'GlobeTrotter Team',
        email: 'support@globetrotter.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
      {
        url: 'https://api.globetrotter.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token for authentication',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            avatar: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                publicId: { type: 'string' },
                provider: { type: 'string', enum: ['cloudinary', 'default'] },
              },
            },
            role: { type: 'string', enum: ['user', 'admin', 'moderator'], default: 'user' },
            preferences: {
              type: 'object',
              properties: {
                currency: { type: 'string', example: 'USD' },
                language: { type: 'string', example: 'en' },
                timezone: { type: 'string', example: 'UTC' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Trip: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            name: { type: 'string', example: 'European Adventure' },
            description: { type: 'string', example: 'Exploring Europe for 2 weeks' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['planning', 'active', 'completed', 'cancelled'] },
            type: { type: 'string', enum: ['leisure', 'business', 'family', 'solo', 'group', 'other'] },
            budget: {
              type: 'object',
              properties: {
                planned: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number', example: 5000 },
                    currency: { type: 'string', example: 'USD' },
                  },
                },
                actual: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number', example: 4800 },
                    currency: { type: 'string', example: 'USD' },
                  },
                },
              },
            },
            stops: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  cityId: { type: 'string' },
                  cityName: { type: 'string' },
                  arrivalDate: { type: 'string', format: 'date' },
                  departureDate: { type: 'string', format: 'date' },
                  activities: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        category: { type: 'string' },
                        cost: {
                          type: 'object',
                          properties: {
                            amount: { type: 'number' },
                            currency: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            isPublic: { type: 'boolean', default: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Hotel: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'hotel_123' },
            name: { type: 'string', example: 'Grand Plaza Hotel' },
            rating: { type: 'number', minimum: 0, maximum: 5, example: 4.5 },
            price: {
              type: 'object',
              properties: {
                amount: { type: 'number', example: 150 },
                currency: { type: 'string', example: 'USD' },
              },
            },
            distanceMeters: { type: 'number', example: 1200 },
            location: {
              type: 'object',
              properties: {
                lat: { type: 'number', example: 40.7128 },
                lng: { type: 'number', example: -74.0060 },
              },
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                formatted: { type: 'string' },
              },
            },
            amenities: { type: 'array', items: { type: 'string' } },
            photos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  caption: { type: 'string' },
                  width: { type: 'number' },
                  height: { type: 'number' },
                },
              },
            },
            bookingUrl: { type: 'string' },
            source: { type: 'string', enum: ['amadeus', 'booking', 'google', 'hotels'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Validation failed' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
