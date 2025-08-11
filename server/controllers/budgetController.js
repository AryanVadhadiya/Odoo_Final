const Joi = require('joi');
const Trip = require('../models/Trip');
const { sendSuccessResponse, sendNotFoundResponse, sendErrorResponse } = require('../utils/response');

exports.getTripBudget = async (req, res) => {
  const trip = await Trip.findById(req.params.tripId);
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.tripId);
  return sendSuccessResponse(res, trip.budget || {});
};

exports.updateTripBudget = async (req, res) => {
  const schema = Joi.object({
    planned: Joi.object({ amount: Joi.number().min(0), currency: Joi.string() }).optional(),
    actual: Joi.object({ amount: Joi.number().min(0), currency: Joi.string() }).optional(),
  }).min(1);
  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const trip = await Trip.findByIdAndUpdate(
    req.params.tripId,
    { $set: Object.fromEntries(Object.entries(value).map(([k, v]) => [`budget.${k}`, v])) },
    { new: true }
  );
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.tripId);
  return sendSuccessResponse(res, trip.budget || {});
};

exports.getBudgetBreakdown = async (req, res) => {
  const trip = await Trip.findById(req.params.tripId);
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.tripId);
  return sendSuccessResponse(res, trip.budget?.breakdown || []);
};

exports.addExpense = async (req, res) => {
  const schema = Joi.object({
    category: Joi.string().required(),
    description: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().default('USD'),
    date: Joi.date().optional(),
    notes: Joi.string().allow('', null),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const trip = await Trip.findById(req.params.tripId);
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.tripId);
  trip.budget = trip.budget || {};
  trip.budget.breakdown = trip.budget.breakdown || [];
  trip.budget.breakdown.push(value);
  await trip.save();
  const newItem = trip.budget.breakdown[trip.budget.breakdown.length - 1];
  return sendSuccessResponse(res, newItem, null, 201);
};

exports.updateExpense = async (req, res) => {
  const schema = Joi.object({
    category: Joi.string().optional(),
    description: Joi.string().optional(),
    amount: Joi.number().min(0).optional(),
    currency: Joi.string().optional(),
    date: Joi.date().optional(),
    notes: Joi.string().allow('', null),
  }).min(1);
  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const trip = await Trip.findById(req.params.tripId);
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.tripId);
  const item = trip.budget?.breakdown?.id(req.params.expenseId);
  if (!item) return sendNotFoundResponse(res, 'Expense', req.params.expenseId);
  Object.assign(item, value);
  await trip.save();
  return sendSuccessResponse(res, item);
};

exports.deleteExpense = async (req, res) => {
  const trip = await Trip.findById(req.params.tripId);
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.tripId);
  const item = trip.budget?.breakdown?.id(req.params.expenseId);
  if (!item) return sendNotFoundResponse(res, 'Expense', req.params.expenseId);
  item.deleteOne();
  await trip.save();
  return res.status(204).send();
};


