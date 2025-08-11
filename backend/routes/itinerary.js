const express = require('express');
const { body, validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');

const router = express.Router();

// @route   GET /api/itinerary/:tripId
// @desc    Get itinerary for a trip
// @access  Private
router.get('/:tripId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check authorization
    if (trip.user.toString() !== req.user.id && 
        !trip.collaborators.some(c => c.user.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this trip'
      });
    }

    // Get activities grouped by date
    const activities = await Activity.find({ trip: trip._id })
      .sort({ date: 1, startTime: 1 });

    // Group activities by date
    const itineraryByDate = activities.reduce((acc, activity) => {
      const date = activity.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        trip: {
          id: trip._id,
          name: trip.name,
          startDate: trip.startDate,
          endDate: trip.endDate,
          destinations: trip.destinations
        },
        itinerary: itineraryByDate,
        activities
      }
    });
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/itinerary/:tripId/destinations
// @desc    Add destination to trip
// @access  Private
router.post('/:tripId/destinations', [
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City name is required'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country name is required'),
  body('arrivalDate')
    .isISO8601()
    .withMessage('Arrival date must be a valid date'),
  body('departureDate')
    .isISO8601()
    .withMessage('Departure date must be a valid date'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check authorization
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this trip'
      });
    }

    const { city, country, arrivalDate, departureDate, budget } = req.body;

    // Validate dates
    if (new Date(arrivalDate) >= new Date(departureDate)) {
      return res.status(400).json({
        success: false,
        message: 'Departure date must be after arrival date'
      });
    }

    // Check if dates are within trip dates
    if (new Date(arrivalDate) < new Date(trip.startDate) || 
        new Date(departureDate) > new Date(trip.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Destination dates must be within trip dates'
      });
    }

    // Check for overlapping dates with existing destinations
    const hasOverlap = trip.destinations.some(dest => {
      const existingArrival = new Date(dest.arrivalDate);
      const existingDeparture = new Date(dest.departureDate);
      const newArrival = new Date(arrivalDate);
      const newDeparture = new Date(departureDate);

      return (newArrival < existingDeparture && newDeparture > existingArrival);
    });

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'Destination dates overlap with existing destinations'
      });
    }

    // Add destination
    const order = trip.destinations.length;
    trip.destinations.push({
      city,
      country,
      arrivalDate,
      departureDate,
      order,
      budget: budget ? Number(budget) : 0
    });

    await trip.save();

    res.status(201).json({
      success: true,
      data: trip.destinations[trip.destinations.length - 1]
    });
  } catch (error) {
    console.error('Add destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/itinerary/:tripId/destinations/:destinationId
// @desc    Update destination
// @access  Private
router.put('/:tripId/destinations/:destinationId', [
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City name cannot be empty'),
  body('country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country name cannot be empty'),
  body('arrivalDate')
    .optional()
    .isISO8601()
    .withMessage('Arrival date must be a valid date'),
  body('departureDate')
    .optional()
    .isISO8601()
    .withMessage('Departure date must be a valid date'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check authorization
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this trip'
      });
    }

    const destination = trip.destinations.id(req.params.destinationId);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    const { city, country, arrivalDate, departureDate, budget } = req.body;

    // Update fields (prepare tentative values for validation)
    const nextCity = city || destination.city;
    const nextCountry = country || destination.country;
    const nextArrival = arrivalDate ? new Date(arrivalDate) : new Date(destination.arrivalDate);
    const nextDeparture = departureDate ? new Date(departureDate) : new Date(destination.departureDate);

    // Validate dates order
    if (nextArrival >= nextDeparture) {
      return res.status(400).json({ success: false, message: 'Departure date must be after arrival date' });
    }

    // Check within trip bounds
    if (nextArrival < new Date(trip.startDate) || nextDeparture > new Date(trip.endDate)) {
      return res.status(400).json({ success: false, message: 'Destination dates must be within trip dates' });
    }

    // Check overlap with other destinations
    const hasOverlap = trip.destinations.some((d) => {
      if (d._id.toString() === destination._id.toString()) return false;
      const existingArrival = new Date(d.arrivalDate);
      const existingDeparture = new Date(d.departureDate);
      return nextArrival < existingDeparture && nextDeparture > existingArrival;
    });

    if (hasOverlap) {
      return res.status(400).json({ success: false, message: 'Destination dates overlap with existing destinations' });
    }

    // Commit updates
    destination.city = nextCity;
    destination.country = nextCountry;
    destination.arrivalDate = nextArrival;
    destination.departureDate = nextDeparture;
    if (budget !== undefined) destination.budget = Number(budget);

    // Validate dates if both are provided
    if (arrivalDate && departureDate && new Date(arrivalDate) >= new Date(departureDate)) {
      return res.status(400).json({
        success: false,
        message: 'Departure date must be after arrival date'
      });
    }

    await trip.save();

    res.status(200).json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/itinerary/:tripId/destinations/:destinationId
// @desc    Remove destination from trip
// @access  Private
router.delete('/:tripId/destinations/:destinationId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check authorization
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this trip'
      });
    }

    const destination = trip.destinations.id(req.params.destinationId);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Remove activities for this destination
    await Activity.deleteMany({
      trip: trip._id,
      'destination.city': destination.city,
      'destination.country': destination.country
    });

    // Remove destination
    destination.remove();
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Destination removed successfully'
    });
  } catch (error) {
    console.error('Remove destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/itinerary/:tripId/destinations/reorder
// @desc    Reorder destinations
// @access  Private
router.put('/:tripId/destinations/reorder', [
  body('destinationIds')
    .isArray()
    .withMessage('Destination IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check authorization
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this trip'
      });
    }

    const { destinationIds } = req.body;

    // Validate that all destination IDs exist
    const existingIds = trip.destinations.map(d => d._id.toString());
    const validIds = destinationIds.every(id => existingIds.includes(id));

    if (!validIds) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination IDs provided'
      });
    }

    // Reorder destinations
    // Reorder in place according to provided order
    const idToDest = new Map(trip.destinations.map(d => [d._id.toString(), d]));
    trip.destinations = destinationIds.map((id, index) => {
      const dest = idToDest.get(id);
      dest.order = index;
      return dest;
    });
    // Ensure order by index
    trip.destinations.sort((a, b) => a.order - b.order);
    await trip.save();

    res.status(200).json({
      success: true,
      data: trip.destinations
    });
  } catch (error) {
    console.error('Reorder destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/itinerary/public/:publicUrl
// @desc    Get public itinerary by public URL
// @access  Public
router.get('/public/:publicUrl', async (req, res) => {
  try {
    const { publicUrl } = req.params;

    const trip = await Trip.findOne({
      publicUrl,
      isPublic: true
    }).populate('user', 'firstName lastName username profilePicture');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Public itinerary not found'
      });
    }

    // Get activities for this trip
    const activities = await Activity.find({ trip: trip._id })
      .populate('destination', 'city country')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      data: {
        ...trip.toObject(),
        activities
      }
    });
  } catch (error) {
    console.error('Get public itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 