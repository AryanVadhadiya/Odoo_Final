const express = require('express');
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Review = require('../models/Review');
const Trip = require('../models/Trip');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', [
  auth,
  [
    check('trip', 'Trip ID is required').not().isEmpty(),
    check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('title', 'Review title is required').not().isEmpty().trim().isLength({ min: 5, max: 100 }),
    check('content', 'Review content is required').not().isEmpty().trim().isLength({ min: 10, max: 1000 }),
    check('categories', 'At least one category is required').isArray({ min: 1 }),
    check('categories.*', 'Invalid category').isIn(['accommodation', 'food', 'activities', 'transportation', 'value', 'overall'])
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { trip, rating, title, content, categories, destination, photos, tags } = req.body;

    // Check if trip exists and user has access
    const tripDoc = await Trip.findById(trip);
    if (!tripDoc) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Check if user has already reviewed this trip
    const existingReview = await Review.findOne({ user: req.user.id, trip });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this trip' });
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      trip,
      rating,
      title,
      content,
      categories,
      destination,
      photos: photos || [],
      tags: tags || []
    });

    // Update trip rating
    await tripDoc.updateRating();

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      await user.updateStats();
    }

    // Populate user info for response
    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reviews/trip/:tripId
// @desc    Get reviews for a specific trip
// @access  Public
router.get('/trip/:tripId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;
    const { tripId } = req.params;

    // Check if trip exists
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    let sortOptions = {};
    if (sortBy === 'recent') {
      sortOptions.createdAt = -1;
    } else if (sortBy === 'rating') {
      sortOptions.rating = -1;
    } else if (sortBy === 'helpful') {
      sortOptions.helpfulScore = -1;
    }

    const reviews = await Review.find({ trip: tripId, isPublic: true })
      .populate('user', 'name avatar')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments({ trip: tripId, isPublic: true });

    res.json({
      success: true,
      count: reviews.length,
      total,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        pages: Math.ceil(total / limit) 
      },
      data: reviews
    });
  } catch (error) {
    console.error('Get trip reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { userId } = req.params;

    // Check if user exists and profile is public
    const user = await User.findById(userId);
    if (!user || !user.isProfilePublic) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const reviews = await Review.find({ user: userId, isPublic: true })
      .populate('trip', 'name coverPhoto startDate endDate')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments({ user: userId, isPublic: true });

    res.json({
      success: true,
      count: reviews.length,
      total,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        pages: Math.ceil(total / limit) 
      },
      data: reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', [
  auth,
  [
    check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
    check('title', 'Review title must be between 5 and 100 characters').optional().trim().isLength({ min: 5, max: 100 }),
    check('content', 'Review content must be between 10 and 1000 characters').optional().trim().isLength({ min: 10, max: 1000 }),
    check('categories', 'Categories must be an array').optional().isArray(),
    check('categories.*', 'Invalid category').optional().isIn(['accommodation', 'food', 'activities', 'transportation', 'value', 'overall'])
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    const updateFields = {};
    if (req.body.rating !== undefined) updateFields.rating = req.body.rating;
    if (req.body.title !== undefined) updateFields.title = req.body.title;
    if (req.body.content !== undefined) updateFields.content = req.body.content;
    if (req.body.categories !== undefined) updateFields.categories = req.body.categories;
    if (req.body.photos !== undefined) updateFields.photos = req.body.photos;
    if (req.body.tags !== undefined) updateFields.tags = req.body.tags;
    if (req.body.isPublic !== undefined) updateFields.isPublic = req.body.isPublic;

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('user', 'name avatar');

    // Update trip rating
    const trip = await Trip.findById(review.trip);
    if (trip) {
      await trip.updateRating();
    }

    res.json({ success: true, data: updatedReview });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const tripId = review.trip;
    await review.remove();

    // Update trip rating
    const trip = await Trip.findById(tripId);
    if (trip) {
      await trip.updateRating();
    }

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      await user.updateStats();
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful/not helpful
// @access  Private
router.post('/:id/helpful', [
  auth,
  check('helpful', 'Helpful value is required').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { helpful } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user already marked this review
    const existingMark = review.helpful.find(h => h.user.toString() === req.user.id);
    
    if (existingMark) {
      // Update existing mark
      existingMark.helpful = helpful;
      existingMark.createdAt = new Date();
    } else {
      // Add new mark
      review.helpful.push({
        user: req.user.id,
        helpful,
        createdAt: new Date()
      });
    }

    await review.save();
    
    res.json({ 
      success: true, 
      data: review,
      message: `Review marked as ${helpful ? 'helpful' : 'not helpful'}`
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
