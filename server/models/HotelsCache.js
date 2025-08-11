const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
  },
  distanceMeters: Number,
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    formatted: String,
  },
  amenities: [String],
  photos: [{
    url: String,
    caption: String,
    width: Number,
    height: Number,
  }],
  bookingUrl: String,
  source: {
    type: String,
    required: true,
    enum: ['amadeus', 'booking', 'google', 'hotels'],
  },
  externalId: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  _id: false, // Don't create _id for embedded documents
});

const hotelsCacheSchema = new mongoose.Schema({
  queryHash: {
    type: String,
    required: true,
    unique: true,
  },
  searchParams: {
    cityId: String,
    lat: Number,
    lng: Number,
    checkin: Date,
    checkout: Date,
    guests: Number,
    sort: String,
    radius: Number,
  },
  hotels: [hotelSchema],
  totalResults: Number,
  hasMore: {
    type: Boolean,
    default: false,
  },
  provider: {
    type: String,
    required: true,
    enum: ['amadeus', 'booking', 'google', 'hotels'],
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL index
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  metadata: {
    responseTime: Number, // in milliseconds
    cacheHit: Boolean,
    fallbackUsed: Boolean,
  },
});

// Indexes for performance
hotelsCacheSchema.index({ queryHash: 1 });
hotelsCacheSchema.index({ 'searchParams.cityId': 1 });
hotelsCacheSchema.index({ 'searchParams.lat': 1, 'searchParams.lng': 1 });
hotelsCacheSchema.index({ provider: 1 });
hotelsCacheSchema.index({ expiresAt: 1 });

// Pre-save middleware to update lastAccessed and accessCount
hotelsCacheSchema.pre('save', function(next) {
  this.lastAccessed = new Date();
  this.accessCount += 1;
  next();
});

// Static method to generate query hash
hotelsCacheSchema.statics.generateQueryHash = function(searchParams) {
  const sortedParams = Object.keys(searchParams)
    .sort()
    .reduce((result, key) => {
      if (searchParams[key] !== undefined && searchParams[key] !== null) {
        result[key] = searchParams[key];
      }
      return result;
    }, {});

  return require('crypto')
    .createHash('md5')
    .update(JSON.stringify(sortedParams))
    .digest('hex');
};

// Static method to find cached results
hotelsCacheSchema.statics.findCached = function(searchParams) {
  const queryHash = this.generateQueryHash(searchParams);

  return this.findOne({
    queryHash,
    expiresAt: { $gt: new Date() },
  });
};

// Static method to cache results
hotelsCacheSchema.statics.cacheResults = function(searchParams, hotels, provider, ttlHours = 1) {
  const queryHash = this.generateQueryHash(searchParams);
  const expiresAt = new Date(Date.now() + (ttlHours * 60 * 60 * 1000));

  return this.findOneAndUpdate(
    { queryHash },
    {
      searchParams,
      hotels,
      totalResults: hotels.length,
      hasMore: hotels.length >= (searchParams.limit || 20),
      provider,
      expiresAt,
      lastAccessed: new Date(),
      $inc: { accessCount: 1 },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

// Static method to clean expired cache
hotelsCacheSchema.statics.cleanExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

// Static method to get cache statistics
hotelsCacheSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalHotels: { $sum: { $size: '$hotels' } },
        avgAccessCount: { $avg: '$accessCount' },
        oldestEntry: { $min: '$createdAt' },
        newestEntry: { $max: '$createdAt' },
      },
    },
  ]);
};

module.exports = mongoose.model('HotelsCache', hotelsCacheSchema);
