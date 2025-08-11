const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  destination: {
    city: String,
    country: String
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    maxlength: [1000, 'Review content cannot exceed 1000 characters']
  },
  categories: [{
    type: String,
    enum: ['accommodation', 'food', 'activities', 'transportation', 'value', 'overall'],
    required: true
  }],
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  language: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true
});

// Ensure one review per user per trip
reviewSchema.index({ user: 1, trip: 1 }, { unique: true });

// Indexes for better performance
reviewSchema.index({ trip: 1, createdAt: -1 });
reviewSchema.index({ destination: 1, rating: -1 });
reviewSchema.index({ rating: -1, createdAt: -1 });
reviewSchema.index({ isPublic: 1, isVerified: 1 });

// Calculate helpful score
reviewSchema.virtual('helpfulScore').get(function() {
  const helpful = this.helpful.filter(h => h.helpful === true).length;
  const notHelpful = this.helpful.filter(h => h.helpful === false).length;
  return helpful - notHelpful;
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);
