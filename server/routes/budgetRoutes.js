const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const budgetController = require('../controllers/budgetController');

// Trip-level budget
router.get('/trip/:tripId', authenticateToken, asyncHandler(budgetController.getTripBudget));
router.put('/trip/:tripId', authenticateToken, asyncHandler(budgetController.updateTripBudget));
router.get('/trip/:tripId/breakdown', authenticateToken, asyncHandler(budgetController.getBudgetBreakdown));

// Expenses
router.post('/trip/:tripId/expenses', authenticateToken, asyncHandler(budgetController.addExpense));
router.put('/trip/:tripId/expenses/:expenseId', authenticateToken, asyncHandler(budgetController.updateExpense));
router.delete('/trip/:tripId/expenses/:expenseId', authenticateToken, asyncHandler(budgetController.deleteExpense));

module.exports = router;


