const express = require('express');
const { body, validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');

const router = express.Router();

// @route   GET /api/budget/:tripId
// @desc    Get budget breakdown for a trip
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

    // Get all activities for this trip
    const activities = await Activity.find({ trip: trip._id });

    // Calculate budget breakdown
    const breakdown = {
      accommodation: trip.budget.breakdown.accommodation || 0,
      transportation: trip.budget.breakdown.transportation || 0,
      activities: trip.budget.breakdown.activities || 0,
      food: trip.budget.breakdown.food || 0,
      other: trip.budget.breakdown.other || 0
    };

    // Calculate activities cost
    const activitiesCost = activities.reduce((total, activity) => {
      return total + (activity.cost.amount || 0);
    }, 0);

    breakdown.activities = activitiesCost;

    // Calculate total
    const total = Object.values(breakdown).reduce((sum, amount) => sum + amount, 0);

    // Calculate daily breakdown
    const dailyBreakdown = {};
    activities.forEach(activity => {
      const date = activity.date.toISOString().split('T')[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          activities: 0,
          accommodation: 0,
          transportation: 0,
          food: 0,
          other: 0,
          total: 0
        };
      }
      dailyBreakdown[date].activities += activity.cost.amount || 0;
      dailyBreakdown[date].total += activity.cost.amount || 0;
    });

    // Add accommodation and other costs to daily breakdown
    const tripDays = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
    const dailyAccommodation = breakdown.accommodation / tripDays;
    const dailyFood = breakdown.food / tripDays;
    const dailyTransportation = breakdown.transportation / tripDays;
    const dailyOther = breakdown.other / tripDays;

    Object.keys(dailyBreakdown).forEach(date => {
      dailyBreakdown[date].accommodation = dailyAccommodation;
      dailyBreakdown[date].food = dailyFood;
      dailyBreakdown[date].transportation = dailyTransportation;
      dailyBreakdown[date].other = dailyOther;
      dailyBreakdown[date].total += dailyAccommodation + dailyFood + dailyTransportation + dailyOther;
    });

    res.status(200).json({
      success: true,
      data: {
        tripId: trip._id,
        tripName: trip.name,
        currency: trip.budget.currency,
        total,
        breakdown,
        dailyBreakdown,
        activities: activities.length,
        tripDays
      }
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/budget/:tripId
// @desc    Update trip budget
// @access  Private
router.put('/:tripId', [
  body('total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total budget must be a positive number'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('breakdown.accommodation')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Accommodation cost must be a positive number'),
  body('breakdown.transportation')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Transportation cost must be a positive number'),
  body('breakdown.food')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Food cost must be a positive number'),
  body('breakdown.other')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other cost must be a positive number')
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
        message: 'Not authorized to update this trip'
      });
    }

    const { total, currency, breakdown } = req.body;

    // Update budget fields
    if (total !== undefined) trip.budget.total = total;
    if (currency) trip.budget.currency = currency;
    if (breakdown) {
      if (breakdown.accommodation !== undefined) trip.budget.breakdown.accommodation = breakdown.accommodation;
      if (breakdown.transportation !== undefined) trip.budget.breakdown.transportation = breakdown.transportation;
      if (breakdown.food !== undefined) trip.budget.breakdown.food = breakdown.food;
      if (breakdown.other !== undefined) trip.budget.breakdown.other = breakdown.other;
    }

    await trip.save();

    res.status(200).json({
      success: true,
      data: trip.budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/budget/:tripId/forecast
// @desc    Get budget forecast and recommendations
// @access  Private
router.get('/:tripId/forecast', async (req, res) => {
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

    // Get activities
    const activities = await Activity.find({ trip: trip._id });

    // Calculate current spending
    const currentSpending = activities.reduce((total, activity) => {
      return total + (activity.cost.amount || 0);
    }, 0);

    const totalBudget = trip.budget.total || 0;
    const remainingBudget = totalBudget - currentSpending;
    const spendingPercentage = totalBudget > 0 ? (currentSpending / totalBudget) * 100 : 0;

    // Generate recommendations
    const recommendations = [];

    if (spendingPercentage > 80) {
      recommendations.push({
        type: 'warning',
        message: 'You\'ve used over 80% of your budget. Consider reducing expenses.',
        category: 'budget'
      });
    }

    if (spendingPercentage > 100) {
      recommendations.push({
        type: 'danger',
        message: 'You\'ve exceeded your budget. Review your expenses.',
        category: 'budget'
      });
    }

    // Check for expensive activities
    const expensiveActivities = activities.filter(activity => 
      activity.cost.amount > (totalBudget * 0.1) // More than 10% of total budget
    );

    if (expensiveActivities.length > 0) {
      recommendations.push({
        type: 'info',
        message: `You have ${expensiveActivities.length} expensive activities planned.`,
        category: 'activities'
      });
    }

    // Check for days with no activities (potential savings)
    const tripDays = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
    const daysWithActivities = new Set(activities.map(a => a.date.toISOString().split('T')[0])).size;
    const freeDays = tripDays - daysWithActivities;

    if (freeDays > 0) {
      recommendations.push({
        type: 'success',
        message: `You have ${freeDays} free days which could help with budget management.`,
        category: 'planning'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalBudget,
        currentSpending,
        remainingBudget,
        spendingPercentage,
        recommendations,
        tripDays,
        daysWithActivities,
        freeDays,
        expensiveActivitiesCount: expensiveActivities.length
      }
    });
  } catch (error) {
    console.error('Get budget forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/budget/:tripId/export
// @desc    Export budget data
// @access  Private
router.get('/:tripId/export', async (req, res) => {
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

    // Get activities
    const activities = await Activity.find({ trip: trip._id })
      .sort({ date: 1, startTime: 1 });

    // Prepare export data
    const exportData = {
      trip: {
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        currency: trip.budget.currency
      },
      budget: trip.budget,
      activities: activities.map(activity => ({
        title: activity.title,
        date: activity.date,
        location: activity.location.name,
        cost: activity.cost,
        type: activity.type
      })),
      summary: {
        totalActivities: activities.length,
        totalCost: activities.reduce((sum, a) => sum + (a.cost.amount || 0), 0),
        averageCostPerActivity: activities.length > 0 ? 
          activities.reduce((sum, a) => sum + (a.cost.amount || 0), 0) / activities.length : 0
      }
    };

    res.status(200).json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Export budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 