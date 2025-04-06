const mongoose = require('mongoose');
const crypto = require('crypto');

const courseLinkSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'A course link must belong to a course']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A course link must have a creator']
  },
  token: {
    type: String,
    unique: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration is 7 days from creation
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },
  maxUses: {
    type: Number,
    default: null // null means unlimited uses
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate a unique token for the course link during validation
courseLinkSchema.pre('validate', function(next) {
  if (!this.token) {
    // Generate a random token
    this.token = crypto.randomBytes(16).toString('hex');
  }
  next();
});

// Virtual for checking if the link is expired
courseLinkSchema.virtual('isExpired').get(function() {
  return Date.now() > this.expiresAt;
});

// Virtual for checking if the link has reached max uses
courseLinkSchema.virtual('hasReachedMaxUses').get(function() {
  if (!this.maxUses) return false; // No limit
  return this.usedCount >= this.maxUses;
});

// Virtual for checking if the link is valid (active, not expired, not maxed out)
courseLinkSchema.virtual('isValid').get(function() {
  return this.isActive && !this.isExpired && !this.hasReachedMaxUses;
});

const CourseLink = mongoose.model('CourseLink', courseLinkSchema);

module.exports = CourseLink;