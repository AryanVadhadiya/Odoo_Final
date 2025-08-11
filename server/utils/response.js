/**
 * Utility functions for consistent API responses
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {Object} meta - Pagination metadata
 * @param {number} statusCode - HTTP status code
 */
const sendSuccessResponse = (res, data, meta = null, statusCode = 200) => {
  const response = {
    ok: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Object} error - Error object
 * @param {string} error.code - Error code
 * @param {string} error.message - Error message
 * @param {number} error.statusCode - HTTP status code
 * @param {*} error.details - Additional error details
 */
const sendErrorResponse = (res, error) => {
  const {
    code = 'ERROR',
    message = 'An error occurred',
    statusCode = 500,
    details = null,
  } = error;

  const response = {
    ok: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  // Add timestamp for debugging
  if (process.env.NODE_ENV === 'development') {
    response.error.timestamp = new Date().toISOString();
  }

  return res.status(statusCode).json(response);
};

/**
 * Create pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {boolean} hasMore - Whether there are more pages
 * @returns {Object} Pagination metadata
 */
const createPaginationMeta = (page, limit, total, hasMore = null) => {
  const meta = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  };

  if (total !== null && total !== undefined) {
    meta.total = total;
    meta.totalPages = Math.ceil(total / meta.limit);
    meta.hasNextPage = meta.page < meta.totalPages;
    meta.hasPrevPage = meta.page > 1;
  } else {
    meta.total = null;
    meta.hasMore = hasMore !== null ? hasMore : true;
  }

  return meta;
};

/**
 * Create pagination metadata for provider responses
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {Array} items - Items array
 * @param {Object} providerMeta - Provider metadata
 * @returns {Object} Pagination metadata
 */
const createProviderPaginationMeta = (page, limit, items, providerMeta = {}) => {
  const meta = createPaginationMeta(page, limit, providerMeta.total);

  // Add provider-specific metadata
  if (providerMeta.hasMore !== undefined) {
    meta.hasMore = providerMeta.hasMore;
  }

  if (providerMeta.nextPageToken) {
    meta.nextPageToken = providerMeta.nextPageToken;
  }

  if (providerMeta.prevPageToken) {
    meta.prevPageToken = providerMeta.prevPageToken;
  }

  return meta;
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {boolean} hasMore - Whether there are more pages
 * @param {number} statusCode - HTTP status code
 */
const sendPaginatedResponse = (res, data, page, limit, total, hasMore = null, statusCode = 200) => {
  const meta = createPaginationMeta(page, limit, total, hasMore);
  return sendSuccessResponse(res, data, meta, statusCode);
};

/**
 * Send provider paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {Array} items - Items array
 * @param {Object} providerMeta - Provider metadata
 * @param {number} statusCode - HTTP status code
 */
const sendProviderPaginatedResponse = (res, data, page, limit, items, providerMeta = {}, statusCode = 200) => {
  const meta = createProviderPaginationMeta(page, limit, items, providerMeta);
  return sendSuccessResponse(res, data, meta, statusCode);
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} location - Location header value
 */
const sendCreatedResponse = (res, data, location = null) => {
  if (location) {
    res.set('Location', location);
  }
  return sendSuccessResponse(res, data, null, 201);
};

/**
 * Send no content response
 * @param {Object} res - Express response object
 */
const sendNoContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors array
 * @param {string} message - Error message
 */
const sendValidationError = (res, errors, message = 'Validation failed') => {
  return sendErrorResponse(res, {
    code: 'VALIDATION_ERROR',
    message,
    statusCode: 400,
    details: errors,
  });
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 * @param {string} id - Resource ID
 */
const sendNotFoundResponse = (res, resource = 'Resource', id = null) => {
  const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;

  return sendErrorResponse(res, {
    code: 'NOT_FOUND',
    message,
    statusCode: 404,
  });
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorizedResponse = (res, message = 'Unauthorized') => {
  return sendErrorResponse(res, {
    code: 'UNAUTHORIZED',
    message,
    statusCode: 401,
  });
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendForbiddenResponse = (res, message = 'Forbidden') => {
  return sendErrorResponse(res, {
    code: 'FORBIDDEN',
    message,
    statusCode: 403,
  });
};

/**
 * Send conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} details - Additional details
 */
const sendConflictResponse = (res, message = 'Conflict', details = null) => {
  return sendErrorResponse(res, {
    code: 'CONFLICT',
    message,
    statusCode: 409,
    details,
  });
};

/**
 * Send too many requests response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} retryAfter - Retry after seconds
 */
const sendTooManyRequestsResponse = (res, message = 'Too many requests', retryAfter = 60) => {
  res.set('Retry-After', retryAfter.toString());

  return sendErrorResponse(res, {
    code: 'RATE_LIMIT_EXCEEDED',
    message,
    statusCode: 429,
    details: {
      retryAfter,
    },
  });
};

/**
 * Send internal server error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Error} error - Error object for logging
 */
const sendInternalServerError = (res, message = 'Internal server error', error = null) => {
  if (error && process.env.NODE_ENV === 'development') {
    console.error('Internal server error:', error);
  }

  return sendErrorResponse(res, {
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    statusCode: 500,
  });
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  createPaginationMeta,
  createProviderPaginationMeta,
  sendPaginatedResponse,
  sendProviderPaginatedResponse,
  sendCreatedResponse,
  sendNoContentResponse,
  sendValidationError,
  sendNotFoundResponse,
  sendUnauthorizedResponse,
  sendForbiddenResponse,
  sendConflictResponse,
  sendTooManyRequestsResponse,
  sendInternalServerError,
};
