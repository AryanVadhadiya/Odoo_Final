const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const City = require('../models/City');

// Admin authentication endpoint (now open access)
router.post('/auth', (req, res) => {
  res.json({ message: 'Admin access granted' });
});

// Alternative authentication endpoint for GET requests (now open access)
router.get('/auth', (req, res) => {
  res.json({ message: 'Admin access granted' });
});

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Trip statistics
    const totalTrips = await Trip.countDocuments();
    const ongoingTrips = await Trip.countDocuments({ status: 'active' });
    const upcomingTrips = await Trip.countDocuments({ status: 'planning' });
    const completedTrips = await Trip.countDocuments({ status: 'completed' });

    // Monthly trip comparison
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const tripsThisMonth = await Trip.countDocuments({
      createdAt: { 
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });
    
    const tripsLastMonth = await Trip.countDocuments({
      createdAt: { 
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1)
      }
    });

    const monthOverMonthChange = tripsLastMonth > 0 
      ? ((tripsThisMonth - tripsLastMonth) / tripsLastMonth * 100).toFixed(2)
      : 0;

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth
      },
      trips: {
        total: totalTrips,
        ongoing: ongoingTrips,
        upcoming: upcomingTrips,
        completed: completedTrips,
        thisMonth: tripsThisMonth,
        lastMonth: tripsLastMonth,
        monthOverMonthChange: parseFloat(monthOverMonthChange)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Get most visited cities
router.get('/cities/popular', async (req, res) => {
  try {
    const popularCities = await Trip.aggregate([
      { $unwind: '$destinations' },
      {
        $group: {
          _id: {
            city: '$destinations.city',
            country: '$destinations.country'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json(popularCities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular cities', error: error.message });
  }
});

// Get most visited activities
router.get('/activities/popular', async (req, res) => {
  try {
    const popularActivities = await Activity.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(popularActivities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular activities', error: error.message });
  }
});

// Get most visited places
router.get('/places/popular', async (req, res) => {
  try {
    const popularPlaces = await Activity.aggregate([
      {
        $group: {
          _id: '$location.name',
          count: { $sum: 1 },
          city: { $first: '$destination.city' },
          country: { $first: '$destination.country' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json(popularPlaces);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular places', error: error.message });
  }
});

// Get trip duration by budget analysis
router.get('/trips/duration-by-budget', async (req, res) => {
  try {
    const durationByBudget = await Trip.aggregate([
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$endDate', '$startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $addFields: {
          budgetRange: {
            $switch: {
              branches: [
                { case: { $lte: ['$budget.total', 5000] }, then: 'Up to 5K' },
                { case: { $lte: ['$budget.total', 10000] }, then: '5K - 10K' },
                { case: { $lte: ['$budget.total', 25000] }, then: '10K - 25K' },
                { case: { $lte: ['$budget.total', 50000] }, then: '25K - 50K' }
              ],
              default: '50K+'
            }
          }
        }
      },
      {
        $group: {
          _id: '$budgetRange',
          avgDuration: { $avg: '$duration' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(durationByBudget);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching duration by budget', error: error.message });
  }
});

// Get trip budget by duration analysis
router.get('/trips/budget-by-duration', async (req, res) => {
  try {
    const budgetByDuration = await Trip.aggregate([
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$endDate', '$startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $addFields: {
          durationRange: {
            $switch: {
              branches: [
                { case: { $lt: ['$duration', 3] }, then: '< 3 days' },
                { case: { $lte: ['$duration', 7] }, then: '3-7 days' },
                { case: { $lte: ['$duration', 14] }, then: '7-14 days' },
                { case: { $lte: ['$duration', 30] }, then: '14-30 days' }
              ],
              default: '30+ days'
            }
          }
        }
      },
      {
        $group: {
          _id: '$durationRange',
          avgBudget: { $avg: '$budget.total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(budgetByDuration);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget by duration', error: error.message });
  }
});

// Get cumulative budget distribution
router.get('/trips/budget-distribution', async (req, res) => {
  try {
    const budgetDistribution = await Trip.aggregate([
      {
        $addFields: {
          budgetRange: {
            $switch: {
              branches: [
                { case: { $lte: ['$budget.total', 1000] }, then: '0-1K' },
                { case: { $lte: ['$budget.total', 2500] }, then: '1K-2.5K' },
                { case: { $lte: ['$budget.total', 5000] }, then: '2.5K-5K' },
                { case: { $lte: ['$budget.total', 10000] }, then: '5K-10K' },
                { case: { $lte: ['$budget.total', 25000] }, then: '10K-25K' },
                { case: { $lte: ['$budget.total', 50000] }, then: '25K-50K' }
              ],
              default: '50K+'
            }
          }
        }
      },
      {
        $group: {
          _id: '$budgetRange',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate cumulative distribution
    let cumulative = 0;
    const totalTrips = await Trip.countDocuments();
    
    const cumulativeDistribution = budgetDistribution.map(item => {
      cumulative += item.count;
      return {
        ...item,
        cumulative: cumulative,
        percentage: ((cumulative / totalTrips) * 100).toFixed(2)
      };
    });

    res.json(cumulativeDistribution);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget distribution', error: error.message });
  }
});

// Get monthly trends
router.get('/trends/monthly', async (req, res) => {
  try {
    const monthlyTrends = await Trip.aggregate([
      {
        $addFields: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget.total' },
          avgBudget: { $avg: '$budget.total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json(monthlyTrends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly trends', error: error.message });
  }
});

// Export data as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { type } = req.query;
    
    let data;
    let filename;
    
    switch (type) {
      case 'users':
        data = await User.find({}, '-password -resetPasswordToken -resetPasswordExpire');
        filename = 'users.csv';
        break;
      case 'trips':
        data = await Trip.find().populate('user', 'name email');
        filename = 'trips.csv';
        break;
      case 'activities':
        data = await Activity.find().populate('trip', 'name');
        filename = 'activities.csv';
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    // Convert to CSV format
    const csvData = convertToCSV(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]._doc || data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value || '';
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

module.exports = router;
