const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { discoveryLimiter } = require('../middleware/rateLimit');
const { asyncHandler } = require('../middleware/errorHandler');
const discoveryController = require('../controllers/discoveryController');

router.post('/cities/overview', authenticateToken, discoveryLimiter, asyncHandler(discoveryController.cityOverview));
router.get('/cities/:cityId/overview/suggestions', authenticateToken, discoveryLimiter, asyncHandler(discoveryController.citySuggestions));
router.get('/places/pool', authenticateToken, discoveryLimiter, asyncHandler(discoveryController.placesPool));
router.post('/recommendations', authenticateToken, discoveryLimiter, asyncHandler(discoveryController.recommendations));

// Aliases expected by client
router.get('/cities/search', authenticateToken, discoveryLimiter, asyncHandler(discoveryController.placesPool));

module.exports = router;


