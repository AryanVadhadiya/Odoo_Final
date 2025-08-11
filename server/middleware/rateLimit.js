const rateLimit = require('express-rate-limit');
const { sendErrorResponse } = require('../utils/response');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    ok: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return sendErrorResponse(res, {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
      statusCode: 429,
      details: {
        retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000),
      },
    });
  },
});

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    ok: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendErrorResponse(res, {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
      statusCode: 429,
      details: {
        retryAfter: 900, // 15 minutes
      },
    });
  },
});

// Rate limiter for LLM and discovery endpoints
const discoveryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: {
    ok: false,
    error: {
      code: 'DISCOVERY_RATE_LIMIT_EXCEEDED',
      message: 'Too many discovery requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendErrorResponse(res, {
      code: 'DISCOVERY_RATE_LIMIT_EXCEEDED',
      message: 'Too many discovery requests, please try again later',
      statusCode: 429,
      details: {
        retryAfter: 60, // 1 minute
      },
    });
  },
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 uploads per hour
  message: {
    ok: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendErrorResponse(res, {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads, please try again later',
      statusCode: 429,
      details: {
        retryAfter: 3600, // 1 hour
      },
    });
  },
});

// Rate limiter for hotel search
const hotelsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 hotel searches per minute
  message: {
    ok: false,
    error: {
      code: 'HOTELS_RATE_LIMIT_EXCEEDED',
      message: 'Too many hotel search requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendErrorResponse(res, {
      code: 'HOTELS_RATE_LIMIT_EXCEEDED',
      message: 'Too many hotel search requests, please try again later',
      statusCode: 429,
      details: {
        retryAfter: 60, // 1 minute
      },
    });
  },
});

// Rate limiter for places pool
const placesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 places requests per minute
  message: {
    ok: false,
    error: {
      code: 'PLACES_RATE_LIMIT_EXCEEDED',
      message: 'Too many places requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendErrorResponse(res, {
      code: 'PLACES_RATE_LIMIT_EXCEEDED',
      message: 'Too many places requests, please try again later',
      statusCode: 429,
      details: {
        retryAfter: 60, // 1 minute
      },
    });
  },
});

// Dynamic rate limiter based on user role
const dynamicLimiter = (defaultMax, roleMultipliers = {}) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
      // Get user role from request (if authenticated)
      const userRole = req.user?.role || 'anonymous';
      const multiplier = roleMultipliers[userRole] || 1;
      return Math.floor(defaultMax * multiplier);
    },
    message: {
      ok: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded for your account type',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return sendErrorResponse(res, {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded for your account type',
        statusCode: 429,
        details: {
          retryAfter: 900, // 15 minutes
        },
      });
    },
  });
};

// Rate limiter with different limits for different user roles
const roleBasedLimiter = dynamicLimiter(100, {
  anonymous: 0.5,    // 50 requests per 15 minutes
  user: 1,           // 100 requests per 15 minutes
  moderator: 2,      // 200 requests per 15 minutes
  admin: 5,          // 500 requests per 15 minutes
});

module.exports = {
  generalLimiter,
  authLimiter,
  discoveryLimiter,
  uploadLimiter,
  hotelsLimiter,
  placesLimiter,
  dynamicLimiter,
  roleBasedLimiter,
};
