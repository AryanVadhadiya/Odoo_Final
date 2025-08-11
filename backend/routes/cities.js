const express = require('express');
const City = require('../models/City');

const router = express.Router();

// @route   GET /api/cities
// @desc    Search cities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      country,
      costMin,
      costMax,
      popularity,
      climate,
      limit = 20,
      page = 1
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Country filter
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    // Cost range filter
    if (costMin || costMax) {
      query.costIndex = {};
      if (costMin) query.costIndex.$gte = parseInt(costMin);
      if (costMax) query.costIndex.$lte = parseInt(costMax);
    }

    // Popularity filter
    if (popularity) {
      query.popularity = { $gte: parseInt(popularity) };
    }

    // Climate filter
    if (climate) {
      query['climate.type'] = climate;
    }

    const cities = await City.find(query)
      .sort({ popularity: -1, name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('name country countryCode region coordinates costIndex currency climate attractions images tags popularity');

    const total = await City.countDocuments(query);

    res.status(200).json({
      success: true,
      count: cities.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: cities
    });
  } catch (error) {
    console.error('Search cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/cities/:id
// @desc    Get single city
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    if (!city || !city.isActive) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    res.status(200).json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error('Get city error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/cities/popular
// @desc    Get popular cities
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const cities = await City.find({ isActive: true })
      .sort({ popularity: -1 })
      .limit(limit)
      .select('name country countryCode coordinates costIndex currency images tags popularity');

    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    console.error('Get popular cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/cities/countries
// @desc    Get all countries
// @access  Public
router.get('/countries', async (req, res) => {
  try {
    const countries = await City.distinct('country', { isActive: true });
    
    res.status(200).json({
      success: true,
      count: countries.length,
      data: countries.sort()
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/cities/climates
// @desc    Get climate types
// @access  Public
router.get('/climates', (req, res) => {
  const climates = [
    'tropical',
    'dry',
    'temperate',
    'continental',
    'polar'
  ];

  res.status(200).json({
    success: true,
    data: climates
  });
});

// @route   GET /api/cities/nearby
// @desc    Get cities near coordinates
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 100, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const cities = await City.find({
      isActive: true,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      }
    })
    .limit(parseInt(limit))
    .select('name country countryCode coordinates costIndex currency images tags popularity');

    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    console.error('Get nearby cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 