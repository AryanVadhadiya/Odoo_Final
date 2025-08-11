const { sendErrorResponse } = require('../utils/response');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      code: 'INVALID_ID',
      message,
      statusCode: 400,
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}`;
    error = {
      code: 'DUPLICATE_FIELD',
      message,
      statusCode: 400,
      details: {
        field,
        value: err.keyValue[field],
      },
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation failed';
    const details = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value,
    }));

    error = {
      code: 'VALIDATION_ERROR',
      message,
      statusCode: 400,
      details,
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      code: 'INVALID_TOKEN',
      message: 'Invalid token',
      statusCode: 401,
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      code: 'TOKEN_EXPIRED',
      message: 'Token expired',
      statusCode: 401,
    };
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      code: 'FILE_TOO_LARGE',
      message: 'File size too large',
      statusCode: 400,
      details: {
        maxSize: process.env.MAX_FILE_SIZE || '5MB',
      },
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      code: 'TOO_MANY_FILES',
      message: 'Too many files uploaded',
      statusCode: 400,
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      code: 'UNEXPECTED_FILE_FIELD',
      message: 'Unexpected file field',
      statusCode: 400,
    };
  }

  // Cloudinary errors
  if (err.http_code && err.http_code >= 400) {
    error = {
      code: 'CLOUDINARY_ERROR',
      message: 'Image upload failed',
      statusCode: 400,
      details: {
        cloudinaryCode: err.http_code,
        cloudinaryMessage: err.message,
      },
    };
  }

  // External API errors
  if (err.isAxiosError) {
    const statusCode = err.response?.status || 500;
    const message = err.response?.data?.message || 'External API request failed';

    error = {
      code: 'EXTERNAL_API_ERROR',
      message,
      statusCode,
      details: {
        url: err.config?.url,
        method: err.config?.method,
        status: err.response?.status,
        responseData: err.response?.data,
      },
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
      statusCode: 429,
      details: {
        retryAfter: err.headers?.['retry-after'] || 60,
      },
    };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'Internal server error';

  // Don't leak internal errors in production
  const finalError = {
    code,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : message,
    ...(error.details && { details: error.details }),
  };

  // Send error response
  return sendErrorResponse(res, {
    ...finalError,
    statusCode,
  });
};

/**
 * 404 handler for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

/**
 * Async error wrapper for controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.isJoi) {
    const details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    return sendErrorResponse(res, {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      statusCode: 400,
      details,
    });
  }
  next(err);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  validationErrorHandler,
};
