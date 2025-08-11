exports.login = async (req, res) => {
  console.log('Login request payload:', req.body); // Log the incoming payload
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    console.error('Login validation error:', error.message); // Log validation error
    return sendErrorResponse(res, { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400 });
  }

  try {
    const { email, password } = value;
    console.log('Finding user by email:', email); // Log email lookup
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.error('Login error: User not found'); // Log user not found error
      return sendErrorResponse(res, { code: 'USER_NOT_FOUND', message: 'Invalid email or password', statusCode: 401 });
    }

    console.log('Comparing passwords'); // Log password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Login error: Invalid password'); // Log invalid password error
      return sendErrorResponse(res, { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 });
    }

    console.log('Generating tokens'); // Log token generation
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());
    const device = generateDeviceFingerprint(req);

    console.log('Saving refresh tokens'); // Log token saving
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

    console.log('Fetching safe user data'); // Log safe user fetch
    const safeUser = await User.findById(user._id).select('-password');

    return sendSuccessResponse(res, { user: safeUser, accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err); // Log unexpected errors
    return sendErrorResponse(res, { code: 'SERVER_ERROR', message: 'An unexpected error occurred', statusCode: 500 });
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const { confirmPassword, ...payload } = formData;

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const result = await signup(payload);

    if (result.success) {
      // Store tokens
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);

      // Update authentication state
      setAuthState({ user: result.data.user, isAuthenticated: true });

      showSuccess('Account created successfully! Welcome to GlobeTrotter!');
      navigate('/dashboard'); // Redirect to dashboard
    } else {
      showError(result.error || 'Signup failed');
    }
  } catch (error) {
    showError('An unexpected error occurred');
  } finally {
    setIsLoading(false);
  }
};

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't include password in queries by default
  },
  avatar: {
    url: {
      type: String,
      default: null,
    },
    publicId: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ['cloudinary', 'default'],
      default: 'default',
    },
    width: Number,
    height: Number,
    format: String,
    version: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  preferences: {
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'it', 'pt'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },
  },
  savedDestinations: [{
    destinationId: String,
    name: String,
    countryCode: String,
    countryName: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    createdAt: { type: Date, default: Date.now },
  }],
  notifications: [{
    title: String,
    message: String,
    type: { type: String, enum: ['info', 'warning', 'success', 'alert'], default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  refreshTokens: [{
    token: String,
    device: String,
    ip: String,
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for avatar URL with fallback
userSchema.virtual('avatarUrl').get(function() {
  if (this.avatar && this.avatar.url) {
    return this.avatar.url;
  }
  // Return a default avatar based on user's name
  const initials = this.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0f172a&color=fff&size=200`;
});

// Indexes for performance
userSchema.index({ 'refreshTokens.token': 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to clean up old refresh tokens
userSchema.pre('save', function(next) {
  if (this.refreshTokens && this.refreshTokens.length > 0) {
    // Remove expired refresh tokens
    this.refreshTokens = this.refreshTokens.filter(
      token => token.expiresAt > new Date()
    );
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by refresh token
userSchema.statics.findByRefreshToken = function(token) {
  return this.findOne({
    'refreshTokens.token': token,
    'refreshTokens.expiresAt': { $gt: new Date() },
  });
};

module.exports = mongoose.model('User', userSchema);
