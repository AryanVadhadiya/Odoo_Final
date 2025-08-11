const Joi = require('joi');
const User = require('../models/User');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');

const preferencesSchema = Joi.object({
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD').optional(),
  language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt').optional(),
  timezone: Joi.string().optional(),
  notifications: Joi.object({
    email: Joi.boolean(),
    push: Joi.boolean(),
    marketing: Joi.boolean(),
  }).optional(),
}).min(1);

exports.getMe = async (req, res) => {
  return sendSuccessResponse(res, req.user);
};

exports.updateMe = async (req, res) => {
  const { error, value } = Joi.object({ name: Joi.string().min(2).max(50).optional(), preferences: preferencesSchema.optional() }).validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const updates = {};
  if (value.name !== undefined) updates.name = value.name;
  if (value.preferences !== undefined) updates.preferences = { ...(req.user.preferences || {}), ...value.preferences };

  const updated = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  return sendSuccessResponse(res, updated);
};


