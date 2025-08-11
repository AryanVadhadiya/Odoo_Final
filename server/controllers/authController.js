const Joi = require('joi');
const User = require('../models/User');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const {
  generateAccessToken,
  generateRefreshToken,
  generateDeviceFingerprint,
  cleanExpiredTokens,
  revokeRefreshToken,
} = require('../utils/tokens');
const bcrypt = require('bcryptjs');

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  preferences: Joi.object().optional(),
});

exports.signup = async (req, res) => {
  console.log('Signup request payload:', req.body); // Log the incoming payload
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    console.error('Signup validation error:', error.message); // Log validation error
    return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });
  }

  try {
    const { name, email, password } = value;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.error('Signup error: Email already registered'); // Log duplicate email error
      return sendErrorResponse(res, { code: 'EMAIL_EXISTS', message: 'Email already registered', statusCode: 409 });
    }

    const user = await User.create({ name, email, password });
    console.log('User created successfully:', user); // Log successful user creation

    // create tokens and persist refresh token metadata
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());
    const device = generateDeviceFingerprint(req);

    user.refreshTokens = cleanExpiredTokens(user.refreshTokens || []).concat([
      {
        token: refreshToken,
        device,
        ip: req.ip,
        expiresAt: require('jsonwebtoken').decode(refreshToken)?.exp
          ? new Date(require('jsonwebtoken').decode(refreshToken).exp * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ]);
    await user.save();

    return sendSuccessResponse(res, {
      user,
      accessToken,
      refreshToken,
    }, null, 201);
  } catch (err) {
    console.error('Signup error:', err); // Log unexpected errors
    return sendErrorResponse(res, { code: 'SERVER_ERROR', message: 'An unexpected error occurred', statusCode: 500 });
  }
};

exports.login = async (req, res) => {
  console.log('Login request payload:', req.body); // Log the incoming payload
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    console.error('Login validation error:', error.message); // Log validation error
    return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });
  }

  try {
    const { email, password } = value;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.error('Login error: User not found'); // Log user not found error
      return sendErrorResponse(res, { code: 'USER_NOT_FOUND', message: 'Invalid email or password', statusCode: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Login error: Invalid password'); // Log invalid password error
      return sendErrorResponse(res, { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 });
    }

    console.log('User logged in successfully:', user); // Log successful login

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());
    const device = generateDeviceFingerprint(req);

    user.refreshTokens = cleanExpiredTokens(user.refreshTokens || []).concat([
      {
        token: refreshToken,
        device,
        ip: req.ip,
        expiresAt: require('jsonwebtoken').decode(refreshToken)?.exp
          ? new Date(require('jsonwebtoken').decode(refreshToken).exp * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ]);
    await user.save();

    const safeUser = await User.findById(user._id).select('-password');

    return sendSuccessResponse(res, { user: safeUser, accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err); // Log unexpected errors
    return sendErrorResponse(res, { code: 'SERVER_ERROR', message: 'An unexpected error occurred', statusCode: 500 });
  }
};

exports.refresh = async (req, res) => {
  // `authenticateRefreshToken` middleware sets req.user and req.refreshToken
  const user = req.user;
  const oldToken = req.refreshToken;

  // rotate token
  const newAccess = generateAccessToken(user._id.toString(), user.role);
  const newRefresh = generateRefreshToken(user._id.toString());

  // revoke old and add new
  user.refreshTokens = revokeRefreshToken(cleanExpiredTokens(user.refreshTokens || []), oldToken).concat([
    {
      token: newRefresh,
      device: generateDeviceFingerprint(req),
      ip: req.ip,
      expiresAt: require('jsonwebtoken').decode(newRefresh)?.exp
        ? new Date(require('jsonwebtoken').decode(newRefresh).exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ]);
  await user.save();

  return sendSuccessResponse(res, { accessToken: newAccess, refreshToken: newRefresh });
};

exports.logout = async (req, res) => {
  const user = req.user;
  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    return sendErrorResponse(res, { code: 'REFRESH_TOKEN_REQUIRED', message: 'Refresh token required', statusCode: 400 });
  }

  user.refreshTokens = revokeRefreshToken(user.refreshTokens || [], refreshToken);
  await user.save();

  return sendSuccessResponse(res, { message: 'Logged out' });
};

exports.me = async (req, res) => {
  return sendSuccessResponse(res, req.user);
};

exports.updateProfile = async (req, res) => {
  const { error, value } = profileUpdateSchema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });

  const updates = {};
  if (value.name !== undefined) updates.name = value.name;
  if (value.preferences !== undefined) updates.preferences = { ...(req.user.preferences || {}), ...value.preferences };

  const updated = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  return sendSuccessResponse(res, updated);
};

exports.forgotPassword = async (req, res) => {
  const schema = Joi.object({ email: Joi.string().email().required() });
  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });
  // Placeholder: In real implementation send email with token
  return sendSuccessResponse(res, { message: 'If this email exists, a reset link has been sent.' });
};

exports.resetPassword = async (req, res) => {
  const schema = Joi.object({ token: Joi.string().required(), password: Joi.string().min(6).required() });
  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });
  // Placeholder: In real implementation verify token and update password
  return sendSuccessResponse(res, { message: 'Password has been reset' });
};


