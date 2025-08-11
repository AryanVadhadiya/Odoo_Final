const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const userController = require('../controllers/userController');

router.get('/me', authenticateToken, asyncHandler(userController.getMe));
router.put('/me', authenticateToken, asyncHandler(userController.updateMe));

// Aliases expected by client
router.get('/preferences', authenticateToken, asyncHandler(userController.getMe));
router.put('/preferences', authenticateToken, asyncHandler(userController.updateMe));

module.exports = router;


