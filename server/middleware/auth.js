const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendErrorResponse } = require('../utils/response');

/**
 * Middleware to verify JWT access token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Authorization Header:', req.headers.authorization);
    console.log('Extracted Token:', token);

    if (!token) {
      return sendErrorResponse(res, {
        code: 'UNAUTHORIZED',
        message: 'Access token is required',
        statusCode: 401,
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Check if user exists and is not locked
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return sendErrorResponse(res, {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        statusCode: 401,
      });
    }

    if (user.isLocked()) {
      return sendErrorResponse(res, {
        code: 'ACCOUNT_LOCKED',
        message: 'Account is temporarily locked due to multiple failed login attempts',
        statusCode: 423, // Locked
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, {
        code: 'TOKEN_EXPIRED',
        message: 'Access token has expired',
        statusCode: 401,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, {
        code: 'INVALID_TOKEN',
        message: 'Invalid access token',
        statusCode: 401,
      });
    }

    console.error('Auth middleware error:', error);
    return sendErrorResponse(res, {
      code: 'AUTH_ERROR',
      message: 'Authentication failed',
      statusCode: 500,
    });
  }
};

/**
 * Middleware to verify JWT refresh token
 */
const authenticateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendErrorResponse(res, {
        code: 'REFRESH_TOKEN_REQUIRED',
        message: 'Refresh token is required',
        statusCode: 400,
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user exists and has this refresh token
    const user = await User.findByRefreshToken(refreshToken);

    if (!user) {
      return sendErrorResponse(res, {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
        statusCode: 401,
      });
    }

    if (user.isLocked()) {
      return sendErrorResponse(res, {
        code: 'ACCOUNT_LOCKED',
        message: 'Account is temporarily locked',
        statusCode: 423,
      });
    }

    // Add user to request object
    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, {
        code: 'REFRESH_TOKEN_EXPIRED',
        message: 'Refresh token has expired',
        statusCode: 401,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token',
        statusCode: 401,
      });
    }

    console.error('Refresh token auth error:', error);
    return sendErrorResponse(res, {
      code: 'AUTH_ERROR',
      message: 'Authentication failed',
      statusCode: 500,
    });
  }
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendErrorResponse(res, {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        statusCode: 401,
      });
    }

    const roleHierarchy = { user: 1, moderator: 2, admin: 3 };
    const userLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return sendErrorResponse(res, {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Role '${requiredRole}' is required`,
        statusCode: 403,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or has access
 */
const requireOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendErrorResponse(res, {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          statusCode: 401,
        });
      }

      const resourceId = req.params[resourceIdParam];

      if (!resourceId) {
        return sendErrorResponse(res, {
          code: 'INVALID_REQUEST',
          message: 'Resource ID is required',
          statusCode: 400,
        });
      }

      // Find the resource
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return sendErrorResponse(res, {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found',
          statusCode: 404,
        });
      }

      // Check ownership or collaboration access
      let hasAccess = false;

      // Check if user owns the resource
      if (resource.userId && resource.userId.toString() === req.user._id.toString()) {
        hasAccess = true;
      }

      // Check if user is a collaborator (for trips)
      if (resource.collaborators && resource.hasAccess) {
        hasAccess = resource.hasAccess(req.user._id, 'viewer');
      }

      // Admin users have access to everything
      if (req.user.role === 'admin') {
        hasAccess = true;
      }

      if (!hasAccess) {
        return sendErrorResponse(res, {
          code: 'ACCESS_DENIED',
          message: 'You do not have access to this resource',
          statusCode: 403,
        });
      }

      // Add resource to request object
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return sendErrorResponse(res, {
        code: 'AUTH_ERROR',
        message: 'Authentication check failed',
        statusCode: 500,
      });
    }
  };
};

/**
 * Middleware to check if user can edit the resource
 */
const requireEditAccess = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendErrorResponse(res, {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          statusCode: 401,
        });
      }

      const resourceId = req.params[resourceIdParam];

      if (!resourceId) {
        return sendErrorResponse(res, {
          code: 'INVALID_REQUEST',
          message: 'Resource ID is required',
          statusCode: 400,
        });
      }

      // Find the resource
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return sendErrorResponse(res, {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found',
          statusCode: 404,
        });
      }

      // Check edit access
      let hasEditAccess = false;

      // Check if user owns the resource
      if (resource.userId && resource.userId.toString() === req.user._id.toString()) {
        hasEditAccess = true;
      }

      // Check if user is an editor or admin collaborator (for trips)
      if (resource.collaborators && resource.hasAccess) {
        hasEditAccess = resource.hasAccess(req.user._id, 'editor');
      }

      // Admin users have edit access to everything
      if (req.user.role === 'admin') {
        hasEditAccess = true;
      }

      if (!hasEditAccess) {
        return sendErrorResponse(res, {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You do not have permission to edit this resource',
          statusCode: 403,
        });
      }

      // Add resource to request object
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Edit access check error:', error);
      return sendErrorResponse(res, {
        code: 'AUTH_ERROR',
        message: 'Permission check failed',
        statusCode: 500,
      });
    }
  };
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
  requireRole,
  requireOwnership,
  requireEditAccess,
};
