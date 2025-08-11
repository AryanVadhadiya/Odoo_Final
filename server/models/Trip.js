const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  cityId: {
    type: String,
    required: true,
  },
  cityName: {
    type: String,
    required: true,
  },
  countryCode: String,
  countryName: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  arrivalDate: {
    type: Date,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  accommodation: {
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    price: {
      amount: Number,
      currency: String,
    },
    bookingUrl: String,
    confirmationNumber: String,
  },
  activities: [{
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      enum: ['attraction', 'restaurant', 'shopping', 'entertainment', 'outdoor', 'cultural', 'other'],
    },
    location: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    startTime: String,
    endTime: String,
    duration: Number, // in minutes
    cost: {
      amount: Number,
      currency: String,
    },
    bookingRequired: {
      type: Boolean,
      default: false,
    },
    bookingUrl: String,
    confirmationNumber: String,
    notes: String,
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    photos: [{
      url: String,
      caption: String,
      source: String,
    }],
    isLLM: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['google', 'yelp', 'foursquare', 'llm', 'manual'],
    },
    externalId: String,
  }],
  transportation: {
    type: {
      type: String,
      enum: ['flight', 'train', 'bus', 'car', 'ferry', 'walking', 'other'],
    },
    provider: String,
    departureTime: Date,
    arrivalTime: Date,
    duration: Number, // in minutes
    cost: {
      amount: Number,
      currency: String,
    },
    bookingUrl: String,
    confirmationNumber: String,
    notes: String,
  },
  notes: String,
  photos: [{
    url: String,
    caption: String,
    source: String,
  }],
}, {
  timestamps: true,
});

const budgetItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['accommodation', 'transportation', 'food', 'activities', 'shopping', 'other'],
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  date: Date,
  stopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
  },
  isPlanned: {
    type: Boolean,
    default: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  receiptUrl: String,
  notes: String,
}, {
  timestamps: true,
});

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Trip name is required'],
    trim: true,
    maxlength: [100, 'Trip name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  coverImage: {
    url: String,
    publicId: String,
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
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning',
  },
  type: {
    type: String,
    enum: ['leisure', 'business', 'family', 'solo', 'group', 'other'],
    default: 'leisure',
  },
  budget: {
    planned: {
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    actual: {
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    breakdown: [budgetItemSchema],
  },
  stops: [stopSchema],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareToken: {
    token: String,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  preferences: {
    budgetRange: {
      min: Number,
      max: Number,
      currency: String,
    },
    travelStyle: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'backpacker'],
      default: 'mid-range',
    },
    pace: {
      type: String,
      enum: ['relaxed', 'moderate', 'fast-paced'],
      default: 'moderate',
    },
    interests: [String],
    dietaryRestrictions: [String],
    accessibility: [String],
  },
  statistics: {
    totalDistance: Number, // in kilometers
    totalDuration: Number, // in days
    totalCost: {
      amount: Number,
      currency: String,
    },
    countriesVisited: [String],
    citiesVisited: [String],
    activitiesCompleted: Number,
    photosTaken: Number,
  },
  notes: String,
  reminders: [{
    title: String,
    description: String,
    dueDate: Date,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  }],
  weather: {
    forecast: [{
      date: Date,
      temperature: {
        min: Number,
        max: Number,
        unit: String,
      },
      condition: String,
      icon: String,
    }],
    lastUpdated: Date,
  },
  currency: {
    base: {
      type: String,
      default: 'USD',
    },
    rates: {
      type: Map,
      of: Number,
    },
    lastUpdated: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for trip duration
tripSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for trip progress
tripSchema.virtual('progress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'cancelled') return 0;

  const now = new Date();
  if (now < this.startDate) return 0;
  if (now > this.endDate) return 100;

  const totalDuration = this.endDate - this.startDate;
  const elapsed = now - this.startDate;
  return Math.round((elapsed / totalDuration) * 100);
});

// Virtual for budget status
tripSchema.virtual('budgetStatus').get(function() {
  if (!this.budget.planned.amount || !this.budget.actual.amount) {
    return 'not-tracked';
  }

  const percentage = (this.budget.actual.amount / this.budget.planned.amount) * 100;

  if (percentage <= 90) return 'under-budget';
  if (percentage <= 110) return 'on-budget';
  return 'over-budget';
});

// Indexes for performance
tripSchema.index({ userId: 1, status: 1 });
tripSchema.index({ startDate: 1, endDate: 1 });
tripSchema.index({ 'shareToken.token': 1 });
tripSchema.index({ 'stops.cityId': 1 });
tripSchema.index({ tags: 1 });
tripSchema.index({ createdAt: -1 });

// Pre-save middleware to update statistics
tripSchema.pre('save', function(next) {
  if (this.stops && this.stops.length > 0) {
    // Update statistics
    this.statistics.citiesVisited = [...new Set(this.stops.map(stop => stop.cityName))];
    this.statistics.countriesVisited = [...new Set(this.stops.map(stop => stop.countryCode))];
    this.statistics.activitiesCompleted = this.stops.reduce((total, stop) =>
      total + (stop.activities ? stop.activities.length : 0), 0
    );
  }

  // Update total cost
  if (this.budget && this.budget.breakdown) {
    this.budget.actual.amount = this.budget.breakdown.reduce((total, item) =>
      total + (item.amount || 0), 0
    );
  }

  next();
});

// Instance method to add collaborator
tripSchema.methods.addCollaborator = function(userId, role = 'viewer') {
  const existingIndex = this.collaborators.findIndex(
    collab => collab.userId.toString() === userId.toString()
  );

  if (existingIndex >= 0) {
    this.collaborators[existingIndex].role = role;
  } else {
    this.collaborators.push({ userId, role });
  }

  return this.save();
};

// Instance method to remove collaborator
tripSchema.methods.removeCollaborator = function(userId) {
  this.collaborators = this.collaborators.filter(
    collab => collab.userId.toString() !== userId.toString()
  );
  return this.save();
};

// Instance method to check if user has access
tripSchema.methods.hasAccess = function(userId, requiredRole = 'viewer') {
  const roleHierarchy = { viewer: 1, editor: 2, admin: 3 };
  const requiredLevel = roleHierarchy[requiredRole];

  const collaborator = this.collaborators.find(
    collab => collab.userId.toString() === userId.toString()
  );

  if (collaborator) {
    return roleHierarchy[collaborator.role] >= requiredLevel;
  }

  return false;
};

// Static method to find trips by user
tripSchema.statics.findByUser = function(userId, options = {}) {
  const query = {
    $or: [
      { userId: userId },
      { 'collaborators.userId': userId }
    ]
  };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .populate('userId', 'name email avatar')
    .populate('collaborators.userId', 'name email avatar')
    .sort({ startDate: 1 });
};

// Static method to find public trips
tripSchema.statics.findPublic = function(options = {}) {
  const query = { isPublic: true };

  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }

  if (options.type) {
    query.type = options.type;
  }

  return this.find(query)
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Trip', tripSchema);
