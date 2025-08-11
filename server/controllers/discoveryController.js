const Joi = require('joi');
const GeminiService = require('../services/geminiService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');

exports.cityOverview = async (req, res) => {
  const schema = Joi.object({
    cityData: Joi.object({
      name: Joi.string().required(),
      country: Joi.string().required(),
      description: Joi.string().optional(),
      coordinates: Joi.object({ lat: Joi.number(), lng: Joi.number() }).optional(),
    }).required(),
    travelContext: Joi.object({
      season: Joi.string().optional(),
      budget: Joi.string().optional(),
      duration: Joi.string().optional(),
      interests: Joi.array().items(Joi.string()).optional(),
    }).optional(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const result = await GeminiService.generateCityOverview(value.cityData, value.travelContext || {});
  return sendSuccessResponse(res, result);
};

exports.citySuggestions = async (req, res) => {
  const schema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    mode: Joi.string().valid('deterministic', 'creative').default('deterministic'),
    season: Joi.string().optional(),
    budget: Joi.string().optional(),
    interests: Joi.string().optional(),
  });
  const { error, value } = schema.validate(req.query);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const cityData = { name: req.params.cityId, country: '' };
  const travelContext = {
    season: value.season,
    budget: value.budget,
    interests: value.interests ? value.interests.split(',').map(s => s.trim()) : [],
  };
  const result = await GeminiService.generatePaginatedSuggestions(cityData, travelContext, value);
  return sendSuccessResponse(res, { suggestions: result.suggestions, generatedAt: result.generatedAt }, result.meta);
};

exports.placesPool = async (req, res) => {
  // For now proxy city suggestions without LLM call parameters from query
  const { cityId = req.query.cityId || 'Unknown City', type, page = 1, limit = 20, sort } = req.query;
  const travelContext = { interests: type ? [type] : [] };
  const result = await GeminiService.generatePaginatedSuggestions({ name: cityId, country: '' }, travelContext, { page, limit, mode: 'deterministic' });
  return sendSuccessResponse(res, result.suggestions, result.meta);
};

exports.recommendations = async (req, res) => {
  const schema = Joi.object({
    userProfile: Joi.object({
      interests: Joi.array().items(Joi.string()).default([]),
      travelStyle: Joi.string().allow('', null),
      budget: Joi.string().allow('', null),
      previousTrips: Joi.array().items(Joi.string()).default([]),
    }).required(),
    tripContext: Joi.object({
      destination: Joi.string().allow('', null),
      duration: Joi.string().allow('', null),
      season: Joi.string().allow('', null),
    }).required(),
    maxRecommendations: Joi.number().min(1).max(50).default(20),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const result = await GeminiService.generateTravelRecommendations(value.userProfile, value.tripContext, value.maxRecommendations);
  return sendSuccessResponse(res, result);
};


