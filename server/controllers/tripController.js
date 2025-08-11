const Joi = require('joi');
const Trip = require('../models/Trip');
const { generateShareToken } = require('../utils/tokens');
const { sendSuccessResponse, sendCreatedResponse, sendNoContentResponse, sendNotFoundResponse, sendErrorResponse } = require('../utils/response');

const createTripSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow('', null),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  type: Joi.string().valid('leisure', 'business', 'family', 'solo', 'group', 'other').optional(),
  isPublic: Joi.boolean().optional(),
});

exports.getTrips = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {
    $or: [
      { userId: req.user._id },
      { 'collaborators.userId': req.user._id },
    ],
  };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [items, total] = await Promise.all([
    Trip.find(query).sort({ startDate: 1 }).skip(skip).limit(parseInt(limit)),
    Trip.countDocuments(query),
  ]);

  return sendSuccessResponse(res, items, { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) });
};

exports.createTrip = async (req, res) => {
  const { error, value } = createTripSchema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const trip = await Trip.create({ ...value, userId: req.user._id });
  return sendCreatedResponse(res, trip);
};

exports.getTripById = async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.id);
  // Access control: owner or collaborator or admin handled in middleware where used
  return sendSuccessResponse(res, trip);
};

exports.updateTrip = async (req, res) => {
  const updates = req.body || {};
  const trip = await Trip.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.id);
  return sendSuccessResponse(res, trip);
};

exports.deleteTrip = async (req, res) => {
  const trip = await Trip.findByIdAndDelete(req.params.id);
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.id);
  return sendNoContentResponse(res);
};

// Itinerary: for simplicity, use `stops` field
exports.getItinerary = async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.id);
  return sendSuccessResponse(res, trip.stops || []);
};

exports.updateItinerary = async (req, res) => {
  const schema = Joi.object({
    stops: Joi.array().items(Joi.object({
      cityId: Joi.string().required(),
      cityName: Joi.string().required(),
      countryCode: Joi.string().optional(),
      countryName: Joi.string().optional(),
      coordinates: Joi.object({ lat: Joi.number(), lng: Joi.number() }).optional(),
      arrivalDate: Joi.date().required(),
      departureDate: Joi.date().required(),
      activities: Joi.array().optional(),
    })).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const trip = await Trip.findByIdAndUpdate(req.params.id, { $set: { stops: value.stops } }, { new: true });
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.id);
  return sendSuccessResponse(res, trip.stops || []);
};

exports.shareTrip = async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return sendNotFoundResponse(res, 'Trip', req.params.id);

  const { expiresInHours = 168 } = req.body || {};
  const { token, expires } = generateShareToken(trip._id.toString(), expiresInHours);
  trip.shareToken = { token, expiresAt: expires, isActive: true };
  trip.isPublic = true;
  await trip.save();
  const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
  const shareLink = `${baseUrl}/shared/${token}`;
  return sendSuccessResponse(res, { shareLink, token, expiresAt: expires });
};

exports.getPublicTrip = async (req, res) => {
  const { shareId } = req.params;
  const trip = await Trip.findOne({ 'shareToken.token': shareId, 'shareToken.isActive': true });
  if (!trip) return sendNotFoundResponse(res, 'SharedTrip', shareId);
  if (trip.shareToken.expiresAt && new Date(trip.shareToken.expiresAt) < new Date()) {
    return sendNotFoundResponse(res, 'SharedTrip', shareId);
  }
  return sendSuccessResponse(res, trip);
};


