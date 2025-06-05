const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A report must have a reporter']
  },
  contentType: {
    type: String,
    enum: ['discussion', 'comment', 'resource'],
    required: [true, 'Content type must be specified']
  },
  contentId: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'Content ID must be specified']
  },
  reason: {
    type: String,
    enum: [
      'inappropriate',
      'spam',
      'harassment',
      'misinformation',
      'copyright',
      'other'
    ],
    required: [true, 'Report reason must be specified']
  },
  details: {
    type: String,
    maxLength: [500, 'Additional details cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  resolvedAt: Date
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;