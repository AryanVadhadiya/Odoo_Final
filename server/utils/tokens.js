const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate JWT access token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT access token
 */
const generateAccessToken = (userId, role = 'user') => {
  const payload = {
    userId,
    role,
    type: 'access',
  };

  const options = {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    issuer: 'globetrotter-api',
    audience: 'globetrotter-client',
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);
};

/**
 * Generate JWT refresh token
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: 'refresh',
  };

  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'globetrotter-api',
    audience: 'globetrotter-client',
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, options);
};

/**
 * Generate email verification token
 * @param {string} userId - User ID
 * @returns {Object} Token object with token and expiry
 */
const generateEmailVerificationToken = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return {
    token,
    expires,
  };
};

/**
 * Generate password reset token
 * @param {string} userId - User ID
 * @returns {Object} Token object with token and expiry
 */
const generatePasswordResetToken = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  return {
    token,
    expires,
  };
};

/**
 * Generate share token for trips
 * @param {string} tripId - Trip ID
 * @param {number} expiresInHours - Expiry time in hours
 * @returns {Object} Token object with token and expiry
 */
const generateShareToken = (tripId, expiresInHours = 168) => { // Default: 7 days
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  return {
    token,
    expires,
  };
};

/**
 * Generate API key for external integrations
 * @param {string} userId - User ID
 * @param {string} purpose - Purpose of the API key
 * @returns {Object} API key object with key and expiry
 */
const generateApiKey = (userId, purpose = 'general') => {
  const key = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

  return {
    key,
    expires,
    purpose,
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw error;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiry time
 * @param {string} token - JWT token
 * @returns {Date|null} Token expiry date or null if invalid
 */
const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Generate random token for various purposes
 * @param {number} length - Token length in bytes
 * @param {string} encoding - Encoding format (hex, base64, etc.)
 * @returns {string} Random token
 */
const generateRandomToken = (length = 32, encoding = 'hex') => {
  return crypto.randomBytes(length).toString(encoding);
};

/**
 * Generate secure hash for sensitive data
 * @param {string} data - Data to hash
 * @param {string} salt - Salt for hashing
 * @returns {string} Hashed data
 */
const generateHash = (data, salt = null) => {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }

  const hash = crypto.pbkdf2Sync(data, salt, 1000, 64, 'sha512').toString('hex');

  return {
    hash,
    salt,
  };
};

/**
 * Verify hash against data
 * @param {string} data - Data to verify
 * @param {string} hash - Hash to verify against
 * @param {string} salt - Salt used for hashing
 * @returns {boolean} True if hash matches
 */
const verifyHash = (data, hash, salt) => {
  const computedHash = crypto.pbkdf2Sync(data, salt, 1000, 64, 'sha512').toString('hex');
  return computedHash === hash;
};

/**
 * Generate device fingerprint for refresh token tracking
 * @param {Object} req - Express request object
 * @returns {string} Device fingerprint
 */
const generateDeviceFingerprint = (req) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  const acceptLanguage = req.get('Accept-Language') || '';

  const fingerprint = crypto
    .createHash('sha256')
    .update(`${userAgent}${ip}${acceptLanguage}`)
    .digest('hex');

  return fingerprint;
};

/**
 * Clean expired tokens from user's refresh tokens array
 * @param {Array} refreshTokens - Array of refresh tokens
 * @returns {Array} Cleaned array with only valid tokens
 */
const cleanExpiredTokens = (refreshTokens) => {
  if (!Array.isArray(refreshTokens)) return [];

  const now = new Date();
  return refreshTokens.filter(token => {
    return token.expiresAt && new Date(token.expiresAt) > now;
  });
};

/**
 * Revoke specific refresh token
 * @param {Array} refreshTokens - Array of refresh tokens
 * @param {string} tokenToRevoke - Token to revoke
 * @returns {Array} Array with revoked token removed
 */
const revokeRefreshToken = (refreshTokens, tokenToRevoke) => {
  if (!Array.isArray(refreshTokens)) return [];

  return refreshTokens.filter(token => token.token !== tokenToRevoke);
};

/**
 * Revoke all refresh tokens for a user
 * @param {Array} refreshTokens - Array of refresh tokens
 * @returns {Array} Empty array
 */
const revokeAllRefreshTokens = (refreshTokens) => {
  return [];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  generateShareToken,
  generateApiKey,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiry,
  generateRandomToken,
  generateHash,
  verifyHash,
  generateDeviceFingerprint,
  cleanExpiredTokens,
  revokeRefreshToken,
  revokeAllRefreshTokens,
};
