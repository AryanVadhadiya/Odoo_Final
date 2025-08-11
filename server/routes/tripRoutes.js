const express = require('express');
const router = express.Router();
const { authenticateToken, requireEditAccess, requireOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const tripController = require('../controllers/tripController');
const Trip = require('../models/Trip');

// List and create
router.get('/', authenticateToken, asyncHandler(tripController.getTrips));
router.post('/', authenticateToken, asyncHandler(tripController.createTrip));

// CRUD by id
router.get('/:id', authenticateToken, asyncHandler(tripController.getTripById));
router.put('/:id', authenticateToken, requireEditAccess(Trip), asyncHandler(tripController.updateTrip));
router.delete('/:id', authenticateToken, requireOwnership(Trip), asyncHandler(tripController.deleteTrip));

// Itinerary
router.get('/:id/itinerary', authenticateToken, asyncHandler(tripController.getItinerary));
router.put('/:id/itinerary', authenticateToken, requireEditAccess(Trip), asyncHandler(tripController.updateItinerary));

// Share
router.post('/:id/share', authenticateToken, requireEditAccess(Trip), asyncHandler(tripController.shareTrip));
router.get('/public/:shareId', asyncHandler(tripController.getPublicTrip));

module.exports = router;


