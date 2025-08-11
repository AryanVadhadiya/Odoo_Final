const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Ensure unique connections
connectionSchema.index({ follower: 1, following: 1 }, { unique: true });

// Indexes for better performance
connectionSchema.index({ follower: 1, status: 1 });
connectionSchema.index({ following: 1, status: 1 });
connectionSchema.index({ status: 1, createdAt: -1 });

// Prevent self-following
connectionSchema.pre('save', function(next) {
  if (this.follower.toString() === this.following.toString()) {
    return next(new Error('Users cannot follow themselves'));
  }
  next();
});

module.exports = mongoose.model('Connection', connectionSchema);
