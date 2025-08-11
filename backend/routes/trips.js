const express = require('express');
const { body, validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth'); // Added auth middleware

const router = express.Router();

// @route   GET /api/trips
// @desc    Get all trips for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    const query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const trips = await Trip.find(query)
      .sort({ startDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('destinations', 'city country');

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: trips
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/trips/public-feed
// @desc    Get recent public trips feed
// @access  Public
router.get('/public-feed', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const trips = await Trip.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name description startDate endDate coverPhoto budget status publicUrl user')
      .populate('user', 'name avatar');

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error('Get public feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/trips/:id
// @desc    Get single trip
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('destinations')
      .populate('collaborators.user', 'name email avatar');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user owns the trip or is a collaborator
    if (trip.user.toString() !== req.user.id && 
        !trip.collaborators.some(c => c.user._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this trip'
      });
    }

    // Get activities for this trip
    const activities = await Activity.find({ trip: trip._id })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...trip.toObject(),
        activities
      }
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/trips
// @desc    Create new trip
// @access  Private
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Trip name is required and must be less than 100 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('budget.total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget total must be a non-negative number'),
  body('budget.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be boolean')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, startDate, endDate, coverPhoto, tags, budget, isPublic } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const trip = await Trip.create({
      user: req.user.id,
      name,
      description,
      startDate,
      endDate,
      coverPhoto,
      tags,
      budget: budget ? {
        total: Number(budget.total) || 0,
        currency: budget.currency || 'USD',
        breakdown: budget.breakdown || undefined
      } : undefined,
      isPublic: Boolean(isPublic)
    });

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Trip name must be less than 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trip'
      });
    }

    const { name, description, startDate, endDate, coverPhoto, tags, status, isPublic } = req.body;

    // Validate dates if both are provided
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const updateFields = {
      name,
      description,
      startDate,
      endDate,
      coverPhoto,
      tags,
      status,
      isPublic
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => 
      updateFields[key] === undefined && delete updateFields[key]
    );

    trip = await Trip.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/trips/:id
// @desc    Delete trip
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this trip'
      });
    }

    // Delete associated activities
    await Activity.deleteMany({ trip: trip._id });

    // Delete trip
    await trip.remove();

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/trips/public/:publicUrl
// @desc    Get public trip
// @access  Public
router.get('/public/:publicUrl', async (req, res) => {
  try {
    const trip = await Trip.findOne({ 
      publicUrl: req.params.publicUrl,
      isPublic: true 
    }).populate('destinations');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Public trip not found'
      });
    }

    // Get activities for this trip
    const activities = await Activity.find({ trip: trip._id })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...trip.toObject(),
        activities
      }
    });
  } catch (error) {
    console.error('Get public trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/trips/:id/collaborators
// @desc    Add collaborator to trip
// @access  Private
router.post('/:id/collaborators', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .isIn(['viewer', 'editor', 'admin'])
    .withMessage('Role must be viewer, editor, or admin')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add collaborators'
      });
    }

    // Find user by email
    const User = require('../models/User');
    const collaborator = await User.findOne({ email: req.body.email });

    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a collaborator
    const existingCollaborator = trip.collaborators.find(
      c => c.user.toString() === collaborator._id.toString()
    );

    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        message: 'User is already a collaborator'
      });
    }

    trip.collaborators.push({
      user: collaborator._id,
      role: req.body.role
    });

    await trip.save();

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/trips/:id/status
// @desc    Update trip status
// @access  Private
router.patch('/:id/status', [
  body('status')
    .isIn(['planning', 'active', 'completed', 'cancelled'])
    .withMessage('Status must be planning, active, completed, or cancelled')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trip'
      });
    }

    const { status } = req.body;

    // Update status
    trip.status = status;
    await trip.save();

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Update trip status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/trips/copy/:publicUrl
// @desc    Copy a public trip to user's account
// @access  Private
router.post('/copy/:publicUrl', auth, async (req, res) => {
  try {
    const { publicUrl } = req.params;
    const userId = req.user.id;

    // Find the public trip
    const publicTrip = await Trip.findOne({
      publicUrl,
      isPublic: true
    }).populate('destinations');

    if (!publicTrip) {
      return res.status(404).json({
        success: false,
        message: 'Public trip not found'
      });
    }

    // Create a new trip based on the public one
    const newTrip = new Trip({
      user: userId,
      name: `${publicTrip.name} (Copy)`,
      description: publicTrip.description,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Start in 1 week
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // End in 2 weeks
      coverPhoto: publicTrip.coverPhoto,
      budget: publicTrip.budget,
      tags: publicTrip.tags,
      isPublic: false, // New trip is private by default
      destinations: publicTrip.destinations.map(dest => ({
        ...dest.toObject(),
        arrivalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        departureDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }))
    });

    await newTrip.save();

    res.json({
      success: true,
      data: newTrip,
      message: 'Trip copied successfully'
    });
  } catch (error) {
    console.error('Copy trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 