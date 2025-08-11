const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateRefreshToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { asyncHandler } = require('../middleware/errorHandler');
const authController = require('../controllers/authController');

// Signup
router.post('/signup', authLimiter, asyncHandler(authController.signup));

// Login
router.post('/login', authLimiter, asyncHandler(authController.login));

// Refresh token
router.post('/refresh', authenticateRefreshToken, asyncHandler(authController.refresh));

// Logout
router.post('/logout', authenticateToken, asyncHandler(authController.logout));

// Current user
router.get('/me', authenticateToken, asyncHandler(authController.me));

// Client aliases
router.get('/profile', authenticateToken, asyncHandler(authController.me));
router.put('/profile', authenticateToken, asyncHandler(authController.updateProfile));

// Password flows (basic placeholders for now)
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

module.exports = router;


