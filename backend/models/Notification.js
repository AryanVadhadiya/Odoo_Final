const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'trip_invite',
      'trip_update',
      'connection_request',
      'connection_accepted',
      'review_received',
      'trip_reminder',
      'budget_alert',
      'system_message'
    ],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  data: {
    tripId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    reviewId: mongoose.Schema.Types.ObjectId,
    connectionId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    date: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: Date,
  actionUrl: String,
  actionText: String
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

// Auto-archive expired notifications
notificationSchema.pre('save', function(next) {
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isArchived = true;
  }
  next();
});

// Mark as read method
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Mark as archived method
notificationSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
